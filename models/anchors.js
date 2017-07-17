  //主播秀
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AnchorsSchema = new Schema({
    name: { type: String, default: '', required: '别名是必填项!' },//别名
    mpno: { type: String, default: '', required: '手机号是必填项!' },//手机号
    aword: { type: String, default: '' },//一句话
    signature:{type:String,default:''},//签名
    content: { type: String, default: '' },
    face: { type: String, default: '' },//主播个人头像
    pics: { type: String, default: '' },//主播照片封面
    background:{ type: String, default: '' },//主播主页照片
    dynamiccount:{type:Number,default:0},//动态数
    slidescount:{type:Number,default:0},//照片数
    answercount: {type:Number,default:0},//回答数
    questionscount:{type:Number,default:0},//提问数
    askedcount:{type:Number,default:0},//被问数
    slides:[{
        _id:false,
        pics:{type:String,default:''},//图片路径
        iscover:{type:Boolean,default:false}//是否为封面
    }],//主播照片
    status:{type:Number,default:0},//状态
    assistcount: { type: Number , default: 0 },//点赞总数
    user_like_this_post: [{
        _id: false,
        mpno: { type: String, default: '' }//点过赞的用户
    }],
    createtime: { type: Date, default: Date.now }
});
exports.anchors = mongoose.model('anchors', AnchorsSchema);