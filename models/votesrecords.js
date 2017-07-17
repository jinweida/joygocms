var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VotesRecordsSchema = new Schema({
    vid:{type:String,default:''},//投票id
    rid:{type:String,default:''},//投票选项id
    mpno:{type:String,default:''},
    createtime: { type: Date, default: Date.now },//发布时间
});

exports.votesrecords = mongoose.model('votesrecords', VotesRecordsSchema);
