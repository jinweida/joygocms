var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cloudFile = new Schema({
     sid: { type: String,default:'' },//上架ID
     cid: { type: String,default:'' },//上架那个栏目
});
exports.cloudfile = mongoose.model('cloudfile', cloudFile);