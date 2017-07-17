var Areas = require('../models/areas').areas;
var response = require('../lib/response');

/**
 * 加载全部类别的中间件
 */
exports.loadAll = function (req, res, next) {
    Areas.find()
		.exec(function (err, areas) {
        req.areas = areas;
        next();
    });
};

exports.create = function (req, res) {
    //1426757930796
    try {
        var fs = require('fs');
        fs.readFile('./area1.json', function (err, data) {
            console.log(data);
            var json = JSON.parse(data);
            for (var o in json) {
                var areas = new Areas();
                areas.id = json[o].id;
                areas.name = json[o].name;
                areas.pid = json[o].pid;
                areas.pinyin = json[o].pinyin;
                areas.order = json[o].order;
                areas.capital = json[o].capital;
                areas.save(function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(areas._id);
                    }
                });
            }

        });
    } catch (e) {
        
        console.log('error when exit', e.stack);
    }
};
