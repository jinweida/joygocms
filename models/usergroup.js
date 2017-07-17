var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usergroupSchema = new Schema({
	name: { //群名称
		type: String,
		default: ''
	},
	updatetime: { //修改时间
		type: Date,
		default: Date.now
	},
	createtime: {
		type: Date,
		default: Date.now
	}
});
exports.usergroup = mongoose.model('usergroup', usergroupSchema);

//用户中心用户
var centeruserSchema = new Schema({
	mpno: {	//用户唯一标识
		type: String,
		default: ''
	},
	name: { //用户名称
		type: String,
		default: ''
	},
	groupid: {  //用户群ID
		type: String,
		default: ''
	},
	updatetime: { //修改时间
		type: Date,
		default: Date.now
	},
	createtime: {
		type: Date,
		default: Date.now
	}
});

exports.centeruser = mongoose.model('centeruser', centeruserSchema);