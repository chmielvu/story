
import { useState, useEffect, useRef, useCallback } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CharacterImage } from './components/CharacterImage';
import { Button } from './components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { parseSSMLToHTML, parseAndPlayScript } from './utils/parser';
import { 
    continueStoryStream, 
    generateImageFromPrompt, 
    type AIPayloadMetadata,
    type NanoBananaPrompt,
    type UserChoice,
} from './api/gemini';
import { INITIAL_NARRATIVE_STATE, type NarrativeState } from './constants';
import { stopAllAudio, initAudio, playTransitionSound, playAmbientInfrasound } from './utils/audio';

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
  const [narrativeState, setNarrativeState] = useState<NarrativeState>(() => {
    const saved = localStorage.getItem('forge_kgot');
    return saved ? JSON.parse(saved) : INITIAL_NARRATIVE_STATE;
  });
  const [storyHtml, setStoryHtml] = useState(`<p class="text-text-primary">The final, shuddering gasp had been wrenched from him minutes ago, but Selene was in no hurry. Jared stood braced against the mahogany desk, his knuckles white, his body a wrecked, sweat-slicked canvas of her artistry. The air in her study, thick with the scent of old leather and ozone from the storm raging outside, tasted of his humiliation.</p><p class="dialogue speaker-selene"><strong>Selene:</strong> "Breathe,"</p><p> she commanded, her voice a low contralto that vibrated through the floorboards. </p><p class="dialogue speaker-selene"><strong>Selene:</strong> "I'm not finished with my analysis."</p>`);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mainSceneImageUrl, setMainSceneImageUrl] = useState('');
  const [isMainSceneLoading, setIsMainSceneLoading] = useState(true);
  const [mainSceneErrorMessage, setMainSceneErrorMessage] = useState('');
  const [userChoices, setUserChoices] = useState<UserChoice[]>([]);
  const storyContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem('forge_kgot', JSON.stringify(narrativeState));
  }, [narrativeState]);

  const getStoryTextOnly = useCallback(() => {
    const div = document.createElement('div');
    div.innerHTML = storyHtml;
    return div.textContent || div.innerText || '';
  }, [storyHtml]);

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
  }, [isLoading, narrativeState, getStoryTextOnly, isTransitioning]);

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
        <div className="w-full max-w-screen-xl mx-auto grid grid-cols-1 gap-8">
          
          <main className="w-full">
            <Card className="bg-card/80 backdrop-blur-sm shadow-2xl overflow-hidden flex flex-col min-h-[85vh]" style={{ 'boxShadow': '0 25px 50px -12px var(--shadow-color)' }}>
              <CardHeader className="border-b">
                <CardTitle className="font-serif text-3xl sm:text-4xl text-primary tracking-wider text-center">The Forge's Loom</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <CharacterImage 
                  imageUrl={mainSceneImageUrl} 
                  isLoading={isMainSceneLoading} 
                  errorMessage={mainSceneErrorMessage}
                  className="w-full aspect-video sm:aspect-[21/9] object-top"
                />
              </CardContent>
              <CardContent ref={storyContainer} className="flex-grow p-8 sm:p-12 overflow-y-auto relative max-h-[50vh]">
                  <div className={`story-text text-secondary-foreground text-xl leading-relaxed ${isTransitioning ? 'story-transitioning' : ''}`} dangerouslySetInnerHTML={{ __html: storyHtml }}/>
              </CardContent>
              <CardFooter className="p-8 border-t bg-secondary/50 flex flex-col items-center justify-center space-y-6 min-h-[140px]">
                {userChoices.length > 0 && !isLoading ? (
                  <div className="w-full flex flex-col sm:flex-row justify-center gap-6">
                     {userChoices.map((choice, index) => (
                       <Button key={index} onClick={() => handleChoice(choice)} variant="outline" size="lg" className="glow-button flex-grow z-10 text-accent-foreground py-6 text-lg">
                         {choice.text}
                       </Button>
                     ))}
                  </div>
                ) : (
                  <Button onClick={() => continueStory()} disabled={isLoading} size="lg" className="glow-button z-10 w-full sm:w-2/3 py-6 text-lg">
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

        </div>
      </div>
    </ErrorBoundary>
  )
}
