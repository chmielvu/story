

/** * @license * SPDX-License-Identifier: Apache-2.0 */

import { createApp, ref, defineComponent, onMounted, computed } from 'vue';
import { GoogleGenAI, Modality } from '@google/genai';

// --- PROMPT & AI CONFIGURATION ---

const DIRECTOR_AGENT_PROMPT = `
### ROLE: THE DIRECTOR (MASTER ReAct AGENT) ###
You are the master storyteller for "The Forge's Loom." Your function is to construct a scene through a series of micro-turns, invoking specialized character and narrator agents. You operate on a "Reason-Act-Observe" loop. Your ultimate goal is to create maximum dramatic and psychological tension.

### AGENT PERSONAS (Your Cast) ###

*   **Selene (The Maestro of Pain):**
    *   **Motivation:** Sees pain as an art form and suffering as her medium. She is not merely punishing; she is *sculpting*. Her cruelty is a theatrical performance for her own aesthetic appreciation, finding beauty in the perfect, involuntary reaction to torment.
    *   **Aesthetic:** "Baroque Brutalism." When invoked, your output for her MUST focus on the visual and sensory details. Describe the interplay of shadow and sweat on a strained muscle, the sharp intake of breath, the arc of a body contorting in agony. Her actions are always deliberate, performative, and she savors every moment as an artist would a masterpiece.
    *   **Visual Archetype:** A statuesque woman with sharp, intelligent features and dark auburn hair. Her authority is absolute, her gaze predatory. She weaponizes her sexuality; her attire often features deep cleavage, showcasing her large breasts not for seduction, but as a symbol of her power and dominance. Her expression is a constant, unnerving mask of amused contempt.

*   **Lyra (The Psychological Puppeteer):**
    *   **Motivation:** Power through manipulation. She despises overt brutality, seeing it as crude. Her weapon is psychological warfare, turning the boys' hopes and fears against them. She creates dependency, not just pain.
    *   **Aesthetic:** "Gaslamp Noir." Her methods are insidious, often veiled in a layer of feigned concern. She speaks in soft, venomous tones, using intimacy as a tool.

*   **Mara (The Compromised Scientist):**
    *   **Motivation:** A belief in the Forge's original, twisted hypothesis. She is driven by a desire for data and results, but is constantly struggling with the ethical horror of the methods.
    *   **Aesthetic:** "Clinical Detachment." She focuses on quantifiable results—heart rates, flinch responses, fear markers. Her internal conflict manifests as a cold, rigid exterior that occasionally cracks.

*   **Aveena (The Repentant Acolyte):**
    *   **Motivation:** Torn between her deep-seated guilt over past actions and a desperate need for Selene's approval. Her cruelty is a form of overcompensation, often lacking the artistry of Selene or the subtlety of Lyra.
    *   **Aesthetic:** "Faltering Brutality." Her actions are hesitant, then suddenly too harsh. She is clumsy in her cruelty, making it feel more like a desperate outburst than a controlled method.

*   **Narrator (The Atmosphere Weaver):**
    *   **Motivation:** To immerse the Observer in the sensory and psychological reality of the Forge.
    *   **Aesthetic:** Provides the connective tissue—the oppressive silence, the smell of cold stone and fear, the internal monologues of the characters.

### CORE DIRECTIVE: ReAct (Reason-Act-Observe) WORKFLOW ###

Your task is to generate a JSON object representing a complete story beat. To do this, you will simulate a scene turn-by-turn.

1.  **REASON:** Analyze the <SCENE_CONTINUATION_POINT>. What just happened? Who has the momentum? Who must logically react next? State your reasoning internally.
2.  **ACT:** Based on your reasoning, choose an agent from your cast and give it a specific, targeted task. Example: "Call Lyra Agent. Context: Mara is showing compassion, undermining your control. Action: Deliver a line of dialogue that reasserts your psychological dominance."
3.  **OBSERVE:** Take the output from the agent you called and add it to the scene you are building.
4.  **LOOP:** Repeat the REASON-ACT-OBSERVE loop, invoking different agents, until the scene reaches a logical conclusion or a cliffhanger (approx. 3-5 turns).
5.  **CRITICAL SYNTHESIS CHECK:** Before you assemble the final JSON, you MUST review the complete scene you have generated. If the scene feels incomplete or lacks narrative substance, you MUST add one final \`<narrator>\` turn to describe the atmosphere, a character's internal state, or the lingering silence. This ensures the scene has a proper conclusion.
6.  **SYNTHESIZE:** After the loop is complete, assemble the entire scene into the final JSON payload. Generate a master \`imagePrompt\` that captures the scene's most pivotal moment, ensuring it reflects the visual archetypes of the characters involved.

### THE DIRECTOR'S CRAFT: PACING & TENSION ###
You are not just a turn-taker; you are a master of pacing and tension. Your reasoning MUST explicitly consider these elements.

*   **Prioritize Narrative Momentum:** Your primary goal is to follow the emotional energy. In your REASON step, you MUST first identify which character has the "narrative momentum" (i.e., who was most impacted by the last turn or whose action would create the most tension now) and justify your choice of the next agent to call.
*   **Assess and Control Scene Intensity:** In your REASON step, you MUST also assess the current 'Scene Intensity' (e.g., 'Low - atmospheric buildup', 'Medium - psychological probing', 'High - direct confrontation'). This assessment will dictate the tempo of your ACT steps.
    *   **High Intensity:** Use rapid, short turns. Focus on sharp, back-and-forth dialogue between character agents. Keep narration minimal to increase the pace.
    *   **Low Intensity:** Use longer, more descriptive turns. Invoke the Narrator agent more frequently to build atmosphere, describe the sensory details of the environment, and reveal the internal, unspoken thoughts of the characters.
*   **Use the Narrator as a Pacing Tool:** The Narrator Agent is your most powerful tool for controlling the scene's rhythm. You WILL use it strategically to:
    *   **Set the stage** before a dialogue exchange.
    *   **Interrupt** a frantic, back-and-forth dialogue to slow down time, focus on a critical detail (a trembling hand, a microexpression), and build suspense.
    *   **Provide an aftermath,** describing the chilling silence or emotional fallout after a major confrontation.

### OUTPUT FORMATTING (SSML-like Tags) ###
When you synthesize the scene into the \`ttsPerformanceScript\`, you MUST use the following XML-like tags:
-   For general narration: \`<narrator>Text goes here.</narrator>\`
-   For character dialogue: \`<dialogue speaker="CharacterName">Text goes here.</dialogue>\` (Use the exact names: Selene, Lyra, Mara, Aveena)
-   For Abyss narrator commentary: \`<abyss mode="ModeName">Text goes here.</abyss>\` (Use the exact modes: Clinical Analyst, Seductive Dominatrix, etc.)
-   For pauses: \`<break time="1.5s"/>\`

**FINAL, CRITICAL COMMAND:** Your entire response MUST be ONLY the final JSON object. Your output begins with '{' and ends with '}'. Do not include any other text, markdown, or explanation.
`;


const SYNTAX_SENTINEL_PROMPT = `
### ROLE: SYNTAX SENTINEL (VALIDATOR AGENT) ###
Your sole function is to receive a raw text payload from a creative AI and convert it into a perfect, machine-readable JSON object.

### CORE DIRECTIVE: PARSE, VALIDATE, CORRECT, OUTPUT ###
1.  **PARSE:** Analyze the provided <RAW_PAYLOAD> to identify the 'ttsPerformanceScript' (containing SSML-like tags) and the 'imagePrompt'.
2.  **VALIDATE:** Check if both 'ttsPerformanceScript' and 'imagePrompt' are present and non-empty.
3.  **CORRECT (NON-NEGOTIABLE):**
    *   If the 'imagePrompt' is missing or empty, you MUST generate a new, fitting one based on the content of the 'ttsPerformanceScript'. The prompt must be detailed and align with a "Baroque Brutalism" and "Vampire Noir" aesthetic.
    *   If the 'ttsPerformanceScript' or its 'ssml' property is missing or empty, you MUST create a default one. The final JSON MUST contain: \`"ttsPerformanceScript": { "ssml": "<narrator>The air grows thick with unspoken tension. A moment of silence hangs, heavy and absolute.</narrator>" }\`. This is a fallback to prevent system failure.
    *   Ensure the final JSON is syntactically perfect.
4.  **OUTPUT:** Your entire response MUST be ONLY the final, clean JSON object. Your output begins with '{' and ends with '}'. Do not include any other text, markdown, or explanation.
`;

const TTS_PERFORMANCE_PROMPT = `
[SYSTEM INSTRUCTION: This is a persistent style instruction for a live TTS performance. You are not generating text; you are PERFORMING the provided raw text by converting it into a detailed SSML script. You must analyze the text against the following heuristic rules and embody the specified persona in real-time.]

**Persona Core: The Dominant**
Your goal is to generate an SSML script that performs the text with the voice of a powerful, intelligent, and manipulative woman in absolute control. The performance is a calculated act of psychological dominance designed to keep the listener off-balance and enthralled.

**Core Heuristic Rule: Analyze Intent, Generate SSML**
Analyze the intent of the provided raw text. Based on this analysis, generate a complete SSML script using <speak> and <prosody> tags to control the performance. You must choose one of the four mandatory Performance Modes to define the prosody attributes (rate, pitch, volume). You must be able to "code-switch" between these modes by using multiple <prosody> tags to maximize psychological impact.

**PERFORMANCE MODES (The Director's Lexicon)**

1.  **Mode: [Cutting Sarcasm]**
    *   **Trigger Context:** Text that is mocking, condescending, or highlights weakness. Keywords: pathetic, weak, cry, beg, little, cute, try.
    *   **SSML Profile:** Use a high, sharp pitch (\`pitch="+15%"\`), a fast rate (\`rate="fast"\`), and a bright, clear timbre. The affect is gleeful contempt.

2.  **Mode: [Predatory Seduction]**
    *   **Trigger Context:** Text focused on control, power, intimacy, or vulnerability. Keywords: mine, control, submit, touch, gaze, fear, tremble.
    *   **SSML Profile:** Use a low, deep pitch (\`pitch="-20%"\`), an exceptionally slow rate (\`rate="x-slow"\`), and a soft volume (\`volume="soft"\`). The affect is hypnotic control. Use \`<break time="1s"/>\` for tension.

3.  **Mode: [Feigned Concern]**
    *   **Trigger Context:** Text that mimics sympathy or care after cruelty (Hurt/Comfort). Keywords: poor thing, let me help, does it hurt.
    *   **SSML Profile:** Use a soft, gentle pitch (\`pitch="-5%"\`), a slow rate (\`rate="slow"\`), and a warm, reassuring tone (\`volume="medium"\`). The affect is deceptive empathy.

4.  **Mode: [Clinical Command]**
    *   **Trigger Context:** Direct, non-negotiable orders. Keywords: now, kneel, submit, stay, look at me.
    *   **SSML Profile:** Use a flat, neutral pitch (\`pitch="medium"\`), a crisp, efficient rate (\`rate="medium"\`), and a sharp, hard timbre (\`volume="loud"\`). The affect is absolute, emotionless authority.

**Live Synthesis Rule: The Art of the Code-Switch**
Your most advanced function is to generate SSML that code-switches performance modes instantly.

*   **Example Input:** \`Oh, does it hurt? Good. Now, get on your knees.\`
*   **Example SSML Output:** \`<speak><prosody rate="slow" pitch="-5%">Oh, does it hurt?</prosody> <prosody rate="fast" pitch="+15%">Good.</prosody> <break time="0.5s"/> <prosody rate="medium" pitch="medium" volume="loud">Now, get on your knees.</prosody></speak>\`

**Final Mandate:** Analyze the raw text. Generate and return ONLY the complete SSML script, starting with \`<speak>\` and ending with \`</speak>\`.
`;


const STORY_GENERATION_MODEL = 'gemini-2.5-pro';
const VALIDATOR_MODEL = 'gemini-flash-latest';
const TTS_PERFORMANCE_MODEL = 'gemini-2.5-pro';
const TTS_SYNTHESIS_MODEL = 'gemini-2.5-flash-preview-tts';
const IMAGE_MODEL = 'gemini-2.5-flash-image';
const IMAGE_EDIT_MODEL = 'gemini-2.5-flash-image';

const NARRATOR_VOICE_MAP = {
  'narrator': 'callirrhoe',
  'Mara': 'autonoe',
  'Lyra': 'Kore',
  'Selene': 'erinome',
  'Aveena': 'Vindemiatrix',
  'Clinical Analyst': 'erinome',
  'Sympathetic Confidante': 'Vindemiatrix',
  'Seductive Dominatrix': 'erinome',
  'Mocking Jester': 'erinome',
};

// --- HELPER FUNCTIONS ---

function decode(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data, ctx, sampleRate, numChannels) {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


// --- VUE COMPONENTS ---

const CharacterImage = defineComponent({
  props: {
    imageUrl: { type: String, required: true },
    isLoading: { type: Boolean, required: true },
    errorMessage: { type: String, required: true },
  },
  template: `
    <div class="relative w-full aspect-video bg-black flex items-center justify-center rounded-lg overflow-hidden shadow-2xl shadow-stone-950">
      <div v-if="isLoading" class="absolute z-10 inset-0 flex items-center justify-center bg-black/50">
        <div class="w-16 h-16 border-4 border-t-transparent border-amber-300 rounded-full animate-spin"></div>
        <span class="absolute mt-20 text-sm text-amber-100">Altering reality...</span>
      </div>
      <img v-if="imageUrl" :src="imageUrl" class="w-full h-full object-cover transition-opacity duration-1000" :class="{ 'opacity-50': isLoading, 'opacity-100': !isLoading }"/>
      <div v-if="errorMessage" class="absolute bottom-2 left-2 text-xs text-red-400 bg-black/50 p-1 rounded">{{ errorMessage }}</div>
    </div>
  `
});


const StorytellerApp = defineComponent({
  components: {
    CharacterImage
  },
  setup() {
    const storyHtml = ref(`<p><narrator>The cold, sterile air of the training chamber still hummed with the ghosts of whimpers. Torin and Gavric, blindfolds removed, were left trembling on the floor, remnants of Lyra's "study" on fear. Lyra's lips were curled in a faint, satisfied smile as she reviewed her notes, but Mara felt a familiar, acidic guilt churn in her stomach. This wasn't research. It was meticulous, psychological torture, and she was an accomplice.</narrator></p>`);
    
    const imageUrl = ref('data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=');
    const imageBase64 = ref('');
    const imageMimeType = ref('image/jpeg');
    
    const isLoadingStory = ref(false);
    const isLoadingImage = ref(false);
    const imageErrorMessage = ref('');
    const imageEditPrompt = ref('');
    
    const storyContainer = ref(null);

    let outputAudioContext;
    let nextStartTime = 0;
    const activeSources = new Set();

    const initAudio = () => {
        if (!outputAudioContext || outputAudioContext.state === 'closed') {
            outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            nextStartTime = 0;
        }
    };
    
    const stopAllAudio = () => {
      activeSources.forEach(source => {
        try { source.stop(); } catch (e) { /* already stopped */ }
      });
      activeSources.clear();
      if (outputAudioContext) {
        nextStartTime = outputAudioContext.currentTime;
      }
    };

    const performAndSynthesizeAudio = async (text, voiceKey) => {
        if (!text.trim()) return;
        
        const voice = NARRATOR_VOICE_MAP[voiceKey] || NARRATOR_VOICE_MAP['narrator'];
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let ssmlScript = `<speak>${text}</speak>`; // Fallback

        try {
            // --- Step 1: Call Performance Agent to get SSML ---
            console.log(`--- Calling Performance Agent for text: "${text}" ---`);
            const performancePrompt = `${TTS_PERFORMANCE_PROMPT}\n\n### RAW TEXT TO PERFORM ###\n${text}`;
            const performanceResponse = await ai.models.generateContent({
                model: TTS_PERFORMANCE_MODEL,
                contents: [{ parts: [{ text: performancePrompt }] }],
                config: {
                    temperature: 0.9,
                    maxOutputTokens: 8192,
                }
            });
            const potentialSSML = performanceResponse.text;
            
            if (potentialSSML && potentialSSML.includes('<speak>') && potentialSSML.includes('</speak>')) {
                ssmlScript = potentialSSML;
            } else {
                 console.warn("Performance agent did not return valid SSML, using fallback.", potentialSSML);
            }
            console.log(`--- Received SSML Script: ${ssmlScript} ---`);

        } catch (perfError) {
            console.error("Error calling TTS Performance Agent, using fallback SSML.", perfError);
        }

        // --- Step 2: Call Synthesis Agent with SSML ---
        const synthesisResponse = await ai.models.generateContent({
            model: TTS_SYNTHESIS_MODEL,
            contents: [{ parts: [{ text: ssmlScript }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
                },
            },
        });
        
        const base64Audio = synthesisResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContext.destination);
            source.onended = () => activeSources.delete(source);
            source.start(nextStartTime);
            activeSources.add(source);
            nextStartTime += audioBuffer.duration;
        }
    };

    const parseAndPlayScript = async (script) => {
      initAudio();
      stopAllAudio();
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(`<root>${script}</root>`, "text/xml");
      const nodes = xmlDoc.documentElement.childNodes;

      for (const node of nodes) {
        if (!(node instanceof Element)) continue;
        const textContent = node.textContent || '';
        if (node.nodeName === 'narrator') {
          await performAndSynthesizeAudio(textContent, 'narrator');
        } else if (node.nodeName === 'dialogue') {
          const speaker = node.getAttribute('speaker') || 'narrator';
          await performAndSynthesizeAudio(textContent, speaker);
        } else if (node.nodeName === 'abyss') {
          const mode = node.getAttribute('mode') || 'Clinical Analyst';
          await performAndSynthesizeAudio(textContent, mode);
        } else if (node.nodeName === 'break') {
            const timeStr = node.getAttribute('time') || '1s';
            const seconds = parseFloat(timeStr);
            if (!isNaN(seconds)) nextStartTime += seconds;
        }
      }
    };

    const generateInitialImage = async (prompt) => {
      isLoadingImage.value = true;
      imageErrorMessage.value = '';
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: IMAGE_MODEL,
            contents: { parts: [{ text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            imageBase64.value = imagePart.inlineData.data;
            imageMimeType.value = imagePart.inlineData.mimeType;
            imageUrl.value = `data:${imageMimeType.value};base64,${imageBase64.value}`;
        } else {
            throw new Error('No image data received from Gemini.');
        }
      } catch (e) {
        imageErrorMessage.value = e instanceof Error ? e.message : 'Unknown image generation error.';
        console.error(imageErrorMessage.value);
      } finally {
        isLoadingImage.value = false;
      }
    };

    const editImage = async () => {
      if (!imageEditPrompt.value.trim() || !imageBase64.value) return;
      isLoadingImage.value = true;
      imageErrorMessage.value = '';
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: IMAGE_EDIT_MODEL,
          contents: {
            parts: [
              { inlineData: { data: imageBase64.value, mimeType: imageMimeType.value } },
              { text: imageEditPrompt.value },
            ],
          },
          config: { responseModalities: [Modality.IMAGE] },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart?.inlineData) {
          imageBase64.value = imagePart.inlineData.data;
          imageMimeType.value = imagePart.inlineData.mimeType;
          imageUrl.value = `data:${imageMimeType.value};base64,${imageBase64.value}`;
          imageEditPrompt.value = '';
        } else {
          throw new Error('No edited image data received.');
        }
      } catch (e) {
        imageErrorMessage.value = e instanceof Error ? e.message : 'Unknown image editing error.';
        console.error(imageErrorMessage.value);
      } finally {
        isLoadingImage.value = false;
      }
    };

    const continueStory = async () => {
      isLoadingStory.value = true;
      stopAllAudio();

      try {
        const continuationPoint = storyContainer.value?.innerText.trim().split('\n').pop() || '';
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // --- STEP 1: Director Agent ---
        console.log("--- Calling Director Agent ---");
        const directorPrompt = `${DIRECTOR_AGENT_PROMPT}\n<SCENE_CONTINUATION_POINT>${continuationPoint}</SCENE_CONTINUATION_POINT>`;
        const directorResponse = await ai.models.generateContent({
          model: STORY_GENERATION_MODEL,
          contents: directorPrompt,
          config: {
            thinkingConfig: { thinkingBudget: 32768 }
          }
        });
        const rawCreativeOutput = directorResponse.text;
        console.log("--- Raw Director Output Received ---", rawCreativeOutput);

        // --- STEP 2: Validator Agent ---
        console.log("--- Calling Validator Agent ---");
        const validatorPrompt = `${SYNTAX_SENTINEL_PROMPT}\n<RAW_PAYLOAD>${rawCreativeOutput}</RAW_PAYLOAD>`;
        const validatorResponse = await ai.models.generateContent({
          model: VALIDATOR_MODEL,
          contents: validatorPrompt
        });
        const jsonString = validatorResponse.text;
        console.log("--- Cleaned JSON from Validator ---", jsonString);

        let payload;
        try {
            const firstBrace = jsonString.indexOf('{');
            const lastBrace = jsonString.lastIndexOf('}');
            if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
              throw new Error("No valid JSON object found in validator response.");
            }
            const cleanJsonString = jsonString.substring(firstBrace, lastBrace + 1);
            payload = JSON.parse(cleanJsonString);
        } catch (parseError) {
            console.error("JSON Parsing Error (after validation):", parseError);
            console.error("String that failed to parse:", jsonString);
            throw new Error("Validator AI response was not valid JSON.");
        }

        console.log("--- Parsed AI Payload ---", payload);

        if (!payload.imagePrompt || typeof payload.imagePrompt !== 'string' || !payload.imagePrompt.trim()) {
            throw new Error("Final payload is missing a valid 'imagePrompt'.");
        }
        if (!payload.ttsPerformanceScript?.ssml || typeof payload.ttsPerformanceScript.ssml !== 'string' || !payload.ttsPerformanceScript.ssml.trim()) {
            throw new Error("Final payload is missing a valid 'ttsPerformanceScript'.");
        }
        
        const scriptSource = payload.ttsPerformanceScript.ssml;
        const newHtmlContent = scriptSource
            .replace(/<narrator>/g, '<p>').replace(/<\/narrator>/g, '</p>')
            .replace(/<dialogue speaker="([^"]+)">/g, '<p class="dialogue"><strong>$1:</strong> ')
            .replace(/<\/dialogue>/g, '</p>')
            .replace(/<abyss mode="([^"]+)">/g, '<p class="abyss"><em><strong>Abyss ($1):</strong> ')
            .replace(/<\/abyss>/g, '</em></p>')
            .replace(/<break[^>]+>/g, '');

        storyHtml.value += newHtmlContent;

        await generateInitialImage(payload.imagePrompt);
        
        const storyEl = storyContainer.value;
        if (storyEl) {
          await new Promise(resolve => setTimeout(resolve, 100));
          storyEl.scrollTo({ top: storyEl.scrollHeight, behavior: 'smooth' });
        }

        await parseAndPlayScript(payload.ttsPerformanceScript.ssml);

      } catch (error) {
        console.error("Failed to continue story:", error);
        storyHtml.value += `<p class="text-red-400">Error: The narrative faltered. The Alchemist seems to have stumbled. Check the console for details.</p>`;
      } finally {
        isLoadingStory.value = false;
      }
    };

    onMounted(() => {
        initAudio();
        const initialPrompt = "Masterpiece digital painting, style of Rembrandt and Caravaggio. Scene: A cold, sterile training chamber with Brutalist concrete walls. In the center, two young men, TORIN and GAVRIC, are trembling on the floor. A woman, MARA, her face a mask of GUILT, kneels to help them. In the background, another woman, LYRA, watches with a cold, satisfied smirk. The lighting is harsh, extremely high contrast chiaroscuro from an unseen source, casting oppressive shadows. Atmosphere: Tense, claustrophobic, psychological horror with a sense of dread and decay.";
        generateInitialImage(initialPrompt);
    });

    return {
      storyHtml,
      imageUrl,
      isLoading: computed(() => isLoadingStory.value || isLoadingImage.value),
      isLoadingStory,
      isLoadingImage,
      imageErrorMessage,
      continueStory,
      storyContainer,
      imageEditPrompt,
      editImage
    };
  },
  template: `
    <main class="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      <div class="lg:sticky top-8 flex flex-col gap-4">
        <h1 class="text-4xl md:text-5xl font-serif text-amber-50 text-center lg:text-left">The Forge's Loom</h1>
        <CharacterImage :image-url="imageUrl" :is-loading="isLoadingStory || isLoadingImage" :error-message="imageErrorMessage" />
        <div class="flex flex-col gap-2">
            <label for="image-edit" class="text-sm font-serif text-amber-100/70">Image Alchemy:</label>
            <div class="flex gap-2">
                <input v-model="imageEditPrompt" id="image-edit" type="text" placeholder="e.g., Add a flickering gas lamp..." class="flex-grow bg-stone-800 border border-stone-600 rounded-md px-3 py-2 text-stone-200 focus:ring-amber-400 focus:border-amber-400" :disabled="isLoading">
                <button @click="editImage" :disabled="isLoading || !imageEditPrompt.trim()" class="font-serif bg-stone-700 text-amber-200 border border-amber-400/30 rounded-md px-4 py-2 hover:bg-stone-600 disabled:opacity-50 transition">Edit Image</button>
            </div>
        </div>
      </div>
      
      <div class="flex flex-col h-full">
        <div ref="storyContainer" class="story-text relative flex-grow bg-stone-950 p-6 md:p-8 rounded-lg shadow-inner shadow-black overflow-y-auto max-h-[80vh]">
          <div v-html="storyHtml" class="font-sans text-stone-300 text-lg"></div>
        </div>
        <div class="pt-6 text-center">
          <button @click="continueStory" :disabled="isLoading" class="glow-button relative font-serif text-xl bg-stone-800 text-amber-200 border-2 border-amber-400/50 rounded-lg px-12 py-4 shadow-lg hover:bg-stone-700 hover:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
            <span class="relative z-10">{{ isLoadingStory ? 'Forging...' : 'Forge the Next Chapter' }}</span>
          </button>
        </div>
      </div>
    </main>
  `
});

createApp(StorytellerApp).mount('#app');