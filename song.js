// song.js - Soft & Light Web Audio Synthesizer

class SoftSongPlayer {
  constructor() {
    this.audioCtx = null;
    this.filterNode = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.tempo = 100; // Slower, relaxed tempo
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

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();

      // Soft low-pass filter to remove sharp treble frequencies
      this.filterNode = this.audioCtx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.value = 800; // Cuts high-pitch harshness

      // Master output gain set low for gentle sound level
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 0.4;

      // Routing: Oscillator -> Note Gain -> Filter -> Master Gain -> Speakers
      this.filterNode.connect(this.masterGain);
      this.masterGain.connect(this.audioCtx.destination);
    }
  }

  playTone(freq, duration) {
    if (freq === 0) return; // Rest note

    const osc = this.audioCtx.createOscillator();
    const noteGain = this.audioCtx.createGain();

    osc.type = 'sine'; // Smooth, pure waveform without harsh overtones
    osc.frequency.value = freq;

    const now = this.audioCtx.currentTime;
    const fadeTime = 0.08; // Soft attack and release

    // Subtle gain curve for a smooth bell-like response
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(0.08, now + fadeTime);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration - 0.02);

    osc.connect(noteGain);
    noteGain.connect(this.filterNode);

    osc.start(now);
    osc.stop(now + duration);
  }

  start() {
    this.initContext();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.currentNoteIndex = 0;
    this.nextNote();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) clearTimeout(this.timerId);
  }

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
const song = new SoftSongPlayer();

// Export for module systems or global window object
if (typeof module !== 'undefined' && module.exports) {
  module.exports = song;
} else {
  window.songPlayer = song;
}
