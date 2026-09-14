import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  Eye,
  Video,
  Mic,
  MicOff,
  RefreshCw,
  Volume2,
  Sparkles,
  X,
  Activity,
  Check,
  Save,
  Send,
  UserPlus,
  Radio,
  Flashlight,
  Layers,
  FileText,
  Scan,
  Box,
  MessageSquare,
  Compass,
  Tag,
  Cpu,
  User,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  analyzePersonFromLiveCamera,
  analyzeLiveCameraScene,
  LivePersonAnalysisResult,
  LiveSceneAnalysisResult,
  DetectedObjectItem,
} from "../services/geminiService";
import {
  getPeople,
  introducePerson,
  updatePersonDetails,
  setActivePersonId,
  getActivePerson,
} from "../services/memoryService";
import { PersonProfile } from "../types/memory";

interface LiveVisionStreamModalProps {
  assistantMode?: "zoya" | "jarvis";
  initialQuestion?: string;
  onClose: () => void;
  onSpeak?: (text: string) => void;
  onPersonUpdated?: (person: PersonProfile) => void;
}

export const LiveVisionStreamModal: React.FC<LiveVisionStreamModalProps> = ({
  assistantMode = "zoya",
  initialQuestion,
  onClose,
  onSpeak,
  onPersonUpdated,
}) => {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("environment");
  const [isScanning, setIsScanning] = useState(false);
  const [autoScanEnabled, setAutoScanEnabled] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  // Analysis Modes: "scene" (What is in picture / kya kya hai), "person" (name, age, work), "text" (read text/OCR)
  const [analysisMode, setAnalysisMode] = useState<"scene" | "person" | "text">("scene");
  
  // Results
  const [sceneResult, setSceneResult] = useState<LiveSceneAnalysisResult | null>(null);
  const [personResult, setPersonResult] = useState<LivePersonAnalysisResult | null>(null);

  // Talking & Interactive State
  const [liveQuestion, setLiveQuestion] = useState(initialQuestion || "");
  const [isListeningForSpeech, setIsListeningForSpeech] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState("");
  const [statusMessage, setStatusMessage] = useState("Camera active. Point at any scene, object, or person.");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSpeakingResult, setIsSpeakingResult] = useState(false);
  const [liveChatLog, setLiveChatLog] = useState<Array<{ q: string; a: string; time: string }>>([]);

  // Video & Canvas references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const autoScanTimerRef = useRef<any>(null);
  const speechRecognitionRef = useRef<any>(null);
  const initialTriggerRef = useRef(false);

  // Speak text using callback or window.speechSynthesis
  const speakText = useCallback(
    (text: string) => {
      if (onSpeak) {
        onSpeak(text);
        return;
      }

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = assistantMode === "jarvis" ? 0.9 : 1.1;
        utterance.onstart = () => setIsSpeakingResult(true);
        utterance.onend = () => setIsSpeakingResult(false);
        utterance.onerror = () => setIsSpeakingResult(false);
        window.speechSynthesis.speak(utterance);
      }
    },
    [assistantMode, onSpeak]
  );

  // Initialize camera stream
  const startCamera = useCallback(async (facing: "user" | "environment") => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      
      setStatusMessage("Accessing camera feed...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
      setStatusMessage("Camera live! Point at anything and tap 'Analyze Picture / Kya Kya Hai'.");

      // Check if torch/flashlight is supported
      const track = stream.getVideoTracks()[0];
      if (track && (track.getCapabilities as any)) {
        const capabilities = (track.getCapabilities as any)();
        setTorchSupported(!!capabilities?.torch);
      } else {
        setTorchSupported(false);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setHasCameraPermission(false);
      setStatusMessage("Camera access denied or unavailable. Please enable camera permissions.");
    }
  }, []);

  useEffect(() => {
    startCamera(cameraFacing);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (autoScanTimerRef.current) {
        clearInterval(autoScanTimerRef.current);
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [cameraFacing, startCamera]);

  // Flip camera between front and back
  const handleFlipCamera = () => {
    setCameraFacing((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Toggle Torch/Flashlight
  const handleToggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const nextState = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setTorchOn(nextState);
    } catch (e: any) {
      console.warn("Could not toggle torch:", e);
    }
  };

  // Capture frame as base64 from video element
  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  };

  // Perform Gemini analysis on current frame
  const analyzeCurrentFrame = useCallback(
    async (customPrompt?: string, modeOverride?: "scene" | "person" | "text") => {
      const frameBase64 = captureFrame();
      if (!frameBase64) {
        setStatusMessage("Video frame not ready. Please point camera and wait a moment.");
        return;
      }

      const activeMode = modeOverride || analysisMode;
      setIsScanning(true);

      if (activeMode === "person") {
        setStatusMessage(assistantMode === "jarvis" ? "JARVIS analyzing optical biometrics..." : "Zoya vyakti ko pehchan rahi hai...");
        try {
          const knownPeople = getPeople().map((p) => ({
            name: p.name,
            age: p.age,
            work: p.work,
            relationship: p.relationship,
          }));

          const promptText = customPrompt && customPrompt.trim()
            ? customPrompt
            : "Look at this person through the live camera and give their complete details: name, estimated age, work/profession, mood, and visual traits.";

          const result = await analyzePersonFromLiveCamera({
            imageBase64: frameBase64,
            mimeType: "image/jpeg",
            prompt: promptText,
            knownPeople,
            assistantMode,
          });

          setPersonResult(result);
          setStatusMessage(`Subject: ${result.name} (Age: ${result.age}, Work: ${result.work})`);

          if (customPrompt) {
            setLiveChatLog((prev) => [
              ...prev,
              {
                q: customPrompt,
                a: result.spokenResponse,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ]);
          }

          if (result.spokenResponse) {
            speakText(result.spokenResponse);
          }
        } catch (err: any) {
          console.error("Frame analysis failed:", err);
          setStatusMessage(`Error: ${err?.message || "Failed to inspect person"}`);
        } finally {
          setIsScanning(false);
        }
      } else {
        // Scene / Object Breakdown ("Kya Kya Hai" Mode or Text OCR Mode)
        setStatusMessage(
          assistantMode === "jarvis"
            ? "JARVIS decomposing optical scene elements..."
            : activeMode === "text"
            ? "Zoya picture me likha text padh rahi hai..."
            : "Zoya picture analyze kar rahi hai ('usme kya kya hai')..."
        );

        try {
          let promptText = customPrompt && customPrompt.trim() ? customPrompt : "";
          if (!promptText) {
            if (activeMode === "text") {
              promptText = "Examine this picture carefully. Read any visible text, packaging, signs, or screen content aloud and explain what it is.";
            } else {
              promptText = "Look at this picture thoroughly and analyze everything in it ('picture ko analyze karke bataye usme kya kya hai'). List all detected objects, tools, food, devices, people, text, and surroundings. Speak out your findings warmly and conversationally!";
            }
          }

          const result = await analyzeLiveCameraScene({
            imageBase64: frameBase64,
            mimeType: "image/jpeg",
            prompt: promptText,
            assistantMode,
          });

          setSceneResult(result);
          setStatusMessage(`Scene Analyzed: ${result.sceneTitle} (${result.detectedObjects.length} items detected)`);

          if (customPrompt) {
            setLiveChatLog((prev) => [
              ...prev,
              {
                q: customPrompt,
                a: result.spokenResponse,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ]);
          }

          if (result.spokenResponse) {
            speakText(result.spokenResponse);
          }
        } catch (err: any) {
          console.error("Scene analysis failed:", err);
          setStatusMessage(`Error: ${err?.message || "Failed to analyze scene"}`);
        } finally {
          setIsScanning(false);
        }
      }
    },
    [analysisMode, assistantMode, speakText]
  );

  // Trigger initial question once camera starts if requested
  useEffect(() => {
    if (hasCameraPermission && !initialTriggerRef.current) {
      initialTriggerRef.current = true;
      const timer = setTimeout(() => {
        analyzeCurrentFrame(initialQuestion || undefined);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [hasCameraPermission, initialQuestion, analyzeCurrentFrame]);

  // Auto-scan toggle (continuous talking observation)
  const toggleAutoScan = () => {
    if (autoScanEnabled) {
      if (autoScanTimerRef.current) clearInterval(autoScanTimerRef.current);
      setAutoScanEnabled(false);
      setStatusMessage("Continuous auto-scan paused.");
    } else {
      setAutoScanEnabled(true);
      setStatusMessage("Continuous live talking active (Zoya observes & reports every 8s).");
      analyzeCurrentFrame();
      autoScanTimerRef.current = setInterval(() => {
        analyzeCurrentFrame();
      }, 8000);
    }
  };

  // Web Speech Recognition for Live Talking
  const toggleSpeechTalking = () => {
    if (isListeningForSpeech) {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListeningForSpeech(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusMessage("Speech recognition not supported in this browser. You can type in the prompt box.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      recognition.onstart = () => {
        setIsListeningForSpeech(true);
        setStatusMessage("Listening... Speak to Zoya while pointing the camera!");
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interim;
        setSpeechTranscript(currentText);

        if (finalTranscript) {
          setIsListeningForSpeech(false);
          setStatusMessage(`Heard: "${finalTranscript}". Analyzing picture...`);
          analyzeCurrentFrame(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListeningForSpeech(false);
        setStatusMessage("Microphone closed. Tap mic button to talk again.");
      };

      recognition.onend = () => {
        setIsListeningForSpeech(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("Speech Recognition error:", err);
      setIsListeningForSpeech(false);
      setStatusMessage("Could not initialize microphone. Please check mic permissions.");
    }
  };

  // Save or update person in Memory Vault
  const handleSavePersonToVault = () => {
    if (!personResult) return;

    try {
      const cleanName = personResult.name.trim();
      const updated = introducePerson({
        name: cleanName,
        age: personResult.age,
        work: personResult.work,
        role: personResult.relationshipMatch.toLowerCase().includes("owner") ? "owner" : "friend",
        relationship: personResult.relationshipMatch || "Identified via Live Vision",
        initialNotes: `Visual traits: ${personResult.visualTraits}. Mood: ${personResult.mood}. ${personResult.notes}`,
        bio: `${personResult.work} (Age: ${personResult.age}). Recognized via Zoya Live Optical Stream.`,
      });

      if (onPersonUpdated) {
        onPersonUpdated(updated);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setStatusMessage(`Saved ${cleanName} (Age: ${personResult.age}, Work: ${personResult.work}) to Memory Vault!`);
    } catch (e: any) {
      console.error("Save to memory vault error:", e);
      setStatusMessage("Failed to save person profile.");
    }
  };

  // Handle custom typed question
  const handleCustomQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveQuestion.trim()) return;
    const q = liveQuestion;
    setLiveQuestion("");
    analyzeCurrentFrame(q);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Stream Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-5xl h-[94vh] max-h-[900px] bg-[#070b16] border border-cyan-500/30 rounded-3xl shadow-[0_0_70px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-white"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a0f20] border-b border-cyan-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/50 flex items-center justify-center overflow-hidden shadow-inner">
              <Eye size={20} className="text-cyan-400 animate-pulse" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-mono font-bold tracking-wider text-cyan-300">
                  LIVE CAMERA TALKING & PICTURE ANALYZER
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-mono flex items-center gap-1 font-bold animate-pulse">
                  <Radio size={10} />
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-white/60 font-sans">
                Camera dikha kar poochhein — Zoya picture ko analyze karke batayegi usme kya kya hai!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Flashlight/Torch toggle if supported */}
            {torchSupported && (
              <button
                onClick={handleToggleTorch}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  torchOn
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70"
                }`}
                title={torchOn ? "Turn Flashlight OFF" : "Turn Flashlight ON"}
              >
                <Flashlight size={16} className={torchOn ? "text-amber-400" : ""} />
              </button>
            )}

            {/* Camera Switcher (Front / Back) */}
            <button
              onClick={handleFlipCamera}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 hover:text-white transition-colors cursor-pointer"
              title={`Switch Camera (Currently: ${cameraFacing === 'user' ? 'Front (Selfie)' : 'Back (Room/Object)'})`}
            >
              <RefreshCw size={16} />
            </button>

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/70 hover:text-red-400 transition-colors cursor-pointer"
              title="Close Camera Stream"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-4 py-2 bg-[#080d1a] border-b border-cyan-500/15 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[11px] font-mono text-white/40 uppercase mr-1 flex items-center gap-1">
            <Layers size={12} /> Mode:
          </span>
          <button
            onClick={() => {
              setAnalysisMode("scene");
              if (!sceneResult) analyzeCurrentFrame(undefined, "scene");
            }}
            className={`px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              analysisMode === "scene"
                ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 shadow-sm"
                : "bg-white/5 text-white/60 hover:text-white border border-white/10"
            }`}
          >
            <Box size={13} />
            <span>🔍 Kya Kya Hai (Scene & Objects)</span>
          </button>

          <button
            onClick={() => {
              setAnalysisMode("person");
              if (!personResult) analyzeCurrentFrame(undefined, "person");
            }}
            className={`px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              analysisMode === "person"
                ? "bg-purple-500/25 text-purple-200 border border-purple-400/50 shadow-sm"
                : "bg-white/5 text-white/60 hover:text-white border border-white/10"
            }`}
          >
            <User size={13} />
            <span>👤 Person Details (Name, Age, Work)</span>
          </button>

          <button
            onClick={() => {
              setAnalysisMode("text");
              analyzeCurrentFrame("Read any text or document clearly in front of the camera", "text");
            }}
            className={`px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              analysisMode === "text"
                ? "bg-emerald-500/25 text-emerald-200 border border-emerald-400/50 shadow-sm"
                : "bg-white/5 text-white/60 hover:text-white border border-white/10"
            }`}
          >
            <FileText size={13} />
            <span>📖 Read Text / OCR (Padh Ke Batao)</span>
          </button>
        </div>

        {/* Modal Body: Left = Camera Viewport, Right = Live Visual Analysis & Talking Feed */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Left Column: Live Camera Video Viewport */}
          <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-cyan-500/20">
            {/* Live Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* If camera is not ready or permission denied */}
            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/90 z-20">
                <Camera size={48} className="text-red-400 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">Camera Permission Denied</h3>
                <p className="text-xs text-white/60 max-w-sm mb-4">
                  Please enable camera access in your browser so Zoya can analyze objects, documents, and scenes live.
                </p>
                <button
                  onClick={() => startCamera(cameraFacing)}
                  className="px-4 py-2 bg-cyan-500 text-black font-semibold text-xs rounded-xl hover:bg-cyan-400 cursor-pointer"
                >
                  Retry Camera
                </button>
              </div>
            )}

            {/* Tactical Optical HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-10">
              {/* Corner brackets */}
              <div className="flex justify-between">
                <div className="w-8 h-8 border-t-2 border-l-2 border-cyan-400/70" />
                <div className="w-8 h-8 border-t-2 border-r-2 border-cyan-400/70" />
              </div>

              {/* Center Target Box */}
              <div className="self-center my-auto relative w-56 h-56 sm:w-72 sm:h-72 border border-cyan-400/30 rounded-3xl flex items-center justify-center">
                <div className="w-full h-full absolute inset-0 border border-dashed border-cyan-500/20 rounded-3xl animate-pulse" />
                <div className="w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                <div className="w-4 h-4 border-b-2 border-r-2 border-cyan-400 absolute bottom-0 right-0" />
                <div className="w-4 h-4 border-t-2 border-r-2 border-cyan-400 absolute top-0 right-0" />
                <div className="w-4 h-4 border-b-2 border-l-2 border-cyan-400 absolute bottom-0 left-0" />

                {/* Laser Scanning Line Animation */}
                {isScanning && (
                  <motion.div
                    initial={{ y: -120, opacity: 0 }}
                    animate={{ y: [-110, 110, -110], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                    className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(6,182,212,0.9)]"
                  />
                )}

                <span className="absolute -top-3 left-4 px-2.5 py-0.5 bg-black/85 border border-cyan-500/40 rounded text-[9px] font-mono text-cyan-300 uppercase tracking-wider">
                  {analysisMode === "scene"
                    ? "Target: Scene & Objects ('Kya Kya Hai')"
                    : analysisMode === "person"
                    ? "Target: Person Biometrics (Name, Age, Work)"
                    : "Target: Text & OCR Documents"}
                </span>
              </div>

              {/* Bottom HUD metrics */}
              <div className="flex justify-between items-end">
                <div className="w-8 h-8 border-b-2 border-l-2 border-cyan-400/70" />
                <div className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[10px] font-mono text-cyan-300/90 flex items-center gap-2">
                  <Activity size={12} className="text-cyan-400 animate-pulse" />
                  <span>ZOYA OPTICAL SENSOR 3.8F</span>
                  <span>•</span>
                  <span>{cameraFacing === "user" ? "FRONT" : "BACK"} CAMERA</span>
                  {torchOn && <span className="text-amber-300">• FLASH ON</span>}
                </div>
                <div className="w-8 h-8 border-b-2 border-r-2 border-cyan-400/70" />
              </div>
            </div>

            {/* Quick Action Floating Buttons on Video */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-center gap-2.5 flex-wrap">
              <button
                onClick={() => analyzeCurrentFrame()}
                disabled={isScanning}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold text-xs sm:text-sm tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.45)] disabled:opacity-50 transition-all hover:scale-105 cursor-pointer"
              >
                <Scan size={16} />
                <span>
                  {isScanning
                    ? "Zoya Analyzing..."
                    : analysisMode === "scene"
                    ? "Analyze Picture (Kya Kya Hai)"
                    : analysisMode === "person"
                    ? "Scan Person Details"
                    : "Read Text in Frame"}
                </span>
              </button>

              <button
                onClick={toggleAutoScan}
                className={`px-3 py-2 rounded-full border text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md ${
                  autoScanEnabled
                    ? "bg-red-500/20 text-red-300 border-red-500/50 shadow-lg"
                    : "bg-black/60 text-white/80 border-white/20 hover:bg-black/80"
                }`}
                title="Continuous auto-talking: Zoya observes camera & speaks every 8s"
              >
                <Activity size={14} className={autoScanEnabled ? "text-red-400 animate-pulse" : "text-white/40"} />
                <span>{autoScanEnabled ? "Auto-Talk ON" : "Auto-Talk"}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Scene Dossier & Live Talking Hub */}
          <div className="w-full md:w-[440px] lg:w-[480px] bg-[#090e1e] flex flex-col justify-between shrink-0 overflow-hidden border-t md:border-t-0 border-cyan-500/20">
            {/* Status Bar */}
            <div className="px-4 py-2 bg-black/50 border-b border-white/10 flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] text-cyan-300 tracking-wider flex items-center gap-1.5 truncate">
                <span className={`w-2 h-2 rounded-full shrink-0 ${isScanning ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`} />
                <span className="truncate">{statusMessage}</span>
              </span>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {/* SCENE & OBJECT ANALYSIS VIEW ("Kya Kya Hai") */}
              {analysisMode === "scene" && sceneResult && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  {/* Scene Title Card */}
                  <div className="bg-gradient-to-br from-[#10172c] to-[#0a0f1e] border border-cyan-500/30 rounded-2xl p-4 shadow-xl">
                    <div className="flex items-start justify-between border-b border-white/10 pb-3 mb-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider flex items-center gap-1">
                          <Compass size={11} /> Scene Classification
                        </span>
                        <h3 className="text-lg font-bold text-white tracking-wide mt-0.5">
                          {sceneResult.sceneTitle}
                        </h3>
                        <p className="text-xs text-white/70 mt-1 leading-relaxed">
                          {sceneResult.sceneSummary}
                        </p>
                      </div>

                      <button
                        onClick={() => speakText(sceneResult.spokenResponse)}
                        className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-white transition-all cursor-pointer shrink-0 ml-2"
                        title="Replay Zoya's spoken review"
                      >
                        <Volume2 size={16} className={isSpeakingResult ? "animate-bounce text-cyan-400" : ""} />
                      </button>
                    </div>

                    {/* Zoya's Live Spoken Reaction */}
                    <div className="bg-gradient-to-r from-cyan-950/40 via-violet-950/30 to-pink-950/40 border border-cyan-500/25 rounded-xl p-3 mb-3">
                      <span className="text-[10px] font-mono uppercase text-cyan-300 block mb-1 flex items-center gap-1 font-semibold">
                        <Sparkles size={11} className="text-cyan-400" />
                        {assistantMode === "jarvis" ? "J.A.R.V.I.S. Visual Debriefing" : "Zoya's Voice Description (Live Talking)"}
                      </span>
                      <p className="text-xs text-cyan-100 italic leading-relaxed">
                        "{sceneResult.spokenResponse}"
                      </p>
                    </div>

                    {/* Detected Objects Section: "Usme Kya Kya Hai" */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                          <Box size={13} />
                          Isme Kya Kya Hai ({sceneResult.detectedObjects.length} Objects)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1">
                        {sceneResult.detectedObjects.map((obj, i) => (
                          <div
                            key={i}
                            className="p-2 rounded-xl bg-black/40 border border-white/10 hover:border-cyan-500/30 transition-all flex items-start justify-between gap-2"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-white">{obj.name}</span>
                                {obj.category && (
                                  <span className="px-1.5 py-0.2 rounded bg-cyan-500/15 border border-cyan-500/30 text-[9px] font-mono text-cyan-300">
                                    {obj.category}
                                  </span>
                                )}
                                {obj.locationInFrame && (
                                  <span className="text-[9px] font-mono text-white/40">
                                    • {obj.locationInFrame}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-white/70 mt-0.5">{obj.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Text / OCR Detected in Frame */}
                    {sceneResult.textDetected && sceneResult.textDetected !== "None detected" && (
                      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-2.5 mb-3">
                        <span className="text-[10px] font-mono uppercase text-amber-300 block mb-1 flex items-center gap-1">
                          <FileText size={11} /> Text & Labels Read in Picture:
                        </span>
                        <p className="text-xs text-white/90 font-mono leading-relaxed bg-black/30 p-2 rounded border border-white/5">
                          {sceneResult.textDetected}
                        </p>
                      </div>
                    )}

                    {/* Environment & People Specs */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-white/70">
                      <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                        <span className="text-[9px] text-white/40 uppercase block">Location & Vibe</span>
                        <span className="text-white font-semibold block truncate">{sceneResult.environment.locationType}</span>
                        <span className="text-[10px] text-cyan-300/80">{sceneResult.environment.vibe}</span>
                      </div>

                      <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                        <span className="text-[9px] text-white/40 uppercase block">People in Frame</span>
                        <span className="text-white font-semibold block">
                          {sceneResult.peopleDetected.count > 0 ? `${sceneResult.peopleDetected.count} Person(s)` : "None"}
                        </span>
                        <span className="text-[10px] text-purple-300 truncate block">
                          {sceneResult.peopleDetected.description}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PERSON DETAILS VIEW (Name, Age, Work) */}
              {analysisMode === "person" && personResult && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="bg-gradient-to-br from-[#10172c] to-[#0a0f1e] border border-purple-500/30 rounded-2xl p-4 shadow-xl">
                    <div className="flex items-start justify-between border-b border-white/10 pb-3 mb-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-purple-400 tracking-wider">Identified Individual</span>
                        <h3 className="text-xl font-bold text-white tracking-wide">
                          {personResult.name}
                        </h3>
                        <span className="inline-block px-2 py-0.5 mt-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono">
                          {personResult.relationshipMatch}
                        </span>
                      </div>

                      <button
                        onClick={() => speakText(personResult.spokenResponse)}
                        className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:text-white transition-all cursor-pointer"
                        title="Replay Zoya's spoken review"
                      >
                        <Volume2 size={16} className={isSpeakingResult ? "animate-bounce text-purple-400" : ""} />
                      </button>
                    </div>

                    {/* Core Triad: Name, Age, Work */}
                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      <div className="bg-black/40 border border-white/10 rounded-xl p-2.5">
                        <span className="text-[10px] font-mono uppercase text-white/40 block">Estimated Age</span>
                        <span className="text-base font-mono font-bold text-pink-300">{personResult.age}</span>
                      </div>

                      <div className="bg-black/40 border border-white/10 rounded-xl p-2.5">
                        <span className="text-[10px] font-mono uppercase text-white/40 block">Mood / Expression</span>
                        <span className="text-xs font-semibold text-emerald-300 truncate block">{personResult.mood}</span>
                      </div>

                      <div className="col-span-2 bg-black/40 border border-white/10 rounded-xl p-2.5">
                        <span className="text-[10px] font-mono uppercase text-white/40 block">Work / Profession</span>
                        <span className="text-sm font-semibold text-cyan-200">{personResult.work}</span>
                      </div>
                    </div>

                    {/* Visual Traits */}
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5 mb-3">
                      <span className="text-[10px] font-mono uppercase text-white/40 block mb-1">Visual Appearance</span>
                      <p className="text-xs text-white/80 leading-relaxed">{personResult.visualTraits}</p>
                    </div>

                    {/* Spoken Remarks */}
                    <div className="bg-gradient-to-r from-purple-950/40 to-pink-950/40 border border-purple-500/20 rounded-xl p-3 mb-3">
                      <span className="text-[10px] font-mono uppercase text-purple-300 block mb-1 flex items-center gap-1 font-semibold">
                        <Sparkles size={11} /> Zoya's Verbal Dossier
                      </span>
                      <p className="text-xs text-purple-200 italic leading-relaxed">
                        "{personResult.spokenResponse}"
                      </p>
                    </div>

                    {/* Save Person to Memory Vault */}
                    <button
                      onClick={handleSavePersonToVault}
                      className={`w-full py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        saveSuccess
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                          : "bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 hover:border-purple-500/60"
                      }`}
                    >
                      {saveSuccess ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          <span>Saved to Memory Vault!</span>
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          <span>Save Person to Memory Vault</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TEXT OCR VIEW */}
              {analysisMode === "text" && sceneResult && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="bg-gradient-to-br from-[#10172c] to-[#0a0f1e] border border-emerald-500/30 rounded-2xl p-4 shadow-xl">
                    <div className="flex items-start justify-between border-b border-white/10 pb-3 mb-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                          <FileText size={11} /> Optical Document & Text Reader
                        </span>
                        <h3 className="text-lg font-bold text-white tracking-wide mt-0.5">
                          Text Found in Frame
                        </h3>
                      </div>

                      <button
                        onClick={() => speakText(sceneResult.spokenResponse)}
                        className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:text-white transition-all cursor-pointer"
                        title="Replay Zoya's spoken reading"
                      >
                        <Volume2 size={16} className={isSpeakingResult ? "animate-bounce text-emerald-400" : ""} />
                      </button>
                    </div>

                    <div className="bg-black/50 border border-emerald-500/30 rounded-xl p-3 mb-3">
                      <span className="text-[10px] font-mono uppercase text-emerald-300 block mb-1 font-semibold">
                        Transcribed Text / Content:
                      </span>
                      <p className="text-xs text-white font-mono leading-relaxed whitespace-pre-wrap">
                        {sceneResult.textDetected || "No clear text detected in this frame."}
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/20 rounded-xl p-3">
                      <span className="text-[10px] font-mono uppercase text-emerald-300 block mb-1 flex items-center gap-1 font-semibold">
                        <Sparkles size={11} /> Zoya Explains What is Written:
                      </span>
                      <p className="text-xs text-emerald-200 italic leading-relaxed">
                        "{sceneResult.spokenResponse}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty / Getting Started State */}
              {!sceneResult && !personResult && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mb-3 shadow-inner">
                    <Eye size={28} className="text-cyan-400 animate-pulse" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">Live Camera Ready</h4>
                  <p className="text-xs text-white/60 max-w-sm mb-4 leading-relaxed">
                    Point your camera at any object, product, book, setup, or person. Tap <strong>Analyze Picture</strong> or speak to Zoya!
                  </p>
                  <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-xl p-3 text-left w-full text-[11px] text-cyan-200/90 space-y-1.5">
                    <p className="font-semibold text-cyan-300 flex items-center gap-1">
                      <Sparkles size={12} /> Zoya Camera Features:
                    </p>
                    <p>• <strong>Isme Kya Kya Hai:</strong> Identifies all objects, gadgets, tools, and surroundings</p>
                    <p>• <strong>Live Talking:</strong> Speaks out results naturally in Hindi/Hinglish</p>
                    <p>• <strong>Person Details:</strong> Scans Name, estimated Age, and Work</p>
                    <p>• <strong>Text & OCR:</strong> Reads books, packaging, labels & medicine strips</p>
                  </div>
                </div>
              )}

              {/* Live Chat Log if User had Voice Q&A */}
              {liveChatLog.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-[10px] font-mono uppercase text-white/40 block">Camera Conversation Log:</span>
                  {liveChatLog.slice(-3).map((item, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-black/40 border border-white/5 text-xs space-y-1">
                      <p className="text-cyan-300 font-semibold">You: "{item.q}"</p>
                      <p className="text-white/80 italic">Zoya: "{item.a}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Live Talking & Interactive Controls */}
            <div className="p-3 bg-[#0a0f22] border-t border-cyan-500/20 space-y-2.5">
              {/* Mic Speech Recognition Banner */}
              {isListeningForSpeech && (
                <div className="bg-cyan-500/15 border border-cyan-500/40 rounded-xl p-2.5 flex items-center justify-between text-xs text-cyan-300 animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>Listening... {speechTranscript ? `"${speechTranscript}"` : "Speak: 'Zoya dekho yeh kya hai'"}</span>
                  </div>
                  <button
                    onClick={toggleSpeechTalking}
                    className="text-[10px] text-red-400 uppercase font-mono px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 cursor-pointer"
                  >
                    Stop
                  </button>
                </div>
              )}

              {/* Action Buttons: Live Talk Mic & Question Form */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSpeechTalking}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-center cursor-pointer ${
                    isListeningForSpeech
                      ? "bg-red-500/20 border-red-500/50 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                      : "bg-gradient-to-r from-cyan-600/30 via-blue-600/30 to-violet-600/30 hover:from-cyan-600/50 hover:to-violet-600/50 border-cyan-500/40 text-cyan-200"
                  }`}
                  title={isListeningForSpeech ? "Stop Listening" : "Live Camera Talk: Speak to Zoya"}
                >
                  {isListeningForSpeech ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                {/* Question Form */}
                <form onSubmit={handleCustomQuestionSubmit} className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={liveQuestion}
                    onChange={(e) => setLiveQuestion(e.target.value)}
                    placeholder="Ask Zoya (e.g. 'Isme kya kya hai?', 'Yeh kya cheez hai?')..."
                    className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={!liveQuestion.trim() || isScanning}
                    className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>

              {/* Quick Prompt Pill Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5">
                <button
                  onClick={() => {
                    setAnalysisMode("scene");
                    analyzeCurrentFrame("Look at this picture thoroughly and tell me what all is in it ('isme kya kya hai')", "scene");
                  }}
                  className="px-2.5 py-1 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-[10px] font-mono text-cyan-200 whitespace-nowrap cursor-pointer flex items-center gap-1"
                >
                  <span>🔍 Isme Kya Kya Hai?</span>
                </button>

                <button
                  onClick={() => {
                    setAnalysisMode("person");
                    analyzeCurrentFrame("Who is this person? Give their name, age, and work.", "person");
                  }}
                  className="px-2.5 py-1 rounded-full bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-[10px] font-mono text-purple-200 whitespace-nowrap cursor-pointer flex items-center gap-1"
                >
                  <span>👤 Name, Age & Work</span>
                </button>

                <button
                  onClick={() => {
                    setAnalysisMode("text");
                    analyzeCurrentFrame("Read any text, labels, or screen content clearly visible in front of the camera", "text");
                  }}
                  className="px-2.5 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-[10px] font-mono text-emerald-200 whitespace-nowrap cursor-pointer flex items-center gap-1"
                >
                  <span>📖 Text Padh Ke Batao</span>
                </button>

                <button
                  onClick={() => {
                    setAnalysisMode("scene");
                    analyzeCurrentFrame("Analyze the room environment, lighting, and ambiance in this picture.", "scene");
                  }}
                  className="px-2.5 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-[10px] font-mono text-amber-200 whitespace-nowrap cursor-pointer flex items-center gap-1"
                >
                  <span>🎨 Room & Lighting</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
