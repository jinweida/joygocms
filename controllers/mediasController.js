var Medias = require('../models/medias').medias;
var Posts = require('../models/posts').posts;
var Operatorlogs = require('../proxy/operatorlogs');
var response = require('../lib/response');
var moment = require('moment');
var config = require('../config');
var comm = require('../lib/comm');
var Cloud = require('../models/cloudfile').cloudfile;
//处理置顶过期的记录
setInterval(function () {
    var query = {};
    query.toptime = { $lt: moment().format('YYYY-MM-DD HH:mm:ss') };
    query.attr=1;
    Medias.update(query, { attr: -1 }, { multi: true},function (err) {
        if (err) {
        }
    });
}, 10*60*1000);
exports.up = function (req, res) {
    try {
        res.render("admin/medias_up", {
            title: '媒资上架',
            columns: req.columns,
            types:config.types
        });
    } catch (e) {
        console.log(e.stack);
    }
};
exports.down = function (req, res) {
    try {
        res.render('admin/medias_down', {
            title: '媒资下架',
            columns: req.columns,
            types: config.types
        });
    } catch (e) {
        console.log(e.stack);
    }
};
exports.ajax_up_count = function (req, res) {
    var where = {};
    var title = req.query.title;
    if (title !== undefined && title != '') {
        where.title = { $regex: title, $options: 'i' };
    }
    var type = req.query.type;
    if (type !== undefined && type != -1) {
        where.type = type;
    }
    where.status = 2;//必须是已审核的资源
    var options = comm.get_page_options(req);
    Posts.count(where, function (error, count) {
        if (error) {
        } else {
            response.success(res, {
                pagecount: Math.ceil(count / options.pagesize),
                pagesize: options.pagesize,
                count:count,
            });

        }
    });
}
exports.ajax_up_list = function (req, res) {
    try {
        var cid = req.query.cid;
        var where = {};
        var title = req.query.title;
        if (title !== undefined && title != '') {
            where.title = { $regex: title, $options: 'i' };
        }
        var type = req.query.type;
        if (type !== undefined && type != -1) {
            where.type = type;
        }
        where.status = 2;//必须是已审核的资源
        var options = comm.get_page_options(req);
        Posts.find(where).skip(options.skip).limit(options.limit)
        .sort("-createtime")
		.exec(function (err, models) {
            models.forEach(function (node, index) {
                var node = node.toObject();
                var style = "text-muted";
                var publish = "未上架";
                node.post_publish_status.forEach(function (m) {
                    if (m.cid == cid) {
                        style = "text-danger";
                        publish = "已上架";
                        return;
                    }
                });
                node.style = style;
                node.publish = publish;
                node.index = options.skip + index + 1;
                node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
                node.shorttitle = comm.get_substring({str:node.title});
                config.types.forEach(function (item, j) {
                    if (item.id == node.type) {
                        node.typename = item.name;
                        node.typestyle = item.style;
                        return
                    }
                })
                models[index] = node;
            });
            response.success(res, models);
        });
    } catch (e) {
        console.log(e.stack);
    }
}
exports.ajax_down_list = function (req,res) {
    try {
        var cid = req.query.cid;
        var title = req.query.title;
        var post_publish_status = {
            cid: cid
        }
        var where = { "cid": cid };
        if (title !== undefined && title != '') {
            where.title = { $regex: title, $options: 'i' };
        }
        var type = req.query.type;
        if (type !== undefined && type != -1) {
            where.type = type;
        }
        var options = comm.get_page_options(req);
        Medias.find(where).skip(options.skip).limit(options.limit).sort("-attr -createtime").exec(function (err, models) {
            models.forEach(function (node, index) {
                var style = "text-danger";
                var publish = "已上架";
                node = node.toObject();
                node.style = style;
                node.publish = publish;
                node.index = options.skip + index + 1;
                node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
                node.shorttitle = comm.get_substring({str:node.title});
                models[index] = node;
                config.types.forEach(function (item, j) {
                    if (item.id == node.type) {
                        node.typename = item.name;
                        node.typestyle = item.style;
                        return
                    }
                })
                if (node.attr == 1) {
                    node.attr = "<span class=\"label label-info\">置顶</span>";
                    node.toptime ='置顶结束时间'+moment(node.toptime).format('YYYY-MM-DD HH:mm:ss')
                }
                else if (node.attr == 100) {
                    node.attr = "<span class=\"label label-warning\">幻灯</span>";
                    node.toptime = '';
                } else {
                    node.attr = "";
                    node.toptime = '';
                }
            });
            response.success(res, models);
        });
    } catch (e) {
        console.log(e.stack);
    }
}
exports.ajax_down_count = function (req, res) {
    var cid = req.query.cid;
    var title = req.query.title;
    var post_publish_status = {
        cid: cid
    }
    var where = { "cid": cid };
    if (title !== undefined && title != '') {
        where.title = { $regex: title, $options: 'i' };
    }
    var type = req.query.type;
    if (type !== undefined && type != -1) {
        where.type = type;
    }
    var options = comm.get_page_options(req);
    Medias.count(where,function (error, count) {
        if (error) {
        } else {
            response.success(res, {
                pagecount: Math.ceil(count / options.pagesize),
                pagesize: options.pagesize,
                count:count,
            });
        }
    });
};
exports.doup = function (req, res) {
    try {
        var errflag = false;
        var _idarray=[];
        req.body._ids.forEach(function(node,index){
            _idarray.push(node.value);
        })
        //发布的分类id
        var cid = req.body.cid;
        _idarray.forEach(function (_id) {
            //先判断是否已经发布
            Posts.findOne({ _id: _id },function (err, model) {
                model.post_publish_status.push({cid:cid});
                model.save(function(err){
                    if(!err){
                        var exist = false;
                        Medias.remove({ mid: _id,cid:cid }, function (err) {});//先清空已上架的
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
                        medias.cid=cid;
                        Medias.update({ mid: _id, cid: cid }, medias , { upsert: true }, function (err) {
                            if(!err){
                              Operatorlogs.save({
                                desc: "媒资上架 _id:" + _id+" 上架到 分类["+ cid+"]",
                                user_login: req.session.user.user_login
                              });
                            }
                        })
                    }
                })
            });
        });
        response.success(res, "ok");
    }
    catch (e) {
        response.error(res, e.stack);
    }
};
exports.dodown = function (req, res) {
    try {
        var _ids = req.body._ids;
        var mids = req.body.mid;
        var reg = /,/;
        var _idarray = _ids.split(reg);
        var midarray = mids.split(reg);
        var errflag = false;
        //发布的分类id
        var cid = req.body.cid;
        var post_publish_status = {
            cid: cid
        }
        var i = 0;
        _idarray.forEach(function (_id) {
            Medias.remove({ _id: _id }, function (err) {

            });
            Cloud.remove({ sid: _id }, function (err) {

            });
            Posts.update({_id: midarray[i++]}, {
                $pull: { "post_publish_status": post_publish_status },$inc: {"publish_size":-1}
            }, function (err) { });

            Operatorlogs.save({
                desc: "媒资下架 mediasid:" + _id,
                user_login: req.session.user.user_login
            });
        });

        response.success(res, "ok");
    }
    catch (e) {
        response.error(res, e.stack);
    }
}
exports.dotop = function (req,res) {
    var _ids = req.body._ids;
    var order = parseInt(req.body.order);
    var toptime = comm.get_req_string(req.body.toptime,'');
    var reg = /,/;
    var _idarray = _ids.split(reg);
    var desc = "";
    var data = { attr: order };
    if (order === 1) {
        desc = "置顶";
        if (toptime !== '') data.toptime = toptime;
    }
    else if (order === 100) {
        desc = "幻灯";
    }
    else if (order === -1) {
        desc = "清除属性";
    }
    _idarray.forEach(function (_id) {
        Medias.update({ _id:_id },data , function (err) {

        });
        Operatorlogs.save({
            desc: "设置属性 mediasid:" + _id+" 【"+ desc+"】",
            user_login: req.session.user.user_login
        });
    });

    response.success(res, "ok");
}
exports.undotop = function () {
    var query = {};
    query.toptime = { $lt: moment().format('YYYY-MM-DD HH:mm:ss') };
    Medias.update(query, { attr: -1 }, function (err) {
        if (err) {
            //Operatorlogs.save({
            //    desc: "执行定时任务 清除过期置顶",
            //    user_login: req.session.user.user_login
            //});
        }
    });
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
}
exports.getFullMedias=function(req,res){
    try {
        var where={};
        var title = comm.get_req_string(req.query.title,"");
        if (title != '') {
            where.title = { $regex: title, $options: 'i' };
        }
        Medias.find(where).populate('cid','name').sort("-attr -createtime").exec(function (err, models) {
            response.success(res, models);
        });
    } catch (e) {
        console.log(e.stack);
    }
}
exports.setTime=function(req,res){
    var id=req.body.id;
    var mid=req.body.mid;
    var time=req.body.time;
    Medias.update({ _id: id , mid:mid},{$set:{createtime:time}}, function (err) {
        if(err){
            response.error(res, '')
        }else{
          Operatorlogs.save({
            desc: "修改媒资上架时间:" + id+"["+ time+"]",
            user_login: req.session.user.user_login
          });
          response.success(res, "ok")
        }
    })
}
