var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VotesSchema = new Schema({
    title:{type:String,default:''},
    desc:{type:String,default:''},
    pics:{type:String,default:''},
    content: { type: String ,default:''},//正文
    type:{type:Number,default:0},//0=单选 1=多选 2=单选pk 3=图片 可扩展
    endtime: { type: Date, default: Date.now },//投票结束日期
    count:{type:Number,default:0},//投票参与人数
    totalvotes:{type:Number,default:0},//总票数
    list:[
        {
            pics:{type:String,default:''},//投票项图片
            title:{type:String,default:''},//投票项标题
            count:{type:Number,default:0},//投票项数
            percent:{type:String,default:''},//百分比
        },
    ],
    createtime: { type: Date, default: Date.now },//发布时间
});

exports.votes = mongoose.model('votes', VotesSchema);
