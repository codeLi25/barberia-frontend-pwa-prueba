

(function () {
  const SELECTOR = {
    filters: '.filtro-btn',
    grid: '.servicios-grid',
    prev: '.carrusel-btn.prev',
    next: '.carrusel-btn.next',
    dots: '.carousel-dots'
  };

  const serviciosData = [
    { cat: 'cortes', img: 'img/taperFade.jpeg', title: 'Corte Taper Fade', desc: 'Degradado suave y discreto para un estilo pulido y versátil.' },
    { cat: 'cortes', img: 'img/lowFade.jpg', title: 'Corte Low Fade', desc: 'Degradado bajo que inicia cerca de las orejas para un look limpio y sutil.' },
    { cat: 'cortes', img: 'img/midFade.jpeg', title: 'Corte Mid Fade', desc: 'Equilibrio perfecto: degradado a media altura para definición sin excesos.' },
    { cat: 'cortes', img: 'img/highFade.jpeg', title: 'Corte High Fade', desc: 'Degradado alto y audaz que crea un contraste fuerte y moderno.' },
    { cat: 'cortes', img: 'img/corteClasico.jpg', title: 'Corte Clásico', desc: 'Elegancia atemporal para el hombre que prefiere un estilo siempre apropiado.' },
    { cat: 'cortes', img: 'img/corteSpiky.jpeg', title: 'Corte Spiky', desc: 'Picos y textura para un look juvenil, lleno de actitud y energía.' },
    { cat: 'cortes', img: 'img/corteBroccoli.jpg', title: 'Corte Broccoli', desc: 'Tendencia juvenil con textura definida en la parte superior, popularizado por nuevas generaciones con estilo urbano.' },
    { cat: 'cortes', img: 'img/corteBuzzCut.jpg', title: 'Corte Buzz Cut', desc: 'Máxima simplicidad y practicidad, demuestra confianza en tu estilo sin necesidad de adornos complicados.' },
    { cat: 'cortes', img: 'img/corteCurlyFade.jpg', title: 'Corte Curly Fade', desc: 'Combina rizos naturales con degradados precisos, resaltando tu textura natural con diseño profesional impecable.' },
    { cat: 'cortes', img: 'img/corteMohawk.jpg', title: 'Corte Mohawk', desc: 'Declaración de estilo audaz y rebelde, perfecto para personalidades que no temen destacar y romper moldes.' },
    { cat: 'barba',   img: 'img/shortBeard.jpg',    title: 'Barba Short Beard', desc: 'Barba corta y uniforme, perfecta para un look pulido y de fácil mantenimiento.' },
    { cat: 'barba',   img: 'img/stubbleBeard.jpg',    title: 'Barba Stubble Beard', desc: 'Vello corto de 2 a 5 días, con bordes definidos para un estilo casual y masculino.' },
    { cat: 'barba',   img: 'img/goatee.jpg',    title: 'Barba Goatee', desc: 'Estilo focalizado en el mentón y el bigote, ideal para definir el rostro con un toque clásico.' },
    { cat: 'barba',   img: 'img/dutchBeard.jpg',    title: 'Barba Dutch Beard', desc: 'Bigote y barba en el mentón separados, sin conexión en los lados. Estilo audaz y geométrico.' },
    { cat: 'barba',   img: 'img/circleBeard.jpg',    title: 'Barba Circle Beard', desc: 'Bigote y barba conectados formando un círculo perfecto. Versión pulida de la goatee.' },
    { cat: 'barba',   img: 'img/fullBeard.jpg',    title: 'Barba Full Beard', desc: 'Barba tupida y larga, que requiere cuidado y define un estilo de presencia fuerte.' },
    { cat: 'barba',   img: 'img/barbaDelineada.jpg',    title: 'Barba Delineada', desc: 'Contornos afilados en mejillas y cuello para un acabado impecable y moderno.' },
    { cat: 'barba',   img: 'img/barbaVikinga.jpg',    title: 'Barba Vikinga', desc: 'Barba larga, tupida y a menudo natural, que evoca fuerza y un estilo robusto nórdico.' },
    { cat: 'barba',   img: 'img/barbaEstiloVerdi.jpg',    title: 'Barba Estilo Verdi', desc: 'Barba completa pero con bigote prominente y bien arreglado, de inspiración clásica e italiana.' },
    { cat: 'facial',  img: 'img/facial.jpeg',   title: 'Tratamiento Facial', desc: 'Revitaliza tu piel con nuestros tratamientos exclusivos.' },
    { cat: 'paquete', img: 'img/paquete.jpeg',  title: 'Paquete Premium', desc: 'Corte, barba y facial en una experiencia de lujo.' },
    /* agregar más objetos aquí */
  ];

  // DOM
  const gridEl = document.querySelector(SELECTOR.grid);
  const prevBtn = document.querySelector(SELECTOR.prev);
  const nextBtn = document.querySelector(SELECTOR.next);
  const dotsEl = document.querySelector(SELECTOR.dots);
  const filterBtns = document.querySelectorAll(SELECTOR.filters);

  let currentPage = 0;
  let totalPages = 1;
  let currentFilter = 'cortes';
  let allCards = [];

  const getPageSize = () => {
    if (window.innerWidth <= 600) return 2;  
    if (window.innerWidth <= 900) return 4;  
    return 8;                                
  };

  function createCard(data) {
    const card = document.createElement('article');
    card.className = `servicio-card ${data.cat}`;
    card.innerHTML = `
      <img class="thumb" src="${data.img}" alt="${data.title}">
      <div class="servicio-info">
        <h3>${data.title}</h3>
        <p>${data.desc}</p>
      </div>
    `;
    return card;
  }

  function buildCards() {
    allCards = serviciosData.map(d => createCard(d));
  }

  function renderPages() {
    const pageSize = getPageSize();
    const filtered = allCards.filter(c => c.classList.contains(currentFilter));
    const count = filtered.length;
    totalPages = Math.max(1, Math.ceil(count / pageSize));

    if (currentPage >= totalPages) currentPage = totalPages - 1;
    gridEl.innerHTML = '';
    dotsEl.innerHTML = '';

    const track = document.createElement('div');
    track.className = 'carousel-track';
    track.style.display = 'flex';

    for (let p = 0; p < totalPages; p++) {
      const page = document.createElement('div');
      page.className = 'page';
      page.style.flex = '0 0 100%';
      page.style.boxSizing = 'border-box';

      const pageGrid = document.createElement('div');
      pageGrid.className = 'page-grid';

      const start = p * pageSize;
      const end = Math.min(start + pageSize, count);
      for (let i = start; i < end; i++) {
        pageGrid.appendChild(filtered[i]);
      }

      page.appendChild(pageGrid);
      track.appendChild(page);

      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Página ${p + 1}`);
      dot.addEventListener('click', () => {
        currentPage = p;
        updateTrack();
        updateArrows();
      });
      dotsEl.appendChild(dot);
    }

    gridEl.appendChild(track);
    updateTrack();
    updateArrows();
  }

  function updateTrack() {
    const track = gridEl.querySelector('.carousel-track');
    if (!track) return;
    track.style.transform = `translateX(-${currentPage * 100}%)`;
    const dots = dotsEl.querySelectorAll('button');
    dots.forEach((d, i) => d.classList.toggle('active', i === currentPage));
  }

  function updateArrows() {
    if (!prevBtn || !nextBtn) return;
    if (totalPages <= 1) {
      prevBtn.style.opacity = '0';
      nextBtn.style.opacity = '0';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
    } else {
      prevBtn.style.opacity = '1';
      nextBtn.style.opacity = '1';
      prevBtn.disabled = currentPage === 0;
      nextBtn.disabled = currentPage === totalPages - 1;
    }
  }

  function setFilter(filter) {
    currentFilter = filter;
    currentPage = 0;
    filterBtns.forEach(b => {
      const isActive = b.dataset.filtro === filter;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    renderPages();
  }

  function initControls() {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 0) currentPage--;
      updateTrack(); updateArrows();
    });
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages - 1) currentPage++;
      updateTrack(); updateArrows();
    });
    filterBtns.forEach(btn => btn.addEventListener('click', () => setFilter(btn.dataset.filtro)));

    gridEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' && currentPage < totalPages - 1) { currentPage++; updateTrack(); updateArrows(); }
      if (e.key === 'ArrowLeft' && currentPage > 0) { currentPage--; updateTrack(); updateArrows(); }
    });
  }

  let resizeTimer;
  function initResizeWatcher() {
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => renderPages(), 140);
    });
  }

  function init() {
    buildCards();
    initControls();
    initResizeWatcher();
    setFilter(currentFilter);
  }

  init();
})();
