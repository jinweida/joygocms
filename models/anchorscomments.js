var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AnchorsommentsSchema = new Schema({
    mid: {type:String, require:true},
    content: { type: String, default: '' },//评论内容
    nickname: { type: String, default: '' },
    mpno: { type: String, default: '' },
    head: {type:String,default:''},
    createtime: { type: Date, default: Date.now },//创建时间
    status: {type:String,default:0},//0=正常 -1=待审核 
    assistcount: { type: Number, default: 0 },//点赞数
    ip: {type:String,default:''},
    assistuser: [{ //点赞的用户
        _id: false,
        mpno: { type: String }
    }]
});

exports.anchorscomments = mongoose.model('anchorscomments', AnchorsommentsSchema);