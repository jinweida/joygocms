var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AppstatusSchema = new Schema({
    key:{string:String,default:''},
    ver: {type: String,default:''},
    os:{type:String,default:''},
    project:{type:String,default:''}
});
exports.appstatus = mongoose.model('appstatus', AppstatusSchema);