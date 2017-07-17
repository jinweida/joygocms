var Posts = require('../models/posts').posts;
var Pics = require('../models/pics').pics;
var Specials = require('../models/specials').specials;
var response = require('../lib/response');
var comm = require('../lib/comm');
var moment = require('moment');
var config = require('../config');

exports.detail = function (req, res) {
    console.log(req.headers['user-agent'] );
    var _id = req.query.mid;
    Posts.findById(_id, function (err, model) {
        if (err || !model) {
            return response.error(res, "参数非法");
        } else {
            if (model.type === 1 || model.type===5) {

                res.render('share', {
                    title: model.title,
                    datetime: moment(model.createtime).format('YYYY-MM-DD HH:mm:ss'),
                    model: model
                });
            } else if (model.type === 2) {//视频
                res.render('share_videos', {
                    title: model.title,
                    datetime: moment(model.createtime).format('YYYY-MM-DD HH:mm:ss'),
                    model: model
                });
            } else if (model.type === 3) {//图片集
                Pics.findOne({ _id: _id }).exec(function (err, item) { //因为是非阻塞的
                    if (err || !item) {
                        return response.error(res, { message: "图片集无图片" });
                    } else {
                        res.render('share_pics', {
                            title: model.title,
                            datetime: moment(model.createtime).format('YYYY-MM-DD HH:mm:ss'),
                            model: model,
                            pics: item
                        });
                    }
                });
            } else if (model.type === 4) {
                Specials.find({ sid: _id }).exec(function (err, item) { //因为是非阻塞的
                    console.log(item);
                    if (err || !item) {
                        return response.error(res, {message:"专题无列表"});
                    } else {
                        res.render('share_specials', {
                            title: model.title,
                            datetime: moment(model.createtime).format('YYYY-MM-DD HH:mm:ss'),
                            model: model,
                            specials: item
                        });
                    }
                });
            }
        }
    });
}

exports.api_get_detail = function (req, res) {
  var _id = req.query.mid;
  Posts.findById(_id, function (err, models) {
    if (err || !models) {
        return response.error(res, "参数非法");
    }
    res.render('index', {
        title: models.title,
        posts: models
    });
  });
}