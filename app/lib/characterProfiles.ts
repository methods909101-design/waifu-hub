export interface CharacterProfile {
  id: number;
  basePrompt: string;
  consistencyTags: string[];
  styleModifiers: {
    [key: string]: string;
  };
  personalityModifiers: {
    [key: string]: string;
  };
}

export const CHARACTER_PROFILES: CharacterProfile[] = [
  {
    id: 1,
    basePrompt: "A beautiful anime girl with large expressive eyes, soft facial features, and a gentle smile",
    consistencyTags: ["same character", "consistent appearance", "identical face", "matching features"],
    styleModifiers: {
      "School Girl": "wearing a traditional Japanese school uniform with pleated skirt, white blouse, and red ribbon tie",
      "Bikini": "wearing a stylish two-piece swimsuit at a beach setting",
      "Formal": "wearing an elegant evening dress with sophisticated styling",
      "Devil": "wearing a dark gothic outfit with small horns and a mischievous expression",
      "Princess": "wearing a flowing royal gown with tiara and elegant accessories",
      "Tactical": "wearing military-style tactical gear with utility belts and combat boots",
      "Maid": "wearing a classic French maid outfit with frilly apron and headband",
      "Gothic": "wearing dark Victorian-inspired clothing with lace and corset details",
      "Casual": "wearing comfortable modern casual clothes like jeans and a cute top",
      "Nurse": "wearing a clean white medical uniform with a nurse cap"
    },
    personalityModifiers: {
      "Shy & Sweet": "with a bashful expression, slightly blushing cheeks, and gentle demeanor",
      "Bold & Confident": "with a confident pose, determined expression, and strong presence",
      "Mysterious & Cool": "with an enigmatic smile, piercing gaze, and aloof posture",
      "Cheerful & Energetic": "with a bright smile, sparkling eyes, and dynamic pose",
      "Seductive & Charming": "with an alluring expression, sultry gaze, and captivating presence"
    }
  },
  {
    id: 2,
    basePrompt: "An elegant anime maiden with delicate features, graceful posture, and ethereal beauty",
    consistencyTags: ["same character", "consistent appearance", "identical face", "matching features"],
    styleModifiers: {
      "School Girl": "in a pristine school uniform with knee-high socks and polished shoes",
      "Bikini": "in a fashionable swimsuit with beach accessories and sun-kissed skin",
      "Formal": "in a sophisticated ballgown with jewelry and refined elegance",
      "Devil": "in dark attire with subtle demonic elements and mysterious aura",
      "Princess": "in royal regalia with crown and flowing cape",
      "Tactical": "in sleek combat gear with high-tech equipment",
      "Maid": "in an ornate maid costume with detailed embroidery",
      "Gothic": "in elaborate dark fashion with intricate accessories",
      "Casual": "in trendy streetwear with stylish accessories",
      "Nurse": "in a professional medical outfit with caring demeanor"
    },
    personalityModifiers: {
      "Shy & Sweet": "with downcast eyes, soft smile, and innocent charm",
      "Bold & Confident": "with head held high, fierce expression, and commanding presence",
      "Mysterious & Cool": "with half-lidded eyes, subtle smirk, and distant gaze",
      "Cheerful & Energetic": "with wide smile, animated expression, and lively stance",
      "Seductive & Charming": "with knowing look, graceful pose, and magnetic appeal"
    }
  },
  {
    id: 3,
    basePrompt: "A stunning anime character with perfect proportions, flawless skin, and captivating beauty",
    consistencyTags: ["same character", "consistent appearance", "identical face", "matching features"],
    styleModifiers: {
      "School Girl": "dressed in a cute school uniform with accessories and youthful charm",
      "Bikini": "wearing a designer swimsuit with beach vibes and summer atmosphere",
      "Formal": "adorned in luxury evening wear with glamorous styling",
      "Devil": "clothed in dark mystical attire with supernatural elements",
      "Princess": "garbed in magnificent royal dress with regal accessories",
      "Tactical": "equipped with advanced tactical gear and professional stance",
      "Maid": "attired in elegant maid uniform with perfect presentation",
      "Gothic": "dressed in dramatic gothic fashion with dark romance",
      "Casual": "wearing chic casual outfit with modern flair",
      "Nurse": "uniformed in medical attire with professional appearance"
    },
    personalityModifiers: {
      "Shy & Sweet": "displaying timid expression, rosy cheeks, and gentle nature",
      "Bold & Confident": "showing strong posture, intense gaze, and fearless attitude",
      "Mysterious & Cool": "exhibiting calm composure, secretive smile, and cool demeanor",
      "Cheerful & Energetic": "radiating joy, enthusiastic expression, and vibrant energy",
      "Seductive & Charming": "emanating allure, confident smile, and irresistible charm"
    }
  },
  {
    id: 4,
    basePrompt: "A mesmerizing anime beauty with distinctive features, perfect symmetry, and enchanting presence",
    consistencyTags: ["same character", "consistent appearance", "identical face", "matching features"],
    styleModifiers: {
      "School Girl": "in traditional school attire with youthful innocence and academic charm",
      "Bikini": "in stylish beachwear with tropical setting and summer glow",
      "Formal": "in exquisite formal dress with sophisticated elegance",
      "Devil": "in mysterious dark clothing with otherworldly beauty",
      "Princess": "in majestic royal outfit with noble bearing",
      "Tactical": "in functional combat gear with serious demeanor",
      "Maid": "in pristine service uniform with dutiful expression",
      "Gothic": "in ornate dark fashion with romantic mystery",
      "Casual": "in comfortable modern clothes with relaxed style",
      "Nurse": "in clean medical uniform with caring professionalism"
    },
    personalityModifiers: {
      "Shy & Sweet": "with modest expression, gentle blush, and endearing shyness",
      "Bold & Confident": "with assertive pose, determined look, and unwavering confidence",
      "Mysterious & Cool": "with enigmatic expression, cool gaze, and aloof charm",
      "Cheerful & Energetic": "with beaming smile, bright eyes, and infectious enthusiasm",
      "Seductive & Charming": "with sultry expression, captivating gaze, and magnetic presence"
    }
  },
  {
    id: 5,
    basePrompt: "An alluring anime character with harmonious features, graceful movements, and timeless beauty",
    consistencyTags: ["same character", "consistent appearance", "identical face", "matching features"],
    styleModifiers: {
      "School Girl": "wearing classic school uniform with innocent appeal and scholarly grace",
      "Bikini": "sporting elegant swimwear with beach paradise backdrop",
      "Formal": "donning luxurious evening gown with refined sophistication",
      "Devil": "cloaked in dark mystical garments with supernatural allure",
      "Princess": "adorned in splendid royal dress with majestic presence",
      "Tactical": "outfitted in modern combat gear with tactical precision",
      "Maid": "dressed in immaculate service attire with graceful service",
      "Gothic": "styled in elaborate dark fashion with romantic drama",
      "Casual": "clothed in trendy casual wear with effortless style",
      "Nurse": "uniformed in professional medical wear with compassionate care"
    },
    personalityModifiers: {
      "Shy & Sweet": "expressing bashful charm, sweet smile, and innocent demeanor",
      "Bold & Confident": "displaying strong presence, bold expression, and fearless spirit",
      "Mysterious & Cool": "showing mysterious allure, cool confidence, and enigmatic beauty",
      "Cheerful & Energetic": "radiating happiness, energetic pose, and joyful spirit",
      "Seductive & Charming": "exuding sensual appeal, charming smile, and irresistible magnetism"
    }
  },
  {
    id: 6,
    basePrompt: "A radiant anime maiden with celestial beauty, perfect features, and divine presence",
    consistencyTags: ["same character", "consistent appearance", "identical face", "matching features"],
    styleModifiers: {
      "School Girl": "in immaculate school uniform with angelic innocence",
      "Bikini": "in designer swimsuit with heavenly beach setting",
      "Formal": "in divine evening wear with celestial elegance",
      "Devil": "in dark mystical attire with fallen angel beauty",
      "Princess": "in heavenly royal gown with divine majesty",
      "Tactical": "in advanced gear with warrior angel presence",
      "Maid": "in perfect service uniform with angelic dedication",
      "Gothic": "in dark romantic fashion with gothic angel aesthetic",
      "Casual": "in stylish casual wear with effortless grace",
      "Nurse": "in pristine medical attire with healing presence"
    },
    personalityModifiers: {
      "Shy & Sweet": "with angelic shyness, pure smile, and innocent grace",
      "Bold & Confident": "with divine confidence, powerful presence, and celestial strength",
      "Mysterious & Cool": "with ethereal mystery, cool divinity, and otherworldly charm",
      "Cheerful & Energetic": "with radiant joy, heavenly enthusiasm, and divine energy",
      "Seductive & Charming": "with divine allure, celestial charm, and irresistible grace"
    }
  },
  {
    id: 7,
    basePrompt: "A captivating anime character with flawless design, artistic beauty, and perfect composition",
    consistencyTags: ["same character", "consistent appearance", "identical face", "matching features"],
    styleModifiers: {
      "School Girl": "in artistic school uniform with creative flair and academic beauty",
      "Bikini": "in artistic swimwear with creative beach composition",
      "Formal": "in masterpiece evening gown with artistic elegance",
      "Devil": "in artistic dark attire with creative mystical elements",
      "Princess": "in artistic royal dress with masterful design",
      "Tactical": "in artistic combat gear with creative functionality",
      "Maid": "in artistic service uniform with creative details",
      "Gothic": "in artistic dark fashion with creative gothic elements",
      "Casual": "in artistic casual wear with creative modern style",
      "Nurse": "in artistic medical uniform with creative professional design"
    },
    personalityModifiers: {
      "Shy & Sweet": "with artistic shyness, creative innocence, and masterful charm",
      "Bold & Confident": "with artistic confidence, creative strength, and masterful presence",
      "Mysterious & Cool": "with artistic mystery, creative coolness, and masterful allure",
      "Cheerful & Energetic": "with artistic joy, creative energy, and masterful enthusiasm",
      "Seductive & Charming": "with artistic seduction, creative charm, and masterful appeal"
    }
  },
  {
    id: 8,
    basePrompt: "An exquisite anime beauty with refined features, elegant posture, and sophisticated charm",
    consistencyTags: ["same character", "consistent appearance", "identical face", "matching features"],
    styleModifiers: {
      "School Girl": "in refined school uniform with sophisticated academic style",
      "Bikini": "in elegant swimwear with sophisticated beach elegance",
      "Formal": "in refined evening gown with sophisticated luxury",
      "Devil": "in elegant dark attire with sophisticated mystique",
      "Princess": "in refined royal dress with sophisticated nobility",
      "Tactical": "in elegant combat gear with sophisticated functionality",
      "Maid": "in refined service uniform with sophisticated service",
      "Gothic": "in elegant dark fashion with sophisticated gothic style",
      "Casual": "in refined casual wear with sophisticated modern appeal",
      "Nurse": "in elegant medical uniform with sophisticated professionalism"
    },
    personalityModifiers: {
      "Shy & Sweet": "with refined shyness, sophisticated innocence, and elegant charm",
      "Bold & Confident": "with refined confidence, sophisticated strength, and elegant power",
      "Mysterious & Cool": "with refined mystery, sophisticated coolness, and elegant allure",
      "Cheerful & Energetic": "with refined joy, sophisticated energy, and elegant enthusiasm",
      "Seductive & Charming": "with refined seduction, sophisticated charm, and elegant magnetism"
    }
  },
  {
    id: 9,
    basePrompt: "A breathtaking anime character with harmonious proportions, natural beauty, and authentic presence",
    consistencyTags: ["same character", "consistent appearance", "identical face", "matching features"],
    styleModifiers: {
      "School Girl": "in natural school uniform with authentic academic charm",
      "Bikini": "in natural swimwear with authentic beach beauty",
      "Formal": "in natural evening gown with authentic elegance",
      "Devil": "in natural dark attire with authentic mystical presence",
      "Princess": "in natural royal dress with authentic nobility",
      "Tactical": "in natural combat gear with authentic warrior spirit",
      "Maid": "in natural service uniform with authentic dedication",
      "Gothic": "in natural dark fashion with authentic gothic beauty",
      "Casual": "in natural casual wear with authentic modern style",
      "Nurse": "in natural medical uniform with authentic caring nature"
    },
    personalityModifiers: {
      "Shy & Sweet": "with natural shyness, authentic innocence, and genuine charm",
      "Bold & Confident": "with natural confidence, authentic strength, and genuine power",
      "Mysterious & Cool": "with natural mystery, authentic coolness, and genuine allure",
      "Cheerful & Energetic": "with natural joy, authentic energy, and genuine enthusiasm",
      "Seductive & Charming": "with natural seduction, authentic charm, and genuine magnetism"
    }
  },
  {
    id: 10,
    basePrompt: "A magnificent anime maiden with perfect artistry, divine proportions, and transcendent beauty",
    consistencyTags: ["same character", "consistent appearance", "identical face", "matching features"],
    styleModifiers: {
      "School Girl": "in perfect school uniform with transcendent academic grace",
      "Bikini": "in perfect swimwear with transcendent beach divinity",
      "Formal": "in perfect evening gown with transcendent formal elegance",
      "Devil": "in perfect dark attire with transcendent mystical power",
      "Princess": "in perfect royal dress with transcendent noble majesty",
      "Tactical": "in perfect combat gear with transcendent warrior excellence",
      "Maid": "in perfect service uniform with transcendent graceful service",
      "Gothic": "in perfect dark fashion with transcendent gothic romance",
      "Casual": "in perfect casual wear with transcendent modern beauty",
      "Nurse": "in perfect medical uniform with transcendent healing presence"
    },
    personalityModifiers: {
      "Shy & Sweet": "with perfect shyness, transcendent innocence, and divine charm",
      "Bold & Confident": "with perfect confidence, transcendent strength, and divine power",
      "Mysterious & Cool": "with perfect mystery, transcendent coolness, and divine allure",
      "Cheerful & Energetic": "with perfect joy, transcendent energy, and divine enthusiasm",
      "Seductive & Charming": "with perfect seduction, transcendent charm, and divine magnetism"
    }
  }
];

export function getRandomCharacterProfile(): CharacterProfile {
  const randomIndex = Math.floor(Math.random() * CHARACTER_PROFILES.length);
  return CHARACTER_PROFILES[randomIndex];
}

export function buildPrompt(
  profile: CharacterProfile,
  personality: string,
  style: string,
  hairColor: string,
  biography: string,
  isVideo: boolean = false
): string {
  const basePrompt = profile.basePrompt;
  const personalityMod = profile.personalityModifiers[personality] || "";
  const styleMod = profile.styleModifiers[style] || "";
  const hairColorMod = `with beautiful ${hairColor.toLowerCase()} hair`;
  const consistencyTags = profile.consistencyTags.join(", ");
  
  // Add biography context
  const biographyContext = biography.trim() ? `, ${biography}` : "";
  
  // Video-specific modifiers
  const videoMod = isVideo ? ", subtle movement, gentle animation, smooth motion, cinematic quality" : "";
  
  // Anime style enforcement
  const animeStyle = ", sleek classic anime style, high quality anime art, detailed anime illustration";
  
  return `${basePrompt} ${personalityMod}, ${styleMod}, ${hairColorMod}${biographyContext}. ${consistencyTags}${animeStyle}${videoMod}`;
}
