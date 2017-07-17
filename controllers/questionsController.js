var Questions = require('../proxy/questions');
var Answers = require('../models/answers').answers;
var response = require('../lib/response');
var moment = require('moment');
var comm = require('../lib/comm');
var eventproxy = require('eventproxy');
var Operatorlogs = require('../proxy/operatorlogs');
var questions = require('../models/questions').questions;

exports.list = function (req, res) {
    var options = comm.get_page_options(req);
    var content = comm.get_req_string(req.query.content,'');
    var query = {status:{$gt:-1},questionvtype:{$ne:1}};
    if (content !== "" ) {
        query.content = { $regex: content, $options: 'i' };
    }
    var proxy = new eventproxy();
    proxy.all('count', 'list', function (count,list) {
        res.render('admin/questions/list', {
            title: "问题管理",
            pagecount: Math.ceil(count / options.pagesize),
            pagesize: options.pagesize,
            models: list,
            findcontent:content
        });
    })
    Questions.getFullQuestions(query, {},options, proxy.done(function (models) {
        models.forEach(function (node, index) {
            var node = node.toObject();
            node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
            node.lasttime = moment(node.lasttime).format('YYYY-MM-DD HH:mm:ss');
            if(node.isquestions){
                node.isquestions="已回答";
                node.isquestionsstyle = "label label-info";
            }else{
                node.isquestions="待回答";
                node.isquestionsstyle = "label label-warning";
            }
            node.index = options.skip + index + 1;
            models[index] = node;
        })

        proxy.emit('list', models);
    }))

    Questions.getCountByQuery(query, proxy.done(function (count) {
        proxy.emit('count', count);
    }));
}
exports.ajax_get_list = function (req, res) {
    var options = comm.get_page_options(req);
    var content = comm.get_req_string(req.query.content,'');
    var query = {status:{$gt:-1},questionvtype:{$ne:1}};
    if (content !== "" ) {
        query.content = { $regex: content, $options: 'i' };
    }
    var proxy = new eventproxy();
    proxy.all('list', function (list) {
        return response.success(res, list);
    })
    Questions.getFullQuestions(query,{}, options, proxy.done(function (models) {
        console.log(models);
        models.forEach(function (node, index) {
            var node = node.toObject();
            node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
            node.lasttime = moment(node.lasttime).format('YYYY-MM-DD HH:mm:ss');
            if(node.isquestions){
                node.isquestions="已回答";
                node.isquestionsstyle = "label label-info";
            }else{
                node.isquestions="待回答";
                node.isquestionsstyle = "label label-warning";
            }
            node.index = options.skip + index + 1;
            models[index] = node;
        })

        proxy.emit('list', models);
    }))
}
exports.delete = function (req, res) {
    var idarray=[];
    req.body._ids.forEach(function(node,index){
        idarray.push(node.value);
    })
    //删除只改变状态
    Questions.remove(idarray, -1,function (err) {
        if(!err){
            Operatorlogs.save({
                desc: "删除了问答 _id :" + idarray.toString() ,
                user_login: req.session.user.user_login
            });
        }
    });
    response.success(res, {});
}
exports.wenba_list = function (req, res) {
    var options = comm.get_page_options(req);
    var content = comm.get_req_string(req.query.content,'');
    var query = {status:{$gt:-1},questionvtype:1};
    if (content !== "" ) {
        query.content = { $regex: content, $options: 'i' };
    }
    var proxy = new eventproxy();
    proxy.all('count', 'list', function (count,list) {
        res.render('admin/wenba/list', {
            title: "问题管理",
            pagecount: Math.ceil(count / options.pagesize),
            pagesize: options.pagesize,
            models: list,
            findcontent:content
        });
    })
    Questions.getFullQuestions(query, {},options, proxy.done(function (models) {
        models.forEach(function (node, index) {
            var node = node.toObject();
            node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
            node.lasttime = moment(node.lasttime).format('YYYY-MM-DD HH:mm:ss');
            if(node.isquestions){
                node.isquestions="已回答";
                node.isquestionsstyle = "label label-info";
            }else{
                node.isquestions="待回答";
                node.isquestionsstyle = "label label-warning";
            }
            node.index = options.skip + index + 1;
            models[index] = node;
        })

        proxy.emit('list', models);
    }))

    Questions.getCountByQuery(query, proxy.done(function (count) {
        proxy.emit('count', count);
    }));
}
exports.wenba_ajax_get_list = function (req, res) {
    var options = comm.get_page_options(req);
    var content = comm.get_req_string(req.query.content,'');
    var query = {status:{$gt:-1},questionvtype:1};
    if (content !== "" ) {
        query.content = { $regex: content, $options: 'i' };
    }
    var proxy = new eventproxy();
    proxy.all('list', function (list) {
        return response.success(res, list);
    })
    Questions.getFullQuestions(query,{}, options, proxy.done(function (models) {
        console.log(models);
        models.forEach(function (node, index) {
            var node = node.toObject();
            node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
            node.lasttime = moment(node.lasttime).format('YYYY-MM-DD HH:mm:ss');
            if(node.isquestions){
                node.isquestions="已回答";
                node.isquestionsstyle = "label label-info";
            }else{
                node.isquestions="待回答";
                node.isquestionsstyle = "label label-warning";
            }
            node.index = options.skip + index + 1;
            models[index] = node;
        })

        proxy.emit('list', models);
    }))
}
exports.wenba_set_answers = function (req, res){
    var questionid=req.body.id;
    var content=req.body.content;
    var proxy = new eventproxy();
    proxy.all('list', function (list) {
        // answers.answeruserface=questions.answeruserface
        var answeruserface=list.answeruserface;
        var answerusername=list.answerusername;
        questions.update({_id:questionid},{$set:{answercontent:content}},function(err,model){
            if(err){
                console.log(err);
                return response.error(res,'');
            }
        });
        answers=new Answers({ 
            questionid:questionid,
            content:content,
            answeruserface:answeruserface,
            answerusername:answerusername
        })
        answers.save(function(err,model){
            if(err){
                console.log(err);
                return response.error(res,'');
            }else{ 
                return response.success(res,'') 
            }
        })
    })
    questions.findOne({_id:questionid},function(err,model){
        if(err){
            console.log(err);
            return response.error(res,'');
        }else{
            proxy.emit('list',model);
        }
    })
}