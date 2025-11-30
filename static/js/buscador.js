document.addEventListener("DOMContentLoaded", () => {

    // Inputs
    const searchDesktop = document.getElementById("search-desktop");
    const searchMobile = document.getElementById("search-mobile");

    // UL sugerencias
    const sugDesktop = document.getElementById("buscador-sugerencias-desktop");
    const sugMobile = document.getElementById("buscador-sugerencias-mobile");

    //  Íconos de lupa
    const lupaDesktop = document.getElementById("lupa-desktop");
    const lupaMobile = document.getElementById("lupa-mobile");

    // Esperar a que tienda.js cargue productos
    document.addEventListener("productosCargados", (e) => {
        const productos = e.detail; 

        function buscar(texto, listaSugerencias, input) {
            texto = texto.toLowerCase().trim();

            if (texto.length < 1) {
                listaSugerencias.innerHTML = "";
                listaSugerencias.style.display = "none";
                return;
            }

            const resultados = productos.filter(p =>
                p.nombre.toLowerCase().includes(texto)
            );

            listaSugerencias.innerHTML = "";

            if (resultados.length === 0) {
                listaSugerencias.style.display = "none";
                return;
            }

            resultados.forEach(p => {
                const li = document.createElement("li");
                li.textContent = p.nombre;
                li.classList.add("item-sugerencia");

                li.addEventListener("click", () => {
                    input.value = p.nombre;
                    listaSugerencias.innerHTML = "";
                    listaSugerencias.style.display = "none";
                    mostrarProductoSinImportarCategoria(p);
                });

                listaSugerencias.appendChild(li);
            });

            listaSugerencias.style.display = "block";
        }

        // eventos INPUT
        searchDesktop.addEventListener("input", e =>
            buscar(e.target.value, sugDesktop, searchDesktop)
        );

        searchMobile.addEventListener("input", e =>
            buscar(e.target.value, sugMobile, searchMobile)
        );

        // Lupa desktop
        lupaDesktop?.addEventListener("click", () => {
            const texto = searchDesktop.value.toLowerCase().trim();
            if (!texto) return;

            const producto = productos.find(
                p => p.nombre.toLowerCase() === texto
            );

            if (producto) {
                //  OCULTAR DROPDOWN DESPUÉS DE BUSCAR
                sugDesktop.innerHTML = "";
                sugDesktop.style.display = "none";
                mostrarProductoSinImportarCategoria(producto);
            }
        });

        //  Lupa mobile
        lupaMobile?.addEventListener("click", () => {
            const texto = searchMobile.value.toLowerCase().trim();
            if (!texto) return;

            const producto = productos.find(
                p => p.nombre.toLowerCase() === texto
            );

            if (producto) {
                //  OCULTAR DROPDOWN DESPUÉS DE BUSCAR
                sugMobile.innerHTML = "";
                sugMobile.style.display = "none";
                mostrarProductoSinImportarCategoria(producto);
            }
        });

    });

    function mostrarProductoSinImportarCategoria(producto) {
        const categoria = producto.categoria.toLowerCase();

        // Buscar botón de esa categoría
        const btnCategoria = document.querySelector(
            `.filtroProductos-btn[data-categoria="${categoria}"]`
        );

        const btnTodos = document.querySelector(
            `.filtroProductos-btn[data-categoria="todos"]`
        );

        if (btnCategoria) btnCategoria.click();
        else btnTodos?.click();

        setTimeout(() => resaltarProducto(producto.id), 350);
    }

    function resaltarProducto(idProducto) {
        const cards = document.querySelectorAll(".card-producto");

        // quitar resaltado previo
        cards.forEach(card => {
            card.classList.remove("resaltado");
            card.style.border = "none";
        });

        // buscar card del producto
        const card = [...cards].find(c =>
            c.querySelector(".btn-agregar")?.dataset.id == idProducto
        );

        if (card) {

            card.style.display = "block"; 

            card.style.opacity = "1";
            card.style.visibility = "visible";

            card.classList.add("resaltado");
            card.style.border = "3px solid #00ffcc";

            card.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    }

});
