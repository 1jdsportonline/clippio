import { supabase } from "../config/supabase.js";

/**
 * Verifies the Supabase JWT sent from the frontend (Authorization: Bearer <token>)
 * and attaches the authenticated user to req.user.
 *
 * The frontend gets this token from supabase-js after sign in / sign up —
 * the backend never handles raw passwords itself.
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing bearer token" });
  }
  if (!supabase) {
    return res.status(501).json({ error: "Supabase is not configured on the server yet" });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  req.user = data.user;
  req.accessToken = token;
  next();
}
