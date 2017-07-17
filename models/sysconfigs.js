var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SysconfigsSchema = new Schema({
  type:{type:String,default:''},
  name:{type:String,default:''},
  key: { type: String, default: '' },
  val: {type:String,default:''},
  desc:{type:String,default:''},
});
exports.sysconfigs = mongoose.model('sysconfigs', SysconfigsSchema);