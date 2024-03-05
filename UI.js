const pauseDiv = document.querySelector('.pause-div');
const salvar = document.querySelector('.salvar');


const UI = {
  togglePause() {
    if (this.isPaused) {
      pauseDiv.style.display = 'none';
      this.isPaused = false;
      onPause();
      return;
    }
    pauseDiv.style.display = 'flex';
    this.isPaused = true;
  },
  unpause() {
    return new Promise(res => {
      setInterval(() => {
        if (!this.isPaused) res(); 
      });
    });
  }
}

const Input = {
  click() {
    return new Promise(res => {
      window.addEventListener('click', async function eventHandler(ev) { 
        ev.stopPropagation();
        this.removeEventListener('click', eventHandler);
        res()
      })
    });
  }
}


function enablePause() {
  document.querySelector('.botao-menu').onclick = ev => {
    ev.stopPropagation();
    UI.togglePause();
  }
  document.querySelector('.botao-sair').onclick = ev => {
    ev.stopPropagation();
    UI.togglePause();
  }

  window.onkeyup = ev => {
    ev.stopPropagation();

    if (ev.key === 'Escape') {
      UI.togglePause();
    }
  }
}

function Loading() {
  const loadingScreen = document.querySelector('.loading');
    return {
    show() {
      loadingScreen.style.display = 'flex';
    },
    complete() {
      document.querySelector('.carregando').style.display = 'none';
      document.querySelector('.carregamento-completo').style.display = 'block';
      loadingScreen.innerHTML += 'clique para continuar';
    },
    hide() {
      loadingScreen.remove(); 
      enablePause();
    }
  }
}

salvar.onclick = async () => {
  const salvando = document.querySelector('.salvando');
  salvando.style.opacity = '1';
  UI.onSaveButtonPressed();
  await delay(1000);
  salvando.textContent = 'salvo'
  await delay(1000);
  document.querySelector('.salvando').style.opacity = '0';
  await delay(1000);
  salvando.textContent = 'salvando...';
}
pauseDiv.onclick = ev => ev.stopPropagation();
