document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("productos-tienda-container");
  const btnPrev = document.querySelector(".carrusel-tienda-btn.prev");
  const btnNext = document.querySelector(".carrusel-tienda-btn.next");
  const filtroBtns = document.querySelectorAll(".filtroProductos-btn");
  const paginacionEl = document.getElementById("productos-paginacion");

  const API_URL = "http://localhost:8080/api/productos";

  let productos = [];
  let productosFiltrados = [];
  let paginaActual = 0;
  const POR_PAGINA = 8;

  //  Cargar productos desde el backend
  async function cargarProductos() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al cargar productos");

      productos = await res.json();

      //  Normalizamos los datos
      productos = productos.map(p => ({
        id: p.idProducto,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: parseFloat(p.precio),
        stock: p.stock,
        img: p.imagen,
        categoria: p.categoria
      }));

      productosFiltrados = [...productos];

        document.dispatchEvent(new CustomEvent("productosCargados", { detail: productos }));
        
      renderizarPagina();
    } catch (error) {
      console.error("Error:", error);
      contenedor.innerHTML = `<p style="color:red;">No se pudieron cargar los productos.</p>`;
    }
  }

  //  Renderizar productos por página
  function renderizarPagina() {
    const inicio = paginaActual * POR_PAGINA;
    const fin = inicio + POR_PAGINA;
    const items = productosFiltrados.slice(inicio, fin);

    contenedor.innerHTML = "";
    items.forEach(prod => {
      const card = document.createElement("div");
      card.className = "card-producto";

      //  Si no hay stock, desactivar botón
      const botonHTML = prod.stock > 0
        ? `<button class="btn-agregar" data-id="${prod.id}">Agregar al carrito</button>`
        : `<button class="btn-agregar agotado" disabled>Agotado</button>`;

      card.innerHTML = `
        <div class="thumb-wrap">
          <img src="${prod.img}" alt="${prod.nombre}">
        </div>
        <div class="card-body">
          <h3>${prod.nombre}</h3>
          <p>Precio: S/.${prod.precio.toFixed(2)}</p>
          <p class="stock-info ${prod.stock === 0 ? "sin-stock" : ""}">
            Stock disponible: ${prod.stock}
          </p>
        </div>
        ${botonHTML}
      `;

      contenedor.appendChild(card);
    });

    actualizarControles();
  }

  //  Actualiza botones y número de página
  function actualizarControles() {
    const totalPaginas = Math.ceil(productosFiltrados.length / POR_PAGINA);
    btnPrev.disabled = paginaActual === 0;
    btnNext.disabled = paginaActual >= totalPaginas - 1;
    paginacionEl.textContent = `Página ${paginaActual + 1} de ${totalPaginas}`;
  }

  //  Botones de paginación
  btnNext.addEventListener("click", () => {
    const totalPaginas = Math.ceil(productosFiltrados.length / POR_PAGINA);
    if (paginaActual < totalPaginas - 1) {
      paginaActual++;
      renderizarPagina();
    }
  });

  btnPrev.addEventListener("click", () => {
    if (paginaActual > 0) {
      paginaActual--;
      renderizarPagina();
    }
  });

  // Filtros por categoría
  filtroBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filtroBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const cat = btn.dataset.categoria;
      productosFiltrados =
        cat === "todos"
          ? productos.slice()
          : productos.filter(p => p.categoria.toLowerCase() === cat.toLowerCase());

      paginaActual = 0;
      renderizarPagina();
    });
  });

  // Manejar agregar al carrito
  contenedor.addEventListener("click", e => {
    if (e.target.classList.contains("btn-agregar") && !e.target.disabled) {
      const id = Number(e.target.dataset.id);
      const producto = productos.find(p => p.id === id);
      if (!producto) return;

      // Comprobar stock actual en carrito (si ya existe)
      const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      const existente = carrito.find(item => item.id === producto.id);
      const cantidadActual = existente ? existente.cantidad : 0;

      if (cantidadActual + 1 > producto.stock) {
        showToast(`Supera el límite de stock (${producto.stock} disponibles)`, "error");
        return;
      }

      // Agregar o actualizar cantidad
      if (existente) {
        existente.cantidad += 1;
      } else {
        carrito.push({ ...producto, cantidad: 1 });
      }

      localStorage.setItem("carrito", JSON.stringify(carrito));

      showToast(`"${producto.nombre}" agregado al carrito`, "success", 1500);

      // Disparar evento global
      document.dispatchEvent(new CustomEvent("productoAgregado", { detail: producto }));
    }
  });

  // Cargar al inicio
  await cargarProductos();
});
