var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CountersSchema = new Schema({
    _id: { type: String },
    seq: { type: Number},
});
exports.counters = mongoose.model('counters', CountersSchema);