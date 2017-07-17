  //主播秀
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AnchorsdynamicsSchema = new Schema({
    anchorsid:{type:String,ref:'anchors',default:''},//主播id
    face: { type: String, default: '' },//主播个人头像
    content: { type: String, default: '' },//内容
    assistcount:{type:Number,default:0},//点赞数
    commentcount:{type:Number,default:0},//评论数
    slides:[{
        _id:false,
        type:{type:String,default:1},//1=图片 2=视频
        pics:{type:String,default:''},//图片路径
    }],//主播照片
    user_like_this_post: [{
        _id: false,
        mpno: { type: String, default: '' }//点过赞的用户
    }],
    status:{type:Number,default:0},//状态 0=正常 -1=删除
    createtime: { type: Date, default: Date.now }
});
exports.anchorsdynamics = mongoose.model('anchorsdynamics', AnchorsdynamicsSchema);