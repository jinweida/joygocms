var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FeedbacksSchema = new Schema({
    mpno: { type: String,default:''},
    from:{type:Number,default:-1}, //默认-1 个人中心来的 0=问答 1=微直播
    content: { type: String ,default:''},
    contact:{type:String,default:''},
    feedbacktype:{type:String,default:''},
    reply:{
      content:{type:String,default:''},
      author:{type:String,default:''},
      replytime :{type:Date,default:Date.now},
    },
    createtime :{type:Date,default:Date.now},
});
exports.feedbacks = mongoose.model('feedbacks', FeedbacksSchema);