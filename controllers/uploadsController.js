var attachs = require('../models/attachs').attachs;
var Posts = require('../models/posts').posts;
var Medias = require('../models/medias').medias;
var Pics=require('../models/pics').pics;
var response = require('../lib/response');
var comm = require('../lib/comm');
var moment = require('moment');
var _ = require('lodash');
var Operatorlogs = require('../proxy/operatorlogs');

exports.list = function (req, res) {
    try {
        var content=comm.get_req_string(req.query.content,'');
        var status=comm.get_req_string(req.query.status,'');
        var where={}
        if (status) {
            where={status:status};
        }else {
            where={status:{$gt:-3}};           
        }
        if (content !== undefined && content != '') where.content = eval("/"+content+"/");
        where.from=2;
        var options = comm.get_page_options(req);
        attachs.count(where, function (error, count) {
            if (error) {
            } else {
                attachs.find(where)
                .populate('columnid',"name").sort("-createtime").limit(options.pagesize)
                .exec(function (err, models) {
                    res.render('admin/uploads_list', {
                        title: "新闻报料",
                        count:count,
                        pagecount: Math.ceil(count / options.pagesize),
                        pagesize: options.pagesize,
                        models: get_attachs_format(models,options)
                    });
                });
            }
        });
    } catch (e) {
        console.log('error when exit', e.stack);
    }
}

exports.ajax_get_uploads_list = function (req, res) {
    var content=comm.get_req_string(req.query.content,'');
    var status=comm.get_req_string(req.query.status,'');
    var where={}
    if (status) {
        where={status:status};
    }else {
        where={status:{$gt:-3}};           
    }
    if (content !== undefined && content != '') where.content = eval("/"+content+"/");
    where.from=2;
    var options = comm.get_page_options(req);    
    attachs.count(where, function (error, count) {
        if (error) {
        } else {
            attachs.find(where)
            .populate('columnid',"name").sort("-createtime").limit(options.pagesize).skip(options.skip)
            .exec(function (err, models) {
                response.success(res, {
                    title: "新闻报料",
                    count:count,
                    pagecount: Math.ceil(count / options.pagesize),
                    pagesize: options.pagesize,
                    models: get_attachs_format(models,options)
                });
            });
        }
    });
}
function get_attachs_format(models,options){
    models.forEach(function (node, index) {
        var node = node.toObject();
        node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
        node.shorttitle=comm.get_substring({str:node.content});
        if(node.status===2){
            node.statusname='已审核';
            node.statusstyle="btn-success";
        }else if(node.status===1){
            node.statusname='待审核';
            node.statusstyle="btn-primary";
        }else if(node.status===0){
            node.statusname='转码中';
            node.statusstyle="btn-danger";
        }else if(node.status===-1){
            node.statusname='转码失败';
            node.statusstyle="btn-warning";
        }else if(node.status===-2){
            node.statusname='被驳回';
            node.statusstyle="btn-warning";
        }
        node.typename='查看';
        node.typestyle="btn-default"
        node.columnname="";
        node.files=_.pluck(node.files,'pics').join(',');
        if(node.columnid!==null)
            node.columnname=node.columnid.name;
        node.index = options.skip + index + 1;
        models[index] = node;
    })
    return models;
}
exports.delete = function (req, res) {
    var idarray=[];
    req.body._ids.forEach(function(node,index){
        idarray.push(node.value);
    })
    //删除只改变状态
    attachs.update({ _id: {$in:idarray} }, {status:-3},{ multi: true },function (err) {
        if(!err){
            Operatorlogs.save({
                desc: "删除了手机上传 :" + idarray.toString() ,
                user_login: req.session.user.user_login
            });
        }
    });
    response.success(res, {});
}
//审核用户上传
exports.audit=function(req,res){
    //写入posts
    try {
        var idarray=[];
        var status=comm.get_req_string(req.body.status,'');
        req.body._ids.forEach(function(node,index){
            idarray.push(node.value);
        })
        var errflag = false;
        if(status==='-2'){
            attachs.update({_id:{$in:idarray}},{status:status},function(err){
                Operatorlogs.save({
                    desc: "新闻爆料被驳回:" + idarray.join('|'),
                    user_login: req.session.user.user_login
                });
            }) ;
        }else if(status==="2"){
            attachs.find({_id:{$in:idarray} }).exec(function(err,models){
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
                        //Pics.update({_id:model._id},{imgs:imgs},{upsert: true}, function (err) {});
                        Posts.findOneAndUpdate({_id:model._id},posts,{upsert: true}, function (err) {
                            console.log(err);
                            if(!err){
                                attachs.update({_id:model._id},{status:status},function(err){}) ;
                                Operatorlogs.save({
                                    desc: "新闻爆料审核上架 _id:" + model._id+" 到 分类["+model.columnid+"]",
                                    user_login: req.session.user.user_login
                                });
                            }
                        })
                    })
                }
            })
        }
        response.success(res, "ok");
    }
    catch (e) {
        response.error(res, e.stack);
    }
}