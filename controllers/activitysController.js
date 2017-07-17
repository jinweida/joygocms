var activitys = require('../proxy/activitys');
var operatorlogs = require('../proxy/operatorlogs');
var medias = require('../proxy/medias');
var response = require('../lib/response');
var comm = require('../lib/comm');
var moment = require('moment');
var nodeExcel = require('excel-export');
var eventproxy = require('eventproxy');

exports.list = function (req, res) {
    var options = comm.get_page_options(req);
    var title = req.query.title;
    var mid = req.query.mid;
    var query = {};
    if (title !== "" && title !== undefined) {
        query.title = { $regex: title, $options: 'i' };
    }
    if (mid !== "" && mid !== undefined) {
        query.mid = mid;
    } else {
        mid = "";   
    }
    var proxy = new eventproxy();
    proxy.all('count', 'list', function (count,list) {        
        res.render('admin/activitys_list', {
            title: "活动报名",
            pagecount: Math.ceil(count / options.pagesize),
            pagesize: options.pagesize,
            models: list,
            mid: mid
        });
    })
    
    activitys.getFullActivitys(query, options, proxy.done(function (models) {
        models.forEach(function (node, index) {
            var node = node.toObject();
            node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
            node.index = options.skip + index + 1;
            models[index] = node;
        })
        
        proxy.emit('list', models);
    }))
     
    activitys.getCountByQuery(query, proxy.done(function (count) {
        proxy.emit('count', count);
    })); 
}
exports.ajax_get_list = function (req, res) {
    var query = {};
    var title = req.query.title;
    if (title !== undefined && title != '') {
        query.title = { $regex: title, $options: 'i' };
    }
    var mid = req.query.mid;
    if (mid !== "" && mid !== undefined) {
        query.mid = mid;
    } 
    var options = comm.get_pics_options(req);
    var proxy = new eventproxy();
    proxy.all('list', function (list) {        
        response.success(res, list);
    })
    activitys.getFullActivitys(query, options, proxy.done(function (models) {
        models.forEach(function (node, index) {
            var node = node.toObject();
            node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
            node.index = options.skip + index + 1;
            models[index] = node;
        })
        
        proxy.emit('list', models);
    }))
}

exports.delete = function (req, res) {
    var _ids = req.body._ids;
    var reg = /,/;
    var _idarray = _ids.split(reg);
    var success_num = 0;
    var err_num = 0;
    _idarray.forEach(function (_id) {
        activitys.remove({_id:_id}, function (err) {
            
        });
        operatorlogs.save({
            desc: "删除了活动报名 _id:" + _id ,
            user_login: req.session.user.user_login
        });
    });
    response.success(res, {});
}
//导出excel
exports.excel = function (req, res) {
    var conf = {};
    conf.cols = [
        { caption: '活动名称', type: 'string' ,width:15},    
        { caption: '手机号', type: 'string' , width: 10 },
        { caption: '姓名', type: 'string' },
        { caption: '性别', type: 'string' },
        { caption: '身份证', type: 'string' },    
        { caption: '报名时间', type: 'string' }
    ];
    conf.rows = [];
    var query = {};
    var mid = req.query.mid;
    if (mid !== undefined && mid != '') {
        query.mid = mid;
    }
    activitys.getActivitysByMid(query, function (err, models) {
        if (err) {
            res.end("出错了");
        } else {
            models.forEach(function (node, index) {
                var node = node.toObject();
                var rows = [];
                rows.push(node.title);
                rows.push(node.mpno);
                rows.push(node.fullname);
                rows.push(node.sex);
                rows.push(node.card);
                rows.push(moment(node.createtime).format('YYYY-MM-DD HH:mm:ss'));
                conf.rows.push(rows);
            })
            var result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
            res.setHeader("Content-Disposition", "attachment; filename=" + mid + ".xlsx");
            res.end(result, 'binary');
        }
    })  
}