document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    const saludo = document.getElementById("saludoBarbero");
    const btnCerrarSesion = document.getElementById("btnCerrarSesion");

    // Si no hay usuario, cerrar sesión automáticamente
    if (!usuario) {
        if (saludo) saludo.style.display = "none";
        if (btnCerrarSesion) btnCerrarSesion.style.display = "none";
        return;
    }

    // Mostrar saludo y botón si es barbero
    if (usuario.rol === "barbero") {
        if (saludo) {
            saludo.textContent = `Hola, ${usuario.nombreCompleto}`;
            saludo.style.display = "inline-block";
        }

        if (btnCerrarSesion) {
            btnCerrarSesion.style.display = "inline-block";
            btnCerrarSesion.addEventListener("click", () => {
                // Mostrar el mensaje antes de cerrar sesión
                showToast("Sesión cerrada correctamente", "success");

                // Esperar 3 segundos para que el usuario vea el toast
                setTimeout(() => {
                    localStorage.removeItem("usuario");
                    window.location.href = "login.html"; // Redirige a login
                }, 1000);
            });
        }
    } else {
        // Ocultar elementos si no es barbero
        if (saludo) saludo.style.display = "none";
        if (btnCerrarSesion) btnCerrarSesion.style.display = "none";
    }

    // Evitar que usando la flecha atrás se mantenga la sesión
    window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
            if (!usuario || usuario.rol !== "barbero") {
                localStorage.removeItem("usuario");
                window.location.href = "login.html";
            }
        }
    });
});
