var attachs = require('../proxy/attachs');
var response = require('../lib/response');
var comm = require('../lib/comm');
var Operatorlogs = require('../proxy/operatorlogs');
var eventproxy = require('eventproxy');
var moment = require('moment');
var validator = require('validator');
var path=require('path');
// 上传视频菜单
exports.list = function (req, res) {
    var proxy = new eventproxy();
    var where={};
    where.type=2;//获取视频
    where.from={$gt:0};//用户上传的视频 和 编辑上传的 不显示cds的
    var options = comm.get_page_options(req);
    proxy.all('count', 'list', function (count, list) {
        console.log(options);
        res.render('admin/attachs/videos', {
            title: "上传视频",
            pagecount: Math.ceil(count / options.pagesize),
            pagesize: options.pagesize,
            columns:req.columns,
            models:list
        });
    })
    attachs.getCountByQuery(where, proxy.done(function (count) {
        proxy.emit('count', count);
    }));
    attachs.getFullAttachs(where, {},options, proxy.done(function (models) {
        models.forEach(function (node, index) {
            var node = node.toObject();
            node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
            if(node.status===0){
                node.statusname='转码中';
                node.statusstyle="label-danger";
            }
            if(node.name==="")node.name=path.basename(node.originalvideo);
            node.big=comm.get_convert_size(node.size);
            node.index = options.skip + index + 1;
            node.columnname="";
            if(node.columnid){
                node.columnname=node.columnid.name;
            }
            models[index] = node;
        })
        proxy.emit('list', models);
    }));
}
//上传视频菜单 分页
exports.ajax_get_list = function (req, res) {
    var title = req.query.title;
    var where={};
    where.type=2;//获取视频
    where.from={$gt:0};//用户上传的视频 和 编辑上传的
    if (title !== undefined && title != '') {
        where.title = { $regex: title, $options: 'i' };
    }
    console.log(where);
    var options = comm.get_page_options(req);

    getFullAttachs(where,options,function(err,models){
        response.success(res,models );
    })
}
exports.ajax_get_count = function (req, res) {
    var title = req.query.title;
    var where={};
    where.type=2;//获取视频
    where.from={$gt:0};//用户上传的视频 和 编辑上传的
    if (title !== undefined && title != '') {
        where.title = { $regex: title, $options: 'i' };
    }
    var options = comm.get_page_options(req);
    attachs.getCountByQuery(where, function (err,count) {
        response.success(res, {
            pagecount: Math.ceil(count / options.pagesize),
            pagesize: options.pagesize,
        });
    });
}
//获取已转码的全部视频 创建媒资时使用
exports.ajax_get_addlist = function (req, res) {
    var title = validator.trim(req.query.title);
    var columnid = validator.trim(req.query.columnid);
    var where={type:2,status:{$gt:0}};//已转码的 只读视频
    if (title != '') where.name = { $regex: title, $options: 'i' };
    if (columnid!=='-1')where.columnid = columnid;
    var options = comm.get_page_options(req);
    getFullAttachs(where,options,function(err,models){
        response.success(res,models);
    })
}

exports.ajax_get_addcount = function (req, res) {
    var title = validator.trim(req.query.title);
    var columnid = validator.trim(req.query.columnid);
    var where={type:2,status:{$gt:0}};//已转码的 只读视频
    if (title != '') where.name = { $regex: title, $options: 'i' };
    if (columnid!=='-1')where.columnid = columnid;
    var options = comm.get_page_options(req);
    attachs.getCountByQuery(where, function (err,count) {
        response.success(res, {
            pagecount: Math.ceil(count / options.pagesize),
            pagesize: options.pagesize,
        });
    });
}
//获取音频文件
exports.ajax_getAudio_addlist = function (req, res) {
    var title = validator.trim(req.query.title);
    var where={type:3};
    if (title != '') where.name = { $regex: title, $options: 'i' };
    var options = comm.get_page_options(req);
    getFullAttachs(where,options,function(err,models){
        response.success(res,models);
    })
}
exports.ajax_getAudio_addcount = function (req, res) {
    var title = validator.trim(req.query.title);
    var where={type:3};
    if (title != '') where.name = { $regex: title, $options: 'i' };
    var options = comm.get_page_options(req);
    attachs.getCountByQuery(where, function (err,count) {
        response.success(res, {
            pagecount: Math.ceil(count / options.pagesize),
            pagesize: options.pagesize,
        });
    });
}
//获取视频 页面逻辑处理
function getFullAttachs(where,options,callback){
    attachs.getFullAttachs(where, {},options, function (err,models) {
        models.forEach(function (node, index) {
            var node = node.toObject();
            node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
            if(node.status===0){
                node.statusname='转码中';
                node.statusstyle="label-danger";
            }
            if(node.name==="")node.name=path.basename(node.originalvideo);
            //创建媒资中选择视频时候显示 标题最多10个字
            if(node.name.length>=10){
                node.videoname=node.name.substring(0,10);
            }
            else{
                node.videoname=node.name;
            }
            node.big=comm.get_convert_size(node.size);
            node.index = options.skip + index + 1;
            node.columnname="";
            if(node.columnid!==null &&　node.columnid!==undefined)node.columnname=node.columnid.name;
            models[index] = node;
        })
        callback(err,models);
    });
}