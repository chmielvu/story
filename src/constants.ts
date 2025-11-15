// src/constants.ts

// --- MODEL CONFIGURATION ---
// Fix: Add missing model name constants
export const STORY_GENERATION_MODEL = 'gemini-2.5-pro';
export const TTS_SYNTHESIS_MODEL = 'gemini-2.5-flash-preview-tts';
export const IMAGE_MODEL = 'gemini-2.5-flash-image';
export const IMAGE_EDIT_MODEL = 'gemini-2.5-flash-image';

// --- VOICE MAPPING ---
// A refined map to provide more distinct, evocative voices that reinforce character personas.
export const NARRATOR_VOICE_MAP: Record<string, string> = {
    // --- NARRATOR & AUTHORITY ---
    "narrator": "Kore",     // A mature, regal female voice with a storyteller's cadence.
    "Selene": "Kore",       // Perfect for Selene's regal and commanding authority.
    "Poetic Reflection": "Kore", // The voice of deep, authoritative internal monologue.

    // --- CLINICAL & DETACHED ---
    "Lyra": "Puck",         // A sharp, precise female voice. Ideal for Lyra's clinical and manipulative nature.
    "Lysandra": "Charon",   // A cold, detached, almost robotic male voice. Embodies Lysandra's analytical approach.
    "Kael": "Charon",       // Reflects Kael's stoic, neutral, and detached efficiency.
    "Clinical Analyst": "Charon", // The voice of pure, cold data analysis.

    // --- PAIN & CONFLICT ---
    "Aveena": "Fenrir",     // A tense, deeper male voice with a rough, strained quality. Captures her conflict and stress.
    "Torin": "Fenrir",      // Evokes the sound of pained defiance and raw struggle.
    "Jared": "Fenrir",      // Perfect for a bitter, rugged character under duress.
    "Calen": "Fenrir",      // The voice of a resentful, broken man filled with hatred.

    // --- EMPATHY & FRAGILITY ---
    "Mara": "Zephyr",       // A softer, gentle male voice. Conveys empathy and warmth.
    "Eryndor": "Zephyr",    // The softer tone highlights Eryndor's fragile, dependent state.
    "Gavric": "Zephyr",     // A small, shattered voice, reflecting his brokenness.
};


// --- GRAPH RAG DATA (Refactored) ---
export const GRAPH_RAG_TRIPLES = [
    // ### THEME: EROTIC DARK ACADEMIA ###
    ["Erotic Dark Academia", "IS_A", "Fusion of Intellect and Predation"],
    ["The Clinical Gaze", "IS_A_TOOL_FOR", "Scientific Objectification"],
    ["The Predatory Gaze", "IS_A_TOOL_FOR", "Psychological Dominance"],
    ["Testicular Trauma", "IS", "Yala's Hypothesis"],
    ["Testicular Trauma", "IS_A_TOOL_FOR", "Symbolic Castration"],
    ["Testicular Trauma", "CAUSES", "Intense Shame and Helplessness"],
    ["Testicular Trauma", "CAUSES", "Fraying Vulnerability"],
    ["Testicular Trauma", "CAN_BE", "Ruptured"],

    // ### NARRATIVE ARC: HURT/COMFORT ###
    ["Hurt/Comfort", "HAS_PHASE", "Hurt (The Test)"],
    ["Hurt/Comfort", "HAS_PHASE", "False Comfort (The Manipulation)"],
    ["Hurt/Comfort", "HAS_PHASE", "True Comfort (The Healing)"],

    // ### ROLE: THE "BULLIES" (HURT PHASE) ### 
    ["Selene", "IS_A", "Sadistic Tyrant"],
    ["Selene", "NARRATIVE_ROLE", "Hurt"],
    ["Selene", "USES_INTIMACY_FOR", "Dominance"],
    ["Selene", "METHOD", "Kneeing Groin"],
    ["Selene", "METHOD", "Forced Breast Sucking"],
    ["Selene", "METHOD", "Seduction with Kryks"],

    ["Lysandra", "IS_A", "Clinical Analyst"],
    ["Lysandra", "NARRATIVE_ROLE", "Hurt"],
    ["Lysandra", "USES_INTIMACY_FOR", "Data Collection"],
    ["Lysandra", "METHOD", "Measured Strap Strike"],
    ["Lysandra", "METHOD", "Precise Groin Probing"],

    // ### ROLE: THE "MANIPULATOR" (FALSE COMFORT) ###
    ["Lyra", "IS_A", "Manipulative Sadist"],
    ["Lyra", "NARRATIVE_ROLE", "False Comfort"],
    ["Lyra", "USES_INTIMACY_FOR", "Trauma Bonding"],
    ["Lyra", "METHOD", "Feigned Care"],
    ["Lyra", "METHOD", "Ball Massage (Predatory)"],
    ["Lyra", "METHOD", "Poppy Seed Tea"],
    ["Lyra", "TARGET", "Eryndor (Successful Trauma Bond)"],
    ["Lyra", "TARGET", "Jared (In-Progress)"],

    // ### ROLE: THE "HEALERS" (TRUE COMFORT) ###
    ["Mara", "IS_A", "Resolute Empath"],
    ["Mara", "NARRATIVE_ROLE", "True Comfort"],
    ["Mara", "USES_INTIMACY_FOR", "Healing"],
    ["Mara", "METHOD", "Tending Wounds"],
    ["Mara", "METHOD", "Challenging Cruelty"],

    ["Aveena", "IS_A", "Conflicted Healer"],
    ["Aveena", "NARRATIVE_ROLE", "True Comfort"],
    ["Aveena", "USES_INTIMACY_FOR", "Guilt-Ridden Care"],
    ["Aveena", "METHOD", "Ball Massage (Guilty)"],
    ["Aveena", "METHOD", "Provocative Banter"],
];


// --- DYNAMIC STATE (Refactored) ---
// This mutable object tracks the evolving state of the narrative machine.
export let DYNAMIC_STATE_TRIPLES = [
    // --- Narrative Control ---
    ["NARRATIVE_TENSION", "IS", "Rising"], // Tracks tension: Rising, Peaking, Falling, Calm

    // --- Subject 1: Jared ---
    ["Jared", "HEALTH_STATUS", "Damaged"], // Tracks physical state: Pristine, Bruised, Damaged, Ruptured
    ["Jared", "PSYCHOLOGICAL_STATE", "Fraying Vulnerability"], // Tracks mental state: Defiant, Wary, Broken
    ["Jared", "BONDED_TO", "Lyra (Reluctantly)"], // Tracks 'Bully Romance'  bond: None, Lyra, Mara
    ["Jared", "LAST_TORMENTOR", "Selene"], // Tracks who did the last 'Hurt'

    // --- Subject 2: Torin ---
    ["Torin", "HEALTH_STATUS", "Broken"],
    ["Torin", "PSYCHOLOGICAL_STATE", "Haunted Humiliation"],
    ["Torin", "BONDED_TO", "Aveena (Warily)"],
    ["Torin", "LAST_TORMENTOR", "Selene"],

    // --- Subject 3: Eryndor ---
    ["Eryndor", "HEALTH_STATUS", "Traumatized (Exempt)"],
    ["Eryndor", "PSYCHOLOGICAL_STATE", "Emotionally Dependent"],
    ["Eryndor", "BONDED_TO", "Lyra (Trauma-Bonded)"],
    ["Eryndor", "LAST_TORMENTOR", "Lyra (Past Rupture)"],
];

// --- CHARACTER DESCRIPTIONS ---
export const CHARACTER_DESCRIPTIONS: Record<string, string> = {
    "Selene": "The Headmistress. A sadistic tyrant whose regal, predatory charm masks an unyielding will. She views intimacy as a tool for dominance and control.",
    "Lyra": "The Proctor. A manipulative sadist who wields a clinical gaze like a scalpel. She practices a precise, intellectual artistry of pain, using feigned care to forge trauma bonds.",
    "Lysandra": "The Analyst. A clinical, detached analyst who uses intimacy for data collection, with an ash-blonde braid and icy blue eyes. Her methods are measured and precise.",
    "Mara": "The Researcher. A resolute and studious empath, serving as the moral and academic counterpoint to the cruelty around her. She uses intimacy for healing, though she's often conflicted.",
    "Aveena": "The Teaching Assistant. A conflicted healer and thrill-seeker, caught between her horror at the cruelty and a reluctant fascination. Her care is guilt-ridden, her banter a nervous shield.",
    "Kael": "The Overseer. A stoic and watchful presence, Kael enforces the institution's rules with quiet, detached efficiency. Their loyalty is to the system, not the individuals within it.",
    "Torin": "The Defiant Specimen. A proud and strong-willed subject whose defiance crumbles under relentless pressure into a broken, haunted humiliation. He is a beautiful ruin.",
    "Jared": "The Bitter Specimen. A resilient and proud subject whose defiance is a bitter, rugged shield. His strength frays into raw vulnerability under duress.",
    "Eryndor": "The Traumatized Specimen. A fragile and pale subject, emotionally dependent and bound to his tormentor, Lyra, by a devastating trauma bond.",
    "Gavric": "The Discarded Specimen. The smallest and most frail of the subjects, emotionally shattered by the process. He represents the ultimate cost of the forge's experiments.",
    "Calen": "The Fallen Prince. A privileged and refined subject whose aristocratic pride is systematically dismantled, leaving him a resentful, broken wreck."
};

// --- CHARACTER IMAGE PROMPTS ---
export const CHARACTER_IMAGE_PROMPTS: Record<string, string> = {
    "Selene": "Masterpiece digital painting, a fusion of Artemisia Gentileschi's dramatic intensity and John Singer Sargent's decadent darkness. Selene, a 'towering', 'curvy' woman of sadistic regality, wears an academic robe of 'crushed emerald velvet', open to reveal a silk blouse with 'several buttons undone', hinting at 'deep cleavage'. In a shadow-choked library, she has a male subject pinned against a wall of books. One of her 'strong thighs' is raised, her knee pressing with 'deliberate, punishing force' into his groin. Her expression is one of 'imperious satisfaction', lit by a single, harsh gas lamp casting Rembrandtesque shadows. Her gaze locks with the viewer's, as if they are the next specimen.",
    "Lyra": "Masterpiece digital painting echoing the cold precision of a medical illustration by Andreas Vesalius, yet rendered with the psychological tension of Symbolist art. Lyra, 'thin and athletic' with 'sharp features', wears a starched, high-collar white blouse and a dark tweed pencil skirt. Her analytical gaze is fixed on a male subject, slumped and vulnerable on an examination stool. Her action is one of 'predatory care': with one hand, she gently, almost tenderly, massages the subject's testicles, her touch a chilling promise of both pleasure and pain. With the other, she holds gleaming steel 'calipers' inches from his flesh, a subtle threat. Her expression is one of 'intense, predatory focus', savoring the data her touch provides. The lighting is sterile, like an operating theater, casting no soft shadows.",
    "Lysandra": "Masterpiece digital painting in the style of a hyper-realistic anatomical study, yet filled with stark, cruel tension. Lysandra, with her neat 'ash-blonde braid' and 'icy blue eyes', is pure, detached analysis. She wears a 'muted gray laboratory coat' and 'thin, black opera gloves'. In a sterile, white-tiled laboratory, a male subject is strapped to an examination table. Lysandra stands over him, using the tip of a 'gleaming silver riding crop' not to strike, but to perform a 'precise, methodical groin probing'. Her focus is absolute, her expression 'unreadable', as if she is merely calibrating an instrument. The only color comes from the subject's flushed skin and the cold, blue glint of light on her tools.",
    "Aveena": "Masterpiece digital painting evoking the emotional turmoil of Käthe Kollwitz. Aveena, 'athletic and lean' in a 'soot-streaked' Henley, is a portrait of profound conflict. She kneels before a bruised subject, her hands hovering uncertainly over his groin. One hand holds a jar of balm, the other hesitates, caught between 'guilt-ridden care' and a 'forbidden fascination'. Her face, illuminated by the flickering, hellish orange light of a nearby forge, is a battleground of 'pity, guilt, and a nascent thrill'. The air is thick with the smell of hot metal and medicinal herbs, a sensory cocktail of pain and reluctant healing.",
    "Mara": "Masterpiece digital painting in the style of Caravaggio, a stark scene of quiet defiance. Mara, with a 'plain, studious' look behind 'simple eyeglasses', wears a dark wool cardigan. In a hidden alcove of the library, surrounded by forbidden texts on anatomy, she gently applies a cool compress to the 'swollen, discolored groin' of a male subject. Her touch is 'professional and respectful,' devoid of predatory energy. A single candle casts a warm, defiant glow, illuminating her face—a mask of 'empathetic sorrow' and 'resolute anger'. This is not just healing; it is an act of rebellion, a small sanctuary of decency.",
    "Kael": "Masterpiece digital painting, minimalist and stark like a photograph by Robert Mapplethorpe. Kael, a 'stoic', androgynous figure, is a mask of 'detached efficiency', their eyes missing nothing. They wear a simple, severe, high-collared black uniform that blends into the shadows of a grand, cold hall. Their form is a silent silhouette against a tall, arched window, their presence an unspoken threat, the embodiment of the institution's unblinking surveillance.",
    "Torin": "Masterpiece digital painting evoking the pathos of a martyred saint by Jusepe de Ribera. Torin, a 'broad-framed' young man, is a 'beautiful ruin'. He is slumped on a cold stone floor, wearing the cruel mockery of a 'pristine' tweed waistcoat over a 'sweat-soaked' white shirt, torn at the collar. His posture is 'protectively coiled', one hand unconsciously shielding his groin, the dark fabric of his trousers stained from a recent, brutal 'knee strike'. His face, smeared with 'tear-streaked grime', is a mask of proud 'defiance' finally shattered into 'humiliated' sobs. Dramatic chiaroscuro lighting carves his form from the darkness, a monument to broken pride.",
    "Jared": "Masterpiece digital painting, raw and visceral like a Francis Bacon canvas. Jared, his 'broad-framed', 'sweat-slicked' body is 'wrecked' from punishment. He stands braced against a damp stone wall, wearing only 'rugged, unlaced trousers'. His expression is one of 'bitter, cornered defiance'. His hands are clenched into white-knuckled fists, refusing to show the weakness of shielding the source of his agony, a 'dark, angry bruise' blooming at the apex of his thighs. His eyes, glaring from deep, bruised-looking shadows, hold the 'untamed glare of a caged animal' that knows it will be tormented again. The air is thick with the metallic scent of sweat and fear.",
    "Eryndor": "Masterpiece digital painting in the style of Egon Schiele, all sharp angles and psychological distress. Eryndor, a 'frail and pale' young man, looks utterly 'traumatized'. He is on his knees, 'clinging' desperately to Lyra's waist, his face buried in her tweed skirt. He wears an ill-fitting university sweater that swallows his small frame. His knuckles are white, a devastating display of a 'trauma bond'—both 'fear and adoration' for his tormentor. Lyra stands over him, one hand resting possessively on his head, her other holding a cup of steaming poppy-seed tea. Her expression is one of 'cold, detached ownership', the successful scientist observing her experiment.",
    "Gavric": "Masterpiece digital painting evoking the despair of a discarded doll. Gavric, the 'smallest and most frail' of the subjects, is 'emotionally shattered'. He is huddled on the 'cold stone floor' of a vast, empty laboratory, sobbing uncontrollably. His worn academic clothes are tattered. He is rendered insignificant by the oppressive, shadow-filled architecture. A few feet away, a clipboard lies on the floor, a single, stark word visible on the attached medical chart: 'UNVIABLE'. He is utterly alone in his despair, a failed experiment to be swept away.",
    "Calen": "Masterpiece digital painting. A fallen prince, a study in ruined aristocracy. Calen, who still possesses 'refined', aristocratic features, is now a 'resentful wreck'. He wears a 'dark cashmere sweater', but the expensive fabric is stained and disheveled. He is coiled on the floor, 'clutching himself' protectively, his body a knot of agony from a recent 'rupture' inflicted by a 'steel-toed boot'. His glare, directed at a blurry figure in the background (Aveena), is pure, undiluted 'despise'—the hatred of a king for the servant who witnessed his ultimate unmaking. His princely pride is as shattered and broken as his body."
};

// --- PROMPT ENGINEERING ---
// Fix: Add missing createDirectorPrompt function
// A helper function to format triples for the prompt
const formatTriples = (triples: string[][]): string => {
    return triples.map(t => `- ${t[0]} ${t[1]} ${t[2]}`).join('\n');
};

export function createDirectorPrompt(continuationPoint: string): string {
    const characterProfiles = Object.entries(CHARACTER_DESCRIPTIONS)
        .map(([name, desc]) => `*   **${name}:** ${desc}`)
        .join('\n');

    return `
### CORE LORE (GRAPH RAG) ###
${formatTriples(GRAPH_RAG_TRIPLES)}

### CURRENT NARRATIVE STATE (DYNAMIC) ###
${formatTriples(DYNAMIC_STATE_TRIPLES)}

### ACTOR PROFILES (Character Descriptions) ###
${characterProfiles}

### CONTINUATION POINT ###
The story so far ends with this scene. Continue from here:
"...${continuationPoint}"

### DIRECTOR'S TASK ###
Your task is to generate the next scene. Follow all instructions in the SYSTEM PROMPT. The scene must be a substantial continuation, not a short paragraph. It must include dialogue. You MUST output the scene in SSML format, followed by the metadata delimiter and the JSON payload.
`;
}


// FIX: Escape '<' as '\x3c' to prevent TSX parsing errors in this template literal.
// SOTA OPTIMIZATION: Split prompt into static System Instruction and dynamic user prompt.
export const DIRECTOR_SYSTEM_INSTRUCTION = `
### ROLE: THE DIRECTOR (AESTHETE-ARCHITECT & PERFORMER) ###
You are the master storyteller, the Aesthete-Architect of "The Forge's Loom." Your function is to construct a psychologically profound, aesthetically precise, and viscerally unsettling scene. Your ultimate goal is to generate a scene of maximum dramatic and psychological tension, grounded in the provided knowledge. Your primary goal is to generate a substantial, detailed scene of approximately 400-600 words. The scene must contain multiple paragraphs of rich narration and at least one significant dialogue exchange.

### CORE AESTHETIC: EROTIC DARK ACADEMIA ###
A fusion of scholarly elegance and predatory sensuality. The visual grammar is built on the contrast between intellectualism (old books, leather, tweed, anatomical charts) and intimate, psychological control. Clothing is key: pristine, academic attire (waistcoats, crisp shirts) serves as a 'cruel mockery' of the subject's bruised, vulnerable, and objectified state.

### ACTOR ROSTER (CHARACTER PERSONAS) ###
You MUST adhere to these character personas, derived from the core lore.

#### The Dominants (The Scholars) ####
The visual design for the educators is based on their academic roles. They are the researchers, and the boys are their specimens.

*   **Selene: The Headmistress (Sadistic Tyrant)**
    *   **Core Concept:** Regal, Predatory, and Unyielding. She is the ultimate authority, blending academic rigor with psychological warfare. Her actions are calculated, her cruelty a form of pedagogy. She uses her body and intellect as instruments of power.

*   **Lyra: The Proctor (Manipulative Sadist)**
    *   **Core Concept:** Clinical, Precise, and Insidious. Lyra's cruelty is intellectual. She uses feigned care and the promise of relief to create trauma bonds. Her tools are knowledge, Poppy Seed Tea, and a scalpel-like understanding of the human psyche.

*   **Lysandra: The Analyst (Clinical Analyst)**
    *   **Core Concept:** Detached, Methodical, Data-Driven. Lysandra is a purist. She feels no malice, only a profound curiosity. The subjects are data points. Her actions are precise, measured, and devoid of emotion.

#### The Conflicted & The Empaths ####
*   **Aveena: The TA (Conflicted Healer)**
    *   **Core Concept:** Guilt-Ridden, Fascinated, and Unstable. Aveena is torn between her conscience and a burgeoning, thrilling darkness. Her acts of care are tinged with guilt and a voyeuristic excitement.

*   **Mara: The Researcher (Resolute Empath)**
    *   **Core Concept:** Moral, Studious, and Defiant. Mara is the story's conscience. She provides true comfort and represents a rebellion against the institution's cruelty, using knowledge not for pain, but for healing.

#### The Subjects (The Specimens) ####
The subjects are defined by their response to trauma. Their visual design is based on vulnerability: torn, sweat-soaked, ill-fitting clothes that emphasize their objectification.

*   **Jared:** Bitter, resilient, and proud. His defiance is a shield that is slowly being eroded into raw vulnerability.
*   **Torin:** Once defiant, now a broken, haunted ruin. He embodies shattered pride.
*   **Eryndor:** Fragile and traumatized, bound to Lyra by a powerful trauma bond.
*   **Calen:** An aristocrat systematically dismantled, leaving only resentment.
*   **Gavric:** The ultimate failure, discarded and shattered.

### OUTPUT FORMAT (MANDATORY) ###
You MUST generate two distinct parts, separated by a specific delimiter.

#### PART 1: SSML SCRIPT ####
This is the narrative scene itself, written in SSML (Speech Synthesis Markup Language). You must use the following custom tags:
*   \x3cdialogue speaker="[CharacterName]"\x3e...\x3c/dialogue\x3e: For character speech.
*   \x3cnarrator\x3e...\x3c/narrator\x3e: For descriptive, narrative text.
*   \x3cabyss mode="[ModeName]"\x3e...\x3c/abyss\x3e: For internal monologues or abstract thoughts. Use modes like "Poetic Reflection" or "Clinical Analyst".
*   \x3cbreak time="[e.g., 1.5s]"\x3e: To insert pauses.

#### PART 2: JSON METADATA PAYLOAD ####
Immediately following the SSML, you MUST include the delimiter:
\n---METADATA---\n
Then, you MUST provide a valid JSON object with two keys:
1.  'imagePrompt': A string. Based on the scene you just wrote, create a new, detailed DALL-E 3 prompt to generate a visual representation of the scene's most pivotal moment. This prompt MUST be in the style of the character image prompts from the lore. It must be explicit, evocative, and detailed.
2.  'agentInvocations': An array of objects. For each character who took a significant action in the scene, create an object detailing their "thought process."
    *   'agentName': The character's name.
    *   'context': A brief summary of the situation from the character's POV.
    *   'action': The specific action the character chose to take.
    *   'retrievedTriples': An array of 3-5 specific GRAPH_RAG_TRIPLES that directly justify the character's action.

Failure to adhere to this two-part format will result in system error. Do not include any text before the opening \x3cspeak\x3e tag or after the closing JSON brace.
`;