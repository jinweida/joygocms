var usergroup = require('../models/usergroup').usergroup;
var centeruser = require('../models/usergroup').centeruser;
var response = require('../lib/response');
var comm = require('../lib/comm');
var moment = require('moment');
var async = require('async');
var eventproxy = require('eventproxy');
var _ = require("lodash");
var mysqld = require("../lib/mysqld");

exports.getUserByGroupId = function(req, res){

}

exports.getUserByPage = function(req, res){

}

exports.usergroup = {
	loadUserByGroupId: function(req, res, next){
		var _id = req.params.id,groupId='',groupname='';
		if(_id != null && _id != ""){
			groupId = _id.split("&")[0];
			groupname = _id.split("&")[1];
		}else{
			groupId = req.body.groupId;
		}
		console.log(groupId);
		var userIds = new Array();
		req.groupId = groupId;
		req.groupname = groupname;
		centeruser.find({groupid: groupId}).exec(function(err,models){
			models.forEach(function(node, index){
				var node = node.toObject();
				node.index = index + 1;
				node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
				models[index] = node;
				userIds.push("\'"+node.mpno+"\'");
			});
			req.setusers = models;
			req.ids = userIds;
			req.totalCount = models.length;
			next();
			return;
		});
	},
	ajaxNeverSetUser: function(req, res){
		var userparams = req.ids;
		var page = req.query.page || req.body.page;
		var options = comm.get_page_options(req);
		req.pagesize = options.pagesize;
		var notIn = " ",pagecount=0;
		if(userparams != null && userparams.length != 0){
			notIn = " where PhoneNO not in ("+userparams.join(",")+") ";
		}
		if(typeof(page) == "undefined"){
			page = 1;
		}
		console.log(page);
		var countSql = "select count(*) c from reguser"+notIn;
		var contentSql = "select UserID _id, PhoneNO mpno,Nickname name,CreateDate createtime from reguser"+notIn+"limit "+options.skip+","+options.pagesize;
		var sqls = {
		    'countSql': countSql,
		    'contentSql': contentSql
		};
		var tasks = ['countSql', 'contentSql'];
		async.eachSeries(tasks, function (item, callback) {
		    console.log(item + " ==> " + sqls[item]);
		    mysqld.getConnection(function(conn){
		    	conn.query(sqls[item],function(err,models){
						if(item == 'countSql') {
			        	pagecount = Math.ceil(models[0].c / options.pagesize);
			        	conn.end();
		        }else {
			        	models.forEach(function(node, index) {
									node.index = options.skip + index + 1;
									node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
									models[index] = node;
								});
								conn.end();
			        	return response.success(res, {
									pagecount: pagecount,
									list: models,
									groupId:req.groupId
								});
			        }
			        callback(err, res);
					});
		    });

		}, function (err) {
		    console.log("err: " + err);
		    response.success(res, {pagecount: 0,list: []});
		});

	},
	list:function(req, res){
		var where = {};
		var name = req.query.name;
		if (name !== undefined && name !== '') {
			where.name = {
				$eq: name
			};
		} else {
			name = "";
		}
		var options = comm.get_page_options(req);
		var pagecount = 0;
		usergroup.count(where,function(err,result){
			pagecount = Math.ceil(result / options.pagesize);
			usergroup.find(where).sort('-createtime').exec(function(err,models){
				if(err) console.log(err);
				models.forEach(function(node, index) {
					var node = node.toObject();
					node.index = options.skip + index + 1;
					node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
					models[index] = node;
				});
				return res.render("admin/usergroup/group_list",
							{
								title:"用户群列表",
								name:name,
								pagecount:pagecount,
								pagesize: options.pagesize,
								usergroup:models
							}
				);
			});
		});
	},
	list_ajax:function(req,res){
		var where = {};
		var name = req.query.name;
		if (name !== undefined && name !== '') {
			where.name = {
				$eq: name
			};
		} else {
			name = "";
		}
		var options = comm.get_page_options(req);
		var pagecount = 0;
		usergroup.count(where,function(err,result){
			pagecount = Math.ceil(result / options.pagesize);
			usergroup.find(where).sort('-createtime').exec(function(err,models){
				if(err) console.log(err);
				models.forEach(function(node, index) {
					var node = node.toObject();
					node.index = options.skip + index + 1;
					node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
					models[index] = node;
				});
				return response.success(res,{list:models,pagecount:pagecount})
			});
		});
	},
	addOrUpdateGroup:function(req, res){
		var _usergroup = req.body.usergroup;
		var id = _usergroup._id;
		var _user_group;
		if(typeof(id) != "undefined" && id != ""){
			usergroup.find({_id: id}).exec(function(err, models) {
				if(models != null && models.length != 0){
					_user_group = _.extend(models[0], _usergroup);
					_user_group.updatetime = new Date();
					_user_group.save(function(err, model) {
						if (err) {
							response.error(res, err);
						} else {
							response.success(res);
						}
					});
				}
			});
		}else{
			_user_group = new usergroup(_usergroup);
			_user_group.createtime = new Date();
			_user_group.save(function(err) {
				if (err) {
					response.error(res, err);
				} else {
					response.success(res);
				}
			});
		}
	},
	delete_group: function(req, res){
		var ids = req.body.ids;
		console.log(ids.length);
		if (ids.length != 0) {
			usergroup.remove({
				_id: {$in:ids}
			}, function(err) {
				if(err){
					response.error(res, err);
				}else{
					centeruser.remove({groupid: {$in:ids}},function(err){			//删除对应的子数据
						if(err){
							response.error(res, err);
						}else{
							response.success(res, "msg:成功删除 " + ids.length + " 条数据");
						}
					});
				}
			});

		} else {
			response.error(res, "msg:参数非法.");
		}
	},
	delete_user: function(req, res){
		var ids = req.body.ids;
		console.log(ids.length);
		if (ids.length != 0) {
			centeruser.remove({_id: {$in:ids}},function(err){			//删除对应的子数据
				if(err){
					response.error(res, err);
				}else{
					response.success(res, "msg:成功删除 " + ids.length + " 条数据");
				}
			});
		} else {
			response.error(res, "msg:参数非法.");
		}
	},
	list_child: function(req, res){
		var groupname = req.groupname;
		var groupId = req.groupId;
		var userscenter = [];
		if(typeof(req.setusers) != "undefined" && req.setusers != null){
			userscenter = req.setusers;
		}
		res.render("admin/usergroup/group_child",
					{
						title:"添加用户",
						groupname:groupname,
						groupid:groupId,
						totalcount:req.totalCount,
						setusers:userscenter
					}
		);
	},
	addChild: function(req, res){
		var _centerusers = req.body.bodys;
		console.log(_centerusers);
		if(_centerusers != null && _centerusers.length != 0){
			_centerusers.forEach(function(item,index){
				item.createtime = new Date(Date.parse(item.createtime));
				var centerUserObj = new centeruser(item);
				centerUserObj.save(function(err){
					if(err){
						console.log(err);
					}
				});
			});
			response.success(res);
		}else{
			response.error("",res);
		}

	}
}
