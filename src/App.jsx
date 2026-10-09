import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import { uploadImage, saveProfile, ensureUser, loadMyProfile } from "./lib/api";
import "./App.css";

// ===== ТВОЙ TELEGRAM ID (узнай у @userinfobot в Telegram) =====
const OWNER_ID = 8787840086; // ← ЗАМЕНИ НА СВОЙ!

const defaultProfile = {
  name: "pasha floodwait",
  username: "@pashafloodwait",
  bio: "чисто хасл нахуй",
  avatar: "",
  banner: "",
  background: "",
  accent: "#8b5cf6",
  effect: "aurora",
  music: "",
  musicTitle: "BIOX MUSIC",
  links: [{ name: "Telegram", url: "https://t.me/" }],
  badges: ["DEVELOPER", "VERIFIED", "FOUNDER", "CREATOR", "PRO", "EARLY", "OG", "VIP", "SPONSOR"],
};

const badgeOptions = [
  "VERIFIED", "VIP", "SPONSOR", "FOUNDER", "PRO",
  "CREATOR", "DEVELOPER", "OG", "EARLY", "STAFF",
];

const badgeInfo = {
  VERIFIED: { label: "Verified", className: "verified" },
  VIP: { label: "VIP", className: "vip" },
  SPONSOR: { label: "Sponsor", className: "sponsor" },
  FOUNDER: { label: "Founder", className: "founder" },
  PRO: { label: "Pro", className: "pro" },
  CREATOR: { label: "Creator", className: "creator" },
  DEVELOPER: { label: "Developer", className: "developer" },
  OG: { label: "OG", className: "og" },
  EARLY: { label: "Early", className: "early" },
  STAFF: { label: "Staff", className: "staff" },
};

function normalizeUrl(url) {
  if (!url) return "#";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

// ===== ИКОНКИ БЕЙДЖЕЙ =====
function BadgeIcon({ type }) {
  const common = {
    width: 16, height: 16, viewBox: "0 0 24 24",
    fill: "none", xmlns: "http://www.w3.org/2000/svg",
  };
  switch (type) {
    case "VERIFIED":
      return (
        <svg {...common}>
          <path d="M12 2.7 14.1 4l2.45-.05 1.2 2.12 2.12 1.2-.05 2.45L21.3 12l-1.48 2.28.05 2.45-2.12 1.2-1.2 2.12-2.45-.05L12 21.3l-2.28-1.48-2.45.05-1.2-2.12-2.12-1.2.05-2.45L2.7 12l1.3-2.28-.05-2 .45 2.12-1.2 1.2-2.12L9.72 4 12 2.7Z" fill="currentColor" />
          <path d="m8.1 12.2 2.45 2.35 5.35-5.2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "VIP":
      return (
        <svg {...common}>
          <path d="m12 2.8 2.55 5.35 5.9.86-4.27 4.16 1 5.87L12 16.28l-5.18 2.76 1-5.87L3.55 9l5.9-.86L12 2.8Z" fill="currentColor" />
        </svg>
      );
    case "SPONSOR":
      return (
        <svg {...common}>
          <path d="m12 2.5 7.4 9.5-7.4 9.5L4.6 12 12 2.5Z" fill="currentColor" />
          <path d="m12 6.8 4.1 5.2-4.1 5.2L7.9 12 12 6.8Z" fill="rgba(255,255,255,.45)" />
        </svg>
      );
    case "FOUNDER":
      return (
        <svg {...common}>
          <path d="m3.2 7.2 4.25 3.05L12 4l4.55 6.25L20.8 7.2l-1.55 11.3H4.75L3.2 7.2Z" fill="currentColor" />
          <path d="M5.2 20h13.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "PRO":
      return (
        <svg {...common}>
          <path d="m13.5 2-8 11h5.2L10 22l8.5-12h-5.15L13.5 2Z" fill="currentColor" />
        </svg>
      );
    case "CREATOR":
      return (
        <svg {...common}>
          <path d="m12 2 1.65 6.35L20 10l-6.35 1.65L12 18l-1.65-6.35L4 10l6.35-1.65L12 2Z" fill="currentColor" />
          <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" fill="currentColor" />
        </svg>
      );
    case "DEVELOPER":
      return (
        <svg {...common}>
          <path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5M13.5 4l-3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "OG":
      return (
        <svg {...common}>
          <path d="M14.2 3.1c.4 3.1-1.3 4.3-2.8 5.6-1.1.95-1.9 1.8-1.9 3.3 0 1.1.6 2.1 1.6 2.7-.15-1.6.7-2.55 1.75-3.5 1.35-1.2 3.15-2.65 3.15-5.4 2.15 1.8 4.05 4.5 4.05 7.6 0 4.25-3.3 7.5-7.95 7.5S4.05 17.7 4.05 13.7c0-3.05 1.8-5.85 4.75-8.15-.25 2.25.3 3.7 1.1 4.7.15-2.15 1.25-3.85 4.3-7.15Z" fill="currentColor" />
        </svg>
      );
    case "EARLY":
      return (
        <svg {...common}>
          <path d="m12 2.8 7.9 9.2-7.9 9.2L4.1 12 12 2.8Z" fill="currentColor" />
          <path d="m12 7.4 3.95 4.6-3.95 4.6L8.05 12 12 7.4Z" fill="rgba(255,255,255,.5)" />
        </svg>
      );
    case "STAFF":
      return (
        <svg {...common}>
          <path d="M12 2.5 20 6v5.7c0 4.9-3.1 8.1-8 9.8-4.9-1.7-8-4.9-8-9.8V6l8-3.5Z" fill="currentColor" />
          <path d="m8.5 12 2.2 2.2 4.8-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default: return null;
  }
}

function Badge({ type }) {
  const info = badgeInfo[type];
  if (!info) return null;
  return (
    <span className={`profile-badge badge-${info.className}`} title={info.label}>
      <BadgeIcon type={type} />
      <span className="badge-tooltip">{info.label}</span>
    </span>
  );
}

function App() {
  const [profile, setProfile] = useState(defaultProfile);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("PROFILE");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });

  // ===== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ =====
  useEffect(() => {
    const init = async () => {
      try {
        // Пытаемся получить данные из Telegram WebApp
        const tg = window.Telegram?.WebApp;
        let tgUser = tg?.initDataUnsafe?.user;

        // Если открыто не в Telegram (локально), создаём тестового юзера
        if (!tgUser) {
          console.log("⚠️ Открыто вне Telegram, используем тестового пользователя");
          tgUser = {
            id: OWNER_ID,
            username: "pashafloodwait",
            first_name: "Pasha",
          };
        }

        console.log(" Telegram user:", tgUser);

        // Регистрируем или получаем юзера из Supabase
        const user = await ensureUser(tgUser);
        console.log("✅ Пользователь в БД:", user);
        setCurrentUser(user);

        // Загружаем его профиль из БД
        const savedProfile = await loadMyProfile(user.id);
        console.log(" Загруженный профиль:", savedProfile);

        if (savedProfile) {
          setProfile({
            name: savedProfile.name || defaultProfile.name,
            username: savedProfile.username || defaultProfile.username,
            bio: savedProfile.bio || defaultProfile.bio,
            avatar: savedProfile.avatar_url || "",
            banner: savedProfile.banner_url || "",
            background: savedProfile.background_url || "",
            accent: savedProfile.accent || defaultProfile.accent,
            effect: savedProfile.effect || defaultProfile.effect,
            music: savedProfile.music_url || "",
            musicTitle: savedProfile.music_title || defaultProfile.musicTitle,
            links: savedProfile.links.length > 0
              ? savedProfile.links.map(l => ({ name: l.name, url: l.url }))
              : defaultProfile.links,
            badges: savedProfile.badges.length > 0
              ? savedProfile.badges
              : defaultProfile.badges,
          });
        }
      } catch (error) {
        console.error("❌ Ошибка инициализации:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ===== ОТСЛЕЖИВАНИЕ МЫШИ ДЛЯ ЭФФЕКТОВ =====
  useEffect(() => {
    const move = (event) => {
      setMouse({
        x: (event.clientX / window.innerWidth) * 100,
        y: (event.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const backgroundStyle = useMemo(() => {
    if (profile.background) return { backgroundImage: `url(${profile.background})` };
    return {};
  }, [profile.background]);

  const update = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  // ===== ЗАГРУЗКА ФАЙЛА В SUPABASE STORAGE =====
  const uploadFile = async (field, file) => {
    if (!file || !currentUser) {
      if (!currentUser) alert("Пользователь не загружен, подожди...");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert("Файл слишком большой. Максимум 15 MB.");
      return;
    }

    // Показываем индикатор загрузки
    const originalValue = profile[field];
    update(field, "loading...");

    try {
      console.log(`📤 Загрузка ${field}...`);
      const publicUrl = await uploadImage(file, currentUser.id, field);
      console.log(`✅ Файл загружен: ${publicUrl}`);
      update(field, publicUrl);
    } catch (error) {
      console.error("❌ Ошибка загрузки файла:", error);
      alert("Ошибка загрузки файла: " + error.message);
      update(field, originalValue); // Откат
    }
  };

  const addLink = () => {
    setProfile((current) => ({
      ...current,
      links: [...current.links, { name: "New link", url: "https://" }],
    }));
  };

  const updateLink = (index, field, value) => {
    setProfile((current) => ({
      ...current,
      links: current.links.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  const removeLink = (index) => {
    setProfile((current) => ({
      ...current,
      links: current.links.filter((_, i) => i !== index),
    }));
  };

  const toggleBadge = (badge) => {
    setProfile((current) => {
      const exists = current.badges.includes(badge);
      return {
        ...current,
        badges: exists
          ? current.badges.filter((item) => item !== badge)
          : [...current.badges, badge],
      };
    });
  };

  // ===== СОХРАНЕНИЕ ПРОФИЛЯ В БД =====
 const handleSave = async () => {
  if (!currentUser) {
    alert("Пользователь не загружен!");
    return;
  }

  setSaving(true);
  try {
    console.log("💾 Сохранение профиля...");
    await saveProfile(currentUser.id, profile);
    console.log("✅ Профиль сохранён!");

    setSaved(true);
    setTimeout(() => setSaved(false), 1800);

    // Показываем ссылку на профиль
    const username = currentUser.username || `user${currentUser.id}`;
    
    // Определяем домен (локально или на Vercel)
    const domain = window.location.hostname === 'localhost' 
      ? 'http://localhost:5173' 
      : window.location.origin;
    
    const profileUrl = `${domain}/u/${username}`;
    
    // Показываем красивое уведомление
    if (window.confirm(
      `✅ Профиль сохранён!\n\n` +
      `Твоя ссылка:\n${profileUrl}\n\n` +
      `Скопировать ссылку?`
    )) {
      await navigator.clipboard.writeText(profileUrl);
      alert("📋 Ссылка скопирована!");
    }
  } catch (error) {
    console.error("❌ Ошибка сохранения:", error);
    alert("Ошибка сохранения: " + error.message);
  } finally {
    setSaving(false);
  }
};

  const resetProfile = () => {
    if (!window.confirm("Сбросить BIOX профиль?")) return;
    setProfile(defaultProfile);
  };

  // ===== ЭКРАН ЗАГРУЗКИ =====
  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        color: "#fff",
        fontFamily: "Inter, Arial, sans-serif",
        background: "#050505",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚡</div>
          <div style={{ fontSize: "24px", fontWeight: "800", letterSpacing: "-1px" }}>
            BIO<span style={{ color: "#8b5cf6" }}>X</span>
          </div>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "10px", letterSpacing: "2px" }}>
            ЗАГРУЗКА...
          </div>
        </div>
      </div>
    );
  }

  const tabs = ["PROFILE", "LINKS", "APPEARANCE", "BADGES"];

  return (
    <div
      className={`app effect-${profile.effect}`}
      style={{
        "--accent": profile.accent,
        "--mx": `${mouse.x}%`,
        "--my": `${mouse.y}%`,
      }}
    >
      <div className="background-image" style={backgroundStyle} />
      <div className="aura aura-one" />
      <div className="aura aura-two" />
      <div className="cursor-light" />
      <div className="grain" />
      <div className="grid-overlay" />

      <header className="topbar">
        <div className="brand">
          <span>BIO</span>X
        </div>
        <div className="top-status">
          <span className="status-dot" />
          {currentUser?.id === OWNER_ID ? "OWNER MODE" : "CLOUD PROFILE"}
        </div>
        <button className="save-top" onClick={handleSave} disabled={saving}>
          {saving ? "SAVING..." : saved ? "SAVED ✓" : "SAVE PROFILE"}
        </button>
      </header>

      <main className="workspace">
        <section className="editor">
          <div className="editor-heading">
            <div>
              <div className="eyebrow">PROFILE BUILDER / 01</div>
              <h1>
                CREATE
                <br />
                YOUR <span>BIOX</span>
              </h1>
            </div>
            <button className="reset-button" onClick={resetProfile}>
              RESET
            </button>
          </div>

          <div className="tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="panel">
            {activeTab === "PROFILE" && (
              <>
                <div className="panel-title">
                  <span>01</span>
                  PROFILE
                </div>
                <div className="avatar-upload">
                  <label className="avatar-drop">
                    {profile.avatar && profile.avatar !== "loading..." ? (
                      <img src={profile.avatar} alt="avatar" />
                    ) : (
                      <div className="upload-plus">
                        {profile.avatar === "loading..." ? "..." : "+"}
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      onChange={(e) => uploadFile("avatar", e.target.files[0])}
                    />
                  </label>
                  <div>
                    <strong>AVATAR</strong>
                    <span>PNG / JPG / GIF</span>
                    <span>MAX 15 MB</span>
                  </div>
                </div>
                <label className="field">
                  <span>DISPLAY NAME</span>
                  <input
                    value={profile.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Your name"
                  />
                </label>
                <label className="field">
                  <span>USERNAME</span>
                  <input
                    value={profile.username}
                    onChange={(e) => update("username", e.target.value)}
                    placeholder="@username"
                  />
                </label>
                <label className="field">
                  <span>BIO</span>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => update("bio", e.target.value)}
                    placeholder="Tell something about yourself..."
                  />
                </label>
              </>
            )}

            {activeTab === "LINKS" && (
              <>
                <div className="panel-title">
                  <span>02</span>
                  CUSTOM LINKS
                </div>
                <p className="panel-description">
                  Добавляй сколько угодно ссылок. Они появятся на твоём профиле автоматически.
                </p>
                <div className="links-editor">
                  {profile.links.map((link, index) => (
                    <div className="link-row" key={index}>
                      <div className="link-number">
                        {(index + 1).toString().padStart(2, "0")}
                      </div>
                      <input
                        value={link.name}
                        onChange={(e) => updateLink(index, "name", e.target.value)}
                        placeholder="Link name"
                      />
                      <input
                        value={link.url}
                        onChange={(e) => updateLink(index, "url", e.target.value)}
                        placeholder="https://..."
                      />
                      <button onClick={() => removeLink(index)}>×</button>
                    </div>
                  ))}
                </div>
                <button className="add-button" onClick={addLink}>
                  <span>+</span>
                  ADD NEW LINK
                </button>
              </>
            )}

            {activeTab === "APPEARANCE" && (
              <>
                <div className="panel-title">
                  <span>03</span>
                  AURA APPEARANCE
                </div>
                <label className="upload-wide">
                  <div>
                    <strong>BANNER</strong>
                    <span>IMAGE / GIF · MAX 15 MB</span>
                  </div>
                  <span className="upload-action">
                    {profile.banner === "loading..." ? "..." : "UPLOAD"}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    onChange={(e) => uploadFile("banner", e.target.files[0])}
                  />
                </label>
                <label className="upload-wide">
                  <div>
                    <strong>BACKGROUND</strong>
                    <span>IMAGE / GIF · MAX 15 MB</span>
                  </div>
                  <span className="upload-action">
                    {profile.background === "loading..." ? "..." : "UPLOAD"}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    onChange={(e) => uploadFile("background", e.target.files[0])}
                  />
                </label>
                <div className="appearance-grid">
                  <div className="appearance-block">
                    <span className="field-title">ACCENT COLOR</span>
                    <div className="color-picker">
                      <input
                        type="color"
                        value={profile.accent}
                        onChange={(e) => update("accent", e.target.value)}
                      />
                      <input
                        value={profile.accent}
                        onChange={(e) => update("accent", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="appearance-block">
                    <span className="field-title">AMBIENT EFFECT</span>
                    <select
                      value={profile.effect}
                      onChange={(e) => update("effect", e.target.value)}
                    >
                      <option value="none">NONE</option>
                      <option value="aurora">AURA</option>
                      <option value="particles">PARTICLES</option>
                      <option value="stars">STARS</option>
                      <option value="grid">GRID</option>
                      <option value="matrix">MATRIX</option>
                    </select>
                  </div>
                </div>
                <label className="field">
                  <span>MUSIC URL</span>
                  <input
                    value={profile.music}
                    onChange={(e) => update("music", e.target.value)}
                    placeholder="https://example.com/music.mp3"
                  />
                </label>
                <label className="field">
                  <span>TRACK TITLE</span>
                  <input
                    value={profile.musicTitle}
                    onChange={(e) => update("musicTitle", e.target.value)}
                    placeholder="My track"
                  />
                </label>
              </>
            )}

            {activeTab === "BADGES" && (
              <>
                <div className="panel-title">
                  <span>04</span>
                  BADGES
                </div>
                <p className="panel-description">
                  Выбирай бейджи. На профиле они отображаются маленькими премиальными иконками рядом с именем.
                </p>
                <div className="badge-selector">
                  {badgeOptions.map((badge) => {
                    const active = profile.badges.includes(badge);
                    const info = badgeInfo[badge];
                    return (
                      <button
                        key={badge}
                        className={`badge-choice ${active ? "selected" : ""}`}
                        onClick={() => toggleBadge(badge)}
                      >
                        <span className={`choice-icon badge-${info.className}`}>
                          <BadgeIcon type={badge} />
                        </span>
                        <span>{info.label}</span>
                        {active && <b>✓</b>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>

        <section className="preview-area">
          <div className="preview-heading">
            <span>LIVE PREVIEW</span>
            <span>REALTIME / AURA</span>
          </div>
          <div className="profile-card-wrap">
            <div className="profile-card">
              <div
                className="profile-banner"
                style={
                  profile.banner && profile.banner !== "loading..."
                    ? { backgroundImage: `url(${profile.banner})` }
                    : {}
                }
              >
                {(!profile.banner || profile.banner === "loading...") && (
                  <>
                    <div className="banner-orb orb-one" />
                    <div className="banner-orb orb-two" />
                    <div className="banner-lines" />
                  </>
                )}
                <div className="banner-overlay" />
              </div>
              <div className="profile-body">
                <div className="profile-avatar">
                  {profile.avatar && profile.avatar !== "loading..." ? (
                    <img src={profile.avatar} alt="avatar" />
                  ) : (
                    <div className="avatar-placeholder">
                      {profile.name?.charAt(0)?.toUpperCase() || "B"}
                    </div>
                  )}
                </div>
                <div className="profile-info">
                  <div className="name-line">
                    <h2>{profile.name || "Your Name"}</h2>
                    <div className="profile-badges">
                      {profile.badges.map((badge) => (
                        <Badge key={badge} type={badge} />
                      ))}
                    </div>
                  </div>
                  <div className="profile-username">
                    {profile.username || "@username"}
                  </div>
                  <p className="profile-bio">
                    {profile.bio || "Your bio goes here"}
                  </p>
                </div>
                <div className="profile-divider" />
                <div className="preview-links">
                  {profile.links.map((link, index) => (
                    <a
                      key={`${link.name}-${index}`}
                      href={normalizeUrl(link.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="preview-link"
                    >
                      <span className="link-icon">
                        {link.name?.charAt(0)?.toUpperCase() || "↗"}
                      </span>
                      <span>{link.name || "Link"}</span>
                      <span className="link-arrow">↗</span>
                    </a>
                  ))}
                </div>
                {profile.music && (
                  <div className="music-player">
                    <div className="music-top">
                      <div className="music-icon">♫</div>
                      <div>
                        <span>NOW PLAYING</span>
                        <strong>{profile.musicTitle || "BIOX MUSIC"}</strong>
                      </div>
                      <div className="music-pulse">
                        <i /><i /><i /><i /><i />
                      </div>
                    </div>
                    <audio controls src={profile.music} />
                  </div>
                )}
                <div className="profile-footer">
                  <span>BIOX</span>
                  <span>PERSONAL DIGITAL IDENTITY</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="bottom-line">
        <span>BIOX / AURA SYSTEM</span>
        <span>BUILD YOUR IDENTITY</span>
      </div>
    </div>
  );
}

export default App;