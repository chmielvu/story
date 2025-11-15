// src/utils/audio.ts

// --- AUDIO STATE MANAGEMENT ---
interface AudioState {
    outputAudioContext: AudioContext | null;
}

type AudioQueueItem = AudioBuffer | { type: 'pause'; duration: number };

const audioQueue: AudioQueueItem[] = [];
let isProcessingQueue = false;
let pauseTimeoutId: ReturnType<typeof setTimeout> | null = null;

export const audioState: AudioState = {
    outputAudioContext: null,
};

export const activeSources = new Set<AudioBufferSourceNode>();

// --- QUEUE MANAGEMENT ---

function processAudioQueue(): void {
    if (isProcessingQueue || audioQueue.length === 0 || !audioState.outputAudioContext) {
        if (audioQueue.length === 0) {
            isProcessingQueue = false;
        }
        return;
    }

    isProcessingQueue = true;
    const item = audioQueue.shift();

    if (!item) {
        isProcessingQueue = false;
        return;
    }

    if ('type' in item && item.type === 'pause') {
        pauseTimeoutId = setTimeout(() => {
            pauseTimeoutId = null;
            isProcessingQueue = false;
            processAudioQueue();
        }, item.duration * 1000);
    } else if (item instanceof AudioBuffer) {
        const source = audioState.outputAudioContext.createBufferSource();
        source.buffer = item;
        source.connect(audioState.outputAudioContext.destination);
        
        activeSources.add(source);
        
        source.onended = () => {
            activeSources.delete(source);
            isProcessingQueue = false;
            processAudioQueue();
        };
        
        source.start();
    }
}

export function queueAudio(item: AudioQueueItem): void {
    audioQueue.push(item);
    processAudioQueue();
}


// --- AUDIO HELPER FUNCTIONS ---

export function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
}

export function initAudio(): void {
    if (!audioState.outputAudioContext || audioState.outputAudioContext.state === 'closed') {
        audioState.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
}

export function stopAllAudio(): void {
    if (pauseTimeoutId) {
        clearTimeout(pauseTimeoutId);
        pauseTimeoutId = null;
    }

    activeSources.forEach(source => {
        source.onended = null; // Prevent onended from firing and restarting queue
        try { source.stop(); } catch (e) { /* already stopped */ }
    });
    activeSources.clear();

    audioQueue.length = 0;
    isProcessingQueue = false;
}

// --- SCENE TRANSITION SOUND ---

export function playTransitionSound(): void {
    if (!audioState.outputAudioContext) {
        console.warn("Audio context not initialized.");
        return;
    }
    // Attempt to resume the context if it's suspended (e.g., due to browser policy)
    if (audioState.outputAudioContext.state === 'suspended') {
        audioState.outputAudioContext.resume();
    }
    
    // Proceed only if the context is running
    if (audioState.outputAudioContext.state !== 'running') {
        console.warn("Audio context is not running. Cannot play transition sound.");
        return;
    }
    
    const now = audioState.outputAudioContext.currentTime;
    
    // Create a low-frequency oscillator for the fundamental tone
    const oscillator = audioState.outputAudioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(120, now); // A low, subtle hum
    oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.8); // Pitch drops slightly
    
    // Create a gain node to control the volume envelope
    const gainNode = audioState.outputAudioContext.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.25, now + 0.1); // Quick but gentle attack
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2); // Slower, resonant decay
    
    // Connect and play
    oscillator.connect(gainNode);
    gainNode.connect(audioState.outputAudioContext.destination);
    
    oscillator.start(now);
    oscillator.stop(now + 1.5); // Stop after 1.5 seconds
}
