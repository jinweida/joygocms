var attachs = require('../models/attachs').attachs;

exports.getFullAttachs = function (query,select, options, callback) {
    attachs.find(query).populate('columnid',"name").sort("-createtime").skip(options.skip).limit(options.pagesize).select(select)
            .exec(function (err, models) {
        callback(err,models);
    });
}
exports.getCountByQuery = function (query, callback) {
    attachs.count(query, callback);
};