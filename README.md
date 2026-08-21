# Clínica Dental Dra. Mariángeles Lazcano

Web de la clínica dental en Jerez de la Frontera. Proyecto 2WEB.

## Estructura

- `index.html` — portada: hero, tratamientos, sección Nosotros (con la clínica desplegable) y contacto con mapa.
- `cita.html` — sistema de citas online.
- `estilos/estilos.css` — estilos globales; `estilos/citas.css` — estilos del sistema de citas.
- `js/nosotros.js` — desplegable Ver más/Ver menos y lightbox de fotos; `js/citas.js` — lógica de citas.
- `imagenes/` — fotos de la doctora, equipo, local y sonrisas.

## Sección Nosotros

Resumen de la doctora siempre visible (formación en Leipzig, +18 años, cita personal) y, al pulsar **Ver más**, se despliega la clínica completa: el local (galería con lightbox), el equipo y sonrisas reales. Todas las fotos son clicables y se amplían en el lightbox (×, flechas ◀ ▶ o teclado ←/→/Esc).

Guía rápida: los bloques del desplegable viven en `index.html` (`#clinica`), las fotos clicables llevan `data-full="..."` y la lógica está en `js/nosotros.js`.
