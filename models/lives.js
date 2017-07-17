var mongoose = require('mongoose');
var validator=require('validator');
var moment = require('moment');
var Schema = mongoose.Schema;

var livesSchema = new Schema({
    pid:{ type: String,default:'' },//关联活动id
    title: { type: String,default:'' },//标题
    desc: { type: String,default:'' },//表述
    user:{
        mpno: { type: String,default:'' },//用户id
        nickname:{ type: String,default:'' },//
        face:{ type: String,default:'' },//
        roles: { type: String,default:'' },//用户角色 记者，要客，普通
    },
    cds:{
        cid: { type: String,default:'' },//cid
        cdsid:{ type: String,default:'' },//cds_id
        uid: { type: String,default:'' },//cdn 用户
        tid: { type: String,default:'' },//tid,
        url:{type:String,default:''},//本地文件上传 转码后播放地址
        originalurl:{type:String,default:''},//主要本地文件上传 源视频地址
        delaytime:{type:Number,default:0},//延时时间,单位（秒）客户端根据这个做延时
        timelength: { type: Number,default: 0}//片源时长
    },
    location:{
        show:{type:Number,default:1}, //0隐藏 1显示
        lon:{type:String,default:''},//经度
        lat:{type:String,default:''},//纬度
        address:{type:String,default:''},//地理名字
        city:{type:String,default:''},
    },
    columns:{
        name:{ type: String,default:'' },
        type:{type:Number,default:0},//0=系统栏目 1=自定义栏目
    },
    chatroom:{
        chatroomid:{ type: String,default:'' },
        chatroomname:{ type: String,default:'' },
        isjoin:{type:Boolean,default:true}//是否加入聊天
    },
    guest:[{
        userid:{ type: String,default:'' },mpno:{ type: String,default:'' },nickname:{ type: String,default:'' },
    }],
    assistcount:{type:Number,default:0},//点赞数
    clickcount:{type:Number,default:0},//浏览数
    pics: { type: String,default:'' },//封面照
    type:{type:Number,default:0},//0=直播,1=录播,2=预告,3=本地上传,4=直播间
    attr:{type:Number,default:0},//属性 1=置顶 2=推荐
    status: { type: Number ,default:0},// 默认是待审核 -2=正在创建 -1=停止 0=待审核 1=审核通过了
    tagicon:{type:String,default:''},//状态图片
    starttime:{type:Date,default:moment().add("100","y")},//直播开始时间，主要用于预告
    pushstatus: { type: String , default: 0},//推送状态（1/0）1为推送
    createtime :{type:Date,default:Date.now},
    reject: {
        reason: { type: String,default: ''},
        time: {type: Date,default: Date.now}
    },
    isads:{type:Number,default:0},//0=无广告，1=有广告
    ads:{
        commodity:{type:String,default:''},//商品集
        envelope:{type:String,default:''},//红包
        time:{type:String,default:''}//时间
    },
    suburl:{type:String,default:''}//导播地址
});
exports.lives = mongoose.model('lives', livesSchema);
var liveshistoriesSchema=new Schema({
    mpno: { type: String,default:'' },//用户id
    livesid: { type: String,ref:'lives',default:'' },//关联livesid
    status:{ type: Number ,default:1},//状态
    createtime :{type:Date,default:Date.now},
});
exports.liveshistories = mongoose.model('liveshistories', liveshistoriesSchema);

var livesusersSchema = new Schema({
    mpno:{type:String, required: '用户ID是必填项!'},
    name: { type: String,default:'' },//姓名
    occupation:{type:String,default:''},//职业
    place:{type:String,default:''},//籍贯
    idnumber:{type:String,default:''},//身份证号
    phone:{type:String,default:''},//电话
    idpics:{type:String,default:''},//身份证照片
    applyreasons:{type:String,default:''},//申请事由
    rejectreasons:{type:String,default:''},//拒绝事由
    order: { type: Number ,default:0},
    roles:{type:String,default:''},//角色
    status:{type:Number,default:0},//-2=黑名单 默认0=正常 1=认证通过 2=认证失败
    times:{ type: Number ,default:0},//次数 默认为0不受限
    starttime:{type:Date,default:Date.now},//开始有效期
    endtime:{type:Date,default:Date.now},//结束有效期 如果结束hi件小于当时时间 有效期 将不启用
    updatetime:{type:Date,default:Date.now},//修改时间
    createtime :{type:Date,default:Date.now},
});
exports.livesusers = mongoose.model('livesusers', livesusersSchema);

var livescolumnsSchema = new Schema({
    name: { type: String, required: '栏目名称是必填项!'},//栏目名称
    order: { type: Number ,default:0},//排序
    creator:{type:String,default:''},//创建者
    type:{type:Number,default:0},//0=系统栏目 1=自定义栏目
    attr:{type:Number,default:0},//0=显示 1=隐藏
    createtime :{type:Date,default:Date.now},
});
livescolumnsSchema.path('order').validate(function (order){
    return validator.isInt(order);
}, '排序值必须是数字');
exports.livescolumns = mongoose.model('livescolumns', livescolumnsSchema);

var livessignsSchema = new Schema({
    mpno: { type: String,default:'' },
    location:{
        lon:{type:String,default:''},//经度
        lat:{type:String,default:''},//纬度
        address:{type:String,default:''},//地理名字
        city:{type:String,default:''},
    },
    createtime :{type:Date,default:Date.now},
});
exports.livessigns = mongoose.model('livessigns', livessignsSchema);

var livessettingSchema = new Schema({
    key: { type: String,default:'' },
    val: { type: String ,default:''},
});
exports.livessetting = mongoose.model('livessetting', livessettingSchema);

