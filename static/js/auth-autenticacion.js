document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const navActions = document.querySelector(".nav-actions");
    const navLinks = document.querySelector(".nav-links");

    // Crear contenedor para saludo + logout
    let userMenu = document.getElementById("user-menu");
    if (!userMenu) {
        userMenu = document.createElement("div");
        userMenu.id = "user-menu";
        userMenu.style.display = "flex";
        userMenu.style.alignItems = "center";
        userMenu.style.gap = "10px";
    }

    if (usuario) {
        // Ocultar botones de login y reservar
        const btnLogin = document.querySelector(".iniciar");
        const btnReservar = document.querySelector(".botonreservar");
        if (btnLogin) btnLogin.style.display = "none";
        if (btnReservar) btnReservar.style.display = "none";

        // Crear saludo y botón de logout
        userMenu.innerHTML = `
            <span>Hola, ${usuario.nombreCompleto}</span>
            <button id="logoutBtn" class="btn">Cerrar sesión</button>
        `;

        // Insertar saludo después del carrito
        const searchContainer = document.querySelector(".search-container");
        const cartBtn = document.querySelector("#btn-carrito");
        if (searchContainer && cartBtn) {
            navActions.insertBefore(userMenu, cartBtn.nextSibling);
        } else {
            navActions.appendChild(userMenu);
        }

        // Logout
        // Logout
        const logoutBtn = document.getElementById("logoutBtn");
        logoutBtn.addEventListener("click", () => {
            // Mostrar modal de confirmación
            showToast("Sesión cerrada correctamente", "success");

            setTimeout(() => {
                localStorage.removeItem("usuario");
                window.location.reload();
            }, 1000);
        });

        // Agregar enlace “Historial” al nav solo si está logueado
        let historialLink = document.getElementById("link-historial");
        if (!historialLink) {
            historialLink = document.createElement("a");
            historialLink.href = "usuario.html";
            historialLink.id = "link-historial";
            historialLink.textContent = "Historial";

            const linkContactos = navLinks.querySelector('a[href="#contactos"]');
            if (linkContactos) {
                linkContactos.insertAdjacentElement("afterend", historialLink);
            } else {
                navLinks.appendChild(historialLink);
            }
        }

        // -------------------------
        //  Mostrar HISTORIAL en barra inferior
        // -------------------------
        const bottomHistorial = document.getElementById("btn-historial");
        if (bottomHistorial) {
            bottomHistorial.style.display = "flex";
        }

        // Responsivo: mover saludo y logout al menú hamburguesa
        const handleResize = () => {
            if (window.innerWidth < 768) {
                const hamburgerMenu = document.getElementById("nav-links");
                if (hamburgerMenu && !hamburgerMenu.contains(userMenu)) {
                    hamburgerMenu.appendChild(userMenu);
                    userMenu.style.display = "flex";
                    userMenu.style.flexDirection = "column";
                    userMenu.style.gap = "5px";
                    userMenu.style.margin = "10px 0";
                }
            } else {
                if (!navActions.contains(userMenu)) {
                    const cartBtn = document.querySelector("#btn-carrito");
                    navActions.insertBefore(userMenu, cartBtn.nextSibling);
                    userMenu.style.flexDirection = "row";
                    userMenu.style.gap = "10px";
                    userMenu.style.margin = "0";
                }
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize();

    } else {
        // Usuario no logueado
        if (userMenu) userMenu.style.display = "none";
        const btnLogin = document.querySelector(".btn.iniciar");
        const btnReservar = document.querySelector(".btn.reservar");
        if (btnLogin) btnLogin.style.display = "inline-block";
        if (btnReservar) btnReservar.style.display = "inline-block";

        // Eliminar link de historial si existía
        const historialLink = document.getElementById("link-historial");
        if (historialLink) historialLink.remove();

        // Ocultar historial en barra inferior
        const bottomHistorial = document.getElementById("btn-historial");
        if (bottomHistorial) {
            bottomHistorial.style.display = "none";
        }
    }
});
