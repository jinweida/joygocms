var feedbacks = require('../models/feedbacks').feedbacks;
var moment = require('moment');
var comm = require('../lib/comm');

exports.getFullFeedbacks = function (query,select, options, callback) {
	feedbacks.find(query)
        .sort("-createtime")
        .skip(options.skip).limit(options.pagesize)
        .select(select)
        .exec(function (err,models) {
            models.forEach(function (node, index) {
                var node = node.toObject();
                node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
                node.shorttitle=comm.get_substring({str:node.content});
                node.index = options.skip + index + 1;
                models[index] = node;
            });
            callback(err,models);
        });
}
exports.getCountByQuery = function (query, callback) {
    feedbacks.count(query, callback);
};
exports.remove = function (query, callback) {
    feedbacks.remove(query, callback);
};
exports.update_reply=function(query,model,callback){
    feedbacks.findOneAndUpdate(query,model,function(err,item){
        callback(err,item);
    })
}