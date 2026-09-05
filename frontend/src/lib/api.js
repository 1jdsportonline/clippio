import { supabase } from "./supabaseClient.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function authHeaders() {
  const { data } = supabase ? await supabase.auth.getSession() : { data: {} };
  const token = data?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: await authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function apiPatch(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function uploadVideo(file) {
  const form = new FormData();
  form.append("video", file);
  const res = await fetch(`${BASE_URL}/api/projects/upload`, {
    method: "POST",
    headers: await authHeaders(),
    body: form,
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}
