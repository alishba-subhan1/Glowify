export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function apiFetch(path, options = {}, token) {
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...(options.headers || {})
      },
      ...options
    });
  } catch (err) {
    const msg = String(err?.message || err);
    if (msg === "Failed to fetch" || err?.name === "TypeError") {
      throw new Error(
        `Cannot reach API at ${API_URL}. Start the Glowify server (${path}) and set VITE_API_URL in client/.env if needed.`
      );
    }
    throw new Error(msg || "Network error");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const parts = [data.message, data.error].filter(Boolean);
    const detail = parts.length ? parts.join(" — ") : `Request failed (${response.status})`;
    throw new Error(detail);
  }
  return data;
}
