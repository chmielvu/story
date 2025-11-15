/** * @license * SPDX-License-Identifier: Apache-2.0 */

import { ref, defineComponent, onMounted, computed } from 'vue';

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

export const App = defineComponent({
  components: {
    CharacterImage
  },
  setup() {
    const storyHtml = ref(`<p>The session was over, but Lyra’s artistry had just begun. Torin sat motionless on a velvet stool, his body pliant, his eyes vacant and doll-like. The tremors had ceased, replaced by a chilling stillness. Lyra, with the focused calm of a collector pinning a butterfly, adjusted the delicate black lace at his collar. The ornate, Victorian-style shirt, with its intricate ruffles, was a stark, cruel contrast to the faint bruises blooming on his skin. Mara watched from the shadows, her stomach coiling. This wasn't recovery. This was curation—the careful, aesthetic arrangement of brokenness.</p>`);
    
    const imageUrl = ref('data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=');
    const imageBase64 = ref('');
    const imageMimeType = ref('image/jpeg');
    
    const isLoadingStory = ref(false);
    const isLoadingImage = ref(false);
    const imageErrorMessage = ref('');
    const imageEditPrompt = ref('');
    
    const storyContainer = ref<HTMLDivElement | null>(null);

    const isLoading = computed(() => isLoadingStory.value || isLoadingImage.value);

    const theme = ref<'dark' | 'darkAcademia'>('dark');

    const toggleTheme = () => {
        const newTheme = theme.value === 'dark' ? 'darkAcademia' : 'dark';
        theme.value = newTheme;
        document.documentElement.className = `theme-${newTheme}`;
    };

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
        // Set initial theme
        document.documentElement.className = 'theme-dark';
        const initialPrompt = "Masterpiece hyper-realistic digital painting. The final image is an alchemical fusion that achieves a singular vision: the scholarly, oppressive elegance of Dark Academia; the grand, decaying scale of Baroque Brutalism; the intimate, predatory lighting of Vampire Noir; and the tragic, candlelit humanity of Georges de La Tour's art. The scene is a study in erotic dread, set within a vast, dimly lit private library. The atmosphere is one of suffocating, clinical sterility and predatory intimacy. The air is heavy with the scent of decaying leather, old paper, and the sharp, cloying smell of antiseptic. The silence is absolute, broken only by the subject's hitched, shallow breaths. The composition is a Baroque tableau of absolute female domination. A woman, LYRA, is the epicenter of power, poised with languid, almost bored ownership in a massive, decaying leather armchair. Her gaze is not merely a look but an act of psychological dissection—a piercing instrument of detached clinical interest, proprietary desire, and the faint, cruel amusement of a god examining a beautiful, yet disposable, specimen. Before her, a young man, TORIN, is a 'beautiful ruin,' his body a tense knot of agony and forced submission, contorted on the floor. His pristine Dark Academia clothing—a perfectly buttoned waistcoat—is a cruel mockery of his ruined state. This is a moment of pure objectification; he is not a person, but an aesthetic object of suffering. The detail that anchors this psycho-sexual horror is the terrifying intimacy of Lyra's action: one of her hands, relaxed and elegant, gently dances in the air just above Torin's groin. Her fingers trace patterns, never quite touching, yet promising an agony that makes his entire body tremble in anticipation. It is a gesture of absolute power, a clinical examination of his most vulnerable point, and the ultimate expression of his status as a helpless specimen.";
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
      editImage: handleEditImage,
      theme,
      toggleTheme,
    };
  },
  template: `
    <main class="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      <div class="lg:sticky top-8 flex flex-col gap-4">
        <div class="flex justify-between items-center">
            <h1 class="text-4xl md:text-5xl font-serif text-accent-primary">The Forge's Loom</h1>
        
            <!-- Theme Toggle Switch -->
            <div class="flex items-center gap-3 font-serif text-sm text-text-muted">
                <span>Dark</span>
                <label class="theme-toggle">
                    <div class="theme-toggle-switch">
                    <input type="checkbox" :checked="theme === 'darkAcademia'" @change="toggleTheme">
                    <span class="slider"></span>
                    </div>
                </label>
                <span>Academia</span>
            </div>
        </div>
        
        <CharacterImage :image-url="imageUrl" :is-loading="isLoading" :error-message="imageErrorMessage" />
        <div class="flex flex-col gap-2">
            <label for="image-edit" class="text-sm font-serif text-text-muted">Image Alchemy:</label>
            <div class="flex gap-2">
                <input v-model="imageEditPrompt" id="image-edit" type="text" placeholder="e.g., Add a flickering gas lamp..." class="flex-grow bg-surface-secondary border border-border-secondary rounded-md px-3 py-2 text-text-primary focus:ring-accent-secondary focus:border-accent-secondary" :disabled="isLoading">
                <button @click="handleEditImage" :disabled="isLoading || !imageEditPrompt.trim()" class="font-serif bg-surface-secondary text-accent-primary border border-accent-secondary/40 rounded-md px-4 py-2 hover:bg-border-secondary hover:border-accent-secondary disabled:opacity-50 transition">Edit Image</button>
            </div>
        </div>
      </div>
      
      <div class="flex flex-col h-full">
        <div ref="storyContainer" class="story-text relative flex-grow bg-surface-primary backdrop-blur-sm border border-border-primary p-6 md:p-8 rounded-lg shadow-inner shadow-black/50 overflow-y-auto max-h-[80vh]">
          <div v-html="storyHtml" class="font-sans text-lg"></div>
        </div>
        <div class="pt-6 text-center">
          <button @click="handleContinueStory" :disabled="isLoading" class="glow-button relative font-serif text-xl bg-background text-accent-primary border-2 border-accent-secondary/50 rounded-lg px-12 py-4 shadow-lg hover:bg-surface-secondary hover:border-accent-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
            <span class="relative z-10">{{ isLoadingStory ? 'Forging...' : 'Forge the Next Chapter' }}</span>
          </button>
        </div>
      </div>
    </main>
  `
});