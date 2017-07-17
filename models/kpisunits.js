var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var kpisunitsSchema = new Schema({    
    title: { type: String, default: '' },
    createtime: { type: Date, default: Date.now }
});
exports.kpisunits = mongoose.model('kpisunits', kpisunitsSchema);