var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AdsSchema = new Schema({
    nickname: { type: String,default: '' },//用户昵称
    content: { type: String, default: '' },//回复内容
    title: { type: String, default: '' },//回复内容
    mid: { type: String, default: '' },//活动id
    createtime:{type:Date,default:Date.now}
});
exports.livemessage = mongoose.model('livemessage', AdsSchema);