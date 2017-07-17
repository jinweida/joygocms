var Kpis = require('../models/kpis').kpis;
var Kpisunits = require('../models/kpisunits').kpisunits;
var response = require('../lib/response');
var comm = require('../lib/comm');
var moment = require('moment');
var Operatorlogs = require('../proxy/operatorlogs');
var validator = require('validator');

/**
 * 加载全部类别的中间件
 */
exports.loadAll = function (req, res, next) {
    Kpisunits.find()
        .exec(function (err, models) {
        req.kpisunits = models;
        next();
    });
};
exports.list = function (req, res) {
    var title = req.query.title;
    var where = {};
    if (title !== undefined && title !== '') {
        where.title = { $regex: title, $options: 'i' };
    }    
    var url = "admin/kpis/kpis_list";
    var options = comm.get_page_options(req);
    
    Kpis.count(where, function (error, count) {
        if (error) {
        } else {
            Kpis.find(where).sort("-year -month -total").limit(options.pagesize)
            .exec(function (err, models) {
                models.forEach(function (node, index) {
                    var node = node.toObject();
                    node.index = options.skip + index + 1;                    
                    node.typename = (node.type === 0)?"个人":"窗口";
                    node.style = (node.type === 0)?"label label-info":"label label-danger";
                    models[index] = node;
                })
                res.render(url, {
                    title: "绩效考核",
                    pagecount: Math.ceil(count / options.pagesize),
                    pagesize: options.pagesize,
                    models: err ? [] : models,
                    findtitle: title
                });
            });
            
        }
    });  
}

exports.ajax_get_kpis_list = function (req, res) {
    
    var options = comm.get_page_options(req);
    var title = req.query.title;
    var where = {};
    if (title !== "" && title !== undefined) {
        where.title = { $regex: title, $options: 'i' };
    }
    Kpis.find(where).sort("-year -month -total").skip(options.skip).limit(options.pagesize)
            .exec(function (err, models) {
        if (err || !models) {
            return response.error(res, {});
        }
        
        models.forEach(function (node, index) {
            var node = node.toObject();
            node.index = options.skip + index + 1;
            node.typename = (node.type === 0)?"个人":"窗口";
            node.style = (node.type === 0)?"label label-info":"label label-danger";
            models[index] = node;
        })
        response.success(res, models);
    });
            
}

exports.add = function (req, res) {
    var type = parseInt(req.query.type);
    var title = "添加绩效";
    var add_url = 'admin/kpis/kpis_persion_add';
    if (type === 0) {
        title = '添加个人绩效';
        add_url = 'admin/kpis/kpis_persion_add';
    } else if (type === 1) {
        title = '添加窗口绩效';
        add_url = 'admin/kpis/kpis_unit_add';
    } 
    res.render(add_url, {
        title: title,
        year: moment().format('YYYY'),
        month: moment().format('MM'),
        type:type,
        kpisunits:req.kpisunits
    });
}
exports.edit = function (req, res) {
    var _id = req.query._id;
    var year=req.query.year;
    var month=req.query.month;
    var type=parseInt(req.query.type);
    console.log(req.query);
    if(type===0){
        Kpis.findOne({ _id: _id }).exec(function (err, model) {
            console.log(model);
            res.render('admin/kpis/kpis_persion_edit', {
                title: "修改绩效",
                year: year,
                month: month,
                type:type,
                model: model
            });
        })        
    }else{
        Kpis.find({year:year,month:month,type:type}).exec(function(err,models){
            console.log(models);
            res.render('admin/kpis/kpis_unit_edit', {
                year: year,
                month: month,
                type:type,
                title: "修改绩效",
                models: models
            });
        })        
    }
}
exports.update = function (req, res) {
    var model = new Kpis(req.body.kpis);    
    model.author=req.session.user.user_login;
    if (!validator.trim(model.title)) {
        return res.send({ "code": -1, message: "kpis_title:名称是必填项" });
    }
    if (model.type === 0) {
        if (!validator.isFloat(model.de, { min: 0, max: 20 })) {
            return res.send({ "code": -1, message: "kpis_de:德输入非法" });
        }
        if (!validator.isFloat(model.neng, { min: 0, max: 20 })) {
            return res.send({ "code": -1, message: "kpis_neng:能输入非法" });
        }
        if (!validator.isFloat(model.qin, { min: 0, max: 20 })) {
            return res.send({ "code": -1, message: "kpis_qin:勤输入非法" });
        }
        if (!validator.isFloat(model.ji, { min: 0, max: 20 })) {
            return res.send({ "code": -1, message: "kpis_lian:绩输入非法" });
        }
        if (!validator.isFloat(model.lian, { min: 0, max: 20 })) {
            return res.send({ "code": -1, message: "kpis_lian:廉输入非法" });
        }
    }
    if (model.type === 1) {
        if (!validator.isFloat(model.yewu, { min: 0, max: 50 })) {
            return res.send({ "code": -1, message: "kpis_yewu:业务输入非法" });
        }
        if (!validator.isFloat(model.renyuan, { min: 0, max: 40 })) {
            return res.send({ "code": -1, message: "kpis_renyuan:人员输入非法" });
        }
        if (!validator.isFloat(model.jiangli)) {
            return res.send({ "code": -1, message: "kpis_jiangli:奖励输入非法" });
        }
        if (!validator.isFloat(model.dangqun, { min: 0, max: 10 })) {
            return res.send({ "code": -1, message: "kpis_dangquan:党群输入非法" });
        }
    }
    if (!validator.isFloat(model.total)) {
        return res.send({ "code": -1, message: "kpis_total:综合输入非法" });
    }
    Kpis.update({ _id: model._id }, model, { upsert: true }, function (err) {
        if (err) {
            response.error(res, err);
        } else {
            if (model.type === 1) {
                Kpisunits.find({title:model.title}).exec(function(err,models){
                    if(err){}
                    else{
                        if(models.length===0){
                            Kpisunits.update({_id:model._id}, {title:model.title} ,{ upsert: true }, function (err) {
                                            
                            });                         
                        }  
                    }
                })
            }
            Operatorlogs.save({
                desc: "修改绩效 _id:" + model._id  ,
                user_login: req.session.user.user_login
            });
            response.success(res, model._id);
        }
    });
}
exports.create = function (req, res) {
    var model = new Kpis(req.body.kpis);
    model.author=req.session.user.user_login;
    if (!validator.trim(model.title)) {
        return res.send({ "code": -1, message: "kpis_title:名称是必填项" });
    }
    if (model.type === 0) {
        if (!validator.isFloat(model.de, { min: 0, max: 20 })) {
            return res.send({ "code": -1, message: "kpis_de:德输入非法" });
        }
        if (!validator.isFloat(model.neng, { min: 0, max: 20 })) {
            return res.send({ "code": -1, message: "kpis_neng:能输入非法" });
        }
        if (!validator.isFloat(model.qin, { min: 0, max: 20 })) {
            return res.send({ "code": -1, message: "kpis_qin:勤输入非法" });
        }
        if (!validator.isFloat(model.ji, { min: 0, max: 20 })) {
            return res.send({ "code": -1, message: "kpis_lian:绩输入非法" });
        }
        if (!validator.isFloat(model.lian, { min: 0, max: 20 })) {
            return res.send({ "code": -1, message: "kpis_lian:廉输入非法" });
        }
    }
    if (model.type === 1) {
        if (!validator.isFloat(model.yewu, { min: 0, max: 50 })) {
            return res.send({ "code": -1, message: "kpis_yewu:业务输入非法" });
        }
        if (!validator.isFloat(model.renyuan, { min: 0, max: 40 })) {
            return res.send({ "code": -1, message: "kpis_renyuan:人员输入非法" });
        }
        if (!validator.isFloat(model.jiangli)) {
            return res.send({ "code": -1, message: "kpis_jiangli:奖励输入非法" });
        }
        if (!validator.isFloat(model.dangqun, { min: 0, max: 10 })) {
            return res.send({ "code": -1, message: "kpis_dangquan:党群输入非法" });
        }
    }
    if (!validator.isFloat(model.total)) {
        return res.send({ "code": -1, message: "kpis_total:综合输入非法" });
    }
    model.save(function (err) {
        if (err) {
            response.error(res, err);
        } else {
            if (model.type === 1) {
                Kpisunits.find({title:model.title}).exec(function(err,models){
                    if(err){}
                    else{
                        if(models.length===0){
                            Kpisunits.update({_id:model._id}, {title:model.title} ,{ upsert: true }, function (err) {
                                            
                            });                         
                        }  
                    }
                })
            }
            Operatorlogs.save({
                desc: "添加绩效 _id:" + model._id ,
                user_login: req.session.user.user_login
            });
            response.success(res, model._id);
        }
    });
}
exports.delete = function (req, res) {
    var _ids = req.body._ids;
    var reg = /,/;
    var _idarray = _ids.split(reg);
    var success_num = 0;
    var err_num = 0;
    _idarray.forEach(function (_id) {
        Kpis.remove({ _id: _id }, function (err) {
            if (err) {
                err_num++;
            } else {
                success_num++;
            }
        });
        Operatorlogs.save({
            desc: "删除了绩效 _id:" + _id ,
            user_login: req.session.user.user_login
        });
    });
    response.success(res, {});
}