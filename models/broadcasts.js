var mongoose = require('mongoose');
var validator=require('validator');
var moment = require('moment');
var Schema = mongoose.Schema;

var BroadcastsSchema = new Schema({
    title: { type: String,required: '标题是必填项!'},//标题
    subtitle:{type:String,default:''},//副标题
    desc: { type: String,default:'' },//表述
    assistcount:{type:Number,default:0},//点赞数
    pics: { type: String,default:'' },//封面照
    url:{type:String,default:''},//播放地址
    type:{type:Number,default:0},//
    status: { type: Number ,default:0},// 默认是待审核 0=待审核 1=审核通过了
    order:{ type: Number ,default:0},
    chatroom:{
        chatroomid:{ type: String,default:'' },
        chatroomname:{ type: String,default:'' },
        isjoin:{type:Boolean,default:true}//是否加入聊天
    },
    guest:[{
        _id:false,
        userid:{ type: String,default:'' },
        mpno:{ type: String,default:'' },
        nickname:{ type: String,default:'' },
    }],
    createtime :{type:Date,default:Date.now},
});
exports.broadcasts = mongoose.model('broadcasts', BroadcastsSchema);

var BroadprogramsSchema=new Schema({
    title: { type: String,required: '节目名称是必填项!'},//标题
    broadid:{ type: String,default:''},//频道id
    anchor:{type:String,default:''},//主播名
    desc: { type: String,default:'' },//描述
    pics: { type: String,default:'' },//节目封面
    url:{type:String,default:''},//播放地址
    isplay:{type:Number,default:1},//0=不能播 1=能播放
    stime :{type:Date,default:Date.now},
    etime :{type:Date,default:Date.now},
    createtime :{type:Date,default:Date.now},
});
exports.broadprograms = mongoose.model('broadprograms', BroadprogramsSchema);

