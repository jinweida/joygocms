var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ScoresSchema = new Schema({
    mid: { type: String, default: '' },
    title: { type: String, default: '' },//技师名字
    mpno: { type: String, default: '' },//手机号    
    num: {type:Number,default:''},
    createtime: { type: Date, default: Date.now }
});

exports.scores = mongoose.model('scores', ScoresSchema);