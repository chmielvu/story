// src/api/gemini.ts

import { GoogleGenAI, Modality } from '@google/genai';
import { 
    DIRECTOR_SYSTEM_INSTRUCTION,
    createDirectorPrompt,
    STORY_GENERATION_MODEL, 
    TTS_SYNTHESIS_MODEL, 
    IMAGE_MODEL, 
    IMAGE_EDIT_MODEL,
    VOICE_PROFILE_TO_GEMINI_VOICE,
    NARRATIVE_STATE,
    type NarrativeState,
    type ARCHETYPE_DATABASE,
} from '../constants';
import { 
    decode, 
    decodeAudioData, 
    audioState,
    initAudio,
    queueAudio
} from '../utils/audio';

// --- TYPES (for internal API use) ---

// NEW: Represents the structured JSON prompt for gemini-flash-image
// Based on "Nano Banana ACP: Full JSON Schema (v3.1)"
export interface NanoBananaPrompt {
    scene_id: string;
    style: "renaissance_brutalism" | "erotic_dark_academia" | "vampire_noir" | "chiaroscuro_painterly" | "gothic_decay";
    technical: {
        camera_angle: string;
        compositional_anchor: string;
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
    props: string[];
    quality: string;
    edit_parameters?: {
        base_image_id: string;
        edit_prompt: string;
    };
}

// FIX: Added UserChoice and CharacterEdit interfaces to correctly type the API payload.
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
    // FIX: Renamed imagePrompt to scenePrompt for consistency and added other expected properties.
    scenePrompt?: NanoBananaPrompt;
    agentInvocations: AgentInvocation[];
    updatedNarrativeState: NarrativeState;
    characterEdits?: CharacterEdit[];
    userChoices?: UserChoice[];
}
export interface StreamCallbacks {
    continuationPoint: string;
    // FIX: Added optional userChoicePrompt property.
    userChoicePrompt?: string;
    onTextChunk: (text: string) => void;
    onMetadata: (metadata: AIPayloadMetadata) => void;
    onComplete: () => void;
    onError: (error: Error) => void;
}


// --- CORE API CALLS ---

export async function performAndSynthesizeAudio(ssmlFragment: string, voiceKey: string): Promise<void> {
    if (!ssmlFragment.trim()) return;
    
    initAudio(); // Ensure context is running
    
    const fullSSML = `<speak>${ssmlFragment}</speak>`;
    
    const voice = voiceKey; 
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
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
        if (base64Audio && audioState.outputAudioContext) {
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioState.outputAudioContext, 24000, 1);
            queueAudio(audioBuffer);
        }
    } catch(e) {
        console.error(`Failed to synthesize audio with voice ${voice}:`, e);
    }
}

// NEW: Builds the structured JSON prompt for a character's initial portrait.
export function createInitialCharacterPrompt(archetype: typeof ARCHETYPE_DATABASE.archetypes[0]): NanoBananaPrompt {
    const state = NARRATIVE_STATE.Characters[archetype.archetypeId];
    return {
        scene_id: `${archetype.archetypeId}_portrait_v1`,
        style: "renaissance_brutalism",
        technical: {
            camera_angle: "eye_level_neutral",
            compositional_anchor: "painterly_renaissance_composition",
            focal_length_mm: 85,
            aperture: "f/2.2"
        },
        materials: ["aged_velvet", "tarnished_bronze", "renaissance_oil_paint_texture"],
        environment: {
            setting: "opulent_parlor_decaying"
        },
        lighting: {
            style: "chiaroscuro_extreme_gentileschi",
            color_palette: "warm_candlelight_against_decaying_marble"
        },
        characters: [{
            character_id: archetype.archetypeId,
            pose: state?.pose || 'neutral_stance',
            expression: 'neutral_expression', // Default expression
            costume_id: `${archetype.archetypeId}_default_attire`
        }],
        props: archetype.visual_profile.prop ? [archetype.visual_profile.prop] : [],
        quality: "4K_painterly_render"
    };
}

// FIX: Renamed from generateInitialImage to generateImageFromPrompt to match usage in App.tsx.
export async function generateImageFromPrompt(prompt: NanoBananaPrompt): Promise<{ base64: string; mimeType: string; imageUrl: string }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Create a descriptive text prompt from the structured JSON
    const descriptiveTextPrompt = `Generate a high-fidelity, photo-realistic image in the style of Renaissance Brutalism and Erotic Dark Academia. Adhere strictly to the following JSON specification for the scene's composition, character, and lighting: ${JSON.stringify(prompt, null, 2)}`;

    const response = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: { parts: [{ text: descriptiveTextPrompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (imagePart?.inlineData) {
        const base64 = imagePart.inlineData.data;
        const mimeType = imagePart.inlineData.mimeType;
        const imageUrl = `data:${mimeType};base64,${base64}`;
        return { base64, mimeType, imageUrl };
    } else {
        throw new Error('No image data received from Gemini.');
    }
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
        const base64 = imagePart.inlineData.data;
        const mimeType = imagePart.inlineData.mimeType;
        const imageUrl = `data:${mimeType};base64,${base64}`;
        return { base64, mimeType, imageUrl };
    } else {
        throw new Error('No edited image data received.');
    }
}

export async function continueStoryStream(callbacks: StreamCallbacks): Promise<void> {
    // FIX: Destructure userChoicePrompt from callbacks.
    const { continuationPoint, onTextChunk, onMetadata, onComplete, onError, userChoicePrompt } = callbacks;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // FIX: Pass userChoicePrompt to createDirectorPrompt.
    const directorPrompt = createDirectorPrompt(continuationPoint, userChoicePrompt);

    try {
        const stream = await ai.models.generateContentStream({
            model: STORY_GENERATION_MODEL,
            contents: directorPrompt,
            config: {
                systemInstruction: DIRECTOR_SYSTEM_INSTRUCTION,
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });

        let accumulatedResponse = '';
        const delimiter = "\n---METADATA---\n";
        let metadataExtracted = false;

        for await (const chunk of stream) {
            accumulatedResponse += chunk.text;

            if (!metadataExtracted && accumulatedResponse.includes(delimiter)) {
                const parts = accumulatedResponse.split(delimiter);
                const ssmlPart = parts[0];
                const jsonPart = parts[1];
                
                onTextChunk(ssmlPart); // First text update

                try {
                    const metadata: AIPayloadMetadata = JSON.parse(jsonPart);
                    // Update global state
                    Object.assign(NARRATIVE_STATE, metadata.updatedNarrativeState);
                    onMetadata(metadata);
                    metadataExtracted = true;
                } catch (e) {
                    // JSON might be incomplete, wait for more chunks
                }
            } else if (!metadataExtracted) {
                // We're still in the SSML part of the stream
                onTextChunk(accumulatedResponse);
            }
        }
        
        // Final parse after stream finishes
        if (!metadataExtracted) {
             const parts = accumulatedResponse.split(delimiter);
             if (parts.length > 1) {
                const ssmlPart = parts[0];
                const jsonPart = parts[1];
                onTextChunk(ssmlPart);
                 try {
                    const metadata: AIPayloadMetadata = JSON.parse(jsonPart);
                     // Update global state
                    Object.assign(NARRATIVE_STATE, metadata.updatedNarrativeState);
                    onMetadata(metadata);
                } catch(e) {
                    console.error("Failed to parse metadata JSON at the end of the stream", e);
                    onError(new Error("Invalid metadata format received."));
                    return;
                }
             } else {
                 onTextChunk(accumulatedResponse); // Update with final text
             }
        }

        onComplete();
    } catch (error) {
        console.error("Error during story generation stream:", error);
        onError(error instanceof Error ? error : new Error('An unknown streaming error occurred'));
    }
}