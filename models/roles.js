var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RolesSchema = new Schema({
    _id: { type: Number , required:"编号是必填项"},
    name: { type: String ,required:"角色名称是必填项"},
    permission: { type: String,default:'' },
    status:{type:Number,default:1},//1=正常 0=停用
});
exports.roles = mongoose.model('roles', RolesSchema);