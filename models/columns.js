var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ColumnsSchema = new Schema({
    _id: { type: Number, required: "栏目编号必填项",default:0 },
    order: { type: Number, default: 0 },//排序
    menuorder: { type: Number, default: 0 },//菜单排序
    name: { type: String , required: "栏目名称是必填项" },				//分类名
    status: { type: Number, default: 0 },//
    pubstatus: { type: Number, default: 1 },//是否支持上架//0=禁止 1=允许
    commentstatus: { type: Number, default: 1 },//是否支持评论//0=禁止 1=允许免审核 2=允许需审核
    listtype: { type: Number, default: 1 },//1=新闻，2=视频,3=图片集
    menutype: { type: Number, default: 1 },//栏目属于那种菜单
    url: {type:String,default:''},//html跳转地址
    position: { type: Number, default: 0 },//菜单位置
    pid: { type: Number, default: 0 },
    upstatus: { type: Number, default: 0 },//上传状态 0=禁止 1=允许
    adstatus: { type: Number, default: 0 },//广告状态 0=禁止 1=允许
    level: { type: Number, default: 1 },
    pics: { type: String , default: '' },
    icon: { type: String , default: '' },
    isselect:{type:Number,default:0},//默认未选中菜单
    issystem:{type:Boolean,default:true},//true=非内置菜单 false=内置菜单
    isslide:{type:Boolean,default:false},//是否是侧滑菜单
    haschild:{type:Number,default:0},//是否是有子节点 0=否 1=有
    istitle:{type:Number,default:0},//是否显示副标题 0=否 1=有
    isshow:{type:Number,default:1},//显示时间还是评论 1=时间 0=评论
    createtime: { type: Date, default: Date.now }
});

//ColumnsSchema.path('name').validate(function (name, fn) {
//    var columns = mongoose.model('columns');

//    columns.find({ name: name }).exec(function (err, doc) {
//        fn(!err && doc.length === 0);
//    });
//}, '栏目名称已经被使用了');


exports.columns = mongoose.model('columns', ColumnsSchema);

/*
 * category={"category":"头条","sort":0,"createtime":new Date()}
 * */