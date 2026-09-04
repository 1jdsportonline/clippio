import { supabase } from "../config/supabase.js";
import { transcribeVideo } from "./transcription.js";
import { findKeyMoments } from "./aiClipDetection.js";

/**
 * Orchestrates the full pipeline for one uploaded video:
 *   transcribe -> find key moments -> create clip rows -> (mock) render clips
 *
 * This mirrors the stages shown in the frontend's processing screen:
 * Uploading -> Transcribing -> Finding key moments -> Detecting speakers ->
 * Creating clips -> Generating captions -> Finalizing clips.
 *
 * MOCKED STEPS are explicitly labeled. Cropping/rendering the actual vertical
 * MP4s (smart cropping, burned-in captions, watermark) is not implemented —
 * that requires a real video-processing worker (e.g. ffmpeg on a job queue,
 * or a hosted API such as Shotstack/Remotion). Swap it in at the marked spot.
 */
export async function processVideo({ projectId, userId, sourceDurationSeconds }) {
  if (!supabase) throw new Error("Supabase not configured");

  await updateStage(projectId, "transcribing");
  const transcript = await transcribeVideo(sourceDurationSeconds); // MOCK

  await updateStage(projectId, "finding_key_moments");
  const moments = await findKeyMoments(transcript, { clipCount: 10 }); // MOCK

  await updateStage(projectId, "creating_clips");
  const clipRows = moments.map((m) => ({
    project_id: projectId,
    user_id: userId,
    title: m.title,
    start_seconds: m.start,
    end_seconds: m.end,
    score: m.score,
    aspect_ratio: "9:16",
    captions_enabled: true,
    // video_url intentionally left null — see note below.
  }));

  const { data: clips, error } = await supabase.from("clips").insert(clipRows).select();
  if (error) throw error;

  await updateStage(projectId, "generating_captions");
  // MOCK: in production, generate a captions.vtt/srt per clip from the
  // transcript segments overlapping [start, end] and store it, or burn
  // captions directly into the rendered video in the render step below.

  // ---- REAL RENDERING GOES HERE ----
  // This is the one step that cannot be meaningfully mocked with real media:
  // actually cutting `sourceVideoUrl` into vertical clips with ffmpeg (or a
  // hosted renderer), applying smart cropping, burning in captions, and
  // uploading the resulting files to storage, then setting each clip's
  // video_url + thumbnail_url. Until that's wired up, clips have metadata
  // only and no playable video_url.

  await updateStage(projectId, "ready");
  return clips;
}

async function updateStage(projectId, stage) {
  await supabase
    .from("projects")
    .update({ processing_stage: stage, status: stage === "ready" ? "ready" : "processing" })
    .eq("id", projectId);
}
