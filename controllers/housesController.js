var houses = require('../proxy/houses');
var response = require('../lib/response');
var comm = require('../lib/comm');
var moment = require('moment');
var Operatorlogs = require('../proxy/operatorlogs');
var eventproxy = require('eventproxy');

exports.list = function (req, res) {
    var title = req.query.title;
    var where = {};
    if (title !== undefined && title !== '') {
        where.title = { $regex: title, $options: 'i' };
    }
    var proxy = new eventproxy();
    var options = comm.get_page_options(req);
    proxy.all('count', 'list', function (count, list) {
        res.render('admin/houses/list', {
            title: "二手房",
            pagecount: Math.ceil(count / options.pagesize),
            pagesize: options.pagesize,
            models:list,
            findtitle:title
        });
    })
    houses.getCountByQuery(where, proxy.done('count'));
    houses.getFullHouses(where, {},options, proxy.done('list'));
}
exports.ajax_get_list=function(req,res){
    var title = req.query.title;
    var where = {};
    if (title !== undefined && title !== '') {
        where.title = { $regex: title, $options: 'i' };
    }
    var proxy = new eventproxy();
    var options = comm.get_page_options(req);
    proxy.all('list', function (list) {
        response.success(res, list);
    })
    houses.getFullHouses(where, {},options, proxy.done('list'));
}

exports.add = function (req, res) {
    console.log(req.organs);
	res.render('admin/houses/add', {
        title: "添加机二手房",
    });
}

exports.edit = function (req, res) {
    var _id=req.query._id;
    organs.getById(_id,function(err,model){
        if (err || !model) {
        }
        res.render('admin/houses/edit', {
            title: "修改机二手房",
            model: model,
            organs:req.organs,
        });
    })
}

exports.remove = function (req, res) {
    var _ids = req.body._ids;
    var reg = /,/;
    var _idarray = _ids.split(reg);
    _idarray.forEach(function (_id) {
        houses.remove({ _id: _id }, function (err) {
        });
        Operatorlogs.save({
            desc: "删除了二手房 _id:" + _id ,
            user_login: req.session.user.user_login
        });
    });
    response.success(res, {});
}
exports.regions = function (req, res) {
    var proxy = new eventproxy();
    var options = comm.get_page_options(req);
    proxy.all('count', 'list', function (count, list) {
        res.render('admin/houses/list', {
            title: "机关黄页",
            pagecount: Math.ceil(count / options.pagesize),
            pagesize: options.pagesize,
            models:list
        });
    })
    var where={};
    houses.getCountByQuery(where, proxy.done('count'));
    houses.getFullOrgans(where, {},options, proxy.done('list'));
}