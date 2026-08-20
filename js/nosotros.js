document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-ver-mas');
  const clinica = document.getElementById('clinica');

  if (btn && clinica) {
    btn.addEventListener('click', () => {
      const abierto = clinica.hidden;
      clinica.hidden = !abierto;
      btn.textContent = abierto ? 'Ver menos' : 'Ver más';
      btn.setAttribute('aria-expanded', String(abierto));
      if (abierto) {
        clinica.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  const items = Array.from(document.querySelectorAll('.galeria-item-clinica'));
  const lightbox = document.getElementById('lightbox-clinica');
  if (!items.length || !lightbox) return;

  const img = lightbox.querySelector('.lightbox-img');
  const cerrar = lightbox.querySelector('.lightbox-cerrar');
  const anterior = lightbox.querySelector('.lightbox-anterior');
  const siguiente = lightbox.querySelector('.lightbox-siguiente');
  let actual = 0;

  const abrir = (i) => {
    actual = i;
    img.src = items[actual].dataset.full;
    img.alt = items[actual].querySelector('img').alt;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  };

  const cerrarLightbox = () => {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  };

  const navegar = (dir) => {
    actual = (actual + dir + items.length) % items.length;
    img.src = items[actual].dataset.full;
    img.alt = items[actual].querySelector('img').alt;
  };

  items.forEach((item, i) => {
    item.addEventListener('click', () => abrir(i));
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        abrir(i);
      }
    });
  });

  cerrar.addEventListener('click', cerrarLightbox);
  anterior.addEventListener('click', () => navegar(-1));
  siguiente.addEventListener('click', () => navegar(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) cerrarLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') cerrarLightbox();
    if (e.key === 'ArrowLeft') navegar(-1);
    if (e.key === 'ArrowRight') navegar(1);
  });
});
