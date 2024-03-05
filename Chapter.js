const ChapterManager = {
  proceedTo(chapter, legitTag) {
    localStorage.setItem('hasToLoad', '0');
    localStorage.setItem('isLegit', legitTag);
    window.location.href = `${chapter}/index.html`;
  },
  load(chapter, legitTag) {
    localStorage.setItem('hasToLoad', '1');
    localStorage.setItem('isLegit', legitTag);
    window.location.href = `${chapter}/index.html`;
  }
};

function Chapter(number, parts) {
  let currentPart = 0;
  let onend = undefined;

  UI.onSaveButtonPressed = () => {
    State.save(number, currentPart, parts[currentPart].getSaveState());
  }

  async function load() {
    const saveState = State.get();
    currentPart = saveState.currentPart;
    parts[currentPart].load(saveState.partState);
  }

  async function loadingMedia() {
    for (let part = currentPart; part < parts.length; part++) {
      await parts[part].loadMedia();
    }
  }

  return {
    setOnEnd(fun) {
      onend = fun;
    },
    async start() {
      const loading = new Loading();
      loading.show();
      if (localStorage.getItem('hasToLoad') === '1') {
        await load();
      }
      await loadingMedia();

      loading.complete();

      await Input.click();
      
      if (localStorage.getItem('hasToLoad') === '1') {
        await GameComponents.load();
      }
      loading.hide();

      for (currentPart; currentPart < parts.length; currentPart++) {
        await parts[currentPart].execute();
      }
      onend();
    }
  }
}