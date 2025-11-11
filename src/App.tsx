/** * @license * SPDX-License-Identifier: Apache-2.0 */

import { createApp, ref, defineComponent, onMounted, computed } from 'vue';

// --- IMPORTS FROM NEW MODULES ---
import { CharacterImage } from './components/CharacterImage';
import { parseSSMLToHTML, parseAndPlayScript } from './utils/parser';
import { 
    continueStory, 
    generateInitialImage, 
    editImage 
} from './api/gemini';
import { stopAllAudio, initAudio } from './utils/audio';

// --- VUE COMPONENTS ---

const App = defineComponent({
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
    
    const storyContainer = ref<HTMLDivElement | null>(null);

    const isLoading = computed(() => isLoadingStory.value || isLoadingImage.value);

    const handleGenerateInitialImage = async (prompt: string) => {
        isLoadingImage.value = true;
        imageErrorMessage.value = '';
        try {
            const result = await generateInitialImage(prompt);
            imageBase64.value = result.base64;
            imageMimeType.value = result.mimeType;
            imageUrl.value = result.imageUrl;
        } catch (e) {
            imageErrorMessage.value = e instanceof Error ? e.message : 'Unknown image generation error.';
            console.error(imageErrorMessage.value);
        } finally {
            isLoadingImage.value = false;
        }
    };

    const handleEditImage = async () => {
        if (!imageEditPrompt.value.trim() || !imageBase64.value) return;
        isLoadingImage.value = true;
        imageErrorMessage.value = '';
        try {
            const result = await editImage(imageBase64.value, imageMimeType.value, imageEditPrompt.value);
            imageBase64.value = result.base64;
            imageMimeType.value = result.mimeType;
            imageUrl.value = result.imageUrl;
            imageEditPrompt.value = '';
        } catch (e) {
            imageErrorMessage.value = e instanceof Error ? e.message : 'Unknown image editing error.';
            console.error(imageErrorMessage.value);
        } finally {
            isLoadingImage.value = false;
        }
    };

    const handleContinueStory = async () => {
        isLoadingStory.value = true;
        stopAllAudio(); // Stop audio via utility function

        try {
            const continuationPoint = storyContainer.value?.innerText.trim().split('\n').pop() || '';
            
            // Call streamlined API function
            const payload = await continueStory(continuationPoint);

            // Update story text and image
            const scriptSource = payload.ttsPerformanceScript.ssml;
            
            // Use utility function for HTML conversion
            const newHtmlContent = parseSSMLToHTML(scriptSource);

            storyHtml.value += newHtmlContent;

            // Use utility function for image generation
            await handleGenerateInitialImage(payload.imagePrompt); 
            
            // Scroll to bottom
            const storyEl = storyContainer.value;
            if (storyEl) {
                await new Promise(resolve => setTimeout(resolve, 100));
                storyEl.scrollTo({ top: storyEl.scrollHeight, behavior: 'smooth' });
            }

            // Use utility function for audio playback
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
        handleGenerateInitialImage(initialPrompt);
    });

    return {
      storyHtml,
      imageUrl,
      isLoading,
      isLoadingStory,
      isLoadingImage,
      imageErrorMessage,
      continueStory: handleContinueStory,
      storyContainer,
      imageEditPrompt,
      editImage: handleEditImage
    };
  },
  template: `
    <main class="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      <div class="lg:sticky top-8 flex flex-col gap-4">
        <h1 class="text-4xl md:text-5xl font-serif text-amber-50 text-center lg:text-left">The Forge's Loom</h1>
        <CharacterImage :image-url="imageUrl" :is-loading="isLoading" :error-message="imageErrorMessage" />
        <div class="flex flex-col gap-2">
            <label for="image-edit" class="text-sm font-serif text-amber-100/70">Image Alchemy:</label>
            <div class="flex gap-2">
                <input v-model="imageEditPrompt" id="image-edit" type="text" placeholder="e.g., Add a flickering gas lamp..." class="flex-grow bg-stone-800 border border-stone-600 rounded-md px-3 py-2 text-stone-200 focus:ring-amber-400 focus:border-amber-400" :disabled="isLoading">
                <button @click="handleEditImage" :disabled="isLoading || !imageEditPrompt.trim()" class="font-serif bg-stone-700 text-amber-200 border border-amber-400/30 rounded-md px-4 py-2 hover:bg-stone-600 disabled:opacity-50 transition">Edit Image</button>
            </div>
        </div>
      </div>
      
      <div class="flex flex-col h-full">
        <div ref="storyContainer" class="story-text relative flex-grow bg-stone-950 p-6 md:p-8 rounded-lg shadow-inner shadow-black overflow-y-auto max-h-[80vh]">
          <div v-html="storyHtml" class="font-sans text-stone-300 text-lg"></div>
        </div>
        <div class="pt-6 text-center">
          <button @click="handleContinueStory" :disabled="isLoading" class="glow-button relative font-serif text-xl bg-stone-800 text-amber-200 border-2 border-amber-400/50 rounded-lg px-12 py-4 shadow-lg hover:bg-stone-700 hover:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
            <span class="relative z-10">{{ isLoadingStory ? 'Forging...' : 'Forge the Next Chapter' }}</span>
          </button>
        </div>
      </div>
    </main>
  `
});

createApp(App).mount('#app');
