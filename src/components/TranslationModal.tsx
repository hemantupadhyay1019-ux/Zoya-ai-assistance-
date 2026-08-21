import React, { useState, useEffect } from "react";
import {
  X,
  Languages,
  ArrowLeftRight,
  Volume2,
  Copy,
  Check,
  Mic,
  MicOff,
  Sparkles,
  Send,
  MessageSquare,
  Globe,
  Loader2
} from "lucide-react";
import { motion } from "motion/react";
import { translateText } from "../services/geminiService";

interface TranslationModalProps {
  onClose: () => void;
  onSendToChat?: (text: string) => void;
}

export const LANGUAGES_LIST = [
  { code: "Auto-Detect", name: "Auto-Detect" },
  { code: "Hindi", name: "Hindi (हिंदी)" },
  { code: "English", name: "English (US/UK)" },
  { code: "Spanish", name: "Spanish (Español)" },
  { code: "French", name: "French (Français)" },
  { code: "German", name: "German (Deutsch)" },
  { code: "Japanese", name: "Japanese (日本語)" },
  { code: "Chinese", name: "Chinese Simplified (中文)" },
  { code: "Russian", name: "Russian (Русский)" },
  { code: "Arabic", name: "Arabic (العربية)" },
  { code: "Portuguese", name: "Portuguese (Português)" },
  { code: "Korean", name: "Korean (한국어)" },
  { code: "Italian", name: "Italian (Italiano)" },
  { code: "Dutch", name: "Dutch (Nederlands)" },
  { code: "Marathi", name: "Marathi (मराठी)" },
  { code: "Bengali", name: "Bengali (বাংলা)" },
  { code: "Tamil", name: "Tamil (தமிழ்)" },
  { code: "Telugu", name: "Telugu (తెలుగు)" },
  { code: "Gujarati", name: "Gujarati (ગુજરાતી)" },
  { code: "Punjabi", name: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "Urdu", name: "Urdu (اردو)" },
  { code: "Turkish", name: "Turkish (Türkçe)" },
  { code: "Vietnamese", name: "Vietnamese (Tiếng Việt)" },
  { code: "Thai", name: "Thai (ไทย)" },
  { code: "Indonesian", name: "Indonesian (Bahasa)" },
  { code: "Swahili", name: "Swahili (Kiswahili)" },
  { code: "Polish", name: "Polish (Polski)" }
];

export default function TranslationModal({ onClose, onSendToChat }: TranslationModalProps) {
  const [sourceLang, setSourceLang] = useState("Auto-Detect");
  const [targetLang, setTargetLang] = useState("Hindi");
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState<"instant" | "conversation">("instant");

  // Conversation Mode State
  const [convLog, setConvLog] = useState<
    { id: string; speaker: "User" | "Zoya"; source: string; translation: string; targetLang: string }[]
  >([
    {
      id: "1",
      speaker: "Zoya",
      source: "Hello Hemant! I am your real-time translation assistant. What would you like to translate today?",
      translation: "नमस्ते हेमंत! मैं आपकी रीयल-टाइम अनुवाद सहायक हूँ। आज आप क्या अनुवाद करना चाहेंगे?",
      targetLang: "Hindi"
    }
  ]);
  const [convInput, setConvInput] = useState("");

  // Handle Translate
  const handleTranslate = async (textToTranslate = inputText) => {
    if (!textToTranslate.trim()) {
      setTranslatedText("");
      return;
    }
    setIsTranslating(true);
    try {
      const res = await translateText(textToTranslate, targetLang, sourceLang);
      setTranslatedText(res);
    } catch (err) {
      console.error(err);
      setTranslatedText("Failed to translate text.");
    } finally {
      setIsTranslating(false);
    }
  };

  // Debounced auto-translate on input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputText.trim()) {
        handleTranslate(inputText);
      } else {
        setTranslatedText("");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [inputText, sourceLang, targetLang]);

  // Swap Languages
  const handleSwap = () => {
    if (sourceLang === "Auto-Detect") return;
    const oldSource = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(oldSource);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  // Speech Recognition (Mic Input)
  const toggleListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join("");
        setInputText(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Speak Text via Web Speech Synthesis
  const handleSpeak = (text: string, langName: string) => {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (langName.includes("Hindi")) utterance.lang = "hi-IN";
    else if (langName.includes("Spanish")) utterance.lang = "es-ES";
    else if (langName.includes("French")) utterance.lang = "fr-FR";
    else if (langName.includes("German")) utterance.lang = "de-DE";
    else if (langName.includes("Japanese")) utterance.lang = "ja-JP";
    else if (langName.includes("Chinese")) utterance.lang = "zh-CN";
    else if (langName.includes("Russian")) utterance.lang = "ru-RU";
    else if (langName.includes("Arabic")) utterance.lang = "ar-SA";
    else utterance.lang = "en-US";

    window.speechSynthesis.speak(utterance);
  };

  // Copy to Clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Add to Conversation Mode
  const handleAddConversation = async () => {
    if (!convInput.trim()) return;
    const text = convInput.trim();
    setConvInput("");

    const newId = Date.now().toString();
    const res = await translateText(text, targetLang, sourceLang);

    setConvLog((prev) => [
      ...prev,
      {
        id: newId,
        speaker: "User",
        source: text,
        translation: res,
        targetLang: targetLang
      }
    ]);

    // Speak translated response
    handleSpeak(res, targetLang);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-3xl max-h-[92vh] bg-[#0b0e17]/95 border border-purple-500/30 rounded-3xl shadow-[0_0_60px_rgba(168,85,247,0.25)] flex flex-col overflow-hidden text-white"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-black font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <Languages size={20} className="text-black" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
                <span>ZOYA REAL-TIME TRANSLATOR</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                  Multi-Lang
                </span>
              </h2>
              <p className="text-xs text-white/60">
                Live neural translation engine across 30+ global languages with instant voice playback
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="p-2 bg-black/40 border-b border-white/10 flex items-center justify-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab("instant")}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "instant"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-md shadow-purple-500/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Globe size={14} />
            <span>Instant Text & Voice</span>
          </button>
          <button
            onClick={() => setActiveTab("conversation")}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "conversation"
                ? "bg-pink-500/20 text-pink-300 border border-pink-500/50 shadow-md shadow-pink-500/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <MessageSquare size={14} />
            <span>Side-by-Side Conversation</span>
          </button>
        </div>

        {activeTab === "instant" ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Language Selection Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 bg-black/40 p-3 rounded-2xl border border-white/10">
              {/* Source Lang */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase text-white/50">From (Source)</label>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="bg-[#131826] border border-white/10 rounded-xl px-3 py-2 text-sm text-purple-300 font-semibold outline-none focus:border-purple-400 cursor-pointer"
                >
                  {LANGUAGES_LIST.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center pt-2 sm:pt-0">
                <button
                  onClick={handleSwap}
                  disabled={sourceLang === "Auto-Detect"}
                  className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Swap Source and Target Languages"
                >
                  <ArrowLeftRight size={18} />
                </button>
              </div>

              {/* Target Lang */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase text-white/50">To (Target)</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="bg-[#131826] border border-white/10 rounded-xl px-3 py-2 text-sm text-pink-300 font-semibold outline-none focus:border-pink-400 cursor-pointer"
                >
                  {LANGUAGES_LIST.filter((l) => l.code !== "Auto-Detect").map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Translation Input & Output Side-by-Side Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input Box */}
              <div className="flex flex-col bg-[#111524] border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-purple-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-purple-400" />
                    Input Text ({sourceLang})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleListening}
                      className={`p-1.5 rounded-lg border text-xs transition-all flex items-center gap-1 cursor-pointer ${
                        isListening
                          ? "bg-red-500/20 border-red-500 text-red-300 animate-pulse"
                          : "bg-white/5 border-white/10 text-white/70 hover:text-white"
                      }`}
                      title="Microphone Dictation"
                    >
                      {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                      <span className="text-[10px] hidden sm:inline">
                        {isListening ? "Listening..." : "Dictate"}
                      </span>
                    </button>
                    {inputText && (
                      <button
                        onClick={() => handleSpeak(inputText, sourceLang)}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                        title="Speak Original Text"
                      >
                        <Volume2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type or dictate words, phrases, or full paragraphs to translate in real-time..."
                  rows={6}
                  className="w-full bg-black/30 border border-white/5 rounded-xl p-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-purple-500/50 resize-none font-sans"
                />

                {/* Quick Phrase Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    "Hello, how are you?",
                    "What is your name?",
                    "Thank you very much!",
                    "Please send study notes",
                    "How to learn coding?"
                  ].map((phrase) => (
                    <button
                      key={phrase}
                      onClick={() => setInputText(phrase)}
                      className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-white/70 hover:text-white transition-colors cursor-pointer"
                    >
                      "{phrase}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Output Box */}
              <div className="flex flex-col bg-[#111524] border border-pink-500/30 rounded-2xl p-4 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-pink-300 flex items-center gap-1.5">
                    <Globe size={14} className="text-pink-400" />
                    Translated ({targetLang})
                  </span>
                  <div className="flex items-center gap-2">
                    {translatedText && (
                      <>
                        <button
                          onClick={() => handleSpeak(translatedText, targetLang)}
                          className="p-1.5 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 hover:text-white transition-all cursor-pointer"
                          title="Listen to Translation"
                        >
                          <Volume2 size={14} />
                        </button>
                        <button
                          onClick={() => handleCopy(translatedText)}
                          className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                          title="Copy Translation"
                        >
                          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex-1 bg-black/30 border border-white/5 rounded-xl p-3 min-h-[140px] text-sm text-pink-100 flex flex-col justify-between">
                  {isTranslating ? (
                    <div className="flex items-center gap-2 text-purple-300 text-xs py-8">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Translating via Zoya Neural Core...</span>
                    </div>
                  ) : translatedText ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{translatedText}</p>
                  ) : (
                    <p className="text-white/30 italic text-xs py-8">
                      Translated output will appear here automatically...
                    </p>
                  )}
                </div>

                {/* Send to Main Chat Button */}
                {translatedText && onSendToChat && (
                  <button
                    onClick={() => {
                      onSendToChat(`[Translation -> ${targetLang}]: ${translatedText}`);
                      onClose();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
                  >
                    <Send size={14} />
                    <span>Send Translation to Zoya Chat</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Conversation Mode Tab */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 flex flex-col">
            <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/10 text-xs text-white/70">
              <span>Bilingual Voice Conversation Mode</span>
              <span className="font-mono text-purple-300">Target: {targetLang}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 min-h-[220px] max-h-[340px] pr-2">
              {convLog.map((log) => (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-2xl border ${
                    log.speaker === "User"
                      ? "bg-purple-950/30 border-purple-500/30 ml-6"
                      : "bg-slate-900 border-white/10 mr-6"
                  } space-y-1`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-white/50">
                    <span className="font-bold text-purple-300">{log.speaker}</span>
                    <button
                      onClick={() => handleSpeak(log.translation, log.targetLang)}
                      className="hover:text-white cursor-pointer"
                    >
                      <Volume2 size={12} />
                    </button>
                  </div>
                  <p className="text-xs text-white/80">{log.source}</p>
                  <p className="text-xs font-semibold text-pink-300 border-t border-white/5 pt-1 mt-1">
                    ↳ {log.translation}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={convInput}
                onChange={(e) => setConvInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddConversation()}
                placeholder={`Type text to speak and translate into ${targetLang}...`}
                className="flex-1 bg-[#111524] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-400"
              />
              <button
                onClick={handleAddConversation}
                className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-black font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Send size={14} />
                <span>Translate & Speak</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/50 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-white/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>30+ Languages Loaded — Zero Limits ("No Ra")</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors cursor-pointer"
          >
            Close Translator
          </button>
        </div>
      </motion.div>
    </div>
  );
}
