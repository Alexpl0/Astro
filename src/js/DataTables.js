let dataTable; // Instancia DataTable de Productos
let dataTableInventario; // Instancia DataTable de Inventario

let dataTableIsInitialized = false;
let dataTableInventarioIsInitialized = false;

const dataTableOptions = {
    lengthMenu: [5, 10, 15, 20, 100, 200, 500],
    columnDefs: [
        { className: "centered", targets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
        { orderable: false, targets: [10] },
        { searchable: false, targets: [10] }
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

const tableBody_productos = document.getElementById('tableBody_productos');
const tableBody_inventario = document.getElementById('tableBody_inventario');

const inventariocrud = async () => {
    try {
        const productoResponse = await fetch("http://localhost:8080/productos");
        const producto = await productoResponse.json();

        let content = ``;
        producto.forEach((producto, index) => {
            content += `
                <tr>
                    <td>${producto.id}</td>
                    <td>${producto.nombre}</td>
                    <td>${producto.marca}</td>
                    <td>${producto.modelo}</td>
                    <td>${producto.estado}</td>
                    <td>${producto.descripcion}</td>
                    <td>${producto.precio}</td>
                    <td>${producto.fecha}</td>
                    <td>${producto.categoria.nombre}</td> 
                    <td>${producto.ubicacion.nombre}</td>
                    <td>
                        <button id="editbtn" class="btn btn-sm btn-primary" data-id="${producto.id}"><i class="fa-solid fa-pencil"></i></button>
                        <button id="deletebtn" class="btn btn-sm btn-danger" data-id="${producto.id}"><i class="fa-solid fa-trash-can"></i></button>
                        <button id="qrbtn" class="btn btn-sm btn-info" data-id="${producto.id}"><i class="fa-solid fa-qrcode"></i></button>
                    </td>
                </tr>`;
        });
        tableBody_productos.innerHTML = content;
    } catch (ex) {
        alert(ex);
    }
};

const inventario = async () => {
    try {
        const inventarioResponse = await fetch("http://localhost:8080/inventario");
        const inventario = await inventarioResponse.json();

        let content = ``;
        inventario.forEach((item, index) => {
            content += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.producto.nombre}</td>
                    <td>${item.estado_fisico}</td>
                    <td>${item.estado_operativo}</td>
                    <td>${item.observaciones}</td>
                    <td>${item.fecha}</td>
                    <td>
                        <button id="editbtn" class="btn btn-sm btn-primary" data-id="${item.id}"><i class="fa-solid fa-pencil"></i></button>
                        <button id="deletebtn" class="btn btn-sm btn-danger" data-id="${item.id}"><i class="fa-solid fa-trash-can"></i></button>
                    </td>
                </tr>`;
        });
        tableBody_inventario.innerHTML = content;
    } catch (ex) {
        alert(ex);
    }
};

const initDataTable = async () => {
    if (dataTableIsInitialized) {
        dataTable.destroy();
    }
    if (dataTableInventarioIsInitialized) {
        dataTableInventario.destroy();
    }

    await inventariocrud();
    await inventario();

    dataTable = $("#datatable_productos").DataTable(dataTableOptions);
    dataTableInventario = $("#datatable_inventario").DataTable({
        ...dataTableOptions,
        columnDefs: [
            { className: "centered", targets: [0, 1, 2, 3, 4, 5, 6] },
            { orderable: false, targets: [6] },
            { searchable: false, targets: [6] }
        ]
    });

    dataTableIsInitialized = true;
    dataTableInventarioIsInitialized = true;
};

// Delegación de eventos para diferenciar la tabla origen
document.addEventListener('click', async (event) => {
    const btn = event.target.closest('button');
    if (!btn) return;

    // Detectar de qué tabla viene el botón
    const parentTable = btn.closest('table');
    const isProductosTable = parentTable && parentTable.id === 'datatable_productos';
    const isInventarioTable = parentTable && parentTable.id === 'datatable_inventario';

    if (btn.id === 'deletebtn') {
        const id = btn.getAttribute('data-id');
        try {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: "¿Deseas eliminar este elemento?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                let url = '';
                if (isProductosTable) {
                    url = `http://localhost:8080/productos/${id}`;
                } else if (isInventarioTable) {
                    url = `http://localhost:8080/inventario/${id}`;
                }
                if (url) {
                    const response = await fetch(url, { method: 'DELETE' });
                    if (response.ok) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Elemento eliminado con éxito',
                            showConfirmButton: true,
                            confirmButtonText: 'Aceptar',
                        });
                        await initDataTable();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'No se pudo eliminar el elemento',
                        });
                    }
                }
            }
        } catch (swalError) {
            console.error('Error al mostrar SweetAlert:', swalError);
        }
    }

    if (btn.id === 'editbtn') {
        const id = btn.getAttribute('data-id');
        let fetchUrl = '';
        if (isProductosTable) {
            fetchUrl = `http://localhost:8080/productos/${id}`;
        } else if (isInventarioTable) {
            fetchUrl = `http://localhost:8080/inventario/${id}`;
        }
        if (!fetchUrl) return;

        const inventarioResponse = await fetch(fetchUrl);
        const inventario = await inventarioResponse.json();

        // Mostrar un formulario de edición con los datos del producto
        const editFormProductos = `
            <div id="form" class="contenedor">
                <form action="" id="formulario" class="formulario">
                    <label for="unique-id">Identificador Único:</label>
                    <p id="unique-id">${id}</p><br><br>
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" name="nombre" value="${isProductosTable ? inventario.nombre : inventario.producto.nombre}" required><br><br>
                    <label for="marca">Marca:</label>
                    <input type="text" id="marca" name="marca" value="${isProductosTable ? inventario.marca : (inventario.producto.marca || '')}" required><br><br>
                    <label for="modelo">Modelo:</label>
                    <input type="text" id="modelo" name="modelo" value="${isProductosTable ? inventario.modelo : (inventario.producto.modelo || '')}" required><br><br>
                    <label for="estado">Estado:</label>
                    <input type="text" id="estado" name="estado" value="${isProductosTable ? inventario.estado : (inventario.producto.estado || '')}" required><br><br>
                    <label for="descripcion">Descripción detallada:</label>
                    <textarea id="descripcion" name="descripcion" required>${isProductosTable ? inventario.descripcion : (inventario.producto.descripcion || '')}</textarea><br><br>
                    <label for="precio">Precio:</label>
                    <input type="text" id="precio" name="precio" value="${isProductosTable ? inventario.precio : (inventario.producto.precio || '')}" required><br><br>
                    <button id="actual" type="submit">Actualizar</button>
                </form>
            </div>
        `;
        const editFormInventario = `
            <div id="form" class="contenedor">
                <form action="" id="formulario" class="formulario">
                    <label for="unique-id">Identificador Único:</label>
                    <p id="unique-id">${id}</p><br><br>

                    <label for="estado_fisico">Estado Físico:</label>
                    <select id="estado_fisico" name="estado_fisico" required>
                        <option value="Nuevo" ${inventario.estado_fisico === 'Nuevo' ? 'selected' : ''}>Nuevo</option>
                        <option value="Usado - Buen estado" ${inventario.estado_fisico === 'Usado - Buen estado' ? 'selected' : ''}>Usado - Buen estado</option>
                        <option value="Usado - Con detalles" ${inventario.estado_fisico === 'Usado - Con detalles' ? 'selected' : ''}>Usado - Con detalles</option>
                        <option value="Dañado" ${inventario.estado_fisico === 'Dañado' ? 'selected' : ''}>Dañado</option>
                        <option value="Obsoleto" ${inventario.estado_fisico === 'Obsoleto' ? 'selected' : ''}>Obsoleto</option>
                    </select><br><br>
                    
                    <label for="estado_operativo">Estado Operativo:</label>
                    <select id="estado_operativo" name="estado_operativo" required>
                        <option value="Funcional" ${inventario.estado_operativo === 'Funcional' ? 'selected' : ''}>Funcional</option>
                        <option value="Funciona parcialmente" ${inventario.estado_operativo === 'Funciona parcialmente' ? 'selected' : ''}>Funciona parcialmente</option>
                        <option value="En reparación" ${inventario.estado_operativo === 'En reparación' ? 'selected' : ''}>En reparación</option>
                        <option value="No funcional" ${inventario.estado_operativo === 'No funcional' ? 'selected' : ''}>No funcional</option>
                        <option value="Retirado de operación" ${inventario.estado_operativo === 'Retirado de operación' ? 'selected' : ''}>Retirado de operación</option>
                    </select><br><br>
                    
                    <label for="observaciones">Observaciones:</label>
                    <textarea id="observaciones" name="observaciones">${inventario.observaciones}</textarea><br><br>
                    <button id="actual" type="submit">Actualizar</button>
                </form>
            </div>
        `;
        
        // Determinar qué formulario mostrar según la tabla de origen
        const editForm = isProductosTable ? editFormProductos : editFormInventario;

        $('#editFormContainer').html(editForm);

        $('#actual').on('click', async function (e) {
            e.preventDefault();

            let updatedData;
            let putUrl = '';

            if (isProductosTable) {
                updatedData = {
                    nombre: $('#nombre').val(),
                    marca: $('#marca').val(),
                    modelo: $('#modelo').val(),
                    estado: $('#estado').val(),
                    descripcion: $('#descripcion').val(),
                    precio: $('#precio').val(),
                    fecha: inventario.fecha,
                    categoria: inventario.categoria.id,
                    ubicacion: inventario.ubicacion.id
                };
                console.log(updatedData);
                putUrl = `http://localhost:8080/productos/${id}`;
            } else if (isInventarioTable) {
                updatedData = {
                    estado_fisico: $('#estado_fisico').val(),
                    estado_operativo: $('#estado_operativo').val(),
                    observaciones: $('#observaciones').val(),
                    fecha: inventario.fecha,
                };
                putUrl = `http://localhost:8080/inventario/${id}`;
            } else {
                return;
            }

            try {
                const response = await fetch(putUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });

                if (response.ok) {
                    $('#formulario').css('display', 'none');
                    document.getElementById('form').style.display = 'none';
                    Swal.fire({
                        icon: 'success',
                        title: 'Elemento actualizado con éxito',
                        showConfirmButton: true,
                        confirmButtonText: 'Aceptar',
                    });
                    await initDataTable();
                } else {
                    console.log('Error al actualizar el elemento antes del catch');
                }
            } catch (error) {
                console.log('Error al actualizar el elemento dentro del catch:');
            }
        });
    }

    //================================================================================================
    if (btn.id === 'qrbtn' && isProductosTable) {
        const id = btn.getAttribute('data-id');
        
        // Realiza el GET para obtener los datos del producto
        const productoGet = await fetch(`http://localhost:8080/productos/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!productoGet.ok) {
            console.error('Error al obtener el producto:', productoGet.statusText);
            return;
        }
        
        // Procesa la respuesta JSON
        const producto = await productoGet.json(); // Datos del producto obtenido
    
        const idQR = producto.id; // ID del producto
        const catQR = producto.categoria.id; // id de la categoria
    
        // Crear un contenedor temporal para el QR
        const tempQRContainer = document.createElement('div');
        tempQRContainer.id = 'temp-qrcode-container';
        tempQRContainer.style.display = 'none';
        document.body.appendChild(tempQRContainer);
        
        // Crear un código QR en el contenedor temporal
        var qrcode = new QRCode(tempQRContainer, {
            text: JSON.stringify({
                id: idQR,
                categoria: catQR,
            }),
            width: 128,
            height: 128
        });
    
        // Crear una imagen para el logo
        var logo = new Image();
        logo.src = '../media/images.jpg'; // Ruta al logo
    
        // Esperar a que el logo cargue y superponerlo en el QR
        logo.onload = function() {
            var qrcodeContainer = $(tempQRContainer);
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
    
            // Convertir el canvas a una imagen data URL
            const qrImageUrl = combinedCanvas.toDataURL('image/png');
            
            // Eliminar el contenedor temporal
            document.body.removeChild(tempQRContainer);
            
            // Mostrar el QR en un SweetAlert
            Swal.fire({
                title: 'Código QR',
                html: `
                    <div style="text-align: center;">
                        <p>Producto: ${producto.nombre}</p>
                        <img src="${qrImageUrl}" alt="QR Code" style="margin: 0 auto;">
                    </div>
                `,
                width: 'auto',
                showCloseButton: true,
                showConfirmButton: true,
                confirmButtonText: 'Descargar',
                focusConfirm: false,
                preConfirm: () => {
                    // Crear un enlace temporal para la descarga
                    const downloadLink = document.createElement('a');
                    downloadLink.href = qrImageUrl;
                    // Establecer el nombre del archivo como "nombreProducto_ID.png"
                    downloadLink.download = `${producto.nombre.replace(/\s+/g, '_')}_${producto.id}.png`;
                    // Agregar el enlace al documento temporalmente
                    document.body.appendChild(downloadLink);
                    // Hacer clic en el enlace para iniciar la descarga
                    downloadLink.click();
                    // Remover el enlace temporal
                    document.body.removeChild(downloadLink);
                    // Evitar que se cierre el Sweet Alert después de la descarga
                    return false;
                }
            });
        };
    }

//================================================================================================

});

window.addEventListener("load", async () => {
    await initDataTable();
});


/*
// Mostrar el modal
        qrModal.style.display = "block";
        // Cerrar el modal al hacer clic en la "X"
        const closeModal = qrModal.querySelector('.close');
        closeModal.onclick = function () {
            qrModal.style.display = "none";
            document.body.removeChild(qrModal); // Eliminar el modal del DOM
        };
        // Cerrar el modal al hacer clic fuera del contenido
        window.onclick = function (event) {
            if (event.target == qrModal) {
                qrModal.style.display = "none";
                document.body.removeChild(qrModal); // Eliminar el modal del DOM
            }
        };
        // Cerrar el modal al presionar la tecla "Esc"
        window.addEventListener('keydown', function (event) {
            if (event.key === "Escape") {
                qrModal.style.display = "none";
                document.body.removeChild(qrModal); // Eliminar el modal del DOM
            }
        });

    */