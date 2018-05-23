var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var Constants = require('../lib/constants');
var Config = require('../lib/config');
var User = require('../models/user');

var app = express();

app.post('/', (req, res) => {

    var body = req.body;

    User.findOne({ email: body.email }, (err, user) => {

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
                message: 'Credenciales incorrectas.',
                errors: { message: 'Credenciales incorrectas.' }
            });
        }

        if (!bcrypt.compareSync(body.password, user.password)) {
            return res.status(Constants.HTTP_BAD_REQUEST).json({
                ok: false,
                message: 'Credenciales incorrectas.',
                errors: { message: 'Credenciales incorrectas.' }
            });
        }
        //  Crear un token!!
        user.password = ";)";
        var token = jwt.sign({ user: user }, Config.JWT_SEED, { expiresIn: 14400 }); // 4 horas
        res.status(Constants.HTTP_OK).json({
            ok: true,
            message: "Petición login correcta",
            token: token,
            user: user
        });
    });


});

module.exports = app;