var Broadcasts = require('../models/broadcasts').broadcasts;
var Broadprograms = require('../models/broadcasts').broadprograms;
var response = require('../lib/response');
var config = require('../config');
var comm = require('../lib/comm');
var moment = require('moment');
var fs = require("fs");
var validator = require('validator');
var eventproxy = require('eventproxy');
var Operatorlogs = require('../proxy/operatorlogs');
var _ = require("lodash");
var multer = require('multer');
var xlsx = require('node-xlsx');
var path=require('path');

exports.get_broadcasts=function(req,res){
  var query=Broadcasts.find();
  query.exec(function(err,models){
    return res.render('admin/lives/broadcasts/list', {
            title: "微广播",
            models:get_format_broadcasts(models)
        });
  })
}
exports.add=function(req,res){
    return res.render('admin/lives/broadcasts/add', {
            title: "新增微广播"
        });
}
exports.edit=function(req,res){
    var _id=validator.trim(req.query._id)
    Broadcasts.findOne({_id:_id},function(err,model){
        return res.render('admin/lives/broadcasts/edit', {
                title: "编辑微广播",
                model:model
            });
    })
}
exports.delete=function(req,res){
    var _id=req.body._id
    Broadprograms.remove({
                broadid:_id
                }, function(err) {});
    Broadcasts.remove({
                _id:_id
                }, function(err) {});
    response.success(res, "");
}
exports.save=function(req,res){
    var _id=validator.trim(req.body._id);
    var userid=validator.trim(req.body.userid).split(',');
    var nickname=validator.trim(req.body.nickname).split(',');
    var status=validator.trim(req.body.status);
    var _model_broadcast=new Broadcasts(req.body);
    var guest=[];
    if (userid.join().length) {
        userid.forEach(function (node, index) {
            guest.push({
                userid: userid[index],
                mpno:userid[index],
                nickname: nickname[index]
            });
        });
    }
    var chatroomdata={chatroomid:moment().format("YYYYMMDDHHmmss"),
        chatroomname:validator.trim(req.body.chatroomname),
        isjoin:validator.trim(req.body.isjoin)
    };
    _model_broadcast.guest=guest;
    var proxy = new eventproxy();
    proxy.all('chatroom','broadcast',function(chatroom,broadcast){
        if(broadcast){
            broadcast.title=_model_broadcast.title;
            broadcast.subtitle=_model_broadcast.subtitle;
            broadcast.desc=_model_broadcast.desc;
            broadcast.status=_model_broadcast.status;
            broadcast.pics=_model_broadcast.pics;
            broadcast.url=_model_broadcast.url;
            broadcast.order=_model_broadcast.order;
            broadcast.guest=_model_broadcast.guest;
            _model_broadcast=broadcast;
            _model_broadcast.chatroom.chatroomname=chatroomdata.chatroomname;
            _model_broadcast.chatroom.isjoin=chatroomdata.isjoin;
        }else{
            _model_broadcast.chatroom=chatroom;
        }
        _model_broadcast.save(function(err){
            return err?res.send({code:0,message:'save err'}):res.send({code:1,message:'save success'});
        })
    })
    if(!_id){//新增的时候创建聊天室
        var request = require('request');
        request.post({url:config.live_chatroom_create,form:chatroomdata},proxy.done(function(response, body){
          var info=JSON.parse(body);
          proxy.emit('chatroom', chatroomdata);
        }));
        proxy.emit('broadcast', '');
    }else{
        Broadcasts.findOne({_id:_model_broadcast._id},proxy.done(function(model){
            proxy.emit('broadcast', model);
            proxy.emit('chatroom', '');
        }))
    }
}
function get_format_broadcasts(models){
  models.forEach(function (node, index) {
    node = node.toObject();
    node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
    if(Boolean(node.stime)){
        node.stime = moment(node.stime).format('YYYY-MM-DD HH:mm:ss');
        node.date = moment(node.stime).format('YYYY-MM-DD');
    }
    if(Boolean(node.etime))node.etime = moment(node.etime).format('YYYY-MM-DD HH:mm:ss');
    models[index] = node;
  });
  return models;
}
exports.programs={
    list:function(req,res){
        var broadid=validator.trim(req.query.broadid);
        var title=validator.trim(req.query.title);
        var stime=validator.trim(req.query.stime);
        var query=Broadprograms.where('broadid',broadid).sort('stime');
        if(validator.isDate(stime))
            query.where(stime).gte(moment(stime).utc().format('YYYY-MM-DD')).lt(moment(stime).utc().add("-1","day").format('YYYY-MM-DD'));
        query.find().exec(function(err,models){
            return res.render('admin/lives/broadcasts/programs/list', {
                title: title+"-节目单",
                broadid:broadid,
                date:{
                    yesterday:moment().add("-1","day").format('YYYY-MM-DD'),
                    today:moment().format('YYYY-MM-DD'),
                    tomorrow:moment().add("+1","day").format('YYYY-MM-DD')
                },
                models:get_format_broadcasts(models)
            });
        })
    },
    delete:function(req,res){
        var broadid=validator.trim(req.body.broadid);
        var date=validator.trim(req.body.date);
        var enddate=moment(date).add('1','d').format('YYYY-MM-DD');
        console.log(date);
        Broadprograms.remove({broadid:broadid,stime:{$gte:date,$lt:enddate}},function(err){
            if(err)return res.send({code:0,message:'delete error'});
            return res.send({code:1,message:'import success'});
        })
    },
    import:function(req,res){//导入节目单
        var filename='./public/test.xlsx';
        console.log(filename);
         // read from a file
        //res.send('import successfully!');
        var dir = moment().format("YYYY-MM-DD");
        var upload = multer({ dest: './public/upload/lives/programs/' + dir });
        upload(req, res, function (err) {
            if (err)return res.send({ "code": 0 ,message:"upload fail!"});
            var broadid=validator.trim(req.body.broadid);
            if (broadid==='') return res.send({ "code": 0,message:'broadid is not empty!'});
            var filename=function (){
              for(key in req.files){
                var name=req.files[key].name;
                return path.join('./public/upload/lives/programs',dir, name).replace(/\\/ig, '/');
              }
            }
            var obj = xlsx.parse(filename());
            var models=obj;

            if(models.length>0){

                models[0].data.forEach(function(node,index){
                    if(index>0){
                        var programs=new Broadprograms({
                            title: node[0],
                            broadid:broadid,
                            anchor:node[1],
                            desc: node[2],
                            pics: '',
                            url:'',
                            isplay:0,
                            stime :node[3],
                            etime :node[4],
                        });
                        console.log(programs);
                        programs.save(function(err){})
                    }
                })
            }
            return res.send({code:1,message:'import success'});
        })
    }
}
