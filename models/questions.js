//提问
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var QuestionsSchema = new Schema({
    content: { type: String, default: '' },//问题内容
    files:[{
        _id:false,
        pics:{type:String,default:''},//图片路径
        url:{type:String,default:''},//文件地址
        type:{type:Number,default:''},//类型
    }],//问题图片
    publishmpno:{type:String,default:''},//提问人id
    publishusername:{type:String,default:''},//提问名字
    publishuserface:{type:String,default:''},//提问人头像
    questiontype:{type:String,default:''},//问题分类
    questionvtype:{type:String,default:0},//1为问吧提问 0为默认值
    answermpno:{type:String,default:''},//被问人id
    answerusername:{type:String,default:''},//被问人名字
    answeruserface:{type:String,default:''},//被问人头像
    answercontent:{type:String,default:''},//被问人的回答，最后一条
    answercount:{type:Number,default:0},//回答人数
    answerrecordcount:{type:Number,default:0},//回答记录总数
    isanswered:{type:Number,default:0},//是否已经回答了 0=未回答 1=已回答
    status:{type:Number,default:0},//状态 0=正常 -1=删除
    lasttime:{type:Date,default:Date.now},//最后回答时间
    createtime: { type: Date, default: Date.now }
});
exports.questions = mongoose.model('questions', QuestionsSchema);