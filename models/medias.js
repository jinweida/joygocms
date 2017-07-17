var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MeidasSchema = new Schema({

    mid: { type: String, require: true },
    cid: { type: Number, ref:'columns',default: 1 },
    title: { type: String, required: true },//标题 ，5=幻灯片
    subtitle: { type: String, default:'' },//副标题
    desc: { type: String, default: '' },//描述
    content: { type: String },//正文
    video: { type: String, default: '' },//视频地址
    source: { type: String, default: '' },//来源
    author: { type: String, default: '' },//作者
    createtime: { type: Date, default: Date.now },//发布时间
    status: { type: String, required: true, default: 'publish' },//文章状态 publish/auto-draft/inherit
    password: { type: String , default: '' },//文章密码
    commentstatus: { type: String , default: "open" },//评论状态（open/closed）
    commentcount: { type: Number , default: 0 },//评论总数
    clickcount: { type: Number , default: 0 },//浏览数
    assistcount: { type: Number , default: 0 },//文章点暂总数
    order: { type: Number , default: 0 },//排序
    type: { type: Number, default: 1 },//媒资类型
    area: { type: Number, default: -1 },
    tel: { type: String, default: '' },//联系电话
    address:{type:String,default:''},//地址 用于美食
    score:{type:Number,default:0},//评分 用于美食
    price:{type:Number,default:0},//价格 用于美食
    members:{type:String,default:''},//成员 七日计划
    hangye: { type: Number, default: -1 },
    tag: { type: String, default: '' },//标签
    tagtype:{type:Number,default:0},//标签类型 0=无标签 21=独家 22=视频 23=推广 24=专题 25=分析 26=热门 27=投票 28=直播 29=广播 30=音乐
    pics: { type: String, default: '' },
    pwidth:{type:Number,default:400},
    pheight:{type:Number,default:300},
    imgextra:[{
        src:{type:String,default:''},
    }],
    attr: { type: Number, default: -1 },//1 置顶
    toptime: { type: Date, default: '' },//置顶时间
    activitystime: { type: Date, default: Date.now },//活动开始时间
    activityetime: { type: Date, default: Date.now },//活动结束时间
    activityaddress: { type: String, default: '' },//地址
    url: { type: String, default: '' },//地址
    shareurl: { type: String, default: '' },//分享地址
});
exports.medias = mongoose.model('medias', MeidasSchema);