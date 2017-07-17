var Posts = require('../models/posts').posts;
var Lives = require('../models/lives').lives;
var Cloud = require('../models/cloudfile').cloudfile;
var Statistics = require('../models/statistics').statistics;
var Medias = require('../models/medias').medias;
var Operatorlogs = require('../proxy/operatorlogs');
var response = require('../lib/response');
var moment = require('moment');
var config = require('../config');
var fs = require('fs');
var eventproxy = require('eventproxy');
var comm = require('../lib/comm');
var request = require('request');
var URL=config.joygo_cloud_url;
//热点推送
exports.media_list=function(req,res){/*
    var o = {};
    o.map = function () { emit(this.mid,1) }
    o.reduce = function (key, values) {
        return Array.sum(values);
    }
    o.query={type:0};
    o.out = { replace: 'statisticsposts' }
    o.verbose = true;
    Statistics.mapReduce(o,function(err,model,stats){
        model.find().exec(function (err, docs) {
            docs.forEach(function(node,index){
                Posts.findOneAndUpdate({_id:node._id},{clickcount:node.value},function(err,model){

                })
            })
        });
    })
    var o = {};
    o.map = function () { emit(this.mid,1) }
    o.reduce = function (key, values) {
        return Array.sum(values);
    }
    o.query={type:1};
    o.out = { replace: 'statisticslives' }
    o.verbose = true;
    Statistics.mapReduce(o,function(err,model,stats){
        model.find().exec(function (err, docs) {
            docs.forEach(function(node,index){
                Lives.findOneAndUpdate({_id:node._id},{clickcount:node.value},function(err,model){

                })
            })
        });
    })*/

    return res.render('admin/medialist', {
        title: '媒资推送',
    });
}
exports.media_ajax_list=function(req,res){
        try {
            var title = req.query.title;
            var options = comm.get_page_options(req);
            var query = {status:2};
            if (Boolean(title))query.title=eval('/'+title+'/ig');
            var proxy = new eventproxy();
            proxy.all('count','posts',function(count,posts){
                posts.forEach(function (node, index) {
                    var node = node.toObject();
                    config.types.forEach(function (item, j) {
                        if (item.id == node.type) {
                            node.typename = item.name;
                            node.typestyle = item.style;
                            return
                        }
                    })
                    node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
                    node.index = index + 1;
                    posts[index] = node;
                })
                return res.send({
                    code:1,
                    count:count,
                    pagecount: Math.ceil(count / options.pagesize),
                    currentpage:options.currentpage,
                    posts_hotlist:posts
                });

            })
            Posts.count(query,proxy.done(function(count){
                proxy.emit('count',count);
            }))
            Posts.find(query).sort('-clickcount').skip(options.skip).limit(options.pagesize)
            .exec(proxy.done(function(posts) {
                proxy.emit('posts',posts);
            }));
        } catch (e) {
            console.log('error when exit', e.stack);
        }
};
exports.micro_list=function(req,res){
     return res.render('admin/microlist', {
            title: '微播推送',
        });
}
exports.micro_ajax_list=function(req,res){
        try {
            var title = req.query.title;
            var options = comm.get_page_options(req);
            var query = {status:1};
            if (Boolean(title))query.title=eval('/'+title+'/ig');
            var proxy = new eventproxy();
            proxy.all('count','lives',function(count,lives){
                lives.forEach(function (node, index) {
                    var node = node.toObject();
                    node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
                    node.index = index + 1;
                    lives[index] = node;
                })
                return res.send({
                    code:1,
                    count:count,
                    pagecount: Math.ceil(count / options.pagesize),
                    currentpage:options.currentpage,
                    lives_hotlist:lives,
                });

            })
            Lives.count(query,proxy.done(function(count){
                proxy.emit('count',count);
            }))
            Lives.find(query).sort('-clickcount').skip(options.skip).limit(options.pagesize)
            .exec(proxy.done(function (lives) {
                proxy.emit('lives',lives);
            }));
        } catch (e) {
            console.log('error when exit', e.stack);
        }
};
exports.postspush_ajax=function(req,res){
    var _ids=req.body._id;
    var cloud={};
    proxy = new eventproxy();
    Posts.find({_id:{$in:_ids}},function(err,list){
        proxy.after( "pushmessage",list.length,function(pushmessage){
            response.success(res,"推送成功")
        })
        list.forEach(function(model, index){
            //通过model给cloud赋值
            model=model.toObject();
            cloud.mid=String(model._id);
            cloud.title=model.title;
            cloud.subtitle=model.subtitle;
            cloud.pics=comm.replace_pics(model.pics);
            cloud.type=model.type;
            cloud.assistcount=model.assistcount;
            cloud.pheight=model.pheight;
            cloud.pwidth=model.pwidth;
            cloud.tagtype=model.tagtype;
            cloud.tag=model.tag;
            cloud.commentcount=model.commentcount;
            cloud.clickcount=model.clickcount;
            cloud.createtime=moment(model.createtime).format('YYYY-MM-DD HH:mm:ss');
            cloud.author=model.author;
            cloud.source=model.source;
            cloud.video=comm.replace_pics(model.video);
            cloud.desc=model.desc;
            cloud.url=comm.cloud_replace_url(cloud);
            cloud.shareurl=comm.cloud_replace_shareurl(cloud);
            cloud.imgextra=model.imgextra;
            cloud.datafrom=config.wwwname;
            cloud.appkey=config.website;
            cloud.version=config.version;
            if(cloud.imgextra.length>0){
                cloud.imgextra.forEach(function(node, index){
                    node.src=comm.replace_pics(node.src)
                });
            }
            request.post({url:URL+'/api/set_cloud',form:cloud},function(err,response, body){
                if (!err) {
                    Posts.update({_id:model._id},{$set:{pushstatus:1}},function(err,data){
                        proxy.emit('pushmessage', cloud.title);
                   })
                }
            });
        });
    })
};
exports.livespush_ajax=function(req,res){
    var _ids=req.body._id;
    var cloud={};
    proxy = new eventproxy();
    Lives.find({_id:{$in:_ids}},function(err,list){
        proxy.after( "pushmessage",list.length,function(pushmessage){
            response.success(res,"推送成功")
        })
        list.forEach(function(model, index){
            //通过model给cloud赋值
            model=model.toObject();
            cloud.lid=String(model._id);
            cloud.reject=model.reject;
            cloud.createtime=model.createtime;
            cloud.starttime=model.starttime;
            cloud.tagicon=model.tagicon;
            cloud.status=model.status;
            cloud.attr=model.attr;
            cloud.type=3;
            cloud.pics=comm.replace_pics(model.pics);
            cloud.clickcount=model.clickcount;
            cloud.assistcount=model.assistcount;
            cloud.guest=model.guest;
            cloud.chatroom=model.chatroom;
            cloud.columns=model.columns;
            cloud.location=model.location;
            cloud.datafrom=config.wwwname;
            cloud.cds=model.cds;
            if(model.type==3){
            cloud.cds.url=comm.replace_pics(model.cds.url);
            }else{
            cloud.cds.url=config.live_ois_url + ':' + config.live_ois_port + '/' + model.cds.cid + '.m3u8?protocal=hls&user=' + model.cds.uid + '&tid=' + model.cds.tid + '&sid=' + model.cds.cid + '&type=3&token=guoziyun'
            }
            cloud.user=model.user;
            cloud.user.face=comm.replace_pics(model.user.face);
            cloud.desc=model.desc;
            cloud.title=model.title;
            cloud.appkey=config.website;//域名
            cloud.version=config.version;//版本
            request.post({url:URL+'/api/set_cloud_lives',form:cloud},function(err,response, body){
                if (!err) {
                    Lives.update({_id:model._id},{$set:{pushstatus:1}},function(err,data){
                        proxy.emit('pushmessage', cloud.title);
                   })
                }
            });
        });
    })
};
exports.get_cloud_list=function(req,res){
    var page=req.query.page;
    var cid=req.query.cid;
    var cloud_list=[] ;
    Cloud.find().exec(function(err,models){
        models.forEach(function(node, index){
            cloud_list.push({sid:node.sid,cid:node.cid})
        });
        request.get({url:URL+'/api/get_cloud?page='+page+'&pagesize=12'},function(err,body){
            if(!err){
                var bodylist=JSON.parse(body.body);
                var list=bodylist.list
                list.forEach(function(node, index){
                    config.types.forEach(function (item, j) {
                        if (item.id == node.type) {
                            node.typename = item.name;
                            node.typestyle = item.style;
                            return
                        }
                    })
                    node.index = index+1;
                    node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
                    node.publish='未上架'
                    node.style='text-muted'
                    if(cid!=""){
                       cloud_list.forEach(function(e,j){
                           if(e.sid==node._id && e.cid==cid){
                                node.style='text-danger'
                                node.publish='已上架'
                           }
                       });
                    }
                    list[index] = node;
                });
                response.success(res,{
                    list:list,
                    page:Number(bodylist.page),
                    pagecount:bodylist.pagecount
                }) ;
            }
        })
    })
};
exports.cloud_up=function(req,res){
    var _idarray=[];
    req.body._ids.forEach(function(node,index){
        _idarray.push(node.value);
    })
    //发布的分类id
    var cid = req.body.cid;
    var list=req.body.list;
    _idarray.forEach(function (_id,index) {
        var node=list[index];
        medias = {
            mid:node.mid,
            title:node.title,
            imgextra:(node.imgextra)?node.imgextra:[],
            pheight:node.pheight,
            pwidth:node.pwidth,
            pics:node.pics,
            tagtype:node.tagtype,
            tag:node.tag,
            type:node.type,
            assistcount:node.assistcount,
            clickcount:node.clickcount,
            commentcount:node.commentcount,
            createtime:node.createtime,
            author:node.author,
            source:node.source,
            video:node.video,
            desc:node.desc,
            subtitle:node.subtitle,
            url:node.url,
            shareurl:node.shareurl
        }
        medias.cid=cid;
        Cloud.update({sid: medias.mid,cid:cid},{sid: medias.mid,cid:cid},{ upsert: true }, function (err) {});
        Medias.update({ mid: medias.mid, cid: cid }, medias , { upsert: true }, function (err) {
            if(!err){
              Operatorlogs.save({
                desc: "媒资上架 _id:" + _id+" 上架到 分类["+ cid+"]",
                user_login: req.session.user.user_login
              });
            }
        })
    })
    response.success(res, "ok");
};
exports.postsunpush_ajax=function(req,res){
    var mid=req.query.mid
    request.post({url:URL+'/api/delete_cloud',form:{mid:mid}},function(err){
        if (!err) {
            Posts.update({_id:mid},{$set:{pushstatus:0}},function(err){
                response.success(res,"取消推送")
            })
        }
    });
};
exports.livesunpush_ajax=function(req,res){
    var lid=req.query.lid
    console.log('1');
    request.post({url:URL+'/api/delete_cloud_lives',form:{lid:lid}},function(err){
        if (!err) {
            Lives.update({_id:lid},{$set:{pushstatus:0}},function(err){
                response.success(res,"取消推送")
            })
        }
    });
}