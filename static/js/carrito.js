document.addEventListener("DOMContentLoaded", () => {
  const btnCarrito = document.getElementById("btn-carrito");
  const carritoPanel = document.getElementById("carrito-panel");
  const cerrarCarritoBtn = document.getElementById("cerrar-carrito");
  const lista = document.getElementById("carrito-lista");
  const totalEl = document.getElementById("carrito-total");
  const contadorEl = document.getElementById("carrito-contador");

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // --- Mostrar / ocultar ---
  btnCarrito.addEventListener("click", () => carritoPanel.classList.add("abierto"));
  cerrarCarritoBtn.addEventListener("click", () => carritoPanel.classList.remove("abierto"));

  // --- Escuchar evento "Agregar al carrito" desde tienda.js ---
  document.addEventListener("productoAgregado", e => agregarAlCarrito(e.detail));

  // --- Agregar producto ---
  function agregarAlCarrito(prod) {
    const existente = carrito.find(p => p.id === prod.id);

    if (existente) {
      // Verificar límite de stock
      if (existente.cantidad + 1 > prod.stock) {
        showToast(`Supera el límite de stock (${prod.stock} disponibles)`, "error");
        return;
      }
      existente.cantidad++;
    } else {
      carrito.push({
        id: prod.id,
        nombre: prod.nombre,
        precio: prod.precio,
        img: prod.img || "/img/productos/default.png",
        cantidad: 1,
        stock: prod.stock
      });
    }

    guardarCarrito();
    renderizarCarrito();
  }

  // --- Eliminar producto ---
  function eliminarDelCarrito(id) {
    carrito = carrito.filter(p => p.id !== id);
    guardarCarrito();
    renderizarCarrito();
  }

  // --- Cambiar cantidad ---
  function cambiarCantidad(id, delta) {
    const item = carrito.find(p => p.id === id);
    if (!item) return;

    // Controlar que no exceda el stock
    if (delta > 0 && item.cantidad >= item.stock) {
      showToast(`Supera el límite de stock (${item.stock} disponibles)`, "error");
      return;
    }

    item.cantidad += delta;

    if (item.cantidad <= 0) {
      eliminarDelCarrito(id);
    } else {
      guardarCarrito();
      renderizarCarrito();
    }
  }

  // --- Renderizar carrito ---
  function renderizarCarrito() {
    lista.innerHTML = "";

    carrito.forEach(prod => {
      const li = document.createElement("li");
      li.classList.add("carrito-item");
      li.innerHTML = `
        <img src="${prod.img}" alt="${prod.nombre}">
        <div class="info">
          <h4>${prod.nombre}</h4>
          <p>S/.${prod.precio.toFixed(2)}</p>
          <p class="stock">Stock: ${prod.stock}</p>
          <div class="cantidad">
            <button class="btn-cantidad menos" data-id="${prod.id}">−</button>
            <span>${prod.cantidad}</span>
            <button class="btn-cantidad mas ${prod.cantidad >= prod.stock ? "deshabilitado" : ""}" data-id="${prod.id}">+</button>
          </div>
        </div>
        <button class="btn-eliminar" data-id="${prod.id}">&times;</button>
      `;
      lista.appendChild(li);
    });

    const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
    totalEl.textContent = `S/ ${total.toFixed(2)}`;
    contadorEl.textContent = carrito.reduce((sum, p) => sum + p.cantidad, 0);

    //  Reasignar eventos dinámicamente
    lista.querySelectorAll(".btn-eliminar").forEach(btn => {
      btn.onclick = () => eliminarDelCarrito(parseInt(btn.dataset.id));
    });
    lista.querySelectorAll(".btn-cantidad.menos").forEach(btn => {
      btn.onclick = () => cambiarCantidad(parseInt(btn.dataset.id), -1);
    });
    lista.querySelectorAll(".btn-cantidad.mas").forEach(btn => {
      btn.onclick = () => cambiarCantidad(parseInt(btn.dataset.id), +1);
    });
  }

  // --- Guardar en localStorage ---
  function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }

  renderizarCarrito();
});
