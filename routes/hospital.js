var express = require('express');
var app = express();

var HTTP_OK = require('../lib/constants').HTTP_OK;
var HTTP_CREATED = require('../lib/constants').HTTP_CREATED;
var HTTP_BAD_REQUEST = require('../lib/constants').HTTP_BAD_REQUEST;
var HTTP_INTERNAL_SERVER_ERROR = require('../lib/constants').HTTP_INTERNAL_SERVER_ERROR;
var mdAuthentication = require('../middlewares/authentication');
var Hospital = require('../models/hospital');
// ----------------------------
// Obtener todos los hospitales
// ----------------------------
app.get('/', (req, res) => {
    var from = Number(req.query.from || 0);
    Hospital.find({})
        .skip(from)
        .limit(5)
        .populate('user', 'name email')
        .exec((err, hospitals) => {
            if (err) {
                res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                    ok: false,
                    message: 'Error cargando hospitales!!',
                    errors: err
                });
            }

            Hospital.count({}, (err, count) => {
                res.status(HTTP_OK).json({
                    ok: true,
                    message: 'Petición correcta',
                    hospitals: hospitals,
                    total: count
                });
            });

        });
});
// ------------------------------
// Obtener un hospital por su id
// ------------------------------
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id).populate('user', 'name email').exec((err, hospital) => {
        if (err) {
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                ok: false,
                message: 'Error cargando hospitales!!',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(HTTP_BAD_REQUEST).json({
                ok: false,
                message: 'No se pudo encontrar el hospital con id: ' + id,
                errors: { message: 'No se pudo encontrar el hospital por su id' }
            });
        }

        res.status(HTTP_OK).json({
            ok: true,
            message: 'Petición correcta',
            hospital: hospital
        });
    })

});
// ------------------------------
// Crear un hospital
// ------------------------------
app.post('/', [mdAuthentication.verifyToken, mdAuthentication.verifyAdminToken], (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        name: body.name,
        img: body.img,
        user: body.user
    });

    Hospital.create(hospital, (err, newHospital) => {
        if (err) {
            var httpStatus = HTTP_INTERNAL_SERVER_ERROR;
            if (err.name === 'ValidationError') {
                httpStatus = HTTP_BAD_REQUEST;
            }
            return res.status(httpStatus).json({
                ok: false,
                message: 'Error creando hospital.',
                errors: err
            });
        }

        res.status(HTTP_CREATED).json({
            ok: true,
            message: 'Petición correcta',
            hospital: newHospital
        });
    });
});
// ------------------------------
// Actualizar un hospital
// ------------------------------
app.put('/:id', [mdAuthentication.verifyToken, mdAuthentication.verifyAdminToken], (req, res) => {

    var id = req.params.id;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                ok: false,
                message: 'Error actualizando hospital.',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(HTTP_BAD_REQUEST).json({
                ok: false,
                message: 'El Hospital con el id: ' + id + ' no existe.',
                errors: { message: 'No existe el Hospital con ese ID' }
            });
        }

        hospital.name = req.body.name;
        hospital.img = req.body.img;
        hospital.user = req.body.user;

        hospital.save((err, updatedHospital) => {
            if (err) {
                return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                    ok: false,
                    message: 'Error actualizando hospital.',
                    errors: err
                });
            }
            res.status(HTTP_OK).json({
                ok: true,
                message: 'Petición correcta',
                hospital: updatedHospital
            });
        });

    });
});

// ------------------------------
// Borrar un hospital
// ------------------------------
app.delete('/:id', [mdAuthentication.verifyToken, mdAuthentication.verifyAdminToken], (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, deletedHospital) => {
        if (err) {
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                ok: false,
                message: 'Error borrando hospital.',
                errors: err
            });
        }

        if (!deletedHospital) {
            return res.status(HTTP_BAD_REQUEST).json({
                ok: false,
                message: "No existe un hopital con ese ID",
                errors: { message: "No existe un hospital con ese ID" }
            });
        }

        res.status(HTTP_OK).json({
            ok: true,
            message: 'Petición correcta',
            hospital: deletedHospital
        });
    });
});
module.exports = app;