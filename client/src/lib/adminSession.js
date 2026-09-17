const ADMIN_TOKEN_KEY = "glowifyAdminToken";
const ADMIN_PROFILE_KEY = "glowifyAdminProfile";

export function getAdminSession() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  const profileRaw = localStorage.getItem(ADMIN_PROFILE_KEY);
  return {
    token,
    admin: profileRaw ? JSON.parse(profileRaw) : null
  };
}

export function saveAdminSession(token, admin) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(admin));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_PROFILE_KEY);
}
