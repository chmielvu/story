// src/api/gemini.ts
import { 
    GoogleGenAI, 
    Modality, 
    type Chat,
    type Tool,
    type Part,
    type GenerateContentResponse,
} from '@google/genai';
import { 
    DIRECTOR_SYSTEM_INSTRUCTION,
    createDirectorPrompt,
    STORY_GENERATION_MODEL, 
    TTS_SYNTHESIS_MODEL, 
    IMAGE_MODEL, 
    IMAGE_EDIT_MODEL,
    NARRATIVE_AGENT_TOOLS,
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

export function createInitialCharacterPrompt(archetype: typeof ARCHETYPE_DATABASE.archetypes[0]): NanoBananaPrompt {
    return {
        scene_id: `${archetype.archetypeId}_portrait_v1`,
        style: "chiaroscuro_painterly",
        technical: { 
            camera_angle: "eye_level_neutral", 
            compositional_anchor: "painterly_renaissance_composition", 
            focal_length_mm: 85, 
            aperture: "f/2.2" 
        },
        materials: ["aged_velvet", "tarnished_bronze", "renaissance_oil_paint_texture"],
        environment: { setting: "A dark, minimalist background to emphasize the subject." },
        lighting: { 
            style: "rembrandt_hatch_lighting", 
            color_palette: "Warm, single-source light against oppressive darkness." 
        },
        characters: [{
            character_id: archetype.archetypeId,
            pose: 'neutral_stance',
            expression: 'neutral_expression',
            costume_id: `${archetype.archetypeId}_default_attire`
        }],
        props: archetype.visual_profile.prop ? [archetype.visual_profile.prop] : [],
        quality: "4K_painterly_render"
    };
}


export async function generateImageFromPrompt(prompt: NanoBananaPrompt): Promise<{ base64: string; mimeType: string; imageUrl: string }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const descriptiveTextPrompt = `Generate a high-fidelity, photo-realistic image. Adhere strictly to the following JSON specification for the scene's composition, character, and lighting: ${JSON.stringify(prompt, null, 2)}`;

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
    const response = await ai.models.generateContent({
        model: IMAGE_EDIT_MODEL,
        contents: {
            parts: [
                { inlineData: { data: imageBase64, mimeType: imageMimeType } },
                { text: editPrompt },
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
                tools: NARRATIVE_AGENT_TOOLS as Tool[],
            }
        });

        const stream = await chat.sendMessageStream({ message: directorPrompt });

        let accumulatedSsml = '';
        let metadataPayload: AIPayloadMetadata = {
            agentInvocations: [],
            updatedNarrativeState: tempState,
            userChoices: [],
            characterEdits: [],
        };

        for await (const chunk of stream) {
            accumulatedSsml += chunk.text;
            onTextChunk(accumulatedSsml);

            const functionCalls = chunk.functionCalls;
            if (functionCalls && functionCalls.length > 0) {
                for (const funcCall of functionCalls) {
                    metadataPayload.agentInvocations.push({
                        agentName: "Director",
                        context: `Calling function ${funcCall.name}`,
                        action: JSON.stringify(funcCall.args),
                        retrievedTriples: []
                    });

                    if (funcCall.name === "updateCharacterState") {
                        const { characterId, property, value } = funcCall.args as { characterId: string, property: keyof typeof tempState.Characters[string], value: string };
                        if (tempState.Characters[characterId]) {
                            (tempState.Characters[characterId] as any)[property] = value;
                        }
                    }

                    if (funcCall.name === "generateUserChoices") {
                        metadataPayload.userChoices = (funcCall.args as { choices: UserChoice[] }).choices;
                    }

                    if (funcCall.name === "generateSceneImagePrompt") {
                        const prompt = funcCall.args as NanoBananaPrompt;
                        metadataPayload.scenePrompt = prompt;
                        if (prompt.edit_parameters?.base_image_id) {
                            metadataPayload.characterEdits?.push({
                                base_image_id: prompt.edit_parameters.base_image_id,
                                edit_prompt: prompt.edit_parameters.edit_prompt
                            });
                        }
                    }
                }
            }
        }
        
        metadataPayload.updatedNarrativeState = tempState; // Final mutated state
        onMetadata(metadataPayload);
        onComplete();

    } catch (error) {
        console.error("Error during story generation stream:", error);
        onError(error instanceof Error ? error : new Error('An unknown streaming error occurred'));
    }
}


export async function batchGenerateInitialPortraits(characterIds: string[]): Promise<Record<string, { imageUrl: string, errorMessage?: string }>> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const archetypesToProcess = ARCHETYPE_DATABASE.archetypes.filter(arch => characterIds.includes(arch.archetypeId));

    const portraitPromises = archetypesToProcess.map(archetype => {
        const descriptiveTextPrompt = `Generate a high-fidelity, photo-realistic image. Adhere strictly to the following JSON specification: ${JSON.stringify(createInitialCharacterPrompt(archetype))}`;
        
        return ai.models.generateContent({
            model: IMAGE_MODEL,
            contents: { parts: [{ text: descriptiveTextPrompt }] },
            config: { responseModalities: [Modality.IMAGE] },
        });
    });

    if (portraitPromises.length === 0) return {};

    const settledResults = await Promise.allSettled(portraitPromises);
    
    const results: Record<string, { imageUrl: string, errorMessage?: string }> = {};
    
    settledResults.forEach((result, index) => {
        const archetype = archetypesToProcess[index];
        const key = archetype.displayName.match(/\(([^)]+)\)/)?.[1] || archetype.displayName;

        if (result.status === 'fulfilled') {
            const response: GenerateContentResponse = result.value;
            const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

            if (imagePart?.inlineData) {
                const { data, mimeType } = imagePart.inlineData;
                results[key] = { imageUrl: `data:${mimeType};base64,${data}` };
            } else {
                results[key] = { imageUrl: '', errorMessage: `No image data received for ${key}.` };
            }
        } else {
            console.error(`Failed to generate portrait for ${key}:`, result.reason);
            results[key] = { imageUrl: '', errorMessage: `Failed to generate portrait for ${key}.` };
        }
    });

    return results;
}

export async function generateProceduralCharacter(seed: number, primaryArchetypeId: string): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Script remains the same...
    const proceduralScript = `...`; // Elided for brevity, same as before
    
    // Bug Fix: Instruct the model to return a JSON object directly for more reliable parsing.
    const prompt = `
You are a deterministic data generator. You will be given a Python script.
Execute this script *exactly as written* using the code_execution tool.
Do not modify it. Do not analyze it. Just execute it.
The script will print a Python dictionary. Your task is to convert this dictionary into a valid JSON string and output ONLY that JSON string.

Here is the script:
\`\`\`python
${proceduralScript}
\`\`\`
`;
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { tools: [{ codeExecution: {} }] }
        });
        const jsonResult = JSON.parse(result.text);
        return jsonResult;
    } catch (e) {
        console.error("Error running procedural generator:", e);
        return { error: "Failed to execute or parse procedural script." };
    }
}
