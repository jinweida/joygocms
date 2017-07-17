var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UploadsSchema = new Schema({
    title: { type: String, required: '标题是必填项!' },//标题
    desc: { type: String,default:'' },//描述
    content: { type: String },//正文   
    createtime: { type: Date, default: Date.now },//发布时间
    type: {type:Number,default:1},//1=图片 2=视频
    path: {type:String,default:''},//视频路径
    status: { type: Number, default: 0 },//状态 1=已审核 0=转码中 -1=转码失败
    columnid: { type: Number, ref:'columns',default: -1 },//栏目id
    mpno: {type:String,default:''},//所属用户id 来自客户端用户中心
});

exports.uploads = mongoose.model('uploads', UploadsSchema);
