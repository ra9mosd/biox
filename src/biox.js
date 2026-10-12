import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const OWNER_ID = '8787840086';
const response = (res, status, body) => res.status(status).json(body);

function verifyInitData(initData) {
  if (!initData || typeof initData !== 'string') throw new Error('Открой BIOX через Telegram Mini App.');
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) throw new Error('В Telegram initData отсутствует hash.');
  const authDate = Number(params.get('auth_date'));
  if (!Number.isFinite(authDate) || Date.now()/1000 - authDate > 86400 || authDate > Date.now()/1000 + 60) throw new Error('Данные Telegram устарели. Перезапусти Mini App.');
  params.delete('hash'); params.sort();
  const checkString = [...params.entries()].map(([k,v]) => `${k}=${v}`).join('\n');
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('На сервере не настроен TELEGRAM_BOT_TOKEN.');
  const secret = crypto.createHmac('sha256','WebAppData').update(token).digest();
  const expected = crypto.createHmac('sha256',secret).update(checkString).digest('hex');
  const a = Buffer.from(expected,'hex'), b = Buffer.from(hash,'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a,b)) throw new Error('Подпись Telegram не прошла проверку.');
  const raw = params.get('user');
  if (!raw) throw new Error('Telegram не передал пользователя.');
  const u = JSON.parse(raw);
  if (!u?.id) throw new Error('Не найден Telegram ID.');
  return { id: String(u.id), username: u.username ? String(u.username).toLowerCase() : null, first_name: String(u.first_name || '').slice(0,128) };
}
function client() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('На Vercel добавь SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY.');
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
const txt = (v,n=500) => typeof v === 'string' ? v.trim().slice(0,n) : '';
function url(v) {
  const s=txt(v,1000); if(!s) return null;
  try { const u=new URL(s); return ['http:','https:'].includes(u.protocol)?u.toString():null; } catch { return null; }
}
async function ensureUser(db,tg) {
  const {data,error}=await db.from('users').select('id,username,role,vip_expires').eq('id',tg.id).maybeSingle();
  if(error) throw error;
  if(data) {
    const {error:updateError}=await db.from('users').update({username:tg.username,first_name:tg.first_name}).eq('id',tg.id);
    if(updateError) throw updateError;
    return data;
  }
  const {data:created,error:insertError}=await db.from('users').insert({id:tg.id,username:tg.username,first_name:tg.first_name,role:tg.id===OWNER_ID?'owner':'free'}).select('id,username,role,vip_expires').single();
  if(insertError) throw insertError;
  return created;
}
async function readProfile(db,id) {
  const [p,l,b]=await Promise.all([
    db.from('profiles').select('*').eq('user_id',id).maybeSingle(),
    db.from('links').select('id,name,url,position').eq('user_id',id).order('position'),
    db.from('badges').select('badge').eq('user_id',id)
  ]);
  if(p.error) throw p.error; if(l.error) throw l.error; if(b.error) throw b.error;
  const x=p.data||{};
  return {...x,user_id:id,name:x.name||'',username:x.display_username||'',bio:x.bio||'',avatar:x.avatar_url||'',banner:x.banner_url||'',background:x.background_url||'',cardColor:x.background_color||'#111019',accent:x.accent||'#8b5cf6',effect:x.effect||'aurora',music:x.music_url||'',musicTitle:x.music_title||'BIOX MUSIC',links:l.data||[],badges:(b.data||[]).map(v=>v.badge)};
}
async function saveOwn(db,id,input) {
  const row={user_id:id,name:txt(input.name,80),display_username:txt(input.username,64).replace(/^@/,'').toLowerCase(),bio:txt(input.bio,500),avatar_url:url(input.avatar),banner_url:url(input.banner),background_url:url(input.background),background_color:/^#[0-9a-fA-F]{6}$/.test(input.cardColor||'')?input.cardColor:'#111019',accent:/^#[0-9a-fA-F]{6}$/.test(input.accent||'')?input.accent:'#8b5cf6',effect:['aurora','glow','matrix','none'].includes(input.effect)?input.effect:'aurora',music_url:url(input.music),music_title:txt(input.musicTitle,100)||'BIOX MUSIC',updated_at:new Date().toISOString()};
  const {error}=await db.from('profiles').upsert(row,{onConflict:'user_id'}); if(error) throw error;
  const links=Array.isArray(input.links)?input.links.slice(0,20).map((x,i)=>({user_id:id,name:txt(x?.name,40),url:url(x?.url),position:i})).filter(x=>x.name&&x.url):[];
  const del=await db.from('links').delete().eq('user_id',id); if(del.error) throw del.error;
  if(links.length){const ins=await db.from('links').insert(links);if(ins.error)throw ins.error;}
  // Badge table is deliberately untouched during ordinary profile save.
}
export default async function handler(req,res) {
  if(req.method!=='POST') return response(res,405,{error:'Только POST'});
  try {
    const action=req.body?.action;
    const db=client();
    if(action==='public-profile') {
      const username=txt(req.body.username,64).replace(/^@/,'').toLowerCase();
      if(!username)return response(res,400,{error:'Введи username BIOX.'});
      const {data:publicProfile,error:profileError}=await db.from('profiles').select('user_id').ilike('display_username',username).maybeSingle();
      if(profileError)throw profileError;
      let target=null;
      if(publicProfile){const found=await db.from('users').select('id,username,role,vip_expires').eq('id',publicProfile.user_id).maybeSingle();if(found.error)throw found.error;target=found.data;}
      if(!target){const found=await db.from('users').select('id,username,role,vip_expires').eq('username',username).maybeSingle();if(found.error)throw found.error;target=found.data;}
      if(!target)return response(res,404,{error:'Пользователь не найден.'});
      return response(res,200,{profile:{...(await readProfile(db,String(target.id))),role:target.role,vipExpires:target.vip_expires,telegramUsername:target.username}});
    }
    const tg=verifyInitData(req.headers['x-telegram-init-data']||req.body?.initData);
    const user=await ensureUser(db,tg);
    if(action==='bootstrap') {
      const profile=await readProfile(db,tg.id);
      return response(res,200,{user:{id:tg.id,role:tg.id===OWNER_ID?'owner':user.role,vipExpires:user.vip_expires,telegramUsername:tg.username},profile});
    }
    if(action==='upload-image') {
      const field=req.body?.field;
      if(!['avatar','banner','background'].includes(field))return response(res,400,{error:'Недопустимый тип изображения.'});
      const dataUrl=String(req.body?.dataUrl||'');
      const match=dataUrl.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/);
      if(!match)return response(res,400,{error:'Выбери PNG, JPG, WEBP или GIF.'});
      const buffer=Buffer.from(match[2],'base64');
      if(!buffer.length||buffer.length>3*1024*1024)return response(res,413,{error:'Изображение должно быть до 3 МБ.'});
      const ext=({'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif'})[match[1]];
      const path=`${tg.id}/${field}-${Date.now()}.${ext}`;
      const {data,error}=await db.storage.from('profiles').upload(path,buffer,{contentType:match[1],upsert:true,cacheControl:'3600'});
      if(error)throw error;
      const {data:{publicUrl}}=db.storage.from('profiles').getPublicUrl(data.path);
      return response(res,200,{ok:true,url:publicUrl});
    }
    if(action==='save-profile') {
      await saveOwn(db,tg.id,req.body.profile||{});
      const saved=await readProfile(db,tg.id); const slug=String(saved.username||'').replace(/^@/,'').trim(); const publicUrl=slug ? `${(process.env.PUBLIC_SITE_URL||'https://biox-lac.vercel.app').replace(/\/$/,'')}/?bio=${encodeURIComponent(slug)}` : null;
      return response(res,200,{ok:true,profile:saved,publicUrl});
    }
    if(action==='owner-update') {
      if(tg.id!==OWNER_ID)return response(res,403,{error:'Только владелец BIOX может выдавать VIP и бейджи.'});
      const targetId=String(req.body.targetId||'');
      if(!/^\d+$/.test(targetId))return response(res,400,{error:'Укажи числовой Telegram ID.'});
      const role=req.body.role, badges=req.body.badges;
      if(targetId===OWNER_ID && role && role!=='owner')return response(res,400,{error:'Нельзя снять роль владельца.'});
      if(role!==undefined) {
        if(!['free','vip','owner'].includes(role))return response(res,400,{error:'Недопустимая роль.'});
        const r=await db.from('users').update({role}).eq('id',targetId);if(r.error)throw r.error;
        if(r.data===null){} // PostgREST may return no rows when select is omitted.
      }
      if(badges!==undefined) {
        if(!Array.isArray(badges)||badges.length>20||badges.some(x=>typeof x!=='string'||!/^[a-zA-Z0-9_-]{1,32}$/.test(x)))return response(res,400,{error:'Некорректный список бейджей.'});
        const d=await db.from('badges').delete().eq('user_id',targetId);if(d.error)throw d.error;
        const unique=[...new Set(badges)];
        if(unique.length){const i=await db.from('badges').insert(unique.map(badge=>({user_id:targetId,badge})));if(i.error)throw i.error;}
      }
      return response(res,200,{ok:true});
    }
    return response(res,400,{error:'Неизвестное действие.'});
  } catch(e) {
    console.error('[BIOX API]',e);
    const msg=e?.message||'Ошибка сервера';
    const auth=/Telegram|initData|подпись|устарели|ID/i.test(msg);
    return response(res,auth?401:500,{error:msg});
  }
}
