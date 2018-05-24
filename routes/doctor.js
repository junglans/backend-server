var express = require('express');
var app = express();

var HTTP_OK = require('../lib/constants').HTTP_OK;
var HTTP_CREATED = require('../lib/constants').HTTP_CREATED;
var HTTP_BAD_REQUEST = require('../lib/constants').HTTP_BAD_REQUEST;
var HTTP_INTERNAL_SERVER_ERROR = require('../lib/constants').HTTP_INTERNAL_SERVER_ERROR;

var mdAuthetication = require('../middlewares/authentication');
var Doctor = require('../models/doctor');
// ---------------------------
// Obtener todos los doctores.
// ---------------------------
app.get('/', (req, res) => {
    var from = Number(req.query.from || 0);
    Doctor.find({})
        .skip(from)
        .limit(5)
        .populate('user', 'name email')
        .populate('hospital')
        .exec((err, doctors) => {

            if (err) {
                return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                    ok: false,
                    mesage: 'Se produjo un error recuperando el listado de doctores',
                    errors: err
                });
            }
            Doctor.count({}, (err, count) => {
                res.status(HTTP_OK).json({
                    ok: true,
                    message: 'Petición realizada',
                    doctors: doctors,
                    total: count
                });
            });

        });

});
// ---------------------------
// Obtener un doctor por su id
// ---------------------------
app.get('/:id', (req, res) => {

    var id = req.params.id;

    Doctor.findById(id)
        .populate('user', 'name email')
        .populate('hospital', 'name')
        .exec((err, doctor) => {

            if (err) {
                return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                    ok: false,
                    mesage: 'Se produjo un error recuperando el doctor',
                    errors: err
                });
            }

            if (!doctor) {
                return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                    ok: false,
                    mesage: 'No se pudo recuperar el doctor con el id:' + id,
                    errors: { message: 'No se pudo recuperar el doctor por su ID.' }
                });
            }

            res.status(HTTP_OK).json({
                ok: true,
                message: 'Petición realizada',
                doctor: doctor
            });

        });


});
// -----------------------
// Crear un doctor
// -----------------------
app.post('/', mdAuthetication.verifyToken, (req, res) => {

    var body = req.body;

    var doctor = new Doctor({
        name: body.name,
        img: body.img,
        user: body.user,
        hospital: body.hospital
    });

    Doctor.create(doctor, (err, doctor) => {

        if (err) {
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                ok: false,
                messge: 'Se ha producido un error creando docotor',
                errors: err
            });
        }
        res.status(HTTP_CREATED).json({
            ok: true,
            message: 'Petición correcta',
            doctor: doctor
        });
    });

});
// -----------------------
// Actualizar un doctor
// -----------------------
app.put('/:id', mdAuthetication.verifyToken, (req, res) => {

    var id = req.params.id;

    Doctor.findById(id, (err, doctor) => {

        if (err) {
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                ok: false,
                messge: 'Se ha producido un error recuperando doctor',
                errors: err
            });
        }

        if (!doctor) {
            return res.status(HTTP_BAD_REQUEST).json({
                ok: false,
                message: 'No existe un doctor con ese ID',
                errors: { message: 'No existe un doctor con ese ID' }
            });
        }

        doctor.name = req.body.name;
        doctor.img = req.body.img;
        doctor.user = req.body.user;
        doctor.hospital = req.body.hospital;

        doctor.save((err, updatedDoctor) => {
            if (err) {
                return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                    ok: false,
                    messge: 'Se ha producido un error actualizando doctor',
                    errors: err
                });
            }
            res.status(HTTP_OK).json({
                ok: true,
                message: 'Petición relizada correctamente.',
                doctor: updatedDoctor
            });
        });
    });
});
// -----------------------
// Borra un doctor
// -----------------------
app.delete('/:id', mdAuthetication.verifyToken, (req, res) => {

    var id = req.params.id;

    Doctor.findByIdAndRemove(id, (err, doctor) => {

        if (err) {
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                ok: false,
                messge: 'Se ha producido un error recuperando doctor',
                errors: err
            });
        }

        if (!doctor) {
            return res.status(HTTP_BAD_REQUEST).json({
                ok: false,
                message: 'No existe un doctor con ese ID',
                errors: { message: 'No existe un doctor con ese ID' }
            });
        }

        res.status(HTTP_OK).json({
            ok: true,
            message: 'Petición relizada correctamente.',
            doctor: doctor
        });

    });
});
module.exports = app;