export function processCommand(command: string): {
  action: string;
  url?: string;
  isBrowserAction: boolean;
  isYouTubeAction?: boolean;
  youtubeQuery?: string;
  isSearchAction?: boolean;
  isChromosomeAction?: boolean;
  isWebsiteAccessAction?: boolean;
  websiteUrl?: string;
  searchMode?: "google" | "chromosome" | "website";
  isCallAction?: boolean;
  isPhotoAction?: boolean;
  autoStartCamera?: boolean;
  isWhatsAppAction?: boolean;
  whatsappRecipient?: string;
  whatsappPhone?: string;
  whatsappMessage?: string;
  autoSendWhatsApp?: boolean;
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
  isHardwareAction?: boolean;
  hardwareTab?: "torch" | "wifi" | "bluetooth";
  torchState?: boolean;
  wifiState?: boolean;
  bluetoothState?: boolean;
  query?: string;
  recipient?: string;
  emailAddress?: string;
  purpose?: string;
  isMemoryAction?: boolean;
  memorySubAction?: "view" | "switch_person" | "add_memory" | "who_am_i" | "what_remembered" | "introduce_person" | "person_details";
  targetPersonName?: string;
  targetPersonRelationship?: string;
  introducedBy?: string;
  memoryText?: string;
  isLiveVisionAction?: boolean;
  liveVisionQuestion?: string;
} {
  const lowerCmd = command.toLowerCase().trim();

  // 0. Live Camera Talking & Scene/Picture Analyzer ("camera dikha ke batao usme kya kya hai", "live camera talking", "picture analyze")
  if (
    lowerCmd.includes("live cream") ||
    lowerCmd.includes("cream talking") ||
    lowerCmd.includes("live stream") ||
    lowerCmd.includes("stream talking") ||
    lowerCmd.includes("live video") ||
    lowerCmd.includes("live vision") ||
    lowerCmd.includes("live camera") ||
    lowerCmd.includes("camera talking") ||
    lowerCmd.includes("camera dikha") ||
    lowerCmd.includes("camera on") ||
    lowerCmd.includes("camera khol") ||
    lowerCmd.includes("camera se dekh") ||
    lowerCmd.includes("picture analyze") ||
    lowerCmd.includes("photo analyze") ||
    lowerCmd.includes("image analyze") ||
    lowerCmd.includes("picture ko analyze") ||
    lowerCmd.includes("kya kya hai") ||
    lowerCmd.includes("usme kya kya") ||
    lowerCmd.includes("isme kya kya") ||
    lowerCmd.includes("dekh ke batao") ||
    lowerCmd.includes("kya dikh raha hai") ||
    lowerCmd.includes("scene analyze") ||
    lowerCmd.includes("object analyze") ||
    lowerCmd.includes("see the person") ||
    lowerCmd.includes("look at the person") ||
    lowerCmd.includes("zoya can see") ||
    lowerCmd.includes("zoya see") ||
    lowerCmd.includes("optical scan") ||
    lowerCmd.includes("scan person") ||
    lowerCmd.includes("face scan") ||
    lowerCmd.includes("identify person") ||
    lowerCmd.includes("recognize person") ||
    lowerCmd.includes("read text camera") ||
    lowerCmd.includes("padh ke batao")
  ) {
    return {
      action: "Activating Live Camera Talking HUD & Visual Scene Analyzer with Zoya",
      isBrowserAction: false,
      isLiveVisionAction: true,
      liveVisionQuestion: command,
    };
  }

  // 0.1 Person Details (Name, Age, Work) Query
  if (
    lowerCmd.includes("details of the person") ||
    lowerCmd.includes("detail of the person") ||
    lowerCmd.includes("details of person") ||
    lowerCmd.includes("give the details") ||
    lowerCmd.includes("give details") ||
    lowerCmd.includes("give his details") ||
    lowerCmd.includes("give her details") ||
    lowerCmd.includes("tell his details") ||
    lowerCmd.includes("tell her details") ||
    lowerCmd.includes("name .age .work") ||
    lowerCmd.includes("name age work") ||
    lowerCmd.includes("person details") ||
    lowerCmd.includes("profile details") ||
    (lowerCmd.includes("details") && (lowerCmd.includes("age") || lowerCmd.includes("work") || lowerCmd.includes("naam")))
  ) {
    const nameMatch = command.match(/(?:details\s+of|tell\s+me\s+about|who\s+is|give\s+details\s+for)\s+([a-zA-Z\u0900-\u097F]+)/i);
    const targetName = nameMatch && nameMatch[1] && !["the", "this", "person", "a", "his", "her", "their"].includes(nameMatch[1].toLowerCase())
      ? nameMatch[1].trim()
      : undefined;

    return {
      action: targetName
        ? `Retrieving complete personal details (Name, Age, Work) for ${targetName}`
        : "Retrieving complete personal details (Name, Age, Work) for active person",
      isBrowserAction: false,
      isMemoryAction: true,
      memorySubAction: "person_details",
      targetPersonName: targetName,
    };
  }

  // 0.2 Multi-Person Memory, Introductions & Identity Commands
  if (
    lowerCmd.includes("memory") ||
    lowerCmd.includes("memories") ||
    lowerCmd.includes("yaad rakhna") ||
    lowerCmd.includes("remember that") ||
    lowerCmd.includes("mera naam") ||
    lowerCmd.includes("my name is") ||
    lowerCmd.includes("kisse baat kar rahi ho") ||
    lowerCmd.includes("who are you talking to") ||
    lowerCmd.includes("who am i") ||
    lowerCmd.includes("mujhe pehchana") ||
    lowerCmd.includes("kya yaad hai") ||
    lowerCmd.includes("what do you remember") ||
    lowerCmd.includes("switch person") ||
    lowerCmd.includes("talk to") ||
    lowerCmd.includes("meet my") ||
    lowerCmd.includes("this is my") ||
    lowerCmd.includes("yeh mera") ||
    lowerCmd.includes("yeh meri") ||
    lowerCmd.includes("introduce") ||
    lowerCmd.startsWith("meet ") ||
    lowerCmd.includes("say hi to") ||
    lowerCmd.includes("say hello to")
  ) {
    // A1. Owner introduces someone: "meet my friend [Name]", "this is my brother [Name]", "meet [Name]"
    const introMatch = command.match(
      /(?:meet\s+my\s+(friend|brother|sister|colleague|cousin|mom|dad|mother|father|wife|husband|partner|boss|teacher|student|neighbor)|this\s+is\s+my\s+(friend|brother|sister|colleague|cousin|mom|dad|mother|father|wife|husband|partner)|yeh\s+mera\s+(dost|bhai|friend|colleague)|yeh\s+meri\s+(dost|behen|sister|friend|mummy)|introduce|meet|say\s+hi\s+to|say\s+hello\s+to)\s+([a-zA-Z\u0900-\u097F]+)(?:\s+hai|\s+hain|\.|$)/i
    );
    if (introMatch) {
      const relationshipRaw = introMatch[1] || introMatch[2] || introMatch[3] || introMatch[4] || "Friend";
      const nameRaw = introMatch[5] || introMatch[1];
      if (
        nameRaw &&
        nameRaw.toLowerCase() !== "zoya" &&
        nameRaw.toLowerCase() !== "jarvis" &&
        nameRaw.toLowerCase() !== "me" &&
        nameRaw.toLowerCase() !== "you"
      ) {
        const capitalRel = relationshipRaw.charAt(0).toUpperCase() + relationshipRaw.slice(1);
        return {
          action: `Owner Hemant is introducing ${nameRaw} (${capitalRel} of Hemant) to Zoya`,
          isBrowserAction: false,
          isMemoryAction: true,
          memorySubAction: "introduce_person",
          targetPersonName: nameRaw.trim(),
          targetPersonRelationship: `${capitalRel} of Hemant`,
          introducedBy: "Hemant (Owner)",
        };
      }
    }

    // A2. Explicit name introduction / switch: "mera naam [X] hai", "my name is [X]", "call me [X]"
    const myNameMatch = command.match(/(?:mera\s+naam|my\s+name\s+is|call\s+me|switch\s+person\s+to|talk\s+to)\s+([a-zA-Z\u0900-\u097F]+)(?:\s+hai|\s+hoon|\.|$)/i);
    if (myNameMatch && myNameMatch[1]) {
      const extractedName = myNameMatch[1].trim();
      const lowerExtracted = extractedName.toLowerCase();
      if (
        lowerExtracted !== "kya" &&
        lowerExtracted !== "kaun" &&
        lowerExtracted !== "what" &&
        lowerExtracted !== "who" &&
        lowerExtracted !== "zoya" &&
        lowerExtracted !== "jarvis" &&
        lowerExtracted !== "me" &&
        lowerExtracted !== "you"
      ) {
        return {
          action: `Switching active speaker profile to "${extractedName}"`,
          isBrowserAction: false,
          isMemoryAction: true,
          memorySubAction: "switch_person",
          targetPersonName: extractedName,
        };
      }
    }

    // B. Explicit "who am I" / "who are you talking to" / "mera naam kya hai" / "mujhe pehchana"
    if (
      lowerCmd.includes("who am i") ||
      lowerCmd.includes("mera naam kya") ||
      lowerCmd.includes("kisse baat kar rahi") ||
      lowerCmd.includes("who are you talking to") ||
      lowerCmd.includes("mujhe pehchana") ||
      lowerCmd.includes("do you know who i am")
    ) {
      return {
        action: "Verifying active speaker identity and personal profile",
        isBrowserAction: false,
        isMemoryAction: true,
        memorySubAction: "who_am_i",
      };
    }

    // C. Explicit "what do you remember" / "kya yaad hai"
    if (
      lowerCmd.includes("kya yaad hai") ||
      lowerCmd.includes("what do you remember") ||
      lowerCmd.includes("meri memories") ||
      lowerCmd.includes("my memories") ||
      lowerCmd.includes("humne kya baat ki")
    ) {
      return {
        action: "Retrieving recorded memories and past discussions for speaker",
        isBrowserAction: false,
        isMemoryAction: true,
        memorySubAction: "what_remembered",
      };
    }

    // D. Explicit memory addition: "remember that ...", "yaad rakhna ki ..."
    const rememberMatch = command.match(/(?:remember\s+that|yaad\s+rakhna\s+ki|yaad\s+rakhna|save\s+memory|note\s+this)\s+(.+)/i);
    if (rememberMatch && rememberMatch[1] && rememberMatch[1].trim().length > 2) {
      return {
        action: `Saving new memory to active person vault: "${rememberMatch[1].trim()}"`,
        isBrowserAction: false,
        isMemoryAction: true,
        memorySubAction: "add_memory",
        memoryText: rememberMatch[1].trim(),
      };
    }

    // E. View Memory Vault Modal
    if (
      lowerCmd.includes("open memory") ||
      lowerCmd.includes("show memory") ||
      lowerCmd.includes("view memories") ||
      lowerCmd.includes("memory manager") ||
      lowerCmd.includes("memory vault") ||
      lowerCmd.includes("show all memories") ||
      lowerCmd.includes("people vault") ||
      lowerCmd.includes("who all do you know")
    ) {
      return {
        action: "Opening Multi-Person Neural Memory Vault",
        isBrowserAction: false,
        isMemoryAction: true,
        memorySubAction: "view",
      };
    }
  }

  // 0a0. WhatsApp Automated Messaging & Direct Dispatch Commands
  if (
    lowerCmd.includes("whatsapp") ||
    lowerCmd.includes("whatshapp") ||
    lowerCmd.includes("whatapp") ||
    lowerCmd.includes("watshapp") ||
    lowerCmd.includes("watsapp") ||
    lowerCmd.includes("wa message") ||
    lowerCmd.includes("send message in whatshapp") ||
    lowerCmd.includes("type and send")
  ) {
    let recipient = "Durgesh";
    let phone = "+919876543210";
    let messageText = "Hello! Sent via Zoya & JARVIS automated WhatsApp assistant. 🚀";
    let shouldAutoSend = false;

    // Check if recipient is specified
    const toMatch = lowerCmd.match(/to\s+([a-zA-Z0-9+]+)/i);
    if (toMatch) {
      const parsedRecipient = toMatch[1].trim();
      recipient = parsedRecipient;
      if (/^\+?\d+$/.test(parsedRecipient)) {
        phone = parsedRecipient;
      } else {
        const lowerR = parsedRecipient.toLowerCase();
        if (lowerR === "durgesh") phone = "+919876543210";
        else if (lowerR === "alex") phone = "+14155552671";
        else if (lowerR === "mom") phone = "+919811122334";
        else if (lowerR === "dad") phone = "+919822233445";
        else if (lowerR === "boss") phone = "+919833344556";
        else if (lowerR === "doctor" || lowerR === "sharma") phone = "+919844455667";
      }
    }

    // Check if message content is specified: saying [text] / message [text] / that [text]
    const sayingMatch = command.match(/(?:saying|message|text|that|msg)\s+["']?(.+?)["']?$/i);
    if (sayingMatch && sayingMatch[1]) {
      messageText = sayingMatch[1].trim();
      shouldAutoSend = true;
    } else if (lowerCmd.includes("type and send") || lowerCmd.includes("send message")) {
      // Extract everything after type and send or send message
      const textMatch = command.match(/(?:type and send|send message|send|type)\s+(?:the\s+)?(?:message\s+)?(?:in\s+whatshapp|in\s+whatsapp|on\s+whatsapp)?\s*(?:saying|to\s+\w+\s+)?(.*)/i);
      if (textMatch && textMatch[1] && textMatch[1].trim().length > 3) {
        messageText = textMatch[1].trim();
      }
    }

    return {
      action: `Launching WhatsApp Automated Messenger & Auto-Typing for ${recipient}`,
      isBrowserAction: false,
      isWhatsAppAction: true,
      whatsappRecipient: recipient,
      whatsappPhone: phone,
      whatsappMessage: messageText,
      autoSendWhatsApp: shouldAutoSend
    };
  }

  // 0a. Torch / Flashlight Commands
  if (
    lowerCmd.includes("torch") ||
    lowerCmd.includes("flashlight") ||
    lowerCmd.includes("flash light") ||
    lowerCmd.includes("mobile light") ||
    lowerCmd.includes("phone light") ||
    lowerCmd.includes("on light") ||
    lowerCmd.includes("light on") ||
    lowerCmd.includes("light off")
  ) {
    const isOff = lowerCmd.includes("off") || lowerCmd.includes("stop") || lowerCmd.includes("close") || lowerCmd.includes("band");
    return {
      action: isOff ? "Turning OFF Mobile Torch / Flashlight" : "Turning ON Mobile Torch / Flashlight",
      isBrowserAction: false,
      isHardwareAction: true,
      hardwareTab: "torch",
      torchState: !isOff
    };
  }

  // 0b. Wi-Fi ("wifi", "wi-fi", "wife" typo) Commands
  if (
    lowerCmd.includes("wifi") ||
    lowerCmd.includes("wi-fi") ||
    lowerCmd.includes("wife") ||
    lowerCmd.includes("wireless fidelity") ||
    lowerCmd.includes("internet connection") ||
    lowerCmd.includes("wifi network") ||
    lowerCmd.includes("scan wifi")
  ) {
    const isOff = lowerCmd.includes("off") || lowerCmd.includes("disconnect") || lowerCmd.includes("band");
    return {
      action: isOff ? "Disabling Mobile Wi-Fi connection" : "Enabling Mobile Wi-Fi & Launching Network Manager",
      isBrowserAction: false,
      isHardwareAction: true,
      hardwareTab: "wifi",
      wifiState: !isOff
    };
  }

  // 0c. Bluetooth Commands
  if (
    lowerCmd.includes("bluetooth") ||
    lowerCmd.includes("blue tooth") ||
    lowerCmd.includes("ble") ||
    lowerCmd.includes("pair device") ||
    lowerCmd.includes("connect headphones") ||
    lowerCmd.includes("connect speaker") ||
    lowerCmd.includes("scan bluetooth")
  ) {
    const isOff = lowerCmd.includes("off") || lowerCmd.includes("disconnect") || lowerCmd.includes("band");
    return {
      action: isOff ? "Disabling Bluetooth" : "Enabling Bluetooth & Scanning Nearby Devices",
      isBrowserAction: false,
      isHardwareAction: true,
      hardwareTab: "bluetooth",
      bluetoothState: !isOff
    };
  }

  // 0d. Direct Android App Download & Installation Hub Commands
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
    lowerCmd.includes("camer") ||
    lowerCmd.includes("crame") ||
    lowerCmd.includes("take photo") ||
    lowerCmd.includes("open camera") ||
    lowerCmd.includes("open camer") ||
    lowerCmd.includes("click photo") ||
    lowerCmd.includes("capture photo") ||
    lowerCmd.includes("take a photo") ||
    lowerCmd.includes("take picture") ||
    lowerCmd.includes("take a picture") ||
    lowerCmd.includes("take selfie") ||
    lowerCmd.includes("open cam") ||
    lowerCmd.includes("cam") ||
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
    const isDirectPhoto = lowerCmd.includes("take photo") || lowerCmd.includes("open camera") || lowerCmd.includes("camer") || lowerCmd.includes("click photo") || lowerCmd.includes("capture photo") || lowerCmd.includes("selfie");
    return {
      action: isDirectPhoto ? "Opening Camera & Live Photo Capture Studio" : `Launching Camera & Photo Visual Q&A Studio for ${recipient}`,
      isBrowserAction: false,
      isPhotoAction: true,
      autoStartCamera: true,
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
    lowerCmd.includes("hack") ||
    lowerCmd.includes("cyber security") ||
    lowerCmd.includes("ethical hacking") ||
    lowerCmd.includes("penetration testing") ||
    lowerCmd.includes("jarvis mode") ||
    lowerCmd.includes("web security") ||
    lowerCmd.includes("device security") ||
    lowerCmd.includes("mobile defense")
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

  // Website Access & Direct URL Inspection: "access website [url]", "browse [url]", "visit [website]", "inspect website [url]"
  if (
    lowerCmd.startsWith("access website ") ||
    lowerCmd.startsWith("visit website ") ||
    lowerCmd.startsWith("browse website ") ||
    lowerCmd.startsWith("inspect website ") ||
    lowerCmd.startsWith("access ") ||
    lowerCmd.startsWith("browse ") ||
    lowerCmd.startsWith("http://") ||
    lowerCmd.startsWith("https://") ||
    /^(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.(?:com|org|edu|gov|io|net|dev|ai|me|info)(?:\/[^\s]*)?$/i.test(command.trim())
  ) {
    let target = command
      .replace(/^(?:please\s+)?(?:can\s+you\s+)?(?:access\s+website|visit\s+website|browse\s+website|inspect\s+website|access|browse|visit|go\s+to\s+website|open\s+website)\s+/i, "")
      .trim();
    if (!target) target = "https://en.wikipedia.org/wiki/Chromosome";
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      target = `https://${target}`;
    }

    return {
      action: `Accessing website and inspecting content: ${target}`,
      isBrowserAction: false,
      isSearchAction: true,
      isWebsiteAccessAction: true,
      searchMode: "website",
      websiteUrl: target,
      query: target,
    };
  }

  // Chromosomes & Genomic Intelligence Search: "search chromosomes", "chromosome 21", "look up chromosome X", "karyotype", "genetics"
  if (
    lowerCmd.includes("chromosome") ||
    lowerCmd.includes("chromosomes") ||
    lowerCmd.includes("karyotype") ||
    lowerCmd.includes("trisomy") ||
    lowerCmd.includes("telomere") ||
    lowerCmd.includes("centromere") ||
    lowerCmd.includes("down syndrome") ||
    lowerCmd.includes("turner syndrome") ||
    lowerCmd.includes("klinefelter") ||
    lowerCmd.includes("genomic search") ||
    lowerCmd.includes("genetics search") ||
    lowerCmd.includes("human genome") ||
    lowerCmd.startsWith("chr ") ||
    lowerCmd.startsWith("chr.")
  ) {
    let query = command
      .replace(/^(?:please\s+)?(?:can\s+you\s+)?(?:just\s+)?(?:search\s+chromosomes\s+for|search\s+chromosome\s+for|search\s+chromosomes|search\s+chromosome|look\s+up\s+chromosome|find\s+chromosome|explain\s+chromosome|tell\s+me\s+about\s+chromosome|chromosome\s+search\s+for|chromosome\s+search|search\s+for|search|find|what\s+is\s+chromosome|what\s+are\s+chromosomes|what\s+is)\s+/i, "")
      .trim();
    if (!query) query = "Chromosome 21 (Down Syndrome)";

    return {
      action: `Searching Chromosome and Genomic Intelligence for "${query}"`,
      isBrowserAction: false,
      isSearchAction: true,
      isChromosomeAction: true,
      searchMode: "chromosome",
      query: query,
    };
  }

  // Web Search Grounding & Google Search: "search in google [topic]", "search [topic]", "google [topic]", "find [topic]", "what is [topic]", "latest news", "today's events", etc.
  if (
    lowerCmd.includes("search in google") ||
    lowerCmd.includes("search on google") ||
    lowerCmd.includes("search google") ||
    lowerCmd.includes("google search") ||
    lowerCmd.includes("in google") ||
    lowerCmd.includes("on google") ||
    lowerCmd.includes("search web") ||
    lowerCmd.includes("search the web") ||
    lowerCmd.includes("today's events") ||
    lowerCmd.includes("events today") ||
    lowerCmd.includes("today's news") ||
    lowerCmd.includes("news today") ||
    lowerCmd.startsWith("search ") ||
    lowerCmd.startsWith("search") ||
    lowerCmd.startsWith("google ") ||
    lowerCmd.startsWith("google") ||
    lowerCmd.startsWith("find ") ||
    lowerCmd.startsWith("find out ") ||
    lowerCmd.startsWith("lookup ") ||
    lowerCmd.startsWith("look up ") ||
    lowerCmd.startsWith("fetch ") ||
    lowerCmd.startsWith("summarize ") ||
    lowerCmd.startsWith("what is ") ||
    lowerCmd.startsWith("who is ") ||
    lowerCmd.startsWith("where is ") ||
    lowerCmd.startsWith("when is ") ||
    lowerCmd.startsWith("why is ") ||
    lowerCmd.startsWith("how is ") ||
    lowerCmd.startsWith("how to ") ||
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
      // Clean leading search trigger phrases
      query = command
        .replace(/^(?:please\s+)?(?:can\s+you\s+)?(?:just\s+)?(?:search\s+in\s+google\s+for|search\s+in\s+google|search\s+on\s+google\s+for|search\s+on\s+google|search\s+google\s+for|search\s+google|google\s+search\s+for|google\s+search|google\s+for|search\s+the\s+web\s+for|search\s+web\s+for|search\s+web|search\s+for|search\s+about|search|google|find\s+out\s+about|find\s+out|find|look\s+up|lookup|fetch|summarize|tell\s+me\s+about|what\s+is|who\s+is|where\s+is|when\s+is|why\s+is|how\s+to|how\s+is)\s+/i, "")
        // Clean trailing Google tags
        .replace(/\s+(?:in\s+google|on\s+google|from\s+google|via\s+google|using\s+google|on\s+the\s+web|on\s+web|online)$/i, "")
        .trim();
    }

    if (!query || query.toLowerCase() === "google" || query.toLowerCase() === "search") {
      query = "Today's top world news and trending headlines";
    }

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
