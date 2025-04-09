function renderInventoryForm(respuesta) {
    // Obtener el texto de respuesta almacenado en localStorage
    const responseText = localStorage.getItem('responseText');

    const formHTML = `
    <header class="header">
    <a href="#" class="header__logo">Instituto Mexicano del Transporte</a>

    <ion-icon name="menu-outline" class="header__toggle" id="nav-toggle"></ion-icon>

    <nav class="nav" id="nav-menu">
        <div class="nav__content bd-grid">

            <ion-icon name="close-outline" class="nav__close" id="nav-close"></ion-icon>

            <div class="nav__perfil">
                <div class="nav__img">
                    <img src="../media/IMT_logo.png" alt="">
                </div>
                
                <div>
                    <a href="#" class="nav__name">Instituto Mexicano del Transporte</a>
                </div>
            </div>

            <div class="nav__menu">
                <ul class="nav__list">
                    <li class="nav__item"><a href="index.html" class="nav__link">Home</a></li>
                    <li class="nav__item"><a href="inventario.html" class="nav__link active">Inventario</a></li>
                    <li class="nav__item"><a href="salas.html" class="nav__link">Salas</a></li>
                    <li class="nav__item"><a href="newQR.html" class="nav__link">Generar QR</a></li>
                    <li class="nav__item"><a href="#" class="nav__link">Reportes</a></li>
                </ul>
            </div>
        </div>
    </nav>
</header>
        <h2>Registro de Inventario</h2>
        <form action="/submit-inventory" method="post" id="inventory-form">
            <label for="unique-id">Identificador Único:</label>
            <p id="unique-id">${respuesta}</p><br><br>

            <label for="category">Categoría:</label>
            <select id="category" name="category" required>
                <option value="equipo-de-computo">Equipo de Cómputo</option>
                <option value="mobiliario">Mobiliario</option>
                <option value="redes">Redes</option>
                <option value="software">Software</option>
            </select><br><br>

            <label for="brand">Marca:</label>
            <input type="text" id="brand" name="brand" required><br><br>

            <label for="model">Modelo:</label>
            <input type="text" id="model" name="model" required><br><br>

            <label for="status">Estado:</label>
            <input type="text" id="status" name="status" required><br><br>


            <label for="description">Descripción detallada:</label>
            <textarea id="description" name="description" required></textarea><br><br>

            <label for="precio">Precio:</label>
            <input type="text" id="precio" name="precio" required><br><br>

           
            <label for="location">Ubicación:</label>
            <input type="text" id="location" name="location" required><br><br>

            <button type="submit">Enviar</button>

        </form>

        <button id="buttonHome" onclick="buttonHome()">Regresar</button>
        <!-- ===== JS ===== -->
        <script src="assets/js/form.js"></script>
        <script src="assets/js/salas.js"></script>
        <script src="assets/js/newQR.js"></script>
        <script src="assets/js/header.js"></script>
        
        <script src="assets/js/index.js"></script>
    `;

    //Insertar el formulario en un contenedor específico
    //const container = document.getElementById('form-container');
    //container.innerHTML = formHTML;

    document.body.innerHTML = formHTML;
}

// Llamar a la función para renderizar el formulario
//renderInventoryForm('Texto de respuesta del código QR');