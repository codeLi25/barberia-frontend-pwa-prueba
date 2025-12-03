document.addEventListener("DOMContentLoaded", async () => {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    // Cambiar pestaña al hacer clic
    tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            tabButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            tabContents.forEach((content) => content.classList.remove("active"));
            const tabId = btn.getAttribute("data-tab");
            document.getElementById(tabId)?.classList.add("active");
        });
    });

    const usuario = JSON.parse(localStorage.getItem("usuario"));

    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");

    // Si viene desde la compra, abrir directamente la pestaña "Compras"
    if (tab === "compras") {
        tabButtons.forEach((b) => b.classList.remove("active"));
        tabContents.forEach((c) => c.classList.remove("active"));

        const comprasBtn = document.querySelector('.tab-btn[data-tab="compras"]');
        const comprasContent = document.getElementById("compras");

        comprasBtn?.classList.add("active");
        comprasContent?.classList.add("active");
    }

    // Cargar compras siempre (no solo si viene desde compra)
    try {
        const res = await fetch(`https://app-barberia-production.up.railway.app/api/ventas/usuario/${usuario.idUsuario}`);
        if (!res.ok) throw new Error("Error al obtener compras");

        const compras = await res.json();
        mostrarComprasSeparadas(compras);
    } catch (err) {
        console.error("Error cargando compras:", err);
        const comprasContent = document.getElementById("compras");
        comprasContent.innerHTML = `<p class="error">❌ Error al cargar tus compras.</p>`;
    }
});

/**
 * Renderiza las compras pendientes y finalizadas en contenedores separados
 */
function mostrarComprasSeparadas(compras) {
    const contPendientes = document.getElementById("compras-pendientes");
    const contFinalizadas = document.getElementById("compras-finalizadas");

    if (!contPendientes || !contFinalizadas) return;

    const pendientes = compras.filter(v => v.estado === "PENDIENTE");
    const finalizadas = compras.filter(v => v.estado === "FINALIZADA");

    // Compras pendientes
    contPendientes.innerHTML = pendientes.length === 0
        ? `<p>No tienes compras pendientes.</p>`
        : pendientes.map(v => {
            const productos = v.detalles
                .map(d => `<p><strong>Producto:</strong> ${d.producto?.nombre || "Producto #" + d.idProducto}</p>`)
                .join("");
            return `
                <div class="card">
                    <div class="card-info">
                        ${productos}
                        <p><strong>Fecha:</strong> ${new Date(v.fechaVenta).toLocaleString()}</p>
                        <p><strong>Total:</strong> S/${v.total.toFixed(2)}</p>
                        <p><strong>Estado:</strong> <span class="estado pendiente">${v.estado}</span></p>
                    </div>
                </div>`;
        }).join("");

    // Compras finalizadas
    contFinalizadas.innerHTML = finalizadas.length === 0
        ? `<p>No tienes compras finalizadas.</p>`
        : finalizadas.map(v => {
            const productos = v.detalles
                .map(d => `<p><strong>Producto:</strong> ${d.producto?.nombre || "Producto #" + d.idProducto}</p>`)
                .join("");
            return `
                <div class="card historial">
                    <div class="card-info">
                        ${productos}
                        <p><strong>Fecha:</strong> ${new Date(v.fechaVenta).toLocaleString()}</p>
                        <p><strong>Total:</strong> S/${v.total.toFixed(2)}</p>
                        <p><strong>Estado:</strong> <span class="estado finalizada">${v.estado}</span></p>
                    </div>
                    
                </div>`;
        }).join("");
}
