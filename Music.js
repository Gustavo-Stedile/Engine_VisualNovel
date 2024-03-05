let shouldStopFading = false;

const Music = {
  currentMusic: '',
  obj: undefined,
  alreadyPlaying: false,
  srcs: [],
  isFading: false,

  fadeIn(ms) {
    return new Promise(res => {
      this.isFading = true;
      let volumeNow = 0;
      this.obj.volume(0);
      const inc = this.currentMusic.volume / ms;

      let counter = 0;
      let id = setInterval(() => {
        try {
          volumeNow+=inc;
          this.obj.volume(volumeNow);
          counter++;
            if (counter > ms || shouldStopFading) {
            clearInterval(id);
            res();
          }
        } catch (err) {
          res();
        }
      }, 1);
    });
  },
  fadeOut(ms) {
    return new Promise(res => {
      let volumeNow = Music.currentMusic.volume;
      const dec = volumeNow / ms;
      
      let id = setInterval(() => {
        volumeNow-=dec;
        try {
          Music.obj.volume(volumeNow);
        } catch (err) {
          clearInterval(id);
          Music.obj.stop();
        }

        if (volumeNow <= 0.0001 || shouldStopFading) {
          Music.obj.stop();
          res();
          clearInterval(id);
        }
      }, 1);
    })
  },
  getDuration(src) {
    return new Promise(res => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        console.log(audio.duration)
        res(audio.duration);
      }
      audio.src = src;
    });
  },
  async add(src) {
    this.obj.addUri(src, ((await this.getDuration(src)) * 1000), src);
    if (!this.srcs.includes(src)) Music.srcs.push(src);
  },
  async play(src, volume, options) {
    if (this.alreadyPlaying) {
      this.shouldStopFading = true;
      this.obj.stop();
    }
    this.currentMusic = {
      src: src, 
      options: options,
      volume: volume,
    }
    this.obj.start(src);
    this.obj.volume(volume);
    this.alreadyPlaying = true;
  },
  stop() {
    shouldStopFading = true;
    Music.alreadyPlaying = false;
    Music.obj.stop();
    shouldStopFading = false;
  }
}
Music.obj = new SeamlessLoop();


