var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FavoritesSchema = new Schema({
    mid: { type: String, require: true },
    title: { type: String, default: '' },//评论内容
    type: { type: Number, default: 0 },//媒资类型
    clickcount : { type: Number, default: 0 },
    assistcount: { type: Number, default: 0 },
    commentcount: { type: Number, default: 0 },
    pics: { type: String, default: '' },
    createtime: { type: Date, default: Date.now },//创建时间
    mpno: { type: String, default: '' },
    desc: { type: String, default: '' },
    video: { type: String, default: '' },
    source: { type: String, default: '' },
    author: { type: String, default: '' },
});

exports.favorites = mongoose.model('favorites', FavoritesSchema);