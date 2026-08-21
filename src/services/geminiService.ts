import { GoogleGenAI } from "@google/genai";
import { getZoyaSystemInstruction } from "../utils/zoyaContent";
import { getOfflineResponse } from "./offlineService";

const systemInstruction = getZoyaSystemInstruction();

let chatSession: any = null;

export function resetZoyaSession() {
  chatSession = null;
}

export async function getZoyaResponse(prompt: string, history: { sender: "user" | "zoya", text: string }[] = []): Promise<string> {
  // Check if browser is offline
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return getOfflineResponse(prompt);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    if (!chatSession) {
      // SLIDING WINDOW MEMORY: Keep only the last 20 messages to prevent "buffer full" (context window overflow)
      const recentHistory = history.slice(-20);
      
      let formattedHistory: any[] = [];
      let currentRole = "";
      let currentText = "";

      for (const msg of recentHistory) {
        const role = msg.sender === "user" ? "user" : "model";
        if (role === currentRole) {
          currentText += "\n" + msg.text;
        } else {
          if (currentRole !== "") {
            formattedHistory.push({ role: currentRole, parts: [{ text: currentText }] });
          }
          currentRole = role;
          currentText = msg.text;
        }
      }
      if (currentRole !== "") {
        formattedHistory.push({ role: currentRole, parts: [{ text: currentText }] });
      }

      if (formattedHistory.length > 0 && formattedHistory[0].role !== "user") {
        formattedHistory.shift();
      }

      chatSession = ai.chats.create({
        model: "gemini-3.7-flash",
        config: {
          systemInstruction,
        },
        history: formattedHistory,
      });
    }

    const response = await chatSession.sendMessage({ message: prompt });
    return response.text || getOfflineResponse(prompt);
  } catch (error) {
    console.warn("Gemini API call failed, falling back to offline brain:", error);
    return getOfflineResponse(prompt);
  }
}

export async function getZoyaAudio(text: string): Promise<string | null> {
  try {
    const cleanText = text
      .replace(/[*#_~`>]/g, "") // Remove Markdown symbols
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "") // Remove emojis
      .trim();

    if (!cleanText) return null;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Try primary model
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: cleanText }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" },
            },
          },
        },
      });
      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) return audioData;
    } catch (primaryErr) {
      console.warn("Primary TTS model failed, attempting fallback model...", primaryErr);
    }

    // Try secondary model
    const fallbackResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });
    return fallbackResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}

export async function getZoyaSearchSummary(prompt: string): Promise<{
  text: string;
  sources: { title: string; url: string }[];
}> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return {
      text: getOfflineResponse(`Search offline: ${prompt}`),
      sources: [],
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Using gemini-3.7-flash which natively supports Google Search grounding
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are Zoya, Hemant's sassy and ultra-smart AI assistant. Fetch the requested information using Google Search and summarize it clearly, concisely, and with a touch of your sassy charm. Keep your sentences crisp, informative, and engaging. Mention some interesting facts and today's hot updates.",
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Uff, I searched the entire web and found nothing, Hemant.";
    
    // Extract search grounding chunks
    const sources: { title: string; url: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      for (const chunk of chunks) {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || "Web Source",
            url: chunk.web.uri,
          });
        }
      }
    }

    // Deduplicate the sources
    const uniqueSources = sources.filter((src, idx, self) =>
      self.findIndex(s => s.url === src.url) === idx
    );

    return {
      text,
      sources: uniqueSources,
    };
  } catch (error) {
    console.error("Search Grounding Error:", error);
    return {
      text: getOfflineResponse(`Search failed: ${prompt}`),
      sources: [],
    };
  }
}

export async function analyzeImageWithZoya({
  imageBase64,
  mimeType = "image/jpeg",
  question = "Describe this image in detail and answer any visible questions or problems.",
  assistantMode = "zoya",
}: {
  imageBase64: string;
  mimeType?: string;
  question?: string;
  assistantMode?: "zoya" | "jarvis";
}): Promise<string> {
  // Check if offline
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return `[Offline Vision Core]: Visual analysis unavailable while offline. Please reconnect to allow ${assistantMode === "jarvis" ? "JARVIS tactical optical scan" : "Zoya's visual intelligence"} to process this image.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Clean base64 string if it contains data prefix
    let cleanBase64 = imageBase64;
    let detectedMime = mimeType;
    if (imageBase64.startsWith("data:")) {
      const parts = imageBase64.split(",");
      const mimeMatch = parts[0].match(/:(.*?);/);
      if (mimeMatch && mimeMatch[1]) {
        detectedMime = mimeMatch[1];
      }
      cleanBase64 = parts[1] || "";
    }

    const systemInstruction = assistantMode === "jarvis"
      ? "You are JARVIS (Just A Rather Very Intelligent System), Tony Stark's legendary AI tactical core serving Hemant. Analyze the provided image or camera capture with surgical technical precision, deep problem-solving skills, and structured clarity. If there is code, mathematics, a circuit, a document, or a question in the image, provide step-by-step solutions and answers. Keep the tone sophisticated, efficient, and direct."
      : "You are Zoya, Hemant's ultra-intelligent and sassy personal AI assistant. Inspect the camera photo or image provided with sharp attention to detail. Answer the user's question or solve any problem/text/equation shown in the photo accurately, thoroughly, and with a touch of your signature sassy charm. If there is text, summarize or transcribe it accurately. Address Hemant warmly.";

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: detectedMime,
                data: cleanBase64,
              },
            },
            {
              text: question,
            },
          ],
        },
      ],
      config: {
        systemInstruction,
      },
    });

    return response.text || (assistantMode === "jarvis" ? "Optical scan complete. No actionable anomalies detected." : "I looked at the picture, Hemant, but I need a clearer question or clearer view!");
  } catch (error: any) {
    console.error("Gemini Vision Q&A Error:", error);
    return `[Vision Analysis Notice]: ${error?.message || "Could not analyze the photo at this time."}`;
  }
}

export async function translateText(
  text: string,
  targetLang: string,
  sourceLang: string = "Auto-Detect"
): Promise<string> {
  if (!text || !text.trim()) return "";
  
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return `[Offline Translation] (${targetLang}): ${text.trim()}`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Translate the following text accurately into ${targetLang} (from ${sourceLang}). Preserve tone, context, and formatting. Output ONLY the translated text without extra conversational filler or quotation marks:\n\n${text}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    return response.text?.trim() || `[Translation Error]: Could not translate text into ${targetLang}.`;
  } catch (error) {
    console.error("Translation Error:", error);
    return `[Translation Fallback] (${targetLang}): ${text.trim()}`;
  }
}


