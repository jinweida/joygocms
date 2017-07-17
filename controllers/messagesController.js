var _messages = require('../proxy/messages');
var _medias = require('../models/medias').medias;
var _columns = require('../models/columns').columns;
var usergroup = require('../models/usergroup').usergroup;
var centeruser = require('../models/usergroup').centeruser;
var response = require('../lib/response');
var config = require('../config');
var comm = require('../lib/comm');
var moment = require('moment');
var eventproxy = require('eventproxy');
var _ = require("lodash");

exports.message = {
	loadGroup: function(req, res, next) {
		usergroup.find().exec(function(err, groups) {
			if (err) console.log(err);
			req.groups = groups;
			next();
		});
	},
	loadGroupUser: function(req, res, next) {
		var message = req.body.message;
		var aliasContent = '';
		var messagetype = message.usertype;
		if (messagetype == '1') {
			req.aliasContent = message.usersingle;
			next();
		} else if (messagetype == '2') {
			centeruser.find({
				groupid: message.usergroup
			}, function(err, users) {
				if (err) console.log(err);
				if (users != null && users.length != 0) {
					var ids = new Array();
					users.forEach(function(node, index) {
						ids.push(node.mpno);
					});
					aliasContent = ids.join(",");
					req.aliasContent = aliasContent;
				}
				console.log(req.aliasContent);
				next();
			});
		} else {
			req.aliasContent = aliasContent;
			next();
		}

	},
	list: function(req, res) {
		var where = {};
  	var title = req.query.title;
    if (title !== undefined && title !== '') {
        where.title = { $eq: title };
    }else {
    	title = "";
    }

		var options = comm.get_page_options(req);
  	var proxy = new eventproxy();
		proxy.all('messages', 'messages_page_count', function (messages, messages_page_count) {
      return res.render('admin/lives/message/messages', {
          title: "消息列表",
          msgtitle: title,
          pagecount: Math.ceil(messages_page_count / options.pagesize),
          pagesize: options.pagesize,
          messages: messages
      });
		});

    _messages.getMessagesCountByQuery(where, proxy.done(function (messages_count) {
        proxy.emit('messages_page_count', messages_count);
    }));

    _messages.getLivesMessagesByPageAndQuery(where, options, proxy.done(function (messages) {
        messages.forEach(function (node, index) {
          var node = node.toObject();
          node.index = options.skip + index + 1;
          node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
      		node.shorttitle=comm.get_substring({str:node.context});
          messages[index] = node;
        });
        proxy.emit('messages', messages);
    }));
	},
	ajax_list: function(req, res) {
		var where = {};
    var title = req.query.title;
    if (title !== undefined && title !== '') {
        where.mpno = { $eq: title };
    }
    var options = comm.get_page_options(req);
    var proxy = new eventproxy();
    _messages.getLivesMessagesByPageAndQuery(where, options, proxy.done(function (messages) {
        messages.forEach(function (node, index) {
            var node = node.toObject();
            node.index = options.skip + index + 1;
            node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
        		node.shorttitle=comm.get_substring({str:node.context});
            messages[index] = node;
        });
        proxy.emit('messages', messages);
    }));

    proxy.all('messages', function (messages) {
        response.success(res, messages);
 		});
	},
	send_page: function(req, res) {
		return res.render('admin/lives/message/message_send', {
			title: "发送消息",
			groups: req.groups,
			columns: req.columns
		});
	},
	send_message: function(req, res) {
		var message = req.body.message;
		var staytime = message.sendtimetiming;
		var _sendType = message.sendtype;
		var _url = message.url;
		var mediaItem = message.mediaitem;
		var menuItem = message.menuitem;
		var sendtime = "";
		if(staytime != "undefined" && staytime != ""){
			sendtime = staytime + ":00";
			staytime = new Date(Date.parse(staytime));
		}else {
			staytime = new Date();
			sendtime = moment(staytime).format('YYYY-MM-DD HH:mm:ss');
		}
		var _message = {
			title: message.title,
			context: message.context,
			devicetype: message.devicetype,
			users: {
				type: message.usertype,
				single: message.usersingle,
				groupid: message.usergroup
			},
			sendtime:{
				type:message.sendtimetype,
				timing:staytime
			},
			creator:req.session.user.user_nicename,
			createtime: new Date()
		};
		console.log(message);
		if(message.devicetype=='1'){
			var info = {
				timestamp: Date.now(),
				alias: req.aliasContent,
				alias_type: config.umeng_alias_type_android,
				production_mode: config.umeng_production_mode,
				payload: {
					body: {
						ticker: '您有一条来自福视悦动的消息,点击查看',
						title: message.title,
						text: message.context,
						after_open: 'go_app'
					},
					extra: {
						foo: 'bar',
						sendtype: _sendType
					}
				},
				policy: {
					starttime:'',
				}
			};

			if(_url != ""){
				info.payload.extra.url = _url;
			}
			if (message.sendtimetype == '1') { //定时发送
				info.policy.starttime = sendtime;
			}
			if(mediaItem != null && mediaItem != ""){
				_message.mediaitem = mediaItem;
				_medias.find({_id:mediaItem}).exec(function(err,models){
					if(models != null && models.length != 0){
						var model = models[0];
			            info.payload.extra.pics = comm.replace_pics(model.pics);
			            if(info.payload.extra.pics == '') {
			            	info.payload.extra.pics = 'null';
			            }
			            info.payload.extra.shareurl = comm.replace_shareurl(model);
			            info.payload.extra.desc = model.desc;
			            if(info.payload.extra.desc == ''){
			            	info.payload.extra.desc = 'null';
			            }
			            info.payload.extra.title = model.title;
			            info.payload.extra.url = comm.replace_url(model);
			            info.payload.extra.type = model.type;
			            info.payload.extra.mid = model.mid;
			            _messages.umengsend(message.devicetype,message.usertype,info,_message,res);
			            return;
					}
				});
			}else if(menuItem != null && menuItem != "-1"){
				_message.menuitem = menuItem;
				_columns.find({_id:menuItem}).exec(function(err,models){
					if(models != null && models.length != 0){
						var model = models[0];
						info.payload.extra.menutype = model.menutype;
						info.payload.extra.url = comm.replace_url(model);
						info.payload.extra.cid = model._id;
						info.payload.extra.name = model.name;
						info.payload.extra.listtype = model.listtype;
						info.payload.extra.upstatus = model.upstatus;
						info.payload.extra.adstatus = model.adstatus;
						_messages.umengsend(message.devicetype,message.usertype,info,_message,res);
		                return;
					}
				});
			}else {
				_messages.umengsend(message.devicetype,message.usertype,info,_message,res);
			}
		}
		if (message.devicetype == '2') {
			var info = {
				timestamp: Date.now(),
				alias: req.aliasContent,
				alias_type: config.umeng_alias_type_ios,
				production_mode: config.umeng_production_mode,
				payload: {
					"aps": {
						"alert": message.context,
						"sendtype": _sendType
					}
				},
				policy: {
					starttime:''
				}
			};
			if(_url != ""){
				info.payload.aps.url = _url;
			}
			if (message.sendtimetype == '1') { //定时发送
				info.policy.starttime = sendtime;
			}

			if(mediaItem != null && mediaItem != ""){
				_message.mediaitem = mediaItem;
				_medias.find({_id:mediaItem}).exec(function(err,models){
					if(models != null && models.length != 0){
						var model = models[0];
			            info.payload.aps.pics = comm.replace_pics(model.pics);
			            if(info.payload.aps.pics == '') {
			            	info.payload.aps.pics = 'null';
			            }
			            info.payload.aps.shareurl = comm.replace_shareurl(model);
			            info.payload.aps.desc = model.desc;
			            if(info.payload.aps.desc == ''){
			            	info.payload.aps.desc = 'null';
			            }
			            info.payload.aps.title = model.title;
			            info.payload.aps.url = comm.replace_url(model);
			            info.payload.aps.type = model.type;
			            info.payload.aps.mid = model.mid;
			            _messages.umengsend(message.devicetype,message.usertype,info,_message,res);
			            return;
					}
				});
			}else if(menuItem != null && menuItem != "-1"){
				_message.menuitem = menuItem;
				_columns.find({_id:menuItem}).exec(function(err,models){
					if(models != null && models.length != 0){
						var model = models[0];
						console.log(model);
						info.payload.aps.menutype = model.menutype;
						info.payload.aps.url = comm.replace_url(model);
						info.payload.aps.cid = model._id;
						info.payload.aps.name = model.name;
						info.payload.aps.listtype = model.listtype;
						info.payload.aps.upstatus = ""+model.upstatus;
						info.payload.aps.adstatus = ""+model.adstatus;
						console.log(info);
						_messages.umengsend(message.devicetype,message.usertype,info,_message,res);
		        		return;
					}
				});
			}else{
				_messages.umengsend(message.devicetype,message.usertype,info,_message,res);
			}
		}
	}
}