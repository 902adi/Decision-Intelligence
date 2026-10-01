// Web Audio Sound FX Engine for Weather Phenomena & UI Feedback
let audioCtx: AudioContext | null = null;
let isAudioMuted = false;

function getAudioContext(): AudioContext | null {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function setSoundMuted(muted: boolean) {
  isAudioMuted = muted;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('rakshak_audio_muted', String(muted));
  }
}

export function isSoundMuted(): boolean {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('rakshak_audio_muted') === 'true';
  }
  return isAudioMuted;
}

/**
 * Play weather phenomenon transition sound effect
 */
/**
 * Play weather phenomenon transition sound effect
 */
export function playPhenomenonSound(phenomenon: string) {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const p = (phenomenon || '').toLowerCase();

  if (p.includes('cloudburst')) {
    // CLOUDBURST: Electric lightning strike snap + rolling sub-bass thunder + downpour wash
    
    // 1. Lightning Crack (sharp electric snap)
    const snapDuration = 0.08;
    const snapBufferSize = Math.floor(ctx.sampleRate * snapDuration);
    const snapBuffer = ctx.createBuffer(1, snapBufferSize, ctx.sampleRate);
    const snapData = snapBuffer.getChannelData(0);
    for (let i = 0; i < snapBufferSize; i++) {
      snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (snapBufferSize * 0.15));
    }
    const snapSource = ctx.createBufferSource();
    snapSource.buffer = snapBuffer;

    const snapFilter = ctx.createBiquadFilter();
    snapFilter.type = 'highpass';
    snapFilter.frequency.setValueAtTime(1200, now);

    const snapGain = ctx.createGain();
    snapGain.gain.setValueAtTime(0.35, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + snapDuration);

    snapSource.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapSource.start(now);

    // 2. Rolling Thunder Sub-bass Rumble (Multi-stage rumble)
    const duration = 3.2;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brownian filtered noise
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 4.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const thunderFilter = ctx.createBiquadFilter();
    thunderFilter.type = 'lowpass';
    thunderFilter.frequency.setValueAtTime(240, now);
    thunderFilter.frequency.exponentialRampToValueAtTime(45, now + duration);

    const thunderGain = ctx.createGain();
    thunderGain.gain.setValueAtTime(0.01, now);
    thunderGain.gain.linearRampToValueAtTime(0.28, now + 0.12); // Strike peak
    thunderGain.gain.exponentialRampToValueAtTime(0.15, now + 0.7); // Secondary rumble
    thunderGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noise.connect(thunderFilter);
    thunderFilter.connect(thunderGain);
    thunderGain.connect(ctx.destination);
    noise.start(now + 0.02);

    // 3. Torrential Cloudburst Wind & Rain surge
    const rainNoise = ctx.createBufferSource();
    rainNoise.buffer = buffer;
    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.setValueAtTime(800, now);
    rainFilter.frequency.linearRampToValueAtTime(1400, now + 1.2);
    rainFilter.Q.value = 1.2;

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.001, now);
    rainGain.gain.linearRampToValueAtTime(0.12, now + 0.4);
    rainGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

    rainNoise.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(ctx.destination);
    rainNoise.start(now + 0.1);

  } else if (p.includes('dam')) {
    // DAM RELEASE: Hydraulic siren echo + deep resonant water wave roar
    const duration = 2.6;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.03 * white) / 1.03;
      data[i] = last * 3.8;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(60, now);
    filter.frequency.linearRampToValueAtTime(260, now + 1.0);
    filter.frequency.linearRampToValueAtTime(80, now + duration);
    filter.Q.value = 2.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);

    // Warning drone oscillation
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 1.8);
    oscGain.gain.setValueAtTime(0.035, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.8);

  } else if (p.includes('heavy') || p.includes('rain')) {
    // HEAVY RAIN: High-density rain shower wash
    const duration = 1.8;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.45;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(950, now);
    filter.frequency.linearRampToValueAtTime(1200, now + 0.6);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);

  } else if (p.includes('normal') || p.includes('clear') || p.includes('day')) {
    // NORMAL DAY: Peaceful atmospheric chime (C major 9 chord)
    const freqs = [261.63, 329.63, 392.00, 493.88, 587.33]; // C4, E4, G4, B4, D5
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = now + idx * 0.09;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.05, startTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 1.4);
    });
  }
}

/**
 * Gentle UI click sound
 */
export function playClickSound() {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

  gain.gain.setValueAtTime(0.03, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.04);
}

/**
 * Priority Alert chime
 */
export function playAlertChime() {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const notes = [587.33, 880.00]; // D5, A5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;

    const start = now + i * 0.12;
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(0.08, start + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.4);
  });
}
