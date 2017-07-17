var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//报名模板
var Regtemplate = new Schema({
    pid: { type: String,required: "" },//关联活动id
    template:[{
        key: { type: String,default: "" },
        type: { type: String,default: "" },
        name: { type: String,default: "" },
        maxlength: { type: Number,default: 0 },
        status: { type: Number,default: 0 }
    }],
    createtime:{type:Date,default:Date.now}
});
//报名表
var Registration = new Schema({
    pid: { type: String,required: "" },//关联活动id
    mpno:{ type: String,default: "" },//用户mpno
    cost:{ type: String,default: "" },//费用
    num:{ type: Number,default: 1 },//人数
    order:{ type: String,default: '' },//订单号
    tenant_order:{ type: String,default: '' },//第三方订单号订单号
    payment:{ type: Number,default: '' },//支付方式 0支付宝 1微信
    information:[{
        key: { type: String,default: "" },
        value: { type: String,default: "" },
    }],
    paystatus:{ type: Number,default: 0 },//支付状态 0=待支付 1=已支付
    createtime:{type:Date,default:Date.now}
});
//报名短信通知记录
var Regnotice = new Schema({
    mid: { type: String,required: "" },//关联活动id
    mpno:{ type: String,default: "" },//用户mpno
    createtime:{type:Date,default:Date.now}
});

exports.regtemplate = mongoose.model('regtemplate', Regtemplate);
exports.registration = mongoose.model('registration', Registration);
exports.regnotice = mongoose.model('regnotice', Regnotice);