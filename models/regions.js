var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RegionsSchema = new Schema({
    level: { type: Number, default: 1 },
    pid: { type: String},//父节点
    name: { type: String },//区域名称
    pinyin: { type: String },//拼音
    order: { type: Number },//排序
    capital: { type: Number }//首都
});
exports.regions = mongoose.model('regions', RegionsSchema);