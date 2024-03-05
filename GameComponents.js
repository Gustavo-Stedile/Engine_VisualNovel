const DialogueBox = {
  element: document.querySelector('.dialogue-box'),

  show() {
    this.element.style.display = 'block';
  },
  async fadeIn(ms) {
    await fadeInElement(this.element, ms);
  },
  async fadeOut(ms) {
    await fadeOutElement(this.element, ms)
  }
}

const Character = {
  current: undefined,
  show() {
    characterImage.style.display = 'block';
  },
  show(src) {
    characterImage.style.display = 'block';
    characterImage.src = src;
    this.current = src;
  },
  hide() {
    characterImage.style.display = 'none'
  },
  async fadeIn(ms) {
    await fadeInElement(characterImage, ms);
  }, 
  async fadeOut(ms) {
    await this.fadeOut(characterImage, ms);
  }
}

const Background = {
  current: undefined,
  show(background) {
    if (!background) return;
    UI.currentBackground = background;
    this.current = background;

    if (background.includes('show')) {
      document.querySelector('.'+background.split(' ')[1]).style.display = 'block';
  
    } else if (background === 'none') {
      document.querySelector('.background').display = 'none';
      UI.currentBackground = '';
  
    } else if (background.includes('hide')) {
      document.querySelector('.'+background.split(' ')[1]).style.display = 'none';
      UI.currentBackground = '';
  
    } else {
      document.querySelector('.background').style.backgroundImage = `url(${background})`;
    }
  }
}

function fadeInElement(el, ms) {
  return new Promise(async res => {
    el.animate([{opacity: 0}, {opacity: 1}], {duration: ms, iterations: 1});
    await delay(ms)
    res();
  });
}

function fadeOutElement(el, ms) {
  return new Promise(async res => {
    el.animate([{opacity: 1}, {opacity: 0}], {duration: ms, iterations: 1});
    await delay(ms-10)
    el.style.display = 'none'
    el.style.opacity = '1';
    res();
  }); 
}

//Music is also considerated a GameComponnet
const GameComponents = {
  load() {
    const saveState = State.get();
    return new Promise(async res => {
      console.log(saveState.character);
      if (saveState.character) Character.show(saveState.character);
      if (saveState.background) Background.show(saveState.background);
      
      if (saveState.music) {
        await Music.add(saveState.music.src);
        await Music.play(saveState.music.src, saveState.music.volume, saveState.music.options);
      }
      res();
    })
  }
}