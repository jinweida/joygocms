var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AreasSchema = new Schema({
    id: { type: String },
    pid: { type: Number},
    name: { type: String },
    pinyin: { type: String },
    order: { type: Number },
    capital: { type: Number }
});
exports.areas = mongoose.model('areas', AreasSchema);