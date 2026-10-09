 import { useEffect, useMemo, useState } from "react";
import { uploadImage, saveProfile, ensureUser, loadMyProfile } from "./lib/api";
import "./App.css";

const OWNER_ID = 8787840086;

const defaultProfile = {
  name: "",
  username: "",
  bio: "",
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

const badgeOptions = ["VERIFIED", "VIP", "SPONSOR", "FOUNDER", "PRO", "CREATOR", "DEVELOPER", "OG", "EARLY", "STAFF"];

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
 
function BadgeIcon({ type }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
  switch (type) {
    case "VERIFIED":
      return (<svg {...common}><path d="M12 2.7 14.1 4l2.45-.05 1.2 2.12 2.12 1.2-.05 2.45L21.3 12l-1.48 2.28.05 2.45-2.12 1.2-1.2 2.12-2.45-.05L12 21.3l-2.28-1.48-2.45.05-1.2-2.12-2.12-1.2.05-2.45L2.7 12l1.3-2.28-.05-2 .45 2.12-1.2 1.2-2.12L9.72 4 12 2.7Z" fill="currentColor" /><path d="m8.1 12.2 2.45 2.35 5.35-5.2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
    case "VIP":
      return (<svg {...common}><path d="m12 2.8 2.55 5.35 5.9.86-4.27 4.16 1 5.87L12 16.28l-5.18 2.76 1-5.87L3.55 9l5.9-.86L12 2.8Z" fill="currentColor" /></svg>);
    case "SPONSOR":
      return (<svg {...common}><path d="m12 2.5 7.4 9.5-7.4 9.5L4.6 12 12 2.5Z" fill="currentColor" /><path d="m12 6.8 4.1 5.2-4.1 5.2L7.9 12 12 6.8Z" fill="rgba(255,255,255,.45)" /></svg>);
    case "FOUNDER":
      return (<svg {...common}><path d="m3.2 7.2 4.25 3.05L12 4l4.55 6.25L20.8 7.2l-1.55 11.3H4.75L3.2 7.2Z" fill="currentColor" /><path d="M5.2 20h13.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>);
    case "PRO":
      return (<svg {...common}><path d="m13.5 2-8 11h5.2L10 22l8.5-12h-5.15L13.5 2Z" fill="currentColor" /></svg>);
    case "CREATOR":
      return (<svg {...common}><path d="m12 2 1.65 6.35L20 10l-6.35 1.65L12 18l-1.65-6.35L4 10l6.35-1.65L12 2Z" fill="currentColor" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" fill="currentColor" /></svg>);
    case "DEVELOPER":
      return (<svg {...common}><path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5M13.5 4l-3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
    case "OG":
      return (<svg {...common}><path d="M14.2 3.1c.4 3.1-1.3 4.3-2.8 5.6-1.1.95-1.9 1.8-1.9 3.3 0 1.1.6 2.1 1.6 2.7-.15-1.6.7-2.55 1.75-3.5 1.35-1.2 3.15-2.65 3.15-5.4 2.15 1.8 4.05 4.5 4.05 7.6 0 4.25-3.3 7.5-7.95 7.5S4.05 17.7 4.05 13.7c0-3.05 1.8-5.85 4.75-8.15-.25 2.25.3 3.7 1.1 4.7.15-2.15 1.25-3.85 4.3-7.15Z" fill="currentColor" /></svg>);
    case "EARLY":
      return (<svg {...common}><path d="m12 2.8 7.9 9.2-7.9 9.2L4.1 12 12 2.8Z" fill="currentColor" /><path d="m12 7.4 3.95 4.6-3.95 4.6L8.05 12 12 7.4Z" fill="rgba(255,255,255,.5)" /></svg>);
    case "STAFF":
      return (<svg {...common}><path d="M12 2.5 20 6v5.7c0 4.9-3.1 8.1-8 9.8-4.9-1.7-8-4.9-8-9.8V6l8-3.5Z" fill="currentColor" /><path d="m8.5 12 2.2 2.2 4.8-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
    default: return null;
  }
}

function Badge({ type }) {
  const info = badgeInfo[type];
  if (!info) return null;
  return (<span className={`profile-badge badge-${info.className}`} title={info.label}><BadgeIcon type={type} /><span className="badge-tooltip">{info.label}</span></span>);
}

function App() {
  const [profile, setProfile] = useState(defaultProfile);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("PROFILE");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [isViewingMode, setIsViewingMode] = useState(false);
 
useEffect(() => {
  const init = async () => {
    try {
      const tg = window.Telegram?.WebApp;
      let tgUser = tg?.initDataUnsafe?.user;
      
      // Проверяем start_param (username для просмотра профиля)
const startParam = tg?.initDataUnsafe?.start_param || tg?.initDataUnsafe?.startParam;      const isViewingProfile = startParam && startParam.length > 0;
      
      if (!tgUser) {
        console.log("⚠️ Открыто вне Telegram, используем тестового пользователя");
        tgUser = { id: OWNER_ID, username: "pashafloodwait", first_name: "Pasha", last_name: "Floodwait", photo_url: "" };
      }

      console.log("👤 Telegram user:", tgUser);
      console.log("📱 Start param:", startParam);

      // Если есть start_param — загружаем публичный профиль
      if (isViewingProfile) {
        console.log("👀 Открываем профиль пользователя:", startParam);
        const publicProfile = await loadProfileByUsername(startParam);
        
        if (publicProfile) {
          setProfile({
            name: publicProfile.name || "User",
            username: publicProfile.username || `@${startParam}`,
            bio: publicProfile.bio || "",
            avatar: publicProfile.avatar_url || "",
            banner: publicProfile.banner_url || "",
            background: publicProfile.background_url || "",
            accent: publicProfile.accent || defaultProfile.accent,
            effect: publicProfile.effect || defaultProfile.effect,
            music: publicProfile.music_url || "",
            musicTitle: publicProfile.music_title || defaultProfile.musicTitle,
            links: publicProfile.links.length > 0 ? publicProfile.links.map(l => ({ name: l.name, url: l.url })) : [],
            badges: publicProfile.badges.length > 0 ? publicProfile.badges : [],
          });
          setIsViewingMode(true); // Новый стейт — режим просмотра
        } else {
          console.log("❌ Профиль не найден:", startParam);
        }
      }

      // Загружаем текущего пользователя (для редактора)
      const user = await ensureUser(tgUser);
      console.log("✅ Пользователь в БД:", user);
      setCurrentUser(user);

      // Если НЕ в режиме просмотра — загружаем свой профиль
      if (!isViewingMode) {
        const savedProfile = await loadMyProfile(user.id);
        console.log("📦 Загруженный профиль:", savedProfile);

        if (savedProfile) {
          setProfile({
            name: savedProfile.name || `${tgUser.first_name || ""} ${tgUser.last_name || ""}`.trim(),
            username: savedProfile.username || `@${user.username}`,
            bio: savedProfile.bio || "",
            avatar: savedProfile.avatar_url || tgUser.photo_url || "",
            banner: savedProfile.banner_url || "",
            background: savedProfile.background_url || "",
            accent: savedProfile.accent || defaultProfile.accent,
            effect: savedProfile.effect || defaultProfile.effect,
            music: savedProfile.music_url || "",
            musicTitle: savedProfile.music_title || defaultProfile.musicTitle,
            links: savedProfile.links.length > 0 ? savedProfile.links.map(l => ({ name: l.name, url: l.url })) : defaultProfile.links,
            badges: savedProfile.badges.length > 0 ? savedProfile.badges : defaultProfile.badges,
          });
        } else {
          setProfile({
            ...defaultProfile,
            name: `${tgUser.first_name || ""} ${tgUser.last_name || ""}`.trim() || `User ${tgUser.id}`,
            username: `@${user.username}`,
            avatar: tgUser.photo_url || "",
          });
        }
      }
    } catch (error) {
      console.error("❌ Ошибка инициализации:", error);
    } finally {
      setLoading(false);
    }
  };
  init();
}, []);
 
  useEffect(() => {
    const move = (event) => setMouse({ x: (event.clientX / window.innerWidth) * 100, y: (event.clientY / window.innerHeight) * 100 });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const backgroundStyle = useMemo(() => profile.background ? { backgroundImage: `url(${profile.background})` } : {}, [profile.background]);
  const update = (field, value) => setProfile(c => ({ ...c, [field]: value }));

  const uploadFile = async (field, file) => {
    if (!file || !currentUser) { if (!currentUser) alert("Пользователь не загружен"); return; }
    if (file.size > 15 * 1024 * 1024) { alert("Максимум 15 MB"); return; }
    const originalValue = profile[field];
     update(field, "loading...");
    try {
      console.log(`📤 Загрузка ${field}...`);
      const publicUrl = await uploadImage(file, currentUser.id, field);
      console.log(`✅ Файл загружен: ${publicUrl}`);
      update(field, publicUrl);
    } catch (error) {
      console.error("❌ Ошибка загрузки:", error);
      alert("Ошибка загрузки: " + error.message);
      update(field, originalValue);
    }
  };

  const addLink = () => setProfile(c => ({ ...c, links: [...c.links, { name: "New link", url: "https://" }] }));
  const updateLink = (i, f, v) => setProfile(c => ({ ...c, links: c.links.map((l, idx) => idx === i ? { ...l, [f]: v } : l) }));
  const removeLink = (i) => setProfile(c => ({ ...c, links: c.links.filter((_, idx) => idx !== i) }));
  const toggleBadge = (b) => setProfile(c => ({ ...c, badges: c.badges.includes(b) ? c.badges.filter(x => x !== b) : [...c.badges, b] }));

  const handleSave = async () => {
    if (!currentUser) { alert("Пользователь не загружен!"); return; }
    setSaving(true);
    try {
      console.log("💾 Сохранение профиля...");
      await saveProfile(currentUser.id, profile);
      console.log("✅ Профиль сохранён!");
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      const username = currentUser.username || `user${currentUser.id}`;
      const domain = window.location.hostname === "localhost" ? "http://localhost:5173" : window.location.origin;
      const profileUrl = `${domain}/u/${username}`;
      if (window.confirm(`✅ Профиль сохранён!\n\nТвоя ссылка:\n${profileUrl}\n\nСкопировать ссылку?`)) {
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

  const resetProfile = () => { if (window.confirm("Сбросить BIOX профиль?")) setProfile(defaultProfile); };
 
  if (loading) {
    return (<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#fff", fontFamily: "Inter", background: "#050505" }}><div style={{ textAlign: "center" }}><div style={{ fontSize: "48px", marginBottom: "20px" }}>⚡</div><div style={{ fontSize: "24px", fontWeight: "800" }}>BIO<span style={{ color: "#8b5cf6" }}>X</span></div><div style={{ fontSize: "12px", color: "#666", marginTop: "10px", letterSpacing: "2px" }}>ЗАГРУЗКА...</div></div></div>);
  }

  const tabs = ["PROFILE", "LINKS", "APPEARANCE", "BADGES"];

  return (
    <div className={`app effect-${profile.effect}`} style={{ "--accent": profile.accent, "--mx": `${mouse.x}%`, "--my": `${mouse.y}%` }}>
      <div className="background-image" style={backgroundStyle} />
      <div className="aura aura-one" />
      <div className="aura aura-two" />
      <div className="cursor-light" />
      <div className="grain" />
      <div className="grid-overlay" />
       <header className="topbar">
        <div className="brand"><span>BIO</span>X</div>
        <div className="top-status"><span className="status-dot" />{currentUser?.id === OWNER_ID ? "OWNER MODE" : "CLOUD PROFILE"}</div>
        <button className="save-top" onClick={handleSave} disabled={saving}>{saving ? "SAVING..." : saved ? "SAVED ✓" : "SAVE PROFILE"}</button>
        {!isViewingMode && currentUser && (
  <button 
    className="save-top" 
    onClick={() => {
      const username = currentUser.username || `user${currentUser.id}`;
      const botUsername = "bioxbio_bot"; // ЗАМЕНИ!
const shareLink = `https://t.me/${botUsername}?startapp=${username}`;      
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.openTelegramLink(shareLink);
      } else {
        navigator.clipboard.writeText(shareLink);
        alert(" Ссылка скопирована: " + shareLink);
      }
    }}
    style={{ background: "#8b5cf6", color: "#fff", marginLeft: "10px" }}
  >
    ПОДЕЛИТЬСЯ
  </button>
)}
      </header>
{!isViewingMode && (
  <main className="workspace">
    <section className="editor">
      <div className="editor-heading">
        <div><div className="eyebrow">PROFILE BUILDER / 01</div><h1>CREATE<br />YOUR <span>BIOX</span></h1></div>
        <button className="reset-button" onClick={resetProfile}>RESET</button>
      </div>
      <div className="tabs">{tabs.map(t => <button key={t} className={activeTab === t ? "active" : ""} onClick={() => setActiveTab(t)}>{t}</button>)}</div>
      <div className="panel">
        {activeTab === "PROFILE" && <>
          <div className="panel-title"><span>01</span>PROFILE</div>
          <div className="avatar-upload">
            <label className="avatar-drop">
              {profile.avatar && profile.avatar !== "loading..." ? <img src={profile.avatar} alt="avatar" /> : <div className="upload-plus">{profile.avatar === "loading..." ? "..." : "+"}</div>}
              <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={e => uploadFile("avatar", e.target.files[0])} />
            </label>
            <div><strong>AVATAR</strong><span>PNG / JPG / GIF</span><span>MAX 15 MB</span></div>
          </div>
          <label className="field"><span>DISPLAY NAME</span><input value={profile.name} onChange={e => update("name", e.target.value)} placeholder="Your name" /></label>
          <label className="field"><span>USERNAME (из Telegram, уникальный)</span><input value={profile.username} readOnly style={{ opacity: 0.6, cursor: "not-allowed" }} placeholder="@username" /></label>
          <label className="field"><span>BIO</span><textarea value={profile.bio} onChange={e => update("bio", e.target.value)} placeholder="Tell something about yourself..." /></label>
        </>}
        {activeTab === "LINKS" && <>
          <div className="panel-title"><span>02</span>CUSTOM LINKS</div>
          <p className="panel-description">Добавляй сколько угодно ссылок. Они появятся на твоём профиле автоматически.</p>
          <div className="links-editor">
            {profile.links.map((link, i) => <div className="link-row" key={i}>
              <div className="link-number">{String(i + 1).padStart(2, "0")}</div>
              <input value={link.name} onChange={e => updateLink(i, "name", e.target.value)} placeholder="Link name" />
              <input value={link.url} onChange={e => updateLink(i, "url", e.target.value)} placeholder="https://..." />
              <button onClick={() => removeLink(i)}>×</button>
            </div>)}
          </div>
          <button className="add-button" onClick={addLink}><span>+</span>ADD NEW LINK</button>
        </>}
        {activeTab === "APPEARANCE" && <>
          <div className="panel-title"><span>03</span>AURA APPEARANCE</div>
          <label className="upload-wide"><div><strong>BANNER</strong><span>IMAGE / GIF · MAX 15 MB</span></div><span className="upload-action">{profile.banner === "loading..." ? "..." : "UPLOAD"}</span><input type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={e => uploadFile("banner", e.target.files[0])} /></label>
          <label className="upload-wide"><div><strong>BACKGROUND</strong><span>IMAGE / GIF · MAX 15 MB</span></div><span className="upload-action">{profile.background === "loading..." ? "..." : "UPLOAD"}</span><input type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={e => uploadFile("background", e.target.files[0])} /></label>
          <div className="appearance-grid">
            <div className="appearance-block"><span className="field-title">ACCENT COLOR</span><div className="color-picker"><input type="color" value={profile.accent} onChange={e => update("accent", e.target.value)} /><input value={profile.accent} onChange={e => update("accent", e.target.value)} /></div></div>
            <div className="appearance-block"><span className="field-title">AMBIENT EFFECT</span><select value={profile.effect} onChange={e => update("effect", e.target.value)}><option value="none">NONE</option><option value="aurora">AURA</option><option value="particles">PARTICLES</option><option value="stars">STARS</option><option value="grid">GRID</option><option value="matrix">MATRIX</option></select></div>
          </div>
          <label className="field"><span>MUSIC URL</span><input value={profile.music} onChange={e => update("music", e.target.value)} placeholder="https://example.com/music.mp3" /></label>
          <label className="field"><span>TRACK TITLE</span><input value={profile.musicTitle} onChange={e => update("musicTitle", e.target.value)} placeholder="My track" /></label>
        </>}
        {activeTab === "BADGES" && <>
          <div className="panel-title"><span>04</span>BADGES</div>
          <p className="panel-description">Выбирай бейджи. На профиле они отображаются маленькими премиальными иконками рядом с именем.</p>
          <div className="badge-selector">
            {badgeOptions.map(badge => {
              const active = profile.badges.includes(badge);
              const info = badgeInfo[badge];
              return <button key={badge} className={`badge-choice ${active ? "selected" : ""}`} onClick={() => toggleBadge(badge)}><span className={`choice-icon badge-${info.className}`}><BadgeIcon type={badge} /></span><span>{info.label}</span>{active && <b>✓</b>}</button>;
            })}
          </div>
        </>}
      </div>
    </section>
    <section className="preview-area">
      <div className="preview-heading"><span>LIVE PREVIEW</span><span>REALTIME / AURA</span></div>
      <div className="profile-card-wrap">
        <div className="profile-card">
          <div className="profile-banner" style={profile.banner && profile.banner !== "loading..." ? { backgroundImage: `url(${profile.banner})` } : {}}>
            {(!profile.banner || profile.banner === "loading...") && <><div className="banner-orb orb-one" /><div className="banner-orb orb-two" /><div className="banner-lines" /></>}
            <div className="banner-overlay" />
          </div>
          <div className="profile-body">
            <div className="profile-avatar">
              {profile.avatar && profile.avatar !== "loading..." ? <img src={profile.avatar} alt="avatar" /> : <div className="avatar-placeholder">{profile.name?.charAt(0)?.toUpperCase() || "B"}</div>}
            </div>
            <div className="profile-info">
              <div className="name-line"><h2>{profile.name || "Your Name"}</h2><div className="profile-badges">{profile.badges.map(b => <Badge key={b} type={b} />)}</div></div>
              <div className="profile-username">{profile.username || "@username"}</div>
              <p className="profile-bio">{profile.bio || "Your bio goes here"}</p>
            </div>
            <div className="profile-divider" />
            <div className="preview-links">{profile.links.map((link, i) => <a key={`${link.name}-${i}`} href={normalizeUrl(link.url)} target="_blank" rel="noreferrer" className="preview-link"><span className="link-icon">{link.name?.charAt(0)?.toUpperCase() || "↗"}</span><span>{link.name || "Link"}</span><span className="link-arrow">↗</span></a>)}</div>
            {profile.music && <div className="music-player"><div className="music-top"><div className="music-icon">♫</div><div><span>NOW PLAYING</span><strong>{profile.musicTitle || "BIOX MUSIC"}</strong></div><div className="music-pulse"><i /><i /><i /><i /><i /></div></div><audio controls src={profile.music} /></div>}
            <div className="profile-footer"><span>BIOX</span><span>PERSONAL DIGITAL IDENTITY</span></div>
          </div>
        </div>
      </div>
    </section>
  </main>
)}

{isViewingMode && (
  <main style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 70px)", padding: "40px 20px" }}>
    <div className="profile-card">
      <div className="profile-banner" style={profile.banner ? { backgroundImage: `url(${profile.banner})` } : {}}>
        {!profile.banner && (<><div className="banner-orb orb-one" /><div className="banner-orb orb-two" /><div className="banner-lines" /></>)}
        <div className="banner-overlay" />
      </div>
      <div className="profile-body">
        <div className="profile-avatar">
          {profile.avatar ? <img src={profile.avatar} alt="avatar" /> : <div className="avatar-placeholder">{profile.name?.charAt(0)?.toUpperCase() || "B"}</div>}
        </div>
        <div className="profile-info">
          <div className="name-line"><h2>{profile.name || "User"}</h2><div className="profile-badges">{profile.badges.map(b => <Badge key={b} type={b} />)}</div></div>
          <div className="profile-username">{profile.username || "@username"}</div>
          <p className="profile-bio">{profile.bio || ""}</p>
        </div>
        <div className="profile-divider" />
        <div className="preview-links">
          {profile.links.map((link, i) => (
            <a key={i} href={link.url.startsWith("http") ? link.url : `https://${link.url}`} target="_blank" rel="noreferrer" className="preview-link">
              <span className="link-icon">{link.name?.charAt(0)?.toUpperCase() || "↗"}</span>
              <span>{link.name || "Link"}</span>
              <span className="link-arrow">↗</span>
            </a>
          ))}
        </div>
        {profile.music && (
          <div className="music-player">
            <div className="music-top">
              <div className="music-icon">♫</div>
              <div><span>NOW PLAYING</span><strong>{profile.musicTitle || "BIOX MUSIC"}</strong></div>
              <div className="music-pulse"><i /><i /><i /><i /><i /></div>
            </div>
            <audio controls src={profile.music} />
          </div>
        )}
        <div className="profile-footer"><span>BIOX</span><span>BUILD YOUR IDENTITY</span></div>
      </div>
    </div>
  </main>
)}
      <div className="bottom-line"><span>BIOX / AURA SYSTEM</span><span>BUILD YOUR IDENTITY</span></div>
    </div>
  );
}

export default App;