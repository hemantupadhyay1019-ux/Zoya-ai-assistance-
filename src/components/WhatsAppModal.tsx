import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Phone,
  User,
  CheckCircle2,
  Copy,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Sparkles,
  X,
  ArrowRight,
  ExternalLink,
  Clock,
  RotateCcw,
  Zap,
  Smartphone,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WhatsAppModalProps {
  initialRecipient?: string;
  initialPhone?: string;
  initialMessage?: string;
  autoSend?: boolean;
  autoSendOnOpen?: boolean;
  assistantMode?: "zoya" | "jarvis";
  onClose: () => void;
  onMessageSent?: (recipient: string, phone: string, message: string) => void;
}

const PRESET_CONTACTS = [
  { id: "c1", name: "Durgesh", phone: "+919876543210", tag: "Primary User", avatar: "👤" },
  { id: "c2", name: "Alex", phone: "+14155552671", tag: "Tech Lead", avatar: "👨‍💻" },
  { id: "c3", name: "Mom", phone: "+919811122334", tag: "Family", avatar: "👩" },
  { id: "c4", name: "Dad", phone: "+919822233445", tag: "Family", avatar: "👨" },
  { id: "c5", name: "Boss / Manager", phone: "+919833344556", tag: "Work", avatar: "💼" },
  { id: "c6", name: "Dr. Sharma", phone: "+919844455667", tag: "Clinic", avatar: "🩺" },
  { id: "c7", name: "Study Group", phone: "+919855566778", tag: "College", avatar: "📚" },
];

const TEMPLATES = [
  { label: "🚀 Working on Project", text: "Hey! Currently working on our project with Zoya & JARVIS AI. Will send you the full update shortly!" },
  { label: "📍 Running 10 Mins Late", text: "Hey! Apologies, I am running about 10 minutes late. On my way now!" },
  { label: "📚 Sent Study Notes", text: "Hi! I just reviewed the study notes and summary. Sharing them with you for revision." },
  { label: "📞 Call When Free", text: "Hey, please give me a quick call whenever you are free. Important update." },
  { label: "🎉 Happy Birthday!", text: "Wishing you a very Happy Birthday! 🎂 May this year bring you great health, success, and joy!" },
  { label: "✅ Task Completed", text: "All tasks and assigned action items have been completed successfully. Ready for review!" },
];

export default function WhatsAppModal({
  initialRecipient = "Durgesh",
  initialPhone = "+919876543210",
  initialMessage = "Hello from Zoya & JARVIS Voice Assistant! 🚀",
  autoSend = false,
  autoSendOnOpen = false,
  assistantMode = "zoya",
  onClose,
  onMessageSent,
}: WhatsAppModalProps) {
  const isJarvis = assistantMode === "jarvis";
  const shouldAutoDispatch = autoSend || autoSendOnOpen;

  const [selectedContact, setSelectedContact] = useState<string>(initialRecipient);
  const [phoneNumber, setPhoneNumber] = useState<string>(initialPhone);
  const [countryCode, setCountryCode] = useState<string>("+91");
  const [rawNumber, setRawNumber] = useState<string>(() => {
    const clean = initialPhone.replace(/^\+91/, "").replace(/^\+1/, "").replace(/\D/g, "");
    return clean || "9876543210";
  });
  const [message, setMessage] = useState<string>(initialMessage);
  const [typedMessage, setTypedMessage] = useState<string>("");
  const [isTypingAnimation, setIsTypingAnimation] = useState<boolean>(true);

  // Auto-send countdown state
  const [countdown, setCountdown] = useState<number>(autoSend ? 3 : 0);
  const [isAutoSending, setIsAutoSending] = useState<boolean>(autoSend);
  const [hasDispatched, setHasDispatched] = useState<boolean>(false);

  // Voice Dictation
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Audio Preview & Copy
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Sent History
  const [sentLog, setSentLog] = useState<Array<{ time: string; recipient: string; phone: string; text: string }>>([
    {
      time: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      recipient: "Durgesh",
      phone: "+91 98765 43210",
      text: "System diagnostics and automated tasks are running in green status.",
    },
  ]);

  // Handle Typing effect on initial message
  useEffect(() => {
    if (!initialMessage) {
      setIsTypingAnimation(false);
      setTypedMessage("");
      return;
    }

    setIsTypingAnimation(true);
    let i = 0;
    setTypedMessage("");
    const interval = setInterval(() => {
      if (i < initialMessage.length) {
        setTypedMessage(initialMessage.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsTypingAnimation(false);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [initialMessage]);

  // Sync typedMessage with message once typing completes or user edits
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIsTypingAnimation(false);
    setMessage(e.target.value);
    setTypedMessage(e.target.value);
  };

  // Full formatted phone number with country code
  const fullPhone = `${countryCode}${rawNumber.replace(/\D/g, "")}`;

  // Auto-send countdown timer
  useEffect(() => {
    if (!isAutoSending || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          executeSend("web");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoSending, countdown]);

  // Speech-to-Text Dictation
  const toggleSpeechRecognition = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const updated = message ? `${message} ${transcript}` : transcript;
        setMessage(updated);
        setTypedMessage(updated);
        setIsTypingAnimation(false);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn("Speech error:", e);
      setIsListening(false);
    }
  };

  // Execute Send to WhatsApp
  const executeSend = (target: "web" | "native" = "web") => {
    setIsAutoSending(false);
    setCountdown(0);
    const textToSend = isTypingAnimation ? initialMessage : message || initialMessage;
    const cleanNumber = fullPhone.replace(/\D/g, "");
    const encodedText = encodeURIComponent(textToSend);

    const webUrl = `https://web.whatsapp.com/send?phone=${cleanNumber}&text=${encodedText}`;
    const nativeUrl = `whatsapp://send?phone=${cleanNumber}&text=${encodedText}`;

    const finalUrl = target === "native" ? nativeUrl : webUrl;

    try {
      window.open(finalUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.warn("Window open failed:", e);
    }

    setHasDispatched(true);
    setSentLog((prev) => [
      {
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        recipient: selectedContact,
        phone: fullPhone,
        text: textToSend,
      },
      ...prev,
    ]);

    if (onMessageSent) {
      onMessageSent(selectedContact, fullPhone, textToSend);
    }

    setTimeout(() => {
      setHasDispatched(false);
    }, 4000);
  };

  // Copy to clipboard
  const handleCopy = () => {
    const textToCopy = isTypingAnimation ? initialMessage : message;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Text-to-speech preview
  const handleSpeakPreview = () => {
    if (isPlayingAudio) {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak = isTypingAnimation ? initialMessage : message;
    if (!textToSpeak || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.05;
    utterance.pitch = isJarvis ? 0.9 : 1.15;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`w-full max-w-3xl bg-[#0b141a] border rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(37,211,102,0.25)] flex flex-col text-white relative max-h-[92vh] ${
          isJarvis ? "border-emerald-500/40" : "border-[#25D366]/40"
        }`}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#122e20] via-[#0d2117] to-[#122e20] border-b border-[#25D366]/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/50 flex items-center justify-center text-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.4)]">
              <MessageSquare size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono tracking-wider text-[#25D366] uppercase flex items-center gap-1.5">
                  WHATSAPP AUTOMATED MESSENGER & DISPATCHER
                </h2>
                <span className="text-[10px] font-mono bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] px-2 py-0.5 rounded-full">
                  v5.2 LIVE
                </span>
              </div>
              <p className="text-xs text-white/60">
                Automatic typing, voice dictation, phone routing, and 1-tap WhatsApp Web / App dispatch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Auto-Send Banner Alert */}
        <AnimatePresence>
          {isAutoSending && countdown > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 px-4 py-2.5 flex items-center justify-between text-white text-xs font-mono font-bold"
            >
              <div className="flex items-center gap-2">
                <Zap size={16} className="animate-bounce text-yellow-300" />
                <span>
                  VOICE COMMAND TRIGGERED • Auto-dispatching message in{" "}
                  <span className="text-yellow-300 text-sm font-black">{countdown}s</span>...
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => executeSend("web")}
                  className="px-2.5 py-1 rounded bg-black/40 hover:bg-black/60 text-white text-[11px] uppercase tracking-wider cursor-pointer"
                >
                  Send Now
                </button>
                <button
                  onClick={() => {
                    setIsAutoSending(false);
                    setCountdown(0);
                  }}
                  className="px-2.5 py-1 rounded bg-white/20 hover:bg-white/30 text-white text-[11px] uppercase tracking-wider cursor-pointer"
                >
                  Cancel Countdown
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dispatched Notification */}
        <AnimatePresence>
          {hasDispatched && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#25D366]/20 border-b border-[#25D366]/40 text-[#25D366] px-4 py-2 text-xs font-mono flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Message Dispatched to WhatsApp for {selectedContact} ({fullPhone})!</span>
              </div>
              <span className="text-[10px] text-white/50">WhatsApp Web tab opened</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-left">
          {/* Quick Contact Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#25D366] flex items-center gap-1.5">
              <User size={14} />
              <span>1. Choose Recipient or Contact</span>
            </label>

            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
              {PRESET_CONTACTS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedContact(c.name);
                    setPhoneNumber(c.phone);
                    const clean = c.phone.replace(/^\+91/, "").replace(/^\+1/, "").replace(/\D/g, "");
                    setRawNumber(clean);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-2 shrink-0 transition-all border cursor-pointer ${
                    selectedContact.toLowerCase() === c.name.toLowerCase()
                      ? "bg-[#25D366]/25 border-[#25D366] text-[#25D366] shadow-[0_0_15px_rgba(37,211,102,0.3)] font-bold"
                      : "bg-[#111b21] border-white/10 text-white/70 hover:border-white/30 hover:text-white"
                  }`}
                >
                  <span>{c.avatar}</span>
                  <span>{c.name}</span>
                  <span className="text-[9px] opacity-60 bg-black/40 px-1 rounded">{c.tag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Details Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-white/60 block mb-1">Contact Name</label>
              <input
                type="text"
                value={selectedContact}
                onChange={(e) => setSelectedContact(e.target.value)}
                placeholder="e.g. Durgesh, Mom, Alex"
                className="w-full bg-[#111b21] border border-white/15 focus:border-[#25D366] focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-white/60 block mb-1">WhatsApp Phone Number</label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-[#111b21] border border-white/15 focus:border-[#25D366] focus:outline-none rounded-xl px-2.5 py-2.5 text-xs text-[#25D366] font-mono"
                >
                  <option value="+91">🇮🇳 +91 (IN)</option>
                  <option value="+1">🇺🇸 +1 (US)</option>
                  <option value="+44">🇬🇧 +44 (UK)</option>
                  <option value="+971">🇦🇪 +971 (UAE)</option>
                  <option value="+61">🇦🇺 +61 (AU)</option>
                  <option value="+49">🇩🇪 +49 (DE)</option>
                  <option value="+81">🇯🇵 +81 (JP)</option>
                </select>
                <input
                  type="tel"
                  value={rawNumber}
                  onChange={(e) => setRawNumber(e.target.value)}
                  placeholder="9876543210"
                  className="flex-1 bg-[#111b21] border border-white/15 focus:border-[#25D366] focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Quick Message Templates */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#25D366] flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>2. Quick Message Templates</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setMessage(tmpl.text);
                    setTypedMessage(tmpl.text);
                    setIsTypingAnimation(false);
                  }}
                  className="p-2.5 rounded-xl bg-[#111b21] hover:bg-[#1a2e26] border border-white/10 hover:border-[#25D366]/50 text-left transition-all text-xs text-white/80 hover:text-white cursor-pointer group"
                >
                  <div className="font-semibold font-mono text-[#25D366] text-[11px] mb-1 group-hover:underline">
                    {tmpl.label}
                  </div>
                  <div className="text-[10px] text-white/50 line-clamp-2">{tmpl.text}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Text Area with Auto-Type & Voice Dictation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#25D366] flex items-center gap-1.5">
                <MessageSquare size={14} />
                <span>3. Message Text (Automatic Typist & Live Dictation)</span>
              </label>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleSpeechRecognition}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                    isListening
                      ? "bg-red-500/30 border border-red-500 text-red-300 animate-pulse"
                      : "bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/30"
                  }`}
                  title="Speak message aloud (Speech-to-Text)"
                >
                  {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                  <span>{isListening ? "Listening..." : "Dictate"}</span>
                </button>

                <button
                  onClick={handleSpeakPreview}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 hover:text-white text-xs font-mono flex items-center gap-1 cursor-pointer"
                  title="Listen to how message sounds"
                >
                  {isPlayingAudio ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  <span>{isPlayingAudio ? "Stop" : "Read"}</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 hover:text-white text-xs font-mono flex items-center gap-1 cursor-pointer"
                  title="Copy message to clipboard"
                >
                  <Copy size={13} />
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={4}
                value={isTypingAnimation ? typedMessage : message}
                onChange={handleMessageChange}
                placeholder="Type your message here, or speak aloud using the Dictate button..."
                className="w-full bg-[#111b21] border border-[#25D366]/30 focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] focus:outline-none rounded-2xl p-3.5 text-sm text-white font-sans placeholder-white/30 leading-relaxed shadow-inner"
              />

              {isTypingAnimation && (
                <span className="absolute bottom-4 right-4 inline-block w-2 h-4 bg-[#25D366] animate-pulse" />
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-white/50">
              <span>Characters: {(isTypingAnimation ? typedMessage : message).length}</span>
              <span className="text-[#25D366]">Destination: {fullPhone}</span>
            </div>
          </div>

          {/* Action Dispatch Buttons */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => executeSend("web")}
                className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#25D366] via-emerald-500 to-[#128C7E] hover:from-[#20bd5a] hover:to-[#0f7a6e] text-black font-mono font-bold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(37,211,102,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <Send size={18} />
                <span>Send via WhatsApp Web</span>
                <ExternalLink size={14} className="opacity-70" />
              </button>

              <button
                onClick={() => executeSend("native")}
                className="py-3.5 px-4 rounded-2xl bg-[#111b21] hover:bg-[#1a2e26] border border-[#25D366]/40 hover:border-[#25D366] text-[#25D366] hover:text-white font-mono font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Smartphone size={18} />
                <span>Launch WhatsApp App</span>
              </button>
            </div>
          </div>

          {/* Dispatched History Log */}
          {sentLog.length > 0 && (
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-white/60">
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-[#25D366]" />
                  <span>Recent Automated WhatsApp Messages</span>
                </span>
                <span className="text-[10px] text-[#25D366] flex items-center gap-1">
                  <ShieldCheck size={12} />
                  <span>E2E Encrypted Protocol</span>
                </span>
              </div>

              <div className="space-y-2 max-h-36 overflow-y-auto">
                {sentLog.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#111b21]/70 border border-white/5 flex items-start justify-between text-xs gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-white/70 font-mono text-[11px] mb-0.5">
                        <span className="font-bold text-[#25D366]">{log.recipient}</span>
                        <span>({log.phone})</span>
                        <span className="text-[10px] text-white/40">• {log.time}</span>
                      </div>
                      <p className="text-white/80 text-xs font-sans line-clamp-1">{log.text}</p>
                    </div>
                    <span className="text-[11px] text-[#25D366] shrink-0 font-mono">✓✓ Sent</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
