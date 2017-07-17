var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentsSchema = new Schema({
    mid: {type:String, require:true},
    title:{ type: String, default: '' },//标题
    content: { type: String, default: '' },//评论内容
    nickname: { type: String, default: '' },
    mpno: { type: String, default: '' },
    head: {type:String,default:''},
    createtime: { type: Date, default: Date.now },//创建时间
    status: {type:String,default:0},//0=正常 -1=待审核 1=不通过//逻辑删除
    assistcount: { type: Number, default: 0 },//点赞数
    ip: {type:String,default:''},
    type:{type:Number,defualt:0},//0=文章评论 1=主播动态评论
    assistuser: [{ //点赞的用户
        _id: false,
        mpno: { type: String }
    }]
});

exports.comments = mongoose.model('comments', CommentsSchema);