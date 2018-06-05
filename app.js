// Requires. Importación de librerías.
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
// Inicializar variables
var app = express();


// Activate CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS");
    next();
});
// Body parser 
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// conexión a la base de datos.
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Database running on port 27017: \x1b[32m%s\x1b[0m', 'online');
});

// importar rutas
var uploadRoutes = require('./routes/upload');
var searchRoutes = require('./routes/search');
var doctorRoutes = require('./routes/doctor');
var hospitalRoutes = require('./routes/hospital');
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginRoutes = require('./routes/login');
var imgRoutes = require('./routes/images');


// Rutas
app.use('/img', imgRoutes);
app.use('/upload', uploadRoutes);
app.use('/search', searchRoutes);
app.use('/doctor', doctorRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/user', userRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

//Inicializamos el servidor. Escuchar peticiones.
app.listen(3000, () => {

    console.log('Express server running on port 3000: \x1b[32m%s\x1b[0m', 'online');

});