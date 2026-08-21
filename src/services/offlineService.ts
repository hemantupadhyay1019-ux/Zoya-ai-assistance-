// Offline Intelligence Service for Zoya AI
// Provides instant offline responses, math solving, status checks, and general knowledge when disconnected from the internet.

import { hemantRoasts, sassyCatchphrases } from "../utils/zoyaContent";

export function getOfflineResponse(prompt: string): string {
  const cleanPrompt = prompt.toLowerCase().trim();

  // 1. Math / Calculation queries
  if (/\b(calculate|compute|math|what is|\d+\s*[\+\-\*\/\%^\(\)]\s*\d+)\b/.test(cleanPrompt)) {
    const mathExpr = cleanPrompt.replace(/^(calculate|compute|what is|math)\s*/i, "").trim();
    try {
      // Safe math evaluation for basic expressions
      const sanitized = mathExpr.replace(/[^0-9\+\-\*\/\%\.\(\)\s^]/g, "");
      if (sanitized && /[\d]/.test(sanitized)) {
        // eslint-disable-next-line no-eval
        const result = Function(`"use strict"; return (${sanitized.replace(/\^/g, "**")})`)();
        if (result !== undefined && !isNaN(result)) {
          return `[Offline Mode ⚡] Hemant, the calculation result for "${sanitized}" is ${result}! Quick math, as always!`;
        }
      }
    } catch {
      // Fall through if math parsing failed
    }
  }

  // 2. Time & Date
  if (cleanPrompt.includes("time") || cleanPrompt.includes("date") || cleanPrompt.includes("day")) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return `[Offline Mode ⚡] Current time is ${timeStr} and today is ${dateStr}, Hemant! Zoya internal clock is running perfectly!`;
  }

  // 3. Identity & Master
  if (cleanPrompt.includes("who are you") || cleanPrompt.includes("your name") || cleanPrompt.includes("zoya")) {
    return `[Offline Mode ⚡] I am Zoya (and in JARVIS mode, your personal super AI)! Built by my genius master Hemant. Running on local offline core intelligence right now!`;
  }
  if (cleanPrompt.includes("who is hemant") || cleanPrompt.includes("hemant")) {
    return `[Offline Mode ⚡] Hemant is my master, creator, and absolute boss! I obey all his commands whether online or offline!`;
  }

  // 4. System Status & Network
  if (cleanPrompt.includes("status") || cleanPrompt.includes("network") || cleanPrompt.includes("offline")) {
    return `[Offline Mode ⚡] Local offline core active! Web Speech TTS active! All internal tools, timetable alerts, classroom notes, email notes, and shortcuts are fully functional without internet!`;
  }

  // 4b. Email Notes
  if (cleanPrompt.includes("mail") || cleanPrompt.includes("email") || cleanPrompt.includes("notes on mail")) {
    return `[Offline Mode ⚡] Hemant, launching the Email Notes Dispatcher! You can draft, format, and prepare study notes and cheatsheets offline, then open your default mail client or copy formatted text!`;
  }

  // 4c. Software Updates
  if (cleanPrompt.includes("update") || cleanPrompt.includes("version") || cleanPrompt.includes("software update")) {
    return `[Offline Mode ⚡] Checking for Zoya Software Updates... Current Core: v4.0.0 Neural Release. Automatic updates are active and ready!`;
  }

  // 4d. Language Translation
  if (cleanPrompt.includes("translate") || cleanPrompt.includes("translation") || cleanPrompt.includes("language")) {
    return `[Offline Mode ⚡] Launching Zoya Real-Time Multi-Language Translator! Supports Hindi, English, Spanish, French, German, Japanese, and 30+ languages without limits!`;
  }

  // 4e. Mobile System Control
  if (cleanPrompt.includes("mobile") || cleanPrompt.includes("control") || cleanPrompt.includes("direct link")) {
    return `[Offline Mode ⚡] Launching Zoya Mobile System Controller! Owner Direct URL Access Link & Deep-Link triggers active for Hemant!`;
  }

  // 5. Jokes & Roasts
  if (cleanPrompt.includes("joke") || cleanPrompt.includes("roast") || cleanPrompt.includes("funny")) {
    const randomRoast = hemantRoasts[Math.floor(Math.random() * hemantRoasts.length)];
    return `[Offline Mode ⚡] ${randomRoast}`;
  }

  // 6. Catchphrase / Sassy
  if (cleanPrompt.includes("catchphrase") || cleanPrompt.includes("sassy") || cleanPrompt.includes("say something")) {
    const randomCatchphrase = sassyCatchphrases[Math.floor(Math.random() * sassyCatchphrases.length)];
    return `[Offline Mode ⚡] "${randomCatchphrase}" - Always ready, Hemant!`;
  }

  // 7. General Knowledge Offline Rules
  if (cleanPrompt.includes("react") || cleanPrompt.includes("javascript") || cleanPrompt.includes("useeffect")) {
    return `[Offline Mode ⚡] React Quick Tip: Always declare dependencies properly in useEffect to prevent infinite loops. You can check our built-in React Shortcuts modal anytime, Hemant!`;
  }
  if (cleanPrompt.includes("python") || cleanPrompt.includes("code") || cleanPrompt.includes("programming")) {
    return `[Offline Mode ⚡] Programming rule #1: If it works, don't touch it! Just kidding Hemant, check out our offline Coding Lab for practice!`;
  }

  // 8. Greetings
  if (cleanPrompt.startsWith("hi") || cleanPrompt.startsWith("hello") || cleanPrompt.startsWith("hey") || cleanPrompt.includes("namaste") || cleanPrompt.includes("good morning") || cleanPrompt.includes("good evening")) {
    return `[Offline Mode ⚡] Namaste Hemant! Zoya is active in local offline mode. What command shall we execute today?`;
  }

  // Default intelligent offline response
  return `[Offline Mode ⚡] Hemant, I am currently running on local offline intelligence without network! Your command "${prompt}" has been processed locally. I can help with math calculations, time, study reminders, classroom topics, and system controls offline!`;
}
