document.addEventListener('DOMContentLoaded', () => {
    const servicioButtons = document.querySelectorAll('.servicio-btn');
    const servicioInput = document.getElementById('servicio');
    const precioServicioInput = document.getElementById('precio-servicio');
    const extraDetalleGroup = document.getElementById('extra-detalle-group');

    servicioButtons.forEach(button => {
        button.addEventListener('click', () => {
            const servicio = button.dataset.servicio;
            const precio = button.dataset.precio;

            servicioInput.value = servicio;
            precioServicioInput.value = precio;

            if (servicio === 'extra' || servicio === '3') {
                extraDetalleGroup.classList.remove('oculto');
            } else {
                extraDetalleGroup.classList.add('oculto');
            }

            servicioButtons.forEach(btn => btn.classList.remove('active', 'selected'));
            button.classList.add('active', 'selected');
        });
    });
});

