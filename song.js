// song.js - Modern Synthwave Sequencer with Real-Time Canvas Visualizer

class ModernSongPlayer {
  constructor() {
    this.audioCtx = null;
    this.analyser = null;
    this.masterGain = null;
    this.delayNode = null;
    this.isPlaying = false;
    this.tempo = 120;
    this.currentStep = 0;
    this.timerId = null;
    this.animFrameId = null;

    // Frequencies (Hz)
    this.notes = {
      'C3': 130.81, 'G3': 196.00, 'A3': 220.00, 'F3': 174.61,
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
      'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
      'REST': 0
    };

    // Melody with bassline accents
    this.melody = [
      { lead: 'E4', bass: 'C3', duration: 0.5 },
      { lead: 'E4', bass: 'C3', duration: 0.5 },
      { lead: 'E4', bass: 'C3', duration: 1.0 },
      { lead: 'E4', bass: 'A3', duration: 0.5 },
      { lead: 'E4', bass: 'A3', duration: 0.5 },
      { lead: 'E4', bass: 'A3', duration: 1.0 },
      { lead: 'E4', bass: 'F3', duration: 0.5 },
      { lead: 'G4', bass: 'F3', duration: 0.5 },
      { lead: 'C4', bass: 'F3', duration: 0.75 },
      { lead: 'D4', bass: 'F3', duration: 0.25 },
      { lead: 'E4', bass: 'G3', duration: 2.0 }
    ];
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();

      // Real-time Audio Analyser for Canvas Animation
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;

      // Master output volume
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 0.3;

      // Creative Stereo Delay Effect
      this.delayNode = this.audioCtx.createDelay();
      this.delayNode.delayTime.value = 0.25; // 8th-note echo
      const delayFeedback = this.audioCtx.createGain();
      delayFeedback.gain.value = 0.35; // Soft echo repeat

      this.delayNode.connect(delayFeedback);
      delayFeedback.connect(this.delayNode);

      // Route: Synths -> Delay -> Analyser -> Master Gain -> Speakers
      this.delayNode.connect(this.analyser);
      this.analyser.connect(this.masterGain);
      this.masterGain.connect(this.audioCtx.destination);
    }
  }

  // Dual-Oscillator Synth Voice (Triangle + Soft Sawtooth)
  playSynthVoice(freq, duration, isBass = false) {
    if (freq === 0) return;

    const now = this.audioCtx.currentTime;
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const filter = this.audioCtx.createBiquadFilter();
    const voiceGain = this.audioCtx.createGain();

    // Waveform combination for dynamic modern tone
    osc1.type = isBass ? 'sawtooth' : 'triangle';
    osc2.type = isBass ? 'triangle' : 'sine';

    osc1.frequency.value = freq;
    osc2.frequency.value = freq * (isBass ? 1.0 : 1.005); // Subtle detune chorus effect

    // Lowpass filter envelope for warm punch
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isBass ? 400 : 1200, now);
    filter.frequency.exponentialRampToValueAtTime(isBass ? 150 : 400, now + duration);

    // ADSR Volume Envelope
    const maxGain = isBass ? 0.15 : 0.12;
    voiceGain.gain.setValueAtTime(0.001, now);
    voiceGain.gain.linearRampToValueAtTime(maxGain, now + 0.03);
    voiceGain.gain.exponentialRampToValueAtTime(0.001, now + duration - 0.02);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(voiceGain);

    voiceGain.connect(this.analyser); // Direct signal
    voiceGain.connect(this.delayNode); // Echo signal

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  start() {
    this.initContext();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.currentStep = 0;
    this.nextNote();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) clearTimeout(this.timerId);
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
  }

  nextNote() {
    if (!this.isPlaying) return;

    const step = this.melody[this.currentStep];
    const beatDuration = 60 / this.tempo;
    const durationInSec = step.duration * beatDuration;

    // Trigger lead melody and bass unison
    this.playSynthVoice(this.notes[step.lead], durationInSec, false);
    if (step.bass) {
      this.playSynthVoice(this.notes[step.bass], durationInSec, true);
    }

    this.currentStep = (this.currentStep + 1) % this.melody.length;
    this.timerId = setTimeout(() => this.nextNote(), durationInSec * 1000);
  }

  // Real-time Canvas Visualizer Loop
  attachVisualizer(canvasElement) {
    if (!canvasElement) return;
    const ctx = canvasElement.getContext('2d');
    const bufferLength = this.analyser ? this.analyser.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (this.analyser && this.isPlaying) {
        this.analyser.getByteFrequencyData(dataArray);
      } else {
        dataArray.fill(0);
      }

      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      const barWidth = (canvasElement.width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvasElement.height * 0.8;

        // Gradient glow bars
        const gradient = ctx.createLinearGradient(0, canvasElement.height, 0, 0);
        gradient.addColorStop(0, '#7928CA');
        gradient.addColorStop(1, '#FF0080');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvasElement.height - barHeight, barWidth - 3, barHeight);

        x += barWidth;
      }

      this.animFrameId = requestAnimationFrame(render);
    };

    render();
  }
}

// Global instance
const song = new ModernSongPlayer();
if (typeof module !== 'undefined' && module.exports) {
  module.exports = song;
} else {
  window.songPlayer = song;
}
