var Posts = require('../../models/posts').posts;
var Lives = require('../../models/lives').lives;
var Comments = require('../../models/comments').comments;
var Livesusers = require('../../models/lives').livesusers;
var Postsalbums = require('../../models/postsalbums').postsalbums;
var Sysconfigs = require('../../models/sysconfigs').sysconfigs;
var Attachs = require('../../models/attachs').attachs;
var Medias = require('../../models/medias').medias;
var Operatorlogs = require('../../proxy/operatorlogs');
var users = require('../../models/users').users;
var roles = require('../../models/roles').roles;
var response = require('../../lib/response');
var comm = require('../../lib/comm');
var des = require('../../lib/des');
var config = require('../../config');
var url = require('url');
var moment = require('moment');
var _ = require('lodash');
var eventproxy = require('eventproxy');
//上传xml内容
var Audit={
    get_login:function(req,res){//登陆
        var body={
            user_login:req.body.user_login,
            user_pass:req.body.user_pass,
            user_status:1
        }        
        users.findOne(body, function (err, user) {
            if (err) {
                return response.onError(res,err);
            } else {
                if (user) {
                  roles.findOne({_id:user.user_roleid}).exec(function (err, roles) {
                    Operatorlogs.save({
                      desc: "操作员在内容管理系统登录 成功",
                      user_login: body.user_login
                    });
                    var token=des.cipher(body.user_login+"|"+1200+"|"+moment().format('X'));
                    return response.onDataSuccess(res,{
                      data:{
                        token:token,
                        expires:1200,
                      }
                    });
                  })
                } else {
                  response.error(res, {message:"用户不在或者密码错误"});
                }
            }
        });
    },
    get_article:function(req,res){//获取待审核文章
        var title = req.query.title || "";
        var status = req.query.status || 1;//文章状态 1=已发布 0=未发布 2=已审核
        var type = req.query.type || -1;
        var stime= req.query.stime || '';
        var etime= req.query.etime || '';
        var query=Posts.where({});
        if (Boolean(title))query.where('title',eval('/'+title+'/ig'));
        if (Boolean(type) && type!==-1) query.where('type',type);
        if (Boolean(status) && status !== 1)query.where('status',status);
        if(_.isDate(stime))query.where('createtime').gte(moment(stime).format('YYYY-MM-DD HH:mm:ss'));
        if(_.isDate(etime))query.where('createtime').lte(moment(etime).format('YYYY-MM-DD HH:mm:ss'));

        var options = comm.get_page_options(req);
        Posts.find(query).select({title:1,createtime:1,author:1,type:1,pics:1}).sort("-createtime").skip(options.skip).limit(options.pagesize)
            .exec(function (err, models) {
            if(err || !models)return response.onError(res,"get_article err");
            models.forEach(function (node, index) {
                var node = node.toObject();
                if(node.createtime)node.createtime = parseInt(moment(node.createtime).format('X'));
                if(node.pics)node.pics = comm.replace_pics(node.pics);
                node.url=comm.replace_cms_url(node).split('?')[0]+'?mid='+node._id;
                config.types.forEach(function (item, j) {
                    if (item.id == node.type) {
                        node.typename = item.name;
                        return
                    }
                }) 
                models[index] = node;
            })
            return response.onListSuccess(res,{list:models});
        });
    },
    get_audit_comments:function(req,res){//获取评论
        var content = req.query.content || "";
        var status = req.query.status;//0=正常 -1=待审核
        var query=Comments.where({});
        if (Boolean(content))query.where('content',eval('/'+content+'/ig'));
        if (Boolean(status)){
          query.where('status',status);
        }else{
          query.where('status',{$in:[0,-1]})
        }
        var options = comm.get_page_options(req);
        Comments.find(query).select({content:1,createtime:1,nickname:1}).sort("-createtime").skip(options.skip).limit(options.pagesize)
            .exec(function (err, models) {
            if(err || !models)return response.onError(res,"get_audit_comments err");
            models.forEach(function (node, index) {
                var node = node.toObject();
                if(node.createtime)node.createtime = parseInt(moment(node.createtime).format('X'));
                models[index] = node;
            })
            return response.onListSuccess(res,{list:models});
        });
    },
    get_micro_live:function(req,res){//获取微直播
        var title = req.query.title || "";
        var status = req.query.status;//-2=正在创建 -1=停止 0=待审核 1=审核通过了
        var query=Lives.where({});
        if (Boolean(title))query.where('title',eval('/'+title+'/ig'));
        if (Boolean(status)){
          query.where('status',status)
        }else{
          query.where('status',{$gte:0})
        };
        var options = comm.get_page_options(req);
        Lives.find(query).select({title:1,createtime:1,type:1,user:1,cds:1,status:1}).sort("-createtime").skip(options.skip).limit(options.pagesize)
            .exec(function (err, models) {
            if(err || !models)return response.onError(res,"get_micro_live err");
            models.forEach(function (node, index) {
                var node = node.toObject();
                if(node.type===3){
                    node.cds.url=comm.replace_pics(node.cds.url)
                }else{
                    node.cds.url = config.live_ois_url + ':' + config.live_ois_port + '/' + node.cds.cid + '.m3u8?protocal=hls&user=' + node.cds.uid + '&tid=' + node.cds.tid + '&sid=' + node.cds.cid + '&type=3&token=guoziyun'
                }
                if(node.createtime)node.createtime = parseInt(moment(node.createtime).format('X'));
                models[index] = node;
            })
            return response.onListSuccess(res,{list:models});
        });
    },
    get_authentication:function(req,res){//获取实名认证
        var name = req.query.name || "";
        var id = req.query.id;
        var status = req.query.status;//-2=黑名单 默认0=正常 1=认证通过 2=认证失败
        var query=Livesusers.where({});
        if (Boolean(name))query.where('name',eval('/'+name+'/ig'));
        if (Boolean(id)) {query.where('_id',id)}
        if (Boolean(status)){
          query.where('status',status);
        }else{
          query.where('status',0)
        }
        var options = comm.get_page_options(req);
        Livesusers.find(query).select({name:1,createtime:1,occupation:1,place:1,idnumber:1,mpno:1,phone:1,applyreasons:1,idpics:1}).sort("-createtime").skip(options.skip).limit(options.pagesize)
            .exec(function (err, models) {
            if(err || !models)return response.onError(res,"get_authentication err");
            models.forEach(function (node, index) {
                var node = node.toObject();
                if(node.createtime)node.createtime = parseInt(moment(node.createtime).format('X'));
                if(node.idpics)node.idpics = comm.replace_pics(node.idpics);
                models[index] = node;
            })
            return response.onListSuccess(res,{list:models});
        });
    },
    get_active_list:function(req,res){//获取活动列表
        var title = req.query.title || "";
        var query=Posts.where({type:5,status:2,activityonline:1});
        if (Boolean(title))query.where('title',eval('/'+title+'/ig'));
        var options = comm.get_page_options(req);
        var proxy = new eventproxy();
        Posts.find(query).select({title:1,createtime:1,author:1,pics:1}).sort("-createtime").skip(options.skip).limit(options.pagesize)
            .exec(function (err, models) {
            if(err || !models)return response.onError(res,"get_article err");
            models.forEach(function (node, index) {
                var node = node.toObject();
                Postsalbums.count({mid:node._id,status:{$ne:1},from:4},proxy.done(function (count) {
                  Postsalbums.count({mid:node._id,status:-1,from:4},proxy.done(function (countother) {
                    node.allResource=count;
                    node.newResource=countother;
                    if(node.createtime)node.createtime = parseInt(moment(node.createtime).format('X'));
                    if(node.pics)node.pics = comm.replace_pics(node.pics);
                    models[index] = node;
                    proxy.emit('list','');
                  }));
                }));
            })
            proxy.after( "list",models.length,function(){
              return response.onListSuccess(res,{list:models});
            })
        });
    },
    get_active_postsalbums:function(req,res){//获取活动视频&图片
        var _id=req.query.id;
        var mid=req.query.mid;
        var desc = req.query.desc || "";
        var status = req.query.status;//0=正常，-1=待审核
        var query=Postsalbums.where({mid:_id,from:4});        
        if (Boolean(desc))query.where('desc',eval('/'+desc+'/ig'));
        if (Boolean(mid))query.where('_id',mid);
        if (Boolean(status)){
          query.where('status',status);
        }else{
          query.where('status',{$in:[0,-1]});
        }
        var options = comm.get_page_options(req);
        Postsalbums.find(query).select({name:1,createtime:1,pics:1,user:1,desc:1,video:1,type:1,user:1}).skip(options.skip).sort("-createtime").limit(options.pagesize)
            .exec(function (err, models) {
            if(err || !models)return response.onError(res,"get_active_postsalbums err");
            models.forEach(function (node, index) {
                var node = node.toObject();
                if(node.createtime)node.createtime = parseInt(moment(node.createtime).format('X'));
                models[index] = node;
            })
            return response.onListSuccess(res,{list:models});
        });
    },
    get_news_broke:function(req,res){//获取新闻爆料
        var content = req.query.content || "";
        var status = req.query.status;//状态2=已审核 1=待审核
        var id=req.query.id;
        var query=Attachs.where({from:2});
        if (Boolean(content))query.where('content',eval('/'+content+'/ig'));
        if (Boolean(id))query.where('_id',id);
        if (Boolean(status)){
          query.where('status',status);
        }else{
          query.where('status',{$gte:1});
        }
        var options = comm.get_page_options(req);
        Attachs.find(query).select({name:1,createtime:1,pics:1,user:1,content:1,video:1,type:1,mpno:1,files:1,location:1}).sort("-createtime").skip(options.skip).limit(options.pagesize)
            .exec(function (err, models) {
            if(err || !models)return response.onError(res,"get_active_postsalbums err");
            models.forEach(function (node, index) {
                var node = node.toObject();
                if(node.createtime)node.createtime = parseInt(moment(node.createtime).format('X'));
                if(node.pics)node.pics = comm.replace_pics(node.pics);
                if(node.video)node.video = comm.replace_pics(node.video);
                if(node.files){
                  var files=node.files
                  files.forEach(function(n,v){
                    n.pics=comm.replace_pics(n.pics);
                  })
                }
                node.url=comm.replace_broke_url(node)+'?mid='+node._id;
                models[index] = node;
            })
            return response.onListSuccess(res,{list:models});
        });
    },
    mobile_audit:function(req,res){//审核
        var type=req.body.type;
        var ids=req.body.ids;
        var status=req.body.status;  //1==通过 0==不通过  -1==删除
        var order;
        if (!type || !status || !ids) {
            return response.onError(res,"type empty");
        }
        switch(type){
            case '1'://审核文章
              if (status==1) {
                order=2
              }else if (status==0) {
                order=0
              }else{
                return response.onError(res,"status err")
              }
              ids.split(',').forEach(function(_id) {
                 Posts.findOneAndUpdate({_id:_id}, { status: order }).exec(function (err, model) {
                  if (err) {
                    return response.onError(res,"mobile_audit err");
                  }else{
                    Medias.remove({ mid: _id }, function (err) {});//先清空已上架的
                    if(order===2){
                      model.post_publish_status.forEach(function(node){
                          var medias = {
                              title: model.title,
                              subtitle:model.subtitle,
                              desc : model.desc,
                              content : model.content,
                              video : model.video,
                              source : model.source,
                              author : model.author,
                              createtime : moment(),
                              password : model.password,
                              commentstatus : model.commentstatus,
                              commentcount : model.commentcount,
                              clickcount : model.clickcount,
                              assistcount : model.assistcount,
                              tel:model.tel,
                              address:model.address===null?"":model.address,//地址 用于美食
                              score:model.score===null?0:model.score,//评分 用于美食
                              price:model.price===null?0:model.price,//价格 用于美食
                              members:model.members===null?"":model.members,
                              order : model.order,
                              type : model.type,
                              area : model.area,
                              hangye : model.hangye,
                              tag : model.tag,
                              tagtype : model.tagtype,
                              link : model.link,
                              attr:-1,
                              pics:model.pics,
                              pwidth:model.pwidth,
                              pheight:model.pheight,
                              imgextra:model.imgextra,
                              user_like_this_post:model.user_like_this_post,
                              activitystime:model.activitystime,
                              activityetime:model.activityetime,
                              activityaddress:model.activityaddress,
                              price:model.price
                          };
                          medias.mid=_id;
                          medias.cid=node.cid;
                          Medias.update({ mid: _id, cid: node.cid }, medias , { upsert: true }, function (err) {
                              if(!err){
                                Operatorlogs.save({
                                  desc: "媒资上架 _id:" + _id+" 上架到 分类["+ node.cid+"]",
                                  user_login: req.user_login
                                });
                              }
                          })
                      })
                    }
                  }     
                 }); 
              });
              return response.onSuccess(res,'操作成功');
              break;
            case '2'://审核评论
              if (status==1) { //0=正常 -1=待审核 1=不通过&逻辑删除
                order=0
              }else if (status==0) {
                order=-1
              }else if(status==-1){
                order=1
              }else {
                return response.onError(res,"status err")
              }
              ids.split(',').forEach(function(_id){

                Comments.findOneAndUpdate({_id:_id} , {"$set":{status:order}} , function(err,model){
                  if(order==0){
                    var m={$inc: { "commentcount": 1 }};
                  }else if(order==1){
                    var m={$inc: { "commentcount": -1 }};
                  }else {
                    var m={$inc: { "commentcount": 0 }};
                  }
                  var proxy = new eventproxy();
                  proxy.all('medias','posts',function(medias,posts){
                    Operatorlogs.save({
                      desc: "审核评论:" + _id,
                      user_login: req.user_login
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
              })
              return response.onSuccess(res,'操作成功');               
              break;
            case '3'://审核微直播
                var rejectionReason=req.body.rejectionReason
                var desc="审核通过" 
                if (status==1) {  // 默认是待审核 -2=正在创建 -1=停止 0=待审核 1=审核通过了 -3=逻辑删除
                  order=1
                }else if (status==0) {
                  desc="审核失败"
                  order=-1
                }else if(status==-1){
                  desc="删除直播"
                  order=-2
                }else{
                  return response.onError(res,"status err")
                }  
                ids.split(',').forEach(function(_id){
                  Lives.findOneAndUpdate({_id:_id},{status:order}).exec(function(err,model){
                    model.status=order;
                    if (err) {
                      return response.onError(res,"err")
                    } else {
                      if (Boolean(rejectionReason)) {
                        model.reject = {
                            reason: rejectionReason,
                            time: Date.now()
                        };
                        delete model.guest;
                      }
                      var request = require('request');
                      var chatroomid=model.chatroom.chatroomid
                      var info="";
                      if(model.status=='1' || model.status=='-1'){
                        info=model.status=='-1'?"直播驳回了！理由："+rejectionReason:"直播开始了！";
                        var extra=model.status=='-1'?"closed":"info";
                        comm.sendMessage({chatroomid:chatroomid,info:info,extra:extra},function(err,result){});
                        if(model.status=="-1"){
                          console.log(model.status)
                          Lives.findOne({_id:_id},function(err,item){
                            var http = require('http');
                            var data='<?xml version="1.0" encoding="utf-8"?>'
                                data+='<SOAP-ENV:Envelope xmlns:SOAP-ENV="default" SOAP-ENV:encodingStyle="default"><SOAP-ENV:Body>';
                                data+='<minichnl uid="'+item.cds.uid+'" tid="'+item.cds.tid+'" cid="'+item.cds.cid+'" cds_id="'+item.cds.cdsid+'" token="guoziyun" />';
                                data+='</SOAP-ENV:Body></SOAP-ENV:Envelope>';
                            var opurl = {
                                host:config.live_ois_url.replace("http://",""),
                                port:5000,
                                path:"/ois/minichnl/destroy",
                                method:"POST",
                                data:data,
                                headers:{
                                "Connection":"Keep-Alive",
                                "Content-Type":'application/xml;charset=utf-8',
                                "Content-length":data.length}
                            }
                            console.log(opurl);
                            var reqVideo = http.request(opurl, function (serverFeedback) {
                                serverFeedback.setEncoding('utf8');
                                console.log('getVideo:' + serverFeedback.statusCode);
                                if (serverFeedback.statusCode == 200) {
                                    console.log(serverFeedback.statusCode)
                                } else {
                                    console.log(serverFeedback.statusCode)
                                }
                            })
                            reqVideo.write(data+"\n");
                            reqVideo.end();
                          })
                        }
                      }
                      Operatorlogs.save({desc: info+":"+_id+"[聊天室:"+chatroomid+"]" ,user_login: req.user_login});
                    }
                  }) ;
                })
                return response.onSuccess(res,'操作成功');
                break;
            case '4'://审核实名认证
                var desc="认证通过" 
                if (status==1) {   //-2=黑名单 默认0=正常 1=认证通过 2=认证失败
                  order=1
                }else if (status==0) {
                  desc="认证失败"
                  order=2
                }else if(status==-1){
                  desc="删除认证"
                  order=-2
                }else{
                  return response.onError(res,"status err")
                }  
                ids.split(',').forEach(function(_id){
                  Livesusers.update({_id:_id},{status:order},function(err){
                    Operatorlogs.save({
                      desc: desc+"实名认证:" + _id,
                      user_login: req.user_login
                    });
                  }) ;
                })
                return response.onSuccess(res,'操作成功');
                break;
            case '5'://审核爆料
              if (status==1) {
                order=2
              }else if (status==0) {
                order=-2
              }else if(status==-1){
                order=-3
              }else{
                return response.onError(res,"status err")
              }  
              ids.split(',').forEach(function(_id){
                if(status==0){
                  Attachs.update({_id:_id},{status:order},function(err){
                    Operatorlogs.save({
                      desc: "新闻爆料被驳回:" + _id,
                      user_login: req.user_login
                    });
                  }) ;
                }else if(status==1){
                  Attachs.find({_id:_id}).exec(function(err,models){
                    if(!err){
                      models.forEach(function(model,index){
                        var imgs=[]
                        var posts = new Posts({
                          title : model.content,
                          desc : model.content,
                          video: model.video,//form=0 要重写video
                          type: model.type,
                          status:1,//进入审核阶段
                          pics: model.pics,
                          address:model.location.address,
                          author:model.mpno,
                          _id:model._id,
                        });
                        console.log(posts);
                        if(model.files.length>0){
                          model.files.forEach(function(node){
                            posts.imgextra.push({src:node.pics});
                            imgs.push({title:node.name,desc:node.name,imgurl:node.pics})
                          });
                        }
                        posts.post_publish_status.push({cid:model.columnid});
                        Posts.findOneAndUpdate({_id:model._id},posts,{upsert: true}, function (err) {
                          console.log(err);
                          if(!err){
                            Attachs.update({_id:model._id},{status:order},function(err){}) ;
                            Operatorlogs.save({
                                desc: "新闻爆料审核上架 _id:" + model._id+" 到 分类["+model.columnid+"]",
                                user_login: req.user_login
                            });
                          }
                        })
                      })
                    }
                  })
                }else if (status==-1) {
                  Attachs.update({ _id:_id}, {status:order},{ multi: true },function (err) {
                    if(!err){
                      Operatorlogs.save({
                        desc: "删除了手机上传 :" + _id ,
                        user_login: req.user_login
                      });
                    }
                  });
                }
              })
              return response.onSuccess(res,'操作成功');
              break;
            case '6'://审核活动
                var desc="通过审核" 
                if (status==1) {
                  order=0
                }else if (status==0) {
                  desc="审核失败"
                  order=2
                }else if(status==-1){
                  desc="删除"
                  order=1
                }else{
                  return response.onError(res,"status err")
                }  
                ids.split(',').forEach(function(_id){
                  Postsalbums.update({_id:_id},{status:order},function(err){
                    Operatorlogs.save({
                      desc: desc+"活动:" + _id,
                      user_login: req.user_login
                    });
                  }) ;
                })
                return response.onSuccess(res,'操作成功');
                break;
            default:
              return response.onError(res,"type err")
            break;
        }
    },
    
}
module.exports=Audit;