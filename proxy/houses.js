var houses = require('../models/houses').houses;
var moment = require('moment');

exports.getFullHouses = function (query,select, options, callback) {
	houses.find(query)
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
    houses.findOne({_id: id}, function(err,model){
        callback(err,model);
    });
}
exports.getCountByQuery = function (query, callback) {
    houses.count(query, callback);
};
exports.remove = function (query, callback) {
    houses.remove(query, callback);
};
exports.newAndSave = function (model,callback) {
  var m = new houses(model);
  m.save(callback);
};