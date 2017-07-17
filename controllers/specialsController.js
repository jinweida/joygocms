var Specials = require('../models/specials').specials;
var response = require('../lib/response');
var moment = require('moment');
var config = require('../config');

exports.list = function (req, res) {

}

exports.add = function (req, res){

}

exports.create = function (req, res) {

}
exports.delete = function (req, res) {
    var _id = req.body._id;
    var where = {};
    if (_id !== undefined && _id != '') {
        where._id = _id;
        Specials.remove(where, function (err) {
            response.success(res, {});
        });
    } else {
        response.error(res, "参数非法");
    }
}