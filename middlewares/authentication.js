 var jwt = require('jsonwebtoken');

 var SEED = require('../lib/config').JWT_SEED;
 var UNAUTHORIZED = require('../lib/constants').HTTP_UNAUTHORIZED;
 //----------------------------
 // Verificar token.
 //----------------------------
 exports.verifyToken = function(req, res, next) {

     var token = req.query.token;
     if (!token) {
         return res.status(UNAUTHORIZED).json({
             ok: false,
             message: 'Token inválido.',
             errors: { message: 'Token inválido.' }
         });
     }

     jwt.verify(token, SEED, (err, decoded) => {
         if (err) {
             return res.status(UNAUTHORIZED).json({
                 ok: false,
                 message: 'Token inválido.',
                 errors: err
             });
         }

         // Incluimos la información del usuario del token en la salida.
         req.sessionUser = decoded.user;
         next();
     });

 };