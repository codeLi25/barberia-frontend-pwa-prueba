document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const token = localStorage.getItem("token");

  const perfilInfo = document.getElementById("perfil-info");
  if (perfilInfo) {
    perfilInfo.innerHTML = `
      <p><strong>Nombre:</strong> ${usuario.nombreCompleto}</p>
      <p><strong>Correo:</strong> ${usuario.correo}</p>
    `;
  }

  const citasActivasContainer = document.getElementById("citas-activas");
  const historialContainer = document.getElementById("historial-citas");
  if (!citasActivasContainer || !historialContainer) return;

  // === 1. Obtener citas desde backend ===
  const response = await fetch(`http://localhost:8080/api/citas/usuario/${usuario.idUsuario}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const citas = await response.json();

  // Limpiar contenedores
  citasActivasContainer.innerHTML = "";
  historialContainer.innerHTML = "";

  // === 2. Separar por estado ===
  const citasActivas = citas.filter(cita => cita.estado === "pendiente" || cita.estado === "confirmada");
  const citasHistorial = citas.filter(cita => cita.estado === "completada" || cita.estado === "cancelada");

  // === 3. Renderizar citas activas ===
  citasActivas.forEach(cita => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
      <div class="card-info">
        <p><strong>Fecha:</strong> ${cita.fecha}</p>
        <p><strong>Hora:</strong> ${cita.horaInicio} - ${cita.horaFin}</p>
        <p><strong>Barbero:</strong> ${cita.barbero?.nombre || cita.idBarbero}</p>
        <p><strong>Servicio:</strong> ${cita.servicio?.nombreServicio || cita.idServicio}</p>
        <p><strong>Estado:</strong> ${cita.estado}</p>
      </div>
      <div class="countdown" id="countdown-${cita.idCita}" data-id="${cita.idCita}" data-fecha="${cita.fecha}T${cita.horaInicio}"></div>
    `;
    citasActivasContainer.appendChild(div);
  });

  // === 4. Renderizar historial ===
  if (citasHistorial.length === 0) {
    historialContainer.innerHTML = "<p>No tienes citas anteriores registradas.</p>";
  } else {
    citasHistorial.forEach(cita => {
      const div = document.createElement("div");
      div.classList.add("card");
      div.innerHTML = `
        <div class="card-info">
          <p><strong>Fecha:</strong> ${cita.fecha}</p>
          <p><strong>Hora:</strong> ${cita.horaInicio} - ${cita.horaFin}</p>
          <p><strong>Barbero:</strong> ${cita.barbero?.nombre || cita.idBarbero}</p>
          <p><strong>Servicio:</strong> ${cita.servicio?.nombreServicio || cita.idServicio}</p>
          <p><strong>Estado:</strong> ${cita.estado}</p>
        </div>
      `;
      historialContainer.appendChild(div);
    });
  }

  // === 5. Inicializar contadores para citas activas ===
  iniciarContadores();
});

function iniciarContadores() {
  const contadores = document.querySelectorAll(".countdown");

  contadores.forEach(contador => {
    const fechaCita = contador.dataset.fecha;
    const idCita = contador.dataset.id;
    const fechaObjetivo = new Date(fechaCita).getTime();

    const intervalId = setInterval(async () => {
      const ahora = new Date().getTime();
      const diferencia = fechaObjetivo - ahora;

      if (diferencia <= 0) {
        clearInterval(intervalId);
        contador.textContent = "Cita finalizada";
        contador.parentElement.remove(); 
        // Opcional: actualizar estado en backend a completada
        await fetch(`http://localhost:8080/api/citas/${idCita}/estado`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: "completada" })
        });
        return;
      }

      const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
      const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
      const segundos = Math.floor((diferencia / 1000) % 60);

      contador.textContent = `Faltan ${dias}d ${horas}h ${minutos}m ${segundos}s`;
    }, 1000);
  });
}
