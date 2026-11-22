// Short tones made in the browser. No audio files, no network, no copied music.

let context = null;

function tone(frequency, duration, type, volume) {
  try {
    if (!context) context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  } catch {
    // Browsers that block audio simply play the game silently.
  }
}

export function cue(name) {
  if (name === 'decoy') tone(520, 0.14, 'triangle', 0.05);
  else if (name === 'veil') tone(320, 0.3, 'sine', 0.05);
  else if (name === 'steal') {
    tone(660, 0.18, 'triangle', 0.06);
    tone(880, 0.32, 'sine', 0.04);
  } else if (name === 'spotted') tone(180, 0.5, 'sawtooth', 0.05);
  else if (name === 'escape') {
    tone(523, 0.22, 'triangle', 0.06);
    tone(784, 0.5, 'sine', 0.05);
  }
}
