$(document).ready(function () {
    // Cuando el documento esté listo, se ejecutará esta función    
    //Con Canvas
    $('#download-button').on('click', function () {
        // Cuando se haga clic en el botón de descarga, se ejecutará esta función

        html2canvas(document.querySelector(canvas)).then(function (canvas) {
            // Convierte el contenedor del código QR a un canvas usando html2canvas

            var qrCodeImage = canvas.toDataURL('image/png');
            // Convierte el canvas a una URL de datos en formato PNG

            var a = document.createElement('a');
            a.href = qrCodeImage;
            a.download = $('#uniqueid').val() + '_qrcode_with_logo.png';
            // Crea un enlace de descarga con la imagen del código QR

            a.click();
            // Simula un clic en el enlace para iniciar la descarga
        });
    });

    // Event listener para el botón "Ingresar Nuevo Producto"
    $('#new-product-button').on('click', async function () {
        try {
            // Realiza el POST inicial para crear una nueva entrada sin campos
            const response = await fetch('http://localhost:8080/productos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });

            if (response.ok) {
                // Obtiene la nueva entrada creada
                const newEntry = await response.json();
                const newId = newEntry.id;

                // Muestra el formulario de edición con el ID obtenido
                const formHtml = `
                    <div class="contenedor">
                        <div id="form" class="contenedor">
                            <form action="" id="formulario" class="formulario">
                                <label for="uniqueid">Identificador Único:</label>
                                <p id="uniqueid">${newId}</p><br><br>

                                <label for="nombre">Nombre:</label>
                                <input type="text" id="nombre" name="nombre" required><br><br>

                                <label for="marca">Marca:</label>
                                <input type="text" id="marca" name="marca" required><br><br>

                                <label for="modelo">Modelo:</label>
                                <input type="text" id="modelo" name="modelo" required><br><br>

                                <label for="estado">Estado:</label>
                                <select id="estado" name="estado" required>
                                    <option value="Nuevo">Nuevo</option>
                                    <option value="Como Nuevo">Como Nuevo</option>
                                    <option value="Medio">Medio</option>
                                    <option value="Malo">Malo</option>
                                </select><br><br>

                                <label for="descripcion">Descripción detallada:</label>
                                <textarea id="descripcion" name="descripcion" required></textarea><br><br>

                                <label for="precio">Precio:</label>
                                <input type="text" id="precio" name="precio" required><br><br>

                                <label for="categoria">Categoría:</label>
                                <select id="categoria" name="categoria" required>
                                    <option value="1">Monitor</option>
                                    <option value="2">Teclado</option>
                                    <option value="3">Mouse</option>
                                    <option value="4">CPU</option>
                                    <option value="5">NoBreak</option>
                                </select><br><br>
                                
                                <label for="ubicacion">Ubicación:</label>
                                <select id="ubicacion" name="ubicacion" required>
                                    <option value="1">Sala 1</option>
                                    <option value="2">Sala 2</option>
                                </select><br><br>

                                <button id="NOUSAR" type="submit">No USAR</button>
                                <button id="generate-button" type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModalCenter">
                                    Generar QR
                                </button>
                            </form>
                        </div>
                    </div>
                `;
                $('#form-container').html(formHtml);

                // Añadir event listener para el formulario de edición
                $('#generate-button').on('click', async function (e) {
                    e.preventDefault();
                    const updatedInventario = {
                        nombre: $('#nombre').val(), // Get the value of the input with id 'nombre'
                        marca: $('#marca').val(), // Get the value of the input with id 'marca'
                        modelo: $('#modelo').val(), // Get the value of the input with id 'modelo'
                        estado: $('#estado').val(), // Get the value of the select with id 'estado'
                        descripcion: $('#descripcion').val(), // Get the value of the textarea with id 'descripcion'
                        precio: $('#precio').val(), // Get the value of the input with id 'precio'
                        ubicacion: { id: ($('#ubicacion').val()) }, // Get the value of the select with id 'ubicacion' and convert it to BigInt
                        categoria: { id: ($('#categoria').val()) }, // Get the value of the select with id 'categoria' and convert it to BigInt
                    };

                    try {
                        const response = await fetch(`http://localhost:8080/productos/${newId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(updatedInventario)
                        });
                        if (response.ok) {
                            alert('Elemento creado con éxito');
                            
                        } else {
                            alert('Error al crear el elemento');
                        }
                    } catch (error) {
                        //alert('Error al crear el elemento');
                    }
                });
            } else {
                alert('Error al crear la nueva entrada');
            }
        } catch (error) {
            alert('Error al crear la nueva entrada');
        }
    });

    //Codigo para Generar el QR
    $('#generate-button').on('click', function () {
        const newId = $('#uniqueid').text(); // Obtener el ID del formulario
        const text = newId;

        alert(text);    


        if (!text) {
            alert("Error al Obtener el ID del Producto");
            return;
        }

        // Create a QR code
        var qrcode = new QRCode(document.getElementById('qrcode-container'), {
            text: text,
            width: 128,
            height: 128
        });

        // Create an image for the logo
        var logo = new Image();
        logo.src = '../media/images.jpg'; // Path to your logo image

        // Wait for the logo to load, then overlay it on the QR code
        logo.onload = function () {
            var qrcodeContainer = $('#qrcode-container');
            var canvas = qrcodeContainer.find('canvas')[0];

            // Create a new canvas for the combined QR code and logo
            var combinedCanvas = document.createElement('canvas');
            combinedCanvas.width = canvas.width;
            combinedCanvas.height = canvas.height;

            // Draw the QR code on the new canvas
            var ctx = combinedCanvas.getContext('2d');
            ctx.drawImage(canvas, 0, 0);

            // Calculate logo position
            var logoSize = 30; // Adjust the logo size as needed
            var x = (canvas.width - logoSize) / 2;
            var y = (canvas.height - logoSize) / 2;

            // Draw the logo on the new canvas
            ctx.drawImage(logo, x, y, logoSize, logoSize);

            // Replace the old QR code with the combined canvas
            qrcodeContainer.html('');
            qrcodeContainer.append(combinedCanvas);

            // Show the download button
            $('#download-button').show();

            // Show the QR code in the modal
            $('#qrModalContainer').html('');
            $('#qrModalContainer').append(combinedCanvas);
            $('#qrModal .modal-dialog').addClass('modal-dialog-centered'); // Add this line to center the modal
            $('#qrModal').modal('show');
        };
    });
});





/*/PRUEBAQR
$(document).ready(function () {

    $('#generate-button2').on('click', function () {
        var text = $('#text-input').val();

        if (!text) {
            alert("Please enter text for the QR code.");
            return;
        }

        // Create a QR code
        var qrcode = new QRCode(document.getElementById('qrcode-container'), {
            text: text,
            width: 128,
            height: 128
        });

        // Create an image for the logo
        var logo = new Image();
        logo.src = '../media/images.jpg'; // Path to your logo image

        // Wait for the logo to load, then overlay it on the QR code
        logo.onload = function () {
            var qrcodeContainer = $('#qrcode-container');
            var canvas = qrcodeContainer.find('canvas')[0];

            // Create a new canvas for the combined QR code and logo
            var combinedCanvas = document.createElement('canvas');
            combinedCanvas.width = canvas.width;
            combinedCanvas.height = canvas.height;

            // Draw the QR code on the new canvas
            var ctx = combinedCanvas.getContext('2d');
            ctx.drawImage(canvas, 0, 0);

            // Calculate logo position
            var logoSize = 30; // Adjust the logo size as needed
            var x = (canvas.width - logoSize) / 2;
            var y = (canvas.height - logoSize) / 2;

            // Draw the logo on the new canvas
            ctx.drawImage(logo, x, y, logoSize, logoSize);

            // Replace the old QR code with the combined canvas
            qrcodeContainer.html('');
            qrcodeContainer.append(combinedCanvas);

            // Show the download button
            $('#download-button').show();

            // Show the QR code in the modal
            $('#qrModalContainer').html('');
            $('#qrModalContainer').append(combinedCanvas);
            $('#qrModal .modal-dialog').addClass('modal-dialog-centered'); // Add this line to center the modal
            $('#qrModal').modal('show');
        };
    });


});

//FINALPRUEBA
*/