/**
 * The skills graph's content (PRD §5.6, increment 31): one centre, eight
 * hubs, every skill a leaf of its hub. Items are the owner's, verbatim —
 * the dev-side lists of the retired skill tree and the video-editing list
 * of the retired constellation, merged in increment 31, then revised by the
 * owner at review: Video editing trimmed to five ("Premiere" is now
 * "Premiere Pro"; Canva moved to Tools), GPT-6 Astra dropped, Tools and
 * Platforms extended, and AWS, Flutter and FastAPI moved to Currently
 * learning. Names exactly as the owner wrote them.
 *
 * `tone` names a --word-* colour (or `heading`, the off-white). Owner's
 * mapping: five categories take the five palette colours; Tools and Cloud
 * are off-white and sit opposite each other on the ring so they never read
 * as one cluster. The centre is off-white too, and
 * Currently learning is off-white, dashed and dimmed (the .planned rule).
 * `hubs` is in the owner's order — the list, the keyboard and screen
 * readers follow it (the tree's six and Currently learning, then Video
 * editing); `ring` is only where each hub sits in the graph.
 */

export type Tone = "amber" | "sky" | "mint" | "periwinkle" | "coral" | "heading";

export interface Hub {
  name: string;
  tone: Tone;
  items: string[];
  /** Currently learning: dashed links and rings, dimmed. */
  learning?: boolean;
}

export const hubs: Hub[] = [
  { name: "Languages", tone: "amber", items: ["C", "Python", "Java", "HTML", "CSS", "JavaScript", "TypeScript", "Dart"] },
  { name: "Frameworks", tone: "sky", items: ["Astro", "React", "Next.js", "Node.js", "Django", "Tailwind CSS", "Vite"] },
  { name: "AI", tone: "periwinkle", items: ["Claude", "Claude Code", "Gemini", "Codex", "Ollama", "Open Router"] },
  { name: "Tools", tone: "heading", items: ["Notion", "Figma", "Canva", "Obsidian", "Stitch", "Claude Design"] },
  { name: "Platforms", tone: "mint", items: ["Supabase", "Firebase", "Vercel", "Render", "Firecrawl"] },
  { name: "Cloud", tone: "heading", items: ["Google Cloud"] },
  {
    name: "Currently learning",
    tone: "heading",
    items: ["Docker", "Kubernetes", "AWS", "Flutter", "FastAPI"],
    learning: true,
  },
  { name: "Video editing", tone: "coral", items: ["DaVinci Resolve", "CapCut", "Premiere Pro", "After Effects", "Color Grading"] },
];

/** Where each hub sits on the graph's ring, clockwise from the top — a
 * layout choice, not content. Tools and Cloud (both off-white) take the
 * side axes, opposite each other, where a tall fan has the most room; the
 * three largest clusters and Currently learning the diagonals, where a fan
 * spreads in two directions; the five-skill Platforms and Video editing
 * the top and bottom. */
export const ring = ["Platforms", "Frameworks", "Cloud", "AI", "Video editing", "Languages", "Tools", "Currently learning"];

/** The CSS custom property a tone paints with. */
export const toneVar = (tone: Tone): string => (tone === "heading" ? "var(--heading)" : `var(--word-${tone})`);
