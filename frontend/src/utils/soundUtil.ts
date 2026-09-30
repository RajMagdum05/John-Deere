/**
 * Audio Notification Utility for Farm Action Loop.
 * Plays short confirmatory tractor horn / chime using HTML5 Audio with Web Audio API synthesis fallback.
 */

export const playNotificationSound = () => {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        playWebAudioChime();
      });
    }
  } catch {
    playWebAudioChime();
  }
};

export const playWebAudioChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // Tone 1: Warm low tractor horn frequency
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.35);

    // Tone 2: Bright high confirm chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.12); // G5
    gain2.gain.setValueAtTime(0.35, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (e) {
    console.debug('Web audio context notification:', e);
  }
};
