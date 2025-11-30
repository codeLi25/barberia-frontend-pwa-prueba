document.addEventListener("DOMContentLoaded", () => {
    const tbodyUsuarios = document.getElementById("usuarios-body");
    const modalRol = document.getElementById("modal-rol");
    const formRol = document.getElementById("form-rol");
    const selectRol = document.getElementById("nuevo-rol");
    const closeModal = modalRol.querySelector(".close");
    const cancelarBtn = formRol.querySelector(".boton-cancelar");

    const extraBarbero = document.getElementById("extra-barbero");
    const inputFoto = document.getElementById("foto-barbero");
    const inputDescripcion = document.getElementById("descripcion-barbero");

    // Vista previa de imagen
    const previewImg = document.createElement("img");
    previewImg.id = "preview-img";
    previewImg.style.maxWidth = "120px";
    previewImg.style.borderRadius = "8px";
    previewImg.style.marginTop = "8px";
    previewImg.style.display = "none";
    extraBarbero.appendChild(previewImg);

    let usuarioSeleccionado = null;

    //  1. Cargar usuarios desde el backend
    async function cargarUsuarios() {
        try {
            const response = await fetch("/api/usuarios/listar");
            if (!response.ok) throw new Error("Error al obtener usuarios");

            const usuarios = await response.json();
            mostrarUsuarios(usuarios);
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        }
    }

    //  2. Mostrar usuarios en la tabla
    function mostrarUsuarios(usuarios) {
        tbodyUsuarios.innerHTML = "";

        usuarios.forEach((u) => {
            const rolActual = u.rol ? u.rol.nombreRol : "Sin rol";

            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${u.idUsuario}</td>
        <td>${u.nombreCompleto}</td>
        <td>${u.dni}</td>
        <td>${u.telefono}</td>
        <td>${u.correo}</td>
        <td>${u.username}</td>
        <td class="rol">${rolActual}</td>
        <td>
          <button class="cambiar-rol-btn" data-id="${u.idUsuario}" data-rol="${rolActual}">
            <i class="fas fa-user-cog"></i>
          </button>
          <button class="eliminar-usuario-btn" data-id="${u.idUsuario}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
            tbodyUsuarios.appendChild(tr);
        });

        agregarEventosBotones();
    }

    // 3. Agregar listeners
    function agregarEventosBotones() {
        document.querySelectorAll(".cambiar-rol-btn").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                const rolActual = btn.dataset.rol.toLowerCase();
                usuarioSeleccionado = id;

                selectRol.value = rolActual;

                if (rolActual === "barbero") {
                    extraBarbero.style.display = "block";
                    await cargarDatosBarbero(id);
                } else {
                    extraBarbero.style.display = "none";
                    inputFoto.value = "";
                    inputDescripcion.value = "";
                    previewImg.style.display = "none";
                }

                abrirModal();
            });
        });

        document.querySelectorAll(".eliminar-usuario-btn").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                if (confirm("¿Seguro que deseas eliminar este usuario?")) {
                    await eliminarUsuario(id);
                }
            });
        });
    }

    // 4. Modal
    function abrirModal() {
        modalRol.style.display = "flex";
    }
    function cerrarModal() {
        modalRol.style.display = "none";
        usuarioSeleccionado = null;
        inputFoto.value = "";
        inputDescripcion.value = "";
        extraBarbero.style.display = "none";
        previewImg.style.display = "none";
    }
    closeModal.addEventListener("click", cerrarModal);
    cancelarBtn.addEventListener("click", cerrarModal);
    window.addEventListener("click", (e) => {
        if (e.target === modalRol) cerrarModal();
    });

    //  5. Mostrar campos extra al seleccionar "barbero"
    selectRol.addEventListener("change", (e) => {
        const valor = e.target.value.toLowerCase();
        extraBarbero.style.display = valor === "barbero" ? "block" : "none";
    });

    //  6. Subir imagen automáticamente
    inputFoto.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Mostrar vista previa
        const reader = new FileReader();
        reader.onload = () => {
            previewImg.src = reader.result;
            previewImg.style.display = "block";
        };
        reader.readAsDataURL(file);

        // Subir al backend
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/barbero-login/upload", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Error al subir imagen");

            const data = await res.json();
            inputFoto.dataset.serverPath = data.ruta; // Guardamos la ruta del servidor
            console.log(" Imagen subida:", data.ruta);
            mostrarToast("Imagen subida correctamente");
        } catch (err) {
            console.error("Error subiendo imagen:", err);
            mostrarToast("Error al subir imagen", true);
        }
    });

    // 7. Guardar cambios de rol y barbero
    formRol.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!usuarioSeleccionado) return;

        const nuevoRol = selectRol.value.toLowerCase();
        let foto = null;
        let descripcion = null;

        if (nuevoRol === "barbero") {
            foto = inputFoto.dataset.serverPath || "img/barberos/default.png";
            descripcion = inputDescripcion.value.trim() || "Barbero profesional.";
        }

        try {
            //  1. Actualizar el rol del usuario
            const body = { rol: nuevoRol, foto, descripcion };
            const response = await fetch(`/api/usuarios/${usuarioSeleccionado}/rol`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error(await response.text());

            // 2. Si es barbero, registrar también en la tabla de barberos
            if (nuevoRol === "barbero") {
                const registroResp = await fetch("/api/barbero-login/registrar", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        idUsuario: parseInt(usuarioSeleccionado),
                        foto,
                        descripcion,
                    }),
                });

                if (!registroResp.ok) throw new Error("Error al registrar barbero");
            }

            mostrarToast("Rol actualizado correctamente");
            cerrarModal();
            await cargarUsuarios();
        } catch (error) {
            console.error("❌ Error actualizando rol o registrando barbero:", error);
            mostrarToast("Error al actualizar rol o registrar barbero", true);
        }
    });


    //  8. Cargar datos del barbero
    async function cargarDatosBarbero(idUsuario) {
        try {
            const resp = await fetch(`/api/barbero-login/usuario/${idUsuario}`);
            if (!resp.ok) return;
            const data = await resp.json();
            inputDescripcion.value = data.descripcion || "";
            if (data.foto) {
                previewImg.src = data.foto;
                previewImg.style.display = "block";
                inputFoto.dataset.serverPath = data.foto; // importante para submit
            }
        } catch (err) {
            console.warn("No se pudo cargar datos del barbero:", err);
        }
    }

    //  9. Eliminar usuario
    async function eliminarUsuario(id) {
        try {
            const response = await fetch(`/api/usuarios/eliminar/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Error al eliminar usuario");
            mostrarToast("Usuario eliminado correctamente");
            await cargarUsuarios();
        } catch (error) {
            console.error(error);
            mostrarToast("Error al eliminar usuario", true);
        }
    }

    //  10. Toast
    function mostrarToast(mensaje, error = false) {
        const toastContainer = document.getElementById("toast-container");
        const toast = document.createElement("div");
        toast.className = `toast ${error ? "error" : "success"}`;
        toast.textContent = mensaje;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    //  Inicializar
    cargarUsuarios();
});
