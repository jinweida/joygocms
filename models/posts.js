var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostsSchema = new Schema({
    title: { type: String, required: '请填写标题!' },//标题 ，5=幻灯片
    subtitle: { type: String, default:'' },//副标题
    desc: { type: String,default:''},//描述
    content: { type: String ,default:''},//正文
    video: { type: String, default: '' },//视频地址
    isaudio: { type: Number, default: 0 },// 0=video为视频 1video为音频
    source: { type: String, default: '' },//来源
    author: { type: String, default: '' },//作者
    createtime: { type: Date, default: Date.now },//发布时间
    password: { type: String , default: '' },//文章密码
    commentstatus: { type: String , default: 1},//评论状态（2/1/0）0禁止 1允许免审核 2允许需审核
    pushstatus: { type: String , default: 0},//推送状态（1/0）1为推送
    commentcount: { type: Number , default: 0 },//评论总数
    clickcount: { type: Number , default: 0 },//浏览数
    pvcount: { type: Number , default: 0 },//pv数
    assistcount: { type: Number , default: 0 },//文章点暂总数
    order: { type: Number , default: 0 },//排序
    type: { type: Number, default: 1 },//媒资类型
    tel: {type:String,default:''},//联系电话
    area: { type: Number, default: -1 },
    commodity: {type:String,default:''},//商品集
    hangye: { type: Number, default: -1 },
    tag: { type: String, default: '' },//标签
    tagtype:{type:Number,default:0},//标签类型0=无标签 21=独家 22=视频 23=推广 24=专题 25=分析 26=热门 27=投票 28=直播 29=广播 30=音乐
    address:{type:String,default:''},//地址 用于美食
    score:{type:Number,default:0},//评分 用于美食
    price:{type:Number,default:0},//价格 用于美食
    members:{type:String,default:''},//成员
    status: { type: Number, default: 0 },//文章状态 1=已发布 0=未发布 2=已审核
    columnid: {type:Number,default:-1},//手机上传栏目id，默认资源不属于任何栏目
    publish_size: {type:Number,default:0},
    pics: { type: String, default: '' },
    picsstate: { type: Number, default: 0 }, //是否显示缩略图 1=显示 0=不显示
    pwidth:{type:Number,default:400},
    pheight:{type:Number,default:300},
    imgextra:[{
        _id:false,
        src:{type:String,default:''},
    }],
    onlinepayment :{type:Number,default:0},//0=线下支付  1=线上支付
    votes: {type: String,ref:'votes'},// 默认可以是当前记录的_id
    activitystime: { type: Date, default: Date.now},//活动开始时间
    activityetime: { type: Date, default: Date.now },//活动结束时间
    activitytype:{ type: Number, default: 0 },//活动类型 0=视频类型 1=图片类型 2=混排
    activityonline:{ type: Number, default: 1 },//线上参与 0=否 1=是
    activityaddress: { type: String, default: '' },//地址
    activityceiling: {type: String, default: '' },//活动人数上限
    activityprotocol: {type:String,default:''},//活动协议
    activitywelfare: {type: Number, default: 0},//活动福利 0=无 1 =积分 2=代金券
    activitintegral : {type: Number, default: 2},//积分数
    activitvouchers: {type: String, default: ''},//代金券id
    activityassist:{ type: Number, default: 1 },//活动点赞 0=否 1=是
    activitynotice:{ type: Number, default: 0 },//是否短信通知 0=否 1=是
    activityparticipate:{ type: Number, default: 1 },//是否显示参与人数 0=否 1=是
    activitylives:{ type: Number, default: 0 },//是否存在直播间 0=否 1=是
    user_like_this_post: [{
        _id: false,
        mpno: { type: String, default: '' }//点过赞的用户
    }],
    link:{type:String,default:''},//链接至第三方
    post_publish_status: [{
        _id: false, cid: { type: Number, default: -1 } //上架状态
    }],
});
//关联新闻
var Associated = new Schema({
    pid:{ type: String, default: '' },//活动ID
    nid: { type: String, default: '' },//新闻标题
    title: { type: String, default: '' },//标题
    type: { type: Number, default: 1 },//类型
    postcreattime: { type: Date, default: Date.now },//新闻创建时间
    createtime:{type:Date,default:Date.now}
});
//主播关联直播间
var Hostair = new Schema({
    pid:{ type: String, default: '' },//主播ID
    mid:{ type: String, default: '' },//活动ID
    title:{ type: String, default: '' }//活动标题
});

var postsMes=mongoose.model('posts', PostsSchema);
postsMes.schema.path('source').validate(function (value) {
  return /^\S{0,10}$/.test(value);
}, '来源超过规定字符');
/*
post = {
    post_title: "测试mongodb", post_desc: "测试mongodb", post_content: "测试mongodb", post_author: "", post_date: new Date(), post_status: "publish",post_password:"",comment_status:"open",menu_order:2,"comment_count":0,"post_assist":0
}*/
exports.posts = mongoose.model('posts', PostsSchema);
exports.associated = mongoose.model('associated', Associated);
exports.hostair = mongoose.model('hostair', Hostair);
