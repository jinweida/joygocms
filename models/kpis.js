var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var KpisSchema = new Schema({
    title: { type: String, default: '' },
    unit: { type: String, default: '' },
    job: { type: String, default: '' },
    position: { type: String, default: '' },
    de: { type: Number, default: 0 },
    neng: { type: Number, default: 0 },
    ji: { type: Number, default: 0 },
    lian: { type: Number, default: 0 },
    qin: { type: Number, default: 0 },
    renyuan: { type: Number, default: 0 },
    yewu: { type: Number, default: 0 },
    dangqun: { type: Number, default: 0 },
    jiangli: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    year: { type: Number, default: 0 },
    month: { type: Number, default: 0 },
    type: { type: Number, default: 0 },//0=个人 1=单位
    modelunit: { type: Number, default: 0 } ,//标兵 1=是 0=否
    advanced:{type:Number,default:0},//先进 1=是 0=否
    veto:{type:Number,default:0},//一票否决 1=是 0=否
    author:{type:String,default:''},
    createtime: { type: Date, default: Date.now }
});
exports.kpis = mongoose.model('kpis', KpisSchema);