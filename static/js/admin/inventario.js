document.addEventListener("DOMContentLoaded", () => {
    const API_PRODUCTOS = "https://app-barberia-production.up.railway.app/api/productos";
    const API_PRODUCTOS_BARBERO = "https://app-barberia-production.up.railway.app/api/solicitud-productos";

    // ===== TOAST GLOBAL =====
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

    // ===== CAPITALIZAR =====
    function capitalizarCadaPalabra(texto) {
        if (!texto) return "";
        return texto
            .toLowerCase()
            .split(" ")
            .map(p => p.charAt(0).toUpperCase() + p.slice(1))
            .join(" ");
    }

    // ===== VISTA PREVIA DE IMAGEN =====
    function mostrarVistaPrevia(inputFile, previewId) {
        const file = inputFile.files[0];
        const preview = document.getElementById(previewId);
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                preview.innerHTML = `<img src="${e.target.result}" alt="Vista previa" style="max-width:120px;border-radius:8px;">`;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = "";
        }
    }

    // ===== SUBIR IMAGEN REAL =====
    async function subirImagenReal(file, tipo = "venta") {
        if (!file) return null;

        const formData = new FormData();
        formData.append("imagen", file);

        const url = tipo === "venta"
            ? `${API_PRODUCTOS}/upload`
            : `${API_PRODUCTOS_BARBERO}/upload-barbero`;

        try {
            const res = await fetch(url, { method: "POST", body: formData });
            if (!res.ok) throw new Error("Error al subir imagen");

            const data = await res.json();
            return data.ruta;
        } catch (err) {
            console.error(" Error subiendo imagen:", err);
            showToast("Error al subir imagen", "error");
            return null;
        }
    }

    // ===== CREAR CARD =====
    function crearCard(producto, tipo = "venta") {
        const card = document.createElement("div");
        card.classList.add("producto-card");
        card.dataset.categoria = producto.categoria.toLowerCase();
        card.dataset.id = producto.idProducto || producto.idProductoBarbero;

        card.innerHTML = `
            ${producto.imagen ? `<img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">` : ""}
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion || ""}</p>
            ${producto.precio !== undefined ? `<p>Precio: S/. ${producto.precio}</p>` : ""}
            <p>Stock: ${producto.stock}</p>
            <div class="producto-actions">
                <button class="editar-btn">Editar</button>
                <button class="eliminar-btn">Eliminar</button>
            </div>
        `;

        // ===== EDITAR =====
        card.querySelector(".editar-btn").addEventListener("click", () => {
            if (tipo === "venta") {
                document.getElementById("idProducto").value = producto.idProducto;
                document.getElementById("nombre").value = producto.nombre;
                document.getElementById("descripcion").value = producto.descripcion || "";
                document.getElementById("precio").value = producto.precio || "";
                document.getElementById("stock").value = producto.stock;
                document.getElementById("categoria").value = capitalizarCadaPalabra(producto.categoria);

                const preview = document.getElementById("preview-imagen");
                preview.innerHTML = producto.imagen
                    ? `<img src="${producto.imagen}" alt="Vista previa" style="max-width:120px;border-radius:8px;">`
                    : "";
                document.getElementById("imagen").value = "";
                document.getElementById("imagen").dataset.prev = producto.imagen;
            } else {
                document.getElementById("idProductoBarbero").value = producto.idProductoBarbero;
                document.getElementById("nombre-barbero").value = producto.nombre;
                document.getElementById("descripcion-barbero").value = producto.descripcion || "";
                document.getElementById("stock-barbero").value = producto.stock;
                document.getElementById("categoria-barbero").value = capitalizarCadaPalabra(producto.categoria);

                const preview = document.getElementById("preview-imagen-barbero");
                preview.innerHTML = producto.imagen
                    ? `<img src="${producto.imagen}" alt="Vista previa" style="max-width:120px;border-radius:8px;">`
                    : "";
                document.getElementById("imagen-barbero").value = "";
                document.getElementById("imagen-barbero").dataset.prev = producto.imagen;
            }
        });

        // ===== ELIMINAR =====
        card.querySelector(".eliminar-btn").addEventListener("click", async () => {
            if (!confirm("¿Eliminar este producto?")) return;

            try {
                if (tipo === "venta") {
                    await fetch(`${API_PRODUCTOS}/${producto.idProducto}`, { method: "DELETE" });
                    showToast("Producto eliminado correctamente", "success");
                } else {
                    await fetch(`${API_PRODUCTOS_BARBERO}/${producto.idProductoBarbero}`, { method: "DELETE" });
                    showToast("Producto barbero eliminado correctamente", "success");
                }
                card.remove();
            } catch (err) {
                console.error(err);
                showToast("Error al eliminar", "error");
            }
        });

        return card;
    }

    // ===== CARGAR PRODUCTOS =====
    async function cargarProductos() {
        try {
            const productosTienda = await (await fetch(API_PRODUCTOS)).json();
            const gridTienda = document.getElementById("productos-grid");
            gridTienda.innerHTML = "";
            productosTienda.forEach(prod => gridTienda.appendChild(crearCard(prod, "venta")));

            const productosBarbero = await (await fetch(API_PRODUCTOS_BARBERO)).json();
            const gridBarbero = document.getElementById("productos-barbero-grid");
            gridBarbero.innerHTML = "";
            productosBarbero.forEach(prod => gridBarbero.appendChild(crearCard(prod, "barbero")));
        } catch (err) {
            console.error(err);
            showToast("Error al cargar productos", "error");
        }
    }

    // ===== FORMULARIO PRODUCTO VENTA =====
    const formVenta = document.getElementById("form-producto");
    const inputImagenVenta = document.getElementById("imagen");

    inputImagenVenta.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        mostrarVistaPrevia(inputImagenVenta, "preview-imagen");

        const ruta = await subirImagenReal(file, "venta");
        if (ruta) inputImagenVenta.dataset.prev = ruta;
    });

    formVenta.addEventListener("submit", async e => {
        e.preventDefault();
        const id = document.getElementById("idProducto").value;
        const file = inputImagenVenta.files[0];
        let imagenRuta = inputImagenVenta.dataset.prev || "";

        if (file) {
            const ruta = await subirImagenReal(file, "venta");
            if (!ruta) {
                showToast("Error al subir la imagen", "error");
                return;
            }
            imagenRuta = ruta;
        }

        if (!id && (!imagenRuta || imagenRuta.trim() === "")) {
            showToast("Debes subir una imagen antes de guardar el producto", "warning");
            return;
        }

        const data = {
            nombre: document.getElementById("nombre").value,
            descripcion: document.getElementById("descripcion").value,
            precio: parseFloat(document.getElementById("precio").value),
            stock: parseInt(document.getElementById("stock").value),
            categoria: capitalizarCadaPalabra(document.getElementById("categoria").value),
            imagen: imagenRuta
        };

        try {
            const res = id
                ? await fetch(`${API_PRODUCTOS}/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                })
                : await fetch(API_PRODUCTOS, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

            await res.json();
            showToast(id ? "Producto actualizado correctamente" : "Producto agregado correctamente", "success");
            formVenta.reset();
            document.getElementById("idProducto").value = "";
            document.getElementById("preview-imagen").innerHTML = "";
            inputImagenVenta.dataset.prev = "";
            cargarProductos();
        } catch (err) {
            console.error(err);
            showToast("Error al guardar", "error");
        }
    });

    // ===== FORMULARIO PRODUCTO BARBERO =====
    const formBarbero = document.getElementById("form-producto-barbero");
    const inputImagenBarbero = document.getElementById("imagen-barbero");

    inputImagenBarbero.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        mostrarVistaPrevia(inputImagenBarbero, "preview-imagen-barbero");

        const ruta = await subirImagenReal(file, "barbero");
        if (ruta) inputImagenBarbero.dataset.prev = ruta;
    });

    formBarbero.addEventListener("submit", async e => {
        e.preventDefault();
        const id = document.getElementById("idProductoBarbero").value;
        const file = inputImagenBarbero.files[0];
        let imagenRuta = inputImagenBarbero.dataset.prev || "";

        if (file) {
            const ruta = await subirImagenReal(file, "barbero");
            if (!ruta) {
                showToast("Error al subir la imagen", "error");
                return;
            }
            imagenRuta = ruta;
        }

        if (!id && !imagenRuta) {
            showToast("La imagen es obligatoria para agregar un nuevo producto barbero", "warning");
            return;
        }

        const data = {
            nombre: document.getElementById("nombre-barbero").value,
            descripcion: document.getElementById("descripcion-barbero").value,
            stock: parseInt(document.getElementById("stock-barbero").value),
            categoria: capitalizarCadaPalabra(document.getElementById("categoria-barbero").value),
            imagen: imagenRuta
        };

        try {
            const res = id
                ? await fetch(`${API_PRODUCTOS_BARBERO}/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                })
                : await fetch(API_PRODUCTOS_BARBERO, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

            await res.json();
            showToast(id ? "Producto barbero actualizado correctamente" : "Producto barbero agregado correctamente", "success");
            formBarbero.reset();
            document.getElementById("idProductoBarbero").value = "";
            document.getElementById("preview-imagen-barbero").innerHTML = "";
            inputImagenBarbero.dataset.prev = "";
            cargarProductos();
        } catch (err) {
            console.error(err);
            showToast("Error al guardar", "error");
        }
    });

    // ===== BOTONES CANCELAR =====
    const btnCancelarVenta = document.getElementById("cancelar-producto");
    btnCancelarVenta.addEventListener("click", () => {
        formVenta.reset();
        document.getElementById("idProducto").value = "";
        document.getElementById("preview-imagen").innerHTML = "";
        inputImagenVenta.value = "";
        inputImagenVenta.dataset.prev = "";
        showToast("Formulario limpiado, listo para agregar un nuevo producto", "info");
    });

    const btnCancelarBarbero = document.getElementById("cancelar-barbero");
    btnCancelarBarbero.addEventListener("click", () => {
        formBarbero.reset();
        document.getElementById("idProductoBarbero").value = "";
        document.getElementById("preview-imagen-barbero").innerHTML = "";
        inputImagenBarbero.value = "";
        inputImagenBarbero.dataset.prev = "";
        showToast("Formulario limpiado, listo para agregar un nuevo producto barbero", "info");
    });

    // ===== CARGAMOS PRODUCTOS AL INICIO =====
    cargarProductos();
});

// ===== FILTROS =====
function aplicarFiltro(btnSelector, gridSelector) {
    const botones = document.querySelectorAll(btnSelector);
    botones.forEach(btn => {
        btn.addEventListener("click", () => {
            botones.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const categoria = btn.dataset.categoria.trim().toLowerCase();
            document.querySelectorAll(gridSelector + " .producto-card").forEach(card => {
                const catCard = card.dataset.categoria.trim().toLowerCase();
                card.style.display = (categoria === "todos" || catCard === categoria) ? "block" : "none";
            });
        });
    });
}

aplicarFiltro(".filtroProductos-btn", "#productos-grid");
aplicarFiltro(".solicitud-filtro-btn", "#productos-barbero-grid");
