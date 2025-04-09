// Define qrcode globally
var qrcode = qrcode || {};
var respuesta = null; // Variable para almacenar la respuesta del escaneo QR
var inventarioData = null; // Arreglo para almacenar los datos del inventario



// Crea un elemento de video para la transmisión de la cámara
const video = document.createElement("video");

// Obtiene el elemento canvas del DOM donde se dibujará el video del QR
const canvasElement = document.getElementById("qr-canvas");
// Obtiene el contexto 2D del canvas para dibujar sobre él
const canvas = canvasElement.getContext("2d");

// Obtiene el botón del DOM que activa el escaneo QR
const btnScanQR = document.getElementById("btn-scan-qr");

// Variable de estado para controlar si el escaneo está activo o no
let scanning = false;

// Función para encender la cámara y comenzar el escaneo
const encenderCamara = () => {
  // Utiliza la API de getUserMedia para acceder a la cámara del dispositivo
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } }) // Solicita la cámara trasera
    .then(function (stream) {
      // Si la cámara se enciende correctamente:
      scanning = true; // Activa el estado de escaneo
      btnScanQR.hidden = true; // Oculta el botón de escaneo
      canvasElement.hidden = false; // Muestra el canvas
      video.setAttribute("playsinline", true); // Evita que iOS Safari muestre el video en pantalla completa
      video.srcObject = stream; // Asigna el stream de video al elemento video
      video.play(); // Comienza la reproducción del video
      tick(); // Inicia el bucle de actualización del canvas
      scan(); // Inicia el proceso de escaneo de QR
    });
};

// Vincula la función encenderCamara al botón con ID 'camOn'
const camOnButton = document.getElementById('camOn');
if (camOnButton) {
  camOnButton.addEventListener('click', encenderCamara);
}

// Funciones para levantar las funciones de encendido de la camara
// Función que se ejecuta en cada fotograma para dibujar el video en el canvas
function tick() {
  canvasElement.height = video.videoHeight; // Establece la altura del canvas igual a la del video
  canvasElement.width = video.videoWidth; // Establece el ancho del canvas igual al del video
  canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height); // Dibuja el fotograma actual del video en el canvas

  scanning && requestAnimationFrame(tick); // Si el escaneo está activo, solicita el próximo fotograma
}

// Función para escanear el código QR en el canvas
function scan() {
  try {
    const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height); // Obtiene los datos de la imagen del canvas
    const code = jsQR(imageData.data, imageData.width, imageData.height); // Utiliza la librería jsQR para decodificar el código QR
    
    if (code) {
      cerrarCamara(); // Cierra la cámara
      // Si se detecta un código QR:
      qrcode.callback(code.data); // Llama a la función callback con los datos del código QR
      console.log("Código QR detectado SCAN:", code.data); // Imprime los datos del código QR en la consola
      respuesta = code.data; // Almacena los datos del código QR en la variable respuesta
    } else {
      setTimeout(scan, 90); // Si no se detecta un código QR, intenta escanear de nuevo después de 30ms
    }
  } catch (e) {
    console.error("QR scanning error:", e); // Imprime un mensaje de error si ocurre una excepción durante el escaneo
    setTimeout(scan, 30); // Intenta escanear de nuevo después de 30ms
  }
}

// Función para apagar la cámara
const cerrarCamara = () => {
  // Detiene cada una de las pistas de video
  video.srcObject.getTracks().forEach((track) => {
    track.stop();
  });
  canvasElement.hidden = true; // Oculta el canvas
  btnScanQR.hidden = false; // Muestra el botón de escaneo
};

// Vincula la función cerrarCamara al botón con ID 'camOff'
const camOffButton = document.getElementById('camOff');
if (camOffButton) {
  camOffButton.addEventListener('click', cerrarCamara);
}

// Función para activar el sonido al escanear el código QR
const activarSonido = () => {
  var audio = document.getElementById('audioScaner'); // Obtiene el elemento de audio del DOM
  audio.play(); // Reproduce el audio
}

// Callback que se ejecuta cuando se detecta un código QR
qrcode.callback = (respuesta) => {
  if (respuesta) {
    // Si se recibe una respuesta (datos del código QR):
    console.log("Código QR detectado callback:", respuesta); // Imprime los datos del código QR en la consola
    cerrarCamara(); // Cierra la cámara
    inventarioget(respuesta); // Llama a la función inventarioget para obtener el inventario
  }
};

// Función para mostrar el formulario después de escanear el código QR
function mostrarFormulario(inventarioData) {


  // Oculta el elemento con ID "qr"
  const qrElement = document.getElementById('qr');
  if (qrElement) {
    qrElement.style.display = 'none';
  }

  console.log("Inventario Data MOSTRARFORMULARIO:", inventarioData);

  // Actualiza los campos del formulario con los datos de inventarioData
  document.getElementById('id').value = inventarioData.id;
  
  document.getElementById('nombre').value = inventarioData.nombre;
  
  document.getElementById('marca').value = inventarioData.marca;
  
  document.getElementById('modelo').value = inventarioData.modelo;
  
  document.getElementById('estado').value = inventarioData.estado;
  
  document.getElementById('descripcion').value = inventarioData.descripcion;
  
  document.getElementById('precio').value = inventarioData.precio;
  
  
  const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Formato: YYYY-MM-DD
  console.log("Formatted Date:", formattedDate); // Log the formatted date to the console
  document.getElementById('fecha').value = formattedDate;
  
  document.getElementById('categoria').value = inventarioData.categoria.nombre;
  
  document.getElementById('ubicacion').value = inventarioData.ubicacion.nombre;
  

  // Muestra el formulario
  const container = document.getElementById('form-container');
  container.style.display = 'block';

  const qrform = document.getElementById('formularioQR');
  qrform.style.display = 'block';

  

  // Muestra una alerta de éxito
  Swal.fire({
    title: '¡Código QR leído!',
    text: 'El código QR ha sido leído con éxito.',
    icon: 'success',
    confirmButtonText: '¡Entendido!'
  });
}

const inventarioget = async (respuesta) => {
  try {
    const inventarioResponse = await fetch(`http://localhost:8080/productos/${respuesta}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });

    // Check if the response is ok (status in the range 200-299)
    if (!inventarioResponse.ok) {
      throw new Error(`HTTP error! status: ${inventarioResponse.status}`);
    }

    inventarioData = await inventarioResponse.json(); // Parse the JSON data from the response
    
    //console.log("Inventario Data INVENTARIOGET:", inventarioData); // Log the inventory data to the console

    mostrarFormulario(inventarioData); // Muestra el formulario con los datos del código QR

  } catch (error) {
    console.error("Error al obtener el inventario:", error);
  }
};

// Evento para mostrar la camara sin el boton 
window.addEventListener('load', (e) => {
  //encenderCamara();
})

// Evento que se dispara cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  // Simulación de obtener el texto de respuesta
  const responseText = "Texto de respuesta del código QR";

  // Almacenar el texto de respuesta en localStorage para que form.js pueda acceder a él
  localStorage.setItem('responseText', responseText);
});

// Función para mostrar el elemento con ID "qr"
function mostrarQR() {
  const qrElement = document.getElementById('qr');
  qrElement.style.display = 'block'; // Muestra el elemento con ID "qr"

  const options = document.getElementById('options');
  options.style.display = 'none'; // Oculta el elemento con ID "options"

}

// Función para mostrar el elemento con ID "salas"
function mostrarSalas() {
  const qrElement = document.getElementById('salas');
  qrElement.style.display = 'block'; // Muestra el elemento con ID "salas"

  const options = document.getElementById('options');
  options.style.display = 'none'; // Oculta el elemento con ID "options"

  renderConferenceRoom(); // Llama a la función renderConferenceRoom
}

// Función para mostrar el elemento con ID "newInventarioS"
function newInventarioShow() {
  const invent = document.getElementById('newInventarioS');
  invent.style.display = 'block'; // Muestra el elemento con ID "newInventarioS"
  //Swal.fire('Nuevo Inventario');

  //const options = document.getElementById('options');
  //options.style.display = 'none';

  renderNewInventario(); // Llama a la función renderNewInventario
  
}

// Función para redirigir a la página principal
function buttonHome() {
  window.location.href = 'index.html'; // Redirige a "index.html"
}