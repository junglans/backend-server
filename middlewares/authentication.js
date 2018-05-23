 var Constants = require('../lib/constants');
 var Config = require('../lib/config');
 var jwt = require('jsonwebtoken');


 //----------------------------
 // Verificar token.
 //----------------------------
 exports.verifyToken = function(req, res, next) {

     var token = req.query.token;
     if (!token) {
         return res.status(Constants.HTTP_UNAUTHORIZED).json({
             ok: false,
             message: 'Token inválido.',
             errors: { message: 'Token inválido.' }
         });
     }

     jwt.verify(token, Config.JWT_SEED, (err, decoded) => {
         if (err) {
             return res.status(Constants.HTTP_UNAUTHORIZED).json({
                 ok: false,
                 message: 'Token inválido.',
                 errors: err
             });
         }
         next();
     });

 };