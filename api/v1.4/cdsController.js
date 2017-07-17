var Posts = require('../../models/posts').posts;
var Attachs = require('../../models/attachs').attachs;
var response = require('../../lib/response');
var comm = require('../../lib/comm');
var config = require('../../config');
var Operatorlogs = require('../../proxy/operatorlogs');
var url = require('url');
var moment = require('moment');
var validator = require('validator');
var fs = require("fs");
//上传xml内容
exports.set_posts = function (req, res) {
    try {
        var attachs = new Attachs();
        attachs.title = comm.get_req_string(req.body.title,'');
        attachs.desc = comm.get_req_string(req.body.desc,'');
        attachs.content = comm.get_req_string(req.body.content,'');
        attachs.type = 2;
        attachs.video = comm.get_req_string(req.body.videoid,'');
        attachs.pics = comm.get_req_string(req.body.pics,'');//缩略图地址
        attachs.status=2;//已审核
        attachs.tag = comm.get_req_string(req.body.tag,'');
        attachs.from=0;//cds上传
        if (!validator.trim(attachs.title)) {
            return res.send({ "code": 0, message: "标题是必填项" });
        }
        if (!validator.trim(attachs.video)) {
            return res.send({ "code": 0, message: "视频地址是必填项" });
        }
        Attachs.findOne({video: attachs.video}).exec(function (err, models) {
            if (err) {
                return res.send({ code: 0, message: err });
            } else {
                if (!models) {
                    attachs.save(function (err) {
                        if (err) {
                            return res.send({ "code": 0 ,message:err});
                        } else {
                            Operatorlogs.save({
                                desc: "导入媒资 _id:" + attachs._id,
                                user_login: "cds服务器"
                            });
                            return res.send({ code: 1, message: "导入成功" });
                        }
                    });
                } else {
                    return res.send({ code: 1, message: "数据重复" });
                }
            }
        });

    } catch (e) {
        console.log('error when exit', e.stack);
    }
}