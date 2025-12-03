document.addEventListener('DOMContentLoaded', () => {

    //  Función para lanzar confetis en toda la pantalla
    function lanzarConfeti() {
        const duration = 2 * 1000; 
        const animationEnd = Date.now() + duration;
        const defaults = {
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            zIndex: 9999,
            colors: ['#ff6600', '#00ffcc', '#33ff00dc']
        };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    }
    // Cargar barberos y servicios desde backend (para asegurar ids)
    cargarBarberos();
    cargarServicios();

    // Enviar formulario de cita
    const formCita = document.getElementById('form-cita');
    if (formCita) {
        formCita.addEventListener('submit', async (e) => {
            e.preventDefault();

            const usuario = JSON.parse(localStorage.getItem('usuario'));

            if (!usuario) {
                showToast('Debes iniciar sesión para agendar una cita.', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2200);
                return;
            }

            const fecha = document.getElementById('fecha-calendario').value;

            //  Bloquear los lunes
            if (fecha) {
                const diaSemana = new Date(fecha).getDay(); // 0 = domingo, 1 = lunes, ...
                if (diaSemana === 0) {
                    showToast('Los lunes no hay atención. Por favor elige otro día.', 'warning');
                    return; //  Salimos del submit, no se guarda nada
                }
            }

            const hora = document.getElementById('hora').value;
            const idBarbero = parseInt(document.getElementById('barbero').value);
            const servicioVal = document.getElementById('servicio').value;
            const precio = parseFloat(document.getElementById('precio-servicio').value || '0');
            const detalleExtra = document.getElementById('extra-detalle') ? document.getElementById('extra-detalle').value.trim() : '';

            if (!fecha) {
                showToast('Selecciona una fecha', 'error');
                return;
            }
            if (!hora) {
                showToast('Selecciona un horario', 'error');
                return;
            }
            if (!idBarbero) {
                showToast('Selecciona un barbero', 'error');
                return;
            }
            if (!servicioVal) {
                showToast('Selecciona un servicio', 'error');
                return;
            }

            //  Validar que si el servicio es "Extra", el detalle no esté vacío
            const detalleExtraEl = document.getElementById('extra-detalle');
            if (parseInt(servicioVal) === 3 && !detalleExtraEl.value.trim()) {
                showToast('Por favor describe los detalles del servicio extra.', 'warning');
                detalleExtraEl.focus();
                return;
            }

            const idServicio = parseInt(servicioVal);

            const citaPayload = {
                idUsuario: usuario.idUsuario,
                idBarbero: idBarbero,
                idServicio: idServicio,
                fecha: fecha,
                horaInicio: hora,
                precio: precio
            };

            if (idServicio === 3 && detalleExtra) {
                citaPayload.detalleExtra = detalleExtra;
            }

            console.log('Datos que se enviarán:', citaPayload);

            try {
                const res = await fetch('https://app-barberia-production.up.railway.app/api/citas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(citaPayload)
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    showToast(errorText || 'Error al crear la cita', 'error');
                    return;
                }

                const data = await res.json();
                showToast('Cita agendada correctamente', 'success');

                // Confetis de éxito
                lanzarConfeti();

                setTimeout(() => {
                    window.location.href = 'usuario.html';
                }, 3000);

            } catch (err) {
                console.error(err);
                showToast('Error de conexión al servidor', 'error');
            }
        });
    }

    // Helper: cargar barberos
    async function cargarBarberos() {
        try {
            const res = await fetch('https://app-barberia-production.up.railway.app/api/barberos');
            if (!res.ok) return;
            const barberos = await res.json();

            const barberoInput = document.getElementById('barbero');
            if (barberoInput && !barberoInput.value && barberos.length > 0) { }

            const cont = document.getElementById('barberos-lista');
            if (cont) {
                cont.innerHTML = '';
                barberos.forEach(b => {
                    const div = document.createElement('div');
                    div.className = 'barbero-card';
                    div.setAttribute('data-id', b.idBarbero);
                    div.setAttribute('data-nombre', b.nombre || '');
                    div.innerHTML = `<img src="${b.foto || 'img/barberos/default.png'}" alt="${b.nombre || ''}"><p>${b.nombre || ''}</p>`;
                    cont.appendChild(div);
                });
                if (typeof initBarberSelection === 'function') initBarberSelection();
            }
        } catch (err) {
            console.error('No se pudieron cargar barberos', err);
        }
    }

    // Helper: cargar servicios
    async function cargarServicios() {
        try {
            const res = await fetch('https://app-barberia-production.up.railway.app/api/servicios');
            if (!res.ok) {
                console.error('Error al obtener servicios:', res.status);
                return;
            }

            const servicios = await res.json();
            const botones = document.querySelectorAll('.servicio-btn');

            if (botones && botones.length > 0) {
                botones.forEach(btn => {
                    const nombreElemento = btn.querySelector('.servicio-nombre');
                    const nombre = nombreElemento ? nombreElemento.textContent.trim() : null;

                    if (nombre) {
                        const s = servicios.find(x => x.nombreServicio.toLowerCase() === nombre.toLowerCase());
                        if (s) {
                            btn.setAttribute('data-servicio', s.idServicio);
                            btn.setAttribute('data-precio', s.precio);
                            btn.querySelector('.servicio-precio').textContent = `S/ ${s.precio.toFixed(2)}`;
                        } else {
                            console.warn(`Servicio "${nombre}" no encontrado en la BD`);
                        }
                    }
                });

                if (typeof initServiceButtons === 'function') {
                    initServiceButtons();
                }
            }
        } catch (err) {
            console.error('No se pudieron cargar los servicios:', err);
        }
    }
});
