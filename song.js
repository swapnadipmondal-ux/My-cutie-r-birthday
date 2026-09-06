// Floating Heart & Star Particles
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

// Click Heart Burst Effect
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

// Custom Audio Control (Use your own 'song.mp3' or synthesizer fallback)
const audio = new Audio('song.mp3');
audio.loop = true;

document.addEventListener('DOMContentLoaded', () => {
  createFloatingParticles();
  enableClickHearts();

  const musicBtn = document.getElementById('musicBtn');
  
  musicBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => {
        musicBtn.innerText = '♫ music on';
      }).catch(() => {
        console.log("Add a 'song.mp3' file to your folder for background music.");
      });
    } else {
      audio.pause();
      musicBtn.innerText = '♫ music off';
    }
  });
});
