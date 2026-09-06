// Floating Heart & Star Particle Generator
function createFloatingParticles() {
  const container = document.getElementById('starsContainer');
  const symbols = ['✦', '✧', '♥', '❥', '•'];
  const particleCount = 28;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('span');
    particle.className = 'particle';
    particle.innerText = symbols[Math.floor(Math.random() * symbols.length)];
    
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${8 + Math.random() * 12}s`;
    particle.style.animationDelay = `${Math.random() * 8}s`;
    particle.style.fontSize = `${10 + Math.random() * 10}px`;

    container.appendChild(particle);
  }
}

// Interactive Heart Burst on Photo Click
function enableClickHearts() {
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      const heart = document.createElement('span');
      heart.innerText = '♥';
      heart.style.position = 'fixed';
      heart.style.left = `${e.clientX}px`;
      heart.style.top = `${e.clientY}px`;
      heart.style.color = '#ff99dd';
      heart.style.fontSize = '24px';
      heart.style.pointerEvents = 'none';
      heart.style.zIndex = '9999';
      heart.style.transition = 'all 1s ease-out';

      document.body.appendChild(heart);

      setTimeout(() => {
        heart.style.transform = 'translateY(-60px) scale(1.6)';
        heart.style.opacity = '0';
      }, 10);

      setTimeout(() => {
        heart.remove();
      }, 1000);
    });
  });
}

// Soft Audio Synthesizer Engine
class SoftRomanticSynth {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.tempo = 88;
    this.currentNoteIndex = 0;
    this.timerId = null;

    this.notes = {
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
      'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
      'REST': 0
    };

    this.melody = [
      ['E4', 1.0], ['G4', 1.0], ['A4', 1.5], ['G4', 0.5],
      ['E4', 1.0], ['D4', 1.0], ['C4', 2.0],
      ['E4', 1.0], ['G4', 1.0], ['C5', 1.5], ['B4', 0.5],
      ['A4', 2.0], ['G4', 2.0]
    ];
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
  }

  playTone(freq, duration) {
    if (freq === 0) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.value = freq;

    filter.type = 'lowpass';
    filter.frequency.value = 650;

    const now = this.audioCtx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration - 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  toggle() {
    this.init();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const musicBtn = document.getElementById('musicBtn');

    if (this.isPlaying) {
      this.isPlaying = false;
      clearTimeout(this.timerId);
      musicBtn.innerText = '♫ music off';
    } else {
      this.isPlaying = true;
      musicBtn.innerText = '♫ music on';
      this.nextNote();
    }
  }

  nextNote() {
    if (!this.isPlaying) return;

    const [note, beats] = this.melody[this.currentNoteIndex];
    const durationSec = beats * (60 / this.tempo);

    this.playTone(this.notes[note], durationSec);

    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;
    this.timerId = setTimeout(() => this.nextNote(), durationSec * 1000);
  }
}

// Run on load
const romanticPlayer = new SoftRomanticSynth();

document.addEventListener('DOMContentLoaded', () => {
  createFloatingParticles();
  enableClickHearts();

  const musicBtn = document.getElementById('musicBtn');
  musicBtn.addEventListener('click', () => romanticPlayer.toggle());
});
