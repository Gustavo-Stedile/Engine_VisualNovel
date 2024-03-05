const State = {
  save(currentChapter, currentPart, partState) {
    localStorage.setItem('saveState', JSON.stringify({
      currentChapter: currentChapter,
      currentPart: currentPart,
      partState: partState,
      background: Background.current, 
      character: Character.current, 
      music: Music.currentMusic,
    }));
  },
  get() {
    return JSON.parse(localStorage.getItem("saveState"));
  },
  delete() {
    localStorage.removeItem("saveState");
  }
}