var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AlysjobsSchema = new Schema({
  pid:{type:String,default:''},//视频 id
  requestid:{type:String,default:''},
  jobid:{type:String,default:''},//作业id
  status:{type:Number,default:0}//0=转码中 1=转码成功
});
exports.alysjobs = mongoose.model('alysjobs', AlysjobsSchema);