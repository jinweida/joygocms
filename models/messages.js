var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessagesSchema = new Schema({
    title: { type: String, required: '消息标题是必填项!'},//消息标题
    context: { type: String,default:'' },//表述
    pics: { type: String,default:'' },//封面照
    devicetype:{type:Number,default:0},//设备类型 0=all 1=android 2=ios
    users:{
        type:{type:Number,default:0},//用户类型 0=all 1=single 2=group
        single:{ type: String,default:'' },//用户id,当type=1 ,需要发送单个用户
        groupid:{ type: String,default:'' },//用户组,当type=2 ,需要发送用户组
    },
    sendtime:{
        type:{type:Number,default:0},//0=立即 1=发送
        timing:{type:Date,default:Date.now},//定时时间
    },
    menuitem: {type: Number,ref:'columns'},
    mediaitem: {type: String,ref:'medias'},
    mediatitle:{type:String,default:''},
    creator:{ type: String,default: ''},//创建人
    createtime :{type:Date,default:Date.now},
});
exports.messages = mongoose.model('messages', MessagesSchema);
var MessagesgroupsSchema=new  Schema({
    name:{ type: String, required: '用户组是必填项!' },//组名
    creator:{ type: String,default: ''},//创建人
    createtime :{type:Date,default:Date.now},
});
exports.messagesgroups = mongoose.model('messagesgroups', MessagesgroupsSchema);

var MessagesusersSchema=new  Schema({
    mpno:{ type: String, required: '用户id是必填项!' },//用户id
    groupid:{ type: String,ref:'messagesgroups',default: ''},//用户组
    creator:{ type: String,default: ''},//创建人
    createtime :{type:Date,default:Date.now},
});
exports.messagesusers = mongoose.model('messagesusers', MessagesusersSchema);


