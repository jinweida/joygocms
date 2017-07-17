var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SpecialsSchema = new Schema({
    sid: { type: String, required: true },//专题id
    name: { type: String, default: '' },//组名
    mid: { type: String, ref:'posts' },
    title: { type: String, required: true },//标题 ，5=幻灯片
    desc: { type: String, default: '' },//描述
    commentcount: { type: Number , default: 0 },//评论总数
    assistcount: { type: Number , default: 0 },//点赞数
    clickcount: { type: Number , default: 0 },//浏览数
    order: { type: Number , default: 0 },//排序
    video: { type: String, default: '' },
    type: { type: Number, default: 1 },//媒资类型
    source: { type: String, default: '' },//来源
    author: { type: String, default: '' },//作者
    pics:{ type: String, default: '' },//缩略图
    imgextra:[],
    createtime: { type: Date, default: Date.now },//发布时间
});


/*
post = {
    post_title: "测试mongodb", post_desc: "测试mongodb", post_content: "测试mongodb", post_author: "", post_date: new Date(), post_status: "publish",post_password:"",comment_status:"open",menu_order:2,"comment_count":0,"post_assist":0
}*/
exports.specials = mongoose.model('specials', SpecialsSchema);
