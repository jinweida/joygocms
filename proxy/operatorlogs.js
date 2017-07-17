var Operatorlogs = require('../models/operatorlogs').operatorlogs;

exports.save = function (model) {
    var operatorlogs = new Operatorlogs(model);
    operatorlogs.save(function (err) { });
};

exports.getFullOperatorLogs = function (query,options, callback) {
    Operatorlogs.find(query).sort("-createtime").skip(options.skip).limit(options.pagesize)
            .exec(function (err, models) {
        callback(err,models);
    });
}
exports.getCountByQuery = function (query, callback) {
    Operatorlogs.count(query, callback);
};

exports.remove = function (callback) {
    Operatorlogs.remove(callback);
};