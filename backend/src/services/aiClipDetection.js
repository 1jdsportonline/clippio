/**
 * AI clip detection service.
 *
 * MOCKED: scores transcript segments with a random-but-plausible "interest
 * score" and stitches the highest-scoring stretches into clip candidates.
 *
 * TO GO LIVE: replace `findKeyMoments` with a call to an LLM (e.g. the
 * Anthropic API) prompted with the transcript to identify hooky, self-
 * contained moments, or a purpose-built highlight-detection model. Keep the
 * same return shape so the route layer doesn't need to change.
 */

const HOOK_TITLES = [
  "The ONE mistake everyone makes…",
  "This completely changed my workflow.",
  "You won't believe what happened next.",
  "Nobody tells you this before you start.",
  "I tried it for 30 days. Here's what happened.",
  "This is why your first attempt always fails.",
  "The part everyone skips (don't).",
  "Wait for the ending.",
  "This took me 3 years to figure out.",
  "Stop doing this immediately.",
];

export async function findKeyMoments(transcript, { clipCount = 10 } = {}) {
  // MOCK — see note above.
  const segments = transcript.segments;
  const candidates = [];

  for (let i = 0; i < clipCount && i < HOOK_TITLES.length; i++) {
    const seg = segments[Math.floor((segments.length / clipCount) * i)] || segments[0];
    const start = seg.start;
    const duration = 22 + Math.floor(Math.random() * 45);
    candidates.push({
      title: HOOK_TITLES[i],
      start,
      end: start + duration,
      score: 71 + Math.floor(Math.random() * 27),
    });
  }

  return candidates;
}
