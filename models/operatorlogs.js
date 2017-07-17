var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OperatorlogsSchema = new Schema({
    user_login: { type: String},
    desc: { type: String , default: '' },
    createtime: { type: Date, default: Date.now }
});
exports.operatorlogs = mongoose.model('operatorlogs', OperatorlogsSchema);