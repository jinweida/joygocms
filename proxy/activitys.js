var Activitys = require('../models/activitys').activitys;

exports.getFullActivitys = function (query,options, callback) {    
    Activitys.find(query).sort('-createtime').skip(options.skip).limit(options.pagesize)
            .exec(function (err, models) {
        callback(err,models);                 
    });
}
exports.getActivitysByMid = function (query, callback) {
    Activitys.find(query).sort('-createtime')
            .exec(function (err, models) {
        callback(err, models);
    });
}

exports.getCountByQuery = function (query, callback) {
    Activitys.count(query, callback);
};

exports.remove = function (query, callback) {
    Activitys.remove(query, callback);
}