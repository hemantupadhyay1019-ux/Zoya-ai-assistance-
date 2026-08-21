export function processCommand(command: string): {
  action: string;
  url?: string;
  isBrowserAction: boolean;
  isYouTubeAction?: boolean;
  youtubeQuery?: string;
  isSearchAction?: boolean;
  isCallAction?: boolean;
  isPhotoAction?: boolean;
  isCodingAction?: boolean;
  isCyberAction?: boolean;
  isTeacherAction?: boolean;
  isReactShortcutAction?: boolean;
  isTimetableAction?: boolean;
  isEmailAction?: boolean;
  isTranslateAction?: boolean;
  isUpdateAction?: boolean;
  isMobileControlAction?: boolean;
  isInstallAction?: boolean;
  query?: string;
  recipient?: string;
  emailAddress?: string;
  purpose?: string;
} {
  const lowerCmd = command.toLowerCase().trim();

  // 0a. Direct Android App Download & Installation Hub Commands
  if (
    lowerCmd.includes("download") ||
    lowerCmd.includes("install") ||
    lowerCmd.includes("apk") ||
    lowerCmd.includes("android app") ||
    lowerCmd.includes("download app") ||
    lowerCmd.includes("install app") ||
    lowerCmd.includes("download in my android") ||
    lowerCmd.includes("download in android") ||
    lowerCmd.includes("download softy") ||
    lowerCmd.includes("install softy") ||
    lowerCmd.includes("get android app") ||
    lowerCmd.includes("download option") ||
    lowerCmd.includes("save app") ||
    lowerCmd.includes("add to home screen")
  ) {
    return {
      action: "Launching Direct Android App Download & 1-Tap Installation Hub",
      isBrowserAction: false,
      isInstallAction: true,
    };
  }

  // 0b. Mobile System Control & Direct Link Access Commands
  if (
    lowerCmd.includes("control mobile system") ||
    lowerCmd.includes("mobile system") ||
    lowerCmd.includes("control mobile") ||
    lowerCmd.includes("mobile control") ||
    lowerCmd.includes("direct link") ||
    lowerCmd.includes("direct access") ||
    lowerCmd.includes("zoya link") ||
    lowerCmd.includes("system link") ||
    lowerCmd.includes("link access")
  ) {
    return {
      action: "Launching Zoya Direct Link Mobile System Controller",
      isBrowserAction: false,
      isMobileControlAction: true,
    };
  }

  // 0b. Real-time Language Translation Commands
  if (
    lowerCmd.includes("translate") ||
    lowerCmd.includes("translator") ||
    lowerCmd.includes("language translation") ||
    lowerCmd.includes("multi language") ||
    lowerCmd.includes("convert language")
  ) {
    return {
      action: "Launching Zoya Real-Time Multi-Language Universal Translator",
      isBrowserAction: false,
      isTranslateAction: true,
    };
  }

  // 0b. Auto Software Update Commands
  if (
    lowerCmd.includes("update softy") ||
    lowerCmd.includes("update all softy") ||
    lowerCmd.includes("update the softy") ||
    lowerCmd.includes("softy update") ||
    lowerCmd.includes("update software") ||
    lowerCmd.includes("update all software") ||
    lowerCmd.includes("software update") ||
    lowerCmd.includes("check update") ||
    lowerCmd.includes("system update") ||
    lowerCmd.includes("update system") ||
    lowerCmd.includes("app update") ||
    lowerCmd.includes("update zoya") ||
    lowerCmd.includes("upgrade software") ||
    lowerCmd.includes("softy") ||
    lowerCmd.includes("update all")
  ) {
    return {
      action: "Launching Zoya & JARVIS Master Software Updater (v5.0.0 Ultra Suite)",
      isBrowserAction: false,
      isUpdateAction: true,
    };
  }

  // 0c. Email Notes Commands
  if (
    lowerCmd.includes("send notes on mail") ||
    lowerCmd.includes("send note on mail") ||
    lowerCmd.includes("send notes on email") ||
    lowerCmd.includes("email notes") ||
    lowerCmd.includes("mail notes") ||
    lowerCmd.includes("send email notes") ||
    lowerCmd.includes("mail study notes") ||
    lowerCmd.includes("send mail")
  ) {
    let email = "durgeshu49@gmail.com";
    const mailMatch = lowerCmd.match(/to\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (mailMatch) {
      email = mailMatch[1];
    }
    return {
      action: `Launching Email Notes Dispatcher to send study notes to ${email}`,
      isBrowserAction: false,
      isEmailAction: true,
      emailAddress: email
    };
  }

  // 1. Teacher & Classroom Lessons Commands
  if (
    lowerCmd.includes("teach") ||
    lowerCmd.includes("lesson") ||
    lowerCmd.includes("classroom") ||
    lowerCmd.includes("class 10") ||
    lowerCmd.includes("class 12") ||
    lowerCmd.includes("physics topic") ||
    lowerCmd.includes("teacher mode")
  ) {
    return {
      action: "Opening AI Classroom Teacher & Curriculum Module",
      isBrowserAction: false,
      isTeacherAction: true,
    };
  }

  // 2. React Shortcuts & Cheat Sheet Commands
  if (
    lowerCmd.includes("react shortcut") ||
    lowerCmd.includes("react cheatsheet") ||
    lowerCmd.includes("vs code shortcut") ||
    lowerCmd.includes("code shortcut") ||
    lowerCmd.includes("useeffect snippet")
  ) {
    return {
      action: "Launching React & VS Code Shortcuts Reference Guide",
      isBrowserAction: false,
      isReactShortcutAction: true,
    };
  }

  // 3. Timetable & Study Reminder Alarm Commands
  if (
    lowerCmd.includes("timetable") ||
    lowerCmd.includes("study reminder") ||
    lowerCmd.includes("time table") ||
    lowerCmd.includes("set alarm") ||
    lowerCmd.includes("schedule reminder") ||
    lowerCmd.includes("work schedule")
  ) {
    return {
      action: "Opening Timetable & Study Alarm Alert Manager for Hemant",
      isBrowserAction: false,
      isTimetableAction: true,
    };
  }

  // 4. Phone Call & Appointment Commands

  if (
    lowerCmd.startsWith("call ") ||
    lowerCmd.includes("book appointment") ||
    lowerCmd.includes("make a call") ||
    lowerCmd.includes("phone call") ||
    lowerCmd.includes("schedule appointment")
  ) {
    let target = command.replace(/^(call|book appointment with|make a call to|phone call to|schedule appointment with)\s+/i, "").trim();
    if (!target) target = "Dr. Sharma (Appointment)";
    return {
      action: `Initiating AI Phone Call to ${target} for appointment booking`,
      isBrowserAction: false,
      isCallAction: true,
      recipient: target,
      purpose: "Phone Appointment Booking"
    };
  }

  // 2. Camera, Photo Capture, Visual Q&A & Photo Dispatch Commands
  if (
    lowerCmd.includes("camera") ||
    lowerCmd.includes("crame") ||
    lowerCmd.includes("take photo") ||
    lowerCmd.includes("capture photo") ||
    lowerCmd.includes("scan photo") ||
    lowerCmd.includes("photo question") ||
    lowerCmd.includes("photo answer") ||
    lowerCmd.includes("photo q&a") ||
    lowerCmd.includes("ask photo") ||
    lowerCmd.includes("visual question") ||
    lowerCmd.includes("solve photo") ||
    lowerCmd.includes("analyze photo") ||
    lowerCmd.includes("analyze image") ||
    lowerCmd.startsWith("send photo") ||
    lowerCmd.startsWith("send image") ||
    lowerCmd.startsWith("send picture") ||
    lowerCmd.includes("send photo to") ||
    lowerCmd.includes("share photo with") ||
    lowerCmd.includes("share photo") ||
    lowerCmd.includes("share image") ||
    lowerCmd.includes("share picture")
  ) {
    let recipient = "Alex";
    const toMatch = lowerCmd.match(/to\s+([a-zA-Z0-9\s]+)$/i) || lowerCmd.match(/with\s+([a-zA-Z0-9\s]+)$/i);
    if (toMatch) {
      recipient = toMatch[1].trim();
    }
    return {
      action: `Launching Camera & Photo Visual Q&A Studio for ${recipient}`,
      isBrowserAction: false,
      isPhotoAction: true,
      recipient: recipient
    };
  }

  // 3. Coding & Computer Science Commands
  if (
    lowerCmd.includes("coding") ||
    lowerCmd.includes("learn python") ||
    lowerCmd.includes("learn javascript") ||
    lowerCmd.includes("teach me code") ||
    lowerCmd.includes("computer software") ||
    lowerCmd.includes("code tutor")
  ) {
    return {
      action: `Launching JARVIS Interactive Coding Tutor Lab`,
      isBrowserAction: false,
      isCodingAction: true,
    };
  }

  // 4. Cybersecurity & Ethical Hacking Knowledge
  if (
    lowerCmd.includes("hacking") ||
    lowerCmd.includes("cyber security") ||
    lowerCmd.includes("ethical hacking") ||
    lowerCmd.includes("penetration testing") ||
    lowerCmd.includes("jarvis mode") ||
    lowerCmd.includes("web security")
  ) {
    return {
      action: `Opening JARVIS Cyber Security & Ethical Hacking Knowledge Core`,
      isBrowserAction: false,
      isCyberAction: true,
    };
  }

  // YouTube Media & Music Commands: "play [song]", "open youtube", "search youtube [query]", "play [song] on youtube", "listen to [artist]", "watch [video]"
  if (
    lowerCmd.includes("youtube") ||
    lowerCmd.startsWith("play ") ||
    lowerCmd.startsWith("play") ||
    lowerCmd.startsWith("listen to ") ||
    lowerCmd.startsWith("watch ") ||
    lowerCmd.startsWith("yt ") ||
    lowerCmd === "youtube"
  ) {
    let ytQuery = "";
    if (lowerCmd === "youtube" || lowerCmd === "open youtube" || lowerCmd === "launch youtube" || lowerCmd === "go to youtube") {
      ytQuery = "Trending Music and Videos";
    } else if (lowerCmd.startsWith("play")) {
      ytQuery = command
        .replace(/^(play on youtube for|play on youtube|play in youtube|play youtube for|play youtube|play song|play songs|play music|play track|play video|play)\s+/i, "")
        .replace(/\s+(on youtube|in youtube|youtube)$/i, "")
        .trim();
    } else if (lowerCmd.startsWith("listen to ")) {
      ytQuery = command.replace(/^listen to\s+/i, "").replace(/\s+(on youtube|in youtube)$/i, "").trim();
    } else if (lowerCmd.startsWith("watch ")) {
      ytQuery = command.replace(/^watch\s+/i, "").replace(/\s+(on youtube|in youtube)$/i, "").trim();
    } else if (lowerCmd.includes("youtube")) {
      ytQuery = command
        .replace(/^(search on youtube for|search on youtube|search youtube for|search youtube|open youtube for|open youtube|youtube search for|youtube search|youtube|yt)\s+/i, "")
        .replace(/\s+(on youtube|in youtube)$/i, "")
        .trim();
    }

    if (!ytQuery) ytQuery = "Arijit Singh top hits";

    return {
      action: `Playing "${ytQuery}" on YouTube Player`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(ytQuery)}`,
      isBrowserAction: false,
      isYouTubeAction: true,
      youtubeQuery: ytQuery,
    };
  }

  // Web Search Grounding: "search [topic]", "google [topic]", "find [topic]", "what is [topic]", "latest news", "today's events", etc.
  if (
    lowerCmd.includes("today's events") ||
    lowerCmd.includes("events today") ||
    lowerCmd.includes("today's news") ||
    lowerCmd.includes("news today") ||
    lowerCmd.includes("google search") ||
    lowerCmd.includes("search google") ||
    lowerCmd.includes("search web") ||
    lowerCmd.startsWith("search ") ||
    lowerCmd.startsWith("search") ||
    lowerCmd.startsWith("google ") ||
    lowerCmd.startsWith("find ") ||
    lowerCmd.startsWith("lookup ") ||
    lowerCmd.startsWith("fetch ") ||
    lowerCmd.startsWith("summarize ") ||
    lowerCmd.startsWith("what is ") ||
    lowerCmd.startsWith("who is ") ||
    lowerCmd.startsWith("where is ") ||
    lowerCmd.startsWith("when is ") ||
    lowerCmd.startsWith("tell me about ") ||
    lowerCmd.startsWith("latest ") ||
    lowerCmd.startsWith("weather ") ||
    lowerCmd.startsWith("news ")
  ) {
    let query = command;
    if (lowerCmd.includes("today's events") || lowerCmd.includes("events today")) {
      query = "today's top events, stories, and global news updates";
    } else if (lowerCmd.includes("today's news") || lowerCmd.includes("news today")) {
      query = "today's hot breaking news and trending updates";
    } else {
      query = command
        .replace(/^(google search for|google search|search google for|search google|search for|search web for|search web|search|google|find|lookup|fetch|summarize|tell me about)\s+/i, "")
        .trim();
    }

    if (!query) query = command;

    return {
      action: `Searching Google for "${query}"`,
      isBrowserAction: false,
      isSearchAction: true,
      query: query,
    };
  }

  // General Browsing: "Open [website name]"
  const openMatch = lowerCmd.match(/^open\s+(.+)$/);
  if (
    openMatch &&
    !lowerCmd.includes("youtube") &&
    !lowerCmd.includes("spotify")
  ) {
    const rawTarget = openMatch[1].trim();
    let finalUrl = "";

    if (rawTarget.startsWith("http://") || rawTarget.startsWith("https://")) {
      finalUrl = rawTarget;
    } else {
      let website = rawTarget.replace(/\s+/g, "");
      if (website.includes(":") || !/^[a-zA-Z0-9-.]+$/.test(website)) {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(rawTarget)}`;
      } else {
        if (!website.includes(".")) {
          website += ".com";
        }
        website = website.replace(/^(www\.)+/i, "");
        finalUrl = `https://www.${website}`;
      }
    }

    return {
      action: `Opening ${rawTarget} for you, ugh.`,
      url: finalUrl,
      isBrowserAction: true,
    };
  }

  // Media Search: "Play [song/video] on YouTube"
  const ytMatch = lowerCmd.match(/^play\s+(.+?)\s+on\s+youtube$/);
  if (ytMatch) {
    const query = encodeURIComponent(ytMatch[1].trim());
    return {
      action: `Playing ${ytMatch[1]} on YouTube. Don't judge my music taste.`,
      url: `https://www.youtube.com/results?search_query=${query}`,
      isBrowserAction: true,
    };
  }

  // Media Search: "Search [query] on Spotify"
  const spotifyMatch = lowerCmd.match(/^search\s+(.+?)\s+on\s+spotify$/);
  if (spotifyMatch) {
    const query = encodeURIComponent(spotifyMatch[1].trim());
    return {
      action: `Searching ${spotifyMatch[1]} on Spotify. Hope it's a banger.`,
      url: `https://open.spotify.com/search/${query}`,
      isBrowserAction: true,
    };
  }

  // WhatsApp Web: "Send a WhatsApp message to [number] saying [message]"
  const waMatch = lowerCmd.match(
    /^send\s+a\s+whatsapp\s+message\s+to\s+([\d\+\s]+)\s+saying\s+(.+)$/,
  );
  if (waMatch) {
    const number = waMatch[1].replace(/\s+/g, "");
    const message = encodeURIComponent(waMatch[2].trim());
    return {
      action: `Sending your message. Let's hope they reply, Hemant.`,
      url: `https://web.whatsapp.com/send?phone=${number}&text=${message}`,
      isBrowserAction: true,
    };
  }

  return { action: "", isBrowserAction: false };
}
