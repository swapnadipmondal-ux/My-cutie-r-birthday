// Replace 'song.mp3' with your actual audio file name
const audio = new Audio('song.mp3'); 

document.getElementById('musicBtn').addEventListener('click', function() {
  if (audio.paused) {
    audio.play();
    this.innerText = '♫ music on';
  } else {
    audio.pause();
    this.innerText = '♫ music off';
  }
});
