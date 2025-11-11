// src/api/gemini.ts

import { GoogleGenAI, Modality } from '@google/genai';
import { 
    DIRECTOR_AGENT_PROMPT, 
    STORY_GENERATION_MODEL, 
    TTS_SYNTHESIS_MODEL, 
    IMAGE_MODEL, 
    IMAGE_EDIT_MODEL,
    RESPONSE_SCHEMA,
    NARRATOR_VOICE_MAP
} from '../constants';
import { 
    decode, 
    decodeAudioData, 
    audioState,
    activeSources,
    initAudio
} from '../utils/audio';

// --- TYPES (for internal API use) ---
interface AgentInvocation {
    agentName: string;
    context: string;
    action: string;
    retrievedTriples: string[][];
}
interface AIPayload {
    ttsPerformanceScript: {
        ssml: string;
    };
    imagePrompt: string;
    agentInvocations: AgentInvocation[];
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
        audioState.nextStartTime = Math.max(audioState.nextStartTime, audioState.outputAudioContext.currentTime);
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioState.outputAudioContext, 24000, 1);
        const source = audioState.outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioState.outputAudioContext.destination);
        source.onended = () => activeSources.delete(source);
        source.start(audioState.nextStartTime);
        activeSources.add(source);
        audioState.nextStartTime += audioBuffer.duration;
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

export async function continueStory(continuationPoint: string): Promise<AIPayload> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // SOTA OPTIMIZATION: One call, guaranteed JSON structure.
    const directorPrompt = `${DIRECTOR_AGENT_PROMPT}\n<SCENE_CONTINUATION_POINT>${continuationPoint}</SCENE_CONTINUATION_POINT>`;

    const directorResponse = await ai.models.generateContent({
        model: STORY_GENERATION_MODEL,
        contents: directorPrompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: RESPONSE_SCHEMA,
            thinkingConfig: { thinkingBudget: 32768 }
        }
    });

    const jsonString = directorResponse.text;
    let payload: AIPayload;
    
    try {
        payload = JSON.parse(jsonString);
    } catch (parseError) {
        console.error("JSON Parsing Error (Director):", parseError, "Raw text:", jsonString);
        throw new Error("Director AI response was not valid JSON, even with schema enforcement.");
    }
    
    if (!payload.imagePrompt || !payload.ttsPerformanceScript?.ssml || !payload.agentInvocations) {
        throw new Error("Final payload is missing required keys: imagePrompt, ttsPerformanceScript.ssml, or agentInvocations");
    }
    
    return payload;
}