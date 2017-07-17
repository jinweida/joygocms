var feedbacks = require('../proxy/feedbacks');
var response = require('../lib/response');
var comm = require('../lib/comm');
var moment = require('moment');
var config = require('../config');
var Operatorlogs = require('../proxy/operatorlogs');
var validator = require('validator');
var eventproxy = require('eventproxy');

exports.list=function(req,res){
    var query={};
    var select={};
    var options = comm.get_page_options(req);
    var proxy = new eventproxy();
    proxy.all('count', 'list', function (count, list) {
        console.log(list);
        res.render('admin/feedbacks/list', {
            title: "建议反馈",
            pagecount: Math.ceil(count / options.pagesize),
            pagesize: options.pagesize,
            models:list
        });
    })
    feedbacks.getCountByQuery(query, proxy.done(function (count) {
        proxy.emit('count', count);
    }));
    feedbacks.getFullFeedbacks(query,select, options, proxy.done(function (list) {
        proxy.emit('list', get_feedbacks(list));
    }));
}
exports.ajax_list=function(req,res){
    var query={};
    var select={};
    var options = comm.get_page_options(req);
    var proxy = new eventproxy();
    proxy.all('list', function (list) {
        response.success(res, list);
    })
    feedbacks.getFullFeedbacks(query,select, options, proxy.done(function (list) {
        proxy.emit('list', get_feedbacks(list));
    }));
}
function get_feedbacks(list){
    var models=[];
    list.forEach(function(node,i){
        if(node.reply){
            node.reply_content=node.reply.content;
            node.reply_author=node.reply.author;
            node.reply_time=node.reply.replytime;
        }
        models.push(node);
    })
    return models;
}
exports.remove = function (req,res) {
    var reg = /,/;
    var _idarray = req.body._ids.split(reg);
    _idarray.forEach(function (_id) {
        feedbacks.remove({ _id: _id },function(err){});
        Operatorlogs.save({
            desc: "删除建议反馈 _id:" + _id,
            user_login: req.session.user.user_login
        });
    });
    response.success(res, {});
}
exports.reply=function(req,res){
    var _id=req.body._id;
    var content=req.body.content;
    console.log(req.body);
    feedbacks.update_reply({_id:_id},{
        'reply.content':content,'reply.author':req.session.user.user_login,'reply.replytime':moment().format("YYYY-MM-DD HH:mm:ss")
    },function(err,model){
        //if(err || !model)return res.send({code:0:,message:'find error！'});
        return res.send({code:1,message:'回复成功！'});
    })
}

