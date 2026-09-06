const audio = new Audio('song.mp3'); 
audio.loop = true;

document.getElementById('musicBtn').addEventListener('click', function() {
  if (audio.paused) {
    audio.play();
    this.innerText = '♫ music on';
  } else {
    audio.pause();
    this.innerText = '♫ music off';
  }
});
