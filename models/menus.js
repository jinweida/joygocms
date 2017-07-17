var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MenusSchema = new Schema({
    _id: { type: Number, required: "菜单是必填项",default:0 },
    order: { type: Number, default: 0 },//排序
    name: { type: String , required: "菜单是必填项" },				//分类名
    status: { type: Number, default: 0 },
    pubstatus: { type: Number, default: 1 },//是否支持上架//0=禁止 1=允许
    commentstatus: { type: Number, default: 1 },//是否支持评论//0=禁止 1=允许
    listtype: { type: Number, default: 1 },//1=新闻，2=视频,3=图片集
    menutype: { type: Number, default: 1 },//栏目属于那种菜单
    url: {type:String,default:''},//html跳转地址
    position: { type: Number, default: 0 },//菜单位置
    pid: { type: Number, default: 0 },
    upstatus: { type: Number, default: 0 },//0=禁止 1=允许
    level: { type: Number, default: 1 },
    pics: { type: String , default: '' },
    icon: { type: String , default: '' },
    issystem:{type:Boolean,default:true},//是否是内置菜单
    createtime: { type: Date, default: Date.now }
});

//ColumnsSchema.path('name').validate(function (name, fn) {
//    var columns = mongoose.model('columns');
    
//    columns.find({ name: name }).exec(function (err, doc) {
//        fn(!err && doc.length === 0);
//    });
//}, '栏目名称已经被使用了');


exports.menus = mongoose.model('menus', MenusSchema);

/*
 * category={"category":"头条","sort":0,"createtime":new Date()}
 * */