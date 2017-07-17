var Comments = require('../models/comments').comments;
var Medias = require('../models/medias').medias;
var response = require('../lib/response');
var comm = require('../lib/comm');
var moment = require('moment');
var Operatorlogs = require('../proxy/operatorlogs');
var Posts = require('../models/posts').posts;
var eventproxy = require('eventproxy');

exports.set_comments=function(req,res){
    var proxy = new eventproxy();
    Comments.find({title:{$exists: false}}).sort("createtime").exec(function(err,models){
      proxy.after( "ggg",models.length,function(ggg){
        response.success(res,"666")
      })
      models.forEach(function(node,index){
        var node = node.toObject();
        var mid=node.mid;
        var id=node._id;
        Posts.findOne({_id:mid},function(err,model){
          if(model){  
              var title=model.title;
              Comments.update({_id:id},{"$set":{title:title}},function(err,m){
                proxy.emit('ggg', m);
              })
          }
        })
      })
    })
}
exports.get_comments_list = function (req, res) {
  try {
    var options = comm.get_page_options(req);
    var content = req.query.content;
    var where = {status:{$ne:1}};
    if (content !== "" && content !== undefined) {
        where.content = { $regex: content, $options: 'i' };
    }
    Comments.count(where, function (error, count) {
        if (error) {
        } else {
            Comments.find(where).sort("-createtime").limit(options.pagesize)
        .exec(function (err, models) {
                res.render('admin/comments_list', {
                    title: "评论管理",
                    pagecount: Math.ceil(count / options.pagesize),
                    pagesize: options.pagesize,
                    models: get_format_models(models,options),
                    content:content
                });
            });
        }
    });
  } catch (e) {
    console.log('error when exit', e.stack);
  }
}

exports.ajax_get_comments_list = function (req, res) {
  var options = comm.get_page_options(req);
  var content = req.query.content;
  var title = req.query.title;
  var where = {status:{$ne:1}};
  if (content !== "" && content !== undefined) {
      where.content = { $regex: content, $options: 'i' };
  }
  if (title !== "" && title !== undefined) {
      where.title = { $regex: title, $options: 'i' };
  }
  var proxy=new eventproxy();
  proxy.all('count','list',function(count,list){
    response.success(res, {
      count:count,
      pagecount: Math.ceil(count / options.pagesize),
      currentpage:options.currentpage,
      list: list
    });
  })
  Comments.find(where).sort("-createtime").skip(options.skip).limit(options.pagesize).exec(proxy.done(function (models) {
      if (!models) {
          return response.error(res, {});
      }
      proxy.emit('list',get_format_models(models,options));
  }));
  Comments.count(where,proxy.done(function(count){
    proxy.emit('count',count);
  }))
}
function get_format_models(models,options){
  models.forEach(function (node, index) {
      var node = node.toObject();
      node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
      node.shorttitle=comm.get_substring({str:node.content});
      node.index = options.skip + index + 1;
      models[index]=node;
  });
  return models;
}
exports.delete = function (req, res) {
  var _ids = req.body._ids;
  var reg = /,/;
  var _idarray = _ids.split(reg);
  var success_num= 0;
  var err_num = 0;
  _idarray.forEach(function (_id) {
    Comments.findOneAndUpdate({_id:_id} , {"$set":{status:1}} , function(err,model){
      if(model.status==0){
         var m={$inc: { "commentcount": -1 }};
      }else{
         var m={$inc: { "commentcount": 0 }};
      }
      var proxy = new eventproxy();
      proxy.all('medias','posts',function(medias,posts){
        Operatorlogs.save({
          desc: "删除了评论 _id:" + _id ,
          user_login: req.session.user.user_login
        });
      })
      var mid=model.mid;
      Posts.update({_id:mid},m,proxy.done(function(){
        proxy.emit('posts','')
      }))
      Medias.update({mid:mid},m,{multi: true},proxy.done(function () {
        proxy.emit('medias', '');
      }));
    })
  });
  return response.success(res, {});
}
exports.comments_pass = function(req,res){
  var _ids = req.body._ids;
  var reg = /,/;
  var _idarray = _ids.split(reg);
  _idarray.forEach(function (_id) {
    Comments.findOneAndUpdate({_id:_id} , {"$set":{status:0}} , function(err,model){
      if(model.status==-1){
         var m={$inc: { "commentcount": 1 }};
      }else{
         var m={$inc: { "commentcount": 0 }};
      }
      var proxy = new eventproxy();
      proxy.all('medias','posts',function(medias,posts){
        console.log(4)
        Operatorlogs.save({
          desc: "审核评论 _id:" + _id ,
          user_login: req.session.user.user_login
        });
      })
      var mid=model.mid;
      Posts.update({_id:mid},m,proxy.done(function(){
        proxy.emit('posts','')
      }))
      Medias.update({mid:mid},m,{multi: true},proxy.done(function () {
        proxy.emit('medias', '');
      }));
    })
  });
  return response.success(res, {});
}
