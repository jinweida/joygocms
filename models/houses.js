var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HousesSchema = new Schema({
    mpno:{type:String,default:''},//user
    title: { type: String ,default:''},
    desc: { type: String, default: '' },
    provincecode:{type:String,default:''},//省代码
    citycode:{type:String,default:''},//市代码
    streetcode:{type:String,default:''},//街道代码
    province:{type:String,default:''},//省
    city:{type:String,default:''},//市
    street:{type:String,default:''},//街道
    address: { type: String , default: ''},//地址
    price: { type: Number, default: 0 },
    priceregions:{type:String,default:''},//价格范围
    room:{ type: Number, default: 0 },
    hall:{ type: Number, default: 0 },
    wei:{ type: Number, default: 0 },
    acreage:{type:Number,default:0},
    linkman: { type: String, default: '' },
    linkphone:{type:String,default:''},
    expire:{type:Number,default:10},
    pics:{type:String,default:''},//缩略图
    slides:[{
        pics:{type:String,default:''},
        name:{type:String,default:''}
    }],
    status:{type:Number,default:-1},//-1=待审核 0=审核通过
    createtime: { type: Date, default: Date.now },//创建时间
});
exports.houses = mongoose.model('houses', HousesSchema);