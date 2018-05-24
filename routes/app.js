var express = require('express');
var HTTP_OK = require('../lib/constants').HTTP_OK;

var app = express();

app.get('/', (req, res, next) => {
    res.status(HTTP_OK).json({
        ok: true,
        message: "Petición correcta"
    });

});

module.exports = app;