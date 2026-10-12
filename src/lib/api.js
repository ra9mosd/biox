const endpoint = '/api/biox';
function getInitData() {
  const data = window.Telegram?.WebApp?.initData;
  if (!data) throw new Error('Открой BIOX через Telegram-бота, а не обычную вкладку браузера.');
  return data;
}
async function request(action, payload = {}) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Telegram-Init-Data': getInitData() },
    body: JSON.stringify({ action, ...payload })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Ошибка сервера (${response.status})`);
  return result;
}
export const bootstrap = () => request('bootstrap');
export const saveProfile = profile => request('save-profile', { profile });
export const loadProfileByUsername = username => request('public-profile', { username });
export const ownerUpdateUser = ({ targetId, role, badges }) =>
  request('owner-update', { targetId, ...(role !== undefined ? { role } : {}), ...(badges !== undefined ? { badges } : {}) });
