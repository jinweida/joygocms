var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SignsSchema = new Schema({
    mpno:{type:String,default:''},
    continuous:{type:Number,default:1},//连续第几天
    createtime: { type: Date, default: Date.now }
});

//ColumnsSchema.path('name').validate(function (name, fn) {
//    var columns = mongoose.model('columns');

//    columns.find({ name: name }).exec(function (err, doc) {
//        fn(!err && doc.length === 0);
//    });
//}, '栏目名称已经被使用了');


exports.signs = mongoose.model('signs', SignsSchema);

/*
 * category={"category":"头条","sort":0,"createtime":new Date()}
 * */