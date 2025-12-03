document.addEventListener("DOMContentLoaded", async () => {
    const contPendientes = document.getElementById("solicitudes-pendientes");
    const contFinalizadas = document.getElementById("solicitudes-finalizadas");
    const modal = document.getElementById("modalSolicitud");
    const cerrarModal = document.getElementById("cerrarModalSolicitud");

    const detalleId = document.getElementById("detalleIdSolicitud");
    const detalleEstado = document.getElementById("detalleEstadoSolicitud");
    const detalleFecha = document.getElementById("detalleFechaSolicitud");
    const detalleProductos = document.getElementById("detalleProductosSolicitud");

    const API_URL = "https://app-barberia-production.up.railway.app/api";

    //  Función para convertir fecha a formato local
    function convertirFechaLocal(fechaStr) {
        if (!fechaStr) return "Sin fecha";
        try {
            const fecha = new Date(fechaStr.replace("T", " ") + " UTC-5");
            return fecha.toLocaleString("es-PE", {
                dateStyle: "short",
                timeStyle: "short",
                hour12: false,
            });
        } catch {
            return "Sin fecha";
        }
    }

    //  Obtener el barbero logueado
    async function obtenerBarbero() {
        try {
            const idUsuario = localStorage.getItem("idUsuario");
            if (!idUsuario) return null;

            const res = await fetch(`${API_URL}/barbero-login/usuario/${idUsuario}`);
            if (!res.ok) throw new Error("No se pudo obtener el barbero");
            const barbero = await res.json();
            localStorage.setItem("idBarbero", barbero.idBarbero);
            return barbero.idBarbero;
        } catch {
            return null;
        }
    }

    //  Cargar solicitudes del barbero
    async function cargarSolicitudes() {
        try {
            let idBarbero = localStorage.getItem("idBarbero") || (await obtenerBarbero());
            if (!idBarbero) {
                contPendientes.innerHTML = `<p class="error-msg">No se encontró el barbero.</p>`;
                return;
            }

            const res = await fetch(`${API_URL}/solicitudes/barbero/${idBarbero}`);
            if (!res.ok) throw new Error();
            const solicitudes = await res.json();
            mostrarSolicitudes(solicitudes);
        } catch {
            contPendientes.innerHTML = `<p class="error-msg">No se pudieron cargar las solicitudes.</p>`;
        }
    }

    // Mostrar las solicitudes en pantalla
    function mostrarSolicitudes(solicitudes) {
        contPendientes.innerHTML = "";
        contFinalizadas.innerHTML = "";

        if (!solicitudes || solicitudes.length === 0) {
            contPendientes.innerHTML = `<p class="no-solicitudes">No tienes solicitudes pendientes.</p>`;
            contFinalizadas.innerHTML = `<p class="no-solicitudes">No tienes solicitudes finalizadas.</p>`;
            return;
        }

        solicitudes.forEach((solicitud) => {
            const card = document.createElement("div");
            card.classList.add("solicitud-card");
            card.dataset.id = solicitud.idSolicitud;
            card.dataset.estado = solicitud.estado;

            const colorEstado =
                solicitud.estado === "pendiente"
                    ? "#ff9800"
                    : solicitud.estado === "finalizado"
                        ? "#00cc88"
                        : "#999";

            const fechaFormateada = convertirFechaLocal(solicitud.fechaSolicitud);

            card.innerHTML = `
                <div class="solicitud-card-header">
                    <span class="solicitud-id">#${solicitud.idSolicitud}</span>
                    <span class="solicitud-estado" style="color:${colorEstado}">
                        ${solicitud.estado.toUpperCase()}
                    </span>
                </div>
                <p class="solicitud-fecha">${fechaFormateada}</p>
            `;

            card.addEventListener("click", (e) => {
                e.stopPropagation();
                abrirModal(solicitud);
            });

            (solicitud.estado === "pendiente" ? contPendientes : contFinalizadas).appendChild(card);
        });
    }

    //  Abrir modal con detalles
    function abrirModal(solicitud) {
        modal.classList.add("activo");
        detalleId.textContent = solicitud.idSolicitud;
        detalleEstado.textContent = solicitud.estado;
        detalleFecha.textContent = convertirFechaLocal(solicitud.fechaSolicitud);

        detalleProductos.innerHTML = "";
        solicitud.detalles?.forEach((det) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span>${det.producto?.nombre || "Producto"}</span>
                <span>Cant: ${det.cantidad}</span>
            `;
            detalleProductos.appendChild(li);
        });

        document.body.style.overflow = "hidden"; // Bloquear scroll
    }

    //  Cerrar modal
    function cerrarModalFunc() {
        modal.classList.remove("activo");
        document.body.style.overflow = ""; // Restaurar scroll
    }

    // Cerrar con el botón
    cerrarModal.addEventListener("click", cerrarModalFunc);

    //  Detectar clic dentro del modal (no cerrar)
    const modalContenido = modal.querySelector(".modal-solicitud");
    modalContenido.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    //  Cerrar solo si se hace clic fuera (overlay)
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            cerrarModalFunc();
        }
    });

    // Cargar solicitudes al iniciar
    cargarSolicitudes();

    //  Actualizar solicitudes inmediatamente cuando se envía una
    document.addEventListener("solicitud-enviada", () => {
        cargarSolicitudes();     //  Actualiza sin recargar la página
    });
});
