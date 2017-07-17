var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostvideoSchema = new Schema({
	pid: { type: Schema.ObjectId },
    seq: { type: Number },
    vpath: { type: String,default:'' },
    vtitle: { type: String ,default:''},
	  vdesc: { type: String ,default:''},
    imgurl: { type: String ,default:''},
    vtype:{type:Number,default:3},//0=直播,1=录播,2=预告,3=本地上传

});

exports.postvideo = mongoose.model('postvideo', PostvideoSchema);

var PostsaggregatesSchema =new Schema({
    cid: { type:Number,ref:'newcolumns'},
    total:{type:Number,default:0},
});
exports.postsaggregates = mongoose.model('postsaggregates', PostsaggregatesSchema);

var NewsresultsSchema =new Schema({
    cid: { type:Number,ref:'newcolumns'},
    name: { type:String,default:''},
    total:{type:Number,default:0},
});
exports.newsresults = mongoose.model('newsresults', NewsresultsSchema);

var NewcolumnsSchema = new Schema({
    _id: { type: Number, required: "栏目编号必填项",default:1 },
    order: { type: Number, default: 0 },//排序
    menuorder: { type: Number, default: 0 },//菜单排序
    name: { type: String , required: "栏目名称是必填项" },        //分类名
    status: { type: Number, default: 0 },
    pubstatus: { type: Number, default: 1 },//是否支持上架//0=禁止 1=允许
    commentstatus: { type: Number, default: 1 },//是否支持评论//0=禁止 1=允许
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
    createtime: { type: Date, default: Date.now }
});

//ColumnsSchema.path('name').validate(function (name, fn) {
//    var columns = mongoose.model('columns');

//    columns.find({ name: name }).exec(function (err, doc) {
//        fn(!err && doc.length === 0);
//    });
//}, '栏目名称已经被使用了');


exports.newcolumns = mongoose.model('newcolumns', NewcolumnsSchema);