var Medias = require('../models/medias').medias;

exports.getFullMeidas = function (query,select, options, callback) {    
    Medias.find(query).sort("-attr -createtime").skip(options.skip).limit(options.pagesize).select(select)
            .exec(function (err, models) {
        callback(err,models);                 
    });
}
exports.getCountByQuery = function (query, callback) {
    Medias.count(query, callback);
};