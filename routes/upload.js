var express = require('express');
var fileUpload = require('express-fileupload');
var fileSystem = require('fs');

var HTTP_OK = require('../lib/constants').HTTP_OK;
var HTTP_BAD_REQUEST = require('../lib/constants').HTTP_BAD_REQUEST;
var HTTP_INTERNAL_SERVER_ERROR = require('../lib/constants').HTTP_INTERNAL_SERVER_ERROR;

var User = require('../models/user');
var Doctor = require('../models/doctor');
var Hospital = require('../models/hospital');

var app = express();
app.use(fileUpload());

app.put('/:type/:id', (req, res) => {

    var type = req.params.type;
    var id = req.params.id;

    // Validamos el valor del tipo de entidad sea uno de los
    // siguientes:
    var response = validateType(type, res);
    if (!response.ok) {
        return response;
    }
    // Validamos que se haya subido algún archivo...
    if (!req.files) {
        return res.status(HTTP_BAD_REQUEST).json({
            ok: false,
            message: "No se seleccionó ningún archivo.",
            errors: { message: 'No se seleccionó ningún archivo.' }
        });
    }

    // Obtener el nombre del archivo
    var file = req.files.img;
    var tmp = file.name.split('.');
    var fileExtension = tmp[tmp.length - 1];

    response = validateFileExtension(fileExtension, res);
    if (!response.ok) {
        return response;
    }

    // Nombre del archivo personalizado
    var fileName = `${ id }-${ new Date().getMilliseconds() }.${ fileExtension }`;
    var path = `./uploads/${type}/${fileName}`;

    file.mv(path, function(err) {
        if (err) {
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                ok: false,
                message: "Se produjo un error al mover archivo.",
                errors: err
            });
        }
        assignImage(type, id, fileName, res);
    });


});

function assignImage(type, id, fileName, res) {

    switch (type) {
        case 'users':
            assignImageToUser(id, fileName, res);
            break;
        case 'doctors':
            assignImageToDoctor(id, fileName, res);
            break;
        case 'hospitals':
            assignImageToHospital(id, fileName, res);
            break;
        default:
            break;
    }
}

function assignImageToHospital(id, fileName, res) {
    Hospital.findById(id, (err, hospital) => {

        if (!hospital) {
            return res.status(HTTP_BAD_REQUEST).json({
                ok: false,
                message: 'Hospital inválido.',
                errors: { message: 'Identificador de hospital inválido.' }
            });
        }
        // Borramos el archivo anterior si existe..
        deleteFile('./uploads/hospitals/' + hospital.img);

        hospital.img = fileName;
        hospital.save((err, entity) => {
            if (err) {
                return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                    ok: false,
                    message: "Se produjo un error al actualizar hospital.",
                    errors: err
                });
            }
            res.status(HTTP_OK).json({
                ok: true,
                message: "Petición correcta.",
                user: entity
            });
        });
    });
}

function assignImageToDoctor(id, fileName, res) {
    Doctor.findById(id, (err, doctor) => {
        if (!doctor) {
            return res.status(HTTP_BAD_REQUEST).json({
                ok: false,
                message: 'Doctor inválido.',
                errors: { message: 'Identificador de doctor inválido.' }
            });
        }
        // Borramos el archivo anterior si existe..
        deleteFile('./uploads/doctors/' + doctor.img);

        doctor.img = fileName;
        doctor.save((err, entity) => {
            if (err) {
                return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                    ok: false,
                    message: "Se produjo un error al actualizar doctor.",
                    errors: err
                });
            }
            res.status(HTTP_OK).json({
                ok: true,
                message: "Petición correcta.",
                user: entity
            });

        });
    });
}

function assignImageToUser(id, fileName, res) {

    User.findById(id, (err, user) => {
        if (!user) {
            return res.status(HTTP_BAD_REQUEST).json({
                ok: false,
                message: 'Usuario inválido.',
                errors: { message: 'Identificador de usuario inválido.' }
            });
        }
        // Borramos el archivo anterior si existe..
        deleteFile('./uploads/users/' + user.img);

        user.img = fileName;
        user.save((err, entity) => {
            if (err) {
                return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                    ok: false,
                    message: "Se produjo un error al actualizar usuario.",
                    errors: err
                });
            }
            entity.password = ';)';
            res.status(HTTP_OK).json({
                ok: true,
                message: "Petición correcta.",
                user: entity
            });
        });
    });
}

function validateType(type, res) {
    var validTypes = ['doctors', 'users', 'hospitals'];
    if (validTypes.filter(found => found == type).length === 0) {
        return res.status(HTTP_BAD_REQUEST).json({
            ok: false,
            message: "Tipo de entidad inválido",
            errors: { message: 'No se seleccionó un tipo válido.' }
        });
    } else {
        return { ok: true }
    }
}

function validateFileExtension(fileExtension, res) {
    var validFileType = ['png', 'gif', 'jpg'];

    if (validFileType.filter(found => found === fileExtension).length === 0) {
        return res.status(HTTP_BAD_REQUEST).json({
            ok: false,
            message: "Extension no válida. Valores esperados : gif png jpg",
            errors: { message: 'No se seleccionó un archivo valido.' }
        });
    } else {
        return { ok: true }
    }
}

function deleteFile(path) {
    if (fileSystem.existsSync(path)) {
        fileSystem.unlink(path, (err) => {});
    }
}

module.exports = app;