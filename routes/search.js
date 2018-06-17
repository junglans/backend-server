var express = require('express');
var HTTP_OK = require('../lib/constants').HTTP_OK;
var HTTP_BAD_REQUEST = require('../lib/constants').HTTP_BAD_REQUEST;
var HTTP_INTERNAL_SERVER_ERROR = require('../lib/constants').HTTP_INTERNAL_SERVER_ERROR;


var User = require('../models/user');
var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');

var app = express();
// ---------------------
// Búsqueda general
// ---------------------
app.get('/all/:criteria', (req, res) => {

    var criteria = req.params.criteria;
    var regex = new RegExp(criteria, 'i');

    Promise.all(
        [
            searchHospitals(req, regex),
            searchUsers(req, regex),
            searchDoctors(req, regex)
        ]
    ).then((result) => {
        res.status(HTTP_OK).json({
            ok: true,
            message: 'Petición realizada correctamente',
            hospitals: result[0],
            users: result[1],
            doctors: result[2]
        });
    }).catch((err) => {
        res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            message: 'Se ha producido un error.',
            errors: err
        });
    });
});
// ---------------------
// Búsqueda por colección
// ---------------------
app.get('/entity/:entity/:criteria', (req, res) => {

    var entity = req.params.entity;
    var criteria = req.params.criteria;

    var regex = new RegExp(criteria, 'i');

    var funct = null;
    switch (entity) {
        case 'users':
            funct = searchUsers;
            break;
        case 'doctors':
            funct = searchDoctors;
            break;
        case 'hospitals':
            funct = searchHospitals;
            break;
        default:
            return res.status(HTTP_BAD_REQUEST).json({
                ok: false,
                message: 'Se ha producido un error.',
                errors: { message: 'Se ha producido un error.' }
            });
    }

    funct(req, regex).then((result) => {
        res.status(HTTP_OK).json({
            ok: true,
            message: 'Petición realizada correctamente',
            [entity]: result.records,
            total: result.total
        });
    }).catch((err) => {
        res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            message: 'Se ha producido un error.',
            errors: err
        });
    });

});

function searchUsers(req, regex) {
    var from = Number(req.query.from || 0);
    console.log("FROM :" + from);
    return new Promise((resolve, reject) => {
        User.find({}, '-password')
            .or([{ name: regex }, { email: regex }])
            .skip(from)
            .limit(5)
            .exec((err, result) => {
                if (err) {
                    reject({ message: 'Error buscando usuarios', errors: err });
                } else {
                    User.count()
                        .or([{ name: regex }, { email: regex }])
                        .exec({}, (err, count) => {
                            resolve({ records: result, total: count });
                        });;
                }
            })
    });
}

function searchHospitals(req, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ name: regex }).populate('user', '-password').exec((err, result) => {
            if (err) {
                reject({ message: 'Error buscando hospitales', errors: err });
            } else {
                resolve(result);
            }
        })
    });
}

function searchDoctors(req, regex) {
    return new Promise((resolve, reject) => {
        Doctor.find({ name: regex })
            .populate('user', '-password')
            .populate('hospital')
            .exec((err, result) => {
                if (err) {
                    reject({ message: 'Error buscando médicos', errors: err });
                } else {
                    resolve(result);
                }
            })
    });
};

module.exports = app;