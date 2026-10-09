import { useEffect, useState } from "react";
import { loadProfileByUsername } from "./lib/api";
import "./App.css";

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
    case "EARLY":
      return (<svg {...common}><path d="m12 2.8 7.9 9.2-7.9 9.2L4.1 12 12 2.8Z" fill="currentColor" /><path d="m12 7.4 3.95 4.6-3.95 4.6L8.05 12 12 7.4Z" fill="rgba(255,255,255,.5)" /></svg>);
    default:
      return (<svg {...common}><circle cx="12" cy="12" r="8" fill="currentColor" /></svg>);
  }
}

function Badge({ type }) {
  const info = {
    VERIFIED: "verified", VIP: "vip", SPONSOR: "sponsor",
    FOUNDER: "founder", PRO: "pro", CREATOR: "creator",
    DEVELOPER: "developer", OG: "og", EARLY: "early", STAFF: "staff",
  }[type] || "verified";
  return (
    <span className={`profile-badge badge-${info}`} title={type}>
      <BadgeIcon type={type} />
    </span>
  );
}

export default function PublicProfile({ username }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await loadProfileByUsername(username);
        if (data) {
          setProfile(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#fff", fontFamily: "Inter", background: "#050505" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚡</div>
          <div style={{ fontSize: "24px", fontWeight: "800" }}>BIO<span style={{ color: "#8b5cf6" }}>X</span></div>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "10px", letterSpacing: "2px" }}>ЗАГРУЗКА...</div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#fff", fontFamily: "Inter", background: "#050505", flexDirection: "column", gap: "20px" }}>
        <h1 style={{ fontSize: "48px" }}>BIO<span style={{ color: "#8b5cf6" }}>X</span></h1>
        <p style={{ color: "#666" }}>Профиль не найден</p>
        <a href="/" style={{ color: "#8b5cf6", textDecoration: "none", fontSize: "14px" }}>← Создать свой профиль</a>
      </div>
    );
  }

  const accent = profile.accent || "#8b5cf6";

  return (
    <div className="app" style={{ "--accent": accent }}>
      <div className="aura aura-one" />
      <div className="aura aura-two" />
       <div className="grain" />
      <header className="topbar">
        <div className="brand"><span>BIO</span>X</div>
        <div className="top-status"><span className="status-dot" />PUBLIC PROFILE</div>
        <a href="/" style={{ height: "38px", padding: "0 24px", border: "0", background: "#fff", color: "#050505", fontSize: "10px", fontWeight: "800", letterSpacing: "1.3px", textDecoration: "none", display: "flex", alignItems: "center" }}>СОЗДАТЬ СВОЙ</a>
      </header>
      <main style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 70px)", padding: "40px 20px" }}>
        <div className="profile-card">
          <div className="profile-banner" style={profile.banner_url ? { backgroundImage: `url(${profile.banner_url})` } : {}}>
            {!profile.banner_url && (<><div className="banner-orb orb-one" /><div className="banner-orb orb-two" /><div className="banner-lines" /></>)}
            <div className="banner-overlay" />
          </div>
          <div className="profile-body">
            <div className="profile-avatar">
              {profile.avatar_url ? <img src={profile.avatar_url} alt="avatar" /> : <div className="avatar-placeholder">{(profile.name || "B").charAt(0).toUpperCase()}</div>}
            </div>
            <div className="profile-info">
              <div className="name-line">
                <h2>{profile.name || "User"}</h2>
                <div className="profile-badges">{profile.badges?.map((badge) => <Badge key={badge} type={badge} />)}</div>
              </div>
              <div className="profile-username">{profile.display_username || `@${username}`}</div>
              <p className="profile-bio">{profile.bio || ""}</p>
            </div>
            <div className="profile-divider" />
            <div className="preview-links">
              {profile.links?.map((link, index) => (
                <a key={index} href={normalizeUrl(link.url)} target="_blank" rel="noreferrer" className="preview-link">
                  <span className="link-icon">{link.name?.charAt(0)?.toUpperCase() || "↗"}</span>
                  <span>{link.name || "Link"}</span>
                  <span className="link-arrow">↗</span>
                </a>
              ))}
            </div>
            {profile.music_url && (
              <div className="music-player">
                <div className="music-top">
                  <div className="music-icon">♫</div>
                  <div><span>NOW PLAYING</span><strong>{profile.music_title || "BIOX MUSIC"}</strong></div>
                  <div className="music-pulse"><i /><i /><i /><i /><i /></div>
                </div>
                <audio controls src={profile.music_url} />
              </div>
            )}
            <div className="profile-footer"><span>BIOX</span><span>BUILD YOUR IDENTITY</span></div>
          </div>
        </div>
      </main>
      <div className="bottom-line"><span>BIOX / AURA SYSTEM</span><span>BUILD YOUR IDENTITY</span></div>
    </div>
  );
}