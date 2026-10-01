// Web Audio API distant thunder synthesizer (safe, calm, zero external assets)
let audioCtx: AudioContext | null = null;

export function playCalmDistantThunder() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const duration = 2.4;
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate brown/pink noise (soothing low frequency rumble)
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;

    // Filter to sub-bass rumble
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(95, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(45, audioCtx.currentTime + duration);

    // Gain envelope with soft swell and decay
    const gainNode = audioCtx.createGain();
    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.06, now + 0.35); // very quiet, under 6% volume
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseSource.start();
  } catch {
    // Audio context may be restricted by autoplay policy until interaction
  }
}
