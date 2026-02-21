import { AnimatePresence, motion } from "framer-motion";
import StationBlogModule from "./modules/StationBlogModule";
import StationPhotoModule from "./modules/StationPhotoModule";
import StationAudioModule from "./modules/StationAudioModule";
import StationVideoModule from "./modules/StationVideoModule";
import type { StationMode } from "./types";

type StationViewportProps = {
  mode: StationMode;
};

type ViewportCard = {
  title: string;
  description: string;
};

type ViewportConfig = {
  title: string;
  subtitle: string;
  cards: ViewportCard[];
};

const VIEWPORT_CONTENT: Record<StationMode, ViewportConfig> = {
  idle: {
    title: "Station Idle",
    subtitle: "Select a mode to start browsing media sections.",
    cards: [
      { title: "Projects", description: "View active and archived work." },
      { title: "Photo", description: "Open albums and recent shots." },
      { title: "Video", description: "Browse uploaded videos." },
    ],
  },
  projects: {
    title: "Projects Feed",
    subtitle: "Project cards and statuses are shown in this viewport.",
    cards: [
      { title: "Current Build", description: "Status: In progress" },
      { title: "Archive", description: "Past launches and documentation" },
      { title: "Roadmap", description: "Planned milestones and next actions" },
    ],
  },
  photo: {
    title: "Photo Grid",
    subtitle: "Album thumbnails and highlighted photos.",
    cards: [
      { title: "Recent Album", description: "Most recently published set" },
      { title: "Favorites", description: "Pinned and liked photos" },
      { title: "Collections", description: "Thematic photo groups" },
    ],
  },
  video: {
    title: "Video Rack",
    subtitle: "Video list with quick metadata.",
    cards: [
      { title: "Latest Upload", description: "Newest published video" },
      { title: "Popular", description: "Top viewed entries" },
      { title: "Playlists", description: "Curated watch sets" },
    ],
  },
  audio: {
    title: "Audio Bay",
    subtitle: "Published music posts and playback controls.",
    cards: [
      { title: "Now Playing", description: "Select a track to start playback." },
      { title: "Queue", description: "Track selection list is loaded from posts." },
      { title: "Library", description: "MUSIC posts with linked media files." },
    ],
  },
  blog: {
    title: "Blog Stream",
    subtitle: "Posts, drafts, and recent updates.",
    cards: [
      { title: "Latest Post", description: "Most recent publication slot" },
      { title: "Drafts", description: "Pending article revisions" },
      { title: "Topics", description: "Main article categories" },
    ],
  },
};

export default function StationViewport({ mode }: StationViewportProps) {
  const content = VIEWPORT_CONTENT[mode];

  return (
    <section className="mb-3 rounded-lg border border-[#1a4028] bg-[#050b07] p-3">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {mode === "photo" ? (
            <StationPhotoModule />
          ) : mode === "video" ? (
            <StationVideoModule />
          ) : mode === "audio" ? (
            <StationAudioModule />
          ) : mode === "blog" ? (
            <StationBlogModule />
          ) : (
            <>
              <div className="mb-3 border-b border-[#1a4028] pb-2">
                <h2 className="text-lg font-semibold tracking-wide text-[#9ef6b2]">{content.title}</h2>
                <p className="text-sm text-[#8bc99b]">{content.subtitle}</p>
              </div>

              <div className="grid gap-2 md:grid-cols-3">
                {content.cards.map((card) => (
                  <article key={card.title} className="rounded-md border border-[#275636] bg-[#09120d] p-3">
                    <h3 className="text-sm font-semibold text-[#b4fdc3]">{card.title}</h3>
                    <p className="mt-1 text-xs text-[#8ec99c]">{card.description}</p>
                  </article>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
