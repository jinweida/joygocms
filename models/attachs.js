var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AttachsSchema = new Schema({
    name: {type:String,default:''},
    extension:{type:String,default:''},//文件扩展名
    size:{type:Number,default:0},
    title: { type: String ,default:''},
    desc: { type: String, default: '' },
    content: { type: String , default: ''},
    tag: { type: String, default: '' },
    video: { type: String, default: '' },
    position:{type:String,default:''},//用户上传的位置，需要客户端上传提交
    location:{
        lon:{type:String,default:''},//经度
        lat:{type:String,default:''},//纬度
        address:{type:String,default:''},//地理名字
    },
    originalvideo: { type: String, default: '' },//原视频地址
    type: {type:Number,default:1},//1=图片 2=视频  3音频
    from:{type:Number,default:0},//来源 0=cds 1=编辑上传 2=拍客上传
    pics: { type: String,default:'' },//缩略图
    files:[],
    createtime :{type:Date,default:Date.now},
    status: { type: Number, default: 0 },//状态2=已审核 1=待审核 0=转码中 -1=转码失败 -3=删除 -2=驳回
    columnid: { type: Number, ref:'columns',default: -1 },//栏目id
    author:{type:String,default:''},
    mpno: {type:String,default:''},//所属用户id 来自客户端用户中心
});
exports.attachs = mongoose.model('attachs', AttachsSchema);