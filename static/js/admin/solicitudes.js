const API = "http://localhost:8080/api/solicitudes";
const API_BARBEROS = "http://localhost:8080/api/barberos";

const tipoBtns = document.querySelectorAll(".solicitud-btn");
const solicitudesBody = document.getElementById("solicitudes-body");
const barberoSelect = document.getElementById("barbero-select");

// =====================================
// CAMBIAR VISTA (pendientes / historial)
// =====================================
tipoBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        tipoBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const tipo = btn.dataset.tipo;
        if (tipo === "pendientes") cargarPendientes();
        else cargarHistorial();
    });
});

// =====================================
// CARGAR BARBEROS
// =====================================
async function cargarBarberos() {
    try {
        const res = await fetch(API_BARBEROS);
        const barberos = await res.json();

        barberoSelect.innerHTML = `<option value="todos">Todos</option>`;

        barberos.forEach(b => {
            barberoSelect.innerHTML += `
                <option value="${b.idBarbero}">
                    ${b.idBarbero} - ${b.nombreCompleto}
                </option>
            `;
        });

        // Recargar según el tipo activo
        barberoSelect.addEventListener("change", () => {
            const activo = document.querySelector(".solicitud-btn.active").dataset.tipo;
            if (activo === "pendientes") cargarPendientes();
            else cargarHistorial();
        });

    } catch (e) {
        console.error("Error cargando barberos", e);
    }
}

// =====================================
// FILTRAR POR BARBERO
// =====================================
function filtrarPorBarbero(lista) {
    const idSeleccionado = barberoSelect.value;

    if (idSeleccionado === "todos") return lista;

    return lista.filter(s => s.barbero.idBarbero == idSeleccionado);
}

// =====================================
// CARGAR PENDIENTES
// =====================================
async function cargarPendientes() {
    try {
        const res = await fetch(`${API}/pendientes`);
        if (!res.ok) throw new Error("Error en endpoint pendientes");

        let data = await res.json();
        data = filtrarPorBarbero(data);

        renderSolicitudes(data);

    } catch (e) {
        showToast("Error cargando pendientes", "error");
        console.error(e);
    }
}

// =====================================
// CARGAR HISTORIAL (finalizado + rechazado)
// =====================================
async function cargarHistorial() {
    try {
        const res = await fetch(`${API}/historial`);
        if (!res.ok) throw new Error("Error en endpoint historial");

        let data = await res.json();
        data = filtrarPorBarbero(data);

        renderSolicitudes(data);

    } catch (e) {
        showToast("Error cargando historial", "error");
        console.error(e);
    }
}

// =====================================
// RENDERIZAR TABLA
// =====================================
function renderSolicitudes(lista) {
    solicitudesBody.innerHTML = "";

    lista.forEach(s => {
        solicitudesBody.innerHTML += `
            <tr data-id="${s.idSolicitud}">
                <td>${s.idSolicitud}</td>
                <td>Barbero ${s.barbero.idBarbero}</td>
                <td>${s.detalles[0].producto.nombre}</td>
                <td>${s.detalles[0].cantidad}</td>
                
                <td>${s.estado}</td>

                <td>
                    ${s.estado === "pendiente" ? `
                        <button class="aprobar-btn"><i class="fas fa-check"></i></button>
                        <button class="rechazar-btn"><i class="fas fa-times"></i></button>
                    ` : `---`}
                </td>

                <td>
                    <button class="descargar-btn"><i class="fas fa-download"></i></button>
                </td>
            </tr>
        `;
    });
}


// =====================================
// ACCIONES (aprobar, rechazar, descargar)
// =====================================
solicitudesBody.addEventListener("click", async e => {
    const fila = e.target.closest("tr");
    if (!fila) return;

    const id = fila.dataset.id;

    // APROBAR
    if (e.target.closest(".aprobar-btn")) {
        const res = await fetch(`${API}/${id}/aprobar`, { method: "PUT" });
        if (res.ok) {
            showToast("Solicitud aprobada", "success");
            cargarPendientes();
        }
    }

    // RECHAZAR
    if (e.target.closest(".rechazar-btn")) {
        const res = await fetch(`${API}/${id}/rechazar`, { method: "PUT" });
        if (res.ok) {
            showToast("Solicitud rechazada", "warning");
            cargarPendientes();
        }
    }

    // DESCARGAR
    if (e.target.closest(".descargar-btn")) {
        descargarSolicitud(id);
    }
});

// =====================================
// DESCARGAR SOLICITUD EN PDF (ESTILO PRO)
// =====================================
async function descargarSolicitud(id) {
    try {

        const res = await fetch(`${API}/${id}`);
        if (!res.ok) throw new Error("No se pudo obtener la solicitud");

        const solicitud = await res.json();

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF("p", "mm", "a4");

        // ================================
        // ENCABEZADO TEMA NEGRO/NARANJA
        // ================================
        doc.setFillColor(20, 20, 20); // NEGRO
        doc.rect(0, 0, 210, 30, "F");

        doc.setTextColor(255, 140, 0); // NARANJA
        doc.setFontSize(22);
        doc.text("EL CALVO BARBER SHOP", 15, 20);

        // Línea naranja decorativa
        doc.setDrawColor(255, 140, 0);
        doc.setLineWidth(1);
        doc.line(0, 30, 210, 30);

        // ================================
        // DATOS DE LA SOLICITUD
        // ================================
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text("Solicitud de Productos", 15, 45);

        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);

        doc.text(`ID Solicitud :  ${solicitud.idSolicitud}`, 15, 60);
        doc.text(`Barbero      :  ${solicitud.barbero.idBarbero}`, 15, 67);
        doc.text(`Estado       :  ${solicitud.estado}`, 15, 74);
        doc.text(`Fecha        :  ${solicitud.fechaSolicitud}`, 15, 81);

        // Línea separadora
        doc.setDrawColor(230, 230, 230);
        doc.line(10, 88, 200, 88);

        // ================================
        // DETALLES DE PRODUCTOS
        // ================================
        doc.setTextColor(255, 140, 0);
        doc.setFontSize(14);
        doc.text("Listado de Productos", 15, 100);

        let y = 110;

        for (const det of solicitud.detalles) {
            doc.setDrawColor(200, 200, 200);
            doc.rect(10, y - 5, 190, 30); // tarjeta contenedora

            // --- Imagen del producto ---
            if (det.producto.imagen) {
                try {
                    const imgData = await cargarImagenBase64(det.producto.imagen);
                    doc.addImage(imgData, "JPEG", 12, y - 3, 25, 25);
                } catch {
                    console.log("No se pudo cargar imagen:", det.producto.imagen);
                }
            }

            // --- Texto del producto ---
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.text(`Producto: ${det.producto.nombre}`, 42, y + 2);
            doc.text(`Cantidad: ${det.cantidad}`, 42, y + 10);

            y += 35;

            if (y > 260) {
                doc.addPage();
                y = 20;
            }
        }

        // Guardar archivo
        doc.save(`solicitud_${id}.pdf`);

        showToast("PDF descargado", "success");

    } catch (err) {
        showToast("Error al generar PDF", "error");
        console.error(err);
    }
}

// =====================================
// FUNCIÓN PARA CARGAR IMÁGENES EN BASE64
// =====================================
async function cargarImagenBase64(url) {
    const res = await fetch(url);
    const blob = await res.blob();

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

// =====================================
// INICIO
// =====================================
cargarBarberos();
cargarPendientes();
