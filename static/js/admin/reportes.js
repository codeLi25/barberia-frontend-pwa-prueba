const ctx = document.getElementById("graficoPrincipal").getContext("2d");
let chart;

// ============================
// Renderizar gráfico
// ============================
async function renderGrafico(tipo) {
    try {
        const res = await fetch(`https://app-barberia-production.up.railway.app/api/reportes?tipo=${tipo}`);

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Error en backend:", errorText);
            alert("Error: " + errorText);
            return;
        }

        const reporte = await res.json();


        // Título del gráfico
        document.getElementById("tituloGrafico").innerText =
            document.querySelector(`#tipoReporte option[value="${tipo}"]`).textContent;

        // Labels enviados desde el backend
        let labels = reporte.labels;

        // Destruir gráfico anterior
        if (chart) chart.destroy();

        // Tipo de gráfico
        let tipoGrafico = "bar";
        if (["rendimientoMensual", "citasPorMes", "citasPorBarbero"].includes(tipo)) {
            tipoGrafico = "line";
        }

        // ============================
        // Crear gráfico
        // ============================
        chart = new Chart(ctx, {
            type: tipoGrafico,
            data: {
                labels: labels,
                datasets: [{
                    label: "Cantidad",
                    data: reporte.data,
                    backgroundColor: "#ff9a00",
                    borderColor: "#ff9a00",
                    borderWidth: 2,
                    fill: tipoGrafico === "line"
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { ticks: { color: "#fff" } },
                    y: { ticks: { color: "#fff" } }
                }
            }
        });

        actualizarResumen(tipo, reporte);

    } catch (err) {
        console.error("Error al obtener reporte:", err);
    }
}

function actualizarResumen(tipo, reporte) {
    const contenedor = document.getElementById("resumenDinamico");
    contenedor.innerHTML = ""; 

    if (tipo === "rendimientoMensual") {
        contenedor.innerHTML = `
            <div class="resumen-item">
                <h4>Servicio más usado</h4>
                <p>${reporte.servicioMasUsado || "—"}</p>
            </div>
            <div class="resumen-item">
                <h4>Barbero con más citas</h4>
                <p>${reporte.barberoTop || "—"}</p>
            </div>
            <div class="resumen-item">
                <h4>Producto más vendido</h4>
                <p>${reporte.productoMasVendido || "—"}</p>
            </div>
        `;
    } else if (tipo === "servicio") {
        contenedor.innerHTML = `
            <div class="resumen-item">
                <h4>Servicios Atendidos</h4>
                <p>${reporte.total} citas</p>
            </div>
            <div class="resumen-item">
                <h4>Servicio más solicitado</h4>
                <p>${reporte.labels[0] ? `${reporte.labels[0]} (${reporte.data[0]})` : "—"}</p>
            </div>
        `;
    } else if (tipo === "producto") {
        contenedor.innerHTML = `
            <div class="resumen-item">
                <h4>Producto más vendido</h4>
                <p>${reporte.labels[0] ? `${reporte.labels[0]} (${reporte.data[0]} unidades)` : "—"}</p>
            </div>
        `;
    } else if (tipo === "ventasPorMes") {
        contenedor.innerHTML = `
            <div class="resumen-item">
                <h4>Total Ventas</h4>
                <p>S/ ${reporte.total}</p>
            </div>
            <div class="resumen-item">
                <h4>Ingresos</h4>
                <p>S/ ${reporte.ingresos}</p>
            </div>
        `;
    } else if (tipo === "citasPorBarbero") {
        contenedor.innerHTML = `
            <div class="resumen-item">
                <h4>Total Citas</h4>
                <p>${reporte.servicios} citas atendidas</p>
            </div>
        `;
    } else if (tipo === "citasPorMes") {
        contenedor.innerHTML = `
            <div class="resumen-item">
                <h4>Total Citas</h4>
                <p>${reporte.total} citas</p>
            </div>
        `;
    }
}


document.getElementById("actualizarReporte").addEventListener("click", () => {
    const tipo = document.getElementById("tipoReporte").value;
    renderGrafico(tipo);
});


renderGrafico("producto");
