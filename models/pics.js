var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PicsSchema = new Schema({
    _id: { type: Schema.ObjectId, required: true },
    imgs: [{
            _id: false,
            title: { type: String, default: '' },//图片标题
            desc: { type: String, default: '' },//表述信息
            imgurl: { type: String, default: '' }//图片地址
        }],
});
exports.pics = mongoose.model('pics', PicsSchema);