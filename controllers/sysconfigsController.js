var Sysconfigs = require('../models/sysconfigs').sysconfigs;
var response = require('../lib/response');
var comm = require('../lib/comm');
var moment = require('moment');
var Operatorlogs = require('../proxy/operatorlogs');
var _ = require('lodash');

exports.list=function(req,res){
  Sysconfigs.find().exec(function(err,models){
    if(err)return res.send();
    else{
      return res.render('admin/sysconfigs', {
        title: "参数配置",
        models: models,
      });
    }
  })
}
exports.create=function(req,res){
  var sysconfigs=new Sysconfigs(req.body);
  Sysconfigs.findOne({key:req.body.key},function(err,model){
    if(err)return response.error(res, err);
    if(model){
      if(Boolean(sysconfigs.type))model.type=sysconfigs.type;
      model.key=sysconfigs.key;
      model.val=sysconfigs.val;
      if(Boolean(sysconfigs.name))model.name=sysconfigs.name;
      if(Boolean(sysconfigs.desc))model.desc=sysconfigs.desc;
      sysconfigs=model;
    }
    sysconfigs.save(function(err){
      if(err)return res.send({code:0,message:"save error"});
      return res.send({code:1,message:"save ok"});
    })
  })
}
exports.save=function(req,res){
  var sysconfigs=req.body;
  console.log(sysconfigs);
  Sysconfigs.findOneAndUpdate({key:req.body.key},sysconfigs,function(err,model){
    if(err)return response.error(res, err);
    return response.success(res, "ok");
  })
}

