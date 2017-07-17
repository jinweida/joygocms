var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CooperationSchema = new Schema({
    name: {type:String, require:true},//商户名称
    img:{ type: String, default: '' },//商户照片
    desc: { type: String, default: '' },//详细信息
    ads: { type: String, default: '' },//联系地址
    phone: { type: String, default: '' },//联系电话
    mpno: { type: String, default: '' },//用户
    nickname: {type:String,default:''},//联系人
    createtime: { type: Date, default: Date.now },//创建时间
    status: {type:Number,default:1},//状态0=正常 1=待审核 2=未通过 
    faith: {type:Number,default:0},//是否为优质商户 0=否 1=是  
    cause: { type:String , default: '' },//申请原因
    reject :{ type:String , default: '' },//拒绝原因
});

exports.cooperation = mongoose.model('Cooper', CooperationSchema);