var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var validRoles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido.'
};

var userSchema = new Schema({

    name: {
        type: String,
        required: [true, 'El nombre es un campo obligatorio']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El email es un campo obligatorio']
    },
    password: {
        type: String,
        required: [true, 'El password es un campo obligatorio']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: [true, 'El rol es un campo obligatorio'],
        default: 'USER_ROLE',
        enum: validRoles
    },

});

userSchema.plugin(uniqueValidator, { message: 'El campo {PATH} debe ser un valor único.' })
module.exports = mongoose.model("User", userSchema);