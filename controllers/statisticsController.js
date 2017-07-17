var statistics = require('../models/statistics').statistics;
var statisticscolumns = require('../models/statistics').statisticscolumns;
var response = require('../lib/response');
var comm = require('../lib/comm');
var eventproxy = require('eventproxy');
var moment = require('moment');
var validator = require('validator');
var Posts = require('../models/posts').posts;

exports.list=function(req,res){
  return res.render('admin/statistics/list', {
    title: 'PV统计',
    mid:validator.trim(req.query.mid)
  });
}
exports.ajax_list=function(req,res){
  var mid=validator.trim(req.query.mid);
  var os=validator.trim(req.query.os);
  var stime=validator.trim(req.query.stime);
  var type=validator.trim(req.query.type);
  var etime=validator.trim(req.query.etime);
  var proxy=new eventproxy();
  var options = comm.get_page_options(req);
  var query=statistics.where({mid:mid,type:type});
  if(Boolean(os.toLowerCase()))
    query.where('os',eval("/"+os+"/ig"));
  if(validator.isDate(stime)){
    query.where('createtime').gte(moment(stime).format('YYYY-MM-DD HH:mm:ss'));
  }
  if(validator.isDate(etime)){
    query.where('createtime').lte(moment(etime).format('YYYY-MM-DD HH:mm:ss'));
  }
  proxy.all('count','list',function(count,list){
    return res.send({
        code:1,
        count:count,
        pagecount: Math.ceil(count / options.pagesize),
        currentpage:options.currentpage,
        list: list
      });
  })
  statistics.count(query,proxy.done(function(count){
    console.log(count);
    proxy.emit('count',count);
  }))
  statistics.find(query).sort("-createtime").skip(options.skip).limit(options.pagesize).exec(proxy.done(function(models){
    var list=[];
    if(models){
      models.forEach(function(model, index) {
        var modelObj = model.toObject();
        modelObj.index = options.skip + index + 1;
        modelObj.createtime = moment(modelObj.createtime).format('YYYY-MM-DD HH:mm:ss');
        models[index] = modelObj;
      });
      list=models;
    }
    proxy.emit('list',list);
  }))
}
/*var Posts = require('../models/posts').posts;
setInterval(function () {
    var where={mid:{$ne:''},cid:{$exists:false}};
    statistics.find(where).sort("createtime").limit(50)
    .exec(function(err,models){
      if(!err && models){
        models.forEach(function(node,index){
          Posts.findOne({_id:node.mid},function(err,item){
            if(!err){
              if(item){
                item.post_publish_status.forEach(function(m,j){
                  if(j===0){
                    statistics.update({_id: node._id}, {cid:m.cid}, function (err) { });
                  }
                })
              }else{
                statistics.update({_id: node._id}, {cid:100011}, function (err) { });
              }
            }
          })
        })
      }
    });
  }, 5*1000);*/
exports.settongji=function(req,res){
  //statistics.update({mid: '55dd2a884feca88d4481ceb1'}, {cid:1225002}, { multi: true },function (err) { });
  return res.send("ok");
}
exports.columns=function(req,res){
  var stime=validator.trim(req.query.stime);
  var etime=validator.trim(req.query.etime);
  var o = {};
  o.map = function () { emit(this.cid,1) }
  o.reduce = function (key, values) {
      return Array.sum(values);
  }
  var where={type:0};
  o.query=where;
  o.out = { replace: 'statisticscolumns' }
  o.verbose = true;
  if (validator.isDate(stime) && validator.isDate(etime)) {
    where.createtime={ $lte: moment(etime).format('YYYY-MM-DD') , $gte: moment(stime).format('YYYY-MM-DD')};
  }else{
    if(validator.isDate(stime)){
      where.createtime={ $gte: moment(stime).format('YYYY-MM-DD') };
    }
    if(validator.isDate(etime)){
      where.createtime={ $lte: moment(etime).format('YYYY-MM-DD') };
    }
  }
  statistics.mapReduce(o,function(err,model,stats){
    model.find().exec(function (err, docs) {
      statisticscolumns.find().sort("-value").populate('_id').exec(function(err,m){
        var list=[];
        if(!err && m){
          m.forEach(function(node,index){
            if(node._id){
              var n=node._id.toObject();
              n.clickcount=node.value;
              list.push(n);
            }
          })
        }
        var count=0
        list.forEach( function(node, index) {
          count+=node.clickcount
        });
        return res.render('admin/statistics/columns', {
          title: '栏目统计',
          list:list,
          count:count
        });
      })
    });
  })
}
exports.daily_browsing=function(req,res){
  return res.render('admin/statistics/daily_browsing', {
    title: '媒资浏览量',
  });
}
exports.daily_browsing_ajax=function(req,res){
  var proxy=new eventproxy()
  var options = comm.get_page_options(req);
  var etime=req.query.etime;
  var stime=req.query.stime;
  var query=statistics.where({type:0});
  var title=req.query.title;
  var where={};
  var s={type:0};
  if (title) {
    where.title={ $regex: title, $options: 'i' }
  }
  if(validator.isDate(stime)){
    query.where('createtime').gte(moment(stime).format('YYYY-MM-DD'));
  }
  if(validator.isDate(etime)){
    query.where('createtime').lte(moment(etime).format('YYYY-MM-DD'));
  }
  if (validator.isDate(stime) && validator.isDate(etime)) {
    s.createtime={ $lte: moment(etime).format('YYYY-MM-DD') , $gte: moment(stime).format('YYYY-MM-DD')};
  }else{
    if(validator.isDate(stime)){
      s.createtime={ $gte: moment(stime).format('YYYY-MM-DD') };
    }
    if(validator.isDate(etime)){
      s.createtime={ $lte: moment(etime).format('YYYY-MM-DD') };
    }
  }
  proxy.all('post','count',function(post,count){
    statistics.count(query,function(err,pagecount){
      return response.success(res, {
        list:post,
        count: Math.ceil(count / options.pagesize),
        pagecount:pagecount
      });
    })
  })
  Posts.find(where)
  .sort('-createtime').select({'title':1,'_id':1})
  .limit(options.limit).skip(options.skip)
  .exec(function(err,models){
    proxy.after( "setcount",models.length,function(setcount){
      proxy.emit('post',models)
    })
    models.forEach( function(node, index) {
      node=node.toObject()
      s.mid=node._id
      statistics.count(s,function(err,count){
        node.count=count
        node.index=options.skip+index+1
        models[index]=node
        proxy.emit('setcount','')
      })
    });
  })
  Posts.count(where,function(err,count){
    proxy.emit('count',count)
  })
}
