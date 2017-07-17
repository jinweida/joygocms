var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RegsSchema = new Schema({
    mpno:{ type: String, default: '' },
    code:{ type: Number, default: 0 },
    name: { type: String,required: "姓名是必须的" },
    sex: { type: String, default: '' },
    birthday: { type: String, default: '' },
    place: { type: String, default: '' },
    nation:{ type: String, default: '' },
    edu:{ type: String, default: '' },
    idnumber:{ type: String, default: '' },
    phone:{ type: String, default: '' },
    address:{type:String,default:''},
    resume:{type:String,default:''},
    pics:{type:String,default:''},
    height:{type:String,default:''},//身高
    occupation:{type:String,default:''},//职业
    specialty:{type:String,default:''},//特长
    school:{type:String,default:''},//毕业院校
    mark:{type:String,default:''},
    group:{type:String,default:''},//组类型
    createtime:{type:Date,default:Date.now}
});
exports.regs = mongoose.model('regs', RegsSchema);

var AwardsSchema = new Schema({
    no:{type:String,default:''},
    mpno:{type:String,default:''},
    result:{type:String,default:''},
    createtime:{type:String,default:''},
});
exports.awards = mongoose.model('awards', AwardsSchema);

var RankingSchema = new Schema({
    user:{type:String,default:''},
    name:{type:String,default:''},
    mpno:{type:String,default:''},
    result:{type:String,default:''},
    createtime:{type: Date, default: Date.now}
});
exports.ranking = mongoose.model('ranking', RankingSchema);