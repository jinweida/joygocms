var Postsalbums=require('../models/postsalbums').postsalbums;
var eventproxy = require('eventproxy');
var nodeExcel = require('excel-export');
var response = require('../lib/response');
var moment = require('moment');
var comm = require('../lib/comm');
var validator = require('validator');
var Posts = require('../models/posts').posts;
var Associated = require('../models/posts').associated;
var Hostair = require('../models/posts').hostair;
var Counters = require('../models/counters').counters;
var Operatorlogs = require('../proxy/operatorlogs');
var config = require('../config');
var Lives = require('../models/lives').lives;
var Regtemplate = require('../models/regtemplate').regtemplate;
var Registration = require('../models/regtemplate').registration;
var Regnotice = require('../models/regtemplate').regnotice;
var operatorlogs = require('../proxy/operatorlogs');
var request = require('request');
//微笑迎青
exports.postsalbums_list = function (req, res) {
  var mid=req.query.mid;
  var proxy = new eventproxy();
  proxy.all('post','lives',function(post,lives){
    if (lives) {
      var url=lives.cds.url
    }else{
      var url=""
    }
    return res.render('admin/posts/postsalbums', {
      title: post.title,
      activitytype: post.activitytype,
      activitylives: post.activitylives,
      columns:req.columns,
      url:url
    });
  })
  Posts.findOne({_id:mid},function(err,model){
    proxy.emit('post',model)
  })
  Lives.findOne({pid:mid},function(err,model){
    proxy.emit('lives',model)
  })
};
exports.set_postsalbums = function (req, res) {
	var mid=req.body.mid;
  Counters.findOneAndUpdate({_id:mid},{$inc:{seq:1}},{new:true,upsert:true},function(err,model){
      var num=model.seq;
      var postsalbums = new Postsalbums();
      postsalbums.mid=mid;
      postsalbums.no=num;
      postsalbums.assistcount=req.body.assistcount?req.body.assistcount:0;
      postsalbums.name=req.body.videotitle;
      postsalbums.pics=req.body.activitypics;
      postsalbums.desc=req.body.videodesc;
      postsalbums.from=req.body.vtype;
      postsalbums.type=req.body.activitytype;
      postsalbums.video.url=req.body.activityvideos;
      postsalbums.status=0;
      postsalbums.save(function (err) {
        if (err) { }else{
          Operatorlogs.save({
              desc: "活动后台上传资源 _id:"+mid,
              user_login: req.session.user.user_login
          });
          response.success(res, '');
        }
      });
  });
};
exports.postsalbums_ajax_list=function(req, res){
    try {
        var mid=validator.trim(req.body.mid)
    	  var form=validator.trim(req.body.form)?validator.trim(req.body.form):4
        var no=validator.trim(req.body.no);
        var nickname=validator.trim(req.body.nickname);
        var proxy = new eventproxy();
        var options = comm.get_page_options(req);
        proxy.all('count','list',function(count,list){
            list.forEach(function (node, index) {
                var node = node.toObject();
                node.createtime = moment(node.createtime).format('MM-DD HH:mm');
                node.index = index + 1;
                list[index] = node;
            })
            return response.success(res,{
                pagecount: Math.ceil(count / options.pagesize),
                currentpage:options.currentpage,
                list: list
            });
        })
        if (form!==4) {
          form={$ne:4}
        } 
        var where = {}
        var query=Postsalbums.where({status:{$ne:1},mid:mid,from:form});
        if (Boolean(no))query.where('no',no);
        if (Boolean(nickname)) query.where('name',eval('/'+nickname+'/ig'));
        // if(sort!==''){
        //     if(sort==0){query.sort("-assistcount status")}
        //     query.sort("status -createtime")
        // }
        query.skip(options.skip).limit(options.limit).select({user_like_this_post:0})
        .exec(proxy.done(function(models) {
            proxy.emit('list',models);
        }));
        Postsalbums.count(query,proxy.done(function (count) {
            proxy.emit('count',count);
        }));
    } catch (e) {
        console.log('error when exit', e.stack);
    }
}
exports.postsalbums_update=function(req,res){
    var _id=req.body._id.split(',');
    var status=req.body.status;
    _id.forEach(function(id) {
        Postsalbums.update({_id:id},{status:status},function(err){
            if(err){console.log(err);}
        })
    })
    response.success(res, "");
}
//导出excel
exports.excel = function (req, res) {
    var conf = {};
    conf.cols = [
        { caption: '编号', type: 'number' },
        { caption: '姓名', type: 'string' },
        { caption: '票数', type: 'number' },
        { caption: '手机号', type: 'string' , width: 20 },
        { caption: '描述', type: 'string' , width: 100 }
    ];
    conf.rows = [];
    var mid = req.query.mid;
    try {
        Postsalbums.find({status:0,mid:mid}).sort('-createtime')
            .exec(function (err, models) {
                if (err) {
                    res.end("出错了");
                } else {
                    models.forEach(function (node, index) {
                        var node = node.toObject();
                        var rows = [];
                        rows.push(node.no);
                        rows.push(node.name);
                        rows.push(node.assistcount);
                        rows.push(node.user.mpno);
                        rows.push(node.desc);
                        conf.rows.push(rows);
                    })
                    var result = nodeExcel.execute(conf);
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                    res.setHeader("Content-Disposition", "attachment; filename=" + moment().format('YYYYMMDDHHmmss') + ".xlsx");
                    res.end(result, 'binary');
                }
            });
    } catch (e) {
        console.log('error when exit', e.stack);
    }
}
//导出reg_excel
exports.reg_excel = function (req, res) {
  var mid=validator.trim(req.query.mid);
  var conf = {};
  Registration.find({pid:mid}).sort('-createtime').exec(function(err,models){
    if (err) {
      res.end("出错了");
    }else {
      var arr = []
      models.forEach(function (node, index) {
          if (index<1) {
            node.information.forEach( function(e, i) {
              arr.push({ caption: e.key, type: 'string' })
            });
          }
      })  
      conf.cols=arr;
      conf.rows = [];
      models.forEach(function (node, index) {
        var rows = [];
        node.information.forEach( function(e, i) {
          rows.push(e.value);
        });
        conf.rows.push(rows);
      })
      var result = nodeExcel.execute(conf);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats');
      res.setHeader("Content-Disposition", "attachment; filename=" + moment().format('YYYYMMDDHHmmss') + ".xlsx");
      res.end(result, 'binary');
    }
  })
}
//开通直播间
exports.open_air=function(req,res){
  var mid=validator.trim(req.body.mid);
  var url=validator.trim(req.body.url); 
  var lives=new Lives()
  var proxy = new eventproxy();
  proxy.all('chatroomdata',function(chatroomdata){
      lives.chatroom.chatroomid=chatroomdata.chatroomid;
      lives.chatroom.chatroomname=chatroomdata.chatroomname;
      lives.chatroom.isjoin=true;
      lives.save(function (err) {
        if (err) { }
      });
      return response.success(res,{url:url});
  })
  Posts.findOneAndUpdate({_id:mid},{activitylives:1},{new:true,upsert:true},function(err,model){
    var chatroomdata={chatroomid:moment().format("YYYYMMDDHHmmss"),chatroomname:model.title,isjoin:true};
     lives.pid=mid;
     lives.title=model.title;
     lives.desc=model.desc;
     lives.type=4;
     lives.status=1;
     lives.cds.url=url;
     request.post({url:config.live_chatroom_create,form:chatroomdata},function(err,respons, body){
       var info=JSON.parse(body);
       if (info.code==200) {
          proxy.emit('chatroomdata',chatroomdata)
       }
     });
  });
}
//设置直播间
exports.set_air=function(req,res){
  var mid=validator.trim(req.body.mid);
  var url=validator.trim(req.body.url);
  var model={
    cds:{
      url:url
    }
  }
  Lives.update({pid:mid},model,function(err,model){
    if (!err) {
      return response.success(res,{url:url});
    }
  });
}
//关联主播
exports.set_host = function (req, res) {
  var mid=validator.trim(req.body.mid);
  var pid=validator.trim(req.body.pid);
  var title=validator.trim(req.body.title);
  var hostair=new Hostair()
  hostair.pid=pid;
  hostair.mid=mid;
  hostair.title=title;
  hostair.save(function(err){
    if (err) {
      console.log(err)
    }else{
      return response.success(res,{});
    }
  })
};
//删除主播
exports.del_host = function (req, res) {
  var id=validator.trim(req.body.id);
  Hostair.remove({_id:id},function(err){
    if (!err) {
      operatorlogs.save({
          desc: "删除活动主播 _id:" + id ,
          user_login: req.session.user.user_login
      });
      return response.success(res,{});
    }
  })
};
//获取主播
exports.host_ajax_list = function (req, res) {
  var mid=validator.trim(req.query.mid);
  Hostair.find({mid:mid},function(err,models){
    models.forEach(function (node, index) {
        var node = node.toObject();;
        node.index =index + 1;
        models[index] = node;
      })
    return response.success(res,{
        list: models
    });
  })
};
//关联新闻
exports.set_associated=function(req,res){
  var pid=validator.trim(req.body.mid);
  var nid=validator.trim(req.body.nid);
  var title=validator.trim(req.body.title); 
  var type=validator.trim(req.body.type); 
  var postcreattime=validator.trim(req.body.postcreattime);
  var associated=new Associated();
  associated.pid=pid;
  associated.nid=nid;
  associated.title=title;
  associated.type=type;
  associated.postcreattime=postcreattime;
  associated.save(function(err){
    if (err) {
      console.log(err)
    }else {
      return response.success(res,{});
    }
  })
};
//删除新闻
exports.del_associated = function (req, res) {
  var id=validator.trim(req.body.id);
  Associated.remove({_id:id},function(err){
    if (!err) {
      operatorlogs.save({
          desc: "删除活动主播 _id:" + id ,
          user_login: req.session.user.user_login
      });
      return response.success(res,{});
    }
  })
};
//获取关联新闻
exports.get_associated=function(req,res){
  var mid=validator.trim(req.query.mid);
  Associated.find({pid:mid},function(err,models){
    models.forEach(function (node, index) {
        var node = node.toObject();;
        node.index =index + 1;
        models[index] = node;
      })
    return response.success(res,{
        list: models
    });
  })
};
//设置报名表
exports.set_regtemplate=function(req,res){
  var pid=validator.trim(req.body.mid);
  var value=validator.trim(req.body.value);
  var template=[]
  var regtemplate={};
  value.split(',').forEach(function(node,index){
    var a=node.split('|');
    template.push({
      key:a[1],
      type:'text',
      name:a[0],
      status:a[3],
      maxlength:a[2] || 0
    })
  }) 
  regtemplate.pid=pid;
  regtemplate.template=template;
  Regtemplate.update({pid:pid},regtemplate,{ upsert: true },function(err){
    if(err){
      console.log(err)
    }else {
      return response.success(res,{})
    }
  })
};
//获取报名表
exports.get_regtemplate=function(req,res){
  var mid=validator.trim(req.query.mid);
  Regtemplate.findOne({pid:mid},function(err,models){
    if (!err && models) {
      models.template.forEach(function (node, index) {
        var node = node.toObject();;
        node.index =index + 1;
        models.template[index] = node;
      })
      return response.success(res,{
          list: models.template
      });
    }
  })
};
//获取报名信息
exports.get_registration=function(req,res){;
  var mid=validator.trim(req.query.mid);
  Registration.find({pid:mid}).sort('-createtime').exec(function(err,models){
    models.forEach(function (node, index) {
      var node = node.toObject();;
      node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm');
      models[index] = node;
    })
    return response.success(res,{list:models})
  })
};
//获取短信列表
exports.get_regnotice=function(req,res){;
  var mid=validator.trim(req.query.mid);
  Regnotice.find({mid:mid}).sort('-createtime').exec(function(err,models){
    models.forEach(function (node, index) {
      var node = node.toObject();;
      node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm');
      models[index] = node;
    })
    return response.success(res,{list:models})
  })
};

