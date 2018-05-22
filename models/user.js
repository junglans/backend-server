var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
        default: 'USER_ROLE'
    },

});

module.exports = mongoose.model("User", userSchema);