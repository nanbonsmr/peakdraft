// Create a pleasant notification sound using Web Audio API
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const playNotificationSound = () => {
  try {
    const ctx = getAudioContext();
    
    // Resume context if suspended (required for autoplay policies)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Create a pleasant two-tone chime
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 - major chord
    
    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now);
      
      // Stagger the notes slightly for an arpeggio effect
      const startTime = now + index * 0.08;
      const duration = 0.3;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.1);
    });

    // Add a soft bell-like tone
    setTimeout(() => {
      const bellOsc = ctx.createOscillator();
      const bellGain = ctx.createGain();
      
      bellOsc.connect(bellGain);
      bellGain.connect(ctx.destination);
      
      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
      
      bellGain.gain.setValueAtTime(0, ctx.currentTime);
      bellGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
      bellGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      bellOsc.start(ctx.currentTime);
      bellOsc.stop(ctx.currentTime + 0.6);
    }, 250);

  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};

// Preload audio context on user interaction
export const initializeAudioContext = () => {
  try {
    getAudioContext();
  } catch (error) {
    console.warn('Could not initialize audio context:', error);
  }
};
