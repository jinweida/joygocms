var Hangyes = require('../models/hangyes').hangyes;
var response = require('../lib/response');
/**
 * 加载全部类别的中间件
 */
exports.loadAll = function (req, res, next) {
    Hangyes.find()
		.exec(function (err, models) {
        req.hangyes = models;
        next();
    });
};
exports.create = function (req, res) {
    //1426757930796
    try {
        var fs = require('fs');
        fs.readFile('./hangye.json', function (err, data) {
            var json = JSON.parse(data);
            for (var o in json) {
                var hangyes = new Hangyes();
                hangyes.id = json[o].id;
                hangyes.name = json[o].name;
                hangyes.order = json[o].order;
                hangyes.save(function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(hangyes._id);
                    }
                });
            }

        });
    } catch (e) {
        
        console.log('error when exit', e.stack);
    }
};
