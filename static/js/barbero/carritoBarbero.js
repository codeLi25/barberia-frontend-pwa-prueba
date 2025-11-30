document.addEventListener("DOMContentLoaded", () => {
    const btnSolicitud = document.getElementById("btn-solicitud-panel");
    const solicitudPanel = document.getElementById("solicitud-panel");
    const cerrarSolicitudBtn = document.getElementById("cerrar-solicitud");
    const lista = document.getElementById("solicitud-lista");
    const contadorEl = document.getElementById("solicitud-contador");
    const btnEnviar = document.getElementById("enviar-solicitud");

    let carrito = JSON.parse(localStorage.getItem("solicitudProductos")) || [];

    function lanzarConfeti() {
        const duration = 2000;
        const animationEnd = Date.now() + duration;
        const defaults = {
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            zIndex: 9999,
            colors: ["#00ffcc", "#ff6600", "#33ff00dc"]
        };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            }));

            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            }));

        }, 250);
    }

    // === ABRIR PANEL ===
    btnSolicitud?.addEventListener("click", () => {
        solicitudPanel.classList.add("abierto");
        //  No bloquear scroll (solo evitar scroll dentro del panel)
        solicitudPanel.style.overflowY = "auto";
    });

    // === CERRAR PANEL ===
    cerrarSolicitudBtn?.addEventListener("click", () => {
        solicitudPanel.classList.remove("abierto");
        solicitudPanel.style.overflowY = "hidden";
    });

    // === ESCUCHAR EVENTO DE AGREGAR PRODUCTO ===
    document.addEventListener("productoSolicitudAgregado", (e) => {
        agregarAlCarrito(e.detail);
    });

    // === AGREGAR PRODUCTO ===
    function agregarAlCarrito(prod) {
        const itemExistente = carrito.find((p) => p.id === prod.id);
        if (itemExistente) {
            if (itemExistente.cantidad < itemExistente.stock) {
                itemExistente.cantidad++;
            } else {
                showToast(`Stock máximo alcanzado (${itemExistente.stock}) para "${prod.nombre}"`, "error", 2000);
            }
        } else {
            carrito.push({ ...prod, cantidad: 1 });
        }
        guardarCarrito();
        renderizarCarrito();
    }

    // === ELIMINAR PRODUCTO ===
    function eliminarDelCarrito(id) {
        carrito = carrito.filter((p) => p.id !== id);
        guardarCarrito();
        renderizarCarrito();
    }

    // === CAMBIAR CANTIDAD ===
    function cambiarCantidad(id, delta) {
        const item = carrito.find((p) => p.id === id);
        if (!item) return;

        const nuevoValor = item.cantidad + delta;

        if (nuevoValor > item.stock) {
            showToast(`No hay más stock disponible (${item.stock}) de "${item.nombre}".`, "error", 2000);
            return;
        }

        if (nuevoValor <= 0) {
            eliminarDelCarrito(id);
        } else {
            item.cantidad = nuevoValor;
            guardarCarrito();
            renderizarCarrito();
        }
    }

    // === RENDERIZAR PANEL ===
    function renderizarCarrito() {
        lista.innerHTML = "";

        if (carrito.length === 0) {
            lista.innerHTML = `<p class="vacio">Tu solicitud está vacía.</p>`;
        }

        carrito.forEach((prod) => {
            const li = document.createElement("li");
            li.classList.add("solicitud-item");

            li.innerHTML = `
                <img src="${prod.img}" alt="${prod.nombre}">
                <div class="info">
                    <h4>${prod.nombre}</h4>
                    <p>${prod.descripcion || "Sin descripción"}</p>
                    <div class="cantidad">
                        <button class="btn-cantidad menos" data-id="${prod.id}">−</button>
                        <span>${prod.cantidad}</span>
                        <button class="btn-cantidad mas" data-id="${prod.id}">+</button>
                    </div>
                </div>
                <button class="btn-eliminar" data-id="${prod.id}">&times;</button>
            `;

            lista.appendChild(li);
        });

        contadorEl.textContent = carrito.reduce((sum, p) => sum + p.cantidad, 0);

        lista.querySelectorAll(".btn-eliminar").forEach((btn) =>
            btn.addEventListener("click", () => eliminarDelCarrito(parseInt(btn.dataset.id)))
        );

        lista.querySelectorAll(".btn-cantidad.menos").forEach((btn) =>
            btn.addEventListener("click", () => cambiarCantidad(parseInt(btn.dataset.id), -1))
        );

        lista.querySelectorAll(".btn-cantidad.mas").forEach((btn) =>
            btn.addEventListener("click", () => cambiarCantidad(parseInt(btn.dataset.id), +1))
        );
    }

    // === GUARDAR LOCAL ===
    function guardarCarrito() {
        localStorage.setItem("solicitudProductos", JSON.stringify(carrito));
    }

    // === ENVIAR SOLICITUD ===
    btnEnviar?.addEventListener("click", async () => {
        if (carrito.length === 0) {
            showToast("No hay productos en tu solicitud.", "error");
            return;
        }


        const idBarbero = localStorage.getItem("idBarbero") || 1;
        console.log("ID del barbero desde localStorage:", idBarbero);
        // Mostrar todo el localStorage para ver qué hay guardado
        console.log(" Contenido completo de localStorage:", { ...localStorage });

        const solicitud = {
            barbero: { idBarbero: parseInt(idBarbero) }, // así lo espera el backend
            estado: "pendiente",
            detalles: carrito.map((p) => ({
                producto: { idProductoBarbero: p.id },
                cantidad: p.cantidad,
            })),
        };

        try {
            const response = await fetch("http://localhost:8080/api/solicitudes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(solicitud),
            });

            const data = await response.text();
            console.log("Respuesta del servidor:", data);

            if (!response.ok) throw new Error("Error al enviar la solicitud");

            carrito = [];
            localStorage.removeItem("solicitudProductos");
            renderizarCarrito();
            solicitudPanel.classList.remove("abierto");
            solicitudPanel.style.overflowY = "hidden";
            showToast("Solicitud enviada correctamente", "success");

            lanzarConfeti();

            document.dispatchEvent(new CustomEvent("solicitud-enviada")); 
            
            setTimeout(() => {
                window.location.href = "barbero.html#solicitudes-barbero";
            }, 2500);

        } catch (error) {
            console.error("Error:", error);
            showToast("No se pudo enviar la solicitud.", "error");
        }
    });

    // === INICIAL ===
    renderizarCarrito();
});
