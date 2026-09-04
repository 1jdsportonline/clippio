import { Router } from "express";
import multer from "multer";
import { supabase } from "../config/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { processVideo } from "../services/videoProcessing.js";

export const projectsRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 * 1024 } }); // 2GB

projectsRouter.get("/", requireAuth, async (req, res) => {
  if (!supabase) return res.status(501).json({ error: "Supabase not configured" });
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ projects: data });
});

/**
 * Upload a source video, create its project row, and kick off processing.
 * The actual file bytes are streamed to Supabase Storage; the AI pipeline
 * (transcription / clip detection) is mocked — see src/services/.
 */
projectsRouter.post("/upload", requireAuth, upload.single("video"), async (req, res) => {
  if (!supabase) return res.status(501).json({ error: "Supabase not configured" });
  if (!req.file) return res.status(400).json({ error: "No video file provided" });

  // Enforce monthly usage limit before accepting the upload.
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", req.user.id).single();
  const { data: limit } = await supabase.from("plan_limits").select("*").eq("plan", profile?.plan || "free").single();
  if (profile && limit && profile.videos_used_this_period >= limit.monthly_videos) {
    return res.status(403).json({ error: `Monthly limit reached for the ${profile.plan} plan` });
  }

  const path = `${req.user.id}/${Date.now()}-${req.file.originalname}`;
  const { error: uploadError } = await supabase.storage
    .from(process.env.VIDEO_STORAGE_BUCKET || "clippio-uploads")
    .upload(path, req.file.buffer, { contentType: req.file.mimetype });
  if (uploadError) return res.status(500).json({ error: uploadError.message });

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: req.user.id,
      name: req.file.originalname.replace(/\.[^/.]+$/, ""),
      source_video_url: path,
      status: "processing",
      processing_stage: "uploading",
    })
    .select()
    .single();
  if (projectError) return res.status(500).json({ error: projectError.message });

  await supabase
    .from("profiles")
    .update({ videos_used_this_period: (profile?.videos_used_this_period || 0) + 1 })
    .eq("id", req.user.id);

  // Kick off processing without blocking the response — the frontend polls
  // GET /projects/:id (or subscribes via Supabase realtime) for stage updates.
  processVideo({ projectId: project.id, userId: req.user.id, sourceDurationSeconds: 900 }).catch((err) =>
    console.error(`[processVideo] project ${project.id} failed:`, err)
  );

  res.status(202).json({ project });
});

projectsRouter.get("/:id", requireAuth, async (req, res) => {
  if (!supabase) return res.status(501).json({ error: "Supabase not configured" });
  const { data, error } = await supabase
    .from("projects")
    .select("*, clips(*)")
    .eq("id", req.params.id)
    .eq("user_id", req.user.id)
    .single();
  if (error) return res.status(404).json({ error: "Project not found" });
  res.json({ project: data });
});
