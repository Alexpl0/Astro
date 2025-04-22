document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('conference-room');
  if (!form) return;
  
  // Inicializar datepickers con configuración en español
  const fechaEntradaDateEl = document.getElementById('fechaEntradaDate');
  const fechaSalidaDateEl = document.getElementById('fechaSalidaDate');
  
  // Establecer la fecha mínima como hoy
  const today = new Date().toISOString().split('T')[0];
  fechaEntradaDateEl.min = today;
  fechaSalidaDateEl.min = today;
  
  // Generar opciones de tiempo en intervalos de 15 minutos
  function generateTimeOptions(selectElement) {
    // Agregar la opción predeterminada
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "Seleccione hora";
    selectElement.appendChild(defaultOption);
    
    // Generar opciones de 08:00 a 18:00 en intervalos de 15 minutos
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        // No incluir 18:15, 18:30, 18:45
        if (hour === 18 && minute > 0) continue;
        
        const hourStr = hour.toString().padStart(2, '0');
        const minuteStr = minute.toString().padStart(2, '0');
        const timeValue = `${hourStr}:${minuteStr}`;
        
        const option = document.createElement('option');
        option.value = timeValue;
        option.textContent = timeValue;
        selectElement.appendChild(option);
      }
    }
  }
  
  // Generar opciones para ambos selectores
  generateTimeOptions(document.getElementById('fechaEntradaTime'));
  generateTimeOptions(document.getElementById('fechaSalidaTime'));
  
  // Cuando cambia la fecha de entrada, actualizar la fecha mínima de salida
  fechaEntradaDateEl.addEventListener('change', function() {
    fechaSalidaDateEl.min = this.value;
    if (fechaSalidaDateEl.value && fechaSalidaDateEl.value < this.value) {
      fechaSalidaDateEl.value = this.value;
    }
  });

  // Cuando se selecciona fecha y hora de entrada, actualizar las opciones disponibles para la salida
  function updateSalidaOptions() {
    const fechaEntradaDate = fechaEntradaDateEl.value;
    const fechaEntradaTime = document.getElementById('fechaEntradaTime').value;
    const fechaSalidaDate = fechaSalidaDateEl.value;
    const fechaSalidaTimeSelect = document.getElementById('fechaSalidaTime');
    
    // Si las fechas son iguales, deshabilitar horas anteriores a la hora de entrada
    if (fechaEntradaDate && fechaEntradaTime && fechaSalidaDate && fechaEntradaDate === fechaSalidaDate) {
      const options = fechaSalidaTimeSelect.options;
      
      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        option.disabled = option.value !== "" && option.value <= fechaEntradaTime;
      }
      
      // Si la opción seleccionada está ahora deshabilitada, seleccionar la siguiente disponible
      if (fechaSalidaTimeSelect.selectedIndex > 0 && fechaSalidaTimeSelect.options[fechaSalidaTimeSelect.selectedIndex].disabled) {
        // Buscar la primera opción no deshabilitada
        for (let i = 0; i < options.length; i++) {
          if (!options[i].disabled) {
            fechaSalidaTimeSelect.selectedIndex = i;
            break;
          }
        }
      }
    } else {
      // Si las fechas son diferentes, habilitar todas las opciones
      const options = fechaSalidaTimeSelect.options;
      for (let i = 0; i < options.length; i++) {
        options[i].disabled = false;
      }
    }
  }
  
  // Escuchar cambios en fecha/hora de entrada para actualizar opciones de salida
  fechaEntradaDateEl.addEventListener('change', updateSalidaOptions);
  document.getElementById('fechaEntradaTime').addEventListener('change', updateSalidaOptions);
  fechaSalidaDateEl.addEventListener('change', updateSalidaOptions);

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Obtener valores de los campos
    const nombreReservador = document.getElementById('nombreReservador').value;
    const motivo = document.getElementById('motivo').value;
    const cantidadPersonas = parseInt(document.getElementById('cantidadPersonas').value);
    const fecha = document.getElementById('fecha').value;
    
    // Combinar fecha y hora para entrada y salida
    const fechaEntradaDate = fechaEntradaDateEl.value;
    const fechaEntradaTime = document.getElementById('fechaEntradaTime').value;
    const fechaSalidaDate = fechaSalidaDateEl.value;
    const fechaSalidaTime = document.getElementById('fechaSalidaTime').value;
    
    // Formato ISO para fechas
    const fechaEntrada = `${fechaEntradaDate}T${fechaEntradaTime}:00`;
    const fechaSalida = `${fechaSalidaDate}T${fechaSalidaTime}:00`;
    
    // Actualizar campos ocultos (por si se necesitan para envío de formularios)
    document.getElementById('fechaEntrada').value = fechaEntrada;
    document.getElementById('fechaSalida').value = fechaSalida;
    
    const salaId = document.getElementById('sala').value;
    const now = new Date();
    const fechaReservacion = now.toISOString().slice(0, 19);

    // Validar que la fecha de salida sea posterior a la de entrada
    const entradaDate = new Date(fechaEntrada);
    const salidaDate = new Date(fechaSalida);
    
    if (salidaDate <= entradaDate) {
      Swal.fire({
        title: 'Error',
        text: 'La fecha y hora de salida debe ser posterior a la de entrada',
        icon: 'error'
      });
      return;
    }

    const reservationData = {
      fechaEntrada: fechaEntrada,
      fechaSalida: fechaSalida,
      motivo: motivo,
      cantidadPersonas: cantidadPersonas,
      fechaReservacion: fechaReservacion,
      nombreReservador: nombreReservador,
      sala: {
        id: parseInt(salaId)
      }
    };

    

    console.log(JSON.stringify(reservationData, null, 2));

    // Aquí puedes enviar la reservación al servidor usando fetch
  try {
    const response = await fetch('http://localhost:8080/reservaciones', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(reservationData)
    });

    if (!response.ok) {
      throw new Error('Error en la reservación');
    }

    const responseData = await response.json();
    console.log(responseData);
  } catch (error) {
    console.error('Error:', error);
    Swal.fire({
      title: 'Error',
      text: 'Hubo un problema al realizar la reservación',
      icon: 'error'
    });
    return;
  }

    // Mostrar mensaje de éxito con SweetAlert
    Swal.fire({
      title: '¡Reservación exitosa!',
      text: 'La sala ha sido reservada correctamente',
      icon: 'success',
      confirmButtonText: 'OK'
    });
  });
});

window.buttonHome = function() {
  window.location.href = '/';
};