# Sistema de Gestión de Inventario con QR

Este proyecto es una aplicación web para gestión de inventario que permite registrar y controlar productos utilizando códigos QR para su identificación. Cuenta con funcionalidades para crear, leer, actualizar y eliminar (CRUD) productos e ítems de inventario, además de generar y escanear códigos QR.

## 🚀 Características principales

- Registro y gestión de productos con información detallada
- Control de inventario con estado físico, estado operativo y observaciones
- Generación de códigos QR para la identificación rápida de productos
- Escaneo de códigos QR mediante la cámara del dispositivo
- Importación masiva de productos desde archivos Excel
- Exportación de datos en formato JSON
- Interfaz responsiva y amigable con el usuario

## 📋 Estructura del proyecto

El proyecto está construido con [Astro](https://astro.build/), con la siguiente estructura de archivos:

```
/
├── public/
│   ├── favicon.svg
│   └── media/             # Imágenes y archivos multimedia
├── src/
│   ├── assets/            # Recursos estáticos
│   ├── components/        # Componentes reutilizables
│   ├── css/               # Estilos CSS
│   ├── js/                # Scripts JavaScript
│   │   ├── app.js         # Generación básica de QR
│   │   ├── DataTables.js  # Manejo de tablas de datos
│   │   ├── ExcelToJson.js # Conversión de Excel a JSON
│   │   ├── form.js        # Formularios de inventario
│   │   ├── index.js       # Funcionalidad principal y escaneo QR
│   │   └── newQR.js       # Generación avanzada de códigos QR
│   ├── layouts/           # Plantillas de diseño
│   └── pages/             # Páginas de la aplicación
└── package.json           # Dependencias y scripts
```

## 🔧 Tecnologías utilizadas

- **Frontend:**
  - [Astro](https://astro.build/) - Framework web
  - [HTML/CSS/JavaScript](https://developer.mozilla.org/es/docs/Web) - Tecnologías web estándar
  - [SweetAlert2](https://sweetalert2.github.io/) - Alertas y diálogos personalizados
  - [DataTables](https://datatables.net/) - Tablas interactivas
  - [QRCode.js](https://davidshimjs.github.io/qrcodejs/) - Generación de códigos QR
  - [jsQR](https://github.com/cozmo/jsQR) - Lectura de códigos QR
  - [html2canvas](https://html2canvas.hertzen.com/) - Capturas de elementos HTML

- **Herramientas de desarrollo:**
  - [pnpm](https://pnpm.io/) - Gestor de paquetes
  - [SheetJS](https://sheetjs.com/) - Procesamiento de archivos Excel

## 🛠️ Instalación y configuración

1. Clona este repositorio:
```sh
git clone <URL-del-repositorio>
cd FrontInventario/Astro
```

2. Instala las dependencias con pnpm:
```sh
pnpm install
```

3. Instala las librerías adicionales necesarias:
```sh
pnpm add sweetalert2 datatables qrcodejs jsqr html2canvas xlsx
```

4. Ejecuta el servidor de desarrollo:
```sh
pnpm dev
```

5. Accede a la aplicación en http://localhost:4321

## 🧞 Comandos disponibles

| Comando                   | Acción                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`            | Instala dependencias                             |
| `pnpm dev`                | Inicia servidor local en `localhost:4321`        |
| `pnpm build`              | Construye el sitio para producción en `./dist/`  |
| `pnpm preview`            | Previsualiza la versión de producción localmente |
| `pnpm astro ...`          | Ejecuta comandos CLI como `astro add`, `check`   |

## 📱 Uso básico de la aplicación

1. **Crear un nuevo producto:** Utiliza el botón "Ingresar Nuevo Producto" y completa el formulario.

2. **Escanear QR:** Utiliza la función de escaneo para identificar productos mediante su código QR.

3. **Generar QR:** Después de crear un producto, genera su código QR para su posterior identificación.

4. **Importar productos:** Utiliza la función de importación Excel para cargar múltiples productos.

5. **Gestionar inventario:** Actualiza el estado y la información de los productos existentes.

## 🔄 API Backend

La aplicación se comunica con un backend a través de los siguientes endpoints:

- `http://localhost:8080/productos` - Gestión de productos
- `http://localhost:8080/inventario` - Gestión de inventario

## 👥 Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue o realiza un pull request para sugerir cambios o mejoras.

## 📄 Licencia

MIT

---

Desarrollado como parte de un proyecto para el Instituto Mexicano del Transporte.