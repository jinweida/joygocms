
var Operatorlogs = require('../models/operatorlogs').operatorlogs;
var response = require('../lib/response');
var comm = require('../lib/comm');
var moment = require('moment');
var eventproxy = require('eventproxy');

exports.list = function (req,res) {
    var query = Operatorlogs.where({});
    var starttime = req.query.starttime;
    var endtime = req.query.endtime;
    if (starttime !== undefined && starttime !== '') {
        query.where('createtime').gte(starttime);
    }
    if(endtime !== undefined && endtime !== ''){
        query.where('createtime').lte(endtime);
    }
    var metatitle = "操作日志";
    var url = "admin/operatorlogs_list";
    var options = comm.get_page_options(req);
    var proxy = new eventproxy();
    proxy.all('operatorlogs', 'all_operatorlogs_count', function (operatorlogs, all_operatorlogs_count) {
        res.render(url, {
            datetime: moment().format('YYYY-MM-DD HH:mm:ss'),
            title: metatitle,
            pagecount: Math.ceil(all_operatorlogs_count / options.pagesize),
            pagesize: options.pagesize,
            operatorlogs: operatorlogs,
        });
    })
    Operatorlogs.count(query, proxy.done(function (all_operatorlogs_count) {
        proxy.emit('all_operatorlogs_count', all_operatorlogs_count);
    }));
    Operatorlogs.find(query).sort("-createtime").skip(options.skip).limit(options.pagesize).exec(proxy.done(function (models) {
        proxy.emit('operatorlogs', get_format_models(models,options));
    }));
}
exports.ajax_list = function (req, res) {
    var query = Operatorlogs.where({});
    var starttime = req.query.starttime;
    var endtime = req.query.endtime;
    if (starttime !== undefined && starttime !== '') {
        query.where('createtime').gte(starttime);
    }
    if(endtime !== undefined && endtime !== ''){
        query.where('createtime').lte(endtime);
    }
    var options = comm.get_page_options(req);
    Operatorlogs.find(query).sort("-createtime").skip(options.skip).limit(options.pagesize).exec(function (err,models){
        return response.success(res, get_format_models(models,options));
    });
}
function get_format_models(models,options){
    models.forEach(function (node, index) {
        var node = node.toObject();
        node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
        node.shorttitle=comm.get_substring({str:node.desc});
        node.index = options.skip + index + 1;
        models[index]=node;
    });
    return models;
}

exports.remove = function (req,res) {
    var _ids = req.body._ids;
    Operatorlogs.remove({_id:{$in:_ids}},function(err){
        if(!err){     
            response.success(res, {});
        }
    });
}
