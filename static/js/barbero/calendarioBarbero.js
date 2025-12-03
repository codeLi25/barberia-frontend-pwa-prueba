document.addEventListener("DOMContentLoaded", () => {
  const calendar = document.getElementById("calendar");
  const btnMes = document.getElementById("btnMes");
  const btnSemana = document.getElementById("btnSemana");
  const btnHoy = document.getElementById("btnHoy");
  const tituloSemana = document.getElementById("tituloSemana");
  const prevSemana = document.getElementById("prevSemana");
  const nextSemana = document.getElementById("nextSemana");

  // Modal
  const modalOverlay = document.getElementById("modalCita");
  const cerrarModal = document.getElementById("cerrarModal");
  const detalleIdUsuario = document.getElementById("detalleIdUsuario");
  const detalleNombre = document.getElementById("detalleNombre");
  const detalleServicio = document.getElementById("detalleServicio");
  const detalleFecha = document.getElementById("detalleFecha");
  const detalleHora = document.getElementById("detalleHora");
  const botonesModal = document.getElementById("botonesModal"); // contenedor para botones dinámicos

  let vistaActual = "semana";
  let fechaReferencia = new Date();

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const horas = [];
  for (let h = 9; h <= 20; h++) horas.push(`${h.toString().padStart(2, "0")}:00`);

  // ===== FUNCIONES =====
  function estadoColor(estado) {
    switch (estado) {
      case "pendiente": return "#f9c74f";
      case "confirmada": return "#577590";
      case "cancelada": return "#f94144";
      case "completada": return "#90be6d";
      default: return "#aaaaaa";
    }
  }

  // Parsear fecha "YYYY-MM-DD" como Date local (sin shift timezone)
  function parseDateYMD(ymd) {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  // Parsear hora "HH:mm" o "HH:mm:ss" en {h, m}
  function parseTime(hms) {
    const parts = hms.split(":").map(Number);
    return { h: parts[0] || 0, m: parts[1] || 0 };
  }
  // Formatear fecha a YYYY-MM-DD
  function toYMD(date) {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const d = date.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function getSemanaDias() {
    const primerDiaSemana = new Date(fechaReferencia);
    const diaActual = primerDiaSemana.getDay();
    // Queremos lunes como primer día
    primerDiaSemana.setDate(fechaReferencia.getDate() - ((diaActual + 6) % 7));

    const semanaDias = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(primerDiaSemana);
      d.setDate(primerDiaSemana.getDate() + i);
      semanaDias.push(d);
    }
    return semanaDias;
  }

  function renderCalendarioSemanal() {
    calendar.className = "calendar-grid week";
    const semanaDias = getSemanaDias();

    const mesNombre = semanaDias[0].toLocaleString("es-ES", { month: "long" });
    tituloSemana.textContent = `Semana del ${semanaDias[0].getDate()} al ${semanaDias[6].getDate()} de ${mesNombre}`;

    let html = `<div class="day-header"></div>`;
    semanaDias.forEach(dia => {
      html += `<div class="day-header">${diasSemana[dia.getDay() === 0 ? 6 : dia.getDay() - 1]}<br>${dia.getDate()}</div>`;
    });

    horas.forEach(hora => {
      html += `<div class="hour-label">${hora}</div>`;
      semanaDias.forEach(() => {
        html += `<div class="hour-cell"></div>`;
      });
    });

    calendar.innerHTML = html;

    // Marcar hoy
    const hoy = new Date();
    semanaDias.forEach((dia, i) => {
      if (dia.toDateString() === hoy.toDateString()) {
        const headers = document.querySelectorAll(".day-header");
        headers[i + 1].classList.add("today");
      }
    });

    cargarCitas(semanaDias);
  }

  function renderCalendarioMensual() {
    calendar.className = "calendar-grid month";
    const anio = fechaReferencia.getFullYear();
    const mes = fechaReferencia.getMonth();
    const primerDiaMes = new Date(anio, mes, 1);
    const ultimoDiaMes = new Date(anio, mes + 1, 0);

    let inicio = primerDiaMes.getDay() === 0 ? 6 : primerDiaMes.getDay() - 1;
    let totalDias = ultimoDiaMes.getDate();

    tituloSemana.textContent = `${primerDiaMes.toLocaleString("es-ES", { month: "long" })} ${anio}`;

    let html = "";
    diasSemana.forEach(dia => html += `<div class="day-header">${dia}</div>`);

    // dias vacíos iniciales
    for (let i = 0; i < inicio; i++) html += `<div class="hour-cell empty"></div>`;
    // dias del mes: añadimos data-date
    for (let d = 1; d <= totalDias; d++) {
      const fecha = new Date(anio, mes, d);
      const isToday = fecha.toDateString() === new Date().toDateString();
      const ymd = toYMD(fecha);
      html += `<div class="hour-cell ${isToday ? "today" : ""}" data-date="${ymd}"><span class="day-number">${d}</span><div class="day-count" style="margin-top:6px;font-weight:700;"></div></div>`;
    }

    calendar.innerHTML = html;

    // Cargar citas para el mes y poner recuentos por día
    cargarCitas(); // sin semanaDias => asumirá mes
  }

  // ===== CARGAR CITAS =====
  async function cargarCitas(semanaDias = null) {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      if (!usuario || usuario.rol !== "barbero") return;

      // Obtener todas las citas del barbero
      const response = await fetch(`https://app-barberia-production.up.railway.app/api/barbero/${usuario.idUsuario}`);
      if (!response.ok) throw new Error("Error al obtener citas");

      const citas = await response.json();
      console.log("📅 Citas recibidas:", citas);

      if (vistaActual === "semana" && semanaDias) {
        // Limpiar las celdas antes de renderizar nuevas
        document.querySelectorAll(".hour-cell").forEach(cell => cell.innerHTML = "");

        const inicioSemana = semanaDias[0];
        const finSemana = semanaDias[6];

        // Filtrar citas de la semana
        const citasSemana = citas.filter(cita => {
          const fecha = parseDateYMD(cita.fecha);
          return fecha >= inicioSemana && fecha <= finSemana;
        });

        citasSemana.forEach(cita => {
          const diaFecha = parseDateYMD(cita.fecha);
          // getDay(): 0 = domingo, 1 = lunes ... → ajustamos para que lunes sea 0
          const diaIndex = diaFecha.getDay() === 0 ? 6 : diaFecha.getDay() - 1;

          const { h } = parseTime(cita.horaInicio || cita.hora || "09:00");
          const filaHora = h - 9; // fila 0 = 9:00
          if (filaHora < 0 || filaHora >= hoursCount()) return;

          const celdas = document.querySelectorAll(".hour-cell");
          const index = filaHora * 7 + diaIndex;
          const celda = celdas[index];
          if (!celda) return;

          // Crear el bloque del evento
          const evento = document.createElement("div");
          evento.classList.add("event");

          // Texto del evento (cliente - servicio + detalleExtra)
          let textoEvento = `${cita.nombreCliente || "Cliente"} - ${cita.nombreServicio || ""}`;
          if (cita.detalleExtra && cita.detalleExtra.trim() !== "") {
            textoEvento += ` (${cita.detalleExtra.trim()})`;
          }
          evento.textContent = textoEvento;

          // Guardar datos en el dataset
          evento.dataset.idCita = cita.idCita;
          evento.dataset.idUsuario = cita.idUsuario;
          evento.dataset.nombre = cita.nombreCliente || "";
          evento.dataset.servicio = cita.nombreServicio || "";
          evento.dataset.fecha = cita.fecha;
          evento.dataset.horaInicio = cita.horaInicio || "";
          evento.dataset.horaFin = cita.horaFin || "";
          evento.dataset.estado = cita.estado || "";
          evento.dataset.detalleExtra = cita.detalleExtra || "";

          // Color según estado
          evento.style.backgroundColor = estadoColor(cita.estado);

          // Agregar al calendario
          celda.appendChild(evento);

          // Click para abrir modal con detalles
          evento.addEventListener("click", () => openModalWithCita(cita, evento));
        });

      } else if (vistaActual === "mes") {
        // ===== Vista mensual =====
        const counts = {};
        citas.forEach(cita => {
          const ymd = cita.fecha;
          counts[ymd] = (counts[ymd] || 0) + 1;
        });

        const dayCells = calendar.querySelectorAll('.hour-cell[data-date]');
        dayCells.forEach(cell => {
          const ymd = cell.getAttribute('data-date');
          const count = counts[ymd] || 0;
          const countDiv = cell.querySelector('.day-count');
          if (countDiv) {
            countDiv.textContent = count > 0 ? `${count} reserva${count > 1 ? 's' : ''}` : '';
          }
          if (count > 0) {
            cell.classList.add('has-reservas');
          }
          cell.onclick = () => {
            if ((counts[ymd] || 0) > 0) {
              showToast(`${counts[ymd]} reserva(s) el ${ymd}`, 'info', 2500);
            }
          };
        });
      }
    } catch (err) {
      console.error("❌ Error al cargar citas:", err);
      showToast("Error al cargar las citas", "error");
    }
  }

  // ===== Funciones auxiliares =====
  function hoursCount() {
    return hoursArray().length;
  }

  function hoursArray() {
    const arr = [];
    for (let h = 9; h <= 20; h++) arr.push(h);
    return arr;
  }

  // Convertir "2025-11-03" → Date
  function parseDateYMD(ymd) {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  // Convertir "11:00" → {h: 11, m: 0}
  function parseTime(horaStr) {
    const [h, m] = horaStr.split(":").map(Number);
    return { h, m };
  }

  // ===== MODAL / ACCIONES =====
  function openModalWithCita(cita, eventoEl) {
    function formatTime(timeStr) {
      if (!timeStr) return '';
      const parts = timeStr.split(':');
      const h = parts[0] ? parts[0].padStart(2, '0') : '00';
      const m = parts[1] ? parts[1].padStart(2, '0') : '00';
      return `${h}:${m}`;
    }

    console.log('Cita abierta en modal:', cita);

    const estado = cita.estado || 'pendiente';
    detalleIdUsuario.textContent = cita.idUsuario || eventoEl.dataset.idUsuario || '';
    detalleNombre.textContent = cita.nombreCliente || eventoEl.dataset.nombre || '';
    detalleServicio.textContent = cita.nombreServicio || eventoEl.dataset.servicio || '';
    detalleFecha.textContent = cita.fecha || '';

    // Horas
    const detalleHoraFin = document.getElementById("detalleHoraFin");
    const horaInicio = cita.horaInicio || cita.hora || '';
    const horaFin = cita.horaFin || cita.horaInicio || '';
    detalleHora.textContent = formatTime(horaInicio);
    if (detalleHoraFin) detalleHoraFin.textContent = formatTime(horaFin);

    // ===== CAMPO PRECIO =====
    const campoPrecio = document.getElementById("campoPrecio");
    const inputPrecio = document.getElementById("precioExtra");
    const btnSubirPrecio = document.getElementById("btnSubirPrecio");
    const btnEditarPrecio = document.getElementById("btnEditarPrecio");
    const detallePrecioTexto = document.getElementById("detallePrecioTexto");
    const detallePrecio = document.getElementById("detallePrecio");

    let precioActualizado = false;

    // Mostrar campo si el servicio es "Extra"
    if ((cita.nombreServicio || "").toLowerCase() === "extra") {
      campoPrecio.style.display = "flex";
      inputPrecio.value = cita.precio || "";
      inputPrecio.disabled = cita.precio ? true : false;

      // Si ya existe un precio, mostrarlo debajo de Hora Fin
      if (cita.precio) {
        detallePrecio.textContent = cita.precio.toFixed(2);
        detallePrecioTexto.style.display = "block";
        btnSubirPrecio.style.display = "none";
        btnEditarPrecio.style.display = "inline-block";
      } else {
        detallePrecioTexto.style.display = "none";
      }

    } else {
      campoPrecio.style.display = "none";
      inputPrecio.value = "";
      detallePrecioTexto.style.display = "none";
    }

    // Botón para subir precio
    btnSubirPrecio.onclick = async () => {
      const precioValor = parseFloat(inputPrecio.value || "0");
      if (!precioValor || precioValor <= 0) {
        showToast("Debe ingresar un precio válido", "warning");
        return;
      }

      const resPrecio = await fetch(`https://app-barberia-production.up.railway.app/api/citas/${cita.idCita}/precio`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ precio: precioValor })
      });

      if (!resPrecio.ok) {
        const errorText = await resPrecio.text();
        showToast(errorText || "Error al actualizar el precio", "error");
        return;
      }

      cita.precio = precioValor;
      precioActualizado = true;

      // Mostrar precio debajo de hora fin
      detallePrecio.textContent = precioValor.toFixed(2);
      detallePrecioTexto.style.display = "block";

      // Cambiar botones
      btnSubirPrecio.style.display = "none";
      btnEditarPrecio.style.display = "inline-block";
      inputPrecio.disabled = true;

      showToast("Precio actualizado correctamente", "success");
    };

    //  Botón para editar precio
    btnEditarPrecio.onclick = () => {
      inputPrecio.disabled = false;
      inputPrecio.focus();
      btnSubirPrecio.style.display = "inline-block";
      btnEditarPrecio.style.display = "none";
    };

    // ===== BOTONES MODAL =====
    botonesModal.innerHTML = '';

    if (estado === "completada") {
      const span = document.createElement("div");
      span.className = "finalizado-text";
      span.textContent = "Cita finalizada";
      botonesModal.appendChild(span);

    } else if (estado === "cancelada") {
      const span = document.createElement("div");
      span.className = "cancelado-text";
      span.textContent = "Cita cancelada";
      botonesModal.appendChild(span);

    } else {
      const btnOk = document.createElement("button");
      btnOk.className = "btn btn-finalizar";
      btnOk.textContent = "Finalizar Cita";

      const btnNo = document.createElement("button");
      btnNo.className = "btn btn-cancelar";
      btnNo.textContent = "Cancelar Cita";

      botonesModal.appendChild(btnOk);
      botonesModal.appendChild(btnNo);

      // ===== FINALIZAR CITA =====
      btnOk.onclick = async () => {
        try {
          if ((cita.nombreServicio || "").toLowerCase() === "extra") {
            const precioValor = parseFloat(inputPrecio.value || "0");
            if (!precioValor || precioValor <= 0) {
              showToast("Debe ingresar un precio válido para el servicio extotonesModalra", "warning");
              return;
            }

            if (!precioActualizado) {
              showToast("Primero actualiza el precio antes de finalizar", "info");
              return;
            }
          }

          const resEstado = await fetch(`https://app-barberia-production.up.railway.app/api/citas/${cita.idCita}/estado`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: "completada" })
          });

          if (!resEstado.ok) {
            const errorText = await resEstado.text();
            showToast(errorText || "Error al finalizar la cita", "error");
            return;
          }

          showToast("Cita finalizada", "success");
          eventoEl.style.backgroundColor = estadoColor("completada");
          cita.estado = "completada";
          inputPrecio.disabled = true;

          botonesModal.innerHTML = '<div class="finalizado-text">Cita finalizada</div>';

        } catch (err) {
          console.error(err);
          showToast("Error de conexión", "error");
        }
      };

      // ===== CANCELAR =====
      btnNo.onclick = async () => {
        try {
          const res = await fetch(`https://app-barberia-production.up.railway.app/api/citas/${cita.idCita}/estado`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: "cancelada" })
          });

          if (!res.ok) {
            const errorText = await res.text();
            showToast(errorText || "Error al cancelar la cita", "error");
            return;
          }

          showToast("Cita cancelada", "success");
          eventoEl.style.backgroundColor = estadoColor("cancelada");
          cita.estado = "cancelada";

          //  Bloquear el campo de precio y botones relacionados
          inputPrecio.disabled = true;
          btnSubirPrecio.style.display = "none";
          btnEditarPrecio.style.display = "none";

          botonesModal.innerHTML = '<div class="cancelado-text">Cita cancelada</div>';
        } catch (err) {
          console.error(err);
          showToast("Error de conexión", "error");
        }
      };

    }

    modalOverlay.classList.add("active");
  }


  // ===== BOTONES =====
  btnSemana.addEventListener("click", () => {
    vistaActual = "semana";
    btnSemana.classList.add("active");
    btnMes.classList.remove("active");
    renderCalendarioSemanal();
  });

  btnMes.addEventListener("click", () => {
    vistaActual = "mes";
    btnMes.classList.add("active");
    btnSemana.classList.remove("active");
    renderCalendarioMensual();
  });

  btnHoy.addEventListener("click", () => {
    fechaReferencia = new Date();
    vistaActual === "semana" ? renderCalendarioSemanal() : renderCalendarioMensual();
  });

  prevSemana.addEventListener("click", () => {
    if (vistaActual === "semana") {
      fechaReferencia.setDate(fechaReferencia.getDate() - 7);
      renderCalendarioSemanal();
    } else {
      fechaReferencia.setMonth(fechaReferencia.getMonth() - 1);
      renderCalendarioMensual();
    }
  });

  nextSemana.addEventListener("click", () => {
    if (vistaActual === "semana") {
      fechaReferencia.setDate(fechaReferencia.getDate() + 7);
      renderCalendarioSemanal();
    } else {
      fechaReferencia.setMonth(fechaReferencia.getMonth() + 1);
      renderCalendarioMensual();
    }
  });

  cerrarModal.addEventListener("click", () => modalOverlay.classList.remove("active"));
  modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) modalOverlay.classList.remove("active"); });

  // ===== INICIALIZAR =====
  renderCalendarioSemanal();
});
