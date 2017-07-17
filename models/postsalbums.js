var mongoose = require('mongoose');
var Schema = mongoose.Schema;
exports.postsalbums = mongoose.model('postsalbums', new Schema({
  mid: { type: String ,ref:'posts',default:'' },
  rid: { type: String ,ref:'registration',default:'' },
  pics: { type: String ,default:'' },
  video:{
    url: { type: String, default: '' },//转码后地址
    originalurl: { type: String, default: '' },//原视频地址
    bucket:{type:String,default:''},
  },
  type:{type:Number,default:1},//1=图片 0=视频 2=其他// 5=表示表单报名
  from:{type:Number,default:4},//0=直播,1=录播,2=预告,3=本地上传 4=阿里//
  assistcount: { type: Number , default: 0 },//暂总数
  user:{
    mpno:{ type: String,default:'' },
    nickname:{ type: String,default:'' },//用户昵称
  },
  name:{ type: String,default:'' },
  contact :{ type: String,default:'' },//联系方式
  desc:{ type: String,default:'' },
  no:{ type: Number,default:0 },
  status: { type: Number , default: -1 },//0=正常，-1=待审核 1=被删除 2=被驳回 3=转码中
  user_like_this_post: [{
      _id: false,
      mpno: { type: String, default: '' },//点过赞的用户
      time: { type: Date, default: Date.now },//发布时间
      ip:{type:String,default:""},
  }],
  createtime: { type: Date, default: Date.now },//发布时间
}));