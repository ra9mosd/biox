import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

const OWNER_ID = 123456789; // ЗАМЕНИ НА СВОЙ РЕАЛЬНЫЙ TELEGRAM ID

const allBadges = ["VERIFIED", "VIP", "SPONSOR", "FOUNDER", "PRO", "CREATOR", "DEVELOPER", "OG", "EARLY", "STAFF"];

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkAccess = async () => {
      const tg = window.Telegram?.WebApp?.initDataUnsafe?.user;
      // Если открыли не из Telegram или ID не совпадает с OWNER_ID
      if (!tg || Number(tg.id) !== Number(OWNER_ID)) {
        setMessage("❌ Доступ запрещён. Только владелец.");
        setLoading(false);
        return;
      }
      setCurrentUser(tg);
      await loadUsers();
    };
    checkAccess();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, first_name, role, vip_expires')
        .order('id', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      setMessage("❌ Ошибка загрузки пользователей");
    } finally {
      setLoading(false);
    }
  };

  const toggleBadge = async (userId, badge) => {
    try {
      const { data: existing } = await supabase
        .from('badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge', badge)
        .maybeSingle();

      if (existing) {
        await supabase.from('badges').delete().eq('id', existing.id);
        setMessage(`✅ Бейдж ${badge} удалён`);
      } else {
        await supabase.from('badges').insert({ user_id: userId, badge });
        setMessage(`✅ Бейдж ${badge} выдан`);
      }
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      console.error(error);
      setMessage("❌ Ошибка: " + error.message);
    }
  };

  const setVip = async (userId, months) => {
    try {
      const expires = new Date();
      expires.setMonth(expires.getMonth() + months);
      
      const { error } = await supabase
        .from('users')
        .update({ role: 'vip', vip_expires: expires.toISOString() })
        .eq('id', userId);
      
      if (error) throw error;
      setMessage(`✅ VIP выдан на ${months} мес.`);
      await loadUsers();
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      console.error(error);
      setMessage("❌ Ошибка: " + error.message);
    }
  };

  const removeVip = async (userId) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: 'free', vip_expires: null })
        .eq('id', userId);
      
      if (error) throw error;
      setMessage("✅ VIP удалён");
      await loadUsers();
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      console.error(error);
      setMessage("❌ Ошибка: " + error.message);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#fff", background: "#050505", fontFamily: "Inter" }}>
        <div>⚡ BIO<span style={{ color: "#8b5cf6" }}>X</span> Admin — Загрузка...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#fff", background: "#050505", fontFamily: "Inter", flexDirection: "column", gap: "20px" }}>
        <h1>❌ {message}</h1>
        <a href="/" style={{ color: "#8b5cf6" }}>← На главную</a>
      </div>
    );
  }

  return (
    <div className="app" style={{ padding: "20px", minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "Inter" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", borderBottom: "1px solid #222", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "24px" }}>🛡️ BIO<span style={{ color: "#8b5cf6" }}>X</span> ADMIN</h1>
        <a href="/" style={{ padding: "10px 20px", background: "#222", color: "#fff", textDecoration: "none", borderRadius: "8px", fontSize: "14px" }}>← К сайту</a>
      </header>

      {message && (
        <div style={{
          position: "fixed", top: "20px", right: "20px",
          padding: "15px 25px", background: message.includes("❌") ? "#dc2626" : "#16a34a",
          color: "#fff", borderRadius: "8px", fontSize: "14px", fontWeight: "600",
          zIndex: 1000, boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
        }}>
          {message}
        </div>
      )}

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "30px", padding: "20px", background: "#111", borderRadius: "12px" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>👤 Всего пользователей: {users.length}</h2>
          <p style={{ color: "#888", fontSize: "14px" }}>Нажми на бейдж чтобы выдать/забрать. VIP — кнопками справа.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {users.map(user => (
            <div key={user.id} style={{
              padding: "20px", background: "#111", borderRadius: "12px",
              border: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center",
              flexWrap: "wrap", gap: "15px"
            }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ fontSize: "18px", fontWeight: "700" }}>{user.first_name || "User"}</div>
                <div style={{ color: "#8b5cf6", fontSize: "14px", marginTop: "4px" }}>@{user.username || "no_username"}</div>
                <div style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>ID: {user.id}</div>
                <div style={{ marginTop: "8px" }}>
                  <span style={{
                    padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700",
                    background: user.role === 'vip' ? "#8b5cf6" : "#333",
                    color: user.role === 'vip' ? "#fff" : "#888"
                  }}>
                    {user.role?.toUpperCase() || "FREE"}
                  </span>
                  {user.vip_expires && (
                    <span style={{ color: "#888", fontSize: "12px", marginLeft: "10px" }}>
                      до {new Date(user.vip_expires).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {allBadges.map(badge => (
                  <button
                    key={badge}
                    onClick={() => toggleBadge(user.id, badge)}
                    style={{
                      padding: "6px 12px", background: "#222", color: "#fff",
                      border: "1px solid #333", borderRadius: "6px", fontSize: "11px",
                      fontWeight: "700", cursor: "pointer", letterSpacing: "0.5px"
                    }}
                    title={`Выдать/забрать ${badge}`}
                  >
                    {badge}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setVip(user.id, 1)} style={{ padding: "8px 14px", background: "#8b5cf6", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>VIP 1М</button>
                <button onClick={() => setVip(user.id, 3)} style={{ padding: "8px 14px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>VIP 3М</button>
                <button onClick={() => setVip(user.id, 12)} style={{ padding: "8px 14px", background: "#6d28d9", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>VIP 1Г</button>
                <button onClick={() => removeVip(user.id)} style={{ padding: "8px 14px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}