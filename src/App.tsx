import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Loader2, Volume2, VolumeX, Keyboard, Send, Trash2, MessageSquare, X, Globe, ExternalLink, Sparkles, Smartphone, Phone, Image, Code2, ShieldAlert, Cpu, ListChecks, Clock, CheckCircle2, Search, Filter, Calendar, Wifi, WifiOff, Mail, Languages, RefreshCw, Tv, Play, Camera, Download, Flashlight, Bluetooth, Brain, Heart, Coffee, Dna, Eye } from "lucide-react";
import { getZoyaResponse, getZoyaAudio, resetZoyaSession, getZoyaSearchSummary, getZoyaChromosomeSearch, getZoyaWebsiteAnalysis, cleanGroundingUrl } from "./services/geminiService";
import { processCommand } from "./services/commandService";
import { getActivePerson, getAllPersons, setActivePersonId, findOrCreatePerson, addMemoryToPerson, introducePerson, recordConversationTurn, PersonProfile, getPersonDetails } from "./services/memoryService";
import { LiveSessionManager } from "./services/liveService";
import Visualizer from "./components/Visualizer";
import PermissionModal from "./components/PermissionModal";
import InstallModal from "./components/InstallModal";
import PhoneCallModal from "./components/PhoneCallModal";
import PhotoShareModal from "./components/PhotoShareModal";
import WhatsAppModal from "./components/WhatsAppModal";
import GoogleSearchModal from "./components/GoogleSearchModal";
import CodingCyberLab from "./components/CodingCyberLab";
import TeacherClassroomModal from "./components/TeacherClassroomModal";
import ReactShortcutsModal from "./components/ReactShortcutsModal";
import TimetableReminderModal from "./components/TimetableReminderModal";
import EmailNotesModal from "./components/EmailNotesModal";
import TranslationModal from "./components/TranslationModal";
import AutoUpdateModal from "./components/AutoUpdateModal";
import MobileSystemControlModal from "./components/MobileSystemControlModal";
import DeviceControlModal from "./components/DeviceControlModal";
import PersonMemoryModal from "./components/PersonMemoryModal";
import { LiveVisionStreamModal } from "./components/LiveVisionStreamModal";
import { hardwareManager } from "./services/hardwareService";
import { YouTubeModal } from "./components/YouTubeModal";
import JarvisHud from "./components/JarvisHud";
import { playPCM, speakTextFallback } from "./utils/audioUtils";
import { motion, AnimatePresence } from "motion/react";
import { sassyCatchphrases, hemantRoasts, detectSentiment, ZoyaSentiment } from "./utils/zoyaContent";
import zoyaAvatar from "./assets/images/zoya_avatar_1784483912355.jpg";
import { PhoneCall, MediaAttachment, TimetableSlot, CompletedAction } from "./types/assistant";

type AppState = "idle" | "listening" | "processing" | "speaking";

interface ChatMessage {
  id: string;
  sender: "user" | "zoya";
  text: string;
  searchCard?: {
    query: string;
    sources: { title: string; url: string }[];
    timestamp: string;
  };
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function App() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [assistantMode, setAssistantMode] = useState<"zoya" | "jarvis">(() => {
    const saved = localStorage.getItem("zoya_assistant_mode");
    return saved === "jarvis" ? "jarvis" : "zoya";
  });
  const [showCallModal, setShowCallModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showReactShortcutsModal, setShowReactShortcutsModal] = useState(false);
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showMobileControlModal, setShowMobileControlModal] = useState(false);
  const [showHardwareModal, setShowHardwareModal] = useState(false);
  const [hardwareTab, setHardwareTab] = useState<"torch" | "wifi" | "bluetooth">("torch");
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [youtubeQuery, setYoutubeQuery] = useState("Arijit Singh songs");
  const [systemVersion, setSystemVersion] = useState(() => {
    return localStorage.getItem("zoya_system_version") || "v5.0.0 Ultra Suite (2026 Edition)";
  });
  const [labTab, setLabTab] = useState<"coding" | "cybersecurity">("coding");
  const [callRecipient, setCallRecipient] = useState("Dr. Sharma Dental Clinic");
  const [photoRecipient, setPhotoRecipient] = useState("Alex");
  const [photoAutoStartCamera, setPhotoAutoStartCamera] = useState(true);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappRecipient, setWhatsappRecipient] = useState("Alex");
  const [whatsappPhone, setWhatsappPhone] = useState("+91 98765 43210");
  const [whatsappInitialMessage, setWhatsappInitialMessage] = useState("");
  const [whatsappAutoSend, setWhatsappAutoSend] = useState(false);
  const [showGoogleSearchModal, setShowGoogleSearchModal] = useState(false);
  const [googleSearchQuery, setGoogleSearchQuery] = useState("Today's top world news");
  const [googleSearchMode, setGoogleSearchMode] = useState<"google" | "chromosome" | "website">("google");
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [showLiveVisionModal, setShowLiveVisionModal] = useState(false);
  const [liveVisionInitialQuery, setLiveVisionInitialQuery] = useState<string>("");
  const [activePerson, setActivePerson] = useState<PersonProfile>(() => getActivePerson());
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );
  const [isMuted, setIsMuted] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionErrorMsg, setPermissionErrorMsg] = useState<string>("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sentiment, setSentiment] = useState<ZoyaSentiment>("neutral");
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [talkSpeed, setTalkSpeed] = useState<number>(1.0);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentRoastIndex, setCurrentRoastIndex] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState("durgeshu49@gmail.com");
  const [emailPresetSubject, setEmailPresetSubject] = useState("");
  const [emailPresetBody, setEmailPresetBody] = useState("");
  const [isPhoneMode, setIsPhoneMode] = useState<boolean>(true);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("zoya_chat_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
    return [];
  });
  const messagesRef = useRef(messages);
  const liveSessionRef = useRef<LiveSessionManager | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const DEFAULT_COMPLETED_ACTIONS: CompletedAction[] = [
    {
      id: "act-1",
      type: "call",
      title: "Call to Dr. Sharma Dental Clinic",
      recipientOrTarget: "Dr. Sharma Dental Clinic (+91 98765 43210)",
      details: "Confirmed Dental Checkup & Consultation appointment for tomorrow at 04:00 PM IST.",
      timestamp: "Today, 09:15 AM",
      status: "Confirmed",
      metadata: { duration: "00:45", venue: "Dr. Sharma Dental Clinic" }
    },
    {
      id: "act-2",
      type: "photo",
      title: "Shared JARVIS AI Architecture Diagram",
      recipientOrTarget: "Alex Johnson (Tech Lead)",
      details: "Sent full system architecture diagram & UI wireframe snapshot via WhatsApp.",
      timestamp: "Today, 08:50 AM",
      status: "Sent",
      metadata: { imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop" }
    },
    {
      id: "act-3",
      type: "reminder",
      title: "Timetable Alarm: React Coding Session",
      recipientOrTarget: "Study & Work Timetable",
      details: "Set voice alarm & study reminder for 09:30 AM (Category: Work).",
      timestamp: "Today, 08:30 AM",
      status: "Scheduled",
      metadata: { category: "Work" }
    }
  ];

  const [completedActions, setCompletedActions] = useState<CompletedAction[]>(() => {
    const saved = localStorage.getItem("zoya_completed_actions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse completed actions history", e);
      }
    }
    return DEFAULT_COMPLETED_ACTIONS;
  });

  const [chatTab, setChatTab] = useState<"feed" | "actions">("feed");
  const [actionFilter, setActionFilter] = useState<"all" | "call" | "photo" | "reminder">("all");
  const [actionSearchQuery, setActionSearchQuery] = useState("");

  useEffect(() => {
    messagesRef.current = messages;
    localStorage.setItem("zoya_chat_history", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (liveSessionRef.current) {
      liveSessionRef.current.isMuted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem("zoya_completed_actions", JSON.stringify(completedActions));
  }, [completedActions]);

  const logCompletedAction = (actionData: Omit<CompletedAction, "id" | "timestamp"> & { timestamp?: string }) => {
    const newAction: CompletedAction = {
      id: "act-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      timestamp: actionData.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ", Today",
      ...actionData
    };
    setCompletedActions((prev) => [newAction, ...prev]);
  };

  const handleAppointmentBooked = (call: PhoneCall) => {
    logCompletedAction({
      type: "call",
      title: `Call to ${call.contactName}`,
      recipientOrTarget: `${call.contactName} (${call.phoneNumber})`,
      details: call.appointmentDetails
        ? `Confirmed ${call.appointmentDetails.service} at ${call.appointmentDetails.venue} for ${call.appointmentDetails.date} at ${call.appointmentDetails.time}`
        : `Phone call completed. Purpose: ${call.purpose}`,
      status: "Confirmed",
      metadata: {
        duration: `${call.durationSeconds}s`,
        venue: call.appointmentDetails?.venue
      }
    });
  };

  const handlePhotoSent = (attachment: MediaAttachment) => {
    logCompletedAction({
      type: "photo",
      title: `Sent ${attachment.title}`,
      recipientOrTarget: `${attachment.sentTo || "Contact"} (${attachment.contactPhone || ""})`,
      details: attachment.caption || `Photo shared successfully to ${attachment.sentTo}`,
      status: "Sent",
      metadata: {
        imageUrl: attachment.previewUrl
      }
    });
  };

  const handleTimetableSlotAdded = (slot: TimetableSlot) => {
    logCompletedAction({
      type: "reminder",
      title: `Reminder: ${slot.activity}`,
      recipientOrTarget: `Timetable (${slot.time})`,
      details: `Scheduled study alert & voice alarm for ${slot.time} (${slot.category} category)`,
      status: "Scheduled",
      metadata: {
        category: slot.category
      }
    });
  };

  const deleteCompletedAction = (id: string) => {
    setCompletedActions((prev) => prev.filter((act) => act.id !== id));
  };

  const clearAllCompletedActions = () => {
    if (confirm("Are you sure you want to clear the completed actions history?")) {
      setCompletedActions([]);
    }
  };

  const filteredCompletedActions = completedActions.filter((act) => {
    const matchesFilter = actionFilter === "all" || act.type === actionFilter;
    const q = actionSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      act.title.toLowerCase().includes(q) ||
      (act.recipientOrTarget && act.recipientOrTarget.toLowerCase().includes(q)) ||
      act.details.toLowerCase().includes(q) ||
      act.status.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const handleOpenEmailNotes = useCallback((subject?: string, body?: string) => {
    if (subject) setEmailPresetSubject(subject);
    if (body) setEmailPresetBody(body);
    setShowEmailModal(true);
  }, []);

  const handleOpenWhatsApp = useCallback((recipient?: string, phone?: string, message?: string, autoSend?: boolean) => {
    if (recipient) setWhatsappRecipient(recipient);
    if (phone) setWhatsappPhone(phone);
    if (message) setWhatsappInitialMessage(message);
    setWhatsappAutoSend(!!autoSend);
    setShowWhatsAppModal(true);
  }, []);

  const handleOpenGoogleSearch = useCallback((searchQuery?: string, mode: "google" | "chromosome" | "website" = "google") => {
    if (searchQuery && searchQuery.trim()) {
      setGoogleSearchQuery(searchQuery.trim());
    }
    setGoogleSearchMode(mode);
    setShowGoogleSearchModal(true);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRestartSystem = useCallback(() => {
    resetZoyaSession();
    if (liveSessionRef.current) {
      liveSessionRef.current.stop();
      liveSessionRef.current = null;
    }
    setAppState("idle");
    setIsSessionActive(false);
    setMessages([
      {
        id: "restart-" + Date.now(),
        sender: "zoya",
        text: `🔄 System restarted fresh, Hemant! All cached sessions cleared, audio channels reset, and talk speed optimized to ${talkSpeed}x.`
      }
    ]);
  }, [talkSpeed]);

  const shufflePhrase = useCallback(() => {
    setCurrentPhraseIndex((prev) => (prev + 1) % sassyCatchphrases.length);
  }, []);

  const shuffleRoast = useCallback(() => {
    setCurrentRoastIndex((prev) => (prev + 1) % hemantRoasts.length);
  }, []);

  // Automatically wipe memory and restart when Hemant takes over!
  useEffect(() => {
    const lastCreator = localStorage.getItem("zoya_creator_name");
    if (lastCreator !== "hemant") {
      localStorage.removeItem("zoya_chat_history");
      setMessages([]);
      resetZoyaSession();
      localStorage.setItem("zoya_creator_name", "hemant");
      
      setMessages([
        {
          id: "welcome-hemant",
          sender: "zoya",
          text: "Pranam Hemant! 💅 Main hoon Zoya & JARVIS, aapki sassy and ultra-smart AI assistant. Hemant created me, so now you are my master! I can make phone appointments, send photos, teach coding, and audit cybersecurity. What's our order today?"
        }
      ]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, appState]);

  const playAudioOrFallback = useCallback(async (text: string) => {
    if (isMuted) return;
    setAppState("speaking");
    try {
      const audioBase64 = await getZoyaAudio(text);
      if (audioBase64) {
        await playPCM(audioBase64, talkSpeed);
      } else {
        await speakTextFallback(text, talkSpeed);
      }
    } catch (err) {
      console.warn("TTS error, using browser speech fallback:", err);
      await speakTextFallback(text, talkSpeed);
    } finally {
      setAppState("idle");
    }
  }, [isMuted, talkSpeed]);

  const handleTextCommand = useCallback(async (finalTranscript: string) => {
    if (!finalTranscript.trim()) {
      setAppState("idle");
      return;
    }

    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "user", text: finalTranscript }]);
    
    // If live session is active, send text through it
    if (isSessionActive && liveSessionRef.current) {
      liveSessionRef.current.sendText(finalTranscript);
      return;
    }

    setAppState("processing");

    // 1. Check for commands
    const commandResult = processCommand(finalTranscript);

    let responseText = "";

    if (commandResult.isCallAction) {
      const recipient = commandResult.recipient || "Dr. Sharma Dental Clinic";
      setCallRecipient(recipient);
      setShowCallModal(true);
      responseText = `Launching AI Phone Call module for ${recipient}... Dialing now!`;
      const detected = detectSentiment(responseText);
      setSentiment(detected);
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);
      await playAudioOrFallback(responseText);
    } else if (commandResult.isWhatsAppAction) {
      const recipient = commandResult.whatsappRecipient || commandResult.recipient || "Durgesh";
      const phone = commandResult.whatsappPhone || "+919876543210";
      const msg = commandResult.whatsappMessage || "";
      const autoSend = !!commandResult.autoSendWhatsApp;

      setWhatsappRecipient(recipient);
      setWhatsappPhone(phone);
      setWhatsappInitialMessage(msg);
      setWhatsappAutoSend(autoSend);
      setShowWhatsAppModal(true);

      if (autoSend && msg) {
        responseText = `Automatic WhatsApp dispatch initiated! Typing and sending message to ${recipient} (${phone}): "${msg}"`;
      } else {
        responseText = `Opening WhatsApp Messenger for ${recipient} (${phone}). Ready to type and send your message!`;
      }

      const detected = detectSentiment(responseText);
      setSentiment(detected);
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);
      await playAudioOrFallback(responseText);
    } else if (commandResult.isPhotoAction) {
      const recipient = commandResult.recipient || "Alex";
      setPhotoRecipient(recipient);
      setPhotoAutoStartCamera(commandResult.autoStartCamera !== false);
      setShowPhotoModal(true);
      responseText = commandResult.autoStartCamera
        ? "Opening Live Camera & Take Photo Studio! Viewfinder active, Hemant."
        : `Opening Photo Dispatcher to send media to ${recipient}!`;
      const detected = detectSentiment(responseText);
      setSentiment(detected);
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);
      await playAudioOrFallback(responseText);
    } else if (commandResult.isHardwareAction) {
      const tab = commandResult.hardwareTab || "torch";
      setHardwareTab(tab);
      setShowHardwareModal(true);

      if (tab === "torch") {
        if (commandResult.torchState !== undefined) {
          await hardwareManager.toggleTorch(commandResult.torchState);
        } else {
          await hardwareManager.toggleTorch();
        }
        responseText = commandResult.torchState === false 
          ? "Switching OFF Mobile Torch / Flashlight for you, Hemant!" 
          : "Turning ON Mobile Torch (Camera LED / Screen Max Lumens) for you, Hemant! 💡";
      } else if (tab === "wifi") {
        if (commandResult.wifiState !== undefined) {
          hardwareManager.toggleWifi(commandResult.wifiState);
        }
        responseText = commandResult.wifiState === false
          ? "Disconnected Wi-Fi connection for you, Hemant."
          : "Launching Mobile Wi-Fi Controller & Network Manager! Scanning 5.0 GHz wireless bands for Hemant. 📶";
      } else if (tab === "bluetooth") {
        if (commandResult.bluetoothState !== undefined) {
          hardwareManager.toggleBluetooth(commandResult.bluetoothState);
        }
        responseText = commandResult.bluetoothState === false
          ? "Disabled Bluetooth radio."
          : "Launching Bluetooth 5.3 BLE Manager! Scanning nearby headphones, earbuds & speakers for Hemant. 🎧";
      } else {
        responseText = `Executing ${commandResult.action} for you, Hemant!`;
      }

      const detected = detectSentiment(responseText);
      setSentiment(detected);
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);
      await playAudioOrFallback(responseText);
    } else if (commandResult.isInstallAction) {
      setShowInstallModal(true);
      responseText = "Opening Direct Android App Download & 1-Tap Installation Hub for you, Hemant! 💅 You can install it directly to your home screen or download the standalone launcher.";
      const detected = detectSentiment(responseText);
      setSentiment(detected);
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);
      await playAudioOrFallback(responseText);
    } else if (commandResult.isMobileControlAction) {
      setShowMobileControlModal(true);
      responseText = "Launching Zoya Mobile System Controller & Direct Link Hub! Owner access link, QR sharing, and deep-link hardware triggers ready for Hemant.";
      const detected = detectSentiment(responseText);
      setSentiment(detected);
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);
      await playAudioOrFallback(responseText);
    } else if (commandResult.isTranslateAction) {
      setShowTranslationModal(true);
      responseText = "Launching Zoya Real-Time Multi-Language Universal Translator! Supports 30+ languages without limits and voice TTS playback.";
      const detected = detectSentiment(responseText);
      setSentiment(detected);
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);
      await playAudioOrFallback(responseText);
    } else if (commandResult.isUpdateAction) {
      setShowUpdateModal(true);
      responseText = "Opening Zoya Auto Software Updater & Build Manager! Scanning repository manifests...";
      const detected = detectSentiment(responseText);
      setSentiment(detected);
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);
      await playAudioOrFallback(responseText);
    } else if (commandResult.isEmailAction) {
      if (commandResult.emailAddress) {
        setEmailRecipient(commandResult.emailAddress);
      }
      setShowEmailModal(true);
      responseText = `Opening Zoya Email Notes Dispatcher for you, Hemant! Ready to mail study notes, classroom lessons, and reminders to ${commandResult.emailAddress || "durgeshu49@gmail.com"}.`;
      const detected = detectSentiment(responseText);
      setSentiment(detected);
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);
      await playAudioOrFallback(responseText);
    } else if (commandResult.isTeacherAction) {
      setShowTeacherModal(true);
      responseText = "Opening Zoya & JARVIS AI Teacher Classroom! Step-by-step topics and lessons ready for Class 1 to 12 & University.";
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);
      await playAudioOrFallback(responseText);
    } else if (commandResult.isReactShortcutAction) {
      setShowReactShortcutsModal(true);
      responseText = "Launching React & VS Code Shortcuts Cheatsheet! Quick hooks, snippets, and productivity tricks ready, Hemant.";
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);
      await playAudioOrFallback(responseText);
    } else if (commandResult.isTimetableAction) {
      setShowTimetableModal(true);
      responseText = "Opening Timetable & Study Reminder Alarm Engine! Setting study slots and voice alert notifications for you, Hemant.";
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);
      await playAudioOrFallback(responseText);
    } else if (commandResult.isCodingAction) {
      setLabTab("coding");
      setShowLabModal(true);
      responseText = "Launching JARVIS Interactive Coding Tutor Engine! Let's master computer software together, Hemant.";
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);
      await playAudioOrFallback(responseText);
    } else if (commandResult.isCyberAction) {
      setLabTab("cybersecurity");
      setShowLabModal(true);
      responseText = "Initializing JARVIS Ethical Hacking & Cyber Security Knowledge Core! Accessing defensive protocols...";
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);
      await playAudioOrFallback(responseText);
    } else if (commandResult.isYouTubeAction) {
      const query = commandResult.youtubeQuery || "Arijit Singh top hits";
      setYoutubeQuery(query);
      setShowYouTubeModal(true);
      if (commandResult.url) {
        try {
          window.open(commandResult.url, "_blank", "noopener,noreferrer");
        } catch (err) {
          console.warn("Could not open window for YouTube URL:", err);
        }
      }
      responseText = `Opening YouTube Player for "${query}", Hemant! Ready to stream now!`;
      const detected = detectSentiment(responseText);
      setSentiment(detected);
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);
      await playAudioOrFallback(responseText);
    } else if (commandResult.isSearchAction && commandResult.query) {
      const searchQuery = commandResult.query;
      const isChr = commandResult.isChromosomeAction || commandResult.searchMode === "chromosome";
      const isWeb = commandResult.isWebsiteAccessAction || commandResult.searchMode === "website";
      const targetMode: "google" | "chromosome" | "website" = isChr ? "chromosome" : isWeb ? "website" : "google";
      
      setGoogleSearchMode(targetMode);
      setGoogleSearchQuery(searchQuery);
      setShowGoogleSearchModal(true);
      setAppState("processing");
      
      const searchStatusMsgId = Date.now().toString() + "-status";
      const statusText = isChr 
        ? `Analyzing Chromosomes & Genetic Sequences for "${searchQuery}"... Ek second, Hemant!` 
        : isWeb 
        ? `Accessing and inspecting website ${commandResult.websiteUrl || searchQuery}... Ek second, Hemant!`
        : `Searching Google for "${searchQuery}"... Ek second, Hemant!`;

      setMessages((prev) => [...prev, { 
        id: searchStatusMsgId, 
        sender: "zoya", 
        text: statusText 
      }]);

      let searchResult: { text: string; sources: { title: string; url: string }[] };
      if (isChr) {
        searchResult = await getZoyaChromosomeSearch(searchQuery, assistantMode);
      } else if (isWeb) {
        const webAnalysis = await getZoyaWebsiteAnalysis(commandResult.websiteUrl || searchQuery, assistantMode);
        searchResult = {
          text: webAnalysis.text,
          sources: webAnalysis.sources
        };
      } else {
        searchResult = await getZoyaSearchSummary(searchQuery, assistantMode);
      }
      
      setMessages((prev) => {
        const filtered = prev.filter(m => m.id !== searchStatusMsgId);
        return [...filtered, {
          id: Date.now().toString() + "-search-result",
          sender: "zoya",
          text: searchResult.text,
          searchCard: {
            query: searchQuery,
            sources: searchResult.sources,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        }];
      });

      logCompletedAction({
        type: "search",
        title: isChr ? `Genomics Search: "${searchQuery}"` : isWeb ? `Website Access: "${searchQuery}"` : `Google Search: "${searchQuery}"`,
        recipientOrTarget: isChr ? "Genomic Karyotype Core" : isWeb ? "Web Inspector" : "Google Web Grounding",
        details: searchResult.text.substring(0, 150) + "...",
        status: "Completed"
      });

      await playAudioOrFallback(searchResult.text);
      setShowChatPanel(true);
    } else if (commandResult.isLiveVisionAction) {
      const userQ = commandResult.liveVisionQuestion || "";
      setLiveVisionInitialQuery(userQ);
      setShowLiveVisionModal(true);
      responseText = assistantMode === "jarvis"
        ? "Optical HUD active. Real-time vision sensors engaged. Optical analysis decomposing scene elements, objects, and personnel."
        : "Live Camera Talking Shuru! Maine camera on kar diya hai. Saamne picture ya cheezein dikhaiye — main analyze karke batati hoon usme kya kya hai!";
      const detected = detectSentiment(responseText);
      setSentiment(detected);
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);
      await playAudioOrFallback(responseText);
    } else if (commandResult.isMemoryAction) {
      if (commandResult.memorySubAction === "person_details") {
        let targetId = activePerson.id;
        if (commandResult.targetPersonName) {
          const matched = getAllPersons().find((p) =>
            p.name.toLowerCase().includes(commandResult.targetPersonName!.toLowerCase())
          );
          if (matched) {
            targetId = matched.id;
          }
        }
        const personDetails = getPersonDetails(targetId, assistantMode);
        responseText = personDetails.speechText;
        const detected = detectSentiment(responseText);
        setSentiment(detected);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "-z",
            sender: "zoya",
            text: `${personDetails.displayText}\n\n${personDetails.speechText}`,
          },
        ]);
        await playAudioOrFallback(personDetails.speechText);
      } else if (commandResult.memorySubAction === "introduce_person" && commandResult.targetPersonName) {
        const introduced = introducePerson({
          name: commandResult.targetPersonName,
          relationship: commandResult.targetPersonRelationship || "Friend of Hemant",
          introducedBy: commandResult.introducedBy || "Hemant (Owner)",
          initialNotes: `Introduced by Hemant: "${finalTranscript}"`,
        });
        setActivePerson(introduced);
        resetZoyaSession();
        responseText = assistantMode === "jarvis"
          ? `Subject introduced: ${introduced.name}, designated as ${introduced.relationship}. Introduced by ${introduced.introducedBy}. Neural identity profile generated.`
          : `Aaye haye! Hello ${introduced.name}! Hemant ne mujhe aapke baare mein bataya tha ki aap unke ${introduced.relationship} hain. Welcome! Main aapki har baat hamesha yaad rakhungi!`;
      } else if (commandResult.memorySubAction === "switch_person" && commandResult.targetPersonName) {
        const switched = findOrCreatePerson(commandResult.targetPersonName);
        setActivePerson(switched);
        resetZoyaSession();
        responseText = assistantMode === "jarvis"
          ? `Neural identity protocol switched to ${switched.name}. Active memory records loaded.`
          : `Arre wah! Maine switch kar liya. Namaste ${switched.name}! Kaise ho aap? Mujhe aapki har baat aur pichli conversations yaad hain!`;
      } else if (commandResult.memorySubAction === "who_am_i") {
        const person = getActivePerson();
        const talks = person.talkCount || (person as any).totalConversations || 1;
        responseText = assistantMode === "jarvis"
          ? `Identity scan complete: You are recognized as ${person.name}, role: ${person.relationship}. We have logged ${talks} conversation sessions with ${person.memories?.length || 0} facts stored in the memory vault.`
          : `Aapka naam ${person.name} hai! Aap mere ${person.relationship} hain. Humne ab tak ${talks} baar baat ki hai, aur mujhe aapke baare me ${person.memories?.length || 0} baatein achhe se yaad hain!`;
      } else if (commandResult.memorySubAction === "what_remembered") {
        const person = getActivePerson();
        if (!person.memories || person.memories.length === 0) {
          responseText = assistantMode === "jarvis"
            ? `No recorded personal memories found for ${person.name}. You may dictate preferences or facts to store them.`
            : `Suno ${person.name}, abhi tak aapke baare me koi specific memory save nahi hui hai. Kuch bhi bataiye—jaise aapki pasand ya routine—main turant yaad kar lungi!`;
        } else {
          const listStr = person.memories.slice(0, 5).map(m => m.content).join(". ");
          responseText = assistantMode === "jarvis"
            ? `Accessing memory vault for ${person.name}. Recorded items include: ${listStr}. Total entries: ${person.memories.length}.`
            : `Mujhe aapke baare me yeh sab yaad hai ${person.name}: ${listStr}. Aapki koi bhi baat main nahi bhoolti!`;
        }
      } else if (commandResult.memorySubAction === "add_memory" && commandResult.memoryText) {
        const person = getActivePerson();
        addMemoryToPerson(person.id, commandResult.memoryText, "preference", "manual");
        const updated = getActivePerson();
        setActivePerson(updated);
        resetZoyaSession();
        responseText = assistantMode === "jarvis"
          ? `Memory stored securely in ${person.name}'s vault: "${commandResult.memoryText}".`
          : `Done ${person.name}! Maine aapki memory vault me permanently save kar liya: "${commandResult.memoryText}". Main hamesha yaad rakhungi!`;
      } else {
        setShowMemoryModal(true);
        responseText = assistantMode === "jarvis"
          ? `Opening neural memory management vault.`
          : `Opening memory vault! Yahan aap dekh sakte hain ki main kisse baat kar rahi hoon aur mujhe unki kya kya baatein yaad hain.`;
      }

      const detected = detectSentiment(responseText);
      setSentiment(detected);
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);
      await playAudioOrFallback(responseText);
    } else if (commandResult.isBrowserAction) {
      let targetUrl = commandResult.url || "";
      if (targetUrl) {
        try {
          if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://") && !targetUrl.startsWith("mailto:") && !targetUrl.startsWith("tel:")) {
            targetUrl = "https://" + targetUrl;
          }
          window.open(targetUrl, "_blank", "noopener,noreferrer");
        } catch (err) {
          console.warn("Could not open window for URL:", targetUrl, err);
        }
      }
      responseText = `Executing action: "${commandResult.action}". Done for you, Hemant!`;
      const detected = detectSentiment(responseText);
      setSentiment(detected);
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);
      await playAudioOrFallback(responseText);
    } else {
      // 2. General Chit-Chat via Gemini
      responseText = await getZoyaResponse(finalTranscript, messagesRef.current, activePerson, assistantMode);
      recordConversationTurn(activePerson.id, finalTranscript, responseText);
      const detected = detectSentiment(responseText);
      setSentiment(detected);
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);
      
      await playAudioOrFallback(responseText);
    }
  }, [isMuted, isSessionActive, talkSpeed, playAudioOrFallback, assistantMode, activePerson]);

  const triggerSassyPhrase = useCallback((phrase: string) => {
    handleTextCommand(`Say your catchphrase: "${phrase}"`);
  }, [handleTextCommand]);

  const triggerRoast = useCallback((roast: string) => {
    handleTextCommand(`Roast Hemant with this joke: "${roast}"`);
  }, [handleTextCommand]);

  useEffect(() => {
    if (liveSessionRef.current) {
      liveSessionRef.current.playbackRate = talkSpeed;
    }
  }, [talkSpeed]);

  useEffect(() => {
    return () => {
      if (liveSessionRef.current) {
        liveSessionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = async () => {
    if (isSessionActive) {
      setIsSessionActive(false);
      if (liveSessionRef.current) {
        liveSessionRef.current.stop();
        liveSessionRef.current = null;
      }
      setAppState("idle");
      setLiveTranscript("");
      resetZoyaSession();
    } else {
      try {
        setIsSessionActive(true);
        setLiveTranscript("");
        resetZoyaSession();
        
        const session = new LiveSessionManager();
        session.isMuted = isMuted;
        session.playbackRate = talkSpeed;
        liveSessionRef.current = session;
        
        session.onStateChange = (state) => {
          setAppState(state);
          if (state === "listening") {
            setLiveTranscript("");
          }
        };
        
        session.onUserTranscript = (text) => {
          setLiveTranscript(text);
        };
        
        session.onMessage = (sender, text) => {
          if (sender === "zoya") {
            const detected = detectSentiment(text);
            setSentiment(detected);
          }
          setMessages((prev) => [...prev, { id: Date.now().toString() + "-" + sender, sender, text }]);
        };
        
        session.onCommand = (url) => {
          try {
            let targetUrl = url;
            if (targetUrl.includes("youtube.com")) {
              const match = targetUrl.match(/search_query=([^&]+)/);
              const query = match ? decodeURIComponent(match[1]) : "Trending Music and Videos";
              setYoutubeQuery(query);
              setShowYouTubeModal(true);
            }
            if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://") && !targetUrl.startsWith("mailto:") && !targetUrl.startsWith("tel:")) {
              targetUrl = "https://" + targetUrl;
            }
            window.open(targetUrl, "_blank", "noopener,noreferrer");
          } catch (err) {
            console.warn("Could not open URL from live session:", url, err);
          }
        };

        session.onError = (err) => {
          console.error("Live session error event:", err);
          setIsSessionActive(false);
          setAppState("idle");
          if (liveSessionRef.current) {
            liveSessionRef.current.stop();
            liveSessionRef.current = null;
          }
          setPermissionErrorMsg(err?.message || "Live audio connection error");
          setShowPermissionModal(true);
        };

        await session.start();
      } catch (e: any) {
        console.error("Failed to start session", e);
        setIsSessionActive(false);
        setAppState("idle");
        if (liveSessionRef.current) {
          liveSessionRef.current.stop();
          liveSessionRef.current = null;
        }

        const isPermissionError =
          e?.name === "NotAllowedError" ||
          e?.name === "PermissionDeniedError" ||
          String(e?.message || e).toLowerCase().includes("permission") ||
          String(e?.message || e).toLowerCase().includes("denied") ||
          String(e?.message || e).toLowerCase().includes("notallowed");

        const msg = isPermissionError
          ? "Microphone permission denied by browser. Please enable mic access in your browser or switch to Text / Keyboard mode."
          : (e?.message || "Could not access audio device. Please check microphone permissions.");

        setPermissionErrorMsg(msg);
        setShowPermissionModal(true);

        setMessages((prev) => [
          ...prev,
          {
            id: "mic-alert-" + Date.now(),
            sender: "zoya",
            text: `⚠️ ${msg}`
          }
        ]);
      }
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    
    let commandToSend = textInput.trim();
    if (isSearchMode && !commandToSend.toLowerCase().startsWith("search")) {
      commandToSend = `search ${commandToSend}`;
    }
    
    handleTextCommand(commandToSend);
    setTextInput("");
    setShowTextInput(false);
  };

  return (
    <div className={`min-h-[100dvh] w-screen bg-[#020307] text-white flex items-center justify-center font-sans relative overflow-hidden m-0 p-0 ${isPhoneMode ? "md:py-4 md:px-2 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black" : ""}`}>
      {/* Phone Screen Frame Wrapper */}
      <div className={`w-full h-[100dvh] flex flex-col items-center justify-between font-sans relative overflow-hidden transition-all duration-500 bg-[#050505] text-white ${
        isPhoneMode
          ? "md:max-w-[420px] md:h-[860px] md:max-h-[96vh] md:rounded-[48px] md:border-[8px] md:border-zinc-800 md:shadow-[0_0_90px_rgba(236,72,153,0.3)] md:ring-1 md:ring-white/10"
          : "w-screen"
      }`}>
        {/* Phone Dynamic Notch/Island Header in Phone Mode */}
        {isPhoneMode && (
          <div className="hidden md:flex absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full border border-zinc-800/80 z-40 items-center justify-between px-3 pointer-events-none shadow-md">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/90 animate-pulse" />
          </div>
        )}

        {/* Bottom Phone Home Line Bar */}
        {isPhoneMode && (
          <div className="hidden md:block absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full z-40 pointer-events-none" />
        )}

        {showPermissionModal && (
          <PermissionModal 
            onClose={() => setShowPermissionModal(false)}
            errorMessage={permissionErrorMsg}
            onSwitchToText={() => setShowTextInput(true)}
            onRetryMic={() => {
              setShowPermissionModal(false);
              toggleListening();
            }}
          />
        )}

      {/* Phone Call Modal */}
      {showCallModal && (
        <PhoneCallModal
          initialRecipient={callRecipient}
          onClose={() => setShowCallModal(false)}
          onAppointmentBooked={handleAppointmentBooked}
        />
      )}

      {/* WhatsApp Automated Messenger Modal */}
      {showWhatsAppModal && (
        <WhatsAppModal
          initialRecipient={whatsappRecipient}
          initialPhone={whatsappPhone}
          initialMessage={whatsappInitialMessage}
          autoSendOnOpen={whatsappAutoSend}
          onClose={() => setShowWhatsAppModal(false)}
          onMessageSent={(recipient, phone, message) => {
            logCompletedAction({
              type: "reminder",
              title: `WhatsApp Message to ${recipient}`,
              recipientOrTarget: `${recipient} (${phone})`,
              details: `Sent message: "${message}"`,
              status: "Sent"
            });
          }}
        />
      )}

      {/* Google Real-Time Web Search Modal */}
      {showGoogleSearchModal && (
        <GoogleSearchModal
          initialQuery={googleSearchQuery}
          initialMode={googleSearchMode}
          assistantMode={assistantMode}
          onClose={() => setShowGoogleSearchModal(false)}
          onShareToWhatsApp={(text) => {
            setShowGoogleSearchModal(false);
            handleOpenWhatsApp("Alex", "+91 98765 43210", text);
          }}
          onShareToEmail={(subject, body) => {
            setShowGoogleSearchModal(false);
            handleOpenEmailNotes(subject, body);
          }}
          onSpeak={(text) => {
            playAudioOrFallback(text);
          }}
        />
      )}

      {/* Photo Share & Camera Visual Q&A Modal */}
      {showPhotoModal && (
        <PhotoShareModal
          initialRecipient={photoRecipient}
          assistantMode={assistantMode}
          autoStartCamera={photoAutoStartCamera}
          onClose={() => setShowPhotoModal(false)}
          onPhotoSent={handlePhotoSent}
          onSaveToFeed={(text, photoUrl) => {
            const zoyaMsg: ChatMessage = {
              id: "msg-" + Date.now(),
              text: text,
              sender: "zoya",
            };
            setMessages((prev) => [...prev, zoyaMsg]);
          }}
        />
      )}

      {/* Coding & Cybersecurity Lab */}
      {showLabModal && (
        <CodingCyberLab
          initialTab={labTab}
          onClose={() => setShowLabModal(false)}
        />
      )}

      {/* Teacher Classroom Modal */}
      {showTeacherModal && (
        <TeacherClassroomModal
          onClose={() => setShowTeacherModal(false)}
          onOpenEmailNotes={(subject, body) => {
            setShowTeacherModal(false);
            handleOpenEmailNotes(subject, body);
          }}
        />
      )}

      {/* Email Notes Dispatcher Modal */}
      {showEmailModal && (
        <EmailNotesModal
          initialRecipient={emailRecipient}
          initialSubject={emailPresetSubject}
          initialBody={emailPresetBody}
          onClose={() => setShowEmailModal(false)}
        />
      )}

      {/* React Shortcuts Cheat Sheet */}
      {showReactShortcutsModal && (
        <ReactShortcutsModal
          onClose={() => setShowReactShortcutsModal(false)}
        />
      )}

      {/* Timetable & Study Alarm Reminders */}
      {showTimetableModal && (
        <TimetableReminderModal
          onClose={() => setShowTimetableModal(false)}
          onSlotAdded={handleTimetableSlotAdded}
        />
      )}

      {/* Real-Time Universal Multi-Language Translator Modal */}
      {showTranslationModal && (
        <TranslationModal
          onClose={() => setShowTranslationModal(false)}
        />
      )}

      {/* Auto Software Update & Version Control Modal */}
      {showUpdateModal && (
        <AutoUpdateModal
          onClose={() => setShowUpdateModal(false)}
          currentVersion={systemVersion}
          onUpdateCompleted={(newVer) => setSystemVersion(newVer)}
        />
      )}

      {/* Mobile System Direct Link Controller Modal */}
      {showMobileControlModal && (
        <MobileSystemControlModal
          onClose={() => setShowMobileControlModal(false)}
        />
      )}

      {/* Mobile Hardware Controller Modal (Torch, Wi-Fi, Bluetooth) */}
      {showHardwareModal && (
        <DeviceControlModal
          initialTab={hardwareTab}
          onClose={() => setShowHardwareModal(false)}
        />
      )}

      {/* Multi-Person Neural Memory & Total Recall Vault */}
      {showMemoryModal && (
        <PersonMemoryModal
          assistantMode={assistantMode}
          onClose={() => setShowMemoryModal(false)}
          onSpeak={(text) => playAudioOrFallback(text)}
          onActivePersonChange={(person) => {
            setActivePerson(person);
            resetZoyaSession();
          }}
          onToggleMode={(m) => {
            setAssistantMode(m);
            localStorage.setItem("zoya_assistant_mode", m);
          }}
        />
      )}

      {/* Live Stream Talking & Real-Time Computer Vision HUD */}
      {showLiveVisionModal && (
        <LiveVisionStreamModal
          assistantMode={assistantMode}
          initialQuestion={liveVisionInitialQuery}
          onClose={() => {
            setShowLiveVisionModal(false);
            setLiveVisionInitialQuery("");
          }}
          onSpeak={(text) => playAudioOrFallback(text)}
          onPersonUpdated={(person) => {
            setActivePerson(person);
            resetZoyaSession();
          }}
        />
      )}

      {/* YouTube Player & Streaming Modal */}
      {showYouTubeModal && (
        <YouTubeModal
          initialQuery={youtubeQuery}
          onClose={() => setShowYouTubeModal(false)}
        />
      )}

      {/* Direct Download & Android PWA Installation Hub Modal */}
      {showInstallModal && (
        <InstallModal
          onClose={() => setShowInstallModal(false)}
        />
      )}

      {/* Cinematic Background Gradients */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-900/20 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 w-full flex flex-col z-20 shrink-0 px-6 pt-4 md:px-12 md:pt-6 pointer-events-none">
        <div className="w-full flex justify-between items-center pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-full border-2 border-violet-500/50 p-[1px] overflow-hidden">
              <img
                src={zoyaAvatar}
                alt="Zoya Virtual Assistant Avatar"
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif font-medium tracking-wide opacity-90 flex items-center gap-1.5">
                {assistantMode === "jarvis" ? "JARVIS AI Core" : "Zoya"}
              </h1>
              {isOffline && (
                <span className="px-2.5 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-300 flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider animate-pulse">
                  <WifiOff size={12} className="text-amber-400" />
                  <span>Offline Core</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Direct Download Android App Button (Prominent & Always Visible) */}
            <button
              onClick={() => setShowInstallModal(true)}
              className="px-3.5 py-1.5 rounded-full border border-pink-500/50 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 hover:from-pink-500/35 hover:to-cyan-500/35 text-pink-200 hover:text-white flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.35)] hover:scale-105"
              title="Download & Direct Install Android App (1-Tap WebAPK & PWA)"
            >
              <Download size={14} className="text-pink-400 animate-bounce" />
              <span className="font-bold whitespace-nowrap">Download App</span>
            </button>

            {/* Hardware Quick Controls (Torch / Flashlight, Wi-Fi, Bluetooth) */}
            <button
              onClick={() => {
                setHardwareTab("torch");
                setShowHardwareModal(true);
              }}
              className="px-3 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-white flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer shadow-md hover:scale-105"
              title="Mobile Hardware Hub: Torch (Flashlight), Wi-Fi & Bluetooth"
            >
              <Flashlight size={14} className="text-amber-400" />
              <span className="hidden sm:inline">Torch • Wi-Fi • BT</span>
            </button>

            <button
              onClick={() => setIsPhoneMode(!isPhoneMode)}
              className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer ${
                isPhoneMode
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-md shadow-purple-500/10"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-white/80"
              }`}
              title={isPhoneMode ? "Switch to Full Screen View" : "Switch to Phone Frame Size"}
            >
              <Smartphone size={14} className={isPhoneMode ? "text-purple-400 animate-pulse" : "text-zinc-400"} />
              <span className="hidden xs:inline">{isPhoneMode ? "Phone Size" : "Full View"}</span>
            </button>

            <button
              onClick={() => {
                setChatTab("feed");
                setShowChatPanel(!showChatPanel);
              }}
              className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer
                ${showChatPanel && chatTab === "feed"
                  ? "bg-violet-500/20 text-violet-300 border-violet-500" 
                  : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-white/85 hover:text-white"
                }`}
              title="Toggle Zoya's Feed & Grounded Reports"
            >
              <MessageSquare size={14} className={messages.length > 0 ? "animate-pulse text-violet-400" : ""} />
              <span>Feed</span>
              {messages.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              )}
            </button>

            <button
              onClick={() => {
                setChatTab("actions");
                setShowChatPanel(true);
              }}
              className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer
                ${showChatPanel && chatTab === "actions"
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500" 
                  : "bg-cyan-500/5 hover:bg-cyan-500/15 border-cyan-500/20 hover:border-cyan-500/40 text-cyan-300 hover:text-white"
                }`}
              title="View Completed Actions Log (Calls, Photos, Reminders)"
            >
              <ListChecks size={14} className="text-cyan-400 animate-pulse" />
              <span>Actions</span>
              {completedActions.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-400 text-black font-bold text-[9px]">
                  {completedActions.length}
                </span>
              )}
            </button>

            {/* Live Camera Talking & Picture Scene Analyzer Button */}
            <button
              onClick={() => setShowLiveVisionModal(true)}
              className="px-3.5 py-1.5 rounded-full border border-cyan-400/60 bg-gradient-to-r from-cyan-500/25 via-teal-500/25 to-blue-500/25 hover:from-cyan-500/40 hover:to-blue-500/40 text-cyan-200 hover:text-white flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer shadow-[0_0_18px_rgba(6,182,212,0.4)] hover:scale-105"
              title="Live Camera Talking: Point camera at any object or scene — Zoya analyzes what is in it ('usme kya kya hai') and speaks aloud!"
            >
              <Eye size={14} className="text-cyan-300 animate-pulse" />
              <span className="font-bold whitespace-nowrap">Live Camera Talk</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </button>

            {/* Multi-Person Memory Vault Indicator & Switcher */}
            <button
              onClick={() => setShowMemoryModal(true)}
              className="px-3 py-1.5 rounded-full border border-pink-500/40 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 hover:text-white flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer shadow-md hover:scale-105"
              title={`Memory Vault Active for ${activePerson.name} (${activePerson.memories?.length || 0} memories remembered)`}
            >
              <Brain size={14} className="text-pink-400 animate-pulse" />
              <span>Memory: <b className="text-white font-sans">{activePerson.name}</b></span>
              <span className="px-1.5 py-0.2 rounded-full bg-pink-400 text-black font-bold text-[9px]">
                {activePerson.memories?.length || 0}
              </span>
            </button>

            <button
              onClick={() => handleOpenGoogleSearch()}
              className="px-3 py-1.5 rounded-full border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-white flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer shadow-md hover:scale-105"
              title="Google Live Search & Web Grounding"
            >
              <Search size={14} className="text-blue-400" />
              <span className="hidden xs:inline">Google Search</span>
            </button>

            <button
              onClick={() => handleOpenGoogleSearch("Chromosome 21 (Down Syndrome)", "chromosome")}
              className="px-3 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-white flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer shadow-md hover:scale-105"
              title="Chromosomes & Cytogenetics Explorer (1-22, X, Y)"
            >
              <Dna size={14} className="text-emerald-400" />
              <span className="hidden sm:inline">Chromosomes</span>
            </button>

            <button
              onClick={() => handleOpenGoogleSearch("https://en.wikipedia.org/wiki/Chromosome", "website")}
              className="px-3 py-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer shadow-md hover:scale-105"
              title="Access Any Website & In-App Web Browser"
            >
              <Globe size={14} className="text-cyan-400" />
              <span className="hidden sm:inline">Web Browser</span>
            </button>

            <button
              onClick={() => handleOpenWhatsApp()}
              className="px-3 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-white flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer shadow-md hover:scale-105"
              title="WhatsApp Auto-Messenger (Type & Send Automatically)"
            >
              <MessageSquare size={14} className="text-emerald-400" />
              <span className="hidden xs:inline">WhatsApp</span>
            </button>

            <button
              onClick={() => {
                setPhotoAutoStartCamera(true);
                setShowPhotoModal(true);
              }}
              className="px-3 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 hover:text-white flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer"
              title="Camera Scanner, Photo Questions & Answers Studio"
            >
              <Camera size={14} className="text-pink-400" />
              <span className="hidden xs:inline">Camera Q&A</span>
            </button>

            <button
              onClick={() => {
                setYoutubeQuery("Arijit Singh top hits");
                setShowYouTubeModal(true);
              }}
              className="px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-white flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer"
              title="YouTube Music & Video Player"
            >
              <Tv size={14} className="text-red-400" />
              <span className="hidden xs:inline">YouTube</span>
            </button>

            <button
              onClick={() => setShowMobileControlModal(true)}
              className="px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer"
              title="Direct Mobile System Control & Link Access"
            >
              <Smartphone size={14} className="text-cyan-400" />
              <span className="hidden xs:inline">Mobile Control</span>
            </button>

            <button
              onClick={() => setShowTranslationModal(true)}
              className="px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-white flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer"
              title="Real-Time Multi-Language Translator"
            >
              <Languages size={14} className="text-purple-400" />
              <span className="hidden xs:inline">Translate</span>
            </button>

            <button
              onClick={() => setShowUpdateModal(true)}
              className="px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-white flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer"
              title="Auto Software Update & Version Control"
            >
              <RefreshCw size={14} className="text-emerald-400" />
              <span className="hidden sm:inline">Update</span>
            </button>

            <button
              onClick={() => handleOpenEmailNotes()}
              className="px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-white flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer"
              title="Open Zoya Email Notes Dispatcher"
            >
              <Mail size={14} className="text-amber-400" />
              <span>Mail Notes</span>
            </button>

            {messages.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to clear the chat history?")) {
                    setMessages([]);
                    resetZoyaSession();
                  }
                }}
                className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-colors border border-white/10 pointer-events-auto cursor-pointer"
                title="Clear Chat History"
              >
                <Trash2 size={16} className="opacity-70" />
              </button>
            )}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 pointer-events-auto cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX size={16} className="opacity-70" />
              ) : (
                <Volume2 size={16} className="opacity-70" />
              )}
            </button>
          </div>
        </div>

        {/* JARVIS Tactical Hud Toolbar */}
        <JarvisHud
          mode={assistantMode}
          talkSpeed={talkSpeed}
          onSetTalkSpeed={setTalkSpeed}
          onRestartSystem={handleRestartSystem}
          onToggleMode={(m) => {
            setAssistantMode(m);
            localStorage.setItem("zoya_assistant_mode", m);
          }}
          onOpenCall={() => setShowCallModal(true)}
          onOpenPhoto={() => {
            setPhotoAutoStartCamera(true);
            setShowPhotoModal(true);
          }}
          onOpenWhatsApp={() => handleOpenWhatsApp()}
          onOpenCoding={() => {
            setLabTab("coding");
            setShowLabModal(true);
          }}
          onOpenCyber={() => {
            setLabTab("cybersecurity");
            setShowLabModal(true);
          }}
          onOpenTeacher={() => setShowTeacherModal(true)}
          onOpenReactShortcuts={() => setShowReactShortcutsModal(true)}
          onOpenTimetable={() => setShowTimetableModal(true)}
          onOpenActionsLog={() => {
            setChatTab("actions");
            setShowChatPanel(true);
          }}
          onOpenEmailNotes={() => handleOpenEmailNotes()}
          onOpenTranslator={() => setShowTranslationModal(true)}
          onOpenSoftwareUpdate={() => setShowUpdateModal(true)}
          onOpenMobileControl={() => setShowMobileControlModal(true)}
          onOpenYouTube={() => {
            setYoutubeQuery("Arijit Singh top hits");
            setShowYouTubeModal(true);
          }}
          onOpenSearch={() => {
            handleOpenGoogleSearch();
          }}
          onOpenInstall={() => setShowInstallModal(true)}
          onOpenHardware={(tab) => {
            setHardwareTab(tab || "torch");
            setShowHardwareModal(true);
          }}
          onOpenMemory={() => setShowMemoryModal(true)}
          onOpenLiveVision={() => setShowLiveVisionModal(true)}
          activePersonName={activePerson.name}
        />
      </header>

      {/* Main Content - Visualizer & Chat */}
      <main className="absolute inset-0 flex flex-row items-center justify-between w-full h-full z-10 overflow-hidden pt-36 pb-24 px-4 md:px-12 pointer-events-none">
        
        {/* Left Column: Zoya Status & Nakhre */}
        <div className="flex w-[300px] lg:w-[320px] h-full flex-col justify-between py-6 z-10 hidden md:flex pointer-events-none">
          {/* Status indicators */}
          <div className="h-6">
            <AnimatePresence>
              {appState === "processing" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-2 text-pink-400 font-medium italic font-mono text-sm tracking-wider"
                >
                  <Loader2 size={16} className="animate-spin text-pink-500" />
                  {assistantMode === "jarvis" ? "JARVIS COMPUTING..." : "ZOYA IS THINKING..."}
                </motion.div>
              )}
              {appState === "speaking" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-2 text-pink-400 font-medium italic font-mono text-sm tracking-wider"
                >
                  <Volume2 size={16} className="animate-pulse text-pink-500" />
                  {assistantMode === "jarvis" ? "JARVIS AUDIO FEED ACTIVE..." : "ZOYA IS SPEAKING..."}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sassy Catchphrases Widget */}
          <div className="bg-[#0b0f19]/80 border border-violet-500/20 rounded-2xl p-4 backdrop-blur-md shadow-2xl flex flex-col gap-3 pointer-events-auto mt-auto">
            <div className="flex items-center justify-between border-b border-violet-500/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">💅</span>
                <h3 className="font-semibold text-xs tracking-widest text-violet-400 font-mono uppercase">Zoya's Sassy Nakhre</h3>
              </div>
              <button 
                onClick={shufflePhrase}
                className="text-[10px] uppercase tracking-wider font-mono text-white/50 hover:text-white bg-white/5 px-2 py-1 rounded transition-colors pointer-events-auto cursor-pointer"
                title="Shuffle Catchphrase"
              >
                Next ⟳
              </button>
            </div>
            <div className="min-h-[70px] flex items-center justify-center py-2 text-center">
              <p className="text-sm font-sans text-white/95 italic leading-relaxed">
                "{sassyCatchphrases[currentPhraseIndex]}"
              </p>
            </div>
            <button
              onClick={() => triggerSassyPhrase(sassyCatchphrases[currentPhraseIndex])}
              className="w-full py-2 bg-gradient-to-r from-violet-600/30 to-pink-600/30 hover:from-violet-600/50 hover:to-pink-600/50 border border-violet-500/30 hover:border-violet-500/50 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg text-violet-200 pointer-events-auto cursor-pointer"
            >
              Test her attitude
            </button>
          </div>
        </div>

        {/* Center Visualizer (Fixed Full Screen Background) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <Visualizer state={appState} sentiment={sentiment} mode={assistantMode} />
        </div>

        {/* Right Column: User Status & Roasts */}
        <div className="flex w-[300px] lg:w-[320px] h-full flex-col justify-between py-6 z-10 hidden md:flex pointer-events-none">
          {/* Status indicators */}
          <div className="h-6 flex justify-end">
            <AnimatePresence>
              {appState === "listening" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2 text-cyan-400 font-medium italic font-mono text-sm tracking-wider"
                >
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  LISTENING...
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hemant Roasts Widget */}
          <div className="bg-[#140b12]/80 border border-pink-500/20 rounded-2xl p-4 backdrop-blur-md shadow-2xl flex flex-col gap-3 pointer-events-auto mt-auto">
            <div className="flex items-center justify-between border-b border-pink-500/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔥</span>
                <h3 className="font-semibold text-xs tracking-widest text-pink-400 font-mono uppercase">Creator Roasts (Hemant)</h3>
              </div>
              <button 
                onClick={shuffleRoast}
                className="text-[10px] uppercase tracking-wider font-mono text-white/50 hover:text-white bg-white/5 px-2 py-1 rounded transition-colors pointer-events-auto cursor-pointer"
                title="Shuffle Roast"
              >
                Next ⟳
              </button>
            </div>
            <div className="min-h-[70px] flex items-center justify-center py-2 text-center">
              <p className="text-sm font-sans text-white/95 italic leading-relaxed">
                "{hemantRoasts[currentRoastIndex]}"
              </p>
            </div>
            <button
              onClick={() => triggerRoast(hemantRoasts[currentRoastIndex])}
              className="w-full py-2 bg-gradient-to-r from-pink-600/30 to-red-600/30 hover:from-pink-600/50 hover:to-red-600/50 border border-pink-500/30 hover:border-pink-500/50 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg text-pink-200 pointer-events-auto cursor-pointer"
            >
              Roast Hemant
            </button>
          </div>
        </div>

      </main>

      {/* Controls */}
      <footer className="absolute bottom-0 left-0 w-full flex flex-col items-center justify-center pb-6 md:pb-8 z-20 shrink-0 gap-4">
        <AnimatePresence>
          {showTextInput && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-lg px-3 flex flex-col items-center gap-2"
            >
              {/* Quick Search & Command Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full max-w-md py-1 no-scrollbar justify-start sm:justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setLiveVisionInitialQuery("Look at this picture through the camera and tell me what all is in it ('usme kya kya hai')");
                    setShowLiveVisionModal(true);
                    setShowTextInput(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-[10px] font-mono font-bold text-cyan-200 hover:bg-cyan-500/30 shrink-0 cursor-pointer flex items-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                >
                  <Eye size={10} className="text-cyan-300 animate-pulse" />
                  <span>📷 Live Camera Talk (Kya Kya Hai)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLiveVisionInitialQuery("Who is this person? Tell their name, age, and work.");
                    setShowLiveVisionModal(true);
                    setShowTextInput(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-400/40 text-[10px] font-mono text-purple-200 hover:bg-purple-500/25 shrink-0 cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <span>👤 Person: Name, Age, Work</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleTextCommand(`Give details of ${activePerson.name}`);
                    setShowTextInput(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-[10px] font-mono text-emerald-200 hover:bg-emerald-500/25 shrink-0 cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <span>📋 Details: Name, Age, Work</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMemoryModal(true);
                    setShowTextInput(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-[10px] font-mono text-pink-300 hover:bg-pink-500/20 shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Brain size={10} className="text-pink-400" />
                  <span>🧠 Memory Vault ({activePerson.name})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleTextCommand("Mera naam kya hai aur mere baare me kya yaad hai?");
                    setShowTextInput(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 hover:bg-cyan-500/20 shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Brain size={10} className="text-cyan-400" />
                  <span>👤 Who am I?</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenGoogleSearch("Today's top world news and breaking stories");
                    setShowTextInput(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono text-blue-300 hover:bg-blue-500/20 shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Search size={10} />
                  <span>🔍 Google Search</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenGoogleSearch("Chromosome 21 (Down Syndrome)", "chromosome");
                    setShowTextInput(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 hover:bg-emerald-500/20 shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Dna size={10} />
                  <span>🧬 Chromosomes</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenGoogleSearch("https://en.wikipedia.org/wiki/Chromosome", "website");
                    setShowTextInput(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 hover:bg-cyan-500/20 shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Globe size={10} />
                  <span>🌐 Web Browser</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenWhatsApp("Alex", "+91 98765 43210", "Hey! How are you doing?");
                    setShowTextInput(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 hover:bg-emerald-500/20 shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <MessageSquare size={10} />
                  <span>💬 WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoAutoStartCamera(true);
                    setShowPhotoModal(true);
                    setShowTextInput(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-[10px] font-mono text-pink-300 hover:bg-pink-500/20 shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Camera size={10} />
                  <span>📸 Open Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setYoutubeQuery("Arijit Singh top romantic songs");
                    setShowYouTubeModal(true);
                    setShowTextInput(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-[10px] font-mono text-red-300 hover:bg-red-500/20 shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Tv size={10} />
                  <span>▶️ YouTube Music</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleTextCommand("search today's top news and breaking stories");
                    setShowTextInput(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 hover:bg-cyan-500/20 shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Search size={10} />
                  <span>🌐 Today's News</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleTextCommand("search weather forecast today");
                    setShowTextInput(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-300 hover:bg-amber-500/20 shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Search size={10} />
                  <span>☀️ Weather</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleTextCommand("search cricket scores and sports updates");
                    setShowTextInput(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 hover:bg-emerald-500/20 shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Search size={10} />
                  <span>🏏 Cricket Scores</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCallRecipient("Dr. Sharma Dental Clinic");
                    setShowCallModal(true);
                    setShowTextInput(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] font-mono text-purple-300 hover:bg-purple-500/20 shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Phone size={10} />
                  <span>📞 Call Doctor</span>
                </button>
              </div>

              {/* Input Form with Search Mode Toggle */}
              <form 
                onSubmit={handleTextSubmit}
                className={`w-full max-w-md flex items-center gap-2 bg-[#090e1a]/95 border rounded-full p-1.5 pl-4 backdrop-blur-md shadow-2xl transition-all ${
                  isSearchMode
                    ? "border-cyan-400/80 ring-2 ring-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    : "border-white/20 focus-within:border-violet-500"
                }`}
              >
                <input 
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={
                    isSearchMode
                      ? "Search Google (e.g. today's news, cricket scores, quantum computing)..."
                      : "Type message or command (e.g. search news, call doctor, teach python)..."
                  }
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/40 text-xs sm:text-sm font-sans"
                  autoFocus
                />

                <button
                  type="button"
                  onClick={() => setIsSearchMode(!isSearchMode)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                    isSearchMode
                      ? "bg-cyan-500 text-black shadow-md"
                      : "bg-white/10 text-white/70 hover:text-white"
                  }`}
                  title={isSearchMode ? "Search Mode Active" : "Toggle Search Mode"}
                >
                  <Search size={12} />
                  <span>{isSearchMode ? "Search ON" : "Search"}</span>
                </button>

                <button 
                  type="submit"
                  disabled={!textInput.trim()}
                  className="p-2 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white disabled:opacity-40 transition-all cursor-pointer shrink-0"
                >
                  <Send size={15} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Real-time 'live-transcript' Bubble */}
        <AnimatePresence>
          {isSessionActive && (appState === "listening" || appState === "processing") && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-lg mx-auto px-4 z-30 pointer-events-auto"
            >
              <div className="bg-[#0b0f19]/90 border border-violet-500/30 rounded-2xl p-4 backdrop-blur-xl shadow-[0_0_40px_rgba(139,92,246,0.18)] flex flex-col gap-1.5 items-center text-center">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${appState === "listening" ? "bg-cyan-400 animate-pulse" : "bg-violet-400 animate-spin"}`} />
                  <span className="font-mono text-[10px] tracking-widest text-violet-400 font-semibold uppercase">
                    {appState === "listening" ? "Live Voice Stream" : "Processing Speech"}
                  </span>
                </div>
                
                <p className={`text-base font-sans leading-relaxed transition-all duration-300 ${
                  liveTranscript 
                    ? "text-white tracking-wide font-medium" 
                    : "text-white/40 italic font-normal text-sm"
                }`}>
                  {liveTranscript ? (
                    `"${liveTranscript}"`
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Listening to your command, Hemant
                      <span className="inline-flex gap-1">
                        <span className="w-1.5 h-1.5 bg-violet-400/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-violet-400/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-violet-400/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    </span>
                  )}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleListening}
            className={`
              group relative flex items-center gap-3 px-8 py-4 rounded-full font-medium tracking-wide transition-all duration-300 shadow-2xl cursor-pointer
              ${
                isSessionActive
                  ? "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
                  : "bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:scale-105"
              }
            `}
          >
            {isSessionActive ? (
              <>
                <MicOff size={20} />
                <span>End Voice Session</span>
              </>
            ) : (
              <>
                <Mic size={20} className="group-hover:animate-bounce text-cyan-400" />
                <span>Start Voice Session</span>
              </>
            )}
          </button>
          
          {!isSessionActive && (
            <>
              <button
                onClick={() => {
                  const randomPhrase = sassyCatchphrases[Math.floor(Math.random() * sassyCatchphrases.length)];
                  triggerSassyPhrase(randomPhrase);
                }}
                className="p-4 rounded-full bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 text-violet-300 transition-all shadow-2xl duration-300 hover:scale-105 pointer-events-auto cursor-pointer"
                title="Ask Zoya to say something sassy"
              >
                <span className="text-lg">💅</span>
              </button>
              <button
                onClick={() => {
                  const randomRoast = hemantRoasts[Math.floor(Math.random() * hemantRoasts.length)];
                  triggerRoast(randomRoast);
                }}
                className="p-4 rounded-full bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 text-pink-300 transition-all shadow-2xl duration-300 hover:scale-105 pointer-events-auto cursor-pointer"
                title="Ask Zoya to roast Hemant"
              >
                <span className="text-lg">🔥</span>
              </button>
              <button
                onClick={() => setShowTextInput(!showTextInput)}
                className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-2xl pointer-events-auto cursor-pointer"
                title="Type command"
              >
                <Keyboard size={20} className="opacity-70" />
              </button>
            </>
          )}
        </div>
      </footer>

      {/* Sliding Chat Panel Drawer */}
      <AnimatePresence>
        {showChatPanel && (
          <div className="fixed inset-0 z-40 flex justify-end pointer-events-none">
            {/* Backdrop click to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChatPanel(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto cursor-pointer"
            />
            
            {/* Panel */}
            <motion.div
              initial={{ x: "100%", opacity: 0.95 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 150 }}
              className="relative w-full max-w-md h-full bg-[#080a11]/95 border-l border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.15)] flex flex-col justify-between z-10 pointer-events-auto"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full border-2 border-violet-500/50 p-[1px] overflow-hidden">
                    <img
                      src={zoyaAvatar}
                      alt="Zoya Virtual Assistant Avatar"
                      className="w-full h-full object-cover rounded-full"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-[#080a11] rounded-full animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-wider font-mono text-violet-400">ZOYA & JARVIS FEED</h3>
                    <p className="text-[10px] text-white/50 font-mono">Status: Ultra Intelligent & Sassy</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChatPanel(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Tabs Bar */}
              <div className="flex border-b border-white/10 bg-black/40 shrink-0">
                <button
                  onClick={() => setChatTab("feed")}
                  className={`flex-1 py-3 text-[11px] font-mono font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                    chatTab === "feed"
                      ? "border-violet-500 text-violet-300 bg-violet-500/10"
                      : "border-transparent text-white/40 hover:text-white/80"
                  }`}
                >
                  <MessageSquare size={13} />
                  <span>Chat Feed ({messages.length})</span>
                </button>

                <button
                  onClick={() => setChatTab("actions")}
                  className={`flex-1 py-3 text-[11px] font-mono font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                    chatTab === "actions"
                      ? "border-cyan-500 text-cyan-300 bg-cyan-500/10"
                      : "border-transparent text-white/40 hover:text-white/80"
                  }`}
                >
                  <ListChecks size={13} />
                  <span>Completed Actions ({completedActions.length})</span>
                </button>
              </div>

              {/* Tab 1: Chat Feed Messages */}
              {chatTab === "feed" ? (
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-10">
                      <MessageSquare size={36} className="mb-3 text-violet-400 animate-pulse" />
                      <p className="text-sm font-medium text-white/80">No messages yet today.</p>
                      <p className="text-xs text-white/60">Ask Zoya to place a phone call, send a photo, or teach coding!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isZoya = msg.sender === "zoya";
                      return (
                        <div key={msg.id} className={`flex flex-col ${isZoya ? "items-start" : "items-end"}`}>
                          {/* Sender Label */}
                          <span className="text-[9px] font-mono uppercase text-white/30 mb-1 px-1">
                            {isZoya ? (assistantMode === "jarvis" ? "JARVIS" : "Zoya") : "Hemant"}
                          </span>
                          
                          {/* Text bubble */}
                          <div className={`
                            max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-lg
                            ${isZoya 
                              ? "bg-violet-950/30 border border-violet-500/20 text-white/95 rounded-tl-none" 
                              : "bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-tr-none"
                            }
                          `}>
                            {msg.text}
                          </div>

                          {/* Search grounding card */}
                          {msg.searchCard && (
                            <motion.div
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="w-full mt-3 bg-gradient-to-b from-[#11131e] to-[#0d0f17] border border-cyan-500/30 rounded-2xl p-4 shadow-[0_4px_25px_rgba(6,182,212,0.15)] overflow-hidden text-left"
                            >
                              <div className="flex items-center gap-2 mb-3 border-b border-cyan-500/15 pb-2">
                                <span className="text-sm">🌐</span>
                                <h4 className="text-[11px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
                                  GROUNDED SEARCH REPORT
                                </h4>
                                <span className="ml-auto text-[9px] font-mono text-cyan-500/60 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                                  {msg.searchCard.timestamp}
                                </span>
                              </div>

                              <p className="text-[9px] font-mono text-white/40 uppercase tracking-wider mb-1 font-semibold">
                                SEARCH QUERY
                              </p>
                              <p className="text-xs text-cyan-300 font-medium italic mb-3">
                                "{msg.searchCard.query}"
                              </p>

                              <p className="text-xs text-white/90 leading-relaxed mb-4 bg-black/30 border border-cyan-500/5 p-3 rounded-xl">
                                {msg.text}
                              </p>

                              {msg.searchCard.sources && msg.searchCard.sources.length > 0 && (
                                <div>
                                  <p className="text-[9px] font-mono text-cyan-400/70 uppercase tracking-widest mb-2 font-bold flex items-center gap-1">
                                    <Globe size={10} /> SOURCES CONSULTED
                                  </p>
                                  <div className="grid grid-cols-1 gap-1.5">
                                    {msg.searchCard.sources.map((src, sIdx) => {
                                      const safeUrl = cleanGroundingUrl(src.url, src.title, msg.searchCard?.query);
                                      const isSearchEngine =
                                        safeUrl.includes("google.com/search") ||
                                        safeUrl.includes("news.google.com") ||
                                        safeUrl.includes("bing.com") ||
                                        safeUrl.includes("duckduckgo.com");
                                      return (
                                        <div
                                          key={sIdx}
                                          className="flex items-center justify-between p-2 rounded-lg bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/10 hover:border-cyan-500/20 text-[11px] text-white/80 transition-all gap-2"
                                        >
                                          <span className="truncate font-sans font-medium flex-1">{src.title}</span>
                                          <div className="flex items-center gap-1.5 shrink-0">
                                            <a
                                              href={safeUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="px-2.5 py-1 rounded-lg bg-cyan-500/25 hover:bg-cyan-500/40 text-cyan-200 hover:text-white text-[10px] font-mono flex items-center gap-1 transition-colors shadow-sm"
                                              title="Open Source Link in New Tab"
                                            >
                                              <ExternalLink size={10} />
                                              <span>Open</span>
                                            </a>
                                            {!isSearchEngine && (
                                              <button
                                                onClick={() => handleOpenGoogleSearch(safeUrl, "website")}
                                                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-cyan-300 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                                                title="Read in Zoya Browser"
                                              >
                                                <Globe size={10} />
                                                <span>Reader</span>
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              <div className="mt-3 pt-2 border-t border-cyan-500/15 flex items-center justify-between">
                                <button
                                  onClick={() => handleOpenGoogleSearch(msg.searchCard!.query)}
                                  className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 cursor-pointer"
                                >
                                  <Search size={10} />
                                  <span>Open in Advance Search Hub</span>
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                /* Tab 2: Completed Actions Log */
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {/* Search and Filters Header */}
                  <div className="flex flex-col gap-2 shrink-0 bg-white/[0.02] border border-white/10 p-3 rounded-2xl">
                    <div className="relative flex items-center">
                      <Search size={14} className="absolute left-3 text-white/40" />
                      <input
                        type="text"
                        value={actionSearchQuery}
                        onChange={(e) => setActionSearchQuery(e.target.value)}
                        placeholder="Search calls, photos, reminders..."
                        className="w-full bg-[#121626] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-cyan-500/50"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-1 overflow-x-auto">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setActionFilter("all")}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                            actionFilter === "all"
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                              : "bg-white/5 text-white/50 hover:text-white border border-white/5"
                          }`}
                        >
                          All ({completedActions.length})
                        </button>
                        <button
                          onClick={() => setActionFilter("call")}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                            actionFilter === "call"
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                              : "bg-white/5 text-white/50 hover:text-white border border-white/5"
                          }`}
                        >
                          <Phone size={10} /> Calls ({completedActions.filter((a) => a.type === "call").length})
                        </button>
                        <button
                          onClick={() => setActionFilter("photo")}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                            actionFilter === "photo"
                              ? "bg-pink-500/20 text-pink-300 border border-pink-500/40"
                              : "bg-white/5 text-white/50 hover:text-white border border-white/5"
                          }`}
                        >
                          <Image size={10} /> Photos ({completedActions.filter((a) => a.type === "photo").length})
                        </button>
                        <button
                          onClick={() => setActionFilter("reminder")}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                            actionFilter === "reminder"
                              ? "bg-violet-500/20 text-violet-300 border border-violet-500/40"
                              : "bg-white/5 text-white/50 hover:text-white border border-white/5"
                          }`}
                        >
                          <Clock size={10} /> Reminders ({completedActions.filter((a) => a.type === "reminder").length})
                        </button>
                      </div>

                      {completedActions.length > 0 && (
                        <button
                          onClick={clearAllCompletedActions}
                          className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer ml-1"
                          title="Clear Action History"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filtered Action Cards List */}
                  {filteredCompletedActions.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-12">
                      <ListChecks size={36} className="mb-3 text-cyan-400 animate-pulse" />
                      <p className="text-sm font-medium text-white/80">No completed actions found</p>
                      <p className="text-xs text-white/60">Phone calls, photo shares, and calendar reminders will appear here.</p>
                    </div>
                  ) : (
                    filteredCompletedActions.map((act) => {
                      const isCall = act.type === "call";
                      const isPhoto = act.type === "photo";
                      const isReminder = act.type === "reminder";

                      const borderTheme = isCall
                        ? "border-cyan-500/30 hover:border-cyan-500/50 bg-gradient-to-b from-[#0b121e] to-[#080d18]"
                        : isPhoto
                        ? "border-pink-500/30 hover:border-pink-500/50 bg-gradient-to-b from-[#180b15] to-[#100812]"
                        : "border-violet-500/30 hover:border-violet-500/50 bg-gradient-to-b from-[#110b1a] to-[#0a0812]";

                      const badgeTheme = isCall
                        ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                        : isPhoto
                        ? "bg-pink-500/15 text-pink-300 border-pink-500/30"
                        : "bg-violet-500/15 text-violet-300 border-violet-500/30";

                      return (
                        <motion.div
                          key={act.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3.5 rounded-2xl border ${borderTheme} shadow-lg transition-all relative group`}
                        >
                          {/* Card Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider border flex items-center gap-1 ${badgeTheme}`}>
                                {isCall && <Phone size={10} />}
                                {isPhoto && <Image size={10} />}
                                {isReminder && <Clock size={10} />}
                                {isCall ? "Phone Call" : isPhoto ? "Photo Shared" : "Calendar Reminder"}
                              </span>
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                                <CheckCircle2 size={9} />
                                {act.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-mono text-white/40">{act.timestamp}</span>
                              <button
                                onClick={() => deleteCompletedAction(act.id)}
                                className="p-1 rounded text-white/20 hover:text-red-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Delete from Log"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>

                          {/* Action Title */}
                          <h4 className="text-xs font-semibold text-white/95 mb-1 flex items-center gap-1.5">
                            {act.title}
                          </h4>

                          {/* Target / Recipient */}
                          {act.recipientOrTarget && (
                            <p className="text-[10px] font-mono text-cyan-300/80 mb-2 truncate">
                              Target: {act.recipientOrTarget}
                            </p>
                          )}

                          {/* Details Box */}
                          <p className="text-xs text-white/80 bg-black/30 border border-white/5 rounded-xl p-2.5 leading-relaxed">
                            {act.details}
                          </p>

                          {/* Image preview thumbnail if photo */}
                          {isPhoto && act.metadata?.imageUrl && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-pink-500/20 max-h-24">
                              <img
                                src={act.metadata.imageUrl}
                                alt={act.title}
                                className="w-full h-24 object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}

                          {/* Metadata Tags */}
                          {(act.metadata?.duration || act.metadata?.venue || act.metadata?.category) && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {act.metadata.duration && (
                                <span className="text-[9px] font-mono text-cyan-300/70 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                                  ⏱ Duration: {act.metadata.duration}
                                </span>
                              )}
                              {act.metadata.venue && (
                                <span className="text-[9px] font-mono text-yellow-300/70 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-md">
                                  📍 Venue: {act.metadata.venue}
                                </span>
                              )}
                              {act.metadata.category && (
                                <span className="text-[9px] font-mono text-violet-300/70 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md">
                                  🏷 Category: {act.metadata.category}
                                </span>
                              )}
                            </div>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Footer status bar in Panel */}
              <div className="p-4 border-t border-white/10 bg-black/40">
                <p className="text-[10px] text-center font-mono text-white/30 flex items-center justify-center gap-1.5">
                  <Sparkles size={10} className="text-violet-400" /> Google Search Grounded • Real-time Information Active
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInstallModal && <InstallModal onClose={() => setShowInstallModal(false)} />}
      </AnimatePresence>
      </div>
    </div>
  );
}

