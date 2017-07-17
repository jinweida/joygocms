var action = require('../actions');
var querystring = require('querystring');
var comm = require('./comm.js');
var url = require('url');
var path=require('path');
var config = require('../config');
var eventproxy = require('eventproxy');
exports.authorize = function (req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        var flag = true;
        action.permission.forEach(function (item, index) {
            if (item.path == req.path) {//包含path 进行下一步的权限控制
                if (req.session.roles.permission.indexOf(item.code)<0 && req.session.roles.permission!=="") {
                    flag = false;
                    return;
                }
            }
        })
        if (flag) {
            next();
        } else {
            res.send("没权限");
        }
    }
}
exports.authcookie = function (req, res, next) {
    //验证cookie
    comm.http_request_post(config.usercenter+'/user/islogin',{},req,function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var info=JSON.parse(body);
            if(!info.result){
                return res.send({code:3}); //登录失败
            }else{
                next();
            }
        }else{
            return res.send({code:0}); //操作异常
        }
    });
}

