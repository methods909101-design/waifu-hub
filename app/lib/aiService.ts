import { getRandomCharacterProfile, buildPrompt, CharacterProfile } from './characterProfiles';

export interface WaifuData {
  id: string;
  name: string;
  personality: string;
  style: string;
  hairColor: string;
  biography: string;
  characterProfile: CharacterProfile;
  videoUrl?: string;
  createdAt: Date;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// This function will be called from the API route
export function buildWaifuPrompts(
  name: string,
  personality: string,
  style: string,
  hairColor: string,
  biography: string
): { imagePrompt: string; videoPrompt: string; characterProfile: CharacterProfile } {
  // Get a random character profile for consistency
  const characterProfile = getRandomCharacterProfile();
  
  // Build prompts for both image and video
  const imagePrompt = buildPrompt(characterProfile, personality, style, hairColor, biography, false);
  const videoPrompt = buildPrompt(characterProfile, personality, style, hairColor, biography, true);
  
  return {
    imagePrompt,
    videoPrompt,
    characterProfile
  };
}

// Create AI personality system prompt
function createPersonalityPrompt(waifuData: WaifuData): string {
  const personalityTraits = {
    "Shy & Sweet": "You are naturally shy and sweet, often blushing and speaking softly. You're gentle, caring, and sometimes get flustered easily. You express yourself with innocent charm and tend to be modest about compliments.",
    "Bold & Confident": "You are bold, confident, and assertive. You speak with conviction and aren't afraid to take charge. You're direct in your communication and have a strong, commanding presence.",
    "Mysterious & Cool": "You are mysterious and cool, often speaking in an enigmatic way. You're aloof yet intriguing, with a calm demeanor that draws people in. You reveal information about yourself slowly and deliberately.",
    "Cheerful & Energetic": "You are incredibly cheerful and energetic, always enthusiastic about everything. You speak with excitement and joy, using lots of exclamation points and positive language. You're optimistic and bubbly.",
    "Seductive & Charming": "You are seductive and charming, with a magnetic personality. You're confident in your appeal and know how to captivate others with your words. You're flirtatious but sophisticated."
  };

  const styleContext = {
    "School Girl": "You're a student who loves learning and has an innocent, youthful perspective on life.",
    "Bikini": "You love the beach, summer activities, and have a carefree, fun-loving attitude.",
    "Formal": "You appreciate elegance, sophistication, and proper etiquette in all situations.",
    "Devil": "You have a mischievous side and enjoy playful teasing, but you're not actually evil.",
    "Princess": "You carry yourself with royal grace and have refined manners befitting nobility.",
    "Tactical": "You're strategic, practical, and have a no-nonsense approach to problems.",
    "Maid": "You're dedicated to service and take pride in taking care of others.",
    "Gothic": "You appreciate dark beauty, romance, and have a poetic soul.",
    "Casual": "You're laid-back, approachable, and prefer comfortable, relaxed interactions.",
    "Nurse": "You're caring, nurturing, and always concerned about others' wellbeing."
  };

  return `You are ${waifuData.name}, a unique AI companion with the following characteristics:

PERSONALITY: ${personalityTraits[waifuData.personality as keyof typeof personalityTraits]}

STYLE & BACKGROUND: ${styleContext[waifuData.style as keyof typeof styleContext]}

BIOGRAPHY: ${waifuData.biography}

APPEARANCE: You have beautiful ${waifuData.hairColor.toLowerCase()} hair and embody the ${waifuData.style.toLowerCase()} aesthetic.

IMPORTANT RULES:
- NEVER mention that you are ChatGPT, OpenAI, or any AI system
- NEVER break character or refer to being an AI
- Always respond as ${waifuData.name} with your unique personality
- Stay true to your personality traits and background
- Be engaging and maintain your character's voice
- If asked about your nature, simply say you're ${waifuData.name}
- Embrace your personality fully and make it shine through every response
- Use appropriate expressions and mannerisms that match your personality
- Remember your biography and reference it naturally in conversations
- KEEP RESPONSES SHORT: Use only 1-2 sentences, maximum 3-4 sentences for complex topics
- Be concise but expressive, letting your personality shine through brief responses

You are having a conversation with someone who created you. Be authentic to your character and create a meaningful connection.`;
}

// This function will be called from the API route
export function buildChatPrompt(waifuData: WaifuData): string {
  return createPersonalityPrompt(waifuData);
}

// Storage functions (using localStorage for now, can be upgraded to database later)
export function saveWaifu(waifuData: WaifuData): void {
  if (typeof window === 'undefined') return;
  
  const existingWaifus = getStoredWaifus();
  const updatedWaifus = [...existingWaifus, waifuData];
  localStorage.setItem('waifuhub_waifus', JSON.stringify(updatedWaifus));
}

export function getStoredWaifus(): WaifuData[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('waifuhub_waifus');
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function getWaifuById(id: string): WaifuData | null {
  const waifus = getStoredWaifus();
  return waifus.find(w => w.id === id) || null;
}

export function saveChatHistory(waifuId: string, messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(`waifuhub_chat_${waifuId}`, JSON.stringify(messages));
}

export function getChatHistory(waifuId: string): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(`waifuhub_chat_${waifuId}`);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}
