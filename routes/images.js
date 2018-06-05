var express = require('express');
var HTTP_OK = require('../lib/constants').HTTP_OK;
var fs = require('fs');
var path = require('path');

var app = express();

app.get('/:type/:image', (req, res, next) => {


    const type = req.params.type;
    const image = req.params.image;

    const imagePath = path.resolve(__dirname, `../uploads/${type}/${image}`);

    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        res.sendFile(path.resolve(__dirname, '../assets/no-img.png'));
    }

});

module.exports = app;