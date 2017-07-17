var Anchors = require('../models/anchors').anchors;
var response = require('../lib/response');
var moment = require('moment');
var validator = require('validator');
var Operatorlogs = require('../proxy/operatorlogs');

exports.list = function (req, res) {
    Anchors.find()
    .sort('-createtime')
    .exec(function(err,models){
        //console.log(models);
        models.forEach(function (node, index) {
            var node = node.toObject();
            node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
            node.index = index + 1;
            models[index] = node;
        })
        res.render('admin/anchors/list', {
            title: "主播管理",
            models:models
        });
    });
}
exports.add = function (req, res) {
	res.render('admin/anchors/add', {
        title: "创建主播",
    });
}

exports.edit = function (req, res) {
    var _id=req.query._id;
    Anchors.findOne({ _id: _id })
    .exec(function (err, model) {
        if (err || !model) {
            return res.send("出错了");
        }
        model.createtime = moment(model.createtime).format('YYYY-MM-DD HH:mm:ss');
        res.render('admin/anchors/edit', {
            title: "修改主播",
            model: model,
        });
    });
}
exports.create = function (req, res) {
	var model=req.body.anchors;
    var pics=req.body.anchors.pics;
	var _anchors=new Anchors(model);
    if (pics != "" && pics !== undefined) {
        var slides = [];
        if (pics instanceof Array) {
            pics.forEach(function (node, index) {
                slides.push({
                    pics: pics[index],
                    iscover:false,
                });
            });
        }else{
            slides.push({
                pics: pics,
                iscover:false,
            });
        }
        _anchors.pics=slides[0].pics;
        _anchors.slides=slides;
        _anchors.slidescount=slides.length;//照片数
    }
	_anchors.save(function(err){
        if(err){
            response.error(res, err);
        }else{
            response.success(res, _anchors._id);
        }
    })
}
exports.update = function (req, res) {
    var anchors=req.body.anchors;
    console.log(validator.toString(anchors.signature));
    var model= {
        _id:validator.toString(anchors._id),
        mpno:validator.toString(anchors.mpno),
        name:validator.toString(anchors.name),
        aword:validator.toString(anchors.aword),
        signature:validator.toString(anchors.signature),
        content:validator.toString(anchors.content),
        face:validator.toString(anchors.face),
        background:validator.toString(anchors.background),
    };
    console.log(model);
    var pics=anchors.pics;
    if (pics != "" && pics !== undefined) {
        var slides = [];
        if (pics instanceof Array) {
            pics.forEach(function (node, index) {
                slides.push({
                    pics: pics[index],
                    iscover:false,
                });
            });
        }else{
            slides.push({
                pics: pics,
                iscover:false,
            });
        }
        model.pics=slides[0].pics;
        model.slides=slides;
        model.slidescount=slides.length;//照片数
    }
    Anchors.findOneAndUpdate({ _id: model._id }, model, function(err){
        if(err){
            response.error(res, err);
        }else{
            response.success(res, model._id);
        }
    })
}
exports.delete = function (req, res) {
    var _ids = req.body._ids;
    var reg = /,/;
    var _idarray = _ids.split(reg);
    var success_num = 0;
    var err_num = 0;
    _idarray.forEach(function (_id) {
        Anchors.remove({ _id: _id }, function (err) {
            if (err) {
                err_num++;
            } else {
                success_num++;
            }
        });
        Operatorlogs.save({
            desc: "删除了广告 _id:" + _id ,
            user_login: req.session.user.user_login
        });
    });
    response.success(res, {});
}