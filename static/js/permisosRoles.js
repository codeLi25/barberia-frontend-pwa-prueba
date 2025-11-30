document.addEventListener("DOMContentLoaded", () => {
    validarAcceso();
});

function validarAcceso() {

    const usuario = JSON.parse(localStorage.getItem("usuario"));

    // Página actual
    let pagina = window.location.pathname.split("/").pop();
    if (!pagina || pagina.trim() === "") pagina = "index.html";

    const paginasPublicas = ["index.html", "login.html", "register.html"];

    // Obtener rol
    let idRol = null;
    if (usuario && usuario.rol) {
        const mapa = { cliente: 1, barbero: 2, admin: 3 };
        idRol = mapa[usuario.rol.toLowerCase()] || null;
    }

    // ================================================
    // SI ESTÁ LOGUEADO Y ENTRA A PÁGINAS PÚBLICAS
    // ================================================
    if (usuario && paginasPublicas.includes(pagina)) {

        // Cliente SÍ puede ver index.html
        if (idRol === 1 && pagina === "index.html") {
            mostrarPagina();
            return;
        }

        // Barbero / Admin NO pueden ver páginas públicas
        window.location.href = paginaInicioPorRol(idRol);
        return;
    }

    // ================================================
    // Usuario NO logueado → permitir solo páginas públicas
    // ================================================
    if (paginasPublicas.includes(pagina) && !usuario) {
        mostrarPagina();
        return;
    }

    // ================================================
    // SI NO ESTÁ LOGUEADO → ERROR
    // ================================================
    if (!usuario) {
        mostrarError("Debes iniciar sesión para acceder a esta página.", "index.html");
        return;
    }

    // ================================================
    // PERMISOS POR ROL
    // ================================================
    const permisos = {
        1: ["usuario.html"],
        2: ["barbero.html"],
        3: ["admin.html"]
    };

    const paginasProtegidas = ["usuario.html", "barbero.html", "admin.html"];
    const permitidas = permisos[idRol] || [];

    // Página protegida accesible solo para el rol correcto
    if (paginasProtegidas.includes(pagina) && !permitidas.includes(pagina)) {
        mostrarError("No tienes permisos para acceder a esta sección.", paginaInicioPorRol(idRol));
        return;
    }

    // Todo OK → mostrar contenido
    mostrarPagina();
}

// =====================================================
// MOSTRAR LA PÁGINA (solo el contenido-pagina)
// =====================================================
function mostrarPagina() {
    const cont = document.getElementById("contenido-pagina");
    if (cont) cont.classList.remove("oculto-pagina");

    // Si había un error previo, lo quitamos
    document.getElementById("error-acceso")?.remove();
}

// =====================================================
// MOSTRAR ERROR SIN MOSTRAR NADA DEL CONTENIDO
// =====================================================
function mostrarError(mensaje, redireccion) {

    const box = document.getElementById("error-acceso");
    const texto = document.getElementById("error-acceso-mensaje");
    const boton = document.getElementById("error-acceso-btn");

    // Ocultar TODO el contenido real
    const cont = document.getElementById("contenido-pagina");
    if (cont) cont.classList.add("oculto-pagina");

    // Mostrar overlay
    texto.textContent = mensaje;
    box.style.display = "flex";

    boton.onclick = () => {
        window.location.href = redireccion;
    };
}

// Home por rol
function paginaInicioPorRol(idRol) {
    switch (idRol) {
        case 1: return "index.html";     
        case 2: return "barbero.html";
        case 3: return "admin.html";
        default: return "index.html";
    }
}
