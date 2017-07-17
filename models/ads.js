var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AdsSchema = new Schema({
    title: { type: String,required: "广告名称必填项" },
    adimg: { type: String, default: '' },
    adurl: { type: String, default: '' },
    adlive: { type: String, default: '' },
    adtype: { type:Number },
    adposition:{ type:Number ,ref:'columns',default:-1},
    order:{type:Number,default:-1},//排序
    status:{type:Number,default:1},//1=正常 0=禁用
    menuitem: {type: Number,ref:'columns'},
    mediaitem: {type: String,ref:'medias'},
    mediatitle:{type:String,default:''},
    desc:{type:String,default:''}, //导语
    timing:{type:Number,default:0},//定时 0=不定时 1=定时
    stime:{type:Date,default:Date.now},//广告开始
    etime:{type:Date,default:Date.now},//广告结束
    createtime:{type:Date,default:Date.now}
});
AdsSchema.pre('save',function(next){
	next();
})
var adsMes=mongoose.model('ads', AdsSchema);
// adsMes.schema.path('title').validate(function (value) {
//   return /^\S{0,18}$/.test(value);
// }, '标题超过规定字符');
exports.ads = mongoose.model('ads', AdsSchema);