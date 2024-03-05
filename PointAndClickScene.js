function PointAndClickScene(el) {
    const canvas = document.createElement('canvas');
    canvas.style.width = '100vw'; canvas.style.height = '100vh';
    canvas.style.display = 'none';
    const context = canvas.getContext('2d', {willReadFrequently: true});
    let Ir = 16/9
    let stack = []
    let shouldScale = true;
    let onclick = undefined;
    let shouldScan = true;
    let shouldHover = false;
  
    window.onresize = () => {
      shouldScale = true;
    }
  
    const scene = el;
  
    function onElementHover(img) {
      const hover = document.querySelector('.hovers .'+ img.classList[1]);
      if (hover) hover.style.display = 'block';
      scene.onclick = ev => {
        ev.stopPropagation();
        onclick(img);
      }
      document.body.style.cursor = 'pointer';
    }
    function onOutOfHover() {
      document.body.style.cursor = 'default';
      scene.onclick = undefined;
      if (!shouldHover) document.querySelectorAll('.hover').forEach(hover => {
        hover.style.display = 'none';
      });
    }
    
    function transPNG(ev, target) {
      if(!target.offsetParent) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
  
      const isImage = /img/i.test(target.tagName),
        x = ev.pageX - target.offsetParent.offsetLeft,
        y = ev.pageY - target.offsetParent.offsetTop;
      let alpha;
  
      // Draw image to canvas and read Alpha channel value
      if (isImage) {
        if (shouldScale) {
          shouldScale = false;
          scale();
        }
        draw(target);
        alpha = context.getImageData(x, y, 1, 1).data[3]; // [0]R [1]G [2]B [3]A
      }
      
      if (alpha === 0) {          // If pixel is transparent...
        target.hidden = 1         // Make image hidden
        stack.push(target);       // Remember
        onOutOfHover();
        return transPNG(ev, document.elementFromPoint(ev.clientX, ev.clientY)); // REPEAT
      } else {                    // Not transparent! We found our image!
        stack.forEach(el => (el.hidden = 0)); // Show all hidden elements
        stack = [];   
        if (target.className.includes('clickable')) {
          onElementHover(target);            // Reset stack
        }
      }
    }
    
    function scale() {
      canvas.height = window.innerHeight;
      canvas.width = window.innerWidth;
      let Rs = canvas.width/canvas.height;
  
      if (Rs > Ir) {
        newW = 1920 * canvas.height/1080, newH = canvas.height;
        context.translate((canvas.width - newW)/2, (canvas.height - newH) /2)
        context.scale(newW/1920, newH/1080);
      }
      if (Rs < Ir) {
        newW = canvas.width, newH = 1080 * canvas.width / 1920;
        context.translate((canvas.width - newW)/2, (canvas.height - newH)/2)
        context.scale(newW/1920, newH/1080);
      } 
    }
    function draw(img) {
      context.drawImage(img, 0, 0);      
    }
  
    return {
      setOnClick(fun) {
        onclick = fun;
      },
      execute() {
        scene.style.display = 'block';
        document.querySelectorAll('.clickable').forEach(img => {
          img.onmousemove = ev => {
            if (shouldScan) transPNG(ev, img);
            else scene.onclick = undefined;
          }
        })
      },
      removeHover() {
        onOutOfHover();
      },
      setShouldHover(bool) {
        shouldHover = bool
      },
      shouldScan(bool) {
        shouldScan = bool
      }
    }
  }