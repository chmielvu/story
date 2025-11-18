/** * @license * SPDX-License-Identifier: Apache-2.0 */

import { ref, defineComponent, onMounted, nextTick } from 'vue';

// --- IMPORTS FROM NEW MODULES ---
import { CharacterImage } from './components/CharacterImage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { parseSSMLToHTML, parseAndPlayScript } from './utils/parser';
import { 
    continueStoryStream, 
    generateImageFromPrompt, 
    editImage,
    createInitialCharacterPrompt,
    type AIPayloadMetadata,
    type NanoBananaPrompt,
    type UserChoice,
} from './api/gemini';
import { ARCHETYPE_DATABASE, NARRATIVE_STATE } from './constants';
import { stopAllAudio, initAudio, playTransitionSound, playAmbientInfrasound } from './utils/audio';

// --- TYPES ---
interface CharacterPortrait {
    id: string;
    displayName: string;
    description: string;
    imageUrl: string;
    isLoading: boolean;
    isEditing: boolean;
    errorMessage: string;
    pose: string;
}

// --- VUE COMPONENTS ---

export const App = defineComponent({
  components: {
    CharacterImage,
    ErrorBoundary
  },
  setup() {
    const storyHtml = ref(`<p class="text-text-primary">The final, shuddering gasp had been wrenched from him minutes ago, but Selene was in no hurry. Jared stood braced against the mahogany desk, his knuckles white, his body a wrecked, sweat-slicked canvas of her artistry. The air in her study, thick with the scent of old leather and ozone from the storm raging outside, tasted of his humiliation.</p><p class="dialogue speaker-selene"><strong>Selene:</strong> "Breathe,"</p><p> she commanded, her voice a low contralto that vibrated through the floorboards. </p><p class="dialogue speaker-selene"><strong>Selene:</strong> "I'm not finished with my analysis."</p>`);
    const storyContainer = ref<HTMLDivElement | null>(null);
    const isLoading = ref(false);
    const isTransitioning = ref(false);
    const currentNarrationScript = ref('');

    // NEW State for Scene Illustration
    const mainSceneImageUrl = ref('');
    const isMainSceneLoading = ref(true);
    const mainSceneErrorMessage = ref('');
    
    // NEW State for User Choices
    const userChoices = ref<UserChoice[]>([]);
    
    // Initialize portraits from the initial narrative state
    const initialCharacterIds = Object.keys(NARRATIVE_STATE.Characters);
    const characterPortraits = ref<Record<string, CharacterPortrait>>(
      Object.fromEntries(
        ARCHETYPE_DATABASE.archetypes
          .filter(arch => initialCharacterIds.includes(arch.archetypeId))
          .map(arch => {
            const state = NARRATIVE_STATE.Characters[arch.archetypeId];
            return [
              arch.displayName.split(" ")[0], 
              {
                id: arch.archetypeId,
                displayName: arch.displayName,
                description: arch.psychology.core_driver,
                imageUrl: '',
                isLoading: true,
                isEditing: false,
                errorMessage: '',
                pose: state?.pose || 'Neutral',
              }
            ]
          })
      )
    );

    const getStoryTextOnly = () => {
        const div = document.createElement('div');
        div.innerHTML = storyHtml.value;
        return div.textContent || div.innerText || '';
    };

    const urlToBase64 = async (url: string): Promise<{ base64: string, mimeType: string }> => {
        const response = await fetch(url);
        const blob = await response.blob();
        const mimeType = blob.type;
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve({ base64, mimeType });
            };
            reader.onerror = reject;
            // FIX: Corrected typo from readDataURL to readAsDataURL.
            reader.readAsDataURL(blob);
        });
    };

    const continueStory = async (userChoicePrompt?: string) => {
        if (isLoading.value) return;

        isLoading.value = true;
        isTransitioning.value = true;
        userChoices.value = [];
        stopAllAudio();
        playTransitionSound();

        currentNarrationScript.value = '';
        let fullSsml = '';
        let lastScrollHeight = 0;
        let storyAddition = '';

        await continueStoryStream({
            continuationPoint: getStoryTextOnly(),
            userChoicePrompt,
            onTextChunk: (textChunk) => {
                if (isTransitioning.value) {
                    isTransitioning.value = false;
                }
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
            onMetadata: async (metadata: AIPayloadMetadata) => {
                console.log("Metadata received:", metadata);
                
                if (metadata.updatedNarrativeState && metadata.updatedNarrativeState.Characters) {
                    // FIX: Using Object.entries ensures charState is correctly typed as CharacterState, fixing property access errors.
                    for(const [charId, charState] of Object.entries(metadata.updatedNarrativeState.Characters)) {
                        // FIX: Explicitly typing 'p' to CharacterPortrait resolves an issue where it was inferred as 'unknown'.
                        const portrait = Object.values(characterPortraits.value).find((p: CharacterPortrait) => p.id === charId);
                        if(portrait && charState.pose) {
                            portrait.pose = charState.pose;
                        }
                    }
                }

                if (metadata.scenePrompt) {
                    isMainSceneLoading.value = true;
                    mainSceneErrorMessage.value = '';
                    try {
                        const { imageUrl } = await generateImageFromPrompt(metadata.scenePrompt);
                        mainSceneImageUrl.value = imageUrl;
                    } catch (e) {
                        mainSceneErrorMessage.value = 'Failed to generate main scene.';
                        console.error(e);
                    } finally {
                        isMainSceneLoading.value = false;
                    }
                }
                
                if (metadata.characterEdits && metadata.characterEdits.length > 0) {
                    for (const edit of metadata.characterEdits) {
                        // FIX: Explicitly typing 'p' to CharacterPortrait resolves an issue where it was inferred as 'unknown', fixing all subsequent errors on 'portraitToEdit'.
                        const portraitToEdit = Object.values(characterPortraits.value).find((p: CharacterPortrait) => p.id === edit.base_image_id);
                        if (portraitToEdit && portraitToEdit.imageUrl) {
                            portraitToEdit.isEditing = true;
                            try {
                                const { base64, mimeType } = await urlToBase64(portraitToEdit.imageUrl);
                                const editedImage = await editImage(base64, mimeType, edit.edit_prompt);
                                portraitToEdit.imageUrl = editedImage.imageUrl;
                            } catch (e) {
                                portraitToEdit.errorMessage = `Failed to edit portrait for ${portraitToEdit.displayName}.`;
                            } finally {
                                portraitToEdit.isEditing = false;
                            }
                        }
                    }
                }

                if (metadata.userChoices) {
                    userChoices.value = metadata.userChoices;
                }
            },
            onComplete: async () => {
                currentNarrationScript.value = fullSsml;
                await parseAndPlayScript(currentNarrationScript.value);
                isLoading.value = false;
            },
            onError: (error) => {
                console.error("Story continuation error:", error);
                isLoading.value = false;
                isTransitioning.value = false;
            }
        });
    };
    
    const handleChoice = (choice: UserChoice) => {
        continueStory(choice.prompt);
    };

    onMounted(async () => {
        initAudio();
        playAmbientInfrasound();

        for (const name in characterPortraits.value) {
            const portrait = characterPortraits.value[name];
            const archetype = ARCHETYPE_DATABASE.archetypes.find(a => a.archetypeId === portrait.id);
            if (archetype) {
                const initialPrompt = createInitialCharacterPrompt(archetype);
                try {
                    const { imageUrl } = await generateImageFromPrompt(initialPrompt);
                    portrait.imageUrl = imageUrl;
                } catch (e) {
                    portrait.errorMessage = `Failed to generate portrait for ${name}.`;
                    console.error(e);
                } finally {
                    portrait.isLoading = false;
                }
            }
        }

        const initialScenePrompt: NanoBananaPrompt = {
            scene_id: "scene_01_initial",
            style: "renaissance_brutalism",
            technical: {
                camera_angle: "low_angle_power",
                compositional_anchor: "painterly_renaissance_composition",
                focal_length_mm: 35,
                aperture: "f/4.0"
            },
            materials: ["aged_velvet", "mahogany_wood", "sweat_sheen", "leather"],
            environment: { setting: "An opulent, decaying study with a large mahogany desk, a storm raging outside a tall window." },
            lighting: { style: "chiaroscuro_extreme_gentileschi", color_palette: "A single, harsh shaft of lightning from a window illuminates the scene, otherwise oppressive darkness." },
            characters: [
                { character_id: "FACULTY_PROVOST", pose: "dominant_stance_overlooking", expression: "sadistic_smirk_amused", costume_id: "selene_crimson_tunic_v1" },
                { character_id: "SUBJECT_GUARDIAN", pose: "vulnerable_crouch_shame", expression: "broken_despair_trauma", costume_id: "jared_simple_tunic_v1" }
            ],
            props: ["goblet_red_wine"],
            quality: "8K_cinematic_render"
        };
        try {
            const { imageUrl } = await generateImageFromPrompt(initialScenePrompt);
            mainSceneImageUrl.value = imageUrl;
        } catch (e) {
            mainSceneErrorMessage.value = 'Failed to generate initial scene.';
        } finally {
            isMainSceneLoading.value = false;
        }
    });

    return {
      storyHtml,
      storyContainer,
      isLoading,
      characterPortraits,
      isTransitioning,
      continueStory,
      mainSceneImageUrl,
      isMainSceneLoading,
      mainSceneErrorMessage,
      userChoices,
      handleChoice,
    };
  },

  template: `
    <ErrorBoundary>
      <div class="min-h-screen bg-background text-text-primary font-serif flex flex-col items-center p-4 sm:p-6 md:p-8">
        <div class="w-full max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <main class="lg:col-span-9 bg-surface-primary/80 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden flex flex-col" :style="{ 'box-shadow': '0 25px 50px -12px var(--shadow-color)' }">
            
            <div class="w-full">
              <h1 class="font-serif text-3xl sm:text-4xl text-accent-primary tracking-wider p-6 sm:p-8 border-b border-border-primary">{{ "The Forge's Loom" }}</h1>
              <CharacterImage 
                :image-url="mainSceneImageUrl" 
                :is-loading="isMainSceneLoading" 
                :error-message="mainSceneErrorMessage"
              />
            </div>
            
            <div ref="storyContainer" class="flex-grow p-6 sm:p-8 overflow-y-auto relative" style="max-height: 40vh;">
              <transition name="fade" mode="out-in">
                <div class="story-text text-text-secondary text-lg" :class="{ 'story-transitioning': isTransitioning }" v-html="storyHtml"></div>
              </transition>
            </div>

            <div class="p-6 border-t border-border-primary bg-surface-secondary/50 flex flex-col items-center justify-center space-y-4 min-h-[120px]">
              <div v-if="userChoices.length > 0 && !isLoading" class="w-full flex flex-col sm:flex-row justify-center gap-4 animate-fade-in">
                 <button v-for="(choice, index) in userChoices" :key="index" @click="handleChoice(choice)"
                      class="glow-button relative z-10 flex-grow px-8 py-3 bg-surface-primary hover:bg-accent-primary/20 text-accent-secondary font-bold rounded-md shadow-lg transition-all duration-300 border border-border-secondary">
                    <span>{{ choice.text }}</span>
                 </button>
              </div>
              
              <button v-else @click="continueStory()" :disabled="isLoading" 
                      class="glow-button relative z-10 w-full sm:w-1/2 px-10 py-4 bg-accent-primary/80 text-background font-bold rounded-md shadow-lg hover:bg-accent-secondary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-secondary flex items-center justify-center space-x-3">
                  <span v-if="!isLoading && userChoices.length === 0">Continue the Agony</span>
                  <div v-if="isLoading" class="flex items-center space-x-3">
                      <div class="w-5 h-5 border-2 border-t-transparent border-background rounded-full animate-spin"></div>
                      <span>Weaving Fate...</span>
                  </div>
              </button>
            </div>
          </main>

          <aside class="lg:col-span-3 space-y-6">
            <div v-for="portrait in Object.values(characterPortraits)" :key="portrait.id" class="bg-surface-primary/80 backdrop-blur-sm rounded-lg shadow-lg p-4 transition-all duration-500">
               <h2 class="font-serif text-xl text-accent-secondary mb-2">{{ portrait.displayName }}</h2>
               <CharacterImage 
                  :image-url="portrait.imageUrl" 
                  :is-loading="portrait.isLoading" 
                  :is-editing="portrait.isEditing" 
                  :error-message="portrait.errorMessage" 
                  class="aspect-square rounded-md"
                />
               <div class="mt-3 p-2 bg-surface-secondary/50 rounded text-xs">
                  <p class="text-text-muted italic">"{{ portrait.description }}"</p>
                  <p class="text-text-primary mt-1 border-t border-border-primary pt-1"><strong class="text-accent-secondary">Pose:</strong> {{ portrait.pose }}</p>
               </div>
            </div>
          </aside>

        </div>
      </div>
    </ErrorBoundary>
  `
});