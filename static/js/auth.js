document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nombreCompleto = document.getElementById("nombreCompleto").value.trim();
            const dni = document.getElementById("dni").value.trim();
            const telefono = document.getElementById("telefono").value.trim();
            const correo = document.getElementById("correo").value.trim();
            const username = document.getElementById("username").value.trim();
            const contrasena = document.getElementById("contrasena").value.trim();
            const confirmar = document.getElementById("confirmar").value.trim();

            // ======== VALIDACIONES ========
            const dniRegex = /^[0-9]{8}$/;
            const telefonoRegex = /^9[0-9]{8}$/;
            const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!nombreCompleto) { showToast("El nombre completo es obligatorio", "error"); return; }
            if (!dniRegex.test(dni)) { showToast("El DNI debe tener exactamente 8 números", "error"); return; }
            if (!telefonoRegex.test(telefono)) { showToast("El Número de Celular debe tener 9 dígitos y empezar con 9", "error"); return; }
            if (!correoRegex.test(correo)) { showToast("El correo electrónico no tiene un formato válido", "error"); return; }
            if (!username) { showToast("El nombre de usuario es obligatorio", "error"); return; }
            if (contrasena.length < 6) { showToast("La contraseña debe tener al menos 6 caracteres", "error"); return; }
            if (contrasena !== confirmar) { showToast("Las contraseñas no coinciden", "error"); return; }

            const usuario = {
                nombreCompleto,
                dni,
                telefono,
                correo,
                username,
                contrasena,
                idRol: 1  // ROL CLIENTE POR DEFECTO
            };

            try {
                const response = await fetch("https://app-barberia-production.up.railway.app/api/usuarios/registrar", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(usuario),
                });

                if (response.ok) {
                    showToast("Usuario registrado correctamente", "success");
                    setTimeout(() => (window.location.href = "login.html"), 1200);
                } else {
                    let data = {};
                    try { data = await response.json(); } catch { }
                    showToast(data.message || "Error al registrar usuario", "error");
                }
            } catch (error) {
                console.error(error);
                showToast("Error en la conexión con el servidor", "error");
            }
        });
    }

    // ======== LOGIN ========
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("username").value.trim();
            const contrasena = document.getElementById("contrasena").value.trim();
            const loginData = { username, contrasena };

            try {
                const response = await fetch("https://app-barberia-production.up.railway.app/api/usuarios/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(loginData),
                });

                if (!response.ok) {
                    let data = {};
                    try { data = await response.json(); } catch { }
                    showToast(data.message || "Usuario o contraseña incorrectos", "error");
                    return;
                }

                const usuario = await response.json();

                // Guardar usuario
                localStorage.setItem("usuario", JSON.stringify(usuario));
                localStorage.setItem("idUsuario", usuario.idUsuario);

                //  Si el usuario es barbero, obtener sus datos desde el endpoint exclusivo
                if (usuario.rol === "barbero") {
                    try {
                        const resBarbero = await fetch(`https://app-barberia-production.up.railway.app/api/barbero-login/usuario/${usuario.idUsuario}`);
                        if (resBarbero.ok) {
                            const barbero = await resBarbero.json();
                            localStorage.setItem("idBarbero", barbero.idBarbero);
                            localStorage.setItem("fotoBarbero", barbero.foto);
                            localStorage.setItem("descripcionBarbero", barbero.descripcion);
                            console.log(" Barbero guardado:", barbero);
                        } else {
                            console.warn(" El usuario no tiene perfil de barbero.");
                        }
                    } catch (err) {
                        console.error("Error al obtener barbero:", err);
                    }
                }

                showToast("Inicio de sesión exitoso", "success");

                setTimeout(() => {
                    switch (usuario.rol) {
                        case "cliente":
                            window.location.href = "index.html";
                            break;
                        case "barbero":
                            window.location.href = "barbero.html";
                            break;
                        case "admin":
                            window.location.href = "admin.html";
                            break;
                        default:
                            window.location.href = "index.html";
                    }
                }, 1000);

            } catch (error) {
                console.error(error);
                showToast("Error en la conexión con el servidor", "error");
            }
        });
    }
});
