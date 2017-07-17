var organs = require('../proxy/organs');
var response = require('../lib/response');
var comm = require('../lib/comm');
var moment = require('moment');
var Operatorlogs = require('../proxy/operatorlogs');
var eventproxy = require('eventproxy');
var Cooper = require('../models/cooperation').cooperation;
var config = require('../config');
exports.loadAll=function(req,res,next){
    req.query.pagesize=100000;
    var _id=req.query._id;
    var options = comm.get_page_options(req);
    var where={'_id':{$ne:_id}};
    where.level=1;
    organs.getFullOrgans(where, {},options, function (err,models) {
        req.organs=models;
        next();
    });
}
exports.list = function (req, res) {
    var proxy = new eventproxy();
    var options = comm.get_page_options(req);
    options.pagesize=10000;
    proxy.all('count', 'list', function (count, list) {
        res.render('admin/organs/list', {
            title: "机关黄页",
            pagecount: Math.ceil(count / options.pagesize),
            pagesize: options.pagesize,
            models:recursive_list(list,[],'')
        });
    })
    var where={};
    organs.getCountByQuery(where, proxy.done('count'));
    organs.getFullOrgans(where, {},options, proxy.done('list'));
}
//list排序
function recursive_list(list,json,pid){
    list.forEach(function (node, i) {
        if (node != null) {
            if(node.pid==pid){
                json.push(node)
                recursive_list(list,json,node._id);
            }
        }
    });
    return json;
}
exports.add = function (req, res) {
    console.log(req.organs);
	res.render('admin/organs/add', {
        title: "添加机关黄页",
        organs:req.organs,
    });
}

exports.edit = function (req, res) {
    var _id=req.query._id;
    organs.getById(_id,function(err,model){
        if (err || !model) {
        }
        res.render('admin/organs/edit', {
            title: "修改机关黄页",
            model: model,
            organs:req.organs,
        });
    })
}
exports.create = function (req, res) {
	var model=req.body.organs;
    model.level=model.pid.split(/,/)[1];
    model.pid=model.pid.split(/,/)[0];
    organs.newAndSave(model,function(err){
        if(err){
            response.error(res, err);
        }else{
            response.success(res, organs._id);
        }
    })
}
exports.update = function (req, res,next) {
    var model=req.body.organs;
    model.level=model.pid.split(/,/)[1];
    model.pid=model.pid.split(/,/)[0];
    organs.getById(model._id,function(err,m){
        if (err || !m) {
            return response.error(res, err);
        }
        m.name=model.name;
        m.ads=model.ads;
        m.desc=model.desc;
        m.pics=model.pics;
        m.phone=model.phone;
        m.email=model.email;
        m.fax=model.fax;
        m.pid=model.pid;
        m.level=model.level;
        m.save(function(err){
            if (err) {
                return response.error(res, err);
            }
            response.success(res, m._id);
        })
    })
}

exports.remove = function (req, res) {
    var _ids = req.body._ids;
    var reg = /,/;
    var _idarray = _ids.split(reg);
    _idarray.forEach(function (_id) {
        organs.remove({ _id: _id }, function (err) {
        });
        Operatorlogs.save({
            desc: "删除了机关黄页 _id:" + _id ,
            user_login: req.session.user.user_login
        });
    });
    response.success(res, {});
}
//合作单位
exports.cooper=function(req,res){
    res.render('admin/cooper/list', {
        title: "合作商户",
    });
}
exports.get_cooper=function(req,res){
    var proxy = new eventproxy();
    var options = comm.get_page_options(req);
    var where={}
    proxy.all('count', 'list', function (count, list) {
        return response.success(res,{
          pagecount: Math.ceil(count / options.pagesize),
          currentpage:options.currentpage,
          list: list,
          count:count
        });
    })
    Cooper.count(where, proxy.done(function (count) {
        proxy.emit('count', count);
    }));
    Cooper.find(where).sort('-createtime').skip(options.skip).
    limit(options.limit).exec(proxy.done(function(models){
        models.forEach(function (node, index) {
            var node = node.toObject();
            node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
            node.index = options.skip + index + 1;
            models[index] = node;
        })
        proxy.emit('list', models);
    }));
}
exports.del_cooper=function(req,res){
    var ids=req.body.id;
    Cooper.remove({_id:{$in:ids}},function(err){
        if(err){
            return response.error(res, err);
        }else{
            return response.success(res,{})
        }
    })
}
exports.set_cooper=function(req,res){
    var id=req.body._id;
    var body=req.body;
    cooper={
      name: body.name,
      reject: body.reject,
      desc: body.desc,
      ads: body.ads,
      phone: body.phone,
      nickname: body.nickname,
      cause: body.cause,
      status:body.status,
      faith:body.faith
    }
    Cooper.update({_id:id},cooper,{ upsert: true },function(err){
        if(err){
            return response.error(res, err);
        }else{
            return response.success(res,{})
        }
    })
}
exports.cooper_detail=function(req,res){
    var id=req.query.id;
    Cooper.findOne({_id:id},function(err,model){
        var model = model.toObject();
        model.img = config.website+model.img;
        return res.render('admin/cooper/cooper_detail', {
            title: model.name,
            list:model
        });
    })

}