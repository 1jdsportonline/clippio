/**
 * Transcription service.
 *
 * MOCKED: returns a fabricated transcript with timestamps so the rest of the
 * pipeline (clip detection, captions) has realistic data to work with.
 *
 * TO GO LIVE: replace the body of `transcribeVideo` with a call to a real
 * speech-to-text provider (e.g. Whisper API, AssemblyAI, Deepgram) using
 * TRANSCRIPTION_API_KEY from the environment. Keep the same return shape
 * ({ segments: [{ start, end, text }] }) so nothing downstream has to change.
 */

const SAMPLE_LINES = [
  "So the first thing people get wrong is they try to do everything at once.",
  "I didn't believe it either until I tried it myself for thirty days straight.",
  "Nobody tells you this before you start, and it changes everything.",
  "Here's the part almost everyone skips, and it's the most important one.",
  "This took me about three years to actually figure out on my own.",
  "Stop doing this immediately if you want to see real results.",
  "Wait for it, because the ending is not what you'd expect.",
  "This one shift completely changed how I approach the whole process.",
];

export async function transcribeVideo(sourceDurationSeconds = 900) {
  // MOCK — see note above.
  const segments = [];
  let t = 0;
  let i = 0;
  while (t < sourceDurationSeconds) {
    const len = 8 + Math.floor(Math.random() * 12);
    segments.push({
      start: t,
      end: Math.min(sourceDurationSeconds, t + len),
      text: SAMPLE_LINES[i % SAMPLE_LINES.length],
    });
    t += len;
    i += 1;
  }
  return { segments };
}
