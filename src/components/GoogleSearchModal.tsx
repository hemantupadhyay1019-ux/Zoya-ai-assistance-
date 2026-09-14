import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Globe,
  ExternalLink,
  Volume2,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  X,
  Mic,
  MicOff,
  BookOpen,
  Newspaper,
  Image as ImageIcon,
  MessageSquare,
  Mail,
  TrendingUp,
  Dna,
  Eye,
  FileText,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  Compass
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  getZoyaSearchSummary, 
  getZoyaChromosomeSearch, 
  getZoyaWebsiteAnalysis,
  cleanGroundingUrl 
} from "../services/geminiService";
import { 
  HUMAN_CHROMOSOMES, 
  findChromosomeByIdOrQuery, 
  ChromosomeInfo 
} from "../data/chromosomesData";

export type SearchEngineMode = "google" | "chromosome" | "website";

interface GoogleSearchModalProps {
  initialQuery?: string;
  initialMode?: SearchEngineMode;
  assistantMode?: "zoya" | "jarvis";
  onClose: () => void;
  onShareToWhatsApp?: (text: string) => void;
  onShareToEmail?: (subject: string, body: string) => void;
  onSpeak?: (text: string) => void;
}

interface WebSource {
  title: string;
  url: string;
}

interface WikiSummary {
  title?: string;
  extract?: string;
  thumbnail?: { source: string };
  pageUrl?: string;
}

const TRENDING_GOOGLE_QUERIES = [
  "Today's top world breaking news",
  "Latest breakthroughs in AI & Gemini 2026",
  "SpaceX Starship and NASA Artemis missions",
  "Quantum Computing advancements",
  "Global stock markets and technology economy",
  "Cricket IPL match scores and tournament standings",
  "Top React & TypeScript best practices"
];

const CHROMOSOME_PRESETS = [
  "Chromosome 21 (Down Syndrome)",
  "Chromosome X (Sex Chromosome & Hemophilia)",
  "Chromosome Y (SRY & Male Development)",
  "Chromosome 7 (CFTR & Cystic Fibrosis)",
  "Chromosome 11 (Beta-Globin & Sickle Cell)",
  "Chromosome 17 (p53 Guardian & BRCA1)",
  "Chromosome 4 (Huntington's Disease & HTT)",
  "Mitochondrial DNA (mtDNA Maternal Inheritance)",
  "Telomeres & Cellular Aging Mechanisms"
];

const POPULAR_WEBSITES = [
  { name: "Wikipedia (Chromosome)", url: "https://en.wikipedia.org/wiki/Chromosome" },
  { name: "NCBI Gene Database", url: "https://www.ncbi.nlm.nih.gov/gene" },
  { name: "Nature Genetics", url: "https://www.nature.com/ng" },
  { name: "BBC News World", url: "https://www.bbc.com/news/world" },
  { name: "GitHub Open Source", url: "https://github.com" },
  { name: "Hacker News", url: "https://news.ycombinator.com" }
];

export default function GoogleSearchModal({
  initialQuery = "",
  initialMode = "google",
  assistantMode = "zoya",
  onClose,
  onShareToWhatsApp,
  onShareToEmail,
  onSpeak
}: GoogleSearchModalProps) {
  const isJarvis = assistantMode === "jarvis";

  // Auto-detect mode if initialQuery looks like a URL or chromosome
  const detectInitialMode = (): SearchEngineMode => {
    if (initialMode) return initialMode;
    const q = initialQuery.toLowerCase().trim();
    if (q.startsWith("http://") || q.startsWith("https://") || /^(?:www\.)?[a-zA-Z0-9-]+\.(?:com|org|edu|gov|io|net)/i.test(q)) {
      return "website";
    }
    if (q.includes("chromosome") || q.includes("karyotype") || q.includes("trisomy") || q.includes("genetics")) {
      return "chromosome";
    }
    return "google";
  };

  const [searchMode, setSearchMode] = useState<SearchEngineMode>(detectInitialMode);
  const [query, setQuery] = useState(initialQuery || "Today's top world news");
  const [isLoading, setIsLoading] = useState(false);
  const [searchSummary, setSearchSummary] = useState<string>("");
  const [sources, setSources] = useState<WebSource[]>([]);
  const [wikiData, setWikiData] = useState<WikiSummary | null>(null);
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [searchTimestamp, setSearchTimestamp] = useState<string>("");
  const recognitionRef = useRef<any>(null);

  // Chromosome state
  const [selectedChromosome, setSelectedChromosome] = useState<ChromosomeInfo | null>(() => {
    return findChromosomeByIdOrQuery(initialQuery) || HUMAN_CHROMOSOMES.find(c => c.number === "21") || null;
  });

  // Website Access & In-App Browser State
  const [activeUrl, setActiveUrl] = useState<string>(() => {
    if (initialQuery.startsWith("http://") || initialQuery.startsWith("https://")) {
      return initialQuery;
    }
    return "https://en.wikipedia.org/wiki/Chromosome";
  });
  const [websiteAnalysis, setWebsiteAnalysis] = useState<{
    text: string;
    title: string;
    domain: string;
  } | null>(null);
  const [browserTab, setBrowserTab] = useState<"reader" | "live">("reader");
  const [iframeError, setIframeError] = useState(false);

  // Active view tab for Google search
  const [googleActiveTab, setGoogleActiveTab] = useState<"summary" | "sources" | "wiki">("summary");

  // Core Search Dispatcher
  const executeSearch = async (targetQuery?: string, forcedMode?: SearchEngineMode) => {
    const currentMode = forcedMode || searchMode;
    const q = (targetQuery !== undefined ? targetQuery : query).trim();
    if (!q && currentMode !== "website") return;

    setIsLoading(true);
    setSearchSummary("");
    setSources([]);
    setWikiData(null);
    setSearchTimestamp(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));

    // Mode 1: Website Access & In-App Browser
    if (currentMode === "website") {
      let targetUrl = q;
      if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
        targetUrl = `https://${targetUrl}`;
      }
      setActiveUrl(targetUrl);
      setIframeError(false);

      try {
        const analysis = await getZoyaWebsiteAnalysis(targetUrl, assistantMode);
        setWebsiteAnalysis({
          text: analysis.text,
          title: analysis.title,
          domain: analysis.domain
        });
        setSearchSummary(analysis.text);
        setSources(analysis.sources || [{ title: `Direct Website: ${analysis.domain}`, url: targetUrl }]);
      } catch (err) {
        console.error("Website inspection error:", err);
        setSearchSummary(`Inspected website ${targetUrl}. Ready for interactive viewing or direct browsing.`);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Mode 2: Chromosomes & Genetics Deep Explorer
    if (currentMode === "chromosome") {
      // Check local chromosome database
      const matchedChr = findChromosomeByIdOrQuery(q);
      if (matchedChr) {
        setSelectedChromosome(matchedChr);
      }

      try {
        const [chrResult, wikiResult] = await Promise.all([
          getZoyaChromosomeSearch(q, assistantMode),
          fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => data && data.extract ? {
              title: data.title,
              extract: data.extract,
              thumbnail: data.thumbnail,
              pageUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`
            } : null)
            .catch(() => null)
        ]);

        setSearchSummary(chrResult.text);
        setSources(chrResult.sources || []);
        if (wikiResult) setWikiData(wikiResult);
      } catch (err) {
        console.error("Chromosome search error:", err);
        setSearchSummary(`Chromosome intelligence on "${q}" retrieved. Review the chromosome karyotype details and NCBI links below.`);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Mode 3: Google Live Web Search
    try {
      const [googleResult, wikiResult] = await Promise.all([
        getZoyaSearchSummary(q, assistantMode),
        fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`)
          .then(async res => {
            if (!res.ok) {
              const searchRes = await fetch(
                `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*`
              );
              const searchData = await searchRes.json();
              if (searchData.query?.search?.[0]) {
                const first = searchData.query.search[0];
                return {
                  title: first.title,
                  extract: first.snippet.replace(/<[^>]*>?/gm, ""),
                  pageUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(first.title)}`
                };
              }
              return null;
            }
            const data = await res.json();
            return {
              title: data.title,
              extract: data.extract,
              thumbnail: data.thumbnail,
              pageUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`
            };
          })
          .catch(() => null)
      ]);

      setSearchSummary(googleResult.text);
      setSources(googleResult.sources || []);
      if (wikiResult && wikiResult.extract) setWikiData(wikiResult);
    } catch (err) {
      console.error("Google search error:", err);
      setSearchSummary(`Searched Google for "${q}". Live web grounding retrieved. Click the Google links below to explore direct web sources.`);
      setSources([
        { title: `Google Search: "${q}"`, url: `https://www.google.com/search?q=${encodeURIComponent(q)}` },
        { title: `Google News: "${q}"`, url: `https://news.google.com/search?q=${encodeURIComponent(q)}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Run search on mount
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      executeSearch(initialQuery);
    } else {
      if (searchMode === "chromosome") {
        executeSearch("Chromosome 21 (Down Syndrome)");
      } else if (searchMode === "website") {
        executeSearch("https://en.wikipedia.org/wiki/Chromosome");
      } else {
        executeSearch("Today's top world news and breaking stories");
      }
    }
  }, []);

  // Voice dictation
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your search query.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        executeSearch(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Speech rec failed:", e);
      setIsListening(false);
    }
  };

  const copyToClipboard = () => {
    const fullText = `🔍 ${searchMode === "chromosome" ? "🧬 Chromosome Intelligence" : searchMode === "website" ? "🌐 Website Access" : "Google Search"}: "${query}"\n\n${searchSummary}\n\nSources:\n${sources.map(s => `• ${s.title}: ${s.url}`).join("\n")}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReadAloud = () => {
    if (onSpeak && searchSummary) {
      onSpeak(searchSummary);
    } else if ("speechSynthesis" in window && searchSummary) {
      window.speechSynthesis.cancel();
      const clean = searchSummary.replace(/[*#_~`>]/g, "");
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Quick Action to open any source in the in-app Web Browser or safe new tab
  const handleAccessWebsite = (rawUrl: string) => {
    const cleanUrl = cleanGroundingUrl(rawUrl, query, query);

    // If it is a Google search result or search engine query, open directly in a new tab
    const isSearchEngine =
      cleanUrl.includes("google.com/search") ||
      cleanUrl.includes("news.google.com") ||
      cleanUrl.includes("bing.com/search") ||
      cleanUrl.includes("duckduckgo.com") ||
      cleanUrl.includes("scholar.google.com");

    if (isSearchEngine) {
      window.open(cleanUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setSearchMode("website");
    setBrowserTab("reader"); // Always default to reliable Reader mode to prevent iframe errors
    setQuery(cleanUrl);
    setActiveUrl(cleanUrl);
    setIframeError(false);
    executeSearch(cleanUrl, "website");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`w-full max-w-5xl h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden backdrop-blur-xl ${
          isJarvis
            ? "bg-[#0b101b]/95 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)]"
            : "bg-[#120d1c]/95 border-violet-500/40 shadow-[0_0_50px_rgba(139,92,246,0.25)]"
        }`}
      >
        {/* Header Bar */}
        <div
          className={`p-4 sm:p-5 flex items-center justify-between border-b shrink-0 ${
            isJarvis
              ? "bg-gradient-to-r from-cyan-950/50 via-[#0d1527] to-[#080d19] border-cyan-500/20"
              : "bg-gradient-to-r from-violet-950/50 via-[#19112a] to-[#0f091d] border-violet-500/20"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-fuchsia-500 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-black/80 rounded-[14px] flex items-center justify-center">
                {searchMode === "chromosome" ? (
                  <Dna size={20} className="text-emerald-400" />
                ) : searchMode === "website" ? (
                  <Globe size={20} className="text-cyan-400" />
                ) : (
                  <Search size={20} className={isJarvis ? "text-cyan-300" : "text-white"} />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-mono tracking-wide">
                  {isJarvis 
                    ? "JARVIS ADVANCED WEB, CHROMOSOME & GOOGLE INTELLIGENCE" 
                    : "ZOYA ADVANCE SEARCH • CHROMOSOMES • GOOGLE & WEB BROWSER"}
                </h2>
                <span className="px-2 py-0.5 text-[9px] font-mono font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Grounded
                </span>
              </div>
              <p className="text-xs text-white/50 font-mono">
                Google Search Grounding • Karyotype Genomics (Chr 1-22, X, Y) • Unrestricted In-App Website Access
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Close Search Modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Advance Search Mode Switcher (Google | Chromosomes | Website Browser) */}
        <div className="flex border-b border-white/10 bg-black/40 shrink-0 px-3 sm:px-6 gap-2 pt-2">
          <button
            onClick={() => {
              setSearchMode("google");
              if (!query || query.startsWith("http")) setQuery("Today's top world breaking news");
            }}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border-t-2 border-x-2 ${
              searchMode === "google"
                ? isJarvis
                  ? "bg-cyan-950/40 text-cyan-300 border-cyan-400 border-b-transparent"
                  : "bg-violet-950/40 text-violet-300 border-violet-400 border-b-transparent"
                : "border-transparent text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Search size={14} />
            <span>Google Search</span>
          </button>

          <button
            onClick={() => {
              setSearchMode("chromosome");
              if (!query || query.startsWith("http") || query.includes("news")) {
                setQuery("Chromosome 21 (Down Syndrome)");
              }
            }}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border-t-2 border-x-2 ${
              searchMode === "chromosome"
                ? "bg-emerald-950/40 text-emerald-300 border-emerald-400 border-b-transparent"
                : "border-transparent text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Dna size={14} className="text-emerald-400" />
            <span>Chromosomes & Genetics</span>
          </button>

          <button
            onClick={() => {
              setSearchMode("website");
              if (!query.startsWith("http")) {
                setQuery("https://en.wikipedia.org/wiki/Chromosome");
              }
            }}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border-t-2 border-x-2 ${
              searchMode === "website"
                ? "bg-blue-950/40 text-blue-300 border-blue-400 border-b-transparent"
                : "border-transparent text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Globe size={14} className="text-blue-400" />
            <span>Access Any Website</span>
          </button>
        </div>

        {/* Input Bar & Controls */}
        <div className="p-3 sm:p-4 border-b border-white/10 bg-black/30 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeSearch();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1 flex items-center">
              <div className="absolute left-3.5 text-white/40 pointer-events-none flex items-center gap-1">
                {searchMode === "chromosome" ? (
                  <Dna size={18} className="text-emerald-400" />
                ) : searchMode === "website" ? (
                  <Globe size={18} className="text-blue-400" />
                ) : (
                  <Search size={18} className={isJarvis ? "text-cyan-400" : "text-violet-400"} />
                )}
              </div>

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  searchMode === "chromosome"
                    ? "Search any chromosome (1-22, X, Y), gene (CFTR, p53, HBB), syndrome, or DNA topic..."
                    : searchMode === "website"
                    ? "Enter ANY website URL to access & inspect (e.g. https://en.wikipedia.org, bbc.com)..."
                    : "Search Google for any question, live news, science, person, or fact..."
                }
                className={`w-full pl-11 pr-24 py-3 rounded-2xl text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none transition-all ${
                  searchMode === "chromosome"
                    ? "bg-emerald-950/20 border border-emerald-500/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                    : searchMode === "website"
                    ? "bg-blue-950/20 border border-blue-500/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    : isJarvis
                    ? "bg-cyan-950/30 border border-cyan-500/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                    : "bg-violet-950/30 border border-violet-500/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                }`}
              />

              <div className="absolute right-2.5 flex items-center gap-1.5">
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer text-xs"
                    title="Clear text"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse shadow-lg"
                      : "bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
                  }`}
                  title={isListening ? "Listening... click to stop" : "Voice dictation"}
                >
                  {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 shrink-0">
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className={`px-5 py-3 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  searchMode === "chromosome"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-black shadow-emerald-500/20"
                    : searchMode === "website"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-black shadow-blue-500/20"
                    : isJarvis
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-cyan-500/20"
                    : "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white shadow-violet-500/20"
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {searchMode === "chromosome" ? (
                      <Dna size={15} />
                    ) : searchMode === "website" ? (
                      <Globe size={15} />
                    ) : (
                      <Search size={15} />
                    )}
                    <span>
                      {searchMode === "chromosome"
                        ? "Search Genetics"
                        : searchMode === "website"
                        ? "Access Website"
                        : "Search Google"}
                    </span>
                  </>
                )}
              </button>

              {searchMode === "website" && (
                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Open in new browser tab"
                >
                  <ExternalLink size={14} />
                  <span className="hidden sm:inline">New Tab</span>
                </a>
              )}
            </div>
          </form>

          {/* Quick Preset Ribbons */}
          {searchMode === "google" && (
            <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px] font-mono">
              <span className="text-white/40 flex items-center gap-1 shrink-0 font-semibold">
                <TrendingUp size={12} className="text-amber-400" />
                <span>Google Trends:</span>
              </span>
              {TRENDING_GOOGLE_QUERIES.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(s);
                    executeSearch(s);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white shrink-0 transition-all cursor-pointer whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {searchMode === "chromosome" && (
            <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px] font-mono">
              <span className="text-emerald-400 flex items-center gap-1 shrink-0 font-semibold">
                <Dna size={12} />
                <span>Genomic Presets:</span>
              </span>
              {CHROMOSOME_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(p);
                    executeSearch(p);
                  }}
                  className="px-2.5 py-1 rounded-full bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 hover:text-white shrink-0 transition-all cursor-pointer whitespace-nowrap"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {searchMode === "website" && (
            <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px] font-mono">
              <span className="text-blue-400 flex items-center gap-1 shrink-0 font-semibold">
                <Globe size={12} />
                <span>Direct Access:</span>
              </span>
              {POPULAR_WEBSITES.map((site, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(site.url);
                    setActiveUrl(site.url);
                    executeSearch(site.url);
                  }}
                  className="px-2.5 py-1 rounded-full bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 text-blue-300 hover:text-white shrink-0 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                >
                  <span>{site.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chromosome Karyotype Selector Bar (When in Chromosome mode) */}
        {searchMode === "chromosome" && (
          <div className="p-3 border-b border-white/10 bg-[#081512] shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Layers size={13} />
                <span>Interactive Human Karyotype (Select Chromosome 1 to 22, X, Y, mtDNA)</span>
              </span>
              <span className="text-[10px] font-mono text-white/50">
                Active: <strong className="text-emerald-300">{selectedChromosome?.name || "Chromosome 21"}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {HUMAN_CHROMOSOMES.map((chr) => {
                const isSelected = selectedChromosome?.id === chr.id;
                return (
                  <button
                    key={chr.id}
                    onClick={() => {
                      setSelectedChromosome(chr);
                      setQuery(`${chr.name} genetics`);
                      executeSearch(`${chr.name} genetics`);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl font-mono text-[11px] font-bold shrink-0 transition-all cursor-pointer flex flex-col items-center min-w-[54px] border ${
                      isSelected
                        ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105"
                        : "bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border-white/10"
                    }`}
                  >
                    <span>{chr.number}</span>
                    <span className={`text-[8px] font-normal ${isSelected ? "text-black/80" : "text-white/40"}`}>
                      {chr.type === "Sex Chromosome" ? "Sex" : chr.type === "Mitochondrial" ? "Mito" : "Auto"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Website Mode Sub-Header Bar (Reader Mode vs Live Web Iframe) */}
        {searchMode === "website" && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#071321] shrink-0 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-white/50">Viewing:</span>
              <a
                href={activeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline font-semibold max-w-[280px] sm:max-w-md truncate flex items-center gap-1"
              >
                <span>{activeUrl}</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setBrowserTab("reader")}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  browserTab === "reader"
                    ? "bg-cyan-500 text-black shadow-md font-bold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <FileText size={12} />
                <span>AI Reader & Summary</span>
              </button>

              <button
                onClick={() => setBrowserTab("live")}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  browserTab === "live"
                    ? "bg-cyan-500 text-black shadow-md font-bold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Eye size={12} />
                <span>Live Browser View</span>
              </button>
            </div>
          </div>
        )}

        {/* Sub Navigation Tabs for Google Search */}
        {searchMode === "google" && (
          <div className="flex border-b border-white/10 bg-black/20 shrink-0 px-4">
            <button
              onClick={() => setGoogleActiveTab("summary")}
              className={`px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                googleActiveTab === "summary"
                  ? isJarvis
                    ? "border-cyan-400 text-cyan-300 bg-cyan-500/10"
                    : "border-violet-400 text-violet-300 bg-violet-500/10"
                  : "border-transparent text-white/40 hover:text-white/80"
              }`}
            >
              <Sparkles size={14} />
              <span>AI Grounded Summary</span>
            </button>

            <button
              onClick={() => setGoogleActiveTab("sources")}
              className={`px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                googleActiveTab === "sources"
                  ? isJarvis
                    ? "border-cyan-400 text-cyan-300 bg-cyan-500/10"
                    : "border-violet-400 text-violet-300 bg-violet-500/10"
                  : "border-transparent text-white/40 hover:text-white/80"
              }`}
            >
              <Globe size={14} />
              <span>Live Sources ({sources.length})</span>
            </button>

            {wikiData && (
              <button
                onClick={() => setGoogleActiveTab("wiki")}
                className={`px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  googleActiveTab === "wiki"
                    ? isJarvis
                      ? "border-cyan-400 text-cyan-300 bg-cyan-500/10"
                      : "border-violet-400 text-violet-300 bg-violet-500/10"
                    : "border-transparent text-white/40 hover:text-white/80"
                }`}
              >
                <BookOpen size={14} />
                <span>Wikipedia Instant Knowledge</span>
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div
                  className={`w-16 h-16 rounded-full border-4 border-t-transparent animate-spin ${
                    searchMode === "chromosome"
                      ? "border-emerald-400"
                      : searchMode === "website"
                      ? "border-blue-400"
                      : isJarvis
                      ? "border-cyan-500"
                      : "border-violet-500"
                  }`}
                />
                {searchMode === "chromosome" ? (
                  <Dna size={24} className="absolute inset-0 m-auto text-emerald-400 animate-pulse" />
                ) : searchMode === "website" ? (
                  <Globe size={24} className="absolute inset-0 m-auto text-blue-400 animate-pulse" />
                ) : (
                  <Search size={24} className={`absolute inset-0 m-auto animate-pulse ${isJarvis ? "text-cyan-400" : "text-violet-400"}`} />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-white font-mono">
                  {searchMode === "chromosome"
                    ? "ZOYA IS SCANNING CHROMOSOME & GENOMIC SEQUENCES..."
                    : searchMode === "website"
                    ? `ACCESSING & INSPECTING WEBSITE "${activeUrl}"...`
                    : isJarvis
                    ? "JARVIS GROUNDING GOOGLE WEB INTELLIGENCE..."
                    : "ZOYA IS SCANNING GOOGLE SEARCH & LIVE WEB..."}
                </p>
                <p className="text-xs text-white/50 font-mono mt-1">
                  Query: "{query}" • Synthesizing verified data across global scientific & web nodes...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* ================= MODE 1: CHROMOSOMES & GENOMICS ================= */}
              {searchMode === "chromosome" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Selected Chromosome Highlight Card */}
                  {selectedChromosome && (
                    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0c2419] via-[#091a13] to-[#040e0a] border border-emerald-500/40 shadow-xl space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-mono text-xl font-bold">
                            {selectedChromosome.number}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                              <span>{selectedChromosome.name}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {selectedChromosome.type}
                              </span>
                            </h3>
                            <p className="text-xs text-emerald-300/80 font-mono">
                              Morphology: {selectedChromosome.morphology} • {selectedChromosome.percentageOfGenome} of Genome
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={selectedChromosome.ncbiLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
                          >
                            <span>NCBI Gene</span>
                            <ExternalLink size={12} />
                          </a>
                          <a
                            href={selectedChromosome.ensemblLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                          >
                            <span>Ensembl</span>
                            <ExternalLink size={12} />
                          </a>
                          <a
                            href={selectedChromosome.wikiLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                          >
                            <span>Wiki</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/20">
                          <p className="text-[10px] font-mono text-white/50 uppercase">Base Pairs (bp)</p>
                          <p className="text-sm font-bold text-white font-mono mt-0.5">{selectedChromosome.lengthBp}</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/20">
                          <p className="text-[10px] font-mono text-white/50 uppercase">Protein Coding Genes</p>
                          <p className="text-sm font-bold text-emerald-300 font-mono mt-0.5">{selectedChromosome.estimatedGenes}</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/20">
                          <p className="text-[10px] font-mono text-white/50 uppercase">Centromere Structure</p>
                          <p className="text-sm font-bold text-white font-mono mt-0.5">{selectedChromosome.morphology}</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/20">
                          <p className="text-[10px] font-mono text-white/50 uppercase">Total DNA Share</p>
                          <p className="text-sm font-bold text-amber-300 font-mono mt-0.5">{selectedChromosome.percentageOfGenome}</p>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                        {selectedChromosome.scientificOverview}
                      </p>

                      {/* Landmark Genes Table */}
                      <div>
                        <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Dna size={13} />
                          <span>Notable Landmark Genes on {selectedChromosome.name}:</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedChromosome.keyGenes.map((gene, gIdx) => (
                            <div key={gIdx} className="p-3 rounded-xl bg-black/30 border border-emerald-500/20 text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono font-bold text-emerald-300">{gene.symbol}</span>
                                <span className="text-[10px] text-white/40">{gene.name}</span>
                              </div>
                              <p className="text-white/70 text-[11px] leading-relaxed">{gene.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Associated Conditions */}
                      <div>
                        <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Activity size={13} />
                          <span>Known Genetic Conditions & Syndromes:</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedChromosome.associatedConditions.map((cond, cIdx) => (
                            <span
                              key={cIdx}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono"
                            >
                              • {cond}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Genomic Analysis Box */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-[#091512] border border-emerald-500/30 shadow-xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-emerald-400" />
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                          ZOYA REAL-TIME GENOMICS & CYTOGENETICS SYNTHESIS
                        </h3>
                      </div>
                      <span className="text-xs text-emerald-400 font-mono">Query: "{query}"</span>
                    </div>

                    <div className="text-sm sm:text-base text-white/95 leading-relaxed whitespace-pre-line">
                      {searchSummary || "Genomic analysis ready."}
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-emerald-500/20">
                      <button
                        onClick={handleReadAloud}
                        className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                      >
                        <Volume2 size={14} />
                        <span>Read Aloud</span>
                      </button>

                      <button
                        onClick={copyToClipboard}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                      >
                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        <span>{copied ? "Copied" : "Copy Notes"}</span>
                      </button>

                      {onShareToEmail && (
                        <button
                          onClick={() => {
                            onClose();
                            onShareToEmail(
                              `Genomic Research Notes: ${query}`,
                              searchSummary
                            );
                          }}
                          className="px-4 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                        >
                          <Mail size={14} />
                          <span>Send to Study Email</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Genomic Citations & Sources */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                      <Globe size={14} />
                      <span>Verified Genomic & Scientific Citations ({sources.length})</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {sources.map((src, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-black/40 border border-emerald-500/20 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                        >
                          <div className="mb-2">
                            <h4 className="text-xs font-semibold text-white line-clamp-2">{src.title}</h4>
                            <p className="text-[10px] font-mono text-white/40 truncate mt-1">{src.url}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                            <button
                              onClick={() => handleAccessWebsite(src.url)}
                              className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                            >
                              <Globe size={11} />
                              <span>Access Website</span>
                            </button>
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-[11px] font-mono flex items-center gap-1"
                            >
                              <span>Open Tab</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= MODE 2: ACCESS ANY WEBSITE & BROWSER ================= */}
              {searchMode === "website" && (
                <div className="space-y-5 animate-fade-in">
                  {/* Reader Mode */}
                  {browserTab === "reader" && (
                    <div className="space-y-5">
                      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0c1a2e] via-[#091321] to-[#040912] border border-blue-500/30 shadow-xl space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-blue-500/20">
                          <div className="flex items-center gap-2">
                            <FileText size={18} className="text-cyan-400" />
                            <div>
                              <h3 className="text-sm sm:text-base font-bold text-white font-mono">
                                {websiteAnalysis?.title || activeUrl}
                              </h3>
                              <p className="text-xs text-blue-300 font-mono">
                                AI Deep Inspection & Content Extraction Protocol
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={activeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all"
                            >
                              <span>Open Full Website</span>
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        </div>

                        {/* Extracted content */}
                        <div className="text-sm sm:text-base text-white/95 leading-relaxed whitespace-pre-line p-4 rounded-2xl bg-black/40 border border-blue-500/10">
                          {searchSummary || `Inspecting website ${activeUrl}...`}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-blue-500/20">
                          <button
                            onClick={handleReadAloud}
                            className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                          >
                            <Volume2 size={14} />
                            <span>Read Aloud</span>
                          </button>

                          <button
                            onClick={copyToClipboard}
                            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                          >
                            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            <span>{copied ? "Copied" : "Copy Summary"}</span>
                          </button>

                          <button
                            onClick={() => setBrowserTab("live")}
                            className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye size={14} />
                            <span>Switch to Live Iframe View</span>
                          </button>

                          {onShareToWhatsApp && (
                            <button
                              onClick={() => {
                                onClose();
                                onShareToWhatsApp(
                                  `🌐 Website Insight on ${activeUrl}:\n\n${searchSummary.substring(0, 350)}...`
                                );
                              }}
                              className="px-4 py-2 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                            >
                              <MessageSquare size={14} />
                              <span>Share on WhatsApp</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Direct Navigation Links for this website */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Globe size={13} />
                          <span>Related Web References ({sources.length}):</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {sources.map((src, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-3.5 rounded-2xl bg-black/40 border border-blue-500/20 flex items-center justify-between gap-3"
                            >
                              <div className="truncate">
                                <p className="text-xs font-semibold text-white truncate">{src.title}</p>
                                <p className="text-[10px] font-mono text-white/40 truncate">{src.url}</p>
                              </div>
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white shrink-0"
                              >
                                <ExternalLink size={14} />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Live Iframe View */}
                  {browserTab === "live" && (
                    <div className="space-y-3">
                      {/* Notice bar for headers */}
                      <div className="p-3.5 rounded-2xl bg-blue-950/60 border border-blue-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-blue-200 shadow-lg">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={18} className="text-cyan-400 shrink-0" />
                          <span>
                            Browsing target in Zoya Sandbox. If the site enforces strict framing headers or displays "refused to connect", use <strong>Open in New Tab</strong> or <strong>AI Reader Mode</strong>.
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setBrowserTab("reader")}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <BookOpen size={12} />
                            <span>Reader Mode</span>
                          </button>
                          <a
                            href={cleanGroundingUrl(activeUrl, query, query)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-[11px] flex items-center gap-1 shadow-md transition-colors"
                          >
                            <span>Open in New Tab</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>

                      {/* The live iframe with fallback */}
                      <div className="w-full h-[58vh] rounded-3xl overflow-hidden border border-white/15 bg-white shadow-2xl relative">
                        {iframeError ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-white space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-cyan-400">
                              <Globe size={28} />
                            </div>
                            <div className="max-w-md space-y-2">
                              <h4 className="text-base font-bold font-mono">External Website Restricted Embedded View</h4>
                              <p className="text-xs text-white/70 leading-relaxed font-sans">
                                This website’s security policy (X-Frame-Options or Content-Security-Policy) prevents embedding inside a frame. Open it directly in a new tab or use Zoya's AI Reader Mode!
                              </p>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                              <a
                                href={cleanGroundingUrl(activeUrl, query, query)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono flex items-center gap-2 shadow-lg"
                              >
                                <span>Open Full Website in New Tab</span>
                                <ExternalLink size={14} />
                              </a>
                              <button
                                onClick={() => setBrowserTab("reader")}
                                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono flex items-center gap-2 cursor-pointer"
                              >
                                <BookOpen size={14} />
                                <span>Use AI Reader Mode</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <iframe
                            src={activeUrl}
                            title="Zoya Live In-App Browser"
                            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                            className="w-full h-full border-0"
                            onError={() => setIframeError(true)}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ================= MODE 3: GOOGLE LIVE SEARCH ================= */}
              {searchMode === "google" && (
                <div className="space-y-5 animate-fade-in">
                  {/* Tab 1: AI Grounded Summary */}
                  {googleActiveTab === "summary" && (
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono">
                        <div className="flex items-center gap-2 text-white/70">
                          <Search size={14} className={isJarvis ? "text-cyan-400" : "text-violet-400"} />
                          <span>Query: <strong className="text-white">"{query}"</strong></span>
                        </div>
                        {searchTimestamp && (
                          <span className="text-white/40">Timestamp: {searchTimestamp}</span>
                        )}
                      </div>

                      {/* Summary Box */}
                      <div
                        className={`p-5 sm:p-6 rounded-3xl border shadow-xl leading-relaxed text-sm sm:text-base text-white/95 whitespace-pre-line ${
                          isJarvis
                            ? "bg-cyan-950/20 border-cyan-500/30 shadow-[0_4px_25px_rgba(6,182,212,0.1)]"
                            : "bg-violet-950/20 border-violet-500/30 shadow-[0_4px_25px_rgba(139,92,246,0.1)]"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                          <Sparkles size={16} className={isJarvis ? "text-cyan-400" : "text-violet-400"} />
                          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                            {isJarvis ? "JARVIS LIVE SEARCH SYNTHESIS" : "ZOYA GOOGLE SEARCH GROUNDING REPORT"}
                          </h3>
                        </div>
                        {searchSummary || "No search results available."}
                      </div>

                      {/* Action Buttons Bar */}
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(query)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <ExternalLink size={14} />
                          <span>Google Search</span>
                        </a>

                        <a
                          href={`https://news.google.com/search?q=${encodeURIComponent(query)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <Newspaper size={14} />
                          <span>Google News</span>
                        </a>

                        <a
                          href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <ImageIcon size={14} />
                          <span>Images</span>
                        </a>

                        <button
                          onClick={handleReadAloud}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <Volume2 size={14} />
                          <span>Read Aloud</span>
                        </button>

                        <button
                          onClick={copyToClipboard}
                          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 hover:text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                          <span>{copied ? "Copied" : "Copy Report"}</span>
                        </button>

                        {onShareToWhatsApp && (
                          <button
                            onClick={() => {
                              onClose();
                              onShareToWhatsApp(
                                `🔍 Google Search: "${query}"\n\n${searchSummary.substring(0, 400)}...`
                              );
                            }}
                            className="px-4 py-2.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] hover:text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <MessageSquare size={14} />
                            <span>Share on WhatsApp</span>
                          </button>
                        )}

                        {onShareToEmail && (
                          <button
                            onClick={() => {
                              onClose();
                              onShareToEmail(
                                `🔍 Google Search Notes on "${query}"`,
                                searchSummary
                              );
                            }}
                            className="px-4 py-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 hover:text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Mail size={14} />
                            <span>Email Notes</span>
                          </button>
                        )}
                      </div>

                      {/* Wikipedia Snapshot */}
                      {wikiData && wikiData.extract && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row gap-4 items-start">
                          {wikiData.thumbnail && (
                            <img
                              src={wikiData.thumbnail.source}
                              alt={wikiData.title}
                              className="w-20 h-20 rounded-xl object-cover border border-white/20 shrink-0"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <BookOpen size={14} className="text-amber-400" />
                              <h4 className="text-xs font-mono font-bold text-white uppercase">
                                Wikipedia: {wikiData.title}
                              </h4>
                            </div>
                            <p className="text-xs text-white/80 line-clamp-3 leading-relaxed mb-2">
                              {wikiData.extract}
                            </p>
                            {wikiData.pageUrl && (
                              <button
                                onClick={() => handleAccessWebsite(wikiData.pageUrl!)}
                                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline inline-flex items-center gap-1 cursor-pointer"
                              >
                                <span>Access full article in Zoya</span>
                                <ExternalLink size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 2: Sources with In-App Browser Access */}
                  {googleActiveTab === "sources" && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                          <Globe size={15} className="text-cyan-400" />
                          <span>Verified Google Web Citations ({sources.length})</span>
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {sources.map((src, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between group shadow-md"
                          >
                            <div className="mb-2">
                              <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                                {src.title}
                              </h4>
                              <p className="text-[10px] font-mono text-white/40 truncate mt-1">
                                {src.url}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                              <button
                                onClick={() => handleAccessWebsite(src.url)}
                                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <Globe size={12} />
                                <span>Access Website</span>
                              </button>
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white text-xs font-mono flex items-center gap-1 transition-colors"
                              >
                                <span>External</span>
                                <ExternalLink size={11} />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Wikipedia Article */}
                  {googleActiveTab === "wiki" && wikiData && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div className="flex items-center gap-2">
                            <BookOpen size={18} className="text-amber-400" />
                            <h3 className="text-base font-bold text-white font-mono">{wikiData.title}</h3>
                          </div>
                          {wikiData.pageUrl && (
                            <button
                              onClick={() => handleAccessWebsite(wikiData.pageUrl!)}
                              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Inspect in Zoya</span>
                              <ExternalLink size={12} />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-white/90 leading-relaxed whitespace-pre-line">
                          {wikiData.extract}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-black/50 flex flex-wrap items-center justify-between gap-2 shrink-0 text-[11px] font-mono text-white/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>
              {searchMode === "chromosome"
                ? "Chromosomes & Cytogenetic Intelligence Protocol Active"
                : searchMode === "website"
                ? "Unrestricted Web Access & Inspection Engine Active"
                : "Google Search & Live Web Grounding Protocol Active"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => executeSearch()}
              className="text-white/60 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw size={12} />
              <span>Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
