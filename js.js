const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8_PLAYER";

const player = $(".audio-player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");
const volume = $("#volume");
const speakerIcon = $("#speakerIcon");
const duration = $("#duration");

function formatTime(timeInSeconds) {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getFileSize(file) {
  if ('size' in file) {
    return formatBytes(file.size);
  }
  return 'Unknown';
}


const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: {},
  songs: [
    { name: "Click Pow Get Down", singer: "Raftaar x Fortnite", path: "https://github.com/R4218/Custom-Audio-Music-Player-with-HTML-CSS-JS/blob/main/mp3/song1.mp3", image: "" },
    { name: "Tu Phir Se Aana", singer: "Raftaar x Salim Merchant x Karma", path: "https://github.com/R4218/Custom-Audio-Music-Player-with-HTML-CSS-JS/blob/main/mp3/song2.mp3", image: "https://1.bp.blogspot.com/-kX21dGUuTdM/X85ij1SBeEI/AAAAAAAAKK4/feboCtDKkls19cZw3glZWRdJ6J8alCm-gCNcBGAsYHQ/s16000/Tu%2BAana%2BPhir%2BSe%2BRap%2BSong%2BLyrics%2BBy%2BRaftaar.jpg" },
    { name: "Naachne Ka Shaunq", singer: "Raftaar x Brobha V", path: "https://github.com/R4218/Custom-Audio-Music-Player-with-HTML-CSS-JS/blob/main/mp3/song3.mp3", image: "https://i.ytimg.com/vi/QvswgfLDuPg/maxresdefault.jpg" },
    { name: "Naachne Ka Shaunq", singer: "Raftaar x Brobha V", path: "https://github.com/R4218/Custom-Audio-Music-Player-with-HTML-CSS-JS/blob/main/mp3/song3.mp3", image: "https://i.ytimg.com/vi/QvswgfLDuPg/maxresdefault.jpg" },
    { name: "Naachne Ka Shaunq", singer: "Raftaar x Brobha V", path: "https://github.com/R4218/Custom-Audio-Music-Player-with-HTML-CSS-JS/blob/main/mp3/song3.mp3", image: "https://i.ytimg.com/vi/QvswgfLDuPg/maxresdefault.jpg" },
    // Add more songs if needed
  ],

  setConfig: function (key, value) {
    this.config[key] = value;
    // Uncomment the line below to use localStorage
    // localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },

  render: async function () {
    const htmls = await Promise.all(this.songs.map(async (song, index) => {
      await this.loadCurrentSongForRendering(index);
      const response = await fetch(song.path);
      const blob = await response.blob();
      const size = getFileSize(blob);
      return `
        <div class="song ${index === this.currentIndex ? "active" : ""}" data-index="${index}">
          <div class="thumb" style="background-image: url('${song.image || "https://play-lh.googleusercontent.com/a5WMofNQIRJieJnhWoTYXYoh_UqwE0NpI42tRKezgwixc21R9J40D14jTNUHUaS10MN3"}')"></div>
          <div class="body">
            <h3 class="title">${song.name}</h3>
            <div class="song-info">
            <span class="duration">Duration: ${formatTime(song.duration)} | </span>
            <span class="file-size">File size: ${size}</span>
            </div>
          </div>
          <a href="${song.path}" download="${song.name}" class="download-link"><i class="fas fa-download"></i></a>
        </div>
      `;
    }));

    playlist.innerHTML = htmls.join("");
  },

  loadCurrentSongForRendering: function (index) {
    return new Promise((resolve) => {
      const song = this.songs[index];
      const tempAudio = new Audio();
      tempAudio.src = song.path;

      tempAudio.addEventListener("loadedmetadata", () => {
        song.duration = tempAudio.duration;
        tempAudio.remove();
        resolve();
      });
    });
  },

  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      }
    });
  },

  handleEvents: function () {
    const _this = this;
    
    playBtn.onclick = function () {
      _this.isPlaying ? audio.pause() : audio.play();
    };

    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100);
        progress.value = progressPercent;
      }
    };

    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    nextBtn.onclick = function () {
      _this.isRandom ? _this.playRandomSong() : _this.nextSong();
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    prevBtn.onclick = function () {
      _this.isRandom ? _this.playRandomSong() : _this.prevSong();
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    audio.onended = function () {
      _this.isRepeat ? audio.play() : nextBtn.click();
    };

    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");

      if (songNode || e.target.closest(".option")) {
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
      }
    };

    volume.oninput = function () {
      const volumeValue = volume.value / 100;
      audio.volume = volumeValue;
      updateSpeakerIcon(volumeValue);
    };

    speakerIcon.onclick = function () {
      toggleMute();
    };

    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100);
        progress.value = progressPercent;
        duration.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
      }
    };
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 300);
  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image || "https://play-lh.googleusercontent.com/a5WMofNQIRJieJnhWoTYXYoh_UqwE0NpI42tRKezgwixc21R9J40D14jTNUHUaS10MN3"}')`;
    audio.src = this.currentSong.path;

    audio.addEventListener('loadedmetadata', () => {
      duration.textContent = formatTime(audio.duration);
    });
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  nextSong: function () {
    this.currentIndex = (this.currentIndex + 1) % this.songs.length;
    this.loadCurrentSong();
  },

  prevSong: function () {
    this.currentIndex = (this.currentIndex - 1 + this.songs.length) % this.songs.length;
    this.loadCurrentSong();
  },

  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  start: function () {
    this.loadConfig();
    this.defineProperties();
    this.handleEvents();
    this.loadCurrentSong();
    this.render();
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
    audio.volume = volume.value = 0.8;
    updateSpeakerIcon(audio.volume);
  },
};

function updateSpeakerIcon(volumeValue) {
  if (volumeValue === 0) {
    speakerIcon.classList.remove("fa-volume-up");
    speakerIcon.classList.add("fa-volume-off");
  } else {
    speakerIcon.classList.remove("fa-volume-off");
    speakerIcon.classList.add("fa-volume-up");
  }
}

function toggleMute() {
  audio.volume = audio.volume === 0 ? volume.value / 100 : 0;
  updateSpeakerIcon(audio.volume);
}

//  Full playlist download 
const downloadAllBtn = $(".audio-playlist-download");
const albumTitle = $("#audio-album-title").innerText.trim();

downloadAllBtn.onclick = async function () {
  const zip = new JSZip();

  // Define a function to add each song to the zip file
  async function addSongToZip(song, index) {
    const response = await fetch(song.path);
    const blob = await response.blob();
    zip.file(`song_${index + 1}.mp3`, blob);
  }

  // Use Promise.all to wait for all songs to be added to the zip
  await Promise.all(app.songs.map((song, index) => addSongToZip(song, index)));

  // Generate and download the zip file with the album title
  zip.generateAsync({ type: "blob" }).then((blob) => {
    const zipFileName = `${albumTitle}_songs.zip`;
    saveAs(blob, zipFileName);
  });
};



app.start();
