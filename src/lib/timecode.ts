/**
 * The Experience timeline's cosmetic timecode (PRD §5.11): 15 "seconds" per
 * clip, not a clock. Shared by the ruler (ExperienceTrack.astro) and the
 * monitor frames (ExperienceFrame.astro), which wrote it out separately
 * until increment 32.
 */
export const timecode = (index: number): string => `00:00:${String(index * 15).padStart(2, "0")}:00`;
