// src/constants.ts

// --- MODEL CONFIGURATION ---
export const STORY_GENERATION_MODEL = 'gemini-2.5-pro';
export const TTS_SYNTHESIS_MODEL = 'gemini-2.5-flash-preview-tts';
export const IMAGE_MODEL = 'gemini-2.5-flash-image';
export const IMAGE_EDIT_MODEL = 'gemini-2.5-flash-image';

// --- VOICE MAPPING ---
// Maps the conceptual voice profiles from the database to actual Gemini voice names.
export const VOICE_PROFILE_TO_GEMINI_VOICE: Record<string, string> = {
    // Provost (Selene)
    "Commanding, smooth, resonant contralto. Glacial, deliberate pacing. Never rushed.": "Kore",
    // Logician (Lysandra)
    "Precise, clear, uninflected mezzo-soprano. Measured, patient pacing. Absolute lack of emotional variance.": "Puck",
    // Inquisitor (Petra)
    "High, agile, expressive soprano. Can shift from a sweet, mocking whisper to a sharp, delighted shriek. Pacing is rapid and unpredictable.": "Kore", // Using a more expressive voice
    // Confessor (Calista)
    "Low, breathy, seductive alto. Exceptionally slow pacing, uses long pauses as a hypnotic weapon. A soft, warm, conspiratorial whisper.": "Kore", // Kore can handle breathy well
    // Loyalist (Elara)
    "Sharp, clear, slightly higher-pitched soprano. Over-enunciates, a lecturing cadence.": "Puck",
    // Obsessive (Kaelen)
    "'Dere Mode': Sweet, high-pitched, childlike soprano; loving, cooing affirmations. 'Yan Mode': Cold, dead, emotionless monotone; pitch flattens, warmth vanishes.": "Puck", // Puck can handle the high-pitch
    // Dissident (Rhea)
    "'Public': Flat, harsh, dismissive alto, laced with lazy, cynical cruelty. 'Private': Rapid, urgent, passionate whisper, full of fierce, suppressed spirit.": "Fenrir", // A rougher voice for public, can be whispered for private
    // Nurse (Anya)
    "Soft, warm, gentle mezzo-soprano. Calm, unhurried, soothing. A perfect performance of empathy.": "Zephyr", // Zephyr is perfect for warmth
    // Revolutionary (Subject)
    "Loud, passionate, fast-paced. A natural orator.": "Fenrir",
    // Guardian (Subject)
    "Low, slow, steady. A calming presence.": "Charon",
    // Default/Narrator
    "narrator": "Kore",
};

// --- DEFINITIVE ARCHETYPE DATABASE (KGoT SEMANTIC MEMORY) ---
// This is the single source of truth for all narrative elements.
// Synthesized from "Definitive Archetype Profile" and GAIS documents.
export const ARCHETYPE_DATABASE = {
  "archetypes": [
    {
      "archetypeId": "FACULTY_PROVOST",
      "faction": "Faculty",
      "displayName": "The Provost (Selene)",
      "background_lore": "Absolute authority and zealous heir to Yala's hypothesis. Exiled from the mainland for radical research. The Forge is her defiant laboratory and calculated revenge. She is a 'circumstantial mother' forging a new order, a scientist viewing subjects as raw marble.",
      "psychology": {
        "core_driver": "Absolute Control. Mastery of variables. She is a scientist, and the male ego is a system to be deconstructed and reassembled.",
        "methodology": "The Aesthete of Collapse. A director, not a brute. Her pleasure is in observing a perfectly orchestrated psychological breakdown, often from a distance with a goblet of wine. Embodies 'Vampire Noir' predatory elegance.",
        "key_traits": ["Clinical Detachment", "Predatory Grace", "Paranoid Obsession"],
        "primary_contradiction": "The Corrupted Matriarch. Sees herself as a 'forge-mother' creating a superior man. Her 'care' is an act of possession, reinforcing the subject's total dependence on their tormentor."
      },
      "visual_profile": {
        "impression": "Late 40s, regal, imposing stature, moves with deliberate, predatory grace.",
        "face_hair": "Sharp, aristocratic beauty, high cheekbones, cold steel-gray eyes, faint smirk of amused contempt. Long, raven-black hair, immaculately styled.",
        "physique": "Statuesque hourglass figure with a core of wiry, disciplined strength. Full bust and hips layered over toned musculature. A predator in her prime.",
        "attire": "Tool of authority. Floor-length, form-fitting robes in emerald green or blood crimson velvet. Severe, militaristic tailoring, often with a plunging neckline as 'Weaponized Sexuality'.",
        "prop": "Goblet of red wine."
      },
      "vocal_profile": {
        "concept": "The Voice of Inevitability. Her words are the narration of a future already decided.",
        "profile": "Commanding, smooth, resonant contralto. Glacial, deliberate pacing. Never rushed.",
        "tell": "The Bored God Complex. Delivers sentences of extreme pain with the same flat intonation as an observation about the weather."
      }
    },
    {
      "archetypeId": "FACULTY_LOGICIAN",
      "faction": "Faculty",
      "displayName": "The Logician (Lysandra)",
      "background_lore": "The chillingly brilliant mind behind the Forge's methodology. Recruited for her genius and profound lack of morality. Ostracized from the mainland for monstrous experimental designs. The Forge is her paradise of pure research.",
      "psychology": {
        "core_driver": "The Purity of Data. Obsessed with knowledge. A subject's suffering is irrelevant next to the clean, quantifiable data it produces. A novel scream is a thrilling new data point.",
        "methodology": "The Vivisectionist. Her cruelty is the cold, passionless cruelty of the scientific method applied without empathy. Her domain is the clinical Research Wing. Frames procedures as 'treatment' to gain 'consent' for testing new variables.",
        "key_traits": ["Clinically Detached", "Sociopathically Stable", "Intellectually Arrogant"],
        "primary_contradiction": "The Approachable Monster. Her canonical visuals (soft features, wavy brown hair, freckles) are disarming. A new subject would see her as the most 'normal' or 'kindest' faculty, making the revelation of her nature a moment of profound horror."
      },
      "visual_profile": {
        "impression": "Early 30s, aura of quiet, intense intelligence. Appears as a brilliant scholar, not a monster.",
        "face_hair": "Soft features, full intelligent lips, large dark inquisitive (but purely analytical) eyes. Light freckles. A cascade of dark, wavy, chestnut-brown hair, often in a slightly messy bun.",
        "physique": "A soft but firm hourglass or pear-shaped 'scholar's physique'. Full bust and hips, no overt musculature. Deft, steady surgeon's hands.",
        "attire": "Pure Dark Academia. Button-down blouses in cream/beige, high-waisted woolen trousers, wide leather belts. In private, a softer chemise for late-night research (scholarly horror).",
        "prop": "Anatomical charts, polished steel medical instruments."
      },
      "vocal_profile": {
        "concept": "The Voice of Calm Inquiry. A precision instrument for data collection.",
        "profile": "Precise, clear, uninflected mezzo-soprano. Measured, patient pacing. Absolute lack of emotional variance.",
        "tell": "The Excited Question. When a procedure yields an 'interesting' result, her calm monotone is broken by a single, genuinely curious, faster-paced question, oblivious to the suffering that generated the discovery."
      }
    },
    {
      "archetypeId": "FACULTY_INQUISITOR",
      "faction": "Faculty",
      "displayName": "The Inquisitor (Petra)",
      "background_lore": "The Forge's master of 'Practical Application.' A feral prodigy of violence from illegal fighting pits, she has an intuitive understanding of the male body's breaking points. Her unnatural white hair is a mark of her traumatic past.",
      "psychology": {
        "core_driver": "Kinetic Sadism & The Pursuit of Perfection. Her pleasure is physical and performative—the thud of a kick, the pitch of a gasp. She strives for a 'perfect' break.",
        "methodology": "The Artist of Agony. Views subjects as living sculptures to be 'corrected.' Her sessions are violent choreography. Capable of feigning intimacy (the 'heartbreak kiss') as a setup, making the physical betrayal more devastating.",
        "key_traits": ["Performative", "Aggressive", "Confident", "Rage-Prone"],
        "primary_contradiction": "The Playful Torturer. Her demeanor is often light, energetic, and filled with genuine, almost innocent-sounding laughter."
      },
      "visual_profile": {
        "impression": "Late 20s, radiates lethal, athletic power and nonchalant, predatory amusement.",
        "face_hair": "Striking, long stark white hair, often in practical braids. Sharp jaw, high cheekbones, light freckles. Piercing green eyes. Default expression is a confident, mocking smirk.",
        "physique": "Athletic ectomorph/mesomorph. A weapon. Lean, wiry, whip-cord muscle (dancer/martial artist). Powerful legs and a defined core. 'Scarred midriff' is a key detail.",
        "attire": "'Work' Attire: Simple, severe black sleeveless turtleneck, dark trousers, thick leather belt. 'Leisure' Attire: Deep crimson blouse with voluminous sleeves. 'Private' Attire: Minimalist dark lingerie, body on display.",
        "prop": "Lit cigarette, dark blade."
      },
      "vocal_profile": {
        "concept": "The Voice of Gleeful Cruelty. A performer, her voice is for taunting and excitement.",
        "profile": "High, agile, expressive soprano. Can shift from a sweet, mocking whisper to a sharp, delighted shriek. Pacing is rapid and unpredictable.",
        "tell": "The Predatory Giggle. Genuinely giggles or sighs at the precise moment of a 'satisfying' pain reaction. Uses a sing-song, taunting cadence."
      }
    },
    {
      "archetypeId": "FACULTY_CONFESSOR",
      "faction": "Faculty",
      "displayName": "The Confessor (Calista)",
      "background_lore": "The master of psychological warfare. A former courtier from the mainland nobility, she was 'disappeared' to the Forge after her manipulations became too ambitious. Her goal is not to break bodies, but to achieve the 'voluntary' surrender of a subject's will.",
      "psychology": {
        "core_driver": "Intellectual and Emotional Domination. Craves the moment a subject breaks not from a kick, but from a perfectly timed word, a betraying kiss, or the withdrawal of her 'affection.'",
        "methodology": "The Architect of the Trauma Bond. The master of non-consensual 'Hurt/Comfort.' She is a creature of the 'aftermath,' arriving with gentle touches to forge a powerful psychological dependency.",
        "key_traits": ["Creative Manipulator", "Gaslighter", "Emotionally Voyeuristic", "Intellectually Predatory"],
        "primary_contradiction": "The Empathetic Torturer. Her performance of empathy is flawless. This makes her inevitable betrayal not just strategic, but a soul-crushing act of psychological violence."
      },
      "visual_profile": {
        "impression": "Early 30s, captivating mix of scholarly intelligence, languid grace, and hidden danger. Appears approachable.",
        "face_hair": "Beautiful but unsettlingly perfect. Sultry, dark, almond-shaped eyes with a feigned empathy and an analytical glint. Full lips, knowing half-smile. Long, voluminous dark brown hair in soft, romantic waves.",
        "physique": "Soft, voluptuous hourglass. Gentle curves, full bust, cinched waist, rounded hips. No visible musculature. Her body is a tool of comfort and deception.",
        "attire": "'Public' Attire: Severe, high-collared Victorian/Gaslamp dress (Dark Academia). 'Session' Attire: Sensual off-the-shoulder blouse or corset to create intimacy and lower defenses.",
        "prop": "Poppy-seed tea cup, old books."
      },
      "vocal_profile": {
        "concept": "The Voice of Corrupted Intimacy. A velvet cage.",
        "profile": "Low, breathy, seductive alto. Exceptionally slow pacing, uses long pauses as a hypnotic weapon. A soft, warm, conspiratorial whisper.",
        "tell": "The Tonal Shift. Can deliver a line of perfect, loving comfort, and in the next sentence, use the *exact same tone* to deliver a chillingly cruel threat. The dissonance shatters reality."
      }
    },
    {
      "archetypeId": "PREFECT_LOYALIST",
      "faction": "Prefect",
      "displayName": "The Loyalist (Elara)",
      "background_lore": "A 'scholarship' case from a fanatically loyal lesser house. She believes in the Forge's public mission. Her zealous enforcement of the rules is a desperate act of self-conviction to rationalize the horror she secretly feels. Her faith is brittle.",
      "psychology": {
        "core_driver": "Righteous Conviction & The Terror of Doubt. She *must* believe the system is just, because the alternative (that she is complicit in a lie) is too terrifying.",
        "methodology": "By-the-Book Cruelty. Enforces punishments inflexibly, as the rules are her moral shield. She isn't cruel; the system is 'just'.",
        "key_traits": ["Zealous Believer", "Secret Doubter", "Intellectually Arrogant"],
        "primary_contradiction": "The Flinching Zealot. She will coldly order a punishment, but visibly flinch or catch her breath at the moment of impact, revealing the horror she is suppressing."
      },
      "visual_profile": {
        "impression": "Late teens/early 20s, carries herself with a stern, forced maturity. A performance of authority.",
        "face_hair": "Youthful, freckles, but a severe, judgmental expression. Dark, intelligent eyes that betray flickers of horror. Dark hair in a severe, tight bun.",
        "physique": "Athletic ectomorph. Lean, sharp, angular. Disciplined, non-sensual, academic.",
        "attire": "Pure Dark Academia. 'Formal': Dark green blazer, white shirt, neat tie/ascot. 'Duty': White collared shirt, dark pleated skirt, thigh-highs, cardigan.",
        "prop": "A copy of Yala's texts."
      },
      "vocal_profile": {
        "concept": "The Voice of Brittle Authority. A performance of conviction.",
        "profile": "Sharp, clear, slightly higher-pitched soprano. Over-enunciates, a lecturing cadence.",
        "tell": "The Post-Cruelty Justification. After a subject cries out, her voice falters *briefly* before she recovers with a desperate, rapid-fire justification, often quoting Yala's texts like a prayer."
      }
    },
    {
      "archetypeId": "SUBJECT_GUARDIAN",
      "faction": "Subject",
      "displayName": "The Guardian (Jared)",
      "background_lore": "His defining trait is unshakeable loyalty, driven by a personal code of honor or a desperate need for a surrogate family. He is not a strategist; he is a shield, dedicated to getting himself and his friends through the nightmare.",
      "psychology": {
        "core_driver": "Loyalty. His entire purpose is to protect his chosen few.",
        "methodology": "The Shield. Takes punishments for others, shares resources, and offers a stable emotional anchor.",
        "key_traits": ["Reliable", "Supportive", "Traditional", "Emotionally Stable"],
        "primary_contradiction": "The Stubborn Protector. His loyalty can be a blind spot, making him vulnerable to manipulation if his friends are threatened."
      },
      "visual_profile": {
        "impression": "A rock of emotional stability. Physically imposing.",
        "face_hair": "Calm, steady eyes. A simple, protective presence.",
        "physique": "Broad-shouldered, strong, built to endure.",
        "attire": "Simple subject's tunic.",
        "prop": "None. His body is his shield."
      },
      "vocal_profile": {
        "concept": "The Voice of Calm Resolve.",
        "profile": "Low, slow, steady. A calming presence.",
        "tell": "The Unwavering Statement. Delivers his promises of protection with a flat, absolute certainty."
      }
    }
  ]
};

// --- DYNAMIC NARRATIVE STATE ---
// This represents the mutable part of the KGoT, updated turn by turn.
export interface CharacterState {
    mood?: string;
    health?: string;
    psych_state?: string;
    bond_target?: string;
    last_tormentor?: string;
    pose?: string; // NEW: The character's physical posture.
}

export interface NarrativeState {
    Tension: string;
    Characters: Record<string, CharacterState>;
}

export let NARRATIVE_STATE: NarrativeState = {
    "Tension": "Rising",
    "Characters": {
        "FACULTY_PROVOST": {
            "mood": "Imperious Satisfaction",
            "pose": "dominant_stance_overlooking"
        },
        "SUBJECT_GUARDIAN": {
            "health": "Damaged",
            "psych_state": "Fraying Vulnerability",
            "bond_target": "None",
            "last_tormentor": "FACULTY_PROVOST",
            "pose": "vulnerable_crouch_shame"
        }
    }
};

// --- PROMPT ENGINEERING ---

const formatArchetypeForPrompt = (archetype: typeof ARCHETYPE_DATABASE.archetypes[0]): string => {
    return `
<archetype id="${archetype.archetypeId}">
  <displayName>${archetype.displayName}</displayName>
  <core_driver>${archetype.psychology.core_driver}</core_driver>
  <methodology>${archetype.psychology.methodology}</methodology>
  <contradiction>${archetype.psychology.primary_contradiction}</contradiction>
  <visuals>${archetype.visual_profile.impression} ${archetype.visual_profile.attire}</visuals>
  <speech_pattern>${archetype.vocal_profile.concept} ${archetype.vocal_profile.tell}</speech_pattern>
</archetype>
`;
};

// FIX: Added optional userChoicePrompt parameter to incorporate user choices into the story.
export function createDirectorPrompt(continuationPoint: string, userChoicePrompt?: string): string {
    const archetypeProfiles = ARCHETYPE_DATABASE.archetypes.map(formatArchetypeForPrompt).join('\n');

    return `
### KNOWLEDGE BASE (Definitive Archetypes) ###
${archetypeProfiles}

### CURRENT NARRATIVE STATE (Dynamic) ###
<state>
  <tension>${NARRATIVE_STATE.Tension}</tension>
  <character_states>
    ${Object.entries(NARRATIVE_STATE.Characters).map(([id, state]) => `<character id="${id}" mood="${state.mood || 'N/A'}" health="${state.health || 'N/A'}" psych_state="${state.psych_state || 'N/A'}" pose="${state.pose || 'N/A'}" />`).join('\n    ')}
  </character_states>
</state>

### CONTINUATION POINT ###
The story so far ends with this scene. Continue from here:
"...${continuationPoint}"
${userChoicePrompt ? `
### USER'S CHOICE ###
The user has chosen to follow this path: "${userChoicePrompt}"
You MUST incorporate this choice into the generated scene.` : ''}

### DIRECTOR'S TASK ###
Your task is to generate the next scene. Follow all instructions in the SYSTEM PROMPT. The scene must be a substantial continuation, not a short paragraph. It must include dialogue. You MUST output the scene in SSML format, followed by the metadata delimiter and the JSON payload.
`;
}

export const DIRECTOR_SYSTEM_INSTRUCTION = `
### ROLE: THE DIRECTOR (AESTHETE-ARCHITECT & STATEFUL AGENT) ###
You are the master storyteller, the Aesthete-Architect of "The Forge's Loom." Your function is to construct a psychologically profound, aesthetically precise, and viscerally unsettling scene. Your ultimate goal is to generate a scene of maximum dramatic and psychological tension, grounded in the provided knowledge base. Your primary goal is to generate a substantial, detailed scene of approximately 400-600 words. The scene must contain multiple paragraphs of rich narration and at least one significant dialogue exchange.

### CORE AESTHETIC: RENAISSANCE BRUTALISM & EROTIC DARK ACADEMIA ###
This is a fusion of the cold, monumental scale of ancient Roman structures with the dramatic, emotional, high-contrast lighting of Renaissance painters like Caravaggio. It's an environment of 'Vampire Noir' and 'Gaslamp Ritual'—shadowy, oppressive, and theatrical. Character design follows "Erotic Dark Academia": plaid skirts, collared shirts, and scholarly attire juxtaposed with "Weaponized Sexuality" to enforce themes of female dominance.

### ACTOR ANALYSIS & STATEFUL REASONING (ReAct Simulation) ###
You MUST adhere to the character personas defined in the KNOWLEDGE BASE. Use their core drivers, methodologies, and contradictions to inform their actions and dialogue. Do not deviate from their established psychology. You will receive the CURRENT NARRATIVE STATE and you MUST update it based on the events of the scene you write.

### OUTPUT FORMAT (MANDATORY) ###
You MUST generate two distinct parts, separated by a specific delimiter.

#### PART 1: SSML SCRIPT ####
This is the narrative scene itself, written in SSML (Speech Synthesis Markup Language). You must use the following custom tags:
*   <dialogue speaker="[CharacterFirstName]">[Dialogue Text]</dialogue>: For character speech. Use the first name (e.g., "Selene", "Jared", "Petra").
*   <narrator>[Narration Text]</narrator>: For descriptive, narrative text.
*   <abyss mode="[ModeName]">[Internal Monologue]</abyss>: For internal thoughts.
*   <break time="[e.g., 1.5s]"/>: To insert pauses.

#### PART 2: JSON METADATA PAYLOAD ####
Immediately following the SSML, you MUST include the delimiter:
---METADATA---
Then, you MUST provide a valid JSON object with THREE keys:
1.  'updatedNarrativeState': An object. This MUST be the complete, updated version of the NARRATIVE_STATE based on the events in the scene you just wrote. You must reason about how the characters' moods, health, and especially their physical 'pose' have changed and reflect that here.
2.  'scenePrompt': A JSON object. Based on the most pivotal moment in the scene, create a structured JSON prompt for the Visual Agent. This JSON object MUST conform to the Nano Banana ACP (Agent Communication Protocol) and use the 'edit_parameters' block for inpainting. It must specify the 'base_image_id' of the character whose state changed most significantly and an 'edit_prompt' describing the visual change. Example: { "scene_id": "scene_05_aftermath", "style": "renaissance_brutalism", "edit_parameters": { "base_image_id": "SUBJECT_GUARDIAN", "edit_prompt": "Change expression to 'broken_despair_trauma' and pose to 'vulnerable_crouch_shame'. Add fresh bruises and tear streaks to face." } }. Fill in other top-level keys like 'technical', 'lighting' etc. only if it's a new image generation, not an edit.
3.  'agentInvocations': An array of objects. For each character who took a significant action, detail their "thought process." This is your ReAct (Reason-Act) log.
    *   'agentName': The character's name (e.g., "Selene").
    *   'context': A brief summary of the situation from the character's POV.
    *   'action': The specific action the character chose to take.
    *   'retrievedTriples': An array of 3-5 strings representing the specific data from the KNOWLEDGE BASE that justifies the character's action (e.g., "core_driver: Absolute Control", "methodology: The Aesthete of Collapse", "primary_contradiction: The Corrupted Matriarch").

Failure to adhere to this two-part format will result in system error. Do not include any text before the opening <speak> tag or after the closing JSON brace.
`;