document.addEventListener("DOMContentLoaded", async () => {
  const contenedorProductos = document.getElementById("solicitud-productos-container");
  const paginacion = document.getElementById("solicitud-paginacion");
  const filtroBtns = document.querySelectorAll(".solicitud-filtro-btn");
  const contadorEl = document.getElementById("solicitud-contador");
  const btnPrev = document.querySelector(".solicitud-carrusel-btn.prev");
  const btnNext = document.querySelector(".solicitud-carrusel-btn.next");

  // ===============================
  // UL sugerencias (NUEVO)
  // ===============================
  const sugMobile = document.querySelector(".mobile-search .dropdown-sugerencias");
  const sugDesktop = document.querySelector(".desktop-search .dropdown-sugerencias");

  const API_URL = "http://localhost:8080/api/solicitud-productos";
  let productos = [];
  let productosFiltrados = [];
  let paginaActual = 1;
  const productosPorPagina = 8;

  // === CARGAR PRODUCTOS ===
  async function cargarProductos() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Error al obtener los productos");
      productos = await response.json();
      productosFiltrados = productos;
      mostrarProductos();
      generarPaginacion();
    } catch (error) {
      console.error("Error al cargar productos:", error);
      if (contenedorProductos) contenedorProductos.innerHTML = `<p class="error-msg">No se pudieron cargar los productos.</p>`;
    }
  }

  // === MOSTRAR PRODUCTOS ===
  function mostrarProductos() {
    if (!contenedorProductos) return;
    contenedorProductos.innerHTML = "";

    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productosFiltrados.slice(inicio, fin);

    if (productosPagina.length === 0) {
      contenedorProductos.innerHTML = `<p class="no-productos">No hay productos disponibles.</p>`;
      updatePrevNextState();
      return;
    }

    productosPagina.forEach(prod => {
      const productoHTML = `
        <div class="solicitud-producto-card solicitud-card">
          <div class="solicitud-producto-img-wrapper solicitud-thumb">
            <img src="${prod.imagen}" alt="${prod.nombre}" class="solicitud-producto-img">
          </div>
          <div class="solicitud-producto-info">
            <h3>${prod.nombre}</h3>
            <p>${prod.descripcion || "Sin descripción."}</p>
            <span class="solicitud-stock">Stock: ${prod.stock ?? 0}</span>
            <button class="solicitud-btn-agregar" data-id="${prod.idProductoBarbero}">Agregar</button>
          </div>
        </div>
      `;
      contenedorProductos.insertAdjacentHTML("beforeend", productoHTML);
    });

    ajustarImagenes();
    updatePrevNextState();
  }

  function ajustarImagenes() {
    const imgs = document.querySelectorAll(".solicitud-producto-img");
    imgs.forEach(img => {
      img.style.width = "200px";
      img.style.height = "200px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "10px";
    });
  }

  // === FILTROS ===
  filtroBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filtroBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const categoria = (btn.dataset.categoria || "").toLowerCase();
      productosFiltrados =
        categoria === "todos"
          ? productos
          : productos.filter(p => (p.categoria || "").toLowerCase().includes(categoria));

      paginaActual = 1;
      mostrarProductos();
      generarPaginacion();
    });
  });

  // === PAGINACIÓN ===
  function generarPaginacion() {
    if (!paginacion) return;
    paginacion.innerHTML = "";
    const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / productosPorPagina));

    for (let i = 1; i <= totalPaginas; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.classList.add("pagina-btn");
      btn.type = "button";
      btn.dataset.index = i;
      if (i === paginaActual) btn.classList.add("active");

      btn.addEventListener("click", () => {
        paginaActual = i;
        mostrarProductos();
        generarPaginacion();
      });

      paginacion.appendChild(btn);
    }

    updatePrevNextState();
  }

  function getTotalPaginas() {
    return Math.max(1, Math.ceil(productosFiltrados.length / productosPorPagina));
  }

  function updatePrevNextState() {
    if (!btnPrev || !btnNext) return;
    const total = getTotalPaginas();

    if (productosFiltrados.length === 0 || total <= 1) {
      btnPrev.disabled = true;
      btnNext.disabled = true;
    } else {
      btnPrev.disabled = paginaActual <= 1;
      btnNext.disabled = paginaActual >= total;
    }

    btnPrev.style.opacity = btnPrev.disabled ? "0.4" : "1";
    btnNext.style.opacity = btnNext.disabled ? "0.4" : "1";
  }

  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      if (paginaActual > 1) {
        paginaActual--;
        mostrarProductos();
        generarPaginacion();
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", () => {
      const total = getTotalPaginas();
      if (paginaActual < total) {
        paginaActual++;
        mostrarProductos();
        generarPaginacion();
      }
    });
  }

  // === AGREGAR PRODUCTO AL CARRITO ===
  contenedorProductos.addEventListener("click", (e) => {
    if (e.target.classList.contains("solicitud-btn-agregar")) {
      const id = parseInt(e.target.dataset.id);
      const producto = productos.find(p => p.idProductoBarbero === id);
      if (!producto) return;

      agregarASolicitud({
        id: producto.idProductoBarbero,
        nombre: producto.nombre,
        img: producto.imagen,
        stock: producto.stock,
        descripcion: producto.descripcion
      });
    }
  });

  function agregarASolicitud(producto) {
    let solicitud = JSON.parse(localStorage.getItem("solicitudProductos")) || [];
    const existente = solicitud.find(p => p.id === producto.id);

    if (existente && existente.cantidad >= producto.stock) {
      showToast(`Stock máximo alcanzado (${producto.stock}) para "${producto.nombre}".`, "error", 2000);
      return;
    }

    if (existente) {
      existente.cantidad++;
    } else {
      solicitud.push({ ...producto, cantidad: 1 });
    }

    localStorage.setItem("solicitudProductos", JSON.stringify(solicitud));

    const total = solicitud.reduce((sum, p) => sum + p.cantidad, 0);
    if (contadorEl) contadorEl.textContent = total;

    document.dispatchEvent(new CustomEvent("productoSolicitudAgregado", { detail: producto }));

    showToast(`"${producto.nombre}" agregado a la solicitud`, "success", 1500);
  }

  await cargarProductos();
  const solicitudInicial = JSON.parse(localStorage.getItem("solicitudProductos")) || [];
  const totalInicial = solicitudInicial.reduce((sum, p) => sum + p.cantidad, 0);
  if (contadorEl) contadorEl.textContent = totalInicial;

  if (paginacion) {
    const mo = new MutationObserver(() => {
      setTimeout(updatePrevNextState, 30);
    });
    mo.observe(paginacion, { childList: true });
  }

  window.addEventListener("resize", () => {
    clearTimeout(window.__resizeTimer);
    window.__resizeTimer = setTimeout(() => {
      updatePrevNextState();
    }, 150);
  });

  // =========================
  //  BUSCADOR PRODUCTOS BARBERO (CON DROPDOWN)
  // =========================

  const buscadores = document.querySelectorAll(".search-container .search");
  const iconosLupa = document.querySelectorAll(".search-container .search-icon");

  let cardResaltado = null;

  function limpiarResaltado() {
    if (cardResaltado) {
      cardResaltado.classList.remove("resaltado");
      cardResaltado = null;
    }
  }

  // === Mostrar sugerencias ===
  function mostrarSugerencias(texto, ul) {
    ul.innerHTML = "";

    if (!texto.trim()) {
      ul.style.display = "none";
      return;
    }

    const coincidencias = productos.filter(p =>
      p.nombre.toLowerCase().includes(texto.toLowerCase())
    );

    if (coincidencias.length === 0) {
      ul.style.display = "none";
      return;
    }

    coincidencias.slice(0, 5).forEach(prod => {
      const li = document.createElement("li");
      li.textContent = prod.nombre;

      li.addEventListener("click", () => {
        ul.innerHTML = "";
        ul.style.display = "none";
        buscarProducto(prod.nombre);
      });

      ul.appendChild(li);
    });

    ul.style.display = "block";
  }

  function buscarProducto(nombre) {
    const texto = nombre.toLowerCase().trim();
    if (!texto) return;

    const encontrado = productos.find(
      p => p.nombre.toLowerCase() === texto
    );

    if (!encontrado) {
      limpiarResaltado();
      return;
    }

    const index = productosFiltrados.indexOf(encontrado);
    if (index === -1) {
      limpiarResaltado();
      return;
    }

    paginaActual = Math.floor(index / productosPorPagina) + 1;
    mostrarProductos();
    generarPaginacion();

    setTimeout(() => {
      const cards = document.querySelectorAll(".solicitud-card");
      cards.forEach(card => {
        if (
          card.querySelector("h3") &&
          card.querySelector("h3").textContent.trim().toLowerCase() === texto
        ) {
          limpiarResaltado();
          card.classList.add("resaltado");
          cardResaltado = card;
          card.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    }, 50);
  }

  // Mostrar sugerencias al escribir
  buscadores.forEach(input => {
    input.addEventListener("input", () => {
      limpiarResaltado();

      const cont = input.closest(".search-container");
      const ul = cont.classList.contains("mobile-search") ? sugMobile : sugDesktop;

      mostrarSugerencias(input.value, ul);
    });
  });

  // Lupa (oculta dropdown)
  iconosLupa.forEach(icono => {
    icono.addEventListener("click", () => {
      const input = icono.parentElement.querySelector(".search");
      if (!input) return;

      const cont = icono.closest(".search-container");
      const ul = cont.classList.contains("mobile-search") ? sugMobile : sugDesktop;

      ul.innerHTML = "";
      ul.style.display = "none";

      buscarProducto(input.value);
    });
  });

  // Enter
  buscadores.forEach(input => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const cont = input.closest(".search-container");
        const ul = cont.classList.contains("mobile-search") ? sugMobile : sugDesktop;

        ul.innerHTML = "";
        ul.style.display = "none";

        buscarProducto(input.value);
      }
    });
  });

});
