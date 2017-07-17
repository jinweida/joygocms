//提问
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var QandaSchema = new Schema({
    questionid:{ type: Schema.ObjectId,ref:'questions', },//问题编号
    answermpno:{type:String,default:''},//被问人id
    createtime: { type: Date, default: Date.now }
});
exports.qandas = mongoose.model('qandas', QandaSchema);