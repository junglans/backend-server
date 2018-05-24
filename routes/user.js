var express = require('express');
var bcrypt = require('bcryptjs');


var app = express();

var User = require('../models/user');
var Constants = require('../lib/constants');
var Config = require('../lib/config');
var mdAuthetication = require('../middlewares/authentication');
//----------------------------
// Obtener todos los usuarios.
//----------------------------
app.get('/', (req, res, next) => {
    User.find({}, '-password').exec((err, users) => {
        //  User.find({}, '_id, name email img role').exec((err, users) => {

        if (err) {
            return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json({
                ok: false,
                message: "Error cargando usuarios!!",
                errors: err
            });
        }

        res.status(Constants.HTTP_OK).json({
            ok: true,
            users: users
        });
    });
});
//------------------------------
// Obtener un usuario por su id.
//------------------------------
app.get('/:id', (req, res) => {

    var id = req.params.id;
    // Recuperamos el usuario por su id exceptuando el id y la clave.
    User.findById(id, '-_id -password').exec((err, userRead) => {
        if (err) {
            return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json({
                ok: false,
                message: "Error buscando usuario.",
                errors: err
            });
        }

        if (!userRead) {
            return res.status(Constants.HTTP_BAD_REQUEST).json({
                ok: false,
                message: 'El usuario con el id: ' + id + ' no existe.',
                errors: { message: 'No existe el usuario con ese ID' }
            });
        }

        res.status(Constants.HTTP_OK).json({
            ok: true,
            user: userRead
        });
    });
});
//----------------------------
// Crear un nuevo usuario.
//----------------------------
app.post('/', mdAuthetication.verifyToken, (req, res) => {

    var body = req.body; // Esto lo hace el body-parser

    // Movemos los valores que vienen en el body al usuario.
    // Esta variable user viene del modelo user.js
    var salt = bcrypt.genSaltSync(Config.BCRYPT_SALT);

    var user = new User({

        name: body.name,
        email: body.email,
        img: body.img,
        password: bcrypt.hashSync(body.password, salt),
        role: body.role

    });

    // Almacenamos el usuario en mongo
    user.save((err, finalUser) => {

        if (err) {
            var httpStatus = Constants.HTTP_INTERNAL_SERVER_ERROR;
            if (err.name === 'ValidationError') {
                httpStatus = Constants.HTTP_BAD_REQUEST;
            }
            return res.status(httpStatus).json({
                ok: false,
                message: "Error creando usuarios.",
                errors: err
            });
        }

        res.status(Constants.HTTP_CREATED).json({
            ok: true,
            user: finalUser,
            sessionUser: req.sessionUser
        });
    });
});

//----------------------------
// Actualizar un usuario.
//----------------------------
app.put('/:id', mdAuthetication.verifyToken, (req, res) => {

    var id = req.params.id;

    var body = req.body;

    User.findById(id, (err, user) => {

        if (err) {
            return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json({
                ok: false,
                message: "Error buscando usuario.",
                errors: err
            });
        }

        if (!user) {
            return res.status(Constants.HTTP_BAD_REQUEST).json({
                ok: false,
                message: 'El usuario con el id: ' + id + ' no existe.',
                errors: { message: 'No existe el usuario con ese ID' }
            });
        }

        user.name = body.name;
        user.email = body.email;
        user.role = body.role;

        user.save((err, userUpdated) => {
            if (err) {
                return res.status(Constants.HTTP_BAD_REQUEST).json({
                    ok: false,
                    message: "Error actualizando usuario.",
                    errors: err
                });
            }
            userUpdated.password = ';)';
            res.status(Constants.HTTP_OK).json({
                ok: true,
                user: userUpdated
            });
        });

    });

});
//----------------------------
// Borrar un usuario.
//----------------------------
app.delete('/:id', mdAuthetication.verifyToken, (req, res) => {
    var id = req.params.id;

    User.findByIdAndRemove(id).select('name email').exec((err, userDeleted) => {

        if (err) {
            return res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json({
                ok: false,
                message: "Error borrando usuario.",
                errors: err
            });
        }

        if (!userDeleted) {
            return res.status(Constants.HTTP_BAD_REQUEST).json({
                ok: false,
                message: "No existe un usuario con ese ID",
                errors: { message: "No existe un usuario con ese ID" }
            });
        }

        res.status(Constants.HTTP_OK).json({
            ok: true,
            user: userDeleted
        });
    });
});
module.exports = app;