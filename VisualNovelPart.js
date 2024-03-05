const characterImage = document.querySelector('.character');
const seta = document.querySelector('.seta');

const choiceBox = document.querySelector('.choices');
const nameBox = document.querySelector('.character-name')


function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function createChoice(choice) {
  const choiceEl = document.createElement('div');
  choiceEl.className = 'choice';
  choiceEl.textContent = choice.message;
  choiceBox.appendChild(choiceEl);
  return choiceEl;
}

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
function VisualNovelPart(Astory) {
  let currentStep = 0;

  let story = Astory;

  let shouldEnd = false;
  let onend;

  function choosing(step) {
    return new Promise(res => {
      step.choices.forEach(choice => {
        const choiceEl = createChoice(choice);
        
        choiceEl.onclick = async ev => {
          ev.preventDefault();
          ev.stopPropagation();
          choiceBox.innerHTML = '';
          
          if (choice.goto) {
            goTo(choice.goto);
          } if (choice.action) {
            if (typeof choice.action === 'function') {
              await choice.action({
                music: music,
              });
            }

            if (choice.action === 'end') {
              shouldEnd = true;
            }
          }
          res();
        }
      });
    });
  }
  
  async function handleChoice(choices) {
    choiceBox.innerHTML = '';
    choiceBox.style.display = 'flex';
    await choosing(choices);
  }
  
  
  
  function goTo(label) {
    story.forEach((step, i) => {
      if (step.label != undefined && step.label === label) {
        currentStep = i;
      }
    });
  }

  return {
    defaults: {
      voice: undefined,
      name: undefined,
    },
    storyboard(obj) {
      story = obj;
    },
    getSaveState() {
      return {
        currentStep: currentStep,
      }
    },
    setOnEnd(fun) {
      onend = fun;
    },
    reset() {
      currentStep = 0;
      shouldEnd = false;
    },
    end() {
      shouldEnd = true;
    },
    load(state) {
      currentStep = state.currentStep;
    },  
    async loadMedia() {
      for (let i = currentStep; i < story.length; i++) {
        if (story[i].music && story[i].music.src) {
          Music.add(story[i].music.src);
        }
        if (story[i].character) {
          const image = new Image();
          image.src = story[i].character;
        }
        if (story[i].background && !story[i].background.includes("show") && !story[i].background.includes("hide")) {
          const image = new Image();
          image.src = story[i].background;
        }
      }
    },
    execute() {
      return new Promise(async res => {
        console.log(currentStep);
        id = setInterval(() => {
          if (shouldEnd) {
            res();
            clearInterval(id);
          }
        });
        
        while (currentStep < story.length) {
          if (shouldEnd) break;
          const step = story[currentStep];
          
          if (step.character) {
            Character.show(step.character);
          }
          if (step.background) {
            Background.show(step.background);
          }
          if (step.music) {
            if (step.music.src) Music.play(step.music.src, step.music.volume, step.music.options);
            if (step.music.state && step.music.state == 'stop') Music.stop();
          }
          //ação em cima dos gamecomponents já registrados
          if (step.onStart) {
            console.log('eita');
            await step.onStart();
          }
          
          if (step.dialogue) {
            let voice;
            if (!step.dialogue.voice) {
              if (this.defaults.voice) {
                voice = this.defaults.voice;
              }
            } else {
              voice = step.dialogue.voice;
            }
            if (step.dialogue.voice === "none") {
              voice = undefined;
            }
            const name = step.name != undefined ? step.name : this.defaults.name;

            const dialogue = Dialogue(step.dialogue.content, name, voice, {...step.dialogue});
            let shouldStop = !step.choices;
            await dialogue.execute(shouldStop);
          }
          if (step.choices) {
            await handleChoice(step);
          }

          if (step.onEnd) await step.onEnd();
          if (!step.goto && !step.choices) currentStep++;
          if (!step.choices) goTo(step.goto);
        }
        if (onend) onend();
        res();
      })
    }
  }
}
