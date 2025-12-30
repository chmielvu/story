
// src/api/gemini.ts
import { 
    GoogleGenAI, 
    Modality, 
    Type,
    FunctionCallingConfigMode,
    type Chat,
    type Tool,
    type GenerateContentResponse,
} from '@google/genai';
import { 
    DIRECTOR_SYSTEM_INSTRUCTION,
    createDirectorPrompt,
    STORY_GENERATION_MODEL, 
    TTS_SYNTHESIS_MODEL, 
    IMAGE_MODEL, 
    IMAGE_EDIT_MODEL,
    type NarrativeState,
    ARCHETYPE_DATABASE,
} from '../constants';
import { 
    decode, 
    decodeAudioData, 
    audioState,
    initAudio,
    queueAudio
} from '../utils/audio';
import { VISUAL_MANDATE } from '../config/visualMandate';

// --- TYPES (for internal API use) ---
// This is the full v3.1 schema for Nano Banana, enabling detailed visual control.
export interface NanoBananaPrompt {
    scene_id: string;
    style: "renaissance_brutalism" | "erotic_dark_academia" | "vampire_noir" | "chiaroscuro_painterly" | "gothic_decay";
    technical: {
        camera_angle: "low_angle_power" | "eye_level_neutral" | "high_angle_vulnerable" | "below_foot_perspective" | "dutch_angle_unstable" | "intimate_low_angle_reading";
        compositional_anchor: "human_vs_architecture_juxtaposition" | "statue_juxtaposition" | "intimate_two_shot_steam" | "rule_of_thirds_neutral" | "mirror_foreground_reflection" | "painterly_renaissance_composition";
        focal_length_mm: number;
        aperture: string;
    };
    materials: string[];
    environment: {
        setting: string;
    };
    lighting: {
        style: string;
        color_palette: string;
    };
    characters: {
        character_id: string;
        pose: string;
        expression: string;
        costume_id: string;
    }[];
    props?: string[];
    quality: "8K_cinematic_render" | "4K_painterly_render" | "filmic_grain_high" | "filmic_grain_low";
    edit_parameters?: {
        base_image_id: string;
        edit_prompt: string;
    };
}


export interface UserChoice {
    text: string;
    prompt: string;
}

export interface CharacterEdit {
    base_image_id: string;
    edit_prompt: string;
}


export interface AgentInvocation {
    agentName: string;
    context: string;
    action: string;
    retrievedTriples: string[];
}
export interface AIPayloadMetadata {
    scenePrompt?: NanoBananaPrompt;
    agentInvocations: AgentInvocation[];
    updatedNarrativeState: NarrativeState;
    characterEdits?: CharacterEdit[];
    userChoices?: UserChoice[];
}
export interface StreamCallbacks {
    currentState: NarrativeState;
    continuationPoint: string;
    userChoicePrompt?: string;
    onTextChunk: (text: string) => void;
    onMetadata: (metadata: AIPayloadMetadata) => void;
    onComplete: () => void;
    onError: (error: Error) => void;
}

// --- HELPERS ---
const NAME_TO_ID: Record<string, string> = {
    "Selene": "FACULTY_PROVOST",
    "Provost": "FACULTY_PROVOST",
    "Lysandra": "FACULTY_LOGICIAN",
    "Logician": "FACULTY_LOGICIAN",
    "Petra": "FACULTY_INQUISITOR",
    "Inquisitor": "FACULTY_INQUISITOR",
    "Calista": "FACULTY_CONFESSOR",
    "Confessor": "FACULTY_CONFESSOR",
    "Elara": "PREFECT_LOYALIST",
    "Loyalist": "PREFECT_LOYALIST",
    "Jared": "SUBJECT_GUARDIAN",
    "Guardian": "SUBJECT_GUARDIAN",
};

// --- TOOLS DEFINITION ---
const TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "updateKgotState",
        description: "Persist new triples into the Knowledge Graph of Thoughts. Triples typically look like '<Character, property, value>'.",
        parameters: { 
            type: Type.OBJECT, 
            properties: { 
                new_triples: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING } 
                } 
            }, 
            required: ["new_triples"] 
        }
      },
      {
        name: "generateNarrativeSSML",
        description: "Generate the scene narration text in SSML format.",
        parameters: { 
            type: Type.OBJECT, 
            properties: { 
                ssml: { 
                    type: Type.STRING, 
                    description: "The narrative content using tags like <narrator>, <dialogue>, <abyss>." 
                } 
            }, 
            required: ["ssml"] 
        }
      },
      {
        name: "generateNanoBananaJSON",
        description: "Generate or edit scene using full v6 Nano Banana schema with consistency_token",
        parameters: { 
            type: Type.OBJECT, 
            properties: { 
                prompt: { 
                    type: Type.OBJECT,
                    properties: {
                        scene_id: { type: Type.STRING },
                        style: { type: Type.STRING },
                        technical: { type: Type.OBJECT },
                        materials: { type: Type.ARRAY, items: { type: Type.STRING } },
                        environment: { type: Type.OBJECT },
                        lighting: { type: Type.OBJECT },
                        characters: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                        props: { type: Type.ARRAY, items: { type: Type.STRING } },
                        quality: { type: Type.STRING },
                        edit_parameters: { type: Type.OBJECT }
                    },
                    required: ["scene_id", "style"]
                } 
            }, 
            required: ["prompt"] 
        }
      },
      {
        name: "generateUserChoices",
        description: "Always generate 2-3 psychologically meaningful choices for the user to influence the story path.",
        parameters: { 
            type: Type.OBJECT, 
            properties: { 
                choices: { 
                    type: Type.ARRAY, 
                    items: { 
                        type: Type.OBJECT, 
                        properties: { 
                            text: { type: Type.STRING }, 
                            prompt: { type: Type.STRING } 
                        }, 
                        required: ["text", "prompt"] 
                    } 
                } 
            }, 
            required: ["choices"] 
        }
      },
      {
        name: "selfCritique",
        description: "Report the coherence and novelty analysis.",
        parameters: { 
            type: Type.OBJECT, 
            properties: {
                score: { type: Type.NUMBER, description: "Coherence/novelty score 0.00-1.00" },
                reasoning: { type: Type.STRING, description: "Brief justification for the score" }
            }, 
            required: ["score"] 
        }
      }
    ]
  }
];

// --- CORE API CALLS ---
export async function performAndSynthesizeAudio(ssmlFragment: string, voiceKey: string): Promise<void> {
    if (!ssmlFragment.trim()) return;
    
    initAudio();
    
    const fullSSML = `<speak>${ssmlFragment}</speak>`;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const synthesisResponse = await ai.models.generateContent({
            model: TTS_SYNTHESIS_MODEL,
            contents: [{ parts: [{ text: fullSSML }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceKey } },
                },
            },
        });
        
        const base64Audio = synthesisResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio && audioState.outputAudioContext) {
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioState.outputAudioContext, 24000, 1);
            queueAudio(audioBuffer);
        }
    } catch(e) {
        console.error(`Failed to synthesize audio with voice ${voiceKey}:`, e);
    }
}

export async function generateImageFromPrompt(prompt: NanoBananaPrompt): Promise<{ base64: string; mimeType: string; imageUrl: string }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // UPLIFTED PROMPT GENERATION
    const descriptiveTextPrompt = `
${VISUAL_MANDATE.ZERO_DRIFT_HEADER}

SCENE SPECIFICATION (JSON):
${JSON.stringify(prompt, null, 2)}

MANDATORY STYLE GUIDE:
${VISUAL_MANDATE.STYLE}
${VISUAL_MANDATE.MOOD}
Technical: ${JSON.stringify(VISUAL_MANDATE.TECHNICAL)}

NEGATIVE PROMPT:
${VISUAL_MANDATE.NEGATIVE_PROMPT}
    `.trim();

    const response = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: { parts: [{ text: descriptiveTextPrompt }] },
        config: { responseModalities: [Modality.IMAGE] },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (imagePart?.inlineData) {
        const { data: base64, mimeType } = imagePart.inlineData;
        return { base64, mimeType, imageUrl: `data:${mimeType};base64,${base64}` };
    }
    throw new Error('No image data received from Gemini.');
}

export async function editImage(imageBase64: string, imageMimeType: string, editPrompt: string): Promise<{ base64: string; mimeType: string; imageUrl: string }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const upliftedEditPrompt = `
${VISUAL_MANDATE.ZERO_DRIFT_HEADER}
EDIT INSTRUCTION: ${editPrompt}
NEGATIVE PROMPT: ${VISUAL_MANDATE.NEGATIVE_PROMPT}
    `.trim();

    const response = await ai.models.generateContent({
        model: IMAGE_EDIT_MODEL,
        contents: {
            parts: [
                { inlineData: { data: imageBase64, mimeType: imageMimeType } },
                { text: upliftedEditPrompt },
            ],
        },
        config: { responseModalities: [Modality.IMAGE] },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (imagePart?.inlineData) {
        const { data: base64, mimeType } = imagePart.inlineData;
        return { base64, mimeType, imageUrl: `data:${mimeType};base64,${base64}` };
    }
    throw new Error('No edited image data received.');
}

export async function continueStoryStream(callbacks: StreamCallbacks): Promise<void> {
    const { currentState, continuationPoint, onTextChunk, onMetadata, onComplete, onError, userChoicePrompt } = callbacks;
    
    // Deep clone the state to avoid mutation issues.
    const tempState: NarrativeState = JSON.parse(JSON.stringify(currentState));

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const directorPrompt = createDirectorPrompt(tempState, continuationPoint, userChoicePrompt);

    try {
        const chat: Chat = ai.chats.create({
            model: STORY_GENERATION_MODEL,
            config: {
                systemInstruction: DIRECTOR_SYSTEM_INSTRUCTION,
                tools: TOOLS,
                toolConfig: { functionCallingConfig: { mode: FunctionCallingConfigMode.ANY } }, // Force tool use
            }
        });

        const stream = await chat.sendMessageStream({ message: directorPrompt });

        let metadataPayload: AIPayloadMetadata = {
            agentInvocations: [],
            updatedNarrativeState: tempState,
            userChoices: [],
            characterEdits: [],
        };

        for await (const chunk of stream) {
            const functionCalls = chunk.functionCalls;
            if (functionCalls && functionCalls.length > 0) {
                for (const funcCall of functionCalls) {
                    
                    // Log the invocation
                    metadataPayload.agentInvocations.push({
                        agentName: "MoMA_Director",
                        context: `Calling ${funcCall.name}`,
                        action: JSON.stringify(funcCall.args),
                        retrievedTriples: []
                    });

                    // 1. Narrative SSML Generator
                    if (funcCall.name === "generateNarrativeSSML") {
                        const args = funcCall.args as { ssml: string };
                        onTextChunk(args.ssml);
                    }

                    // 2. KGoT State Updater
                    if (funcCall.name === "updateKgotState") {
                        const args = funcCall.args as { new_triples: string[] };
                        if (args.new_triples) {
                             args.new_triples.forEach(triple => {
                                // Simple parsing of <Name, Prop, Value>
                                const match = triple.match(/<([^,]+),\s*([^,]+),\s*([^>]+)>/);
                                if (match) {
                                    const name = match[1].trim();
                                    const prop = match[2].trim();
                                    const val = match[3].trim();
                                    
                                    // Map simple name to ID
                                    const charId = NAME_TO_ID[name] || Object.keys(NAME_TO_ID).find(k => k.includes(name));
                                    
                                    if (charId && tempState.Characters[charId]) {
                                        // Extremely basic state update logic
                                        if (prop.includes("pose")) (tempState.Characters[charId] as any).pose = val;
                                        if (prop.includes("mood")) (tempState.Characters[charId] as any).mood = val;
                                        if (prop.includes("health")) (tempState.Characters[charId] as any).health = val;
                                        // For 'arousal', 'trauma' etc, we could store them in a generic 'stats' object if we had one, 
                                        // or mapped them to psych_state. For now, sticking to defined schema.
                                        if (prop.includes("trauma") || prop.includes("arousal")) {
                                            (tempState.Characters[charId] as any).psych_state = `${prop}: ${val}`;
                                        }
                                    } else if (name === "Tension") {
                                         tempState.Tension = val;
                                    }
                                }
                             });
                        }
                    }

                    // 3. User Choices
                    if (funcCall.name === "generateUserChoices") {
                        // The args might come in as { choices: [...] } if we updated the schema, 
                        // or count if following the prompt instructions strictly.
                        // Our TOOL definition uses 'choices' array.
                        // If the model tries to use 'count', we might fail, but we defined the tool with 'choices'.
                        // Let's handle the actual tool definition we wrote.
                        if ((funcCall.args as any).choices) {
                             metadataPayload.userChoices = (funcCall.args as any).choices;
                        }
                    }

                    // 4. Nano Banana Visuals
                    if (funcCall.name === "generateNanoBananaJSON") {
                        const args = funcCall.args as { prompt: NanoBananaPrompt };
                        metadataPayload.scenePrompt = args.prompt;
                        if (args.prompt.edit_parameters?.base_image_id) {
                            metadataPayload.characterEdits?.push({
                                base_image_id: args.prompt.edit_parameters.base_image_id,
                                edit_prompt: args.prompt.edit_parameters.edit_prompt
                            });
                        }
                    }

                    // 5. Self Critique (Optional Handler)
                    if (funcCall.name === "selfCritique") {
                        console.debug("Self Critique:", funcCall.args);
                    }
                }
            }
        }
        
        metadataPayload.updatedNarrativeState = tempState;
        onMetadata(metadataPayload);
        onComplete();

    } catch (error) {
        console.error("Error during story generation stream:", error);
        onError(error instanceof Error ? error : new Error('An unknown streaming error occurred'));
    }
}
