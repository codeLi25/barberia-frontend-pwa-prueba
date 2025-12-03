document.addEventListener("DOMContentLoaded", async () => {
  const btnContinuar = document.getElementById("continuar-compra");
  const modal = document.getElementById("modalCompra");
  const form = document.getElementById("formCompra");
  const cancelarBtn = document.getElementById("cancelarCompra");
  const metodoPagoSelect = document.getElementById("metodoPago");
  const extraCampos = document.getElementById("extraCampos");

  // Secciones de compras
  const pendientesContainer = document.getElementById("comprasPendientes");
  const historialContainer = document.getElementById("historialCompras");

  // Obtener usuario del localStorage
  const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = usuarioLocal?.idUsuario;
  console.log("ID del usuario guardado:", idUsuario);

  let usuario = null;

  // ================== FUNCIONES ==================

  // Cargar datos del usuario
  async function cargarUsuario() {
    if (!idUsuario) return;
    try {
      const res = await fetch(`https://app-barberia-production.up.railway.app/api/usuarios/${idUsuario}`);
      if (!res.ok) throw new Error("Error al obtener usuario");
      usuario = await res.json();
      console.log("Usuario cargado desde backend:", usuario);

      // Autocompletar datos del cliente
      document.getElementById("nombreCliente").value = usuario.nombreCompleto || "";
      document.getElementById("dniCliente").value = usuario.dni || "";
      document.getElementById("telefonoCliente").value = usuario.telefono || "";
      document.getElementById("correoCliente").value = usuario.correo || "";
    } catch (error) {
      console.error("Error cargando usuario:", error);
      showToast("Error al cargar tus datos", "error");
    }
  }

  // Cargar compras del usuario
  async function cargarCompras() {
    if (!idUsuario) return;
    try {
      const res = await fetch(`https://app-barberia-production.up.railway.app/api/ventas/usuario/${idUsuario}`);
      if (!res.ok) throw new Error("Error al obtener compras");
      const ventas = await res.json();

      // Limpiar contenedores
      pendientesContainer.innerHTML = "";
      historialContainer.innerHTML = "";

      if (ventas.length === 0) {
        pendientesContainer.innerHTML = `<p>No tienes compras pendientes.</p>`;
        historialContainer.innerHTML = `<p>No tienes compras finalizadas.</p>`;
        return;
      }

      // Separar pendientes y finalizadas
      const pendientes = ventas.filter(v => v.estado === "PENDIENTE");
      const finalizadas = ventas.filter(v => v.estado === "FINALIZADA");

      if (pendientes.length === 0) {
        pendientesContainer.innerHTML = `<p>No tienes compras pendientes.</p>`;
      } else {
        pendientes.forEach(v => {
          const div = document.createElement("div");
          div.classList.add("compra-item");
          div.innerHTML = `
            <p><strong>ID:</strong> ${v.idVenta} | <strong>Método:</strong> ${v.metodoPago} | <strong>Fecha:</strong> ${new Date(v.fechaRegistro).toLocaleString()}</p>
            <ul>
              ${v.detalles.map(d => `<li>Producto ${d.idProducto} x ${d.cantidad}</li>`).join("")}
            </ul>
          `;
          pendientesContainer.appendChild(div);
        });
      }

      if (finalizadas.length === 0) {
        historialContainer.innerHTML = `<p>No tienes compras finalizadas.</p>`;
      } else {
        finalizadas.forEach(v => {
          const div = document.createElement("div");
          div.classList.add("compra-item");
          div.innerHTML = `
            <p><strong>ID:</strong> ${v.idVenta} | <strong>Método:</strong> ${v.metodoPago} | <strong>Fecha:</strong> ${new Date(v.fechaRegistro).toLocaleString()}</p>
            <ul>
              ${v.detalles.map(d => `<li>Producto ${d.idProducto} x ${d.cantidad}</li>`).join("")}
            </ul>
          `;
          historialContainer.appendChild(div);
        });
      }

    } catch (err) {
      console.error(err);
      pendientesContainer.innerHTML = `<p>Error al cargar compras.</p>`;
      historialContainer.innerHTML = `<p>Error al cargar compras.</p>`;
    }
  }

  // Formato tarjeta y fecha
  function attachCardInputListeners() {
    const numTarjetaEl = document.getElementById("numTarjeta");
    const fechaEl = document.getElementById("fechaVencimiento");
    const cvvEl = document.getElementById("cvv");

    if (numTarjetaEl) {
      numTarjetaEl.addEventListener("input", (e) => {
        let digits = e.target.value.replace(/\D/g, "").slice(0, 16);
        const parts = [];
        for (let i = 0; i < digits.length; i += 4) parts.push(digits.substring(i, i + 4));
        e.target.value = parts.join("-");
      });
    }

    if (fechaEl) {
      fechaEl.addEventListener("input", (e) => {
        let v = e.target.value.replace(/\D/g, "").slice(0, 4);
        if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
        e.target.value = v;
      });
    }

    if (cvvEl) {
      cvvEl.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/\D/g, "").slice(0, 3);
      });
    }
  }

  // Función para lanzar confeti
  function lanzarConfeti() {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
      colors: ["#00ffcc", "#ff6600", "#33ff00dc"],
    };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      }));
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      }));
    }, 250);
  }

  // ================== EVENTOS ==================

  // Mostrar modal de compra
  btnContinuar.addEventListener("click", () => {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (!usuarioLocal || !usuarioLocal.idUsuario) {
      showToast("Debes iniciar sesión para realizar una compra", "error");
      setTimeout(() => (window.location.href = "login.html"), 1500);
      return;
    }

    if (carrito.length === 0) {
      showToast("Tu carrito está vacío", "warning");
      return;
    }

    modal.classList.remove("hidden");
  });

  // Cerrar modal
  cancelarBtn.addEventListener("click", () => modal.classList.add("hidden"));

  // Mostrar campos según método de pago
  metodoPagoSelect.addEventListener("change", (e) => {
    const metodo = e.target.value;
    extraCampos.innerHTML = "";

    if (metodo === "Tarjeta") {
      extraCampos.classList.remove("hidden");
      extraCampos.innerHTML = `
        <div class="form-group">
          <label>Número de tarjeta:</label>
          <input id="numTarjeta" type="text" placeholder="XXXX-XXXX-XXXX-XXXX" maxlength="19" inputmode="numeric" autocomplete="cc-number">
        </div>
        <div class="form-group">
          <label>Fecha de vencimiento (MM/YY):</label>
          <input id="fechaVencimiento" type="text" placeholder="MM/YY" maxlength="5" inputmode="numeric" autocomplete="cc-exp">
        </div>
        <div class="form-group">
          <label>CVV:</label>
          <input id="cvv" type="password" maxlength="3" placeholder="123" inputmode="numeric" autocomplete="cc-csc">
        </div>
      `;
      attachCardInputListeners();
    } else if (metodo === "Yape") {
      extraCampos.classList.remove("hidden");
      extraCampos.innerHTML = `
        <div class="form-group text-center">
          <p>Número Yape: <strong>950 749 172</strong></p>
          <img src="img/yape-qr.jpg" alt="QR Yape" class="qr-yape">
        </div>
      `;
    } else {
      extraCampos.classList.add("hidden");
    }
  });

  // Confirmar compra
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const metodoPago = metodoPagoSelect.value;
    if (!metodoPago) {
      showToast("Selecciona un método de pago", "warning");
      return;
    }

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (!usuario) {
      showToast("No se pudieron cargar tus datos", "error");
      return;
    }

    const venta = {
      idUsuario: usuario.idUsuario,
      nombreCliente: usuario.nombreCompleto,
      dniCliente: usuario.dni,
      telefonoCliente: usuario.telefono,
      correoCliente: usuario.correo,
      metodoPago: metodoPago,
      detalles: carrito.map(item => ({
        idProducto: item.id,
        cantidad: item.cantidad
      }))
    };

    try {
      const res = await fetch("https://app-barberia-production.up.railway.app/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(venta)
      });

      if (!res.ok) throw new Error("Error al registrar venta");

      showToast("Venta registrada con éxito", "success");
      lanzarConfeti();
      localStorage.removeItem("carrito");
      modal.classList.add("hidden");

      // Refrescar lista de compras automáticamente
      await cargarCompras();

      // Cambiar a pestaña compras
      const url = new URL(window.location.href);
      url.searchParams.set("tab", "compras");
      window.history.replaceState({}, "", url);

    } catch (err) {
      console.error(err);
      showToast("Error al procesar la venta", "error");
    }
  });

  // ================== INICIAL ==================
  await cargarUsuario();
  await cargarCompras();
});
