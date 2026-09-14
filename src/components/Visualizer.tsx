import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ZoyaSentiment } from "../utils/zoyaContent";
import zoyaAvatar from "../assets/images/zoya_avatar_1784483912355.jpg";

type VisualizerState = "idle" | "listening" | "processing" | "speaking";

interface VisualizerProps {
  state: VisualizerState;
  sentiment: ZoyaSentiment;
  mode?: "zoya" | "jarvis";
}

export default function Visualizer({ state, sentiment, mode = "zoya" }: VisualizerProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthOpenAmount, setMouthOpenAmount] = useState(0);

  // Random eye blinking simulation
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
        // Schedule next blink in 2.5 - 5.5 seconds
        blinkTimeout = setTimeout(triggerBlink, 2500 + Math.random() * 3000);
      }, 150);
    };

    blinkTimeout = setTimeout(triggerBlink, 3000);
    return () => {
      clearTimeout(blinkTimeout);
    };
  }, []);

  // Responsive speaking-driven lip movement (lip-flap)
  useEffect(() => {
    if (state !== "speaking") {
      setMouthOpenAmount(0);
      return;
    }

    let speakingInterval: NodeJS.Timeout;
    const openAmounts = [0.1, 0.6, 0.3, 0.9, 0.2, 0.8, 0.4, 0.7];
    
    speakingInterval = setInterval(() => {
      const nextAmount = openAmounts[Math.floor(Math.random() * openAmounts.length)];
      setMouthOpenAmount(nextAmount);
    }, 80);

    return () => {
      clearInterval(speakingInterval);
    };
  }, [state]);

  const getRingAnimation = (index: number, reverse: boolean = false) => {
    const baseSpeed = state === "listening" ? 3 : state === "processing" ? 1.5 : state === "speaking" ? 2 : 15;
    return {
      rotate: reverse ? [-360, 0] : [0, 360],
      transition: { duration: baseSpeed + index * 2, repeat: Infinity, ease: "linear" as const }
    };
  };

  const getPulseAnimation = () => {
    if (state === "speaking") {
      return {
        scale: [1, 1.05, 0.98, 1.02, 1],
        opacity: [0.8, 1, 0.8, 1, 0.8],
        transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" as const }
      };
    }
    if (state === "listening") {
      return {
        scale: [1, 1.02, 1],
        opacity: [0.7, 1, 0.7],
        transition: { duration: 1, repeat: Infinity, ease: "easeInOut" as const }
      };
    }
    if (state === "processing") {
      return {
        scale: [0.98, 1.02, 0.98],
        opacity: [0.6, 0.9, 0.6],
        transition: { duration: 0.8, repeat: Infinity, ease: "linear" as const }
      };
    }
    return {
      scale: [1, 1.01, 1],
      opacity: [0.4, 0.6, 0.4],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const }
    };
  };

  const getAvatarAnimation = () => {
    if (state === "speaking") {
      if (sentiment === "roast") {
        // Spicy, rapid roasting vibration & shake
        return {
          x: [0, -4, 4, -3, 3, -4, 4, 0],
          y: [0, 3, -3, 2, -2, 3, -3, 0],
          rotate: [0, -5, 5, -4, 4, -5, 5, 0],
          scale: [1.05, 1.12, 1.05, 1.15, 1.05],
          transition: {
            duration: 0.35,
            repeat: Infinity,
            ease: "easeInOut" as const
          }
        };
      } else if (sentiment === "sassy") {
        // Sassy side-to-side sway and bounce
        return {
          x: [0, -3, 3, -1.5, 1.5, 0],
          y: [0, -6, 0, -4, 0],
          rotate: [0, 6, -6, 3, -3, 0],
          scale: [1.05, 1.1, 1.05, 1.08, 1.05],
          transition: {
            duration: 0.75,
            repeat: Infinity,
            ease: "easeInOut" as const
          }
        };
      } else {
        // Steady, calm warm pulse/breathing
        return {
          scale: [1.05, 1.1, 1.05],
          y: [0, -2, 0],
          transition: {
            duration: 1.1,
            repeat: Infinity,
            ease: "easeInOut" as const
          }
        };
      }
    }

    if (state === "listening") {
      // Attentive listening gentle wobble & pulse
      return {
        scale: [1.05, 1.08, 1.05],
        y: [0, 1.5, 0],
        transition: {
          duration: 1.0,
          repeat: Infinity,
          ease: "easeInOut" as const
        }
      };
    }

    if (state === "processing") {
      // Thinking state floating float
      return {
        y: [-2, 2, -2],
        rotate: [-2, 2, -2],
        scale: [1.05, 1.03, 1.05],
        transition: {
          duration: 0.5,
          repeat: Infinity,
          ease: "linear" as const
        }
      };
    }

    // Default gentle idle breathing
    return {
      scale: [1.05, 1.08, 1.05],
      y: [0, -1.5, 0],
      transition: {
        duration: 2.2,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    };
  };

  // Color palette changes based on state & emotional sentiment of spoken phrases
  const getTheme = () => {
    if (state === "speaking") {
      if (sentiment === "roast") {
        // Fiery Orange/Amber for roasts
        return { 
          color: "rgba(249, 115, 22, 1)", 
          glow: "shadow-orange-500/90", 
          border: "border-orange-500" 
        };
      } else if (sentiment === "sassy") {
        // Sassy/Tej deep pink/rose
        return { 
          color: "rgba(236, 72, 153, 1)", 
          glow: "shadow-pink-500/90", 
          border: "border-pink-500" 
        };
      } else {
        // Calm purple for standard responses
        return { 
          color: "rgba(168, 85, 247, 1)", 
          glow: "shadow-purple-500/90", 
          border: "border-purple-400" 
        };
      }
    }

    switch (state) {
      case "listening": return { color: "rgba(139, 92, 246, 1)", glow: "shadow-violet-500/60", border: "border-violet-400" };
      case "processing": return { color: "rgba(56, 189, 248, 1)", glow: "shadow-sky-400/80", border: "border-sky-400" };
      default: return { color: "rgba(6, 182, 212, 0.8)", glow: "shadow-cyan-500/40", border: "border-cyan-500/50" }; // Cyan for idle
    }
  };

  const theme = getTheme();


  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
      {/* Ambient Glow */}
      <motion.div
        animate={getPulseAnimation()}
        className={`absolute w-[60%] h-[60%] rounded-full blur-[80px] ${theme.glow} transition-all duration-1000 ease-in-out`}
        style={{ backgroundColor: theme.color, opacity: 0.15 }}
      />

      {/* Ring 1: Massive Outer Dashed */}
      <motion.div
        animate={getRingAnimation(4, false)}
        className={`absolute w-[100%] h-[100%] rounded-full border-[1px] border-dashed ${theme.border} opacity-20 transition-all duration-1000 ease-in-out`}
      />

      {/* Ring 2: Segmented Thick Ring */}
      <motion.div
        animate={getRingAnimation(3, true)}
        className={`absolute w-[85%] h-[85%] rounded-full border-[2px] border-dotted ${theme.border} opacity-30 transition-all duration-1000 ease-in-out`}
      />

      {/* Ring 3: Scanner Ring (Solid with gaps) */}
      <motion.div
        animate={getRingAnimation(2, false)}
        className={`absolute w-[70%] h-[70%] rounded-full border-[1px] ${theme.border} border-t-transparent border-b-transparent opacity-40 transition-all duration-1000 ease-in-out`}
      />

      {/* Ring 4: Inner Dashed */}
      <motion.div
        animate={getRingAnimation(1, true)}
        className={`absolute w-[55%] h-[55%] rounded-full border-[2px] border-dashed ${theme.border} opacity-50 transition-all duration-1000 ease-in-out`}
      />
      
      {/* Ring 5: Core HUD Ring */}
      <motion.div
        animate={getRingAnimation(0, false)}
        className={`absolute w-[40%] h-[40%] rounded-full border-[4px] border-dotted ${theme.border} opacity-70 transition-all duration-1000 ease-in-out`}
      />

      {/* Core Circle with Zoya's Virtual Assistant Girl Avatar */}
      <motion.div
        animate={getPulseAnimation()}
        className={`absolute w-[25%] h-[25%] rounded-full border-[2px] ${theme.border} bg-black/40 backdrop-blur-md flex items-center justify-center overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] transition-all duration-1000 ease-in-out`}
        style={{ boxShadow: `0 0 40px ${theme.color}, inset 0 0 30px ${theme.color}` }}
      >
        <div className="relative w-full h-full">
          <motion.img
            src={zoyaAvatar}
            alt="Zoya Virtual Assistant Girl"
            animate={getAvatarAnimation()}
            className="w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity duration-500"
            referrerPolicy="no-referrer"
          />

          {/* Left Eyelid Overlay */}
          <motion.div
            animate={{ scaleY: isBlinking ? 1 : 0 }}
            transition={{ duration: 0.12, ease: "easeInOut" }}
            className="absolute rounded-full bg-gradient-to-b from-[#dfaba0] to-[#cb988c] border border-[#be8674]/30 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] origin-top z-10"
            style={{
              left: "29.5%",
              top: "39.5%",
              width: "12%",
              height: "4.8%",
            }}
          />

          {/* Right Eyelid Overlay */}
          <motion.div
            animate={{ scaleY: isBlinking ? 1 : 0 }}
            transition={{ duration: 0.12, ease: "easeInOut" }}
            className="absolute rounded-full bg-gradient-to-b from-[#dfaba0] to-[#cb988c] border border-[#be8674]/30 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] origin-top z-10"
            style={{
              left: "51.5%",
              top: "39.5%",
              width: "12%",
              height: "4.8%",
            }}
          />

          {/* Talking Mouth Overlay */}
          <motion.div
            animate={{ 
              scaleY: 1 + mouthOpenAmount * 0.45,
              y: mouthOpenAmount * 1.8,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="absolute overflow-hidden origin-top z-10"
            style={{
              left: "38%",
              top: "60.5%",
              width: "22%",
              height: "8.5%",
              clipPath: "ellipse(50% 50% at 50% 50%)",
            }}
          >
            <img
              src={zoyaAvatar}
              alt="Zoya Talking Mouth"
              className="absolute max-w-none"
              style={{
                width: "454.54%",
                height: "1176.47%",
                left: "-172.72%",
                top: "-711.76%",
                objectFit: "cover",
              }}
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
        
        {/* Overlay banner with Zoya's name */}
        <div className="absolute bottom-0 left-0 w-full bg-black/60 backdrop-blur-sm py-1 md:py-1.5 text-center border-t border-white/10 z-20">
          <span 
            className="font-mono text-[9px] md:text-[11px] tracking-[0.3em] font-bold text-white uppercase flex items-center justify-center gap-1.5"
            style={{ textShadow: `0 0 10px ${theme.color}` }}
          >
            ZOYA
          </span>
        </div>
      </motion.div>
    </div>
  );
}
