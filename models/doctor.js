var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var doctorSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre es un campo obligatorio.']
    },
    img: {
        type: String,
        required: false
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El id del usuario es un campo obligatorio.']
    },
    hospital: {
        type: Schema.Types.ObjectId,
        ref: 'Hospital',
        required: [true, 'El id del hospital es un campo obligtorio.']
    }
}, { collection: 'doctors' });

module.exports = mongoose.model('Doctor', doctorSchema);