let dataTable;
let dataTableIsInitialized = false;

const dataTableOptions = {
    lengthMenu: [5, 10, 15, 20, 100, 200, 500],
    columnDefs: [
        { className: "centered", targets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
        { orderable: false, targets: [9, 10] },
        { searchable: false, targets: [1] }
    ],
    pageLength: 3,
    destroy: true,
    language: {
        lengthMenu: "Mostrar _MENU_ registros por página",
        zeroRecords: "Ningún usuario encontrado",
        info: "Mostrando de _START_ a _END_ de un total de _TOTAL_ registros",
        infoEmpty: "Ningún usuario encontrado",
        infoFiltered: "(filtrados desde _MAX_ registros totales)",
        search: "Buscar:",
        loadingRecords: "Cargando...",
        paginate: {
            first: "Primero",
            last: "Último",
            next: "Siguiente",
            previous: "Anterior"
        }
    }
};

const tableBody_users = document.getElementById('tableBody_users');

const inventariocrud = async () => {
    try {
        const inventarioResponse = await fetch("http://localhost:8080/productos");
        const inventario = await inventarioResponse.json();

        let content = ``;
        inventario.forEach((inventario, index) => {
            content += `
                <tr>
                    <td>${inventario.id}</td>
                    <td>${inventario.nombre}</td>
                    <td>${inventario.marca}</td>
                    <td>${inventario.modelo}</td>
                    <td>${inventario.estado}</td>
                    <td>${inventario.descripcion}</td>
                    <td>${inventario.precio}</td>
                    <td>${inventario.fecha}</td>
                    <td>${inventario.categoria.nombre}</td> 
                    <td>${inventario.ubicacion.nombre}</td>
                    <td>
                        <button id="editbtn" class="btn btn-sm btn-primary" data-id="${inventario.id}"><i class="fa-solid fa-pencil"></i></button>
                        <button id="deletebtn" class="btn btn-sm btn-danger" data-id="${inventario.id}"><i class="fa-solid fa-trash-can"></i></button>
                        <button id="qrbtn" class="btn btn-sm btn-info" data-id="${inventario.id}"><i class="fa-solid fa-qrcode"></i></button>
                    </td>
                </tr>`;
        });
        tableBody_users.innerHTML = content;
    } catch (ex) {
        alert(ex);
    }
};

const initDataTable = async () => {

    

    if (dataTableIsInitialized) {
        dataTable.destroy();
    }

    await inventariocrud();


    dataTable = $("#datatable_users").DataTable(dataTableOptions);

    dataTableIsInitialized = true;
};

document.addEventListener('click', async (event) => {
    if (event.target && event.target.id === 'deletebtn') {
        const id = event.target.getAttribute('data-id');
        const confirmed = confirm('¿Estás seguro de que deseas eliminar este elemento?');
        if (confirmed) {
            try {
                const response = await fetch(`http://localhost:8080/productos/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    alert('Elemento eliminado con éxito');
                    await initDataTable(); // Recargar la tabla después de la eliminación
                } else {
                    alert('Error al eliminar el elemento');
                }
            } catch (error) {
                alert('Error al eliminar el elemento despues del if');
            }
        }
    }

    if (event.target && event.target.id === 'editbtn') {
        const id = event.target.getAttribute('data-id');
        const inventarioResponse = await fetch(`http://localhost:8080/productos/${id}`);
        const inventario = await inventarioResponse.json();

        // Mostrar un formulario de edición con los datos del inventario
        const editForm = `
            <div id="form" class="contenedor">
                <form action="" id="formulario" class="formulario">
                    <label for="unique-id">Identificador Único:</label>
                    <p id="unique-id">${id}</p><br><br>

                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" name="nombre" value="${inventario.nombre}" required><br><br>

                    <label for="marca">Marca:</label>
                    <input type="text" id="marca" name="marca" value="${inventario.marca}" required><br><br>

                    <label for="modelo">Modelo:</label>
                    <input type="text" id="modelo" name="modelo" value="${inventario.modelo}" required><br><br>

                    <label for="estado">Estado:</label>
                    <select id="estado" name="estado" required>
                        <option value="Nuevo" ${inventario.estado === 'Nuevo' ? 'selected' : ''}>Nuevo</option>
                        <option value="Como Nuevo" ${inventario.estado === 'Como Nuevo' ? 'selected' : ''}>Como Nuevo</option>
                        <option value="Medio" ${inventario.estado === 'Medio' ? 'selected' : ''}>Medio</option>
                        <option value="Malo" ${inventario.estado === 'Malo' ? 'selected' : ''}>Malo</option>
                    </select><br><br>

                    <label for="descripcion">Descripción detallada:</label>
                    <textarea id="descripcion" name="descripcion" required>${inventario.descripcion}</textarea><br><br>

                    <label for="precio">Precio:</label>
                    <input type="text" id="precio" name="precio" value="${inventario.precio}" required><br><br>

                    <label for="categoria">Categoría:</label>
                    <select id="categoria" name="categoria" required>
                        <option value="1" ${inventario.categoria.id === 1 ? 'selected' : ''}>Monitor</option>
                        <option value="2" ${inventario.categoria.id === 2 ? 'selected' : ''}>Teclado</option>
                        <option value="3" ${inventario.categoria.id === 3 ? 'selected' : ''}>Mouse</option>
                        <option value="4" ${inventario.categoria.id === 4 ? 'selected' : ''}>CPU</option>
                        <option value="5" ${inventario.categoria.id === 5 ? 'selected' : ''}>NoBreak</option>
                    </select><br><br>
                    
                    <label for="ubicacion">Ubicación:</label>
                    <select id="ubicacion" name="ubicacion" required>
                        <option value="1" ${inventario.ubicacion.id === 1 ? 'selected' : ''}>Sala 1</option>
                        <option value="2" ${inventario.ubicacion.id === 2 ? 'selected' : ''}>Sala 2</option>
                    </select><br><br>

                    <button id="actual" type="submit">Actualizar</button>
                </form>
            </div>
        `;

        // Insert the edit form HTML into the container with id 'editFormContainer'
        $('#editFormContainer').html(editForm);

        // Add an event listener to the button with id 'actual' to handle the form submission
        $('#actual').on('click', async function (e) {
            e.preventDefault(); // Prevent the default form submission behavior

            // Create an object 'updatedInventario' with the updated values from the form inputs
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

            const json = JSON.stringify(updatedInventario);
            console.log(json);

            try {
                // Send a PUT request to update the inventory item with the specified id
                const response = await fetch(`http://localhost:8080/productos/${id}`, {
                    method: 'PUT', // Use the PUT method to update the resource
                    headers: {
                        'Content-Type': 'application/json' // Set the content type to JSON
                    },
                    body: JSON.stringify(updatedInventario) // Convert the 'updatedInventario' object to a JSON string
                });

                // Check if the response is OK (status code 200-299)
                if (response.ok) {
                    $('#formulario').css('display', 'none'); // Hide the edit form container
                    document.getElementById('form').style.display = 'none';
                    alert('Elemento actualizado con éxito'); // Show a success message
                    await initDataTable(); // Reload the data table to reflect the changes
                    
                } else {
                    alert('Error al actualizar el elemento'); // Show an error message if the response is not OK
                }
            } catch (error) {
                //alert('Error al actualizar el elemento Catch'); // Show an error message if there is an exception
            }
        });
    }

    if (event.target && event.target.id === 'qrbtn') {
        const id = event.target.getAttribute('data-id');

        // Crear un contenedor temporal para el QR
        const tempContainer = document.createElement('div');
        document.body.appendChild(tempContainer);

        // Generar el código QR
        const qrcode = new QRCode(tempContainer, {
            text: id,
            width: 96,
            height: 96
        });

        // Obtener la imagen del QR generado
        const qrImage = tempContainer.querySelector('img').src;

        alert('QR Code generado con éxito');

        // Eliminar el contenedor temporal
        document.body.removeChild(tempContainer);

        alert('Eliminar el contenedor temporal');
        
        // Crear un pop-up con la imagen del QR
        const imagePopup = `
            <div id="imagePopup" class="popup">
                <div class="popup-content">
                    <h2>QR Code ${id}</h2>
                    <span class="close">&times;</span>
                    <img src="${qrImage}" alt="QR Code">
                </div>
            </div>
        `;

        // Insertar el pop-up en el cuerpo del documento
       document.body.insertAdjacentHTML('beforeend', imagePopup);

        // Mostrar el pop-up
        const popup = document.getElementById('imagePopup');
        popup.style.display = 'block';

        // Cerrar el pop-up al hacer clic en la 'x'
        document.querySelector('.close').onclick = function() {
            popup.style.display = 'none';
            popup.remove();
        };

        // Descargar la imagen automáticamente sin redirigir
        const downloadLink = document.getElementById('downloadLink');
        downloadLink.addEventListener('click', function(event) {
            event.preventDefault();
            const a = document.createElement('a');
            a.href = imageUrl;
            a.download = `qr_code_${id}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
        downloadLink.click();
    }
});

window.addEventListener("load", async () => {
    await initDataTable();
});
