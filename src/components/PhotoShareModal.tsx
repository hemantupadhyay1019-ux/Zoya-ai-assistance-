import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Image as ImageIcon,
  Send,
  CheckCircle2,
  Share2,
  Sparkles,
  X,
  Smartphone,
  Mail,
  HelpCircle,
  RefreshCw,
  Copy,
  Volume2,
  VolumeX,
  Upload,
  Eye,
  Check,
  Download,
  Flame,
  Shield,
  FileCode,
  FileText,
  Calculator,
  ScanLine,
  SwitchCamera
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MediaAttachment } from "../types/assistant";
import { analyzeImageWithZoya, getZoyaAudio } from "../services/geminiService";

interface PhotoShareModalProps {
  initialRecipient?: string;
  initialQuestion?: string;
  assistantMode?: "zoya" | "jarvis";
  autoStartCamera?: boolean;
  onClose: () => void;
  onPhotoSent?: (attachment: MediaAttachment) => void;
  onSaveToFeed?: (text: string, photoUrl?: string) => void;
}

const PRESET_PHOTOS = [
  {
    id: "p1",
    title: "AI Neural Architecture Blueprint",
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
    caption: "Here is the full system architecture diagram for our AI Voice Assistant.",
    defaultQuestion: "Explain the architecture in this diagram and list potential bottlenecks."
  },
  {
    id: "p2",
    title: "Math & Algorithm Problem Sheet",
    url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
    caption: "Mathematics problem and complex algorithmic proofs.",
    defaultQuestion: "Solve this mathematical formula and provide step-by-step reasoning."
  },
  {
    id: "p3",
    title: "React Component Source Code",
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    caption: "Source code snippet and logic implementation snapshot.",
    defaultQuestion: "Analyze this code snippet, explain what it does, and identify any bugs or optimizations."
  },
  {
    id: "p4",
    title: "Cybersecurity Diagnostic Report",
    url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",
    caption: "Network diagnostic scan report verified and clear of vulnerabilities.",
    defaultQuestion: "Audit this cybersecurity dashboard and extract critical security metrics."
  }
];

const QUICK_QUESTIONS = [
  { label: "🔍 Explain Scene", query: "Describe everything in this photo in detail and point out key elements." },
  { label: "🧮 Solve Problem", query: "Solve the question, equation, or math/logic problem shown in this image with step-by-step workings." },
  { label: "💻 Code & Bugs", query: "Explain this code snippet, detect any syntax errors or vulnerabilities, and suggest improvements." },
  { label: "📝 Extract Text (OCR)", query: "Transcribe and extract all visible text from this image cleanly with summary." },
  { label: "💅 Zoya's Roast", query: "Give a sassy, witty, and honest critique/roast of this picture in Zoya's style!" },
  { label: "🛡 JARVIS Tactical Scan", query: "Provide a tactical JARVIS analysis of all objects, schematics, and technical parameters." }
];

export default function PhotoShareModal({
  initialRecipient = "Alex",
  initialQuestion = "What is shown in this picture? Explain in detail.",
  assistantMode = "zoya",
  autoStartCamera = true,
  onClose,
  onPhotoSent,
  onSaveToFeed
}: PhotoShareModalProps) {
  const [activeTab, setActiveTab] = useState<"camera" | "qa" | "share">("camera");
  const [recipientName, setRecipientName] = useState(initialRecipient);
  const [recipientPhone, setRecipientPhone] = useState("+91 98765 43210");
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>(PRESET_PHOTOS[0].url);
  const [selectedPhotoTitle, setSelectedPhotoTitle] = useState<string>(PRESET_PHOTOS[0].title);
  const [customCaption, setCustomCaption] = useState(PRESET_PHOTOS[0].caption);
  const [shutterFlash, setShutterFlash] = useState(false);
  
  // Camera Stream state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-start camera on mount if requested
  useEffect(() => {
    if (autoStartCamera && activeTab === "camera") {
      startCamera();
    }
  }, [autoStartCamera]);

  // Q&A State
  const [question, setQuestion] = useState(initialQuestion);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sending state
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [shareChannel, setShareChannel] = useState<"whatsapp" | "email" | "sms">("whatsapp");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Synthesize camera shutter sound
  const playShutterSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {
      // ignore
    }
  };

  // Start Camera
  const startCamera = async (mode: "user" | "environment" = facingMode) => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn("Camera start error:", err);
      setCameraError(
        err?.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access in browser settings or upload an image file."
          : "Camera not available on this device. You can upload an image file or choose a preset below."
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const nextFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextFacing);
    if (isCameraActive) {
      startCamera(nextFacing);
    }
  };

  // Capture Frame from Video
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    playShutterSound();
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      if (facingMode === "user") {
        // Mirror horizontally for selfie
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setSelectedPhotoUrl(dataUrl);
      setSelectedPhotoTitle(`Camera Capture (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`);
      setCustomCaption("Captured using live camera frame on " + new Date().toLocaleString());
      stopCamera();
      setActiveTab("qa");
      // Auto-trigger analysis
      handleAnalyzePhoto(dataUrl);
    }
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setSelectedPhotoUrl(result);
          setSelectedPhotoTitle(file.name.replace(/\.[^/.]+$/, ""));
          setCustomCaption(`Attached image: ${file.name}`);
          stopCamera();
          setActiveTab("qa");
          handleAnalyzePhoto(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Run Vision AI Analysis (Question & Answer)
  const handleAnalyzePhoto = async (photoBase64OrUrl?: string, customPrompt?: string) => {
    const imageToAnalyze = photoBase64OrUrl || selectedPhotoUrl;
    const promptToUse = customPrompt || question;
    if (!imageToAnalyze) return;

    setIsAnalyzing(true);
    setAiAnswer(null);

    try {
      let base64Data = imageToAnalyze;

      // If it's an external URL, convert to Base64 via Canvas proxy
      if (imageToAnalyze.startsWith("http://") || imageToAnalyze.startsWith("https://")) {
        try {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          const dataPromise = new Promise<string>((resolve, reject) => {
            img.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = img.naturalWidth || 600;
              canvas.height = img.naturalHeight || 400;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/jpeg", 0.85));
              } else {
                reject(new Error("Canvas context failed"));
              }
            };
            img.onerror = () => resolve(""); // fallback
            img.src = imageToAnalyze;
          });
          const converted = await dataPromise;
          if (converted) base64Data = converted;
        } catch (e) {
          console.warn("Could not convert image to base64:", e);
        }
      }

      const answer = await analyzeImageWithZoya({
        imageBase64: base64Data,
        question: promptToUse,
        assistantMode
      });

      setAiAnswer(answer);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setAiAnswer(`[Analysis Error]: ${err?.message || "Failed to analyze photo."}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Speak Answer aloud
  const handleSpeakAnswer = async () => {
    if (!aiAnswer) return;

    if (isSpeaking) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);

    try {
      const audioBase64 = await getZoyaAudio(aiAnswer);
      if (audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
        audioRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => {
          fallbackSpeech(aiAnswer);
        };
        await audio.play();
      } else {
        fallbackSpeech(aiAnswer);
      }
    } catch {
      fallbackSpeech(aiAnswer);
    }
  };

  const fallbackSpeech = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 300));
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  // Copy Answer
  const handleCopyAnswer = () => {
    if (!aiAnswer) return;
    navigator.clipboard.writeText(aiAnswer);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  // Send photo to contact
  const handleSendPhoto = () => {
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);

      const attachment: MediaAttachment = {
        id: "media-" + Date.now(),
        title: selectedPhotoTitle,
        type: "photo",
        url: selectedPhotoUrl,
        previewUrl: selectedPhotoUrl,
        sentTo: recipientName,
        contactPhone: recipientPhone,
        sentAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "sent",
        caption: customCaption,
        question: question,
        aiAnswer: aiAnswer || undefined
      };

      if (onPhotoSent) {
        onPhotoSent(attachment);
      }

      if (onSaveToFeed && aiAnswer) {
        onSaveToFeed(`📸 [Photo Q&A - ${selectedPhotoTitle}]\n\nQuestion: "${question}"\n\nAnswer:\n${aiAnswer}`, selectedPhotoUrl);
      }

      // Generate direct links for sharing
      const fullShareText = `${customCaption}\n\nPhoto: ${selectedPhotoTitle}\n${aiAnswer ? `\nAI Analysis / Solution:\n${aiAnswer.slice(0, 400)}...\n` : ""}\nDispatched by Zoya & JARVIS AI Core`;
      const encodedMsg = encodeURIComponent(fullShareText);
      let targetUrl = "";

      if (shareChannel === "whatsapp") {
        const cleanPhone = recipientPhone.replace(/\D/g, "");
        targetUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
      } else if (shareChannel === "email") {
        targetUrl = `mailto:alex@horizon.tech?subject=${encodeURIComponent(`Photo & AI Q&A Analysis: ${selectedPhotoTitle}`)}&body=${encodedMsg}`;
      } else {
        targetUrl = `sms:${recipientPhone}?body=${encodedMsg}`;
      }

      try {
        window.open(targetUrl, "_blank", "noopener,noreferrer");
      } catch (err) {
        console.warn("Could not open window:", err);
      }
    }, 1200);
  };

  // Cleanup camera and audio on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-3xl bg-[#090c14] border border-pink-500/30 rounded-3xl overflow-hidden shadow-[0_0_70px_rgba(236,72,153,0.25)] flex flex-col text-white relative max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-950/70 via-[#110d1c] to-violet-950/70 border-b border-pink-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/15 border border-pink-500/40 flex items-center justify-center text-pink-400 shadow-md">
              <Camera size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono tracking-wider text-pink-400 uppercase">
                  CAMERA & PHOTO VISION Q&A STUDIO
                </h2>
                <span className="text-[9px] font-mono uppercase bg-pink-500/20 border border-pink-500/40 px-2 py-0.5 rounded text-pink-300">
                  Multimodal Gemini 3.7
                </span>
              </div>
              <p className="text-xs text-white/60 font-mono">
                Capture Camera Frame • Ask Questions • AI Vision Solutions • Instant Share
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-black/40 shrink-0">
          <button
            onClick={() => {
              setActiveTab("camera");
            }}
            className={`flex-1 py-3 text-xs font-mono font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "camera"
                ? "border-pink-500 text-pink-300 bg-pink-500/10"
                : "border-transparent text-white/40 hover:text-white/80"
            }`}
          >
            <Camera size={15} />
            <span>1. Capture / Select Frame</span>
          </button>

          <button
            onClick={() => {
              stopCamera();
              setActiveTab("qa");
              if (!aiAnswer && !isAnalyzing) {
                handleAnalyzePhoto();
              }
            }}
            className={`flex-1 py-3 text-xs font-mono font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "qa"
                ? "border-cyan-500 text-cyan-300 bg-cyan-500/10"
                : "border-transparent text-white/40 hover:text-white/80"
            }`}
          >
            <Sparkles size={15} />
            <span>2. Visual Q&A & Solutions</span>
          </button>

          <button
            onClick={() => {
              stopCamera();
              setActiveTab("share");
            }}
            className={`flex-1 py-3 text-xs font-mono font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "share"
                ? "border-violet-500 text-violet-300 bg-violet-500/10"
                : "border-transparent text-white/40 hover:text-white/80"
            }`}
          >
            <Share2 size={15} />
            <span>3. Share & Dispatch</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-left">
          {/* TAB 1: Camera Scanner & Image Selection */}
          {activeTab === "camera" && (
            <div className="space-y-5">
              {/* Live Camera Viewfinder or Capture Preview */}
              <div className="relative w-full rounded-2xl overflow-hidden border border-pink-500/30 bg-black/60 aspect-video max-h-72 flex items-center justify-center group shadow-2xl">
                {isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
                    />

                    {/* Camera Shutter Flash Effect */}
                    <div
                      className={`absolute inset-0 bg-white transition-opacity duration-150 pointer-events-none z-20 ${
                        shutterFlash ? "opacity-90" : "opacity-0"
                      }`}
                    />
                    
                    {/* Reticle / Camera Target Frame Overlays */}
                    <div className="absolute inset-0 pointer-events-none border-2 border-pink-500/30 m-4 rounded-xl flex flex-col justify-between p-3">
                      <div className="flex justify-between items-center text-[10px] font-mono text-pink-400 bg-black/50 px-2 py-0.5 rounded w-fit">
                        <ScanLine size={12} className="animate-spin text-pink-400 mr-1" />
                        <span>LIVE OPTICAL SCAN FRAME</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-mono text-white/60">
                        <span>MODE: {facingMode.toUpperCase()}</span>
                        <span>RESOLUTION: 1080P HD</span>
                      </div>
                    </div>

                    {/* Camera Control Overlays */}
                    <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3 pointer-events-auto">
                      <button
                        onClick={toggleCameraFacing}
                        className="p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 hover:border-pink-400 transition-all cursor-pointer"
                        title="Switch Camera (Front/Back)"
                      >
                        <SwitchCamera size={18} />
                      </button>

                      <button
                        onClick={captureSnapshot}
                        className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(236,72,153,0.5)] flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
                      >
                        <Camera size={18} />
                        <span>SNAP & ASK QUESTION</span>
                      </button>

                      <button
                        onClick={stopCamera}
                        className="p-3 rounded-full bg-black/70 hover:bg-black text-white/70 hover:text-white border border-white/20 transition-all cursor-pointer"
                        title="Close Camera"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={selectedPhotoUrl}
                      alt={selectedPhotoTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono uppercase tracking-wider bg-pink-500/20 border border-pink-500/40 text-pink-300 px-2.5 py-1 rounded-full backdrop-blur-md">
                          Selected Image: {selectedPhotoTitle}
                        </span>

                        <button
                          onClick={() => {
                            setActiveTab("qa");
                            handleAnalyzePhoto();
                          }}
                          className="px-3 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer transition-all hover:scale-105"
                        >
                          <Sparkles size={14} />
                          <span>Ask Questions & Solve</span>
                        </button>
                      </div>

                      {/* Viewfinder Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => startCamera()}
                          className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-mono font-semibold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
                        >
                          <Camera size={15} />
                          <span>Open Live Camera</span>
                        </button>

                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono font-semibold text-xs flex items-center gap-2 transition-all border border-white/20 cursor-pointer"
                        >
                          <Upload size={15} />
                          <span>Upload File / Photo</span>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <X size={14} className="shrink-0 text-red-400" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Sample Photo Gallery Presets */}
              <div>
                <label className="text-[11px] font-mono uppercase text-pink-400 tracking-wider font-semibold block mb-2">
                  Or Pick From Problem & Blueprint Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_PHOTOS.map((photo) => {
                    const isSelected = selectedPhotoUrl === photo.url;
                    return (
                      <div
                        key={photo.id}
                        onClick={() => {
                          stopCamera();
                          setSelectedPhotoUrl(photo.url);
                          setSelectedPhotoTitle(photo.title);
                          setCustomCaption(photo.caption);
                          setQuestion(photo.defaultQuestion);
                        }}
                        className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all group ${
                          isSelected
                            ? "border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.4)] scale-[1.02]"
                            : "border-white/10 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-2 flex flex-col justify-end">
                          <span className="text-[10px] font-semibold text-white truncate">{photo.title}</span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center">
                            <Check size={10} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Visual Q&A & Analysis */}
          {activeTab === "qa" && (
            <div className="space-y-4">
              {/* Image Preview Strip */}
              <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl">
                <img
                  src={selectedPhotoUrl}
                  alt={selectedPhotoTitle}
                  className="w-16 h-16 rounded-xl object-cover border border-pink-500/30 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate">{selectedPhotoTitle}</h4>
                  <p className="text-[10px] text-white/50 font-mono">Visual scan input ready for multimodal intelligence</p>
                </div>
                <button
                  onClick={() => setActiveTab("camera")}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[10px] font-mono text-white/80 transition-all cursor-pointer"
                >
                  Change Frame
                </button>
              </div>

              {/* Question Input Box */}
              <div>
                <label className="text-[11px] font-mono uppercase text-cyan-400 tracking-wider font-semibold block mb-1.5 flex items-center gap-1.5">
                  <HelpCircle size={13} />
                  <span>Ask Question About This Photo (Problem, Code, Math, OCR, Meaning)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. Solve this math problem step-by-step..."
                    className="flex-1 bg-black/50 border border-cyan-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-cyan-400 outline-none font-sans"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAnalyzePhoto();
                      }
                    }}
                  />
                  <button
                    onClick={() => handleAnalyzePhoto()}
                    disabled={isAnalyzing || !question.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {isAnalyzing ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    <span>{isAnalyzing ? "Analyzing..." : "Ask AI"}</span>
                  </button>
                </div>
              </div>

              {/* Quick Prompt Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                {QUICK_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuestion(q.query);
                      handleAnalyzePhoto(selectedPhotoUrl, q.query);
                    }}
                    className="px-2.5 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 whitespace-nowrap cursor-pointer transition-all shrink-0"
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              {/* AI Answer Display Card */}
              <div className="bg-[#0e121e] border border-cyan-500/30 rounded-2xl p-4 shadow-xl relative min-h-[140px] flex flex-col">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      {assistantMode === "jarvis" ? "JARVIS TACTICAL OPTICAL ANALYSIS" : "ZOYA'S VISUAL ANSWER & SOLUTION"}
                    </h4>
                  </div>

                  {aiAnswer && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleSpeakAnswer}
                        className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition-all cursor-pointer ${
                          isSpeaking
                            ? "bg-pink-500/20 border-pink-500 text-pink-300 animate-pulse"
                            : "bg-white/5 border-white/10 hover:bg-white/10 text-white/70 hover:text-white"
                        }`}
                        title={isSpeaking ? "Stop Speaking" : "Read Answer Aloud (Voice)"}
                      >
                        {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                        <span>{isSpeaking ? "Stop" : "Speak"}</span>
                      </button>

                      <button
                        onClick={handleCopyAnswer}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white/70 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                        title="Copy Answer Text"
                      >
                        {copiedAnswer ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        <span>{copiedAnswer ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {isAnalyzing ? (
                  <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="relative">
                      <RefreshCw size={28} className="animate-spin text-cyan-400" />
                      <Sparkles size={14} className="absolute -top-1 -right-1 text-pink-400 animate-bounce" />
                    </div>
                    <p className="text-xs font-mono text-cyan-300">
                      {assistantMode === "jarvis" ? "JARVIS optical neural network processing visual frame..." : "Zoya is examining your picture, Hemant..."}
                    </p>
                  </div>
                ) : aiAnswer ? (
                  <div className="text-xs text-white/90 leading-relaxed font-sans whitespace-pre-wrap max-h-60 overflow-y-auto pr-2">
                    {aiAnswer}
                  </div>
                ) : (
                  <div className="py-8 text-center text-white/40 text-xs font-mono">
                    Click "Ask AI" or choose a prompt to get detailed analysis of this image.
                  </div>
                )}

                {aiAnswer && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (onSaveToFeed && aiAnswer) {
                          onSaveToFeed(`📸 [Photo Analysis]\nQ: ${question}\n\nA: ${aiAnswer}`, selectedPhotoUrl);
                        }
                        setActiveTab("share");
                      }}
                      className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Share2 size={13} />
                      <span>Send Photo & Solution</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Share & Dispatch */}
          {activeTab === "share" && (
            <div className="space-y-4">
              {sentSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center flex flex-col items-center space-y-3"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-lg font-bold font-mono text-emerald-400">PHOTO & Q&A DISPATCHED!</h3>
                  <p className="text-xs text-white/80 max-w-sm">
                    "{selectedPhotoTitle}" and its AI visual solution have been shared with <span className="text-pink-400 font-bold">{recipientName}</span> via {shareChannel.toUpperCase()}.
                  </p>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setSentSuccess(false)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-mono text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Share Another
                    </button>
                    <button
                      onClick={onClose}
                      className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* Recipient Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-pink-400 tracking-wider font-semibold block mb-1">
                        Recipient Name
                      </label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-pink-400 outline-none"
                        placeholder="e.g. Alex"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-pink-400 tracking-wider font-semibold block mb-1">
                        Phone / Contact Number
                      </label>
                      <input
                        type="text"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-pink-400 outline-none"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>

                  {/* Caption & AI Answer Preview */}
                  <div>
                    <label className="text-[10px] font-mono uppercase text-pink-400 tracking-wider font-semibold block mb-1">
                      Message & Photo Caption
                    </label>
                    <textarea
                      value={customCaption}
                      onChange={(e) => setCustomCaption(e.target.value)}
                      rows={2}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-pink-400 outline-none resize-none font-sans"
                    />
                  </div>

                  {/* Dispatch Channel Selector */}
                  <div>
                    <label className="text-[10px] font-mono uppercase text-pink-400 tracking-wider font-semibold block mb-2">
                      Dispatch Channel
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShareChannel("whatsapp")}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          shareChannel === "whatsapp" ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md" : "bg-white/5 border-white/10 text-white/60"
                        }`}
                      >
                        <Smartphone size={14} /> WhatsApp
                      </button>
                      <button
                        onClick={() => setShareChannel("email")}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          shareChannel === "email" ? "bg-blue-500/20 border-blue-500 text-blue-400 shadow-md" : "bg-white/5 border-white/10 text-white/60"
                        }`}
                      >
                        <Mail size={14} /> Email
                      </button>
                      <button
                        onClick={() => setShareChannel("sms")}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          shareChannel === "sms" ? "bg-purple-500/20 border-purple-500 text-purple-400 shadow-md" : "bg-white/5 border-white/10 text-white/60"
                        }`}
                      >
                        <Share2 size={14} /> Direct SMS
                      </button>
                    </div>
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSendPhoto}
                    disabled={isSending}
                    className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold font-mono uppercase tracking-wider rounded-2xl shadow-[0_0_30px_rgba(236,72,153,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <Sparkles className="animate-spin" size={18} />
                        <span>Dispatching Photo & Solution...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Send Photo & Q&A to {recipientName}</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
