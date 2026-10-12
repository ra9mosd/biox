import { useEffect, useState } from 'react';
import './App.css';
import { bootstrap, saveProfile, loadProfileByUsername, ownerUpdateUser, uploadImage } from './lib/api';

const EMPTY = {
  name: '', username: '', bio: '', avatar: '', banner: '', background: '',
  accent: '#8b5cf6', cardColor: '#111019', effect: 'aurora', music: '', musicTitle: 'BIOX MUSIC',
  links: [], badges: []
};
const BADGE_OPTIONS = ['verified', 'vip', 'sponsor', 'founder', 'pro', 'creator', 'developer', 'og', 'early', 'staff'];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(EMPTY);
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [lookup, setLookup] = useState('');
  const [targetId, setTargetId] = useState('');
  const [targetRole, setTargetRole] = useState('vip');
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [viewingOwn, setViewingOwn] = useState(true);
  const [publicSlug, setPublicSlug] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [uploading, setUploading] = useState('');

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const slug = params.get('bio');
        if (slug) {
          const result = await loadProfileByUsername(slug);
          if (!live) return;
          setProfile({ ...EMPTY, ...result.profile, links: result.profile?.links || [], badges: result.profile?.badges || [] });
          setViewingOwn(false); setPublicSlug(slug); setCurrentUser({ id: 'public', role: result.profile?.role || 'free' });
          return;
        }
        const result = await bootstrap();
        if (!live) return;
        setCurrentUser(result.user);
        setProfile({ ...EMPTY, ...result.profile, links: result.profile?.links || [], badges: result.profile?.badges || [] });
      } catch (e) {
        if (live) setMessage(e.message || 'Не удалось загрузить пользователя');
      } finally { if (live) setLoading(false); }
    })();
    try { window.Telegram?.WebApp?.ready(); window.Telegram?.WebApp?.expand(); } catch {}
    return () => { live = false; };
  }, []);

  const isOwner = currentUser?.id === '8787840086' && currentUser?.role === 'owner';
  const setField = (key, value) => setProfile(p => ({ ...p, [key]: value }));
  const notify = (text) => { setMessage(text); window.setTimeout(() => setMessage(''), 4500); };

  async function handleSave(e) {
    e?.preventDefault();
    setSaving(true);
    try {
      const result = await saveProfile(profile);
      setProfile(p => ({ ...p, ...result.profile }));
      if (result.publicUrl) setShareUrl(result.publicUrl);
      notify('Профиль сохранён');
    } catch (e) { notify(e.message || 'Ошибка сохранения'); }
    finally { setSaving(false); }
  }

  async function findProfile(e) {
    e.preventDefault();
    try {
      const result = await loadProfileByUsername(lookup);
      const p = result.profile;
      setProfile({ ...EMPTY, ...p, links: p.links || [], badges: p.badges || [] });
      setViewingOwn(false);
      notify('Профиль загружен');
    } catch (e) { notify(e.message || 'Профиль не найден'); }
  }

  async function manageRole() {
    try {
      await ownerUpdateUser({ targetId: targetId.trim(), role: targetRole });
      notify('Роль пользователя обновлена');
    } catch (e) { notify(e.message || 'Не удалось изменить роль'); }
  }

  async function manageBadges() {
    try {
      await ownerUpdateUser({ targetId: targetId.trim(), badges: selectedBadges });
      notify('Бейджи пользователя обновлены');
    } catch (e) { notify(e.message || 'Не удалось обновить бейджи'); }
  }

  async function handleImage(file, field) {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { notify('Файл больше 3 МБ. Выбери картинку поменьше.'); return; }
    if (!file.type.startsWith('image/')) { notify('Нужно выбрать файл-картинку.'); return; }
    setUploading(field);
    try { const result = await uploadImage(file, field); setField(field, result.url); notify('Изображение загружено'); }
    catch (e) { notify(e.message || 'Не удалось загрузить изображение'); }
    finally { setUploading(''); }
  }
  function addLink() { setField('links', [...(profile.links || []), { name: '', url: '' }]); }
  function updateLink(index, key, value) {
    setField('links', (profile.links || []).map((link, i) => i === index ? { ...link, [key]: value } : link));
  }
  function removeLink(index) { setField('links', (profile.links || []).filter((_, i) => i !== index)); }

  if (loading) return <main className="screen"><div className="loader"></div><p>Загружаем BIOX…</p></main>;

  if (!currentUser) return <main className="screen"><section className="error-card"><div className="logo">BIOX<span>.</span></div><h1>Открой через Telegram</h1><p>{message || 'Пользователь не загружен. Открой Mini App через кнопку своего Telegram-бота.'}</p><small>Проверь TELEGRAM_BOT_TOKEN и переменные окружения Vercel.</small></section></main>;

  return <main className="app-shell">
    <header className="topbar">
      <div className="logo">BIOX<span>.</span></div>
      <div className="top-user"><span className={`role-dot ${currentUser.role}`}></span>{currentUser.role === 'owner' ? 'OWNER' : currentUser.role === 'vip' ? 'VIP' : 'USER'}</div>
    </header>
    <section className="hero">
      <div className="hero-copy"><div className="eyebrow">YOUR SPACE · YOUR RULES</div><h1>Собери свой<br/><span>цифровой профиль.</span></h1><p>Твой стиль, ссылки и оформление — в одном месте.</p></div>
      <div className="hero-orb"></div>
    </section>
    {!viewingOwn && !publicSlug && <button className="back-button" onClick={() => { setViewingOwn(true); bootstrap().then(r => setProfile({ ...EMPTY, ...r.profile, links: r.profile.links || [], badges: r.profile.badges || [] })).catch(e => notify(e.message)); }}>← Вернуться к своему профилю</button>}
    {publicSlug && <div className="public-banner">Публичное био · <a href={window.location.origin}>Создать свой профиль BIOX</a></div>}
    <section className="workspace">
      <div className="editor">
        <div className="section-heading"><div><span className="eyebrow">PROFILE STUDIO</span><h2>{viewingOwn ? 'Редактор профиля' : 'Просмотр профиля'}</h2></div><span className="live-pill"><i/> LIVE</span></div>
        {viewingOwn && <nav className="tabs">
          {['profile','links','appearance','badges'].map(t => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{({profile:'PROFILE',links:'LINKS',appearance:'LOOKS',badges:'BADGES'})[t]}</button>)}
        </nav>}
        {!viewingOwn ? <div className="read-only-note">Это публичный профиль. Редактировать его может только владелец аккаунта.</div> : <form onSubmit={handleSave} className="form-content">
          {tab === 'profile' && <>
            <label>Отображаемое имя<input value={profile.name || ''} onChange={e => setField('name', e.target.value)} placeholder="Например, pasha" maxLength={80}/></label>
            <label>Username BIOX<input value={profile.username || ''} onChange={e => setField('username', e.target.value)} placeholder="@username" maxLength={64}/><small>Это ник в BIOX, не Telegram username.</small></label>
            <label>Описание<textarea value={profile.bio || ''} onChange={e => setField('bio', e.target.value)} placeholder="Расскажи о себе…" rows={3} maxLength={500}/></label>
            <label>Аватарка <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e => handleImage(e.target.files?.[0], 'avatar')} />{profile.avatar && <button type="button" className="secondary small" onClick={() => setField('avatar','')}>Убрать аватарку</button>}<small>Выбери картинку с компьютера (до 3 МБ).</small></label>
            <label>Баннер <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e => handleImage(e.target.files?.[0], 'banner')} />{profile.banner && <button type="button" className="secondary small" onClick={() => setField('banner','')}>Убрать баннер</button>}<small>Картинка загрузится в хранилище BIOX.</small></label>
          </>}
          {tab === 'links' && <div className="links-editor"><div className="inline-heading"><h3>Твои ссылки</h3><button type="button" className="secondary small" onClick={addLink}>＋ Добавить</button></div>
            {(profile.links || []).map((link, i) => <div className="link-row" key={i}><input aria-label="Название ссылки" value={link.name || ''} onChange={e => updateLink(i,'name',e.target.value)} placeholder="Telegram / VK"/><input aria-label="URL ссылки" value={link.url || ''} onChange={e => updateLink(i,'url',e.target.value)} placeholder="https://…"/><button type="button" className="remove" onClick={() => removeLink(i)}>×</button></div>)}
            {!profile.links?.length && <p className="muted">Пока ссылок нет. Добавь первую.</p>}
          </div>}
          {tab === 'appearance' && <>
            <label>Цвет акцента<div className="color-line"><input type="color" value={profile.accent || '#8b5cf6'} onChange={e => setField('accent',e.target.value)}/><input value={profile.accent || '#8b5cf6'} onChange={e => setField('accent',e.target.value)} maxLength={7}/></div></label>
            <label>Эффект<select value={profile.effect || 'aurora'} onChange={e => setField('effect',e.target.value)}><option value="aurora">Aurora</option><option value="glow">Glow</option><option value="matrix">Matrix</option><option value="none">Без эффекта</option></select></label>
            <label>Цвет карточки профиля<div className="color-line"><input type="color" value={profile.cardColor || '#111019'} onChange={e => setField('cardColor',e.target.value)}/><input value={profile.cardColor || '#111019'} onChange={e => setField('cardColor',e.target.value)} maxLength={7}/></div><small>Это прямоугольная карточка, где имя и описание.</small></label>
            <label>Фон профиля <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e => handleImage(e.target.files?.[0], 'background')} /><small>Выбери файл с компьютера (до 3 МБ).</small>{profile.background && <button type="button" className="secondary small" onClick={() => setField('background','')}>Убрать фон</button>}</label>
            <label>Ссылка на музыку<input value={profile.music || ''} onChange={e => setField('music',e.target.value)} placeholder="https://…"/></label>
            <label>Название музыки<input value={profile.musicTitle || ''} onChange={e => setField('musicTitle',e.target.value)} placeholder="BIOX MUSIC"/></label>
          </>}
          {tab === 'badges' && <div className="owner-warning"><span className="lock">⌑</span><h3>Бейджи управляются владельцем</h3><p>Пользователь не может выдавать себе бейджи. Если нужен новый бейдж — обратись к владельцу BIOX.</p></div>}
          <button className="primary save-button" type="submit" disabled={saving || !!uploading}>{uploading ? 'Загружаем изображение…' : saving ? 'Сохраняем…' : 'Сохранить профиль'} <span>↗</span></button>
          {shareUrl && <div className="share-result"><strong>Твоя публичная ссылка BIOX</strong><input readOnly value={shareUrl} onFocus={e => e.target.select()}/><button type="button" className="secondary" onClick={() => { navigator.clipboard?.writeText(shareUrl); notify('Ссылка скопирована'); }}>Скопировать ссылку</button><a href={shareUrl} target="_blank" rel="noreferrer">Открыть био ↗</a></div>}
        </form>}
      </div>
      <aside className="preview-panel">
        <div className="section-heading"><div><span className="eyebrow">LIVE PREVIEW</span><h2>Твой BIO</h2></div><span className="preview-star">✳</span></div>
        <div className={`profile-card effect-${profile.effect || 'aurora'}`} style={{'--accent':profile.accent || '#8b5cf6', '--card-color':profile.cardColor || '#111019', backgroundImage: profile.background ? `linear-gradient(180deg,rgba(10,10,18,.12),${profile.cardColor || '#101018'} 75%),url("${profile.background}")` : undefined, backgroundColor: profile.cardColor || '#111019'}}>
          <div className="card-banner" style={profile.banner ? {backgroundImage:`url("${profile.banner}")`} : {}}></div>
          <div className="avatar-wrap">{profile.avatar ? <img src={profile.avatar} alt="Аватар" onError={e => {e.currentTarget.style.display='none';}}/> : <span>{(profile.name || 'B').slice(0,1).toUpperCase()}</span>}</div>
          <div className="card-main"><div className="name-row"><h3>{profile.name || 'Твоё имя'}</h3>{(profile.badges || []).map(b => <span key={b} className={`badge badge-${b}`}>{b === 'verified' ? '✓' : b.toUpperCase()}</span>)}</div><div className="handle">{profile.username || '@username'}</div><p className="bio-text">{profile.bio || 'Твоё описание появится здесь. Добавь немного себя.'}</p>
            <div className="preview-links">{(profile.links || []).filter(l => l.name && l.url).map((l,i) => <a key={i} href={l.url} target="_blank" rel="noreferrer">{l.name}<span>↗</span></a>)}</div>
            {profile.musicTitle && <div className="music-chip">♫ <span>{profile.musicTitle}</span></div>}
          </div><div className="card-footer"><span>BIOX PROFILE</span><span>✦ 001</span></div>
        </div>
        <div className="preview-foot"><span>✦</span> Изменения отобразятся здесь до сохранения.</div>
      </aside>
    </section>
    {isOwner && <section className="owner-panel">
      <div className="section-heading"><div><span className="eyebrow">RESTRICTED ACCESS</span><h2>Панель владельца</h2></div><span className="owner-label">OWNER MODE</span></div>
      <p className="muted">Только владелец может менять роль и бейджи. Укажи Telegram ID пользователя.</p>
      <div className="owner-grid">
        <label>Telegram ID пользователя<input value={targetId} onChange={e => setTargetId(e.target.value)} placeholder="Например, 123456789"/></label>
        <label>Роль<select value={targetRole} onChange={e => setTargetRole(e.target.value)}><option value="free">USER / FREE</option><option value="vip">VIP</option><option value="owner">OWNER</option></select></label>
        <button className="primary" onClick={manageRole}>Применить роль</button>
      </div>
      <div className="badge-manager"><h3>Выдать бейджи</h3><div className="badge-options">{BADGE_OPTIONS.map(b => <label key={b} className={`badge-option ${selectedBadges.includes(b)?'selected':''}`}><input type="checkbox" checked={selectedBadges.includes(b)} onChange={e => setSelectedBadges(old => e.target.checked ? [...old,b] : old.filter(x => x !== b))}/>{b}</label>)}</div><button className="secondary" onClick={manageBadges}>Сохранить бейджи пользователя</button></div>
      <form className="lookup-form" onSubmit={findProfile}><label>Открыть био по BIOX username<input value={lookup} onChange={e => setLookup(e.target.value)} placeholder="@username"/></label><button className="secondary" type="submit">Найти профиль</button></form>
    </section>}
    {message && <div className="toast">{message}</div>}
    <footer className="footer"><span>BIOX<span className="accent-dot">.</span></span><span>YOUR SPACE. YOUR RULES.</span></footer>
  </main>;
}
