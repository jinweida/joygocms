var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ActivitysSchema = new Schema({
    mid: { type: String,ref:'posts',default:'' },
    title: {type:String,default:''},//活动名称
    fullname: { type: String , default: ''},//姓名
    sex: { type: String, default: '男' }, //
    card: { type: String, default: ''},//身份证号
    phone:{type:String,default:''},//手机号
    mpno: { type: String, default: '' },//用户ID
    createtime: { type: Date, default: Date.now }
});

exports.activitys = mongoose.model('activitys', ActivitysSchema);