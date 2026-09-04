import { Router } from "express";
import { supabase } from "../config/supabase.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

/**
 * Sign-up/sign-in themselves are handled client-side by supabase-js
 * (supabase.auth.signUp / signInWithPassword) so the raw password never
 * transits our own server. This route just ensures a `profiles` row exists
 * for a newly authenticated user — call it once right after sign up.
 */
authRouter.post("/bootstrap-profile", requireAuth, async (req, res) => {
  if (!supabase) return res.status(501).json({ error: "Supabase not configured" });

  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: req.user.id, full_name: req.user.user_metadata?.full_name || null }, { onConflict: "id" })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ profile: data });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  if (!supabase) return res.status(501).json({ error: "Supabase not configured" });

  const { data, error } = await supabase.from("profiles").select("*").eq("id", req.user.id).single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ profile: data });
});
