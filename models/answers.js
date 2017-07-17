var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AnswersSchema = new Schema({
    questionid:{ type: String,ref:'questions',default: '' },//问题编号
    content: { type: String, default: '' },//回答内容
    files:[{
        _id:false,
        pics:{type:String,default:''},//图片路径
        url:{type:String,default:''},//文件地址
        type:{type:Number,default:''},//类型
    }],//问题图片
    answermpno:{type:String,default:''},//回答人id
    answerusername:{type:String,default:''},//回答人名字
    answeruserface:{type:String,default:''},//回答人头像
    isanchors:{type:Boolean,default:false},//是主播吗？
    assistcount: { type: Number , default: 0 },//点赞总数
    user_like_this_post: [{
        _id: false,
        mpno: { type: String, default: '' }//点过赞的用户
    }],
    createtime: { type: Date, default: Date.now }
});
exports.answers = mongoose.model('answers', AnswersSchema);