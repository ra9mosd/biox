const endpoint = '/api/biox';
function getInitData(required = true) {
  const data = window.Telegram?.WebApp?.initData;
  if (!data && required) throw new Error('Для редактирования открой BIOX через Telegram-бота. Публичные био доступны по ссылке в браузере.');
  return data || '';
}
async function request(action, payload = {}, authRequired = true) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(authRequired && getInitData() ? { 'X-Telegram-Init-Data': getInitData() } : {}) },
    body: JSON.stringify({ action, ...payload })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Ошибка сервера (${response.status})`);
  return result;
}
export const bootstrap = () => request('bootstrap');
export const saveProfile = profile => request('save-profile', { profile });
export const loadProfileByUsername = username => request('public-profile', { username }, false);
export async function uploadImage(file, field) {
  const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('Не удалось прочитать файл')); reader.readAsDataURL(file); });
  return request('upload-image', { field, dataUrl });
}
export const ownerUpdateUser = ({ targetId, role, badges }) =>
  request('owner-update', { targetId, ...(role !== undefined ? { role } : {}), ...(badges !== undefined ? { badges } : {}) });
