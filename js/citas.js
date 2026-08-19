const STORAGE_KEY = "dentistaMariAngelesCitas";

const form = document.getElementById("citaForm");
const fecha = document.getElementById("fecha");
const hora = document.getElementById("hora");
const tratamiento = document.getElementById("tratamiento");
const mensajeExito = document.getElementById("mensajeExito");
const detalleExito = document.getElementById("detalleExito");
const nuevaCita = document.getElementById("nuevaCita");
const verCitas = document.getElementById("verCitas");
const misCitas = document.getElementById("misCitas");
const listaCitas = document.getElementById("listaCitas");

const resumenTratamiento = document.getElementById("resumenTratamiento");
const resumenFecha = document.getElementById("resumenFecha");
const resumenHora = document.getElementById("resumenHora");

const horarios = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

const hoy = new Date();
hoy.setHours(0,0,0,0);
fecha.min = hoy.toISOString().split("T")[0];

function obtenerCitas() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function guardarCitas(citas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(citas));
}

function esFinDeSemana(dateString) {
  const d = new Date(dateString + "T00:00:00");
  return d.getDay() === 0 || d.getDay() === 6;
}

function horasDisponibles(dateString) {
  if (!dateString || esFinDeSemana(dateString)) return [];
  const citas = obtenerCitas();
  const ocupadas = citas
    .filter(c => c.fecha === dateString && c.estado !== "Cancelada")
    .map(c => c.hora);
  return horarios.filter(h => !ocupadas.includes(h));
}

function actualizarHoras() {
  const seleccion = fecha.value;
  hora.innerHTML = "";

  if (!seleccion) {
    hora.disabled = true;
    hora.innerHTML = '<option value="">Primero selecciona una fecha</option>';
    actualizarResumen();
    return;
  }

  if (esFinDeSemana(seleccion)) {
    hora.disabled = true;
    hora.innerHTML = '<option value="">No hay consulta ordinaria este día</option>';
    actualizarResumen();
    return;
  }

  const disponibles = horasDisponibles(seleccion);
  hora.disabled = disponibles.length === 0;

  if (!disponibles.length) {
    hora.innerHTML = '<option value="">No quedan horas disponibles</option>';
  } else {
    hora.innerHTML = '<option value="">Selecciona una hora</option>' +
      disponibles.map(h => `<option value="${h}">${h}</option>`).join("");
  }
  actualizarResumen();
}

function actualizarResumen() {
  resumenTratamiento.textContent = tratamiento.value || "—";
  resumenFecha.textContent = fecha.value
    ? new Date(fecha.value + "T00:00:00").toLocaleDateString("es-ES", {
        weekday:"long", day:"2-digit", month:"long", year:"numeric"
      })
    : "—";
  resumenHora.textContent = hora.value || "—";
}

function mostrarCitas() {
  const citas = obtenerCitas().sort((a,b) =>
    `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`)
  );
  misCitas.hidden = false;

  if (!citas.length) {
    listaCitas.innerHTML = '<div class="sin-citas">Todavía no hay citas registradas en este navegador.</div>';
    return;
  }

  listaCitas.innerHTML = citas.map(c => `
    <article class="cita-item">
      <div>
        <h3>${escapeHtml(c.tratamiento)}</h3>
        <p class="cita-meta"><strong>${escapeHtml(c.nombre)}</strong> · ${escapeHtml(c.telefono)}</p>
        <p class="cita-meta">${formatearFecha(c.fecha)} · ${escapeHtml(c.hora)}</p>
        <span class="cita-estado">${escapeHtml(c.estado)}</span>
      </div>
      ${c.estado !== "Cancelada"
        ? `<button class="btn btn-cancelar" type="button" data-id="${c.id}">Cancelar</button>`
        : ""}
    </article>
  `).join("");

  listaCitas.querySelectorAll("[data-id]").forEach(btn => {
    btn.addEventListener("click", () => cancelarCita(btn.dataset.id));
  });
}

function cancelarCita(id) {
  const citas = obtenerCitas();
  const cita = citas.find(c => c.id === id);
  if (!cita || !confirm(`¿Cancelar la cita del ${formatearFecha(cita.fecha)} a las ${cita.hora}?`)) return;
  cita.estado = "Cancelada";
  guardarCitas(citas);
  actualizarHoras();
  mostrarCitas();
}

function formatearFecha(value) {
  return new Date(value + "T00:00:00").toLocaleDateString("es-ES", {
    weekday:"long", day:"2-digit", month:"long", year:"numeric"
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[char]));
}

fecha.addEventListener("change", actualizarHoras);
hora.addEventListener("change", actualizarResumen);
tratamiento.addEventListener("change", actualizarResumen);

form.addEventListener("submit", e => {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  const citas = obtenerCitas();

  if (esFinDeSemana(data.get("fecha"))) {
    alert("La consulta ordinaria funciona de lunes a viernes. Para urgencias, llama al 856 81 51 99.");
    return;
  }

  const repetida = citas.some(c =>
    c.fecha === data.get("fecha") &&
    c.hora === data.get("hora") &&
    c.estado !== "Cancelada"
  );

  if (repetida) {
    alert("Ese horario acaba de ser ocupado. Selecciona otra hora.");
    actualizarHoras();
    return;
  }

  const cita = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    nombre: data.get("nombre"),
    telefono: data.get("telefono"),
    email: data.get("email"),
    tratamiento: data.get("tratamiento"),
    fecha: data.get("fecha"),
    hora: data.get("hora"),
    notas: data.get("notas"),
    estado: "Pendiente"
  };

  citas.push(cita);
  guardarCitas(citas);

  detalleExito.textContent =
    `Hemos registrado tu solicitud para ${formatearFecha(cita.fecha)} a las ${cita.hora}, ` +
    `para ${cita.tratamiento}. Para confirmar cambios o urgencias, llama al 856 81 51 99.`;

  form.hidden = true;
  mensajeExito.hidden = false;
  mostrarCitas();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

nuevaCita.addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  mensajeExito.hidden = true;
  actualizarHoras();
  actualizarResumen();
});

verCitas.addEventListener("click", () => {
  mostrarCitas();
  misCitas.scrollIntoView({ behavior: "smooth" });
});

actualizarHoras();
actualizarResumen();
