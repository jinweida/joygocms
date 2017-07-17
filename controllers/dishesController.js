var Ads = require('../models/ads').ads;
var Dishes = require('../models/dishes').dishes;
var response = require('../lib/response');
var comm = require('../lib/comm');
var moment = require('moment');
var Operatorlogs = require('../proxy/operatorlogs');

exports.list = function (req, res) {
    var mid=comm.get_req_string(req.query.mid,"");
    Dishes.find({mid:mid})
    .sort('-createtime')
    .exec(function(err,models){   
        //console.log(models);   
        models.forEach(function (node, index) {
            var node = node.toObject();
            node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
            node.index = index + 1;
            models[index] = node;
        })  
        res.render('admin/dishes/list', {
            title: "菜品管理",
            models:models,
            mid:mid
        });
    });
}
exports.add = function (req, res) {
    var mid=req.query.mid;
	res.render('admin/dishes/add', {
        title: "添加菜品",
        mid:mid
    });
}

exports.edit = function (req, res) {
    var _id=req.query._id;
    var mid=req.query.mid;
    var menus=[];
    Dishes.findOne({ _id: _id })
    .exec(function (err, model) {
        if (err || !model) {
        }     
        res.render('admin/dishes/edit', {
            title: "修改菜品",
            model: model,
            mid:mid
        });
    });
}
exports.create = function (req, res) {
	var model=req.body.dishes;
	var _dishes=new Dishes(model);
    //console.log(_ads);
	_dishes.save(function(err){
        if(err){
            response.error(res, err);            
        }else{
            response.success(res, _dishes._id);   
        }
    })
}
exports.update = function (req, res) {
    var model= new Dishes(req.body.dishes);
    var query={ _id: model._id}
    Dishes.findOneAndUpdate(query, { name: model.name,pics:model.pics,desc:model.desc,price:model.price }, function(err){
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
    _idarray.forEach(function (_id) {
        Dishes.remove({ _id: _id }, function (err) {
        });
        Operatorlogs.save({
            desc: "删除了菜品 _id:" + _id ,
            user_login: req.session.user.user_login
        });
    });
    response.success(res, {});
}