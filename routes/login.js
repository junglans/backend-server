var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const JWT_SEED = require('../lib/config').JWT_SEED;

// Google authentication
const CLIENT_ID = require('../lib/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

var User = require('../models/user');

// HTTP Return codes...
const HTTP_OK = require('../lib/constants').HTTP_OK;
const HTTP_BAD_REQUEST = require('../lib/constants').HTTP_BAD_REQUEST;
const HTTP_INTERNAL_SERVER_ERROR = require('../lib/constants').HTTP_INTERNAL_SERVER_ERROR;
var app = express();
// ===========================
// Login normal
// ===========================
app.post('/', (req, res) => {

    var body = req.body;

    User.findOne({ email: body.email }, (err, user) => {

        if (err) {
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                ok: false,
                message: "Error buscando usuario.",
                errors: err
            });
        }

        if (!user) {
            return res.status(HTTP_BAD_REQUEST).json({
                ok: false,
                message: 'Credenciales incorrectas.',
                errors: { message: 'Credenciales incorrectas.' }
            });
        }

        if (!bcrypt.compareSync(body.password, user.password)) {
            return res.status(HTTP_BAD_REQUEST).json({
                ok: false,
                message: 'Credenciales incorrectas.',
                errors: { message: 'Credenciales incorrectas.' }
            });
        }
        //  Crear un token!!
        user.password = ";)";
        var token = jwt.sign({ user: user }, JWT_SEED, { expiresIn: 14400 }); // 4 horas
        res.status(HTTP_OK).json({
            ok: true,
            message: "Petición login correcta",
            token: token,
            user: user
        });
    });


});
// ===========================
// Login google
// ===========================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        userid: userid,
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

app.post('/google', async(req, res) => {

    var token = req.body.token;

    // Verificamos el token contra el api de google.
    var googleUser = await verify(token)
        .catch(error => {
            return res.status(HTTP_BAD_REQUEST).json({
                ok: false,
                message: 'Credenciales incorrectas.',
                errors: error
            });
        });

    // Una vez verificado buscamos el usuario en nuestro momgodb a través de su email.
    User.findOne({ email: googleUser.email }, (err, userDB) => {

        if (err) {
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                ok: false,
                message: "Error buscando usuario.",
                errors: err
            });
        }

        if (!userDB) { // si no existe el usuario se guarda en la base de datos.

            var user = new User({

                name: googleUser.nombre,
                email: googleUser.email,
                img: googleUser.img,
                password: ';)',
                google: true

            });

            user.save((err, userStored) => {

                if (err) {
                    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                        ok: false,
                        message: "Error insertando usuario.",
                        errors: err
                    });
                }
                var token = jwt.sign({ user: userDB }, JWT_SEED, { expiresIn: 14400 }); // 4 horas
                return res.status(HTTP_OK).json({
                    ok: true,
                    message: 'Solicitud correcta!!',
                    token: token,
                    user: userStored,
                });

            });

        } else {

            if (!userDB.google) {
                return res.status(HTTP_BAD_REQUEST).json({
                    ok: false,
                    message: 'Debe usar la autenticación de usuario/password.',
                    errors: { message: 'Debe usar la autenticación de usuario/password.' }
                });
            }
            var token = jwt.sign({ user: userDB }, JWT_SEED, { expiresIn: 14400 }); // 4 horas
            res.status(HTTP_OK).json({
                ok: true,
                message: "Petición login correcta",
                token: token,
                user: userDB
            });

        }

    });

});

module.exports = app;