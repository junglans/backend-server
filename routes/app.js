var express = require('express');
var Constants = require('../lib/constants');

var app = express();

app.get('/', (req, res, next) => {
    res.status(Constants.HTTP_OK).json({
        ok: true,
        message: "Petición correcta"
    });

});

module.exports = app;