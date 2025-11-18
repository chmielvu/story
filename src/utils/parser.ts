// src/utils/parser.ts

import { performAndSynthesizeAudio } from '../api/gemini';
import { ARCHETYPE_DATABASE, VOICE_PROFILE_TO_GEMINI_VOICE } from '../constants';
import { initAudio, stopAllAudio, queueAudio } from './audio';

// --- HTML & SSML PARSING LOGIC ---

export function parseSSMLToHTML(scriptSource: string): string {
    return scriptSource
        .replace(/<narrator>/g, '<p>').replace(/<\/narrator>/g, '</p>')
        .replace(/<dialogue speaker="([^"]+)">/g, (match, speaker) => {
            const speakerClass = `speaker-${speaker.toLowerCase().replace(/ \(.+\)/, '')}`;
            return `<p class="dialogue ${speakerClass}"><strong>${speaker}:</strong> `;
        })
        .replace(/<\/dialogue>/g, '</p>')
        .replace(/<abyss mode="([^"]+)">/g, (match, mode) => `<p class="abyss"><em><strong>Abyss (${mode}):</strong> `)
        .replace(/<\/abyss>/g, '</em></p>')
        .replace(/<break[^>]+>/g, '')
        .replace(/<\/?(speak|prosody)[^>]*>/g, '');
}

export async function parseAndPlayScript(script: string): Promise<void> {
    initAudio();
    stopAllAudio();
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(script, "text/xml");
    const speakNode = xmlDoc.documentElement;
    
    if (speakNode.nodeName.toLowerCase() !== 'speak') {
        console.error("Invalid SSML structure received. Expected <speak> root node.");
        return;
    }
    
    for (const node of Array.from(speakNode.childNodes)) {
        if (!(node instanceof Element)) continue;

        let geminiVoiceName: string = VOICE_PROFILE_TO_GEMINI_VOICE['narrator'];
        
        if (node.nodeName === 'break') {
            const timeStr = node.getAttribute('time') || '1s';
            const seconds = parseFloat(timeStr);
            if (!isNaN(seconds)) {
                queueAudio({ type: 'pause', duration: seconds });
            }
            continue;
        }
        
        const ssmlFragment = node.innerHTML || node.textContent || '';
        const speakerName = node.getAttribute('speaker');

        if (node.nodeName === 'narrator') {
            geminiVoiceName = VOICE_PROFILE_TO_GEMINI_VOICE['narrator'];
        } else if (node.nodeName === 'dialogue' && speakerName) {
            const archetype = ARCHETYPE_DATABASE.archetypes.find(a => a.displayName.includes(speakerName));
            if (archetype && archetype.vocal_profile.profile) {
                geminiVoiceName = VOICE_PROFILE_TO_GEMINI_VOICE[archetype.vocal_profile.profile] || VOICE_PROFILE_TO_GEMINI_VOICE['narrator'];
            }
        } else if (node.nodeName === 'abyss') {
             geminiVoiceName = VOICE_PROFILE_TO_GEMINI_VOICE["Precise, clear, uninflected mezzo-soprano. Measured, patient pacing. Absolute lack of emotional variance."]; // Logician's voice
        } else {
            continue;
        }
        
        await performAndSynthesizeAudio(ssmlFragment, geminiVoiceName);
    }
}
