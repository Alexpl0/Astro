// Definir qrcode globalmente
var qrcode = qrcode || {};
var respuesta = null; // Almacena la respuesta del escaneo QR
var inventarioData = null; // Almacena los datos del inventario

// Elementos de cámara y canvas
const video = document.createElement("video");
const canvasElement = document.getElementById("qr-canvas");
const canvas = canvasElement.getContext("2d");
const btnScanQR = document.getElementById("btn-scan-qr");
let scanning = false;

// Evento para redirigir al home al hacer clic en el botón de Regresar
document.addEventListener('DOMContentLoaded', function () {
  const buttonHomeEl = document.getElementById('buttonHome');
  if (buttonHomeEl) {
    buttonHomeEl.addEventListener('click', function () {
      window.location.href = '/';
      console.log("Redirigiendo a la página de inicio...");
    });
  }

  // Botón para encender cámara
  const camOnButton = document.getElementById('camOn');
  if (camOnButton) {
    camOnButton.addEventListener('click', encenderCamara);
  }

  // Botón para apagar cámara
  const camOffButton = document.getElementById('camOff');
  if (camOffButton) {
    camOffButton.addEventListener('click', cerrarCamara);
  }

  // Guardar texto de respuesta en localStorage
  const responseText = "Texto de respuesta del código QR";
  localStorage.setItem('responseText', responseText);
});

// Encender cámara y comenzar escaneo
const encenderCamara = () => {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then(function (stream) {
      scanning = true;
      btnScanQR.hidden = true;
      canvasElement.hidden = false;
      video.setAttribute("playsinline", true);
      video.srcObject = stream;
      video.play();
      tick();
      scan();
    });
};

// Dibuja el video en el canvas en cada frame
function tick() {
  canvasElement.height = video.videoHeight;
  canvasElement.width = video.videoWidth;
  canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
  scanning && requestAnimationFrame(tick);
}

// Escanea el código QR del canvas
function scan() {
  try {
    const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      cerrarCamara();
      qrcode.callback(code.data);
      console.log("Código QR detectado SCAN:", code.data);
      respuesta = code.data;
    } else {
      setTimeout(scan, 90);
    }
  } catch (e) {
    console.error("QR scanning error:", e);
    setTimeout(scan, 30);
  }
}

// Apagar la cámara
const cerrarCamara = () => {
  video.srcObject.getTracks().forEach((track) => {
    track.stop();
  });
  canvasElement.hidden = true;
  btnScanQR.hidden = false;
};

// Callback al detectar QR
qrcode.callback = (respuesta) => {
  if (respuesta) {
    console.log("Código QR detectado callback:", respuesta);
    cerrarCamara();
    inventarioget(respuesta);
  }
};

//====================================================================================
// Obtener inventario por ID extraído del QR (El ID es del Producto, no del inventario)
const inventarioget = async (respuesta) => {
  // Ocultamos el menu de escaneo QR
  const qrElement = document.getElementById('qr');
  if (qrElement) qrElement.style.display = 'none';


  try {
    let datos;
    try {
      datos = JSON.parse(respuesta);
    } catch (e) {
      console.error("Error al parsear JSON del QR:", e);
      throw new Error("Formato de QR inválido");
    }

    const idProducto = datos.id;
    if (!idProducto) {
      throw new Error("El QR no contiene un ID válido");
    }

    // Realiza el POST inicial para crear una nueva entrada sin campos
    const response = await fetch('http://localhost:8080/inventario', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error('Error al crear la entrada inicial');
    }
    const initialData = await response.json(); // Datos de la entrada inicial del Inventario creada
    const newId = initialData.id; // ID de la entrada inicial creada

    //====================================================================================
    // Realiza el GET para obtener los datos del producto
    const productoGet = await fetch(`http://localhost:8080/productos/${idProducto}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!productoGet.ok) {
      throw new Error('Error al obtener los datos del producto');
      console.log("Id de producto no encontrado:", idProducto);
      console.log("URL de producto:", `http://localhost:8080/productos/${idProducto}`);
    }
    const producto = await productoGet.json(); // Datos del producto obtenido
    //====================================================================================

    // Muestra el formulario de edición con el ID obtenido

    const formHtml = `
      <div class="contenedor">
        <div id="form" class="contenedor">
          <form action="" id="formulario" class="formulario">
            <h1>Informacion del Producto</h1>
            <label for="uniqueid">Identificador de Inventario:</label>
            <p id="uniqueid">${newId}</p><br>

            <label for="id">ID del Producto:</label>
            <p id="id">${idProducto}</p><br>

            <label for="nombre">Nombre del Producto:</label>
            <p id="nombre">${producto.nombre}</p><br>

            <label for="marca">Marca:</label>
            <p id="marca">${producto.marca}</p><br>

            <label for="modelo">Modelo:</label>
            <p id="modelo">${producto.modelo}</p><br>

            <label for="estado">Estado:</label>
            <p id="estado">${producto.estado}</p><br>

            <label for="descripcion">Descripción:</label>
            <p id="descripcion">${producto.descripcion}</p><br>

            <label for="precio">Precio:</label>
            <p id="precio">${producto.precio}</p><br>

            <label for="fecha">Fecha de Inventario:</label>
            <p id="fecha">${producto.fecha}</p><br>

            <label for="categoria">Categoría:</label>
            <p id="categoria">${producto.categoria.nombre}</p><br>

            <label for="ubicacion">Ubicación:</label>
            <p id="ubicacion">${producto.ubicacion.nombre}</p><br>

            <h1>Actualizar Inventario</h1>

            <label for="estado_fisico">Estado Fisico:</label>
            <select id="estado_fisico" name="estado_fisico" required>
              <option value="" disabled selected>Seleccione un estado</option>
              <option value="Nuevo">Nuevo</option>
              <option value="Usado - Buen estado">Usado - Buen estado</option>
              <option value="Usado - Con detalles">Usado - Con detalles</option>
              <option value="Dañado">Dañado</option>
              <option value="Obsoleto">Obsoleto</option>
            </select><br><br>

            <label for="estado_operativo">Estado Operativo:</label>
            <select id="estado_operativo" name="estado_operativo" required>
              <option value="" disabled selected>Seleccione un estado</option>
              <option value="Funcional">Funcional</option>
              <option value="Funciona parcialmente">Funciona parcialmente</option>
              <option value="En reparación">En reparación</option>
              <option value="No funcional">No funcional</option>
              <option value="Retirado de operación">Retirado de operación</option>
            </select><br><br>

            <label for="observaciones">Observaciones:</label>
            <small style="color: #888;">
              (Máximo 255 caracteres. Quedan <span id="contador-observaciones">255</span>)
            </small>
            <textarea
              id="observaciones"
              name="observaciones"
              rows="4"
              cols="50"
              maxlength="255"
              required
              placeholder="Agrega aquí observaciones relevantes sobre el estado, uso o detalles del producto... (máximo 255 caracteres)"
              oninput="document.getElementById('contador-observaciones').textContent = 255 - this.value.length;"
            ></textarea><br><br>

            <label for="fechaInventario">Fecha Entrada de Inventario:</label>
            <input type="text" id="fechaInventario" name="fechaInventario" readonly value="${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-')}" placeholder="Fecha actual"/><br><br>

            <button id="generate-button">
              Enviar Inventario
            </button>
          </form>
        </div>
      </div>
    `;
    $('#newInventario').html(formHtml);

    // Añadir event listener para el formulario de edición
    $('#generate-button').on('click', async function (e) {
      e.preventDefault(); // Evitar el envío del formulario por defecto

      // Obtener los valores de los campos del formulario
      const estado_fisico = document.getElementById('estado_fisico').value;
      const estado_operativo = document.getElementById('estado_operativo').value;
      const observaciones = document.getElementById('observaciones').value;

      // Asegurarse de obtener la fecha correcta con el formato adecuado para el backend
      const fechaInput = document.getElementById('fechaInventario');
      let fechaInventario;
      if (fechaInput && fechaInput.value) {
        fechaInventario = fechaInput.value; // Usar el valor del campo si existe
      } else {
        // Crear fecha de respaldo con el formato correcto si el campo no existe o está vacío
        fechaInventario = new Date().toLocaleString('es-MX', { 
          timeZone: 'America/Mexico_City', 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit'
        }).split('/').reverse().join('-');
      }

      // Crear el objeto con los datos a enviar
      const inventarioData = {
        id: newId,
        estado_fisico: estado_fisico,
        estado_operativo: estado_operativo,
        observaciones: observaciones,
        fecha: fechaInventario,
        producto: { id: idProducto },
      };

      console.log("Datos a enviar:", inventarioData);

      // Enviar los datos al servidor
      try {
        const response = await fetch(`http://localhost:8080/inventario/${newId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(inventarioData)
        });

        if (response.ok) {
          Swal.fire({
            title: '¡Éxito!',
            text: 'El inventario ha sido actualizado correctamente.',
            icon: 'success',
            confirmButtonText: '¡Entendido!'
          });
        } else {
          throw new Error('Error al actualizar el inventario');
        }
      } catch (error) {
        console.error("Error al actualizar el inventario:", error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar el inventario.',
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
      }
    });
  } catch (error) {
    console.error("Error al obtener el inventario:", error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudo leer el código QR o no se encontró el producto',
      icon: 'error',
      confirmButtonText: 'Entendido'
    });
  }
};

//====================================================================================

/* 
// Mostrar formulario con datos del inventario
function mostrarFormulario(inventarioData) {
  // Oculta el QR
  const qrElement = document.getElementById('qr');
  if (qrElement) qrElement.style.display = 'none';

  console.log("Inventario Data MOSTRARFORMULARIO:", inventarioData);

  // Actualiza campos del formulario
  document.getElementById('id').value = inventarioData.id;
  document.getElementById('nombre').value = inventarioData.nombre;
  document.getElementById('marca').value = inventarioData.marca;
  document.getElementById('modelo').value = inventarioData.modelo;
  document.getElementById('estado').value = inventarioData.estado;
  document.getElementById('descripcion').value = inventarioData.descripcion;
  document.getElementById('precio').value = inventarioData.precio;

  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  console.log("Formatted Date:", formattedDate);
  document.getElementById('fecha').value = formattedDate;

  document.getElementById('categoria').value = inventarioData.categoria.nombre;
  document.getElementById('ubicacion').value = inventarioData.ubicacion.nombre;

  // Muestra el formulario
  const container = document.getElementById('form-container');
  container.style.display = 'block';
  const qrform = document.getElementById('formularioQR');
  qrform.style.display = 'block';

  // Alerta de éxito
  Swal.fire({
    title: '¡Código QR leído!',
    text: 'El código QR ha sido leído con éxito.',
    icon: 'success',
    confirmButtonText: '¡Entendido!'
  });
}
*/