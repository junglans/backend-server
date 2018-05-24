// ==========================
// Hospital schema
// ==========================
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');

var hospitalSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'El nombre es un campo obligatorio']
    },
    img: {
        type: String,
        required: false
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { collection: 'hospitals' });

hospitalSchema.plugin(uniqueValidator, { message: 'El campo {PATH} debe ser un valor único.' })
module.exports = mongoose.model('Hospital', hospitalSchema);