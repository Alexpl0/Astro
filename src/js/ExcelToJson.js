// Variable global para almacenar los datos procesados
let processedData = [];

// Espera a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', function() {
    // Obtiene referencias a los elementos HTML mediante sus IDs
    const fileInput = document.getElementById('excelFile');      // Input de tipo file para seleccionar archivos Excel
    const convertBtn = document.getElementById('convertBtn');    // Botón para iniciar la conversión
    const jsonOutput = document.getElementById('jsonOutput');    // Área de texto donde se mostrará el JSON resultante
    const downloadBtn = document.getElementById('downloadBtn');  // Botón para descargar el JSON generado
    const fileInfo = document.getElementById('fileInfo');        // Elemento para mostrar información del archivo seleccionado
    const putJsonBtn = document.getElementById('putJson');       // Referencia al botón putJson
    
    // Declaración de variables para usar en todo el ámbito de la función
    let workbook = null;  // Almacenará el libro Excel cargado
    let fileName = '';    // Guardará el nombre del archivo sin extensión
    // Nota: processedData ahora es global
    
    // Deshabilitar el botón putJson inicialmente
    putJsonBtn.disabled = true;
    
    // Configura un evento para detectar cuando el usuario selecciona un archivo
    fileInput.addEventListener('change', function(e) {
        // Obtiene el archivo seleccionado (el primero si hay varios)
        const file = e.target.files[0];
        
        if (file) {
            // Extrae el nombre del archivo sin la extensión
            fileName = file.name.split('.')[0];
            // Muestra información del archivo seleccionado incluyendo nombre y tamaño formateado
            fileInfo.textContent = `Archivo seleccionado: ${file.name} (${formatFileSize(file.size)})`;
        } else {
            // Si no hay archivo seleccionado, limpia el texto informativo
            fileInfo.textContent = '';
        }
    });
    
    // Configura el evento para el botón de conversión
    convertBtn.addEventListener('click', function() {
        // Obtiene el archivo seleccionado
        const file = fileInput.files[0];
        
        // Verifica si se ha seleccionado un archivo
        if (!file) {
            // Muestra alerta si no hay archivo y termina la ejecución
            alert('Por favor, selecciona un archivo Excel primero.');
            return;
        }
        
        // Crea una instancia de FileReader para leer el archivo
        const reader = new FileReader();
        
        // Configura el controlador para cuando la lectura del archivo se complete
        reader.onload = function(e) {
            try {
                // Convierte el resultado del FileReader a un array de bytes (Uint8Array)
                const data = new Uint8Array(e.target.result);
                // Utiliza la biblioteca XLSX para leer el archivo Excel como un array de bytes
                workbook = XLSX.read(data, { type: 'array' });
                
                // Crea un array vacío para almacenar los datos JSON resultantes
                const result = [];
                // Itera sobre cada hoja del libro Excel
                workbook.SheetNames.forEach(function(sheetName) {
                    // Obtiene la hoja de trabajo específica del libro
                    const worksheet = workbook.Sheets[sheetName];
                    // Convierte la hoja de trabajo a formato JSON
                    // El operador spread (...) descompone el array para añadir cada elemento individualmente
                    result.push(...XLSX.utils.sheet_to_json(worksheet, {
                        defval: "", // Usa cadena vacía como valor predeterminado para celdas vacías
                        raw: false  // Procesa valores como fechas y números en lugar de mantenerlos como texto crudo
                    }));
                });
                
                // Muestra el resultado en la consola para depuración
                console.log(result);

                for (let i = 0; i < result.length; i++) {
                    // Convierte el campo 'ubicacion' a un objeto con el ID de la ubicación
                    result[i] = {
                        'nombre': result[i].nombre,
                        'marca': result[i].marca,
                        'modelo': result[i].modelo,
                        'estado': result[i].estado,
                        'descripcion': result[i].descripcion,
                        'precio': result[i].precio,
                        'fecha': result[i].fecha,
                        'ubicacion': {
                            'id': parseInt(result[i].ubicacion) || 0, // Convierte el ID de ubicación a entero (long) con valor predeterminado 0 si es inválido
                        },
                        'categoria': {
                            'id': parseInt(result[i].categoria) || 0, // Convierte el ID de categoría a entero (long) con valor predeterminado 0 si es inválido
                        },
                    };
                }

                console.log(result);
                
                // Guardar los datos procesados para uso posterior
                processedData = result;
                
                // Convertir el resultado a JSON formateado para mostrar en el textarea
                const jsonString = JSON.stringify(result, null, 2);
                jsonOutput.value = jsonString;
                
                // Habilitar botones después de la conversión exitosa
                downloadBtn.disabled = false;
                putJsonBtn.disabled = false;
                
                // Mostrar notificación de éxito
                Swal.fire({
                    title: '¡Archivo convertido!',
                    text: 'El archivo Excel ha sido convertido a JSON con éxito.',
                    icon: 'success',
                    confirmButtonText: '¡Entendido!'
                });
                
            } catch (error) {
                // Maneja cualquier error durante el procesamiento
                console.error('Error al procesar el archivo:', error);
                jsonOutput.value = `Error al procesar el archivo: ${error.message}`;
                downloadBtn.disabled = true;
                putJsonBtn.disabled = true;
            }
        };
        
        // Configura el controlador para errores durante la lectura del archivo
        reader.onerror = function() {
            // Muestra mensaje de error genérico
            jsonOutput.value = 'Error al leer el archivo.';
            // Mantiene deshabilitado el botón de descarga
            downloadBtn.disabled = true;
            putJsonBtn.disabled = true;
        };
        
        // Inicia la lectura del archivo como ArrayBuffer (necesario para procesar datos binarios)
        reader.readAsArrayBuffer(file);
    });
    
    // Evento para el botón de enviar JSON a la API
    putJsonBtn.addEventListener('click', function() {
        if (processedData.length === 0) {
            Swal.fire({
                title: 'Error',
                text: 'No hay datos para enviar. Por favor, convierte un archivo Excel primero.',
                icon: 'error'
            });
            return;
        }
        
        // Mostrar indicador de carga
        Swal.fire({
            title: 'Enviando datos...',
            text: 'Creando productos en la base de datos',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        // Ejecutar el envío a la API y mostrar resultados
        enviarProductosAPI()
            .then(resultados => {
                Swal.fire({
                    title: 'Creación de productos',
                    html: `
                        <p>Productos creados: ${resultados.exitosos}</p>
                        <p>Productos con error: ${resultados.fallidos}</p>
                        ${resultados.errores.length > 0 ? 
                            `<div style="max-height: 200px; overflow-y: auto; text-align: left; margin-top: 15px;">
                                <p>Errores:</p>
                                <ul>${resultados.errores.map(e => `<li>${e}</li>`).join('')}</ul>
                            </div>` : ''}
                    `,
                    icon: resultados.fallidos > 0 ? 'warning' : 'success'
                });
            })
            .catch(error => {
                Swal.fire({
                    title: 'Error',
                    text: `Error al crear productos: ${error.message}`,
                    icon: 'error'
                });
            });
    });
    
    // Configura el evento para el botón de descarga del JSON
    downloadBtn.addEventListener('click', function() {
        // Verifica que haya contenido JSON para descargar
        if (!jsonOutput.value) {
            // Muestra alerta si no hay datos y termina la ejecución
            alert('No hay datos JSON para descargar.');
            return;
        }
        
        // Crea un objeto Blob con el contenido JSON y tipo MIME application/json
        const blob = new Blob([jsonOutput.value], { type: 'application/json' });
        // Genera una URL para el objeto Blob
        const url = URL.createObjectURL(blob);
        // Crea dinámicamente un elemento <a> para la descarga
        const a = document.createElement('a');
        
        // Configura el elemento <a> con la URL del Blob
        a.href = url;
        // Establece el nombre del archivo de descarga (usa el nombre original o 'excel' por defecto)
        a.download = `${fileName || 'excel'}_convertido.json`;
        // Añade temporalmente el elemento <a> al DOM
        document.body.appendChild(a);
        // Simula un clic en el elemento para iniciar la descarga
        a.click();
        
        // Limpia los recursos después de un corto tiempo
        setTimeout(function() {
            // Elimina el elemento <a> del DOM
            document.body.removeChild(a);
            // Libera la URL del objeto creado para evitar fugas de memoria
            window.URL.revokeObjectURL(url);
        }, 0);
    });
    
    // Función auxiliar para formatear el tamaño del archivo en unidades legibles
    function formatFileSize(bytes) {
        // Caso especial para tamaño cero
        if (bytes === 0) return '0 Bytes';
        
        // Define constantes para la conversión
        const k = 1024;                           // Factor de conversión entre unidades
        const sizes = ['Bytes', 'KB', 'MB', 'GB']; // Unidades de medida
        // Calcula el índice de la unidad apropiada basado en el tamaño
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        // Devuelve el valor formateado con 2 decimales y la unidad correspondiente
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});

// Función para enviar un solo producto a la API mediante POST
async function crearProducto(producto) {
    try {
        const response = await fetch('http://localhost:8080/productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(producto)
        });
        
        if (!response.ok) {
            throw new Error(`Error al crear producto: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error al crear producto:`, error);
        throw error;
    }
}

// Enviar productos a la API uno por uno
async function enviarProductosAPI() {
    const resultados = {
        exitosos: 0,
        fallidos: 0,
        errores: []
    };
    
    // Procesar cada producto individualmente
    for (const producto of processedData) {
        try {
            await crearProducto(producto);
            resultados.exitosos++;
        } catch (error) {
            resultados.fallidos++;
            resultados.errores.push(`${producto.marca} ${producto.modelo}: ${error.message}`);
        }
    }
    
    return resultados;
}