var Attachs = require('../models/attachs').attachs;
var response = require('../lib/response');
var comm = require('../lib/comm');
var moment = require('moment');
var Operatorlogs = require('../proxy/operatorlogs');
var path=require('path');
var _ = require('lodash');

exports.list = function (req, res) {
    var options = comm.get_page_options(req);
    var where={};
    where.from=1;
    where.type=1;

    Attachs.count(where, function (error, count) {
        if (error) {
        } else {
            Attachs.find(where).sort("-createtime").limit(options.pagesize)
            .exec(function (err, models) {
                models.forEach(function (node, index) {
                    var node = node.toObject();
                    node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
                    node.big=comm.get_convert_size(node.size);
                    node.index = options.skip + index + 1;
                    models[index] = node;
                })
                res.render('admin/attachs/files', {
                    title: "附件管理",
                    pagecount: Math.ceil(count / options.pagesize),
                    pagesize: options.pagesize,
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
    Attachs.find(where).skip(options.skip).limit(options.limit)
		.sort('-createtime')
		.exec(function (err, models) {
        models.forEach(function (node, index) {
            var node = node.toObject();
            node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
            node.big=comm.get_convert_size(node.size);
            node.index = options.skip + index+1;
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
        var ext=path.extname(node.path);
        console.log(_.indexOf(video, ext));
        if(_.indexOf(video, ext)>-1){
            attachs.type=2; //视频 
            attachs.originalvideo = comm.get_req_string(node.path,'');
            attachs.status=0;//转码中     
        }else{
            attachs.type = 1; 
            attachs.status=2;//已审核
            attachs.pics = comm.get_req_string(node.path,'');//缩略图地址               
        }
        attachs.tag = comm.get_req_string(req.body.tag,'');
        attachs.from=1;//编辑上传
        attachs.name=node.name;
        attachs.size=node.size;
        attachs.createtime=node.lastModifiedDate;
        attachs.save(function (err) {            
            Operatorlogs.save({
                desc: "上传附件 " + node.path ,
                user_login: req.session.user.user_login
            });                        
        });
    })
}
exports.delete = function (req,res) {
    var attachs = new Attachs();
    var _id = req.query._id;
    var where = {};
    if (_id !== undefined && _id != '') {
        where._id = _id;
        Attachs.remove(where, function (err) {
            Operatorlogs.save({
                desc: "删除附件 _id:" + _id ,
                user_login: req.session.user.user_login
            });
            response.success(res, {});
        });
    } else {
        response.error(res, "参数非法");
    }
}
//转码结束 改变视频状态
exports.update_status=function(req,res){
    //http://www.css88.com/archives/4497
    var video=req.body.filename.split('public')[1];//transcode 转码后的视频文件路径 包含/data/www/fuzhoucms/public/outfiles/
    var thumbnail=req.body.thumbnail.split('public')[1];//transcode 缩略图/data/www/fuzhoucms/public/outfiles/
    var filename=path.basename(req.body.thumbnail, '.jpg');//返回转码前的文件名
    var model={
        pics:path.normalize(thumbnail).replace(/\\/ig,'/'),
        video:path.normalize(video).replace(/\\/ig,'/'),
        status:1 //文件状态改为待审核
    }
    console.log(model);
    Attachs.update({originalvideo:{ $regex: filename, $options: 'i' }}, model, function (err) {
        if(err){
            response.error(res, err);  
        }else{
            response.success(res,"");   
        }
    });
}
