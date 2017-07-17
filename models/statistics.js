var mongoose = require('mongoose');
var Schema = mongoose.Schema;

exports.statistics = mongoose.model('statistics', new Schema({
  useragent:{type:String,default:''},
  lang:{type:String,default:''},
  browser:{type:String,default:''},
  os:{type:String,default:''},
  year:{type:Number,default:2015},
  month:{type:Number,default:9},
  day:{type:Number,default:1},
  hour:{type:Number,default:0},
  mid:{type:String,default:''},
  path:{type:String,default:''},
  type:{type:Number,default:0},//0=媒资 1=微直播
  cid:{type:Number,default:0},//从那个栏目进来的
  mediastype:{type:Number,default:1},//媒资类型
  ver:{type:String,default:''},
  createtime: { type: Date, default: Date.now },//访问时间
}));
exports.statisticsposts = mongoose.model('statisticsposts', new Schema({
  _id:{type:String,ref:'posts'},
  value:{type:Number,default:0},
}));
exports.statisticscolumns = mongoose.model('statisticscolumns', new Schema({
  _id:{type:String,ref:'columns'},
  value:{type:Number,default:0},
}));