var Columns = require('../models/columns').columns;
var Menus = require('../models/menus').menus;
var response = require('../lib/response');
var moment = require('moment');
var config = require('../config');
var Operatorlogs = require('../proxy/operatorlogs');
var validator = require('validator');
/**
 * 加载全部类别的中间件
 */
exports.loadAll = function (req, res, next) {
    Columns.find().sort("order")
        .exec(function (err, models) {
        req.columns = models;
        next();
    });
};

exports.add = function (req, res) {
    var _id = req.query._id;
    var model = new Columns();
    req.columns.forEach(function (node, index) {
        if (node._id == _id) {
            model = node;
            return;
        }
    });
    res.render('admin/columns_add', {
        title: "创建栏目", 
        columns: req.columns, 
        model: model, listtype: config.listtype,
        menutype: config.menutype,
        postions: config.menuspostion
    });  
};

exports.create = function (req, res) {
    //1426757930796
    var columns = new Columns();
    var pl = req.body.columns_pid;
    var reg = /,/;
    var plarray = pl.split(reg);
    
    _id = req.body.columns_id;
    if (!validator.isInt(_id)) {        
        return response.error(res, {message:"columns_id:编号必须是数字"});
    }
    if (!validator.trim(req.body.columns_name)) {
        return response.error(res, { message: "columns_name:栏目名称是必填项" });
    }
    if (!validator.isInt(req.body.columns_sort)) {
        return response.error(res, { message: "columns_sort:排序必须是数字" });
    }
    columns._id = _id;
    columns.name = validator.trim(req.body.columns_name);
    columns.order = validator.trim(req.body.columns_sort);
    columns.listtype = req.body.columns_type;
    columns.pics = validator.trim(req.body.columns_pics);
    columns.menutype = validator.trim(req.body.columns_menu);
    columns.url = validator.trim(req.body.columns_url);
    columns.upstatus = req.body.columns_upstatus;
    columns.pubstatus = req.body.columns_pubstatus;
    columns.commentstatus = req.body.columns_commentstatus;
    columns.position = req.body.columns_position;    
    columns.pid = plarray[0];
    columns.level = plarray[1];
    columns.createtime = moment.utc().valueOf();
    Columns.update({ _id: _id }, columns, { upsert: true }, function (err) {
        console.log(err);
        if (err) {
            response.error(res, err);
        } else {
            response.success(res, _id);
        }
    });
};
exports.delete = function (req, res) {
    // 逻辑删除 
    Columns.update({ _id: req.query._id }, { status: req.query.status }, function (err) {
        //response.handle(res, err);
        var desc = !parseInt(req.query.status)?"【显示】":"【隐藏】";
         desc = "修改栏目分类状态 _id:" + req.query._id + " 状态改为："+ desc;
        Operatorlogs.save({
            desc: desc,
            user_login: req.session.user.user_login
        });
        res.redirect('/admin/columns');
    });
};

exports.list = function (req, res) {
    try {
        Menus.find()
        .sort('-order -id')
        .exec(function (err, models) {
            res.render('admin/menus/list', {
                title: 'APP菜单',
                models: err ? [] : models,
                listtype:config.listtype,
                imgsite:config.imgsite,
                menuspostion:config.menuspostion
            });
        });
    } catch (e) {
        console.log('error when exit', e.stack);
    }
};
