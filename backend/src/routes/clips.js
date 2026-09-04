import { Router } from "express";
import { supabase } from "../config/supabase.js";
import { requireAuth } from "../middleware/auth.js";

export const clipsRouter = Router();

clipsRouter.get("/", requireAuth, async (req, res) => {
  if (!supabase) return res.status(501).json({ error: "Supabase not configured" });
  const { data, error } = await supabase
    .from("clips")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ clips: data });
});

clipsRouter.patch("/:id", requireAuth, async (req, res) => {
  if (!supabase) return res.status(501).json({ error: "Supabase not configured" });
  const allowed = ["title", "start_seconds", "end_seconds", "aspect_ratio", "captions_enabled", "caption_style"];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

  const { data, error } = await supabase
    .from("clips")
    .update(updates)
    .eq("id", req.params.id)
    .eq("user_id", req.user.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ clip: data });
});

/**
 * Export/render a clip. MOCKED: real rendering (ffmpeg cut + smart crop +
 * burned-in captions + watermark) is not implemented — see the note in
 * src/services/videoProcessing.js. This returns a placeholder response so
 * the frontend flow completes end-to-end.
 */
clipsRouter.post("/:id/export", requireAuth, async (req, res) => {
  res.json({ status: "queued", message: "Export queued — rendering is mocked in this build." });
});
