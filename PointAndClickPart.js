function Interaction(object, event, id) {
  return {
    id: id,
    object: object,
    event: event,
    eventIfAlreadyInteracted: undefined,
    onend: undefined,
    onstart: undefined,

    alreadyInteracted: false,
    getSaveState() {
      return {
        alreadyInteracted: this.alreadyInteracted
      }
    },
    load(state) {
      this.alreadyInteracted = state.alreadyInteracted;
    },
    end() {
      this.alreadyInteracted = true;
    }
  }
}

function PointAndClickPart(firstScene) {
  let alreadyInInteraction = false;

  let shouldEnd = false;
  let onEnd = undefined;
  let onStart = undefined;

  const interactions = {};
  let currentInteraction = undefined;

  const scene = firstScene;

  return {
    async loadMedia() {
      Object.values(interactions).forEach(async interaction => await interaction.event.loadMedia());
    },
    async executeInteraction(interaction) {
      if (!alreadyInInteraction) { 
        alreadyInInteraction = true;
        currentInteraction = interaction.object.className;
        interaction.onstart();
        scene.shouldScan(false);
        document.body.style.cursor = 'default';
        await interaction.event.execute();
        await interaction.event.reset();
        scene.shouldScan(true);
        scene.removeHover();
        alreadyInInteraction = false;
        currentInteraction = undefined;
        interaction.onend();
      }
    },
    bind(object, event) {
      console.log(object);
      const interaction = Interaction(object, event);
      interactions[object.className] = interaction;
      console.log(object);
      return interaction;
    },
    getSaveState() {
      const saveState = {};
      saveState.music = Music.currentMusic;
      saveState.interactionsState = {};
      Object.keys(interactions).map(className => {
        saveState.interactionsState[className] = interactions[className].getSaveState();
      });
      if (currentInteraction != undefined) {
        saveState.currentInteraction = currentInteraction;
        saveState.eventState = interactions[currentInteraction].event.getSaveState();
      }
      console.log(currentInteraction);
      return saveState;
    },
    async load(saveState) {
      onStart();
      const interactionsState = saveState.interactionsState;
      Object.keys(interactionsState).forEach(className => {
        interactions[className].load(interactionsState[className]); //TALVEZ BUGUE, VOLTAR!
      });

      if (saveState.currentInteraction != undefined) {
        currentInteraction = saveState.currentInteraction;
        interactions[currentInteraction].event.load(saveState.eventState);
      }    
    },
    end() {
      shouldEnd = true;
    },
    setOnEnd(fun) {
      onEnd = fun;
    },
    setOnStart(fun) {
      onStart = fun;
    },
    execute() {
      return new Promise(async res => {
        if (onStart != undefined) onStart();

        scene.execute();

        if (currentInteraction != undefined) {
          this.executeInteraction(interactions[currentInteraction])
        }

        scene.setOnClick(el => {
          this.executeInteraction(interactions[el.className]);
        })
      
        id = setInterval(() => {
          if (shouldEnd) {
            clearInterval(id);
            res();
            objects.forEach(object => object.onclick = undefined);
            onEnd();
          }
        });
      })
    }
  }
}