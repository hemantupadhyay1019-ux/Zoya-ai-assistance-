import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Search,
  ExternalLink,
  X,
  Music,
  Tv,
  Radio,
  Sparkles,
  Volume2,
  Share2,
  Check,
  Disc3,
  Layers,
} from "lucide-react";

interface YouTubeModalProps {
  initialQuery?: string;
  onClose: () => void;
}

interface PresetTrack {
  id: string;
  title: string;
  artist: string;
  category: "trending" | "lofi" | "bollywood" | "coding" | "global";
  query: string;
  embedId?: string;
}

const PRESET_TRACKS: PresetTrack[] = [
  {
    id: "lofi-1",
    title: "Lofi Hip Hop Radio - Beats to Relax/Study",
    artist: "Lofi Girl",
    category: "lofi",
    query: "lofi hip hop radio beats to relax study",
    embedId: "jfKfPfyJRdk",
  },
  {
    id: "arijit-1",
    title: "Best of Arijit Singh - Romantic Melody Mix",
    artist: "Arijit Singh",
    category: "bollywood",
    query: "best of arijit singh songs romantic mix",
  },
  {
    id: "kesariya-1",
    title: "Kesariya - Brahmāstra",
    artist: "Arijit Singh, Pritam",
    category: "bollywood",
    query: "Kesariya Brahmastra song audio",
  },
  {
    id: "synth-1",
    title: "Synthwave / Cyberpunk Chill Coding Beats",
    artist: "RetroWave Radio",
    category: "coding",
    query: "synthwave coding radio 24 7 beats to hack to",
  },
  {
    id: "sidhu-1",
    title: "Sidhu Moosewala - Top Punjabi Hits",
    artist: "Sidhu Moosewala",
    category: "trending",
    query: "Sidhu Moosewala greatest hits audio",
  },
  {
    id: "coke-1",
    title: "Coke Studio Best Hits & Sufi Melodies",
    artist: "Coke Studio",
    category: "trending",
    query: "Coke Studio best songs playlist",
  },
  {
    id: "global-1",
    title: "Global Top Hits & Billboard 50",
    artist: "Various Artists",
    category: "global",
    query: "Top billboard 50 global hit songs 2026",
  },
  {
    id: "react-1",
    title: "React & Modern Web Development Masterclass",
    artist: "Tech Code Academy",
    category: "coding",
    query: "learn React typescript full stack web development",
  },
];

export const YouTubeModal: React.FC<YouTubeModalProps> = ({
  initialQuery = "Arijit Singh songs",
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery || "Arijit Singh songs");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [copied, setCopied] = useState(false);
  const [activeEmbedId, setActiveEmbedId] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      setActiveQuery(initialQuery);
      
      const foundPreset = PRESET_TRACKS.find(
        (t) => t.query.toLowerCase() === initialQuery.toLowerCase() || t.title.toLowerCase().includes(initialQuery.toLowerCase())
      );
      if (foundPreset?.embedId) {
        setActiveEmbedId(foundPreset.embedId);
      } else {
        setActiveEmbedId(null);
      }
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setActiveQuery(searchQuery.trim());
    
    const foundPreset = PRESET_TRACKS.find(
      (t) => t.query.toLowerCase() === searchQuery.toLowerCase() || t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (foundPreset?.embedId) {
      setActiveEmbedId(foundPreset.embedId);
    } else {
      setActiveEmbedId(null);
    }
  };

  const selectTrack = (track: PresetTrack) => {
    setSearchQuery(track.query);
    setActiveQuery(track.query);
    if (track.embedId) {
      setActiveEmbedId(track.embedId);
    } else {
      setActiveEmbedId(null);
    }
  };

  const openDirectYouTube = () => {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(activeQuery)}`;
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.warn("Could not open new window:", e);
    }
  };

  const copyYouTubeLink = () => {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(activeQuery)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTracks = PRESET_TRACKS.filter((t) => {
    if (activeCategory === "all") return true;
    return t.category === activeCategory;
  });

  const embedSrc = activeEmbedId
    ? `https://www.youtube-nocookie.com/embed/${activeEmbedId}?autoplay=1&rel=0`
    : `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(activeQuery)}&autoplay=1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0b0f1a] border border-red-500/30 rounded-3xl shadow-[0_0_80px_rgba(239,68,68,0.25)] overflow-hidden z-10 text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-red-500/20 bg-gradient-to-r from-red-950/40 via-zinc-950/80 to-[#0b0f1a] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
              <Tv size={20} className="text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-mono text-white tracking-wide flex items-center gap-2">
                  <span>ZOYA YOUTUBE PLAYER</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-mono uppercase tracking-wider font-bold">
                    LIVE
                  </span>
                </h2>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Stream videos, search songs & execute voice commands for Hemant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openDirectYouTube}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-mono font-medium transition-all cursor-pointer"
              title="Open current search directly on YouTube website"
            >
              <ExternalLink size={13} />
              <span>Open on YouTube.com</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Close YouTube modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-zinc-950/60 border-b border-white/10 shrink-0">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <Search size={16} className="absolute left-3.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any song, artist, video or tutorial (e.g. Arijit Singh, Lofi Beats, Python)..."
                className="w-full bg-[#111625] border border-white/15 focus:border-red-500/60 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-900/30 cursor-pointer shrink-0 transition-transform active:scale-95"
            >
              <Search size={14} />
              <span>Search</span>
            </button>
          </form>

          {/* Quick Categories Bar */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: "all", label: "All Curated", icon: Sparkles },
              { id: "bollywood", label: "Bollywood Hits", icon: Music },
              { id: "lofi", label: "Lofi & Study", icon: Radio },
              { id: "coding", label: "Coding & Synth", icon: Layers },
              { id: "trending", label: "Trending 2026", icon: Disc3 },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    activeCategory === cat.id
                      ? "bg-red-500/20 border border-red-500/50 text-red-300 shadow-sm"
                      : "bg-white/5 border border-white/5 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Icon size={12} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body: Two Column / Responsive Layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Video Player Screen Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {/* Embedded Player Box */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-red-500/30 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center justify-center">
              <iframe
                key={embedSrc}
                src={embedSrc}
                title="YouTube Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-none"
              />
            </div>

            {/* Now Playing Banner & Control Actions */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold">
                      ACTIVE YOUTUBE STREAM
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                    "{activeQuery}"
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    Streaming via YouTube Embedded Engine
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={copyYouTubeLink}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Copy YouTube Search Link"
                  >
                    {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                  </button>
                  <button
                    onClick={openDirectYouTube}
                    className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 hover:text-white transition-colors cursor-pointer"
                    title="Open in YouTube Tab / App"
                  >
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>

              {/* Action Buttons for Mobile/Iframe */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                <button
                  onClick={openDirectYouTube}
                  className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-red-900/30"
                >
                  <Play size={13} fill="currentColor" />
                  <span>Launch in YouTube</span>
                </button>
                <button
                  onClick={() => {
                    const random = PRESET_TRACKS[Math.floor(Math.random() * PRESET_TRACKS.length)];
                    selectTrack(random);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 font-mono text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Disc3 size={13} />
                  <span>Shuffle Playlist</span>
                </button>
              </div>
            </div>
          </div>

          {/* Preset Playlist / Quick Suggestions Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Music size={13} className="text-red-400" />
                <span>Featured Tracks & Quick Play</span>
              </h4>
              <span className="text-[10px] font-mono text-zinc-500">
                {filteredTracks.length} tracks
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[360px] pr-1">
              {filteredTracks.map((track) => {
                const isCurrent =
                  activeQuery.toLowerCase() === track.query.toLowerCase() ||
                  activeEmbedId === track.embedId;
                return (
                  <button
                    key={track.id}
                    onClick={() => selectTrack(track)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer group ${
                      isCurrent
                        ? "bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        : "bg-[#111625]/60 hover:bg-[#151c30] border-white/5 hover:border-white/15"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isCurrent
                          ? "bg-red-500 text-white shadow-md shadow-red-500/40"
                          : "bg-white/5 text-zinc-400 group-hover:text-white"
                      }`}
                    >
                      {isCurrent ? <Volume2 size={16} className="animate-pulse" /> : <Play size={14} fill="currentColor" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-medium truncate ${
                          isCurrent ? "text-red-200 font-semibold" : "text-white group-hover:text-red-300"
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">
                        {track.artist}
                      </p>
                    </div>

                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-zinc-400 shrink-0">
                      {track.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-5 py-3 border-t border-white/10 bg-zinc-950/80 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs">💡</span>
            <span>Say: <strong className="text-zinc-200">"play Arijit Singh on YouTube"</strong> or <strong className="text-zinc-200">"open youtube"</strong> anytime!</span>
          </div>
          <button
            onClick={openDirectYouTube}
            className="text-red-400 hover:text-red-300 underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Direct Web Link</span>
            <ExternalLink size={11} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
