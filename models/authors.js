var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AuthorsSchema = new Schema({
    name: { type: String ,require:"姓名是必填项"},
    phone: { type: String },
    desc: { type: String },
    img: { type: String },
    createtime: { type: Date, default: Date.now },//发布时间
});
exports.authors = mongoose.model('authors', AuthorsSchema);