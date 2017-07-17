var users = require('../models/users').users;
var Roles = require('../models/roles').roles;
var response = require('../lib/response');
var Operatorlogs = require('../proxy/operatorlogs');
var moment = require('moment');
var config = require('../config');

exports.admin = function (req, res) {
    res.render('admin/index', {
        title: '福视悦动内容管理系统'
    });
};
exports.list = function (req, res) {
    users.find()
		.exec(function (err, models) {
        models.forEach(function (node, index) {
            var node = node.toObject();
            node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
            models[index] = node;
        })
        res.render('admin/users_list', {
            title: '操作员管理',
            users: err ? [] : models,
        });
    });
};
exports.add = function (req, res) {
    Roles.find().exec(function (err, models) {
        res.render('admin/users_add', {
            title: '创建操作员',
            roles: err ? [] : models,
        });
    });
}

exports.edit = function (req, res) {
    var _id = req.query._id;
    users.findOne({ _id: _id }).exec(function (err, model) {
        Roles.find().exec(function (err, models) {
            res.render('admin/users_edit', {
                title: '修改操作员',
                model:model,
                roles: err ? [] : models,
            });
        });
    })
}

exports.update = function (req, res) {
    var model = new users(req.body);
    users.update({ _id: model._id }, model.toObject(), { upsert: true }, function (err) {
        if (err) {
            response.error(res, err);
        } else {
            Operatorlogs.save({
                desc: "修改操作员 _id:" + model._id ,
                user_login: req.session.user.user_login
            });
            response.success(res, model._id);
        }
    });
}

exports.create = function (req, res) {
    var model = new users(req.body);
    model.save(function (err) {
        if (err) {
            response.error(res, err);
        } else {
            Operatorlogs.save({
                desc: "创建操作员 _id:" + model._id ,
                user_login: req.session.user.user_login
            });
            response.success(res, model._id);
        }
    });
}

exports.signin = function (req, res) {
    var user_login = req.body.user_login;
    var user_pass = req.body.user_pass;
    var url = req.body.url ? req.body.url : '/admin/index';
    users.findOne({ user_login: user_login,user_pass:user_pass,user_status:1 }, function (err, user) {
        if (err) {
            response.error(res, err)
        } else {
            if (user) {
                Roles.findOne({_id:user.user_roleid}).exec(function (err, roles) {
                    req.session.user = user;
                    req.session.roles = roles;
                    req.session.wwwname = config.wwwname;
                    console.log(roles);
                    Operatorlogs.save({
                        desc: "操作员登录 成功",
                        user_login: req.session.user.user_login
                    });
                    response.success(res, url);
                })
            } else {
                response.error(res, {message:"用户不在或者密码错误"});
            }
        }
    });
}
exports.changepwd = function (req, res) {
    var _id = req.session.user._id;
    var user_pass = req.body.user_pass;
    var user_pass_new = req.body.user_pass_new;
    var user_pass_new_confim = req.body.user_pass_new_confim;

    if (user_pass === "" || user_pass_new === "") {
        response.error(res, { message: '旧密码或新密码不得为空' });
        return;
    }
    if (user_pass_new !== user_pass_new_confim) {
        response.error(res, {message:'两次密码输入不一致'});
    } else {
        users.count({ _id: _id , user_pass: user_pass }, function (err, count) {

            if (err) {
                response.error(res, err);
            } else {
                if (count > 0) {
                    users.update({ _id: _id }, { user_pass: user_pass_new }, function (err) {
                        if (err) {
                            response.error(res, err);
                        } else {
                            Operatorlogs.save({
                                desc: "修改密码 成功",
                                user_login: req.session.user.user_login
                            });
                            response.success(res);
                        }
                    });
                } else {
                    response.error(res, {message:'旧密码错误！'});
                }
            }
        });
    }
}
exports.logout = function (req, res) {
    Operatorlogs.save({
        desc: "操作员退出",
        user_login: req.session.user.user_login
    });
    req.session.user = null;
    req.session.error = null;
    res.redirect('/login');
}
exports.delete = function (req, res) {
    var _id = req.query._id;
    users.remove({_id:_id}, function (err) {
        Operatorlogs.save({
            desc: "删除用户 _id:" + _id ,
            user_login: req.session.user.user_login
        });
        response.success(res, {});
    });
}