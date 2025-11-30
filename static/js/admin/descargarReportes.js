document.addEventListener("DOMContentLoaded", () => {

    const btnDescargar = document.getElementById("descargarPDF");
    if (!btnDescargar) return;

    btnDescargar.addEventListener("click", async () => {

        const pdf = new window.jspdf.jsPDF('p', 'pt', 'a4');
        const margenX = 40;
        let yPos = 40;
        const pageWidth = pdf.internal.pageSize.getWidth();

        // ======================
        // Header
        // ======================
        pdf.setFillColor(40, 40, 40); // gris oscuro
        pdf.rect(0, 0, pageWidth, 60, 'F');

        pdf.setFontSize(20);
        pdf.setTextColor(255, 165, 0); // naranja
        const tituloGrafico = document.getElementById("tituloGrafico")?.innerText || "Reporte";
        pdf.text(`${tituloGrafico} - El Calvo`, margenX, 35);

        pdf.setFontSize(11);
        pdf.setTextColor(200);
        const fecha = new Date().toLocaleString();
        pdf.text(`Generado: ${fecha}`, pageWidth - 160, 35); // ligeramente a la izquierda

        yPos = 80;

        // ======================
        // Gráfico con fondo negro
        // ======================
        const canvas = document.getElementById("graficoPrincipal");
        if (canvas) {
            // Crear un fondo negro detrás del gráfico
            pdf.setFillColor(0, 0, 0);
            pdf.roundedRect(margenX - 5, yPos - 5, 510, 260, 5, 5, 'F');

            const imgData = canvas.toDataURL("image/png");
            pdf.addImage(imgData, 'PNG', margenX, yPos, 500, 250);
            yPos += 270;
        }

        // ======================
        // Resumen dinámico en "tarjetas"
        // ======================
        const resumen = document.getElementById("resumenDinamico");
        if (resumen) {
            resumen.querySelectorAll(".resumen-item").forEach(item => {
                const titulo = item.querySelector("h4")?.innerText || "";
                const contenido = item.querySelector("p")?.innerText || "";

                // Tarjeta gris claro
                pdf.setFillColor(247, 247, 247);
                pdf.roundedRect(margenX, yPos, 500, 30, 5, 5, 'F');

                // Título en naranja
                pdf.setFontSize(14);
                pdf.setTextColor(255, 165, 0);
                pdf.text(titulo, margenX + 10, yPos + 20);

                // Contenido en negro
                pdf.setFontSize(14);
                pdf.setTextColor(0);
                pdf.text(contenido, margenX + 250, yPos + 20);

                yPos += 40;
            });
        }

        // ======================
        // Footer
        // ======================
        pdf.setFontSize(10);
        pdf.setTextColor(150);
        pdf.text("Barber Shop El Calvo - Sistema de Reportes", margenX, pdf.internal.pageSize.getHeight() - 30);
        pdf.text(`Página 1`, pageWidth - 80, pdf.internal.pageSize.getHeight() - 30);

        // ======================
        // Guardar PDF
        // ======================
        pdf.save(`${tituloGrafico} - El Calvo.pdf`);
    });

});
