var Roles = require('../models/roles').roles;
var response = require('../lib/response');
var Operatorlogs = require('../proxy/operatorlogs');

exports.list = function (req, res) {
    Roles.find()
		.exec(function (err, models) {
        res.render('admin/roles_list', {
            title: "角色管理",
            roles: err ? [] : models,
        });
    });
}
exports.add = function (req, res) {
    res.render('admin/roles_add', {
        title: "添加角色",
    });
}
exports.edit = function (req, res) {
    var _id = req.query._id;
    Roles.findOne({_id:_id}).exec(function (err, model) {
        res.render('admin/roles_edit', {
            title: "修改角色",
            model:model
        });
    })
}
exports.update = function (req, res) {
    var model = new Roles(req.body.role);
    console.log(model);
    Roles.findOneAndUpdate({ _id: model._id }, model, function(err){
        if(err){
            response.error(res, err);
        }else{
            Operatorlogs.save({
                desc: "修改角色 _id:" + model._id  ,
                user_login: req.session.user.user_login
            });
            response.success(res, model._id);
        }
    })
}
exports.create = function (req, res) {
    var model = new Roles(req.body.role);
    model.save(function (err) {
        if (err) {
            response.error(res, err);
        } else {
            Operatorlogs.save({
                desc: "创建角色 _id:" + model._id ,
                user_login: req.session.user.user_login
            });
            response.success(res, model._id);
        }
    });
}
exports.delete = function (req, res) {
    var _id = req.query._id;
    Roles.remove({_id:_id}, function (err) {
        Operatorlogs.save({
            desc: "删除角色 _id:" + _id ,
            user_login: req.session.user.user_login
        });
        response.success(res, {});
    });
}