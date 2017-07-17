var organs = require('../models/organs').organs;
var moment = require('moment');

exports.getFullOrgans = function (query,select, options, callback) {
	organs.find(query)
        .sort("-createtime")
        .skip(options.skip).limit(options.pagesize)
        .select(select)
        .exec(function (err,models) {
            models.forEach(function (node, index) {
                var node = node.toObject();
                node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
                node.index = options.skip + index + 1;
                models[index] = node;
            });
            callback(err,models);
        });
}
exports.getById=function(id,callback){
    organs.findOne({_id: id}, function(err,model){
        callback(err,model);
    });
}
exports.getCountByQuery = function (query, callback) {
    organs.count(query, callback);
};
exports.remove = function (query, callback) {
    organs.remove(query, callback);
};
exports.newAndSave = function (model,callback) {
  var m = new organs(model);
  m.save(callback);
};