var express = require('express');

var app = express();

var User = require('../models/user');

app.get('/', (req, res, next) => {

    User.find({}, '_id, name email img role').exec((err, users) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error cargando usuarios!!",
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            users: users
        });
    });


});

module.exports = app;