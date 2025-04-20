document.addEventListener('DOMContentLoaded', function() {
    // Cuando el documento esté listo, se ejecutará esta función
    const newInventoryBtn = document.getElementById('newInventory');

    // Con Canvas
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
            })
        });
    
    if (newInventoryBtn) {
        // Event listener para el botón "Ingresar Nuevo Producto"
        newInventoryBtn.addEventListener('click', async function() {
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

                                    <label for="nombre">Nombre del Producto:</label>
                                    <input type="text" id="nombre" name="nombre" placeholder="Ej. Teclado Logitech"/><br><br>

                                    <label for="marca">Marca:</label>
                                    <input type="text" id="marca" name="marca" placeholder="Ej. Logitech, HP, Dell"/><br><br>

                                    <label for="modelo">Modelo:</label>
                                    <input type="text" id="modelo" name="modelo" placeholder="Ej. K120, G413"/><br><br>

                                    <label for="estado">Estado:</label>
                                    <select id="estado" name="estado" required>
                                        <option value="" disabled selected>Seleccione un estado</option>
                                        <option value="Nuevo">Nuevo</option>
                                        <option value="Usado">Usado</option>
                                        <option value="Reacondicionado">Reacondicionado</option>
                                    </select><br><br>

                                    <label for="descripcion">Descripción:</label>
                                    <textarea id="descripcion" name="descripcion" placeholder="Describir características principales del producto..."></textarea><br><br>

                                    <label for="precio">Precio:</label>
                                    <div>
                                        <span>MXN</span>
                                        <input type="number" id="precio" name="precio" min="0" step="1" placeholder="Ingrese precio en pesos"/>
                                    </div><br><br>

                                    <label for="fecha">Fecha de Ingreso:</label>
                                    <input type="text" id="fecha" name="fecha" readonly value="${new Date().toISOString().split('T')[0]}" placeholder="Fecha actual"/><br><br>

                                    <label for="categoria">Categoría:</label>
                                    <select id="categoria" name="categoria" required>
                                        <option value="" disabled selected>Seleccione una categoría</option>
                                        <option value="1">Mouse</option>
                                        <option value="2">Teclado</option>
                                        <option value="3">Monitor</option>
                                        <option value="4">No-Break</option>
                                    </select><br><br>

                                    <label for="ubicacion">Ubicación:</label>
                                    <select id="ubicacion" name="ubicacion" required>
                                        <option value="" disabled selected>Seleccione una ubicación</option>
                                        <option value="1">Sala 1</option>
                                        <option value="2">Sala 2</option>
                                    </select><br><br>

                                    <button id="generate-button">
                                        Enviar Inventario
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
                            nombre: $('#nombre').val(),
                            marca: $('#marca').val(),
                            modelo: $('#modelo').val(),
                            estado: $('#estado').val(),
                            descripcion: $('#descripcion').val(),
                            precio: $('#precio').val(),
                            fecha: $('#fecha').val(),
                            ubicacion: { id: $('#ubicacion').val() },
                            categoria: { id: $('#categoria').val() },
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
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Elemento creado con éxito',
                                    confirmButtonText: 'Generar QR',
                                    showCancelButton: true,
                                    cancelButtonText: 'Aceptar',
                                    allowOutsideClick: false,
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        // Esta función se ejecutará si el usuario hace clic en "Imprimir QR"
                                        console.log("Hola Mundo");
                                        
                                        const newId = $('#uniqueid').text(); // Obtener el ID del formulario
                                        const newCat = $('#categoria').val(); // Obtener la categoría del formulario

                                        const text = newId;
                                        if (!text) {
                                            alert("Error al Obtener el ID del Producto");
                                            return;
                                        }
                                        // Crear un código QR
                                        var qrcode = new QRCode(document.getElementById('qrcode-container'), {
                                            text: JSON.stringify({
                                                id: text,
                                                categoria: newCat
                                            }),
                                            width: 128,
                                            height: 128
                                        });
                                        // Crear una imagen para el logo
                                        var logo = new Image();
                                        logo.src = '../media/images.jpg'; // Ruta al logo

                                        // Esperar a que el logo cargue y superponerlo en el QR
                                        logo.onload = function () {
                                            var qrcodeContainer = $('#qrcode-container');
                                            var canvas = qrcodeContainer.find('canvas')[0];

                                            // Crear un nuevo canvas para combinar el QR y el logo
                                            var combinedCanvas = document.createElement('canvas');
                                            combinedCanvas.width = canvas.width;
                                            combinedCanvas.height = canvas.height;

                                            // Dibujar el QR en el nuevo canvas
                                            var ctx = combinedCanvas.getContext('2d');
                                            ctx.drawImage(canvas, 0, 0);

                                            // Calcular la posición del logo
                                            var logoSize = 30;
                                            var x = (canvas.width - logoSize) / 2;
                                            var y = (canvas.height - logoSize) / 2;

                                            // Dibujar el logo en el nuevo canvas
                                            ctx.drawImage(logo, x, y, logoSize, logoSize);

                                            // Reemplazar el QR antiguo con el canvas combinado
                                            qrcodeContainer.html('');
                                            qrcodeContainer.append(combinedCanvas);
                                        };
                                    }
                                });
                            } else {
                                alert('Error al crear el elemento');
                            }
                        } catch (error) {
                            alert('Error al crear el elemento');
                        }
                    });

                    // Ocultar el botón "Ingresar Nuevo Producto" después de hacer clic
                    $('#newInventory').hide();
                } else {
                    alert('Error al crear la nueva entrada');
                    console.error('Error:', response.statusText);
                }
            } catch (error) {
                alert('Error al crear la nueva entrada');
                console.error('Error:', error);
            }
        });
    } else {
        console.log('Botón "Ingresar Nuevo Producto" no encontrado');
    }
});


/*// Código para Generar el QR
    $('#generate-button').on('click', function () {
        const newId = $('#uniqueid').text(); // Obtener el ID del formulario
        const text = newId;

        if (!text) {
            alert("Error al Obtener el ID del Producto");
            return;
        }

        // Crear un código QR
        var qrcode = new QRCode(document.getElementById('qrcode-container'), {
            text: text,
            width: 128,
            height: 128
        });

        // Crear una imagen para el logo
        var logo = new Image();
        logo.src = '../media/images.jpg'; // Ruta al logo

        // Esperar a que el logo cargue y superponerlo en el QR
        logo.onload = function () {
            var qrcodeContainer = $('#qrcode-container');
            var canvas = qrcodeContainer.find('canvas')[0];

            // Crear un nuevo canvas para combinar el QR y el logo
            var combinedCanvas = document.createElement('canvas');
            combinedCanvas.width = canvas.width;
            combinedCanvas.height = canvas.height;

            // Dibujar el QR en el nuevo canvas
            var ctx = combinedCanvas.getContext('2d');
            ctx.drawImage(canvas, 0, 0);

            // Calcular la posición del logo
            var logoSize = 30;
            var x = (canvas.width - logoSize) / 2;
            var y = (canvas.height - logoSize) / 2;

            // Dibujar el logo en el nuevo canvas
            ctx.drawImage(logo, x, y, logoSize, logoSize);

            // Reemplazar el QR antiguo con el canvas combinado
            qrcodeContainer.html('');
            qrcodeContainer.append(combinedCanvas);

            // Mostrar el botón de descarga
            $('#download-button').show();

            // Mostrar el QR en el modal
            $('#qrModalContainer').html('');
            $('#qrModalContainer').append(combinedCanvas);
            $('#qrModal .modal-dialog').addClass('modal-dialog-centered');
            $('#qrModal').modal('show');
        };
    });
    */