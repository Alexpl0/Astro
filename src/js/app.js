// Obtiene el elemento del DOM con el id 'contenedorQR' y lo asigna a la variable contenedorQR
const contenedorQR = document.getElementById('contenedorQR');

// Obtiene el elemento del DOM con el id 'formulario' y lo asigna a la variable formulario
const formulario = document.getElementById('formulario');

// Crea una nueva instancia de QRCode y la asigna a la variable QR, utilizando contenedorQR como el contenedor del código QR
const QR = new QRCode(contenedorQR);

// Añade un evento 'submit' al formulario que se ejecuta cuando el formulario es enviado
formulario.addEventListener('submit', (e) => {
    // Previene el comportamiento por defecto del formulario (que recargue la página)
    e.preventDefault();
    
    // Genera un código QR con el valor del campo 'link' del formulario
    QR.makeCode(formulario.link.value);
});
