var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;

var UsersSchema = new Schema({
    user_login: { type: String, required: "登录名是必填项" },				//登录名
    user_pass: { type: String, required: "密码是必填项" },				//密码
    user_nicename: { type: String},			//昵称
    user_email: { type: String },                               //email
    user_status: { type: Number, default: 1 },					//用户状态 1=正常 0=停用 
    user_roleid: {type:Number,default:1},
    createtime: { type: Date, default: Date.now },		//注册时间*/
});
UsersSchema.path('user_login').validate(function (user_login, fn) {
    var users = mongoose.model('Users');
    
    users.find({ user_login: user_login }).exec(function (err, users) {
        fn(!err && users.length === 0);
    });
}, '登录名已被使用');

exports.users=mongoose.model('Users', UsersSchema);