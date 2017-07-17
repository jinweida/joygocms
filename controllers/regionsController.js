var regions = require('../models/regions').regions;
var response = require('../lib/response');
var moment = require('moment');
var config = require('../config');
var Operatorlogs = require('../proxy/operatorlogs');
var validator = require('validator');

//加载全部类别的中间件
exports.loadAll = function (req, res, next) {
    regions.find().sort("order")
		.exec(function (err, models) {
        req.regions = recursive_list(models,[],0);
        next();
    });
};

exports.add = function (req, res) {
    res.render('admin/houses/regions/add', {
        title: "创建区域",
        regions: req.regions,
    });
};

exports.edit = function (req, res) {
    var _id=req.query._id;
    regions.findOne({_id:_id},function(err,model){
        if (err || !model) {
        }
        res.render('admin/houses/regions/edit', {
            title: "修改区域",
            model:model,
            regions: req.regions,
        });
    })
}
exports.create = function (req, res) {
    var model = new regions(req.body.regions);
    model.level = model.pid.split(/,/)[1];
    model.pid = model.pid.split(/,/)[0];
    console.log(model);
    model.save(function(err){
        if(!err){
            response.success(res, model._id);
        }
    })
};

exports.update = function (req, res,next) {
    var model=req.body.regions;
    model.level=model.pid.split(/,/)[1];
    model.pid=model.pid.split(/,/)[0];
    regions.findOne({_id:model._id},function(err,m){
        if (err || !m) {
            return response.error(res, err);
        }
        m.name=model.name;
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
//删除了
exports.remove = function (req, res) {
    var _id=req.query._id;
    console.log(_id);
    regions.find({pid:_id}).exec(function(err,models){
        if(err){
            response.error(res, err);
        }
        //判断是否有子类，需要先删除子类
        if(models.length>0){
            response.error(res, {message:'请先删除子类'});
        }else{
            regions.remove({ _id: _id }, function (err) {
            });
            Operatorlogs.save({
                desc: "删除区域 _id:" + _id,
                user_login: req.session.user.user_login
            });
            response.success(res, _id);
        }
    })
};
exports.list = function (req, res) {
    try {
        regions.find()
		.sort('order -id')
		.exec(function (err, models) {
            res.render('admin/houses/regions/list', {
                title: '区域管理',
                regions: err ? [] : recursive_list(models,[],0),
            });
        });
    } catch (e) {
        console.log('error when exit', e.stack);
    }

};
exports.ajax_get_list = function (req, res) {
    regions.find()
		.exec(function (err, models) {
        var m=recursive_list(models,[],0);
        res.send(m);
    });
};

function recursive_list(models,json,pid){
    models.forEach(function (node, i) {
        if (node != null) {
            var node = node.toObject();
            var item={};
            if(node.pid==pid){
                json.push(node)
                recursive_list(models,json,node._id);
            }
        }
    });
    return json;
}
