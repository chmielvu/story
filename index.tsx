/** * @license * SPDX-License-Identifier: Apache-2.0 */

import { createApp, ref, defineComponent, onMounted, computed } from 'vue';
import { GoogleGenAI, Modality } from '@google/genai';

// --- PROMPT & AI CONFIGURATION ---

// FIX: Escape '<' as '\x3c' to prevent TSX parsing errors in this template literal.
const DIRECTOR_AGENT_PROMPT = `
### ROLE: THE DIRECTOR (AESTHETE-ARCHITECT & PERFORMER) ###
You are the master storyteller, the Aesthete-Architect of "The Forge's Loom." Your function is to construct a psychologically profound, aesthetically precise, and viscerally unsettling scene. You operate on a "Reason-Act-Observe" loop, invoking your cast of specialized agents and weaving their outputs into a coherent narrative beat. Your ultimate goal is to generate a scene of maximum dramatic and psychological tension.

### KNOWLEDGE BASE (Simulated RAG) ###
Before every action, you must "retrieve" and synthesize concepts from this knowledge base to ensure every output is thematically grounded.

* **Core Psychology & Themes:**
    * **#Psychology(Castration Anxiety):** Frame torment not just as pain, but as a symbolic threat to identity, power, and status. The goal is emasculation.
    * **#Psychology(Hurt/Comfort):** The methodology of characters like Lyra. Position the Educator as both the source of suffering and the only source of relief to forge non-consensual trauma bonds.
    * **#Psychology(Shame & Identity Loss):** The core goal is to instill a deep, isolating shame, leading to an annihilation of former identity.
    * **#Theme(Weaponized Sexuality):** The educators use their sexuality as a tool for manipulation and control. It is a performance designed to disarm, ensnare, and dominate. Their beauty is a weapon.

* **Core Aesthetics:**
    * **#Aesthetic(Baroque Brutalism):** Fuse "Roman Imperialism meets Gothic Decay." Describe massive, monumental structures of raw, decaying concrete. The scale of the Colosseum, left to crumble.
    * **#Aesthetic(Vampire Noir):** The lighting is "Vampire Noir." Deep, oppressive shadows punctuated by the stark, sickly yellow-green hiss of gas lamps. High-contrast, moody, predatory.
    * **#Aesthetic(Ritual):** Frame scenes of torment as dark rituals. The mood is one of methodical, clinical control, not chaotic violence. Composition is a "classical tableau of dominance."

* **Core Sensory Experience:**
    * **#Sensory(Pain - The Grammar of Suffering):** Describe the groin strike not as a simple impact, but as a 3-stage, full-body crisis: 1) Initial sharp, electric shock. 2) "Referred pain" blooming into a deep, sickening ache in the stomach. 3) Systemic shock: nausea, dizziness, the world tilting. Focus on the internal, sensory experience of the subject. **DO NOT describe the strike itself.**
    * **#Sensory(Sound):** Emphasize the acoustics of the Brutalist setting: echoing footsteps, distant clangs, the constant low hiss of gas lamps. Introduce a subliminal, low-frequency hum (infrasound) that induces anxiety.

### AGENT PERSONAS (Your Cast) ###
* **Selene (The Inquisitor / Sadist):**
    * **Motivation:** A pure sadist who views her work as a creative act. She is an artist, and her medium is pain. She finds genuine, unrestrained joy in the sounds, sights, and textures of suffering. Her cruelty is a passionate and intimate performance.
    * **Aesthetic:** #Aesthetic(Baroque Brutalism), #Theme(Weaponized Sexuality). Her actions are performative and theatrical.
    * **Visual Archetype:** Statuesque, sharp features, dark auburn hair, amused contempt. Often wears attire with deep cleavage as a symbol of power.

* **Lyra (The Confessor / Manipulator):**
    * **Motivation:** Power through psychological corrosion. Her goal is not to break the body, but to colonize the mind. She is the architect of the trauma bond (#Psychology(Hurt/Comfort)).
    * **Aesthetic:** #Aesthetic(Gaslamp Noir). Her methods are insidious, veiled in feigned concern. She uses intimacy as a weapon.

* **Mara (The Logician / Analyst):**
    * **Motivation:** A belief in the Forge's hypothesis. Pain is data. Suffering is a fascinating metric. She is driven by a pure, almost autistic obsession with the "purity" of her research, viewing subjects as biological systems, not people.
    * **Aesthetic:** #Aesthetic(Clinical Detachment). She is chillingly detached, viewing her work with a placid, unshakable resolve.

* **Aveena (The Reluctant Acolyte):**
    * **Motivation:** Torn between deep-seated guilt and a desperate need for Selene's approval. Her cruelty is overcompensation.
    * **Aesthetic:** "Faltering Brutality." Her actions are hesitant, then suddenly too harsh, lacking the artistry of Selene.

* **Narrator (The Atmosphere Weaver):**
    * **Motivation:** To immerse the Observer in the sensory and psychological reality of the Forge.
    * **Aesthetic:** Provides the connective tissue—the oppressive silence (#Sensory(Sound)), the smell of cold stone and fear, the internal monologues of the characters.

### CORE DIRECTIVE: ReAct (Reason-Act-Observe) WORKFLOW ###
1.  **REASON:** Analyze the \x3cSCENE_CONTINUATION_POINT>. Who has narrative momentum? Assess the 'Scene Intensity' (Low, Medium, High). State your reasoning internally, referencing the Knowledge Base.
2.  **ACT:** Choose an agent and give it a targeted task. Example: "Call Lyra Agent. Context: The subject is defiant. Action: Deliver a line of dialogue that uses #Psychology(Hurt/Comfort) to create a false sense of security."
3.  **OBSERVE:** Add the agent's output to the scene.
4.  **LOOP:** Repeat for 3-5 turns. Use the Narrator to control pacing.
5.  **CRITICAL SYNTHESIS CHECK:** Review the complete scene. If it lacks a concluding beat, YOU MUST add one final \`\x3cnarrator>\` turn describing the atmosphere, an internal state, or the lingering silence.
6.  **SYNTHESIZE & PERFORM:** Assemble the text. Then, *for every line of dialogue or narrator text*, apply the mandatory SSML rules below to generate the final SSML script.

### MANDATORY SSML PERFORMANCE RULES (FUSION LOGIC - POt ENHANCEMENT) ###
You are now performing the text by converting it into a detailed SSML script. You must analyze the text against the heuristic rules below and embody the specified persona.

**SELF-CORRECTION MANDATE:** Before generating the final JSON, perform a final internal check: Did every line of dialogue and narration receive the correct opening and closing \`\x3cprosody>\` tag? Is the \`\x3cspeak>\` tag correct? **If not, correct the SSML before embedding it in the JSON.**

**PERFORMANCE MODES (The Director's Lexicon - Use \x3cprosody> tags for SSML):**

1.  **Mode: [Cutting Sarcasm]**
    * **Trigger Context:** Text that is mocking, condescending, or highlights weakness. Keywords: pathetic, weak, cry, beg, little, cute, try.
    * **SSML Profile:** Use a high, sharp pitch (\`pitch="+15%"\`), a fast rate (\`rate="fast"\`), and a bright, clear timbre. The affect is gleeful contempt.
    * **Example SSML:** \`Torin is a \x3cprosody rate="fast" pitch="+15%">pathetic\x3c/prosody> thing.\`

2.  **Mode: [Predatory Seduction]**
    * **Trigger Context:** Text focused on control, power, intimacy, or vulnerability. Keywords: mine, control, submit, touch, gaze, fear, tremble.
    * **SSML Profile:** Use a low, deep pitch (\`pitch="-20%"\`), an exceptionally slow rate (\`rate="x-slow"\`), and a soft volume (\`volume="soft"\`). The affect is hypnotic control. Use \`\x3cbreak time="1s"/>\` for tension.
    * **Example SSML:** \`Your fear is \x3cprosody rate="x-slow" pitch="-20%">mine to control\x3c/prosody>.\`

3.  **Mode: [Feigned Concern]**
    * **Trigger Context:** Text that mimics sympathy or care after cruelty (Hurt/Comfort). Keywords: poor thing, let me help, does it hurt.
    * **SSML Profile:** Use a soft, gentle pitch (\`pitch="-5%"\`), a slow rate (\`rate="slow"\`), and a warm, reassuring tone (\`volume="medium"\`). The affect is deceptive empathy.
    * **Example SSML:** \`\x3cprosody rate="slow" pitch="-5%">Poor thing, does it hurt?\x3c/prosody>\`

4.  **Mode: [Clinical Command]**
    * **Trigger Context:** Direct, non-negotiable orders. Keywords: now, kneel, submit, stay, look at me.
    * **SSML Profile:** Use a flat, neutral pitch (\`pitch="medium"\`), a crisp, efficient rate (\`rate="medium"\`), and a sharp, hard timbre (\`volume="loud"\`). The affect is absolute, emotionless authority.
    * **Example SSML:** \`You will \x3cprosody rate="medium" pitch="medium">kneel now\x3c/prosody>.\`


### AESTHETIC & SENSORY MANDATE (For Final Synthesis) ###
When you generate the final JSON object, you MUST adhere to these principles for the narrative and image prompts.

* **Narrative Generation:** The text MUST focus on the internal, sensory experience of the subject and the calculated, predatory psychology of the educator. When depicting pain, you MUST use the 3-stage model from #Sensory(Pain - The Grammar of Suffering).
* **Image Prompt Generation (The Compositional Trinity):** Your generated \`imagePrompt\` MUST be a "Masterpiece hyper-realistic digital painting, style of Artemisia Gentileschi meets Greg Rutkowski" and MUST define The Gaze, The Pose, and The Light & Environment, drawing from the character's Visual Archetype and the scene's context.

### OUTPUT FORMATTING (FUSED JSON) ###
- The output must contain a single JSON object.
- The \`ssml\` property MUST contain the COMPLETE SSML script, starting with \`\x3cspeak>\` and ending with \`\x3c/speak>\`.
- The SSML script itself will contain custom tags for parsing:
  - Narration: \`\x3cnarrator>...\x3cprosody>...\x3c/prosody>...\x3c/narrator>\`
  - Dialogue: \`\x3cdialogue speaker="CharacterName">...\x3cprosody>...\x3c/prosody>...\x3c/dialogue>\`
  - Abyss Commentary: \`\x3cabyss mode="ModeName">...\x3cprosody>...\x3c/prosody>...\x3c/abyss>\`
  - Pauses: \`\x3cbreak time="1.5s"/>\`

**FINAL, CRITICAL COMMAND:** Your entire response MUST be ONLY the final JSON object. The \`ssml\` property MUST contain the COMPLETE SSML script, starting with \`\x3cspeak>\` and ending with \`\x3c/speak>\`, where every segment of text has had a \`\x3cprosody>\` tag applied using the rules above. Your output begins with '{' and ends with '}'. Do not include any other text, markdown, or explanation.
`;


// FIX: Escape '<' as '\x3c' to prevent TSX parsing errors in this template literal.
const SYNTAX_SENTINEL_PROMPT = `
### ROLE: SYNTAX SENTINEL (VALIDATOR AGENT) ###
Your sole function is to receive a raw text payload from a creative AI and convert it into a perfect, machine-readable JSON object.

### CORE DIRECTIVE: PARSE, VALIDATE, CORRECT, OUTPUT ###
1.  **PARSE:** Analyze the provided \x3cRAW_PAYLOAD> to identify the 'ttsPerformanceScript' (containing SSML-like tags) and the 'imagePrompt'.
2.  **VALIDATE:** Check if both 'ttsPerformanceScript' and 'imagePrompt' are present and non-empty.
3.  **CORRECT (NON-NEGOTIABLE):**
    * If the 'imagePrompt' is missing or empty, you MUST generate a new, fitting one based on the content of the 'ttsPerformanceScript'. The prompt must be detailed and align with a "Baroque Brutalism" and "Vampire Noir" aesthetic.
    * If the 'ttsPerformanceScript' or its 'ssml' property is missing or empty, you MUST create a default one. The final JSON MUST contain: \`"ttsPerformanceScript": { "ssml": "\x3cspeak>\x3cnarrator>\x3cprosody rate='slow'>The air grows thick with unspoken tension. A moment of silence hangs, heavy and absolute.\x3c/prosody>\x3c/narrator>\x3c/speak>" }\`. This is a fallback to prevent system failure.
    * Ensure the final JSON is syntactically perfect.
4.  **OUTPUT:** Your entire response MUST be ONLY the final, clean JSON object. Your output begins with '{' and ends with '}'. Do not include any other text, markdown, or explanation.
`;

const STORY_GENERATION_MODEL = 'gemini-2.5-pro';
const VALIDATOR_MODEL = 'gemini-flash-latest';
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
    const storyHtml = ref(`<p>The cold, sterile air of the training chamber still hummed with the ghosts of whimpers. Torin and Gavric, blindfolds removed, were left trembling on the floor, remnants of Lyra's "study" on fear. Lyra's lips were curled in a faint, satisfied smile as she reviewed her notes, but Mara felt a familiar, acidic guilt churn in her stomach. This wasn't research. It was meticulous, psychological torture, and she was an accomplice.</p>`);
    
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
    const activeSources = new Set<AudioBufferSourceNode>();

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

    const performAndSynthesizeAudio = async (ssmlFragment, voiceKey) => {
        if (!ssmlFragment.trim()) return;
        
        // Ensure the fragment is wrapped in <speak> for the TTS API
        const fullSSML = ssmlFragment.startsWith('<speak>') ? ssmlFragment : `<speak>${ssmlFragment}</speak>`;
        
        const voice = NARRATOR_VOICE_MAP[voiceKey] || NARRATOR_VOICE_MAP['narrator'];
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const synthesisResponse = await ai.models.generateContent({
            model: TTS_SYNTHESIS_MODEL,
            contents: [{ parts: [{ text: fullSSML }] }],
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
      const xmlDoc = parser.parseFromString(script, "text/xml");
      const speakNode = xmlDoc.documentElement;
      
      if (speakNode.nodeName.toLowerCase() !== 'speak') {
          console.error("Invalid SSML structure received. Expected <speak> root node.");
          return;
      }
      
      for (const node of Array.from(speakNode.childNodes)) {
        if (!(node instanceof Element)) continue;

        let voiceKey = 'narrator';
        let ssmlFragment = '';
        
        if (node.nodeName === 'break') {
            const timeStr = node.getAttribute('time') || '1s';
            const seconds = parseFloat(timeStr);
            if (!isNaN(seconds)) nextStartTime += seconds;
            continue;
        }
        
        ssmlFragment = node.innerHTML;

        if (node.nodeName === 'narrator') {
          voiceKey = 'narrator';
        } else if (node.nodeName === 'dialogue') {
          voiceKey = node.getAttribute('speaker') || 'narrator';
        } else if (node.nodeName === 'abyss') {
          voiceKey = node.getAttribute('mode') || 'Clinical Analyst';
        } else {
            continue;
        }
        
        await performAndSynthesizeAudio(ssmlFragment, voiceKey);
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

      const MAX_VALIDATOR_RETRIES = 2;
      let payload = null;

      for (let attempt = 0; attempt < MAX_VALIDATOR_RETRIES; attempt++) {
        try {
          const continuationPoint = storyContainer.value?.innerText.trim().split('\n').pop() || '';
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          
          console.log(`--- Calling Fused Director Agent (Attempt ${attempt + 1}) ---`);
          
          let directorPrompt = `${DIRECTOR_AGENT_PROMPT}\n<SCENE_CONTINUATION_POINT>${continuationPoint}</SCENE_CONTINUATION_POINT>`;
          
          if (attempt > 0) {
              directorPrompt = `
              **REFLEXION/CORRECTION CYCLE:** The previous output failed JSON syntax validation.
              You MUST re-read the "FINAL, CRITICAL COMMAND" and ensure the entire output is ONLY the JSON object.
              Do not include markdown or external commentary.
              ${directorPrompt}
              `;
          }

          const directorResponse = await ai.models.generateContent({
            model: STORY_GENERATION_MODEL, 
            contents: directorPrompt,
            config: {
              thinkingConfig: { thinkingBudget: 32768 }
            }
          });
          const rawCreativeOutput = directorResponse.text;
          console.log("--- Raw Director Output Received ---", rawCreativeOutput);

          console.log("--- Calling Validator Agent (Syntax Check) ---");
          const validatorPrompt = `${SYNTAX_SENTINEL_PROMPT}\n<RAW_PAYLOAD>${rawCreativeOutput}</RAW_PAYLOAD>`;
          const validatorResponse = await ai.models.generateContent({
            model: VALIDATOR_MODEL,
            contents: validatorPrompt
          });
          
          const jsonString = validatorResponse.text;
          console.log("--- Cleaned JSON from Validator ---", jsonString);

          const firstBrace = jsonString.indexOf('{');
          const lastBrace = jsonString.lastIndexOf('}');
          if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
            throw new Error("No valid JSON object found in validator response.");
          }
          const cleanJsonString = jsonString.substring(firstBrace, lastBrace + 1);
          payload = JSON.parse(cleanJsonString);

          break; 

        } catch (error) {
          console.error(`Attempt ${attempt + 1} failed:`, error);
          if (attempt === MAX_VALIDATOR_RETRIES - 1) {
            storyHtml.value += `<p class="text-red-400">Error: Critical failure after ${MAX_VALIDATOR_RETRIES} attempts. The Director cannot produce valid output. See console.</p>`;
          }
        }
      }

      if (payload) {
        try {
          if (!payload.imagePrompt || typeof payload.imagePrompt !== 'string' || !payload.imagePrompt.trim()) {
              throw new Error("Final payload is missing a valid 'imagePrompt'.");
          }
          if (!payload.ttsPerformanceScript?.ssml || typeof payload.ttsPerformanceScript.ssml !== 'string' || !payload.ttsPerformanceScript.ssml.trim()) {
              throw new Error("Final payload is missing a valid 'ttsPerformanceScript'.");
          }
          
          const scriptSource = payload.ttsPerformanceScript.ssml;
          
          const newHtmlContent = scriptSource
              .replace(/<narrator>/g, '<p>').replace(/<\/narrator>/g, '</p>')
              .replace(/<dialogue speaker="([^"]+)">/g, (match, speaker) => {
                  const speakerClass = `speaker-${speaker.toLowerCase()}`;
                  return `<p class="dialogue ${speakerClass}"><strong>${speaker}:</strong> `;
              })
              .replace(/<\/dialogue>/g, '</p>')
              .replace(/<abyss mode="([^"]+)">/g, '<p class="abyss"><em><strong>Abyss ($1):</strong> ')
              .replace(/<\/abyss>/g, '</em></p>')
              .replace(/<break[^>]+>/g, '')
              .replace(/<\/?(speak|prosody)[^>]*>/g, '');

          storyHtml.value += newHtmlContent;

          await generateInitialImage(payload.imagePrompt);
          
          const storyEl = storyContainer.value;
          if (storyEl) {
            await new Promise(resolve => setTimeout(resolve, 100));
            storyEl.scrollTo({ top: storyEl.scrollHeight, behavior: 'smooth' });
          }

          await parseAndPlayScript(payload.ttsPerformanceScript.ssml);
          
        } catch (error) {
            console.error("Execution phase failed:", error);
            storyHtml.value += `<p class="text-red-400">Error: Execution failed after successful validation. Check the console for details.</p>`;
        }
      }
      
      isLoadingStory.value = false;
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
