var mongoose = require('mongoose');
var Schema = mongoose.Schema;
exports.postsalbumslikes = mongoose.model('postsalbumslikes', new Schema({
    plid:{ type: String ,default:''},//投票资源id
    mid: { type: String ,ref:'posts',default:'' },//活动id
    mpno: { type: String, default: '' },//点过赞的用户
    time: { type: Date, default: Date.now },//发布时间
    ip:{type:String,default:""},
    createtime: { type: Date, default: Date.now },//发布时间
  })
);