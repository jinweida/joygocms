var Ads = require('../models/ads').ads;
var response = require('../lib/response');
var moment = require('moment');
var comm = require('../lib/comm');
var Operatorlogs = require('../proxy/operatorlogs');
var eventproxy = require('eventproxy');
var validator = require('validator');
exports.index=function(req,res){

}
exports.list = function (req, res) {
    return res.render('admin/ads/list', {
        title: "幻灯片管理",
    });
}
exports.ajax_ads_list=function(req,res){
  var title=validator.trim(req.query.title);
  var options = comm.get_page_options(req);
  var query=Ads.where({});
  if(title)query.where('title',eval('/'+title+'/ig'));
  var proxy = new eventproxy();
  proxy.all('count', 'list', function (count, list) {
    return response.success(res,{
      pagecount: Math.ceil(count / options.pagesize),
      currentpage:options.currentpage,
      list: list,
      count:count
    });
  })
  Ads.count(query, proxy.done(function (count) {
    proxy.emit('count', count);
  }));

  Ads.find(query).populate('menuitem').populate('adposition')
  .sort('-createtime').skip(options.skip).limit(options.limit)
  .exec(proxy.done(function(models){
    models.forEach(function (node, index) {
        var node = node.toObject();
        node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
        node.index = options.skip + index + 1;
        models[index] = node;
    })
    proxy.emit('list', models);
  }));
}
exports.add = function (req, res) {
	res.render('admin/ads/add', {
        title: "添加广告",
        columns:req.columns
    });
}
exports.create = function (req, res) {
  var model=req.body.ads;
  var _ads=new Ads(model);
  console.log(_ads)
    if(!_ads.mediaitem)_ads.mediaitem=_ads._id;
  _ads.save(function(err){
        if(err){
            response.error(res, err);
        }else{
            response.success(res, _ads._id);
        }
    })
}
exports.edit = function (req, res) {
    var _id=req.query._id;
    Ads.findOne({ _id: _id })
    .exec(function (err, model) {
        if (err || !model) {
        }
        var node = model.toObject();
        node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
        node.stime=moment(node.stime).format('YYYY-MM-DD HH:mm:ss');
        node.etime=moment(node.etime).format('YYYY-MM-DD HH:mm:ss');
        res.render('admin/ads/edit', {
            title: "修改广告",
            model: node,
            columns:req.columns
        });
    });
}
exports.update = function (req, res) {
    var model= new Ads(req.body.ads);
    if(!model.mediaitem)model.mediaitem=model._id;
    Ads.findOneAndUpdate({ _id: model._id }, model, function(err){
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
        Ads.remove({ _id: _id }, function (err) {
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