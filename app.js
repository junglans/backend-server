// Requires. Importación de librerías.
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

// conexión a la base de datos.
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Database running on port 27017: \x1b[32m%s\x1b[0m', 'online');
});

// importar rutas
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');


// Rutas
app.use('/user', userRoutes);
app.use('/', appRoutes);

//Inicializamos el servidor. Escuchar peticiones.
app.listen(3000, () => {

    console.log('Express server running on port 3000: \x1b[32m%s\x1b[0m', 'online');

});