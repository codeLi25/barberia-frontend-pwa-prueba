document.addEventListener("DOMContentLoaded", async () => {

    const fechaFilter = document.getElementById("fecha-filter");
    const barberoFilter = document.getElementById("barbero-filter");
    const servicioFilter = document.getElementById("servicio-filter");
    const agendaBody = document.getElementById("agenda-body");
    const estadoBtns = document.querySelectorAll(".estado-btn");

    let estadoFiltro = "todos";

    // =========================
    // Contenedor de toast
    // =========================
    if (!document.getElementById("toast-container")) {
        const toastContainer = document.createElement("div");
        toastContainer.id = "toast-container";
        document.body.appendChild(toastContainer);
    }

    // =========================
    // Función para mostrar toast
    // =========================
    function showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.classList.add('toast', type);
        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.4s forwards';
            setTimeout(() => toast.remove(), 400);
        }, duration);
    }

    // ==================== Cargar barberos ====================
    async function cargarBarberos() {
        try {
            const res = await fetch("http://localhost:8080/api/barberos");
            const barberos = await res.json();
            barberoFilter.innerHTML = `<option value="todos">Todos</option>`;
            barberos.forEach(b => {
                barberoFilter.innerHTML += `<option value="${b.idBarbero}">${b.idBarbero} - ${b.nombreCompleto}</option>`;
            });
        } catch (err) {
            console.error("Error cargando barberos:", err);
            showToast("Error cargando barberos", "error");
        }
    }

    // ==================== Cargar servicios ====================
    async function cargarServicios() {
        try {
            const res = await fetch("http://localhost:8080/api/servicios");
            const servicios = await res.json();
            servicioFilter.innerHTML = `<option value="todos">Todos</option>`;
            servicios.forEach(s => {
                servicioFilter.innerHTML += `<option value="${s.idServicio}">${s.idServicio} - ${s.nombreServicio}</option>`;
            });
        } catch (err) {
            console.error("Error cargando servicios:", err);
            showToast("Error cargando servicios", "error");
        }
    }

    // ==================== Cargar citas ====================
    async function cargarCitas() {
        try {
            const res = await fetch("http://localhost:8080/api/citas");
            const citas = await res.json();
            agendaBody.innerHTML = "";

            citas.forEach(c => {
                let accionesHTML = '';
                if (c.estado === "pendiente") {
                    accionesHTML = `
                        <button class="finalizar-btn btn btn-success" title="Finalizar"><i class="fas fa-check"></i></button>
                        <button class="cancelar-btn btn btn-danger" title="Cancelar"><i class="fas fa-times"></i></button>
                    `;
                } else {
                    accionesHTML = '---';
                }

                agendaBody.innerHTML += `
                    <tr data-fecha="${c.fecha}" data-barbero="${c.idBarbero}" data-servicio="${c.idServicio}" data-estado="${c.estado}">
                        <td>${c.idCita}</td>
                        <td>${c.fecha}</td>
                        <td>${c.horaInicio} - ${c.horaFin}</td>
                        <td>Barbero ${c.idBarbero}</td>
                        <td>${c.idUsuario || "-"}</td>
                        <td>${c.idServicio || "-"}</td>
                        <td>${c.estado}</td>
                        <td>${accionesHTML}</td>
                    </tr>
                `;
            });

            filtrarCitas();
        } catch (err) {
            console.error("❌ Error cargando citas:", err);
            showToast("Error cargando citas", "error");
        }
    }

    // ==================== Filtrar citas ====================
    function filtrarCitas() {
        const fecha = fechaFilter.value;
        const barbero = barberoFilter.value;
        const servicio = servicioFilter.value;
        const filas = agendaBody.querySelectorAll("tr");

        filas.forEach(fila => {
            const filaFecha = fila.dataset.fecha;
            const filaBarbero = fila.dataset.barbero;
            const filaServicio = fila.dataset.servicio;
            const filaEstado = fila.dataset.estado;

            let mostrar = true;
            if (fecha && filaFecha !== fecha) mostrar = false;
            if (barbero !== "todos" && filaBarbero !== barbero) mostrar = false;
            if (servicio !== "todos" && filaServicio !== servicio) mostrar = false;
            if (estadoFiltro !== "todos" && filaEstado !== estadoFiltro) mostrar = false;

            fila.style.display = mostrar ? "" : "none";
        });
    }

    fechaFilter.addEventListener("change", filtrarCitas);
    barberoFilter.addEventListener("change", filtrarCitas);
    servicioFilter.addEventListener("change", filtrarCitas);

    estadoBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            estadoFiltro = btn.dataset.estado;
            estadoBtns.forEach(b => b.classList.remove("activo"));
            btn.classList.add("activo");

            if (estadoFiltro === "todos") {
                fechaFilter.value = "";
                barberoFilter.value = "todos";
                servicioFilter.value = "todos";
            }

            filtrarCitas();
        });
    });

    // ==================== Acciones de citas ====================
    agendaBody.addEventListener("click", async e => {
        const fila = e.target.closest("tr");
        if (!fila) return;
        const idCita = fila.children[0].innerText;

        // Reasignar
        if (e.target.closest(".reasignar-btn")) {
            showToast("Función de reasignación aquí", "info");
        }

        // Finalizar
        if (e.target.closest(".finalizar-btn")) {
            if (!confirm("¿Seguro que deseas marcar esta cita como completada?")) return;
            try {
                const res = await fetch(`http://localhost:8080/api/citas/${idCita}/estado`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ estado: "completada" })
                });
                if (res.ok) {
                    showToast("Cita finalizada", "success");
                    cargarCitas();
                } else showToast("Error al finalizar cita", "error");
            } catch {
                showToast("Error al finalizar cita", "error");
            }
        }

        // Cancelar
        if (e.target.closest(".cancelar-btn")) {
            if (!confirm("¿Seguro que deseas cancelar esta cita?")) return;
            try {
                const res = await fetch(`http://localhost:8080/api/citas/${idCita}/estado`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ estado: "cancelada" })
                });
                if (res.ok) {
                    showToast("Cita cancelada", "success");
                    cargarCitas();
                } else showToast("Error al cancelar cita", "error");
            } catch {
                showToast("Error al cancelar cita", "error");
            }
        }
    });

    // ==================== Inicializar ====================
    await cargarBarberos();
    await cargarServicios();
    await cargarCitas();

});
