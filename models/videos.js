var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VideosSchema = new Schema({
    title: { type: String ,default:''},
    desc: { type: String, default: '' },
    content: { type: String , default: ''},
    tag: { type: String, default: '' },
    video: { type: String, default: '' },
    originalvideo: { type: String, default: '' },//原视频地址
    type: {type:Number,default:1},//1=图片 2=视频
    from:{type:String,default:0},//来源 0=cds 1=编辑上传 2=拍客上传
    pics: { type: String,default:'' },//缩略图
    createtime :{type:Date,default:Date.now},
    status: { type: Number, default: 0 },//状态2=已审核 1=待审核 0=转码中 -1=转码失败
    columnid: { type: Number, ref:'columns',default: -1 },//栏目id
    mpno: {type:String,default:''},//所属用户id 来自客户端用户中心
});
exports.videos = mongoose.model('videos', VideosSchema);