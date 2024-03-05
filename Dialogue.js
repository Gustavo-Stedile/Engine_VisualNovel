function Dialogue(what, who, Avoice, options) {
  function checkForBold(text) {
    const info = {
      hasBold: false, 
      range: {
        start: 0, 
        end: 0
      },
      shouldBeBold(i) {
        return i > this.range.start && i < this.range.end
      },
      textWithoutMarker: undefined,
    }

    info.has = false; 
    info.range.start = 0;
    info.range.end = 0;
    if (text.includes('<b>')) {
      info.range.start = text.indexOf('<b>') - 2;
      info.range.end = text.lastIndexOf('</b>') - 3;
      info.textWithoutMarker = text,
      info.textWithoutMarker = info.textWithoutMarker.replace('<b>', ''),
      info.textWithoutMarker = info.textWithoutMarker.replace('</b>', ''); 
      info.hasBold = true;
    }
    return info;
  }

  return {
    async execute(shouldStop) {
      let bunch = '';
      let shouldSkip = false;
      const dialogueText = what;
      nameBox.textContent = who;

      DialogueBox.element.textContent = '';

      if (options.delay) await delay(options.delay);
      
      const voice = Avoice ? new Audio(Avoice.src) : undefined;
      if (Avoice && Avoice.volume) voice.volume = Avoice.volume;      
      let dialogueParts = dialogueText.split('|');

      for (let part = 0; part < dialogueParts.length; part++) {
        if (voice) voice.play();
        bunch += dialogueParts[part];
        window.addEventListener('click', async function eventHandler(ev) { 
          ev.stopPropagation();
          shouldSkip = true;
          this.removeEventListener('click', eventHandler);
        })

        const boldInfo = checkForBold(dialogueParts[part]);
        if (boldInfo.hasBold) dialogueParts[part] = boldInfo.textWithoutMarker;

    
        for (let char = 0; char < dialogueParts[part].length; char++) {
          if (UI.isPaused) {
            voice.pause();
            await UI.unpause();
          }
          
          if (shouldSkip) {
            DialogueBox.element.innerHTML = bunch;
            shouldSkip = false;
            break;
          }
    
          if (boldInfo.hasBold && boldInfo.shouldBeBold((part * dialogueParts[part].length) + char)) {
            DialogueBox.element.innerHTML += `<b>${dialogueParts[part][char]}</b>`;
          } else {
            DialogueBox.element.innerHTML += dialogueParts[part][char];
          }

          if (options.typeDelay) await delay(options.typeDelay);
          else await delay(40);
        }
        
        if (voice) voice.pause();
        if (what.includes("|") && part < dialogueParts.length-1) {
          await Input.click();        
          DialogueBox.element.innerHTML = bunch;
          shouldSkip = false;
        }
      }
      seta.style.display = 'block';
      if (shouldStop) await Input.click();
      seta.style.display = 'none';
    }
  }
}