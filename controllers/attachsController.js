var Attachs = require('../models/attachs').attachs;
var Posts = require('../models/posts').posts;
var Lives = require('../models/lives').lives;
var response = require('../lib/response');
var comm = require('../lib/comm');
var moment = require('moment');
var fs = require('fs');
var xml2js = require('xml2js');
var Operatorlogs = require('../proxy/operatorlogs');
var path=require('path');
var eventproxy = require('eventproxy');
var Sysconfigs=require('../models/sysconfigs').sysconfigs;
var _ = require('lodash');

exports.list = function (req, res) {
    var options = comm.get_page_options(req);
    var where={};
    where.from=1;
    where.type!=2;

    Attachs.count(where, function (error, count) {
        if (error) {
        } else {
            Attachs.find(where).populate('columnid',"name").sort("-createtime").limit(options.pagesize)
            .exec(function (err, models) {
                models.forEach(function (node, index) {
                    var node = node.toObject();
                    node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
                    node.big=comm.get_convert_size(node.size);
                    node.index = options.skip + index + 1;
                    node.columnname="";
                    if(node.columnid!==null)
                        node.columnname=node.columnid.name;
                    models[index] = node;
                })
                res.render('admin/attachs/files', {
                    title: "附件管理",
                    pagecount: Math.ceil(count / options.pagesize),
                    pagesize: options.pagesize,
                    columns:req.columns,
                    models:models
                });
            });

        }
    });
    //Attachs.findPagination('sanpellegrino', function (err, models) {
    //    console.log(models);
    //});
}
//主要用于缩略图
exports.ajax_get_list = function (req, res) {
    var title = req.query.title;
    var where={};
    where.from=1;
    where.type=1;
    if (title !== undefined && title != '') {
        where.name = { $regex: title, $options: 'i' };
    }
    var options = comm.get_page_options(req);
    Attachs.find(where).populate('columnid',"name").skip(options.skip).limit(options.limit)
		.sort('-createtime')
		.exec(function (err, models) {
        models.forEach(function (node, index) {
            var node = node.toObject();
            node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
            node.big=comm.get_convert_size(node.size);
            node.index = options.skip + index+1;
            node.columnname="";
            if(node.columnid!==null)
                node.columnname=node.columnid.name;
            models[index] = node;
        })
        response.success(res, models);
    });
}
//主要用于缩略图
exports.ajax_get_count = function (req, res) {
    var where = {};
    where.from=1;
    where.type=1;
    var title = req.query.title;
    if (title !== undefined && title != '') {
        where.name = { $regex: title, $options: 'i' };
    }
    var options = comm.get_page_options(req);
    Attachs.count(where, function (error, count) {
        if (error) {
        } else {
            response.success(res, {
                pagecount: Math.ceil(count / options.pagesize),
                pagesize: options.pagesize,
            });
        }
    });
}
exports.add = function (req,models) {
    models.forEach(function (node, index) {
        var attachs = new Attachs();
        attachs.title = comm.get_req_string(req.body.title,'');
        attachs.desc = comm.get_req_string(req.body.desc,'');
        attachs.content = comm.get_req_string(req.body.content,'');
        //图片默认是已审核 视频默认是转码中
        var video=[".mpg",".mpeg",".ts",".m2ts",".avi",".wmv",
        ".asf",".mp4",".mov",".flv",".f4v",".mkv", ".3gp",".rm",".rmvb",".trp",".divx",".vob",".dat"];
        var audio=[".mp3",".wav",".wma",".asf",".aac"];
        //console.log(video.join(",").match(eval("/"+ext+"/ig")));
        var ext=path.extname(node.path);
        if(_.indexOf(audio, ext.toLowerCase())>-1){
            attachs.type=3; //音频
            attachs.video = comm.get_req_string(node.path,'');
            attachs.status=2;//已审核
        }else if(_.indexOf(video, ext.toLowerCase())>-1){
            attachs.type=2; //视频
            attachs.originalvideo = comm.get_req_string(node.path,'');
            attachs.status=0;//转码中
        }else{
            attachs.type = 1; //图片
            attachs.status=2;//已审核
            attachs.pics = comm.get_req_string(node.path,'');//缩略图地址
        }
        attachs.columnid=node.columnid==='null'?-1:node.columnid;
        attachs.tag = comm.get_req_string(req.body.tag,'');
        attachs.from=1;//编辑上传
        attachs.name=node.name;
        attachs.size=node.size;
        attachs.author=req.session.user.user_login;
        attachs.createtime=node.lastModifiedDate;
        attachs.save(function (err) {
            if(err){
                console.log(err);
            }
            Operatorlogs.save({
                desc: "上传附件 " + node.path ,
                user_login: req.session.user.user_login
            });
        });
    })
}
exports.delete = function (req,res) {
    var attachs = new Attachs();
    var _id = req.body._id;
    if (_id !== undefined && _id != '') {
        _id.split(',').forEach(function(_id){   
            Attachs.remove({_id:_id}, function (err) {})
                Operatorlogs.save({
                    desc: "删除附件 _id:" + _id ,
                    user_login: req.session.user.user_login
                });   
        });
        response.success(res, {});
    } else {
        response.error(res, "参数非法");
    }
}
//转码结束 改变视频状态
exports.update_status=function(req,res){
    var video = req.body.filename.split('public')[1]; //转码后的视频文件路径 包含/data/www/fuzhoucms/public/outfiles/
    video = path.normalize(video).replace(/\\/ig, '/');
    var thumbnail = req.body.thumbnail.split('public')[1]; //缩略图/data/www/fuzhoucms/public/outfiles/
    thumbnail = path.normalize(thumbnail).replace(/\\/ig, '/');
    var filename = path.basename(req.body.thumbnail, '.jpg'); //返回转码前的文件名
    var attachModel = new Attachs();
    attachModel.pics = thumbnail;
    attachModel.video = video;
    attachModel.extension = 'm3u8';
    attachModel.originalvideo = video;
    attachModel.type = 2;
    attachModel.from = 1;//编辑上传的
    attachModel.status = 2;
    attachModel.author='ftp';
    if (thumbnail.indexOf("ftp") > -1) {
        var xmlFile = thumbnail.replace(/outfiles/ig, 'upload').replace(/.jpg/ig, '.xml');
        var parser = new xml2js.Parser();
        fs.readFile(__dirname + '/../public/' + xmlFile, {
            explicitArray: false,
            ignoreAttrs: true
        }, function(err, data) {
            if (err) {
                return response.error(res, "读取xml文件失败");
            } else {
                parser.parseString(data, function(err, result) {
                    if (err) {
                        return response.error(res, "解析xml失败");
                    } else {
                        var postModel = new Posts({
                            pics :thumbnail,
                            video :video,
                            type :2,
                            status: 0,
                            author:attachModel.author,
                        });
                        result.CMSContentInfo.EntityData[0].AttributeItem.forEach(function(node) {
                            if (node.ItemCode[0] == 'Title') {
                                var title = node.Value[0];
                                attachModel.title = title;
                                postModel.title = title;
                            }
                            if (node.ItemCode[0] == 'PgmNote') {
                                var desc = node.Value[0];
                                attachModel.desc = desc;
                                postModel.desc = desc;
                            }
                        });
                        Attachs.findOne({originalvideo: {$regex: video,$options: 'i'}},function(err,model){
                            if(err)return response.error(res, err+"attach error");
                            if(model){
                                model.pics = thumbnail;
                                model.video = video;
                                model.extension = 'm3u8';
                                model.originalvideo = video;
                                model.type = 2;
                                model.from = 1;//编辑上传的
                                model.status = 2;
                                attachModel=model;
                            }
                            attachModel.save(function(err){});
                        })
                        Posts.findOne({title: postModel.title},function(err,model){
                            if(err)return response.error(res, err+"posts error");
                            if(model){
                                model.video=video,
                                postModel=model;
                            }
                            postModel.save(function(err){});
                        })
                        return response.success(res,"ok");
                    }
                });
            }
        });
    }else if(thumbnail.indexOf("lives") > -1){
        var proxy = new eventproxy();
        proxy.all('lives','sysconfigs',function(lives,sysconfigs){
            if(!lives)return res.send({code:0,message:'Parameter error!'});
            if(lives){
                var live_default_status=_.result(_.find(sysconfigs, {key:'live_default_status'}), 'val');
                lives.status=0;//本地上传默认是待审核
                lives.cds.url=video;
                lives.save(function(err){
                    if(err){
                        return response.error(res, err+"update lives error");
                    }else{
                        return response.success(res,"lives ok");
                    }
                })
            }else{
                return response.error(res, err+"update lives error");
            }
        })
        Lives.findOne({'cds.originalurl':eval('\/'+filename+'\/')},proxy.done(function(model){
            proxy.emit('lives', model);
        }))
        Sysconfigs.find({type:'live'},proxy.done(function(model){
            proxy.emit('sysconfigs', model);
        }));
    }else{
        Attachs.update({originalvideo:{ $regex: filename, $options: 'i' }}, {
            pics:thumbnail,
            video:video,
            status:1 //文件状态改为待审核
        }, function (err) {
            if(err){
                return response.error(res, err+"add Attachs error");
            }else{
                return response.success(res,"attachs ok");
            }
        });
    }

}
