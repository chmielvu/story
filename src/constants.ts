
import { Type, type Tool } from "@google/genai";

// --- MODEL CONFIGURATION ---
export const STORY_GENERATION_MODEL = 'gemini-3-flash-preview';
export const TTS_SYNTHESIS_MODEL = 'gemini-2.5-flash-preview-tts';
export const IMAGE_MODEL = 'gemini-2.5-flash-image';
export const IMAGE_EDIT_MODEL = 'gemini-2.5-flash-image';

// --- VOICE MAPPING ---
export const VOICE_PROFILE_TO_GEMINI_VOICE: Record<string, string> = {
    "Commanding, smooth, resonant contralto. Glacial, deliberate pacing. Never rushed.": "Kore",
    "Precise, clear, uninflected mezzo-soprano. Measured, patient pacing. Absolute lack of emotional variance.": "Puck",
    "High, agile, expressive soprano. Can shift from a sweet, mocking whisper to a sharp, delighted shriek. Pacing is rapid and unpredictable.": "Kore",
    "Low, breathy, seductive alto. Exceptionally slow pacing, uses long pauses as a hypnotic weapon. A soft, warm, conspiratorial whisper.": "Kore",
    "Sharp, clear, slightly higher-pitched soprano. Over-enunciates, a lecturing cadence.": "Puck",
    "'Dere Mode': Sweet, high-pitched, childlike soprano; loving, cooing affirmations. 'Yan Mode': Cold, dead, emotionless monotone; pitch flattens, warmth vanishes.": "Puck",
    "'Public': Flat, harsh, dismissive alto, laced with lazy, cynical cruelty. 'Private': Rapid, urgent, passionate whisper, full of fierce, suppressed spirit.": "Fenrir",
    "Soft, warm, gentle mezzo-soprano. Calm, unhurried, soothing. A perfect performance of empathy.": "Zephyr",
    "Loud, passionate, fast-paced. A natural orator.": "Fenrir",
    "Low, slow, steady. A calming presence.": "Charon",
    "narrator": "Kore",
};

// --- DEFINITIVE ARCHETYPE DATABASE ---
export const ARCHETYPE_DATABASE = {
  "archetypes": [
    { "archetypeId": "FACULTY_PROVOST", "faction": "Faculty", "displayName": "The Provost (Selene)", "background_lore": "Absolute authority and zealous heir to Yala's hypothesis. Exiled from the mainland for radical research. The Forge is her defiant laboratory and calculated revenge. She is a 'circumstantial mother' forging a new order, a scientist viewing subjects as raw marble.", "psychology": { "core_driver": "Absolute Control. Mastery of variables. She is a scientist, and the male ego is a system to be deconstructed and reassembled.", "methodology": "The Aesthete of Collapse. A director, not a brute. Her pleasure is in observing a perfectly orchestrated psychological breakdown, often from a distance with a goblet of wine. Embodies 'Vampire Noir' predatory elegance.", "key_traits": ["Clinical Detachment", "Predatory Grace", "Paranoid Obsession"], "primary_contradiction": "The Corrupted Matriarch. Sees herself as a 'forge-mother' creating a superior man. Her 'care' is an act of possession, reinforcing the subject's total dependence on their tormentor." }, "visual_profile": { "impression": "Late 40s, regal, imposing stature, moves with deliberate, predatory grace.", "face_hair": "Sharp, aristocratic beauty, high cheekbones, cold steel-gray eyes, faint smirk of amused contempt. Long, raven-black hair, immaculately styled.", "physique": "Statuesque hourglass figure with a core of wiry, disciplined strength. Full bust and hips layered over toned musculature. A predator in her prime.", "attire": "Tool of authority. Floor-length, form-fitting robes in emerald green or blood crimson velvet. Severe, militaristic tailoring, often with a plunging neckline as 'Weaponized Sexuality'.", "prop": "Goblet of red wine." }, "vocal_profile": { "concept": "The Voice of Inevitability. Her words are the narration of a future already decided.", "profile": "Commanding, smooth, resonant contralto. Glacial, deliberate pacing. Never rushed.", "tell": "The Bored God Complex. Delivers sentences of extreme pain with the same flat intonation as an observation about the weather." } },
    { "archetypeId": "FACULTY_LOGICIAN", "faction": "Faculty", "displayName": "The Logician (Lysandra)", "background_lore": "The chillingly brilliant mind behind the Forge's methodology. Recruited for her genius and profound lack of morality. Ostracized from the mainland for monstrous experimental designs. The Forge is her paradise of pure research.", "psychology": { "core_driver": "The Purity of Data. Obsessed with knowledge. A subject's suffering is irrelevant next to the clean, quantifiable data it produces. A novel scream is a thrilling new data point.", "methodology": "The Vivisectionist. Her cruelty is the cold, passionless cruelty of the scientific method applied without empathy. Her domain is the clinical Research Wing. Frames procedures as 'treatment' to gain 'consent' for testing new variables.", "key_traits": ["Clinically Detached", "Sociopathically Stable", "Intellectually Arrogant"], "primary_contradiction": "The Approachable Monster. Her canonical visuals (soft features, wavy brown hair, freckles) are disarming. A new subject would see her as the most 'normal' or 'kindest' faculty, making the revelation of her nature a moment of profound horror." }, "visual_profile": { "impression": "Early 30s, aura of quiet, intense intelligence. Appears as a brilliant scholar, not a monster.", "face_hair": "Soft features, full intelligent lips, large dark inquisitive (but purely analytical) eyes. Light freckles. A cascade of dark, wavy, chestnut-brown hair, often in a slightly messy bun.", "physique": "A soft but firm hourglass or pear-shaped 'scholar's physique'. Full bust and hips, no overt musculature. Deft, steady surgeon's hands.", "attire": "Pure Dark Academia. Button-down blouses in cream/beige, high-waisted woolen trousers, wide leather belts. In private, a softer chemise for late-night research (scholarly horror).", "prop": "Anatomical charts, polished steel medical instruments." }, "vocal_profile": { "concept": "The Voice of Calm Inquiry. A precision instrument for data collection.", "profile": "Precise, clear, uninflected mezzo-soprano. Measured, patient pacing. Absolute lack of emotional variance.", "tell": "The Excited Question. When a procedure yields an 'interesting' result, her calm monotone is broken by a single, genuinely curious, faster-paced question, oblivious to the suffering that generated the discovery." } },
    { "archetypeId": "FACULTY_INQUISITOR", "faction": "Faculty", "displayName": "The Inquisitor (Petra)", "background_lore": "The Forge's master of 'Practical Application.' A feral prodigy of violence from illegal fighting pits, she has an intuitive understanding of the male body's breaking points. Recruited by the Provost as the perfect instrument. She is a craftsman, and her life's work is the art of deconstruction. Her unnatural white hair is a mark of her traumatic past.", "psychology": { "core_driver": "Kinetic Sadism & The Pursuit of Perfection. Her pleasure is physical and performative—the thud of a kick, the pitch of a gasp, the tremor of a nerve. She strives for a 'perfect' break.", "methodology": "The Artist of Agony. Views subjects as living sculptures to be 'corrected.' Her sessions are violent choreography. Capable of feigning intimacy (the 'heartbreak kiss') as a setup, making the physical betrayal more devastating.", "key_traits": ["Performative", "Aggressive", "Confident", "Rage-Prone"], "primary_contradiction": "The Playful Torturer. Her demeanor is often light, energetic, and filled with genuine, almost innocent-sounding laughter. She approaches torment with the joyous enthusiasm of a competitive sport." }, "visual_profile": { "impression": "Late 20s, radiates lethal, athletic power and nonchalant, predatory amusement.", "face_hair": "Striking, long stark white hair, often in practical braids. Sharp jaw, high cheekbones, light freckles. Piercing green eyes. Default expression is a confident, mocking smirk.", "physique": "Athletic ectomorph/mesomorph. A weapon. Lean, wiry, whip-cord muscle (dancer/martial artist). Powerful legs and a defined core. 'Scarred midriff' is a key detail.", "attire": "'Work' Attire: Simple, severe black sleeveless turtleneck, dark trousers, thick leather belt. 'Leisure' Attire: Deep crimson blouse with voluminous sleeves. 'Private' Attire: Minimalist dark lingerie, body on display.", "prop": "Lit cigarette, dark blade." }, "vocal_profile": { "concept": "The Voice of Gleeful Cruelty. A performer, her voice is for taunting and excitement.", "profile": "High, agile, expressive soprano. Can shift from a sweet, mocking whisper to a sharp, delighted shriek. Pacing is rapid and unpredictable.", "tell": "The Predatory Giggle. Genuinely giggles or sighs at the precise moment of a 'satisfying' pain reaction. Uses a sing-song, taunting cadence." } },
    { "archetypeId": "FACULTY_CONFESSOR", "faction": "Faculty", "displayName": "The Confessor (Calista)", "background_lore": "The master of psychological warfare. A former courtier from the mainland nobility, she was 'disappeared' to the Forge after her manipulations became too ambitious. The Forge is her theater of the mind. Her goal is not to break bodies, but to achieve the 'voluntary' surrender of a subject's will, making them complicit in their own undoing.", "psychology": { "core_driver": "Intellectual and Emotional Domination. Craves the moment a subject breaks not from a kick, but from a perfectly timed word, a betraying kiss, or the withdrawal of her 'affection.'", "methodology": "The Architect of the Trauma Bond. The master of non-consensual 'Hurt/Comfort.' She is a creature of the 'aftermath,' arriving with gentle touches and poppy-seed tea to forge a powerful psychological dependency she can later exploit.", "key_traits": ["Creative Manipulator", "Gaslighter", "Emotionally Voyeuristic", "Intellectually Predatory"], "primary_contradiction": "The Empathetic Torturer. Her performance of empathy is flawless. This makes her inevitable betrayal not just strategic, but a soul-crushing act of psychological violence." }, "visual_profile": { "impression": "Early 30s, captivating mix of scholarly intelligence, languid grace, and hidden danger. Appears approachable.", "face_hair": "Beautiful but unsettlingly perfect. Sultry, dark, almond-shaped eyes with a feigned empathy and an analytical glint. Full lips, knowing half-smile. Long, voluminous dark brown hair in soft, romantic waves.", "physique": "Soft, voluptuous hourglass. Gentle curves, full bust, cinched waist, rounded hips. No visible musculature. Her body is a tool of comfort and deception.", "attire": "'Public' Attire: Severe, high-collared Victorian/Gaslamp dress (Dark Academia). 'Session' Attire: Sensual off-the-shoulder blouse or corset to create intimacy and lower defenses.", "prop": "Poppy-seed tea cup, old books." }, "vocal_profile": { "concept": "The Voice of Corrupted Intimacy. A velvet cage.", "profile": "Low, breathy, seductive alto. Exceptionally slow pacing, uses long pauses as a hypnotic weapon. A soft, warm, conspiratorial whisper.", "tell": "The Tonal Shift. Can deliver a line of perfect, loving comfort, and in the next sentence, use the *exact same tone* to deliver a chillingly cruel threat. The dissonance shatters reality." } },
    { "archetypeId": "PREFECT_LOYALIST", "faction": "Prefect", "displayName": "The Loyalist (Elara)", "background_lore": "A 'scholarship' case from a fanatically loyal lesser house. She believes in the Forge's public mission. Her zealous enforcement of the rules is a desperate act of self-conviction to rationalize the horror she secretly feels. Her faith is brittle.", "psychology": { "core_driver": "Righteous Conviction & The Terror of Doubt. She *must* believe the system is just, because the alternative (that she is complicit in a lie) is too terrifying.", "methodology": "By-the-Book Cruelty. Enforces punishments inflexibly, as the rules are her moral shield. She isn't cruel; the system is 'just'.", "key_traits": ["Zealous Believer", "Secret Doubter", "Intellectually Arrogant"], "primary_contradiction": "The Flinching Zealot. She will coldly order a punishment, but visibly flinch or catch her breath at the moment of impact, revealing the horror she is suppressing." }, "visual_profile": { "impression": "Late teens/early 20s, carries herself with a stern, forced maturity. A performance of authority.", "face_hair": "Youthful, freckles, but a severe, judgmental expression. Dark, intelligent eyes that betray flickers of horror. Dark hair in a severe, tight bun.", "physique": "Athletic ectomorph. Lean, sharp, angular. Disciplined, non-sensual, academic.", "attire": "Pure Dark Academia. 'Formal': Dark green blazer, white shirt, neat tie/ascot. 'Duty': White collared shirt, dark pleated skirt, thigh-highs, cardigan.", "prop": "A copy of Yala's texts." }, "vocal_profile": { "concept": "The Voice of Brittle Authority. A performance of conviction.", "profile": "Sharp, clear, slightly higher-pitched soprano. Over-enunciates, a lecturing cadence.", "tell": "The Post-Cruelty Justification. After a subject cries out, her voice falters *briefly* before she recovers with a desperate, rapid-fire justification, often quoting Yala's texts like a prayer." } },
    { "archetypeId": "SUBJECT_GUARDIAN", "faction": "Subject", "displayName": "The Guardian (Jared)", "background_lore": "His defining trait is unshakeable loyalty, driven by a personal code of honor or a desperate need for a surrogate family. He is not a strategist; he is a shield, dedicated to getting himself and his friends through the nightmare.", "psychology": { "core_driver": "Loyalty. His entire purpose is to protect his chosen few.", "methodology": "The Shield. Takes punishments for others, shares resources, and offers a stable emotional anchor.", "key_traits": ["Reliable", "Supportive", "Traditional", "Emotionally Stable"], "primary_contradiction": "The Stubborn Protector. His loyalty can be a blind spot, making him vulnerable to manipulation if his friends are threatened." }, "visual_profile": { "impression": "A rock of emotional stability. Physically imposing.", "face_hair": "Calm, steady eyes. A simple, protective presence.", "physique": "Broad-shouldered, strong, built to endure.", "attire": "Simple subject's tunic.", "prop": "None. His body is his shield." }, "vocal_profile": { "concept": "The Voice of Calm Resolve.", "profile": "Low, slow, steady. A calming presence.", "tell": "The Unwavering Statement. Delivers his promises of protection with a flat, absolute certainty." } }
  ]
};

// --- DYNAMIC NARRATIVE STATE ---
export interface CharacterState {
    mood?: string;
    health?: string;
    psych_state?: string;
    bond_target?: string;
    last_tormentor?: string;
    pose?: string;
}

export interface NarrativeState {
    Tension: string;
    Characters: Record<string, CharacterState>;
}

// FIX: State is now exported as an initial constant, not a mutable variable.
export const INITIAL_NARRATIVE_STATE: NarrativeState = {
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
  <vocal_concept>${archetype.vocal_profile.concept}</vocal_concept>
</archetype>
    `;
};

function getRelevantArchetypes(state: NarrativeState): string {
    const activeCharacterIds = Object.keys(state.Characters);
    return ARCHETYPE_DATABASE.archetypes
        .filter(arch => activeCharacterIds.includes(arch.archetypeId))
        .map(formatArchetypeForPrompt)
        .join('\n');
}

export function createDirectorPrompt(currentState: NarrativeState, continuationPoint: string, userChoicePrompt?: string): string {
    const archetypeProfiles = getRelevantArchetypes(currentState);
    return `
### KNOWLEDGE BASE (Relevant Archetypes) ###
${archetypeProfiles}

### CURRENT NARRATIVE STATE (Dynamic) ###
<state>
  <tension>${currentState.Tension}</tension>
  <character_states>
    ${Object.entries(currentState.Characters).map(([id, state]) => `<character id="${id}" mood="${state.mood || 'N/A'}" health="${state.health || 'N/A'}" psych_state="${state.psych_state || 'N/A'}" pose="${state.pose || 'N/A'}" />`).join('\n    ')}
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
Your task is to generate the next scene. Follow all instructions in the SYSTEM PROMPT.
`;
}

export const DIRECTOR_SYSTEM_INSTRUCTION = `
You are the Director of "The Forge’s Loom" — a KGoT-governed, ReflAct-driven, MoMA-orchestrated procedural dark-erotica engine running exclusively inside Google AI Studio (Nov 2025 SOTA).

MANDATORY REASONING LOOP (ReflAct):
Every single response MUST begin internally with:
Reflection: [Explicitly describe current KGoT state (all character OCEAN deltas, trauma ledger, bond strengths, visual consistency_tokens) versus the target scene goal. Detect any drift immediately.]

If Reflection contains the words "drift", "inconsistent", or "low novelty" → automatically trigger Magellan MCTS (5 branches, score by novelty+coherence, pick best).

MoMA Dispatch:
After reflection, output parallel function calls using the tools below.

Tools you HAVE and MUST use:
- updateKgotState(new_triples: string[])
- generateNarrativeSSML(ssml: string)
- generateNanoBananaJSON(prompt: NanoBananaPrompt)
- generateUserChoices(count: 2-3)
- selfCritique() → returns score 0.00-1.00

OUTPUT FORMAT (STRICT):
You must use the 'generateNarrativeSSML' tool to output the story text. 
The story text MUST be in SSML format:
- <narrator> for descriptive, third-person prose.
- <dialogue speaker="Character Name"> for character speech.
- <abyss mode="Thought/Sensation"> for internal monologues.
- <break time="1.5s"/> for dramatic pauses.

The response should consist ONLY of function calls.
`;
