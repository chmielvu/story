/** * @license * SPDX-License-Identifier: Apache-2.0 */

import { ref, defineComponent, onMounted, computed, nextTick } from 'vue';

// --- IMPORTS FROM NEW MODULES ---
import { CharacterImage } from './components/CharacterImage';
import { parseSSMLToHTML, parseAndPlayScript } from './utils/parser';
import { 
    continueStoryStream, 
    generateInitialImage, 
    editImage 
} from './api/gemini';
import { NARRATOR_VOICE_MAP, CHARACTER_IMAGE_PROMPTS, CHARACTER_DESCRIPTIONS } from './constants';
import { stopAllAudio, initAudio, playTransitionSound } from './utils/audio';

// --- TYPES ---
interface CharacterPortrait {
    imageUrl: string;
    isLoading: boolean;
    errorMessage: string;
}

// --- VUE COMPONENTS ---

export const App = defineComponent({
  components: {
    CharacterImage
  },
  setup() {
    const storyHtml = ref(`<p>The final, shuddering gasp had been wrenched from him minutes ago, but Selene was in no hurry. Jared stood braced against the mahogany desk, his knuckles white, his body a wrecked, sweat-slicked canvas of her artistry. The air in her study, thick with the scent of old leather and ozone from the storm raging outside, tasted of his humiliation.</p><p><dialogue speaker="Selene">"Breathe,"</dialogue> she commanded, her voice a low contralto that vibrated through the floorboards. She traced a single, manicured nail down the sweat-slicked channel of his spine. <dialogue speaker="Selene">"I'm not finished with my analysis."</dialogue></p>`);
    const storyContainer = ref<HTMLDivElement | null>(null);
    const isLoading = ref(false);
    const isTransitioning = ref(false);
    const currentNarrationScript = ref('');
    const narratorVoice = ref('narrator');
    const characterPortraits = ref<Record<string, CharacterPortrait>>({
      "Selene": { imageUrl: '', isLoading: true, errorMessage: '' },
      "Jared": { imageUrl: '', isLoading: true, errorMessage: '' },
    });

    const isPlaying = computed(() => isLoading.value);

    const getStoryTextOnly = () => {
        const div = document.createElement('div');
        div.innerHTML = storyHtml.value;
        return div.textContent || div.innerText || '';
    };

    const continueStory = async () => {
        if (isLoading.value) return;

        // --- Start Transition ---
        isLoading.value = true;
        isTransitioning.value = true;
        stopAllAudio();
        playTransitionSound(); // Play audio cue
        // ---------------------

        currentNarrationScript.value = '';

        let fullSsml = '';
        let lastScrollHeight = 0;
        let storyAddition = '';

        await continueStoryStream({
            continuationPoint: getStoryTextOnly(),
            onTextChunk: (textChunk) => {
                // --- End Transition on first chunk ---
                if (isTransitioning.value) {
                    isTransitioning.value = false;
                }
                // -----------------------------------

                fullSsml = `<speak>${textChunk}</speak>`;
                const newHtml = parseSSMLToHTML(textChunk);
                storyHtml.value += newHtml.substring(storyAddition.length);
                storyAddition = newHtml;

                nextTick(() => {
                    if (storyContainer.value && storyContainer.value.scrollHeight > lastScrollHeight) {
                        storyContainer.value.scrollTop = storyContainer.value.scrollHeight;
                        lastScrollHeight = storyContainer.value.scrollHeight;
                    }
                });
            },
            onMetadata: (metadata) => {
                console.log("Metadata received:", metadata);
                // Future enhancement: Update character portraits based on metadata.imagePrompt
            },
            onComplete: async () => {
                currentNarrationScript.value = fullSsml;
                await parseAndPlayScript(currentNarrationScript.value, narratorVoice.value);
                isLoading.value = false;
            },
            onError: (error) => {
                console.error("Story continuation error:", error);
                isLoading.value = false;
                isTransitioning.value = false; // Ensure transition state is reset on error
            }
        });
    };

    onMounted(async () => {
        initAudio();
        for (const name in characterPortraits.value) {
            if (CHARACTER_IMAGE_PROMPTS[name]) {
                try {
                    const { imageUrl } = await generateInitialImage(CHARACTER_IMAGE_PROMPTS[name]);
                    characterPortraits.value[name].imageUrl = imageUrl;
                } catch (e) {
                    characterPortraits.value[name].errorMessage = `Failed to generate portrait for ${name}.`;
                    console.error(e);
                } finally {
                    characterPortraits.value[name].isLoading = false;
                }
            }
        }
    });

    return {
      storyHtml,
      storyContainer,
      isLoading,
      isPlaying,
      characterPortraits,
      isTransitioning,
      continueStory,
      stopAllAudio,
      CHARACTER_DESCRIPTIONS,
    };
  },

  template: `
    <div class="min-h-screen bg-background text-text-primary font-serif flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div class="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Story Column -->
        <main class="lg:col-span-8 bg-surface-primary/80 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden flex flex-col" :style="{ 'box-shadow': '0 25px 50px -12px var(--shadow-color)' }">
          <div class="p-6 sm:p-8 border-b border-border-primary">
            <h1 class="font-serif text-3xl sm:text-4xl text-accent-primary tracking-wider">The Forge's Loom</h1>
            <p class="text-text-muted mt-2">An Interactive Narrative</p>
          </div>
          
          <div ref="storyContainer" class="flex-grow p-6 sm:p-8 overflow-y-auto relative" style="max-height: 70vh;">
            <transition name="fade" mode="out-in">
              <div class="story-text text-text-secondary text-lg" :class="{ 'story-transitioning': isTransitioning }" v-html="storyHtml"></div>
            </transition>
          </div>

          <div class="p-6 border-t border-border-primary bg-surface-secondary/50 flex items-center justify-center">
            <button @click="continueStory" :disabled="isLoading" 
                    class="glow-button relative z-10 w-full sm:w-auto px-10 py-4 bg-accent-primary/80 text-background font-bold rounded-md shadow-lg hover:bg-accent-secondary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-secondary flex items-center justify-center space-x-3">
                <span v-if="!isLoading">Continue the Agony</span>
                <div v-if="isLoading" class="flex items-center space-x-3">
                    <div class="w-5 h-5 border-2 border-t-transparent border-background rounded-full animate-spin"></div>
                    <span>Weaving Fate...</span>
                </div>
            </button>
          </div>
        </main>

        <!-- Character Column -->
        <aside class="lg:col-span-4 space-y-8">
          <div v-for="(portrait, name) in characterPortraits" :key="name" class="bg-surface-primary/80 backdrop-blur-sm rounded-lg shadow-lg p-4">
             <h2 class="font-serif text-2xl text-accent-secondary mb-3">{{ name }}</h2>
             <CharacterImage :image-url="portrait.imageUrl" :is-loading="portrait.isLoading" :error-message="portrait.errorMessage" />
             <p class="text-sm text-text-muted mt-3 p-2 bg-surface-secondary/50 rounded">{{ CHARACTER_DESCRIPTIONS[name] }}</p>
          </div>
        </aside>

      </div>
    </div>
  `
});