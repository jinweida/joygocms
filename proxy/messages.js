var messages = require('../models/messages').messages;
var SDK = require('umeng-node-sdk');
var response = require('../lib/response');
var config = require('../config');
var _messages = this;

//live message
exports.getMessagesCountByQuery = function (query, callback) {
	messages.count(query, callback);
};

exports.getLivesMessagesByPageAndQuery = function(query, options, callback) {
	messages.find(query).sort("-createtime").skip(options.skip).limit(options.pagesize)
			.exec(function(err, models){
				callback(err,models);
			});
};

exports.findLivesMessagesById = function(id, callback){
	messages.find({_id:id}).exec(function(err, model){
		if(err){
			console.log(err);
		}
		callback(err,model);
	});
};

exports.createLivesMessage = function(model, callback){
	var _message = new messages(model);
	messages.save(function(err){
    	if(err) console.log(err);
    	callback(err);
	});
};

exports.umengsend = function(_devicetype,_usertype,info,_message,res){
	if (_devicetype == '1') {
		var android = new SDK({
		    platform: 'android',
		    appKey: config.umeng_appkey_android,
		    appMasterSecret: config.umeng_appmastersecret_android,
		    androidAliseType: config.umeng_alias_type_android
		});
		if(_usertype=='0'){
			android.broadcast(info,function(err, httpResponse, result){
			if(err) console.log(err);
				if (result.ret == "SUCCESS") {
					var messageObj = new messages(_message);
					messageObj.save(function(err, model) {
						if (err) {
							response.error(res, err);
						} else {
							response.success(res);
						}
					});
				} else {
					response.error(res, {
						message: "提示 ERROR_CODE:" + result.data.error_code
					});
				}
			});
		}

		if (_usertype == '1' || _usertype == '2') {
			android.customizedcast(info, function(err, httpResponse, result) {
				if (err) console.log(err);
				console.log(result);
				if (result.ret == "SUCCESS") {
					var messageObj = new messages(_message);
					messageObj.save(function(err, model) {
						if (err) {
							response.error(res, err);
						} else {
							response.success(res);
						}
					});
				} else {
					response.error(res, {
						message: "提示 ERROR_CODE:" + result.data.error_code
					});
				}
			});
		}
	}

	if (_devicetype == '2') {
		var ios = new SDK({
			platform: 'ios',
			appKey: config.umeng_appkey_iphone,
			appMasterSecret: config.umeng_appmastersecret_ios,
			iosAliseType: config.umeng_alias_type_ios
		});
		if (_usertype == '1' || _usertype == '2') {
			ios.customizedcast(info, function(err, httpResponse, result) {
				if (err) console.log(err);
				if (result.ret == "SUCCESS") {
					var messageObj = new messages(_message);
					messageObj.save(function(err, model) {
						if (err) {
							response.error(res, err);
						} else {
							response.success(res);
						}
					});
				} else {
					response.error(res, {
						message: "提示 ERROR_CODE:" + result.data.error_code
					});
				}
			});
		}

		if(_usertype == '0'){
			ios.broadcast(info,function(err, httpResponse, result){
				if(err) console.log(err);
				if(result.ret == "SUCCESS" ){
			    	var messageObj = new messages(_message);
					messageObj.save(function(err, model) {
						if (err) {
							response.error(res, err);
						} else {
							response.success(res);
						}
					});
				} else {
					response.error(res, {
						message: "提示 ERROR_CODE:" + result.data.error_code
					});
				}
			});
		}
	}
}
