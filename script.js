const playPauseBtn = document.getElementById("play-pause-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const songTitle = document.getElementById("song-title");
const artistName = document.getElementById("artist-name");
const albumArt = document.getElementById("album-art");
const lyricsText = document.getElementById("lyrics-text");
const backgroundVideo = document.getElementById("background-video");
const playlist = document.getElementById("playlist");
const playIcon = document.getElementById("play-icon");
const pauseIcon = document.getElementById("pause-icon");

const progressBar = document.getElementById("progress-bar");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");

let audio = new Audio();
let isPlaying = false;
let currentTrack = 0;
let currentLyricIndex = -1;

const tracks = [
  {
    title: "Multo",
    artist: "Cup of Joe",
    src: "music/multo.mp3",
    cover: "images/Multo.jpg",
    video: "videos/multo.mp4",
    lyrics: [
      { time: 0.1, text: "Minumulto na 'ko ng damdamin ko" },
      { time: 3, text: "Ng damdamin ko" },
      { time: 5, text: "Hindi mo ba ako lilisanin?" },
      { time: 10, text: "Hindi pa ba sapat pagpapahirap sa 'kin? (Damdamin ko)" },
      { time: 15, text: "Hindi na ba ma-mamamayapa?" },
      { time: 19, text: "Hindi na ba ma-mamamayapa?" },
      { time: 23, text: "Hindi na makalaya" },
    ]
  },
  {
    title: "Untouchable",
    artist: "Taylor Swift",
    src: "music/Untouchable.mp3",
    cover: "images/Untouchable.jpg",
    video: "videos/Untouchable.mp4",
    lyrics: [
      { time: 0, text: "Come on, come on" },
      { time: 2, text: "Oh, oh, oh, oh" },
      { time: 3, text: "In the middle of the night, when I'm in this dream" },
      { time: 8, text: "It's like a million little stars spelling out your name" },
      { time: 13, text: "You gotta, come on, come onh" },
      { time: 16, text: "Say that we'll be together" },
      { time: 18, text: "Come on, come on" },
      { time: 21, text: "Come on" },
      { time: 23, text: "In the middle of the night, we can form this dream" },
      { time: 27, text: "I wanna feel you by my side, standing next to me" },
      { time: 32, text: "You gotta come on, come on" },
      { time: 35, text: "Say that we'll be together" },
      { time: 38, text: "Come on, come on" },
      { time: 41, text: "Little taste of heaven" },
      { time: 47, text: "Oh, oh" },
      { time: 50, text: "Oh" },
      { time: 54, text: "Oh" },
    ]
  },
  {
    title: "Pahina",
    artist: "Cup of Joe",
    src: "music/Pahina.mp3",
    cover: "images/pahina.jpg",
    video: "videos/pahina.mp4",
    lyrics: [
      {time: 0.1, text: "Simula sa wakas na 'di matuklasan"},
      {time: 4, text: "Pabalik kung saan 'di na natagpuan"},
      {time: 9, text: "Ang mga matang nakatanaw sa umpisa"},
      {time: 13, text: "Ng yugtong 'di na sana naisulat pa"},
      {time: 18, text: "Simula sa wakas na 'di matuklasan"},
      {time: 22, text: "Pabalik kung saan 'di na natagpuan"},
      {time: 27, text: "Ang mga matang nakatanaw sa umpisa"},
      {time: 31, text: "Ng yugtong 'di na sana naisulat pa"},
      {time: 36, text: "Sa lahat ng pahinang sinulat ng tadhana'y"},
      {time: 41, text: "Ikaw at ikaw at ikaw pa rin"},
      {time: 45, text: "Ang yugtong paulit-ulit kong babalik-balikan"},
      {time: 50, text: "Sigaw ay sigaw ay ikaw pa rin"},
      ]
    }
];

function safePlayVideo(vidEl) {
  if (!vidEl) return;
  vidEl.load?.();
  vidEl.play?.().catch(() => {});
}

function updatePlayPauseUI() {
  if (playIcon && pauseIcon) {
    if (isPlaying) {
      playIcon.classList.add("hidden");
      pauseIcon.classList.remove("hidden");
      playPauseBtn.setAttribute("aria-label", "Pause");
    } else {
      playIcon.classList.remove("hidden");
      pauseIcon.classList.add("hidden");
      playPauseBtn.setAttribute("aria-label", "Play");
    }
  } else {
    playPauseBtn.textContent = isPlaying ? "Pause" : "Play";
  }
}

function playTrack() {
  if (!audio.src) loadTrack(currentTrack);
  audio.play().catch(err => console.warn("play() rejected:", err));
  isPlaying = true;
  updatePlayPauseUI();
  safePlayVideo(backgroundVideo);
}

function pauseTrack() {
  audio.pause();
  isPlaying = false;
  updatePlayPauseUI();
}

function loadTrack(index, { autoPlay = false } = {}) {
  if (index < 0 || index >= tracks.length) return;
  currentTrack = index;
  currentLyricIndex = -1;

  const track = tracks[index];
  songTitle.textContent = track.title || "";
  artistName.textContent = track.artist || "";
  albumArt.src = track.cover || "";

  if (backgroundVideo && track.video) {
    backgroundVideo.src = track.video;
    backgroundVideo.load?.();
  }

  audio.src = track.src || "";
  audio.load?.();

  renderLyrics(track.lyrics || []);
  highlightPlaylist(index);

  if (progressBar) progressBar.value = 0;
  if (currentTimeEl) currentTimeEl.textContent = "0:00";
  if (durationEl) durationEl.textContent = "0:00";

  if (autoPlay) playTrack();
  else {
    isPlaying = false;
    updatePlayPauseUI();
  }

  safePlayVideo(backgroundVideo);
}


function renderLyrics(lyrics) {
  if (!lyricsText) return;
  lyricsText.innerHTML = "";

  const normalized = lyrics.map(line =>
    typeof line === "string" ? { time: 0, text: line } : line
  );

  const useListItem = lyricsText.tagName.toLowerCase() === "ul";
  normalized.forEach((line, i) => {
    const el = document.createElement(useListItem ? "li" : "p");
    el.className = "lyric-line";
    el.dataset.index = i;
    el.textContent = line.text || "";
    lyricsText.appendChild(el);
  });
}

// ======= SYNC LYRICS =======
function syncLyrics() {
  if (!lyricsText) return;
  const t = audio.currentTime;
  const track = tracks[currentTrack];
  const lyrics = track.lyrics || [];

  let idx = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (t >= lyrics[i].time) idx = i;
    else break;
  }

  const lines = lyricsText.querySelectorAll(".lyric-line");

  if (idx !== currentLyricIndex) {
    if (currentLyricIndex >= 0 && lines[currentLyricIndex]) {
      lines[currentLyricIndex].classList.remove("active");
    }
    if (idx >= 0 && lines[idx]) {
      lines[idx].classList.add("active");
      lines[idx].scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
    currentLyricIndex = idx;
  }

  // progress bar + waktu
  if (progressBar && audio.duration && !isNaN(audio.duration)) {
    progressBar.max = Math.floor(audio.duration);
    progressBar.value = Math.floor(t);
  }
  if (currentTimeEl) currentTimeEl.textContent = formatTime(t);
  if (durationEl) {
    const d = audio.duration && !isNaN(audio.duration) ? audio.duration : 0;
    durationEl.textContent = formatTime(d);
  }
}

// ======= NEXT / PREV =======
function nextTrack() {
  currentTrack = (currentTrack + 1) % tracks.length;
  loadTrack(currentTrack, { autoPlay: true });
}

function prevTrack() {
  currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
  loadTrack(currentTrack, { autoPlay: true });
}

// ======= PLAYLIST UI =======
function createPlaylist() {
  if (!playlist) return;
  playlist.innerHTML = "";
  tracks.forEach((track, index) => {
    const li = document.createElement("li");
    li.textContent = `${track.title} - ${track.artist}`;
    li.tabIndex = 0;
    li.dataset.index = index;
    li.addEventListener("click", () => loadTrack(index, { autoPlay: true }));
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") loadTrack(index, { autoPlay: true });
    });
    playlist.appendChild(li);
  });
  highlightPlaylist(currentTrack);
}

function highlightPlaylist(index) {
  if (!playlist) return;
  const items = playlist.querySelectorAll("li");
  items.forEach((item, i) => {
    item.classList.toggle("active", i === index);
  });
}

// ======= PROGRESS SEEK =======
if (progressBar) {
  progressBar.addEventListener("input", (e) => {
    const val = Number(e.target.value);
    audio.currentTime = val;
    if (currentTimeEl) currentTimeEl.textContent = formatTime(val);
  });
}

// ======= PLAY/PAUSE BUTTON =======
if (playPauseBtn) {
  playPauseBtn.addEventListener("click", () => {
    if (isPlaying) pauseTrack();
    else playTrack();
  });
}

// ======= PLAY/PAUSE LOGIC =======
function playTrack() {
  if (!audio.src) loadTrack(currentTrack);
  audio.play().catch(err => console.warn("Audio play error:", err));
  isPlaying = true;
  updatePlayPauseUI();
  safePlayVideo(backgroundVideo);
}

function pauseTrack() {
  audio.pause();
  isPlaying = false;
  updatePlayPauseUI();
}

// ======= UPDATE PLAY/PAUSE ICON =======
function updatePlayPauseUI() {
  if (playIcon && pauseIcon) {
    if (isPlaying) {
      playIcon.classList.add("hidden");
      pauseIcon.classList.remove("hidden");
      playPauseBtn.setAttribute("aria-label", "Pause");
    } else {
      playIcon.classList.remove("hidden");
      pauseIcon.classList.add("hidden");
      playPauseBtn.setAttribute("aria-label", "Play");
    }
  } else {
    // fallback: text
    playPauseBtn.textContent = isPlaying ? "Pause" : "Play";
  }
}

if (nextBtn) nextBtn.addEventListener("click", nextTrack);
if (prevBtn) prevBtn.addEventListener("click", prevTrack);

// ======= AUDIO EVENTS =======
audio.addEventListener("timeupdate", syncLyrics);
audio.addEventListener("ended", nextTrack);
audio.addEventListener("error", (e) => console.error("Audio error:", e));

// helper: update durasi
function updateDurationUI() {
  if (durationEl && audio.duration && !isNaN(audio.duration)) {
    durationEl.textContent = formatTime(audio.duration);
  }
  if (progressBar && audio.duration && !isNaN(audio.duration)) {
    progressBar.max = Math.floor(audio.duration);
  }
}

audio.addEventListener("loadedmetadata", () => {
  console.log("loadedmetadata: durasi =", audio.duration);
  updateDurationUI();
});

audio.addEventListener("canplay", () => {
  console.log("canplay: durasi =", audio.duration);
  updateDurationUI();
});

// ======= INIT =======
createPlaylist();
loadTrack(currentTrack, { autoPlay: false });
updatePlayPauseUI();

// ======= FORMAT TIME =======
function formatTime(seconds) {
  const m = Math.floor(seconds / 60) || 0;
  const s = Math.floor(seconds % 60) || 0;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
