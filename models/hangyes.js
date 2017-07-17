var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HangyesSchema = new Schema({
    id: { type: Number },
    name: { type: String },
    order: { type: Number },
});
exports.hangyes = mongoose.model('hangyes', HangyesSchema);