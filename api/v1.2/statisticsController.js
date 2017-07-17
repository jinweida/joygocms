var response = require('../../lib/response');
var Posts = require('../../models/posts').posts;
var Lives = require('../../models/lives').lives;
var comm = require('../../lib/comm');
var config = require('../../config');
var validator = require('validator');
var moment = require('moment');
var Statistics = require('../../models/statistics').statistics;
exports.set=function(req,res,next){
  var model=new Statistics({
    useragent:validator.trim(req.headers['user-agent']),
    ver:validator.trim(req.query.ver),
    path:validator.trim(req.path),
  });
  /*
  米4 Mozilla/5.0 (Linux; U; Android 4.1.2; zh-cn; GT-N7100 Build/JZO54K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30
  Mozilla/5.0 (iPod touch; CPU iPhone OS 8_4 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12H143
  Mozilla/5.0 (iPhone; CPU iPhone OS 8_4_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobi

  console.log(model.useragent);
  console.log(model.path.search(/get_detail/));
  console.log(model.useragent.search(/iPhone/));
  console.log(model.useragent.search(/Android/));*/
  if(model.useragent){
    if(model.useragent.match(/iPhone/g))
      model.os='iPhone';
    else if(model.useragent.match(/Android/g))
      model.os='Android';
    else
      model.os='other';
  }
  var flag=false;
  if(/api\/get_detail$/g.test(model.path)){
    var cid=validator.trim(req.query.cid);
    model.type=0;
    model.mid=validator.trim(req.query.mid);
    model.cid=cid?cid:1;
    flag=true;
    //更新浏览次数
    if(model.mid)Posts.findOneAndUpdate({ "_id": model.mid },{$inc: { "clickcount": 1 ,'pvcount':1}} , function (err,posts) {});
  }else if(/api\/lives\/get_detail$/g.test(model.path)){
    model.type=1;
    model.cid=0;
    model.mid=validator.trim(req.query._id);
    flag=true;
      //更新浏览次数
    if(model.mid)Lives.findOneAndUpdate({ "_id": model.mid },{$inc: { "clickcount": 1 }} , function (err,posts) {});
  }
  if(flag){
    model.hour=moment().hour();
    model.day=moment().day()-1;
    model.month=moment().month()+1;
    model.year=moment().year();
    model.save(function(err){});
  }
  next();
}