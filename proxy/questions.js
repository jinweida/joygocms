var questions = require('../models/questions').questions;
var answers = require('../models/answers').answers;
exports.getFullQuestions = function (query,select, options, callback) {
  console.log(options);
  questions.find(query).sort("-createtime").skip(options.skip).limit(options.pagesize).select(select)
        .exec(function (err, models) {
          console.log(models);
    callback(err,models);
  });
}
exports.getCountByQuery = function (query, callback) {
  questions.count(query, callback);
};

exports.update_status=function(_id,status,callback){
  questions.update({ _id: {$in:_id} },{status:status},{ multi: true }, function (err) {
    answers.remove({questionid:{$in:_id}},function(err){})
    callback(err);
  });
}
exports.remove=function(_id,status,callback){
  questions.remove({ _id: {$in:_id} }, function (err) {
    answers.remove({questionid:{$in:_id}},function(err){})
    callback(err);
  });
}