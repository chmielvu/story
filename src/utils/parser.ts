// src/utils/parser.ts

import { performAndSynthesizeAudio } from '../api/gemini';
import { audioState, initAudio, stopAllAudio } from './audio';

// --- HTML & SSML PARSING LOGIC ---

export function parseSSMLToHTML(scriptSource: string): string {
    // This cleans up the SSML for display, converting semantic tags into HTML elements with classes
    // while stripping presentation-only tags like <prosody>.
    return scriptSource
        .replace(/<narrator>/g, '<p>').replace(/<\/narrator>/g, '</p>')
        .replace(/<dialogue speaker="([^"]+)">/g, (match, speaker) => {
            const speakerClass = `speaker-${speaker.toLowerCase()}`;
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

        let voiceKey = 'narrator';
        
        if (node.nodeName === 'break') {
            const timeStr = node.getAttribute('time') || '1s';
            const seconds = parseFloat(timeStr);
            if (!isNaN(seconds)) audioState.nextStartTime += seconds;
            continue;
        }
        
        // The innerHTML of the node contains the SSML fragment with <prosody> tags
        const ssmlFragment = node.innerHTML;
        
        if (node.nodeName === 'narrator') {
            voiceKey = 'narrator';
        } else if (node.nodeName === 'dialogue') {
            voiceKey = node.getAttribute('speaker') || 'narrator';
        } else if (node.nodeName === 'abyss') {
            voiceKey = node.getAttribute('mode') || 'Clinical Analyst';
        } else {
            continue;
        }
        
        await performAndSynthesizeAudio(ssmlFragment, voiceKey);
    }
}
