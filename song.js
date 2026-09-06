// song.js - Web Audio API Synthesizer & Sequencer

class SongPlayer {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.tempo = 120; // Beats per minute
    this.currentNoteIndex = 0;
    this.timerId = null;

    // Frequencies for musical notes (Hz)
    this.notes = {
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
      'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
      'REST': 0
    };

    // Melody sequence: [Note Name, Duration in beats]
    this.melody = [
      ['E4', 0.5], ['E4', 0.5], ['E4', 1.0],
      ['E4', 0.5], ['E4', 0.5], ['E4', 1.0],
      ['E4', 0.5], ['G4', 0.5], ['C4', 0.75], ['D4', 0.25],
      ['E4', 2.0],
      ['F4', 0.5], ['F4', 0.5], ['F4', 0.75], ['F4', 0.25],
      ['F4', 0.5], ['E4', 0.5], ['E4', 0.5], ['E4', 0.25], ['E4', 0.25],
      ['E4', 0.5], ['D4', 0.5], ['D4', 0.5], ['E4', 0.5],
      ['D4', 1.0], ['G4', 1.0]
    ];
  }

  // Initialize Audio Context on user action (required by browsers)
  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
  }

  // Play a single tone with custom envelope
  playTone(freq, duration) {
    if (freq === 0) return; // Rest

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine'; // Waveform: 'sine', 'square', 'sawtooth', 'triangle'
    osc.frequency.value = freq;

    // Smooth gain envelope (Attack - Decay)
    const now = this.audioCtx.currentTime;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration - 0.05);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  // Start sequence playback
  start() {
    this.initContext();
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.currentNoteIndex = 0;
    this.nextNote();
  }

  // Stop playback
  stop() {
    this.isPlaying = false;
    if (this.timerId) clearTimeout(this.timerId);
  }

  // Sequencer loop
  nextNote() {
    if (!this.isPlaying) return;

    const [noteName, beats] = this.melody[this.currentNoteIndex];
    const beatDuration = 60 / this.tempo;
    const durationInSeconds = beats * beatDuration;

    this.playTone(this.notes[noteName], durationInSeconds);

    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;
    this.timerId = setTimeout(() => this.nextNote(), durationInSeconds * 1000);
  }
}

// Instantiate player
const song = new SongPlayer();

// Export for module systems or global access
if (typeof module !== 'undefined' && module.exports) {
  module.exports = song;
} else {
  window.songPlayer = song;
}
