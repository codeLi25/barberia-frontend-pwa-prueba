document.addEventListener('DOMContentLoaded', function () {
    // Inicializar calendario
    initCalendar();

    // Inicializar horarios
    initTimeSlots();

    // Selección de barbero
    initBarberSelection();

    // Selección de servicio con botones
    initServiceButtons();
});

function initCalendar() {
    const calendarDays = document.getElementById('calendar-days');
    const monthYear = document.querySelector('.calendar-month-year');
    const prevBtn = document.querySelector('.prev-month');
    const nextBtn = document.querySelector('.next-month');
    const todayBtn = document.querySelector('.today-btn');
    const clearBtn = document.querySelector('.clear-btn');
    const fechaInput = document.getElementById('fecha-calendario');

    let currentDate = new Date();
    let selectedDate = null;

    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();

        // Actualizar encabezado
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        monthYear.textContent = `${monthNames[month]} ${year}`;

        // Obtener primer y último día del mes
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const firstDayIndex = (firstDay.getDay() + 6) % 7; 
        const daysInMonth = lastDay.getDate();

        // Limpiar calendario
        calendarDays.innerHTML = '';

        // Días del mes anterior
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDayIndex; i > 0; i--) {
            const day = document.createElement('div');
            day.className = 'calendar-day other-month';
            day.textContent = prevMonthLastDay - i + 1;
            calendarDays.appendChild(day);
        }

        // Días del mes actual
        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.className = 'calendar-day';
            day.textContent = i;

            // Verificar si es hoy
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                day.classList.add('today');
            }

            // Verificar si está seleccionado
            if (selectedDate && i === selectedDate.getDate() &&
                month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
                day.classList.add('selected');
            }

            day.addEventListener('click', () => selectDate(new Date(year, month, i)));
            calendarDays.appendChild(day);
        }

        // Días del siguiente mes
        const daysNeeded = 42 - (firstDayIndex + daysInMonth); 
        for (let i = 1; i <= daysNeeded; i++) {
            const day = document.createElement('div');
            day.className = 'calendar-day other-month';
            day.textContent = i;
            calendarDays.appendChild(day);
        }
    }

    function selectDate(date) {
        selectedDate = date;
        fechaInput.value = date.toISOString().split('T')[0];
        renderCalendar(currentDate);
    }

    function goToToday() {
        currentDate = new Date();
        selectedDate = new Date();
        fechaInput.value = selectedDate.toISOString().split('T')[0];
        renderCalendar(currentDate);
    }

    function clearSelection() {
        selectedDate = null;
        fechaInput.value = '';
        renderCalendar(currentDate);
    }

    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    todayBtn.addEventListener('click', goToToday);
    clearBtn.addEventListener('click', clearSelection);

    renderCalendar(currentDate);
}

function initTimeSlots() {
    const timeSlotsContainer = document.getElementById('time-slots');
    const horaInput = document.getElementById('hora');

    const timeSlots = [];
    for (let hour = 9; hour <= 19; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            timeSlots.push(timeString);
        }
    }

    // Renderizar horarios
    timeSlots.forEach(time => {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = time;
        timeSlot.addEventListener('click', () => {
            // Remover selección anterior
            document.querySelectorAll('.time-slot.selected').forEach(slot => {
                slot.classList.remove('selected');
            });

            // Seleccionar nuevo horario
            timeSlot.classList.add('selected');
            horaInput.value = time;
        });
        timeSlotsContainer.appendChild(timeSlot);
    });
}

function initBarberSelection() {
    const barberCards = document.querySelectorAll('.barbero-card');
    const barberoInput = document.getElementById('barbero');

    barberCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remover selección anterior
            barberCards.forEach(c => c.classList.remove('active'));

            // Seleccionar nuevo barbero
            card.classList.add('active');
            barberoInput.value = card.getAttribute('data-id');
        });
    });
}

function initServiceButtons() {
    const servicioBtns = document.querySelectorAll('.servicio-btn');
    const servicioInput = document.getElementById('servicio');
    const precioServicioInput = document.getElementById('precio-servicio');
    const extraDetalleGroup = document.getElementById('extra-detalle-group');
    const precioExtraInput = document.getElementById('precio-extra');
    const detalleExtraInput = document.getElementById('extra-detalle');

    servicioBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Remover selección anterior
            servicioBtns.forEach(b => b.classList.remove('selected'));

            // Seleccionar nuevo servicio
            this.classList.add('selected');

            const servicio = this.getAttribute('data-servicio');
            const precio = this.getAttribute('data-precio');

            servicioInput.value = servicio;
            precioServicioInput.value = precio;
            
            // Mostrar/ocultar detalles extra
            if (parseInt(servicio) === 3) {
                extraDetalleGroup.classList.remove('oculto');
                precioExtraInput.value = '';
                precioServicioInput.value = '0';
            } else {
                extraDetalleGroup.classList.add('oculto');
                precioServicioInput.value = precio;
                precioExtraInput.value = '';
                if (detalleExtraInput) detalleExtraInput.value = '';
            }
        });
    });

    // Actualizar precio cuando se modifica el precio extra
    precioExtraInput.addEventListener('input', function () {
        if (parseInt(servicioInput.value) === 3) {
            precioServicioInput.value = this.value || '0';
        }
    });
}
