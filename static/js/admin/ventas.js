const API_VENTAS = "https://app-barberia-production.up.railway.app/api/ventas";
let ventasGlobal = [];

document.addEventListener("DOMContentLoaded", () => {

  // ===== Toast global =====
  function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.4s forwards';
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }

  function fechaLegible(timestamp) {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  }

  // ==============================
  // CARGAR TODAS LAS VENTAS
  // ==============================
  async function cargarVentas() {
    try {
      const res = await fetch(API_VENTAS);
      if (!res.ok) throw new Error("Error al obtener ventas");

      ventasGlobal = await res.json();  // ✔ Guardamos todas al inicio
      renderVentas(ventasGlobal);

    } catch (err) {
      console.error(err);
      showToast("Error cargando ventas", "error");
    }
  }

  // ==============================
  // FUNCION PARA RENDERIZAR TABLA
  // ==============================
  function renderVentas(lista) {
    const tbody = document.getElementById("ventas-body");
    tbody.innerHTML = "";

    lista.forEach(v => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
      <td>${v.idVenta}</td>
      <td>${v.nombreCliente || ''}</td>
      <td>S/ ${Number(v.total).toFixed(2)}</td>
      <td>${fechaLegible(v.fechaVenta)}</td>
      <td class="estado-${v.estado.toLowerCase()}">${v.estado}</td>
      <td class="acciones">

        <!-- BOTÓN VER (OJO AMARILLO) -->
        <button class="detalle-btn btn-ver" data-id="${v.idVenta}" title="Ver detalle">
          <i class="fa-solid fa-eye"></i>
        </button>

        <!-- BOLETA (SOLO SI ESTÁ FINALIZADA) -->
        ${v.estado === "FINALIZADA" ? `
          <button class="boleta-btn btn-boleta" data-id="${v.idVenta}" title="Boleta">
            <i class="fa-solid fa-file-invoice"></i>
          </button>
        ` : ""}

        ${v.estado === "PENDIENTE" ? `
          <!-- FINALIZAR (VERDE) -->
          <button class="finalizar-btn btn-finalizar" data-id="${v.idVenta}" title="Finalizar">
            <i class="fa-solid fa-check"></i>
          </button>

          <!-- CANCELAR (ROJO) -->
          <button class="cancelar-btn btn-cancelar" data-id="${v.idVenta}" title="Cancelar">
            <i class="fa-solid fa-xmark"></i>
          </button>
        ` : ""}
      </td>
    `;

      tbody.appendChild(tr);
    });

    activarBotones();
  }

  // ========================================
  // BUSCADOR POR DNI (nuevo)
  // ========================================
  const inputBuscarDNI = document.getElementById("buscador-dni");


  if (inputBuscarDNI) {
    inputBuscarDNI.addEventListener("input", () => {
      const texto = inputBuscarDNI.value.trim();

      if (texto === "") {
        renderVentas(ventasGlobal);
        return;
      }

      const filtradas = ventasGlobal.filter(v =>
        String(v.dniCliente || "").includes(texto)
      );

      renderVentas(filtradas);
    });
  }

  // ========================================
  // FILTROS POR ESTADO
  // ========================================

  document.getElementById("btn-pendientes").addEventListener("click", () => {
    const pendientes = ventasGlobal.filter(v => v.estado === "PENDIENTE");
    renderVentas(pendientes);
  });

  document.getElementById("btn-finalizadas").addEventListener("click", () => {
    const finalizadas = ventasGlobal.filter(v => v.estado === "FINALIZADA");
    renderVentas(finalizadas);
  });

  document.getElementById("btn-todas").addEventListener("click", () => {
    renderVentas(ventasGlobal);
  });

  // ========================================
  // ACTIVAR BOTONES
  // ========================================
  function activarBotones() {

    document.querySelectorAll(".detalle-btn").forEach(btn => {
      btn.onclick = () => abrirModalDetalle(btn.dataset.id);
    });

    document.querySelectorAll(".boleta-btn").forEach(btn => {
      btn.onclick = () => generarBoletaPopup(btn.dataset.id);
    });

    document.querySelectorAll(".finalizar-btn").forEach(btn => {
      btn.onclick = () => cambiarEstado(btn.dataset.id, "FINALIZADA");
    });

    document.querySelectorAll(".cancelar-btn").forEach(btn => {
      btn.onclick = () => cambiarEstado(btn.dataset.id, "CANCELADA");
    });
  }

  // ==============================
  // CAMBIAR ESTADO (PUT)
  // ==============================
  async function cambiarEstado(idVenta, nuevoEstado) {
    if (!confirm(`¿Seguro de cambiar estado a ${nuevoEstado}?`)) return;

    try {
      const res = await fetch(`${API_VENTAS}/${idVenta}/estado?estado=${nuevoEstado}`, {
        method: "PUT"
      });
      if (!res.ok) throw new Error();

      showToast(`Venta ${idVenta} actualizada`, "success");
      cargarVentas();
    } catch {
      showToast("Error actualizando estado", "error");
    }
  }

  // ==============================
  // MODAL DETALLE MEJORADO
  // ==============================
  const modal = document.getElementById("modal-detalle");
  const detalleDiv = document.getElementById("detalle-venta");
  const closeModal = document.querySelector(".close");
  const cerrarBtn = document.getElementById("cerrar-modal-btn");

  // Cerrar modal
  function cerrarModal() {
    modal.style.display = "none";
  }

  closeModal.onclick = cerrarModal;
  cerrarBtn.onclick = cerrarModal;

  window.onclick = e => {
    if (e.target === modal) cerrarModal();
  };

  async function abrirModalDetalle(idVenta) {
    try {
      const ventaRes = await fetch(`${API_VENTAS}/${idVenta}`);
      const venta = await ventaRes.json();

      const detRes = await fetch(`${API_VENTAS}/${idVenta}/detalles`);
      const detalles = await detRes.json();

      let html = `
      <p><strong>ID Venta:</strong> ${venta.idVenta}</p>
      <p><strong>Cliente:</strong> ${venta.nombreCliente || '—'}</p>
      <p><strong>DNI:</strong> ${venta.dniCliente || '—'}</p>
      <p><strong>Teléfono:</strong> ${venta.telefonoCliente || '—'}</p>
      <p><strong>Correo:</strong> ${venta.correoCliente || '—'}</p>
      <p><strong>Método pago:</strong> ${venta.metodoPago}</p>
      <p><strong>Estado:</strong> ${venta.estado}</p>
      <p><strong>Fecha:</strong> ${fechaLegible(venta.fechaVenta)}</p>

      <h4 style="margin-top:15px; color:#ff9a00;">Productos</h4>
      <hr>
    `;

      if (detalles.length) {
        html += `
        <table class="tabla-detalle">
          <thead>
            <tr>
              <th>#</th>
              <th>Producto</th>
              <th>Cant.</th>
              <th>Precio</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
      `;

        detalles.forEach((d, i) => {
          html += `
          <tr>
            <td>${i + 1}</td>
            <td>${d.producto.nombre}</td>
            <td>${d.cantidad}</td>
            <td>S/ ${Number(d.precioUnitario).toFixed(2)}</td>
            <td>S/ ${Number(d.subtotal).toFixed(2)}</td>
          </tr>
        `;
        });

        html += `</tbody></table>`;
      } else {
        html += `<p>No hay detalles registrados.</p>`;
      }

      html += `
      <hr>
      <p style="font-size:1.1rem; margin-top:10px;">
        <strong>Total:</strong> S/ ${Number(venta.total).toFixed(2)}
      </p>
    `;

      detalleDiv.innerHTML = html;
      modal.style.display = "block";

    } catch (err) {
      console.error(err);
      showToast("Error cargando detalle", "error");
    }
  }


  // ===================================================
  // BOLETA POPUP - CON LOGO EN BASE64 PARA PDF
  // ===================================================
  async function generarBoletaPopup(idVenta) {
    try {
      // Obtener datos
      const res = await fetch(`${API_VENTAS}/${idVenta}`);
      const venta = await res.json();

      const detallesRes = await fetch(`${API_VENTAS}/${idVenta}/detalles`);
      const detalles = await detallesRes.json();

      // Convertir logo a Base64
      const logoBase64 = await convertirImagenABase64('/img/logo.jpg');

      const ventana = window.open("", "_blank", "width=800,height=900");

      ventana.document.write(`
    <html>
    <head>
      <title>Boleta #${venta.idVenta}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 25px;
          background: #f8f9fa;
          color: #333;
        }
        .boleta-container {
          max-width: 700px;
          margin: auto;
          background: white;
          padding: 25px 30px;
          border: 1px solid #ddd;
          border-radius: 10px;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 15px;
          border-bottom: 2px solid #ff9a00;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .header img {
          width: 70px;
          height: 70px;
          border-radius: 10px;
          object-fit: cover;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          color: #ff6a00;
          font-weight: bold;
        }
        h2.titulo {
          text-align: center;
          margin: 10px 0 20px;
          font-size: 22px;
          color: #444;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 15px;
        }
        th {
          background: #ff9a00;
          padding: 10px 5px;
          border-bottom: 2px solid #000;
        }
        td {
          padding: 8px 5px;
          border-bottom: 1px solid #ddd;
        }
        td.right { text-align: right; }
        .total-section {
          text-align: right;
          margin-top: 20px;
          font-size: 20px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 25px;
          font-size: 13px;
          color: #666;
        }
      </style>
    </head>

    <body>
      <div class="boleta-container">

        <!-- HEADER -->
        <div class="header">
          <img src="${logoBase64}" alt="El Calvo">
          <h1>El Calvo</h1>
        </div>

        <h2 class="titulo">BOLETA DE VENTA</h2>

        <div class="info">
          <p><strong>N° Boleta:</strong> ${venta.idVenta}</p>
          <p><strong>Cliente:</strong> ${venta.nombreCliente || "—"}</p>
          <p><strong>DNI:</strong> ${venta.dniCliente || "—"}</p>
          <p><strong>Fecha:</strong> ${fechaLegible(venta.fechaVenta)}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Producto</th>
              <th>Cant</th>
              <th>P.Unit</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${detalles.map((d, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${d.producto.nombre}</td>
                <td>${d.cantidad}</td>
                <td class="right">S/ ${Number(d.precioUnitario).toFixed(2)}</td>
                <td class="right">S/ ${Number(d.subtotal).toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="total-section">
          TOTAL: S/ ${Number(venta.total).toFixed(2)}
        </div>

        <div class="footer">
          ¡Gracias por su compra!<br>
          © ${new Date().getFullYear()} El Calvo
        </div>

      </div>

      <script>
        window.print();
      </script>
    </body>
    </html>
    `);

      ventana.document.close();

    } catch (err) {
      console.error(err);
      showToast("Error generando boleta", "error");
    }
  }

  // --- FUNCIÓN PARA CONVERTIR IMAGEN A BASE64 ---
  function convertirImagenABase64(url) {
    return fetch(url)
      .then(res => res.blob())
      .then(blob => new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      }));
  }

  // Inicializar carga
  cargarVentas();
});
