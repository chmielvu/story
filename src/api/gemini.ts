// src/api/gemini.ts

import { GoogleGenAI, Modality } from '@google/genai';
import { 
    DIRECTOR_SYSTEM_INSTRUCTION,
    createDirectorPrompt,
    STORY_GENERATION_MODEL, 
    TTS_SYNTHESIS_MODEL, 
    IMAGE_MODEL, 
    IMAGE_EDIT_MODEL,
    NARRATOR_VOICE_MAP
} from '../constants';
import { 
    decode, 
    decodeAudioData, 
    audioState,
    initAudio,
    queueAudio
} from '../utils/audio';

// --- TYPES (for internal API use) ---
interface AgentInvocation {
    agentName: string;
    context: string;
    action: string;
    retrievedTriples: string[][];
}
interface AIPayloadMetadata {
    imagePrompt: string;
    agentInvocations: AgentInvocation[];
}
interface StreamCallbacks {
    continuationPoint: string;
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
    if (base64Audio && audioState.outputAudioContext) {
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioState.outputAudioContext, 24000, 1);
        queueAudio(audioBuffer);
    }
}

export async function generateInitialImage(prompt: string): Promise<{ base64: string; mimeType: string; imageUrl: string }> {
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
    const { continuationPoint, onTextChunk, onMetadata, onComplete, onError } = callbacks;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const directorPrompt = createDirectorPrompt(continuationPoint);

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