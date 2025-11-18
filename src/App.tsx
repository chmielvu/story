

import { useState, useEffect, useRef, useCallback } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CharacterImage } from './components/CharacterImage';
import { Button } from './components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { parseSSMLToHTML, parseAndPlayScript } from './utils/parser';
import { 
    continueStoryStream, 
    generateImageFromPrompt, 
    editImage,
    batchGenerateInitialPortraits,
    type AIPayloadMetadata,
    type NanoBananaPrompt,
    type UserChoice,
} from './api/gemini';
import { ARCHETYPE_DATABASE, INITIAL_NARRATIVE_STATE, type NarrativeState, type CharacterState } from './constants';
import { stopAllAudio, initAudio, playTransitionSound, playAmbientInfrasound } from './utils/audio';

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

const Loader = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 animate-spin"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);


export function App() {
  const [narrativeState, setNarrativeState] = useState<NarrativeState>(INITIAL_NARRATIVE_STATE);
  const [storyHtml, setStoryHtml] = useState(`<p class="text-text-primary">The final, shuddering gasp had been wrenched from him minutes ago, but Selene was in no hurry. Jared stood braced against the mahogany desk, his knuckles white, his body a wrecked, sweat-slicked canvas of her artistry. The air in her study, thick with the scent of old leather and ozone from the storm raging outside, tasted of his humiliation.</p><p class="dialogue speaker-selene"><strong>Selene:</strong> "Breathe,"</p><p> she commanded, her voice a low contralto that vibrated through the floorboards. </p><p class="dialogue speaker-selene"><strong>Selene:</strong> "I'm not finished with my analysis."</p>`);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mainSceneImageUrl, setMainSceneImageUrl] = useState('');
  const [isMainSceneLoading, setIsMainSceneLoading] = useState(true);
  const [mainSceneErrorMessage, setMainSceneErrorMessage] = useState('');
  const [userChoices, setUserChoices] = useState<UserChoice[]>([]);
  const storyContainer = useRef<HTMLDivElement | null>(null);

  const [characterPortraits, setCharacterPortraits] = useState<Record<string, CharacterPortrait>>(() => {
    const initialCharacterIds = Object.keys(INITIAL_NARRATIVE_STATE.Characters);
    return Object.fromEntries(
      ARCHETYPE_DATABASE.archetypes
        .filter(arch => initialCharacterIds.includes(arch.archetypeId))
        .map(arch => {
          const state = INITIAL_NARRATIVE_STATE.Characters[arch.archetypeId];
          // BUG FIX: Keying by `displayName.split(" ")[0]` caused collisions (e.g., "The Guardian" and "The Provost" both became "The").
          // The new key is the name in parentheses (e.g., "Selene") for uniqueness.
          const uniqueKey = arch.displayName.match(/\(([^)]+)\)/)?.[1] || arch.displayName;
          return [
            uniqueKey, 
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
    );
  });

  const getStoryTextOnly = useCallback(() => {
    const div = document.createElement('div');
    div.innerHTML = storyHtml;
    return div.textContent || div.innerText || '';
  }, [storyHtml]);

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
      reader.readAsDataURL(blob);
    });
  };

  const continueStory = useCallback(async (userChoicePrompt?: string) => {
    if (isLoading) return;

    setIsLoading(true);
    setIsTransitioning(true);
    setUserChoices([]);
    stopAllAudio();
    playTransitionSound();

    let fullSsml = '';
    let storyAddition = '';

    await continueStoryStream({
      currentState: narrativeState,
      continuationPoint: getStoryTextOnly(),
      userChoicePrompt,
      onTextChunk: (textChunk) => {
        if (isTransitioning) setIsTransitioning(false);
        fullSsml = `<speak>${textChunk}</speak>`;
        const newHtml = parseSSMLToHTML(textChunk);
        setStoryHtml(prev => prev + newHtml.substring(storyAddition.length));
        storyAddition = newHtml;
      },
      onMetadata: async (metadata: AIPayloadMetadata) => {
        console.log("Metadata received:", metadata);
        
        if (metadata.updatedNarrativeState) {
          setNarrativeState(metadata.updatedNarrativeState);
          setCharacterPortraits(prev => {
              const newPortraits = { ...prev };
              let hasChanges = false;
              for(const [charId, charState] of Object.entries(metadata.updatedNarrativeState.Characters)) {
                  const portraitKey = Object.keys(newPortraits).find(key => newPortraits[key].id === charId);
                  if(portraitKey && charState.pose && newPortraits[portraitKey].pose !== charState.pose) {
                      newPortraits[portraitKey] = {
                          ...newPortraits[portraitKey],
                          pose: charState.pose
                      };
                      hasChanges = true;
                  }
              }
              return hasChanges ? newPortraits : prev;
          });
        }

        if (metadata.scenePrompt) {
          setIsMainSceneLoading(true);
          setMainSceneErrorMessage('');
          try {
            const { imageUrl } = await generateImageFromPrompt(metadata.scenePrompt);
            setMainSceneImageUrl(imageUrl);
          } catch (e) {
            setMainSceneErrorMessage('Failed to generate main scene.');
          } finally {
            setIsMainSceneLoading(false);
          }
        }
        
        if (metadata.characterEdits && metadata.characterEdits.length > 0) {
          for (const edit of metadata.characterEdits) {
            const portraitKey = Object.keys(characterPortraits).find(key => characterPortraits[key].id === edit.base_image_id);
            if (portraitKey && characterPortraits[portraitKey].imageUrl) {
              setCharacterPortraits(prev => ({ ...prev, [portraitKey]: { ...prev[portraitKey], isEditing: true }}));
              try {
                const { base64, mimeType } = await urlToBase64(characterPortraits[portraitKey].imageUrl);
                const editedImage = await editImage(base64, mimeType, edit.edit_prompt);
                setCharacterPortraits(prev => ({ ...prev, [portraitKey]: { ...prev[portraitKey], imageUrl: editedImage.imageUrl }}));
              } catch (e) {
                setCharacterPortraits(prev => ({ ...prev, [portraitKey]: { ...prev[portraitKey], errorMessage: `Failed to edit portrait.` }}));
              } finally {
                setCharacterPortraits(prev => ({ ...prev, [portraitKey]: { ...prev[portraitKey], isEditing: false }}));
              }
            }
          }
        }

        if (metadata.userChoices) {
          setUserChoices(metadata.userChoices);
        }
      },
      onComplete: async () => {
        await parseAndPlayScript(fullSsml);
        setIsLoading(false);
      },
      onError: (error) => {
        console.error("Story continuation error:", error);
        setIsLoading(false);
        setIsTransitioning(false);
      }
    });
  }, [isLoading, narrativeState, getStoryTextOnly, isTransitioning, characterPortraits]);

  useEffect(() => {
    if (storyContainer.current) {
      storyContainer.current.scrollTop = storyContainer.current.scrollHeight;
    }
  }, [storyHtml]);
  
  const handleChoice = (choice: UserChoice) => {
    continueStory(choice.prompt);
  };

  useEffect(() => {
    initAudio();
    playAmbientInfrasound();

    const fetchInitialData = async () => {
        const activeChars = Object.keys(INITIAL_NARRATIVE_STATE.Characters);
        const portraitResults = await batchGenerateInitialPortraits(activeChars);
        setCharacterPortraits(prev => {
            const newPortraits = { ...prev };
            for (const name in portraitResults) {
                if (newPortraits[name]) {
                    const result = portraitResults[name];
                    newPortraits[name].imageUrl = result.imageUrl;
                    newPortraits[name].errorMessage = result.errorMessage || '';
                    newPortraits[name].isLoading = false;
                }
            }
            return newPortraits;
        });

        const initialScenePrompt: NanoBananaPrompt = {
            scene_id: "scene_01_initial_v2",
            style: "renaissance_brutalism",
            technical: {
                camera_angle: "low_angle_power",
                compositional_anchor: "painterly_renaissance_composition",
                focal_length_mm: 35,
                aperture: "f/2.8"
            },
            materials: ["raw_decaying_roman_concrete", "aged_velvet", "sweat_sheen", "tarnished_bronze"],
            environment: {
                setting: "An opulent, decaying study with vast, echoing halls and monumental arches. A storm rages outside a towering window."
            },
            lighting: {
                style: "chiaroscuro_extreme_gentileschi",
                color_palette: "A single, harsh shaft of lightning from the window illuminates the scene; otherwise, oppressive darkness."
            },
            characters: [
                {
                    character_id: "FACULTY_PROVOST",
                    pose: "dominant_stance_overlooking",
                    expression: "sadistic_smirk_amused",
                    costume_id: "selene_crimson_tunic_v1"
                },
                {
                    character_id: "SUBJECT_GUARDIAN",
                    pose: "vulnerable_crouch_shame",
                    expression: "broken_despair_trauma",
                    costume_id: "jared_simple_tunic_v1"
                }
            ],
            quality: "8K_cinematic_render"
        };
        try {
            const { imageUrl } = await generateImageFromPrompt(initialScenePrompt);
            setMainSceneImageUrl(imageUrl);
        } catch (e) {
            setMainSceneErrorMessage('Failed to generate initial scene.');
        } finally {
            setIsMainSceneLoading(false);
        }
    };
    fetchInitialData();
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground font-serif flex flex-col items-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <main className="lg:col-span-9">
            <Card className="bg-card/80 backdrop-blur-sm shadow-2xl overflow-hidden flex flex-col" style={{ 'boxShadow': '0 25px 50px -12px var(--shadow-color)' }}>
              <CardHeader className="border-b">
                <CardTitle className="font-serif text-3xl sm:text-4xl text-primary tracking-wider">The Forge's Loom</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <CharacterImage 
                  imageUrl={mainSceneImageUrl} 
                  isLoading={isMainSceneLoading} 
                  errorMessage={mainSceneErrorMessage}
                />
              </CardContent>
              <CardContent ref={storyContainer} className="flex-grow p-6 sm:p-8 overflow-y-auto relative" style={{maxHeight: '40vh'}}>
                  <div className={`story-text text-secondary-foreground text-lg ${isTransitioning ? 'story-transitioning' : ''}`} dangerouslySetInnerHTML={{ __html: storyHtml }}/>
              </CardContent>
              <CardFooter className="p-6 border-t bg-secondary/50 flex flex-col items-center justify-center space-y-4 min-h-[120px]">
                {userChoices.length > 0 && !isLoading ? (
                  <div className="w-full flex flex-col sm:flex-row justify-center gap-4">
                     {userChoices.map((choice, index) => (
                       <Button key={index} onClick={() => handleChoice(choice)} variant="outline" size="lg" className="glow-button flex-grow z-10 text-accent-foreground">
                         {choice.text}
                       </Button>
                     ))}
                  </div>
                ) : (
                  <Button onClick={() => continueStory()} disabled={isLoading} size="lg" className="glow-button z-10 w-full sm:w-1/2">
                    {isLoading ? (
                      <>
                        <Loader />
                        <span className="ml-3">Weaving Fate...</span>
                      </>
                    ) : (
                      <span>Continue the Agony</span>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </main>

          <aside className="lg:col-span-3 space-y-6">
            {/* FIX: Explicitly typing `portrait` resolves a type inference issue with Object.values in this context. */}
            {Object.values(characterPortraits).map((portrait: CharacterPortrait) => (
              <Card key={portrait.id} className="bg-card/80 backdrop-blur-sm shadow-lg transition-all duration-500">
                 <CardHeader>
                    <CardTitle className="font-serif text-xl text-secondary-foreground">{portrait.displayName}</CardTitle>
                 </CardHeader>
                 <CardContent className="p-0">
                   <CharacterImage 
                      imageUrl={portrait.imageUrl} 
                      isLoading={portrait.isLoading} 
                      isEditing={portrait.isEditing} 
                      errorMessage={portrait.errorMessage} 
                      className="aspect-square rounded-md"
                    />
                 </CardContent>
                 <CardFooter className="p-4 mt-3 bg-secondary/50 rounded-b-lg text-xs flex flex-col items-start">
                    <p className="text-muted-foreground italic">"{portrait.description}"</p>
                    <p className="text-foreground mt-1 border-t border-border pt-1 w-full"><strong className="text-primary">Pose:</strong> {portrait.pose}</p>
                 </CardFooter>
              </Card>
            ))}
          </aside>

        </div>
      </div>
    </ErrorBoundary>
  )
}
