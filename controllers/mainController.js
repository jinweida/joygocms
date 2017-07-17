var mongoose = require('mongoose');
var config = require('../config');

exports.login = function (req, res) {
    res.render('admin/login', {
        title: config.wwwname,
        version:config.version
    });
};

exports.index = function (req, res) {
    res.render('admin/index', {
        title: config.wwwname,
        version:config.version
    });
};