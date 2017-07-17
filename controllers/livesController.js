var Lives = require('../models/lives').lives;
var Liveshistories = require('../models/lives').liveshistories;
var livesColumns = require('../models/lives').livescolumns;
var lives = require('../proxy/lives');
var Livessigns = require('../models/lives').livessigns;
var Livemessage= require('../models/livemessage').livemessage;
var response = require('../lib/response');
var config = require('../config');
var comm = require('../lib/comm');
var moment = require('moment');
var fs = require("fs");
var multiparty = require("multiparty");
var validator = require('validator');
var eventproxy = require('eventproxy');
var Operatorlogs = require('../proxy/operatorlogs');
var _ = require("lodash");
var request = require('request');

//商品和红包
exports.All=function(req,res,next){
    var proxy = new eventproxy();
    proxy.all('envelope','commodity',function(envelope,commodity){
        req.envelope=envelope;
        req.commodity=commodity;
        req.envelope.forEach(function(node,v){
            node.begintime = moment(new Date(Number(node.begintime)*1000)).format('YYYY-MM-DD HH:mm');
            node.endtime = moment(new Date(Number(node.endtime)*1000)).format('YYYY-MM-DD HH:mm');
            req.envelope[v]=node;
        });
        next();
    })
    request.post({url:config.shopsite+'/functionid=ads',form:{type:4}},proxy.done(function(response, body){
        body=JSON.parse(body)
        if (response.statusCode==200) {
            proxy.emit('commodity',body.items)
        }else{
            proxy.emit('commodity',[])
        }
    }));
    var startdate=Math.floor(new Date().getTime()/1000)
    request.post({url:config.envelope+'/Discount/GetRuleList',form:{typeid:1,startdate:startdate}},proxy.done(function(response, body){
        if (response.statusCode===200) {
            body=JSON.parse(body);
            proxy.emit('envelope',body.RuleList)
        }else{
            console.log(typeof response.statusCode);
            proxy.emit('envelope',[]);
        }
    }));


}
//商品红包结束
exports.columns = {
	loadAll: function(req, res, next) {
		lives.findAllColumns(function(err, models) {
			req.columns = models;
            next();
		});
	},
    list:function(req,res){
      	var _column = validator.trim(req.body.column);
        var where = {};
        var name = validator.trim(req.query.name);
        if(name!=='')where.name =eval("/"+name+"/");
        var options = comm.get_page_options(req);
        var proxy = new eventproxy();
		proxy.all('lives_columns', 'lives_columns_page_count', function (liveColumns, live_columns_count) {
            return res.render('admin/lives/columns', {
                title: "栏目管理",
                name: name,
                pagecount: Math.ceil(live_columns_count / options.pagesize),
                pagesize: options.pagesize,
                columns: liveColumns
            });
       	});
        lives.getColumnsCountByQuery(where, proxy.done(function (live_columns_count) {
            proxy.emit('lives_columns_page_count', live_columns_count);
        }));

        lives.getLivesColumnsByPageAndQuery(where, options, proxy.done(function (liveColumns) {
            liveColumns.forEach(function (node, index) {
                var node = node.toObject();
                node.index = options.skip + index + 1;
                node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
                liveColumns[index] = node;
            });
            proxy.emit('lives_columns', liveColumns);
        }));
    },
    ajax_list:function(req,res){
        var _column = validator.trim(req.body.column);
      	var where = {};
        var name = validator.trim(req.query.name);
        if(name!=='')where.name =eval("/"+name+"/");
        var options = comm.get_page_options(req);
        var proxy = new eventproxy();
		proxy.all('lives_columns', function (liveColumns) {
			response.success(res, liveColumns);
       	});

        lives.getLivesColumnsByPageAndQuery(where, options, proxy.done(function (liveColumns) {
            liveColumns.forEach(function (node, index) {
                var node = node.toObject();
                node.index = options.skip + index + 1;
                node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
                liveColumns[index] = node;
            });
            proxy.emit('lives_columns', liveColumns);
        }));
    },
    add_page:function(req,res){
        return res.render('admin/lives/columns_add', {
            title: "栏目创建",column:{_id:"",name:"",order:"0",type:0}
        });
    },
    column_submit:function(req,res){
    	var _columns = req.body.column;
    	lives.createLivesColumns(_columns,function(err,model){
    		if(err) {
    			response.error(res,err);
    		}else{
    			response.success(res);
                Operatorlogs.save({desc: "创建微栏目 \""+_columns.name+"\"" ,user_login: req.session.user.user_login});
    		}
    	});
    },
    column_delete:function(req,res){
      	var params = req.body.ids;
      	var successCount = 0;
      	if(params.length != 0){
      		params.forEach(function(node,index){
                lives.remove(node,function(err,model){
                    if(err){
                        console.log(err);
                    }else{
                        successCount++;
                        Operatorlogs.save({desc: "删除微栏目 \""+node+"\"" ,user_login: req.session.user.user_login});
                    }
                });
            })
      		response.success(res,"msg:成功删除 "+successCount+" 条数据");
      	}else{
      		response.error(res,"msg:参数非法.");
      	}
    },
    edit_page:function(req,res){
        return res.render('admin/lives/columns_edit', {
          title: "直播栏目修改"
        });
    },
    update:function(req,res){
        var id = req.body.id;
        var attr = req.body.attr;
        livesColumns.update({_id:id},{attr:attr},function(err,model){
            if (err) {
                console.log(err)
            }else{
                response.success(res,"");
            }
        })
    }
}
//User auth
exports.users = {
	list:function(req, res){
		var where = {};
        var status = comm.get_req_string(req.query.status,'');
        var account = comm.get_req_string(req.query.mpno,'');
        if(status!=='')
            where.status=status;
        if(account!=='')
            where.mpno=eval("/"+account+"/");

		var options = comm.get_page_options(req);
        var proxy = new eventproxy();
    		proxy.all('lives_users', 'lives_users_page_count', function (liveUsers, live_users_count) {
            return res.render('admin/lives/users', {
                title: "实名认证",
                status: status,
                mpno: account,
                pagecount: Math.ceil(live_users_count / options.pagesize),
                pagesize: options.pagesize,
                lives: liveUsers
            });
       	});

        lives.getUserCountByQuery(where, proxy.done(function (live_users_count) {
            proxy.emit('lives_users_page_count', live_users_count);
        }));

        lives.getLivesUsersByPageAndQuery(where, options, proxy.done(function (liveUsers) {
            liveUsers.forEach(function (node, index) {
                var node = node.toObject();
                node.index = options.skip + index + 1;
                liveUsers[index] = node;
            });
            proxy.emit('lives_users', liveUsers);
        }));
	},
	ajax_list:function(req, res){
		var where = {};
        var status = req.query.status;
        var account = req.query.mpno;
        if (status !== undefined && status !== '') {
    		if(status != 99){			//99代表全部
    			where.status = { $eq: status };
    		}else{
    			where.status = { $gte: 0 };
    		}
        }else{
    		where.status = { $gte: 0 };
    		status = 99;
        }

        if (account !== undefined && account !== '') {
            where.mpno = { $eq: account };
        }else {
    		account = "";
        }
        var options = comm.get_page_options(req);
        var proxy = new eventproxy();
        lives.getLivesUsersByPageAndQuery(where, options, proxy.done(function (liveUsers) {
            liveUsers.forEach(function (node, index) {
                var node = node.toObject();
                node.index = options.skip + index + 1;
                liveUsers[index] = node;
            });
            proxy.emit('lives_users', liveUsers);
        }));
        proxy.all('lives_users', function (liveUsers) {
        		response.success(res, liveUsers);
       	});
	},
	addAuthPage:function(req, res){
		return res.render('admin/lives/user_auth',{title: "实名认证",
			live:{
				_id: "",mpno: "",name: "",place: "",idnumber: "",
				phone: "",limited: 1,times: 0,occupation: "",starttime: "",endtime: "",
                roles:''
			}
		});
	},
	authPage: function(req, res){
		var id = req.params.id;
		lives.findLivesUserById(id,function(err,models){
			if(models != null && models.length != 0){
				var liveuserModel = models[0];
				res.render("admin/lives/user_auth",{title: "实名认证",live:liveuserModel});
			}else{
				res.render('admin/lives/user_auth',{title: "实名认证",
						live:{
							_id: "",mpno: "",name: "",place: "",idnumber: "",phone: "",
							limited: 1,times: 0,occupation: "",starttime: "",endtime: ""
						}
				});
			}

		});
	},
	auth:function(req, res){
		var live_user = req.body.live;
        if(_.isArray(live_user.roles))live_user.roles=live_user.roles.join(',');
		var id = live_user._id;
		var _live_user;
		if(id !== "undefined" && id != ""){
			live_user.updatetime = new Date();
			lives.findLivesUserById(id,function(err,models){
				if(models != null && models.length != 0){
					_live_user = _.extend(models[0],live_user);
					_live_user.save(function(err, model){
						if(err){
							response.error(res,err);
						}else{
                            Operatorlogs.save({desc: "修改实名认证 \""+_live_user._id+"\" 状态改为:"+_live_user.status ,user_login: req.session.user.user_login});
							response.success(res);
						}
					});
				}
			});
		}else {
			lives.createLivesUsers(live_user,function(err){
				if(err){
					response.error(res,err);
				}else{
                    Operatorlogs.save({desc: "发起实名认证 \""+live_user._id+"\"" ,user_login: req.session.user.user_login});
					response.success(res);
				}
			});
		}
	},
	cancleauth: function(req, res){
		var id = req.query.id;
		var _live_user;
		lives.findLivesUserById(id,function(err,models){
			if(models != null && models.length != 0){
				_live_user = models[0];
				_live_user.status = 0;
				_live_user.save(function(err, model){
					if(err)console.log(err);
					return response.success(res);
				});
			}
		});
	}
}
// user publish
exports.publish = {
	list: function(req, res){
		var where = {};
        var account = req.query.mpno;

        if (account !== undefined && account !== '') {
            where.mpno = { $eq: account };
        }else {
        		account = "";
        }
        where.status = {$eq: -1};
		var options = comm.get_page_options(req);
        var proxy = new eventproxy();
    		proxy.all('lives_users', 'lives_users_page_count', function (liveUsers, live_users_count) {
            return res.render('admin/lives/publish', {
                title: "用户授权审核",
                mpno: account,
                pagecount: Math.ceil(live_users_count / options.pagesize),
                pagesize: options.pagesize,
                lives: liveUsers
            });
       	});

        lives.getUserCountByQuery(where, proxy.done(function (live_users_count) {
            proxy.emit('lives_users_page_count', live_users_count);
        }));

        lives.getLivesUsersByPageAndQuery(where, options, proxy.done(function (liveUsers) {
            liveUsers.forEach(function (node, index) {
                var node = node.toObject();
                node.index = options.skip + index + 1;
                liveUsers[index] = node;
            });
            proxy.emit('lives_users', liveUsers);
        }));
	},
	view_page: function(req, res){
		var id = req.params.id;
		lives.findLivesUserById(id,function(err,models){
			if(models != null && models.length != 0){
				res.render('admin/lives/auth_view',{title:"查看申请人员信息",live:models[0]});
			}
		});
	},
	pass_page: function(req, res){
		var id = req.params.id;
		lives.findLivesUserById(id,function(err,models){
			if(models != null && models.length != 0){
				res.render('admin/lives/auth_pass',{title:"审核通过",live:models[0]});
			}
		});
	},
	reject_page: function(req, res){
		var id = req.params.id;
		lives.findLivesUserById(id,function(err,models){
			if(models != null && models.length != 0){
				console.log(models[0]);
				res.render('admin/lives/auth_reject',{title:"驳回信息",live:models[0]});
			}
		});
	},
	pass_submit: function(req, res){
		var live_user = req.body.live;
		var id = live_user._id;
		var _live_user;
		lives.findLivesUserById(id,function(err,models){
			if(models != null && models.length != 0){
				_live_user = _.extend(models[0],live_user);
				_live_user.updatetime = new Date();
				_live_user.save(function(err, model){
					if(err){
						response.error(res,err);
					}else{
						response.success(res);
					}
				});
			}
		});
	},
	reject_submit:function(req, res){
		var live_user = req.body.live;
		var id = live_user._id;
		var _live_user;
		lives.findLivesUserById(id,function(err,models){
			if(models != null && models.length != 0){
				_live_user = _.extend(models[0],live_user);
				_live_user.updatetime = new Date();
				_live_user.save(function(err, model){
					if(err){
						response.error(res, error);
					}else{
						response.success(res);
					}
				});
			}
		});
	},
	publish_ajax_list:function(req, res){
		var where = {};
        var account = req.query.mpno;
        if (account !== undefined && account !== '') {
            where.mpno = { $eq: account };
        }else {
        		account = "";
        }
        var options = comm.get_page_options(req);
        var proxy = new eventproxy();
        lives.getLivesUsersByPageAndQuery(where, options, proxy.done(function (liveUsers) {
            liveUsers.forEach(function (node, index) {
                var node = node.toObject();
                node.index = options.skip + index + 1;
                liveUsers[index] = node;
            });
            proxy.emit('lives_users', liveUsers);
        }));

        proxy.all('lives_users', function (liveUsers) {
    		response.success(res, liveUsers);
       	});
	}
}
function getAllLives(query,select,options,callback){
    var proxy = new eventproxy();
    proxy.all('count','models', function (count,models) {

        models.forEach(function(model, index) {
            var modelObj = model.toObject();
            modelObj.index = options.skip + index + 1;
            if (modelObj.attr == 1) {
                modelObj.istop = "是";
            } else {
                modelObj.istop = "否";
            }
            if (modelObj.status == 0) {
                modelObj.statusname = "待审核";
            } else if (modelObj.status == 1) {
                modelObj.statusname = "直播中";
            } else if (modelObj.status == 2) {
                modelObj.statusname = "录播发布成功";
            } else if (modelObj.status == -1) {
                modelObj.statusname = "已关闭";
            } else if (modelObj.status == -2) {
                modelObj.statusname = "正在创建";
            }
            modelObj.createtime = moment(modelObj.createtime).format('YYYY-MM-DD HH:mm:ss');
            if (modelObj.type!=4) {
                modelObj.cds.url = config.live_ois_url+":" +config.live_ois_port+ '/' + modelObj.cds.cid + '.m3u8?protocal=hls&user=' + modelObj.cds.uid + '&tid=' + modelObj.cds.tid + '&sid=' + modelObj.cds.cid + '&type=3&token=guoziyun';
            }
            models[index] = modelObj;
        });
        callback(count,models);
    });
    lives.getFullLives(query, select, options,proxy.done(function(models){
        proxy.emit('models',models);
    }));
    lives.getCountByQuery(query,proxy.done(function(count){
        proxy.emit('count',count);
    }));
}
exports.live = {
    list: function(req, res) {
        return res.render('admin/lives/live', {
            title: "微直播",
            columns: req.columns
        });
    },
    monitor: function(req, res) {
        return res.render('admin/lives/live_monitor', {
            title: "直播视频监控"
        });
    },
    ajax_list: function(req, res) {
        var columnName = req.body.columnName;
        var title = req.body.title;
        var userName = req.body.userName;
        var status = req.body.status;
        var where = {type: 0,status:{$ne:-2}};
        if (Boolean(columnName) && columnName != 'all')where['columns.name'] = columnName;
        if (Boolean(title))where['title'] = eval("/"+title+"/ig");
        if (Boolean(userName))where['user.nickname'] = eval("/"+userName+"/ig");
        if (Boolean(status))where['status'] = status;
        var pageOptions = comm.get_page_options(req);
        getAllLives(where,{},pageOptions,function(count,models){
            return response.success(res, {
                pagecount: Math.ceil(count / pageOptions.pagesize),
                currentpage:pageOptions.currentpage,
                list: models
            });
        })
    },
    ajax_posts_list: function(req, res) {
        var columnName = req.body.columnName;
        var title = req.body.title;
        var userName = req.body.userName;
        var status = req.body.status;
        var where = {status:{$gt:0}};//已审核的
        if (Boolean(columnName) && columnName != 'all') where['columns.name'] = columnName;
        if (Boolean(title))where['title'] = eval("/"+title+"/ig");
        if (Boolean(userName))where['user.nickname'] = eval("/"+userName+"/ig");
        if (Boolean(status))where['status'] = status;
        var pageOptions = comm.get_page_options(req);
        getAllLives(where,{},pageOptions,function(count,models){
            return response.success(res, {
                pagecount: Math.ceil(count / pageOptions.pagesize),
                currentpage:pageOptions.currentpage,
                list: models
            });
        })
    },
    detail: function(req, res) {
        var id = req.query.id;
        Lives.findOne({_id: id}, function(err, model) {
            if (err) {
                response.error(res, err);
            } else if (model) {
                var modelObj = model.toObject();
                modelObj.createtime = moment(modelObj.createtime).format('YYYY-MM-DD HH:mm:ss');
                if(modelObj.ads.time)modelObj.ads.time = moment(modelObj.ads.time).format('YYYY-MM-DD HH:mm:ss');
                modelObj.cds.url = config.live_ois_url+":"+ config.live_ois_port + '/' + modelObj.cds.cid + '.m3u8?protocal=hls&user=' + modelObj.cds.uid + '&tid=' + modelObj.cds.tid + '&sid=' + modelObj.cds.cid + '&type=3&token=guoziyun';
        		if (modelObj.status == -1) {
        			modelObj.disabled = 'disabled';
        		} else {
        			modelObj.disabled = '';
        		}
                return res.render('admin/lives/live_detail', {
                    title: "微直播详情",
                    model: modelObj,
                    commoditylist:req.commodity,
                    envelopelist:req.envelope
                });
            }
        });
    },
    update: function(req, res) {
        var model = {};
        var id = req.body.id;
        var attr = req.body.attr;
        var type=req.body.type;
        var cid=req.body.cid;
	    var delayTime = req.body.delayTime;
        var chatRoomName = req.body.chatRoomName;
        var isjoin=req.body.isjoin;
        var guestList = req.body.guest;
        var rejectionReason = req.body.rejectionReason;
        var mpno=req.body.mpno;
        var chatroomid=req.body.chatroomid;
        var status=req.body.status;
        var commodity=req.body.commodity;
        var commoditytime=req.body.commoditytime;
        var envelope=req.body.envelope;
        if (Boolean(attr))model.attr = attr;
        if (Boolean(commodity))model['ads.commodity'] = commodity;
        if (Boolean(envelope))model['ads.envelope'] = envelope;
        if (Boolean(commoditytime))model['ads.time'] = commoditytime;
        if (Boolean(commodity) || Boolean(envelope)){
            model.isads=1;
        }else{
            model.isads=0;
            model.ads={};
        }
        if (Boolean(type))model.type = type;
        if (Boolean(status))model.status = status;
        if (Boolean(cid))model['cds.cid'] = cid+'_0';
    	if (Boolean(delayTime))model['cds.delaytime'] = delayTime;
        if (Boolean(chatRoomName)){
            model['chatroom.chatroomname']=chatRoomName;
            model['chatroom.isjoin']=isjoin;
        }
        if (Boolean(guestList))model.guest = guestList;
        else{
            model.guest=[];
        }
        if (Boolean(rejectionReason)) {
            model.reject = {
                reason: rejectionReason,
                time: Date.now()
            };
            delete model.guest;
        }
        Lives.update({_id: id}, model, function(err) {
            if (err) {
                response.error(res, err);
            } else {
                var request = require('request');
                var info="";
                if(model.status==='1' || model.status==='-1'){
                  info=model.status==='-1'?"直播驳回了！理由："+rejectionReason:"直播开始了！";
                  var extra=model.status==='-1'?"closed":"info";
                  comm.sendMessage({chatroomid:chatroomid,info:info,extra:extra},function(err,result){});
                  if(model.status==="-1"){
                    Lives.findOne({_id:id},function(err,item){
                        var http = require('http');
                        var data='<?xml version="1.0" encoding="utf-8"?>'
                            data+='<SOAP-ENV:Envelope xmlns:SOAP-ENV="default" SOAP-ENV:encodingStyle="default"><SOAP-ENV:Body>';
                            data+='<minichnl uid="'+item.cds.uid+'" tid="'+item.cds.tid+'" cid="'+item.cds.cid+'" cds_id="'+item.cds.cdsid+'" token="guoziyun" />';
                            data+='</SOAP-ENV:Body></SOAP-ENV:Envelope>';
                        var opurl = {
                            host:config.live_ois_url.replace("http://",""),
                            port:5000,
                            path:"/ois/minichnl/destroy",
                            method:"POST",
                            data:data,
                            headers:{
                            "Connection":"Keep-Alive",
                            "Content-Type":'application/xml;charset=utf-8',
                            "Content-length":data.length}
                        }
                        console.log(opurl);
                        var reqVideo = http.request(opurl, function (serverFeedback) {
                            serverFeedback.setEncoding('utf8');
                            console.log('getVideo:' + serverFeedback.statusCode);
                            if (serverFeedback.statusCode == 200) {
                                console.log(serverFeedback.statusCode)
                            } else {
                                console.log(serverFeedback.statusCode)
                            }
                        })
                        reqVideo.write(data+"\n");
                        reqVideo.end();
                    })
                  }
                }
                Operatorlogs.save({desc: info+":"+id+"[聊天室:"+chatroomid+"]" ,user_login: req.session.user.user_login});
                response.success(res, "");
            }
        });
    },
    delete: function(req, res) {
        var ids = req.body.ids;
        var idList = ids.split(',');
        idList.forEach(function(id) {
            Liveshistories.remove({livesid:id},function(err){});
            Lives.remove({_id: id}, function(err) {
                if (!err)Operatorlogs.save({desc: "删除了直播！"+id ,user_login: req.session.user.user_login});
			});
		});
        return response.success(res,"");
    },
    chat_messages:function(req,res){
        var info=req.body.info;
        var chatroomid=req.body.chatroomid;
        var proxy = new eventproxy();
        proxy.all('message',function(message){
            var result="消息发送失败！"
            if(message.code===200){
                Operatorlogs.save({
                    desc: "发送消息:"+ info+"[聊天室:"+chatroomid+"]",
                    user_login: req.session.user.user_login
                });
                result="消息发送成功！"
            }
            response.success(res,result);
        });
        comm.sendMessage({chatroomid:chatroomid,info:info,extra:'info'},proxy.done(function(result){
            proxy.emit('message',result);
        }));
    }
};
exports.vod = {
    list: function(req, res) {
        return res.render('admin/lives/vod', {
            title: "微点播",
            columns: req.columns
        });
    },
    ajax_list: function(req, res) {
        var columnName = req.body.columnName;
        var title = req.body.title;
        var userName = req.body.userName;
        var query = Lives.where({});
        query.or({type:3}).or({type:1}).find({status:{$ne:-2}});
        if (Boolean(columnName) && columnName != 'all')query.where('columns.name',eval("/"+columnName+"/"));
        if (Boolean(title))query.where('title',eval("/"+title+"/"));
        if (Boolean(userName))query.where('user.nickname',eval("/"+userName+"/"));
        var pageOptions = comm.get_page_options(req);
        Lives.count(query, function(err, count) {
            if (err) {
                response.error(res, err);
            } else {
                Lives.find(query).sort('-createtime').skip(pageOptions.skip).limit(pageOptions.limit).exec(function(err, models) {
                    if (err) {
                        response.error(res, err);
                    } else {
                        models.forEach(function(model, index) {
                            var modelObj = model.toObject();
                            modelObj.index = pageOptions.skip + index + 1;
                            if (modelObj.attr == 1) {
                                modelObj.istop = "是";
                            } else {
                                modelObj.istop = "否";
                            }
                            if (modelObj.status == 0) {
                                modelObj.statusname = "待审核";
                            } else if (modelObj.status == 1) {
                                modelObj.statusname = "已审核";
                            } else if (modelObj.status == -1) {
                                modelObj.statusname = "已关闭";
                            }else if (modelObj.status == -2) {
                                modelObj.statusname = "转码中";
                            }
                            modelObj.createtime = moment(modelObj.createtime).format('YYYY-MM-DD HH:mm:ss');
                            models[index] = modelObj;
                        });
                        response.success(res, {
                            pagecount: Math.ceil(count / pageOptions.pagesize),
                            list: models
                        });
                    }
                });
            }
        });
    },
    detail: function(req, res) {
        var id = req.query.id;
        Lives.findOne({
            _id: id
        }, function(err, model) {
            if (err) {
                response.error(res, err);
            } else if (model) {
                var modelObj = model.toObject();
                modelObj.createtime = moment(modelObj.createtime).format('YYYY-MM-DD HH:mm:ss');
                if(modelObj.ads.time)modelObj.ads.time = moment(modelObj.ads.time).format('YYYY-MM-DD HH:mm:ss');
                if(modelObj.type===3)modelObj.cds.url=comm.replace_pics(modelObj.cds.url);
                else
                    modelObj.cds.url = config.live_ois_url+":"+ config.live_ois_port + '/' + modelObj.cds.cid + '.m3u8?protocal=hls&user=' + modelObj.cds.uid + '&tid=' + modelObj.cds.tid + '&sid=' + modelObj.cds.cid + '&type=3&token=guoziyun';
        		if (modelObj.status == -1) {
        			modelObj.disabled = 'disabled';
        		} else {
        			modelObj.disabled = '';
        		}
                if (modelObj.chatroom.id) {
                    modelObj.chatroom.join = "是";
                    if (modelObj.status == -1) {
                        modelObj.chatroom.disabled = 'disabled';
                    } else {
                        modelObj.chatroom.disabled = '';
                    }
                } else {
                    modelObj.chatroom.join = "否";
                    modelObj.chatroom.disabled = 'disabled';
                }
                return res.render('admin/lives/vod_detail', {
                    title: "微点播详情",
                    model: modelObj,
                    commoditylist:req.commodity,
                    envelopelist:req.envelope
                });
            }
        });
    },
    update: function(req, res) {
        var model = {};
        var id = req.body.id;
        var attr = req.body.attr;
        var status = req.body.status;
        var chatRoomName = req.body.chatRoomName;
        var isjoin=req.body.isjoin;
        var guestList = req.body.guest;
        var rejectionReason = req.body.rejectionReason;
        var chatroomid=req.body.chatroomid;
        var commodity=req.body.commodity;
        var commoditytime=req.body.commoditytime;
        var envelope=req.body.envelope;
        if (Boolean(commodity))model['ads.commodity'] = commodity;
        if (Boolean(envelope))model['ads.envelope'] = envelope;
        if (Boolean(commoditytime))model['ads.time'] = commoditytime;
        if (Boolean(commodity) || Boolean(envelope)){
            model.isads=1;
        }else{
            model.isads=0;
            model.ads={};
        }
        if (Boolean(attr))model.attr = attr;
        if (Boolean(status))model.status = status;
        if (Boolean(chatRoomName)){
            model['chatroom.chatroomname']=chatRoomName;
            model['chatroom.isjoin']=isjoin;
        }
        if (Boolean(guestList)){
            model.guest = guestList
        }else{
            model.guest=[]
        };
        if (Boolean(rejectionReason)) {
            model.reject = {
                reason: rejectionReason,
                time: Date.now()
            };
        }
        Lives.update({_id: id}, model, function(err) {
            if (err) {
                response.error(res, err);
            } else {
                var info="";
                if(model.status==='1' || model.status==='-1'){
                  info=model.status==='-1'?"点播驳回了！":"直播开始了！";
                  var extra=model.status==='-1'?"info":"info";
                  comm.sendMessage({chatroomid:chatroomid,info:info,extra:extra},function(err,result){});
                  if(model.status==="-1"){ //通知ois关闭微直播
                    Lives.findOne({_id:id},function(err,item){
                        var http = require('http');
                        var data='<?xml version="1.0" encoding="utf-8"?>'
                            data+='<SOAP-ENV:Envelope xmlns:SOAP-ENV="default" SOAP-ENV:encodingStyle="default"><SOAP-ENV:Body>';
                            data+='<minichnl uid="'+item.cds.uid+'" tid="'+item.cds.tid+'" cid="'+item.cds.cid+'" cds_id="'+item.cds.cdsid+'" token="guoziyun" />';
                            data+='</SOAP-ENV:Body></SOAP-ENV:Envelope>';
                        var opurl = {
                            host:config.live_ois_url.replace("http://",""),
                            port:5000,
                            path:"/ois/minichnl/destroy",
                            method:"POST",
                            data:data,
                            headers:{
                            "Connection":"Keep-Alive",
                            "Content-Type":'application/xml;charset=utf-8',
                            "Content-length":data.length}
                        }
                        var reqVideo = http.request(opurl, function (serverFeedback) {
                            serverFeedback.setEncoding('utf8');
                            console.log('getVideo:' + serverFeedback.statusCode);
                            if (serverFeedback.statusCode == 200) {
                                console.log(serverFeedback.statusCode)
                            } else {
                                console.log(serverFeedback.statusCode)
                            }
                        })
                        reqVideo.write(data+"\n");
                        reqVideo.end();
                    })
                  }
                }
                Operatorlogs.save({desc: info+":"+id+"[聊天室:"+chatroomid+"]" ,user_login: req.session.user.user_login});
                response.success(res, "");
            }
        });
    },
    delete: function(req, res) {
        var ids = req.body.ids;
        var idList = ids.split(',');
        idList.forEach(function(id) {
            Liveshistories.remove({livesid:id},function(err){});
            Lives.remove({_id: id}, function(err) {
                if(!err)Operatorlogs.save({desc: "删除了点播！"+id ,user_login: req.session.user.user_login});
            });
        });
        return response.success(res, "");
    },
    add:function(req, res){
        return res.render('admin/lives/vod_add', {
            title: "本地添加",
            columns: req.columns
        });
    },
    save:function(req,res){
      var title=validator.trim(req.body.title);
      var _id=validator.trim(req.body._id);
      var type=validator.trim(req.body.type);
      var mpno=validator.trim(req.body.mpno);
      var status=validator.trim(req.body.status);
      var url=validator.trim(req.body.url);
      var column=validator.trim(req.body.column).split(',');
      var userid=validator.trim(req.body.userid).split(',');
      var guestname=validator.trim(req.body.guestname).split(',');
      var nickname=validator.trim(req.body.nickname);
      var chatroomdata={chatroomid:moment().format("YYYYMMDDHHmmss"),
        chatroomname:validator.trim(req.body.chatroomname),
        isjoin:Boolean(validator.trim(req.body.isjoin))
      };
      var proxy = new eventproxy();
      proxy.all('user','live','chatroom',function(user,live,chatroom){
        var model=new Lives({
          title:title,
          desc:validator.trim(req.body.desc),
          user:{
            mpno:mpno,
            face:validator.trim(req.body.face),
            nickname:validator.trim(req.body.nickname),
            roles:user?user.roles:'',
          },
          columns:{
            name:column[1],
            type:column[0],
          },
          cds:{
            url:url
          },
          pics:req.body.pics,
          type:validator.trim(req.body.type),
          status:status,
        });
        var guest=[];
        if (userid.join().length) {
            userid.forEach(function (node, index) {
                guest.push({
                    userid: userid[index],
                    nickname: guestname[index]
                });
            });
        }
        model.guest=guest;
        if(title=='')return res.send({cod:0,message:'请输入主题'});
        if(live){
          live.pics=req.body.pics;
          live.title=model.title;
          live.desc=model.desc;
          live.type=model.type;
          live.columns=model.columns;
          live.user=model.user;
          live.cds;
          live.chatroom.chatroomname=chatroomdata.chatroomname;
          live.chatroom.isjoin=chatroomdata.isjoin;
          live.guest=guest;
          live.status=model.status;
          model=live;
        }else{
          model.chatroom=chatroom;
        }
        model.save(function(err){
           Operatorlogs.save({desc: "上传微点播 \""+model._id+"\" 状态改为:"+model.status ,user_login: req.session.user.user_login});
           return err?res.send({code:0,message:'save err'}):res.send({code:1,message:'save success'});
        })
      });
      lives.findLivesUserByMpno(mpno,proxy.done(function(model){
        proxy.emit('user', model.length?model[0]:"");
      }));
      if(!_id){//新增的时候创建聊天室
        proxy.emit('live', '');
        var request = require('request');
        request.post({url:config.live_chatroom_create,form:chatroomdata},proxy.done(function(response, body){
          var info=JSON.parse(body);
          proxy.emit('chatroom', chatroomdata);
        }));
        proxy.emit('broadcast', '');
      }else{
        Lives.findOne({_id:_id},proxy.done(function(model){
          proxy.emit('live', model);
        }));
        proxy.emit('chatroom', '');
      }
    },
};
exports.trailer = {
    list: function(req, res) {
      return res.render('admin/lives/trailer/trailers', {
        title: "微直播预告",
        columns: req.columns
      });
    },
    list_add: function(req, res) {  
      return res.render('admin/lives/trailer/trailer_add', {
          title: "发起预告",
          columns: req.columns,
          commoditylist:req.commodity,
          envelopelist:req.envelope,
          code: -1
      });
    },
    ajax_list: function(req, res) {
        var columnName = req.body.columnName;
        var title = req.body.title;
        var userName = req.body.userName;
        var where = {type: 2};
        if (!_.isEmpty(columnName)) where['columns.name'] =eval("/"+columnName+"/ig");
        if (!_.isEmpty(title)) where['title'] = eval("/"+title+"/ig");
        if (!_.isEmpty(userName))where['user.nickname'] =eval("/"+userName+"/ig");
        var pageOptions = comm.get_page_options(req);
        Lives.count(where, function(err, count) {
            if (err) {
                response.error(res, err);
            } else {
                console.log(where);
                Lives.find(where).sort('-createtime').skip(pageOptions.skip).limit(pageOptions.limit).exec(function(err, models) {
                    if (err) {
                        response.error(res, err);
                    } else {
                        models.forEach(function(model, index) {
                            var modelObj = model.toObject();
                            modelObj.index = pageOptions.skip + index + 1;
                            if (modelObj.status == 0) {
                                modelObj.statusname = "待审核";
                            } else if (modelObj.status == 1) {
                                modelObj.statusname = "已审核";
                            } else if (modelObj.status == -1) {
                                modelObj.statusname = "已关闭";
                            }
                            modelObj.createtime = moment(modelObj.createtime).format('YYYY-MM-DD HH:mm:ss');
                            models[index] = modelObj;
                        });
                        response.success(res, {
                            pagecount: Math.ceil(count / pageOptions.pagesize),
                            list: models
                        });
                    }
                });
            }
        });
    },
    edit: function(req, res) {
        var id = req.query._id;
        Lives.findOne({_id: id}, function(err, model) {
            if (err) {
                response.error(res, err);
            } else if (model) {
                var modelObj = model.toObject();
                modelObj.starttime = moment(modelObj.starttime).format('YYYY-MM-DD HH:mm:ss');
                modelObj.createtime = moment(modelObj.createtime).format('YYYY-MM-DD HH:mm:ss');
                if(modelObj.ads.time){
                    modelObj.ads.time = moment(modelObj.ads.time).format('YYYY-MM-DD HH:mm:ss');
                }

                return res.render('admin/lives/trailer/trailer_edit', {
                    title: "预告编辑",
                    columns: req.columns,
                    commoditylist:req.commodity,
                    envelopelist:req.envelope,
                    model: modelObj
                });
            }
        });
    },
    save:function(req,res){
      var title=validator.trim(req.body.title);
      var _id=validator.trim(req.body._id);
      var type=validator.trim(req.body.type);
      var mpno=validator.trim(req.body.mpno);
      var status=validator.trim(req.body.status);
      var column=validator.trim(req.body.column).split(',');
      var userid=validator.trim(req.body.userid).split(',');
      var guestname=validator.trim(req.body.guestname).split(',');
      var nickname=validator.trim(req.body.nickname);
      var commodity=validator.trim(req.body.commodity);
      var commoditytime=validator.trim(req.body.commoditytime);
      var envelope=validator.trim(req.body.envelope);
      var chatroomdata={chatroomid:moment().format("YYYYMMDDHHmmss"),
        chatroomname:validator.trim(req.body.chatroomname),
        isjoin:validator.trim(req.body.isjoin)
      };
      var proxy = new eventproxy();
      var request = require('request');
      proxy.all('user','live','chatroom','mpnoFase',function(user,live,chatroom,mpnoFase){
        var model=new Lives({
          title:title,
          desc:validator.trim(req.body.desc),
          user:{
            mpno:mpno,
            face:mpnoFase,
            nickname:validator.trim(req.body.nickname),
            roles:user?user.roles:'',
          },
          columns:{
            name:column[1],
            type:column[0],
          },
          pics:req.body.pics,
          type:validator.trim(req.body.type),
          status:status,
        });
        var guest=[];
        if (userid.join().length) {
            userid.forEach(function (node, index) {
                guest.push({
                    userid: userid[index],
                    nickname: guestname[index]
                });
            });
        }
        model.guest=guest;
        if (Boolean(commodity) || Boolean(envelope)){
          model.isads=1;
          model.ads={
            commodity:commodity,
            envelope:envelope,
            time:commoditytime
          }
        }else{
          model.isads=0;
          model.ads={
            commodity:'',
            envelope:'',
            time:''
          };
        }
        var date=validator.trim(req.body.starttime);
        if(!validator.isDate(date))return res.send({cod:0,message:'预告时间非法'});
        if(title=='')return res.send({cod:0,message:'请输入主题'});
        model.starttime=date;
        if(live){
          live.pics=req.body.pics;
          live.title=model.title;
          live.desc=model.desc;
          live.type=model.type;//变成录播|直播
          live.columns=model.columns;
          live.user=model.user;
          live.chatroom.chatroomname=chatroomdata.chatroomname;
          live.chatroom.isjoin=chatroomdata.isjoin;
          live.guest=guest;
          live.status=model.status;
          live.starttime=model.starttime;
          live.ads=model.ads;
          live.isads=model.isads;
          model=live;
        }else{
          model.chatroom=chatroom;
        }
        model.save(function(err){
           Operatorlogs.save({desc: "保存预告 \""+model._id+"\" 状态改为:"+model.status ,user_login: req.session.user.user_login});
           return err?res.send({code:0,message:'save err'}):res.send({code:1,message:'save success'});
        })
      });
      request.get({url:config.usercenter+'/Userjsonp/ImgIDWithMpno?mpno='+mpno},function(err,body,response){
        var response=eval(response)
        if (response) {
          proxy.emit('mpnoFase',config.usercenter+'/user/headimg?img='+response)
        }else {
          proxy.emit('mpnoFase','')
        }
      });
      lives.findLivesUserByMpno(mpno,proxy.done(function(model){
        proxy.emit('user', model.length?model[0]:"");
      }));
      if(!_id){//新增的时候创建聊天室
        proxy.emit('live', '');
        var request = require('request');
        request.post({url:config.live_chatroom_create,form:chatroomdata},proxy.done(function(response, body){
          var info=JSON.parse(body);
          proxy.emit('chatroom', chatroomdata);
        }));
        proxy.emit('broadcast', '');
      }else{
        Lives.findOne({_id:_id},proxy.done(function(model){
          proxy.emit('live', model);
        }));
        proxy.emit('chatroom', '');
      }
    },
    delete: function(req, res) {
        var ids = req.body.ids;
        var idList = ids.split(',');
        idList.forEach(function(id) {
            Liveshistories.remove({livesid:id},function(err){});
            Lives.remove({
                _id: id
            }, function(err) {
                Operatorlogs.save({desc: "删除预告 \""+id+"\"" ,user_login: req.session.user.user_login});
            });
        });
        return response.success(res, "");
    }
};
exports.director = {
    list: function(req, res) {
        return res.render('admin/lives/director', {
            title: "微导播",
        });
    },
    ajax_list: function(req, res) {
        var title = req.query.title;
        var where = {type: 4,status:{$ne:-2}};
        if (Boolean(title))where['title'] = eval("/"+title+"/ig");
        var pageOptions = comm.get_page_options(req);
        getAllLives(where,{},pageOptions,function(count,models){
            return response.success(res, {
                pagecount: Math.ceil(count / pageOptions.pagesize),
                currentpage:pageOptions.currentpage,
                list: models
            });
        })
    },
    detail: function(req, res) {
        var id = req.query.id;
        Lives.findOne({_id: id}, function(err, model) {
            if (err) {
                response.error(res, err);
            } else if (model) {
                var modelObj = model.toObject();
                modelObj.createtime = moment(modelObj.createtime).format('YYYY-MM-DD HH:mm:ss');
                if(modelObj.ads.time)modelObj.ads.time = moment(modelObj.ads.time).format('YYYY-MM-DD HH:mm:ss');
                // modelObj.cds.url = config.live_ois_url+":"+ config.live_ois_port + '/' + modelObj.cds.cid + '.m3u8?protocal=hls&user=' + modelObj.cds.uid + '&tid=' + modelObj.cds.tid + '&sid=' + modelObj.cds.cid + '&type=3&token=guoziyun';
                if (modelObj.status == -1) {
                    modelObj.disabled = 'disabled';
                } else {
                    modelObj.disabled = '';
                }
                return res.render('admin/lives/director_detail', {
                    title: "微直播详情",
                    model: modelObj,
                    commoditylist:req.commodity,
                    envelopelist:req.envelope
                });
            }
        });
    },
    director_live_list: function(req, res) {
        var columnName = req.body.columnName;
        var title = req.body.title;
        var userName = req.body.userName;
        var status = req.body.status;
        var where = {type: {$ne:4},status:{$ne:-2}};
        var pageOptions = comm.get_page_options(req);
        getAllLives(where,{},pageOptions,function(count,models){
            return response.success(res, {
                pagecount: Math.ceil(count / pageOptions.pagesize),
                currentpage:pageOptions.currentpage,
                list: models
            });
        })
    },
    update_url:function(req,res){
        var id=req.body.id;
        var url=req.body.url;
        var model={
          cds:{
            url:url
          }
        };
        Lives.findOneAndUpdate({_id:id},model,{new:true,upsert:true},function(err,model){
            console.log(model)
            if (err) {
                return response.error(res, err);
            }else{
                var extra="switch1";
                var info="切换主屏";
                var chatroomid=model.chatroom.chatroomid;
                comm.sendMessage({chatroomid:chatroomid,info:info,extra:extra},function(err,result){    
                    Operatorlogs.save({desc: "导播:"+id+"切换视频" ,user_login: req.session.user.user_login});
                    return response.success(res,{url:url});
                });
            }
        });
    },
    update_suburl:function(req,res){
        var id=req.body.id;
        var url=req.body.url;
        var model={
            suburl:url
        };
        Lives.findOneAndUpdate({_id:id},model,{new:true,upsert:true},function(err,model){
            console.log(model)
            if (err) {
                return response.error(res, err);
            }else{
                var extra="switch2";
                var info="切换辅屏";
                var chatroomid=model.chatroom.chatroomid;
                comm.sendMessage({chatroomid:chatroomid,info:info,extra:extra},function(err,result){    
                    Operatorlogs.save({desc: "导播:"+id+"切换视频" ,user_login: req.session.user.user_login});
                    return response.success(res,{url:url});
                });
            }
        });
    },
    update: function(req, res) {
        var model = {};
        var id = req.body.id;
        var delayTime = req.body.delayTime;
        var chatRoomName = req.body.chatRoomName;
        var isjoin=req.body.isjoin;
        var guestList = req.body.guest;
        var chatroomid=req.body.chatroomid;
        var commodity=req.body.commodity;
        var commoditytime=req.body.commoditytime;
        var envelope=req.body.envelope;
        if (Boolean(commodity))model['ads.commodity'] = commodity;
        if (Boolean(envelope))model['ads.envelope'] = envelope;
        if (Boolean(commoditytime))model['ads.time'] = commoditytime;
        if (Boolean(commodity) || Boolean(envelope)){
            model.isads=1;
        }else{
            model.isads=0;
            model.ads={};
        }
        if (Boolean(delayTime))model['cds.delaytime'] = delayTime;
        if (Boolean(chatRoomName)){
            model['chatroom.chatroomname']=chatRoomName;
            model['chatroom.isjoin']=isjoin;
        }
        if (Boolean(guestList))model.guest = guestList;
        else{
            model.guest=[];
        }
        Lives.update({_id: id}, model, function(err) {
            if (err) {
                response.error(res, err);
            } else {
                Operatorlogs.save({desc: "直播间修改:"+id ,user_login: req.session.user.user_login});
                response.success(res, "");
            }
        });
    },message:function(req,res){
        var info=req.body.info;
        var chatroomid=req.body.chatroomid;
        var proxy = new eventproxy();
        proxy.all('message',function(message){
            var result="消息发送失败！"
            if(message.code===200){
                Operatorlogs.save({
                    desc: "发送消息:"+ info+"[私聊:"+chatroomid+"]",
                    user_login: req.session.user.user_login
                });
                result="消息发送成功！"
            }
            response.success(res,result);
        });
        comm.sendMessage({chatroomid:chatroomid,info:info,extra:'private'},proxy.done(function(result){
            proxy.emit('message',result);
        }));
    },message_list:function(req,res){
        var mid=req.query.mid;
        Livemessage.find({mid:mid}).exec(function(err,model){
            return response.success(res,model)
        })
    }  
};
// lives setting
exports.setting = {
	loadAll: function(req, res, next) {
		lives.findAllSetting(function(err, models) {
			req.setting = models;
			next();
		});
	},
	set_page: function(req, res) {
		var setting = req.setting;
		var setObj = {
			live_delay: {
				value: '0',
				_id: ''
			},
			live_default_status: {
				value: '0',
				_id: ''
			},
			live_concurrent_number: {
				value: '0',
				_id: ''
			},
			live_switch: {
				value: '0',
				_id: ''
			}
		}
		if (setting != null && setting.length != 0) {
			console.log(setting.length);
			for (var i = 0; i < setting.length; i++) {
				if (setting[i].key == 'live_delay') {
					setObj.live_delay.value = setting[i].val;
					setObj.live_delay._id = setting[i]._id;
				} else if (setting[i].key == 'live_default_status') {
					setObj.live_default_status.value = setting[i].val;
					setObj.live_default_status._id = setting[i]._id;
				} else if (setting[i].key == 'live_concurrent_number') {
					setObj.live_concurrent_number.value = setting[i].val;
					setObj.live_concurrent_number._id = setting[i]._id;
				} else if (setting[i].key == 'live_switch') {
					setObj.live_switch.value = setting[i].val;
					setObj.live_switch._id = setting[i]._id;
				}
			}
		}
		return res.render('admin/lives/setting/setting', {
			title: "微直播设置",
			setting: setObj
		});
	},
	update_setting: function(req, res) {
		var setObj = req.body.setting;
		var id = setObj._id;
		var _setting;
		if (typeof(id) != "undefined" && id != "") {
			lives.findSettingById(id, function(err, models) {
				if (models != null) {
					_setting = _.extend(models[0], setObj);
					_setting.save(function(err, model) {
						if (err) {
							response.error(res, err);
						} else {
							response.success(res);
						}
					});
				} else {
					response.error(res, err);
				}
			});
		} else {
			lives.saveSetting(setObj, function(err) {
				if (err) {
					response.error(res, err);
				} else {
					response.success(res);
				}
			});
		}
	}
};
exports.signs={
    list: function(req, res) {
        return res.render('admin/lives/signs', {
            title: "签到记录",
        });
    },
    ajax_list:function(req,res){
      var proxy=new eventproxy();
      var options = comm.get_page_options(req);
      var mpno=validator.trim(req.query.mpno);
      var query=Livessigns;
      if(mpno!=='')query.where({mpno:eval("/"+mpno+"/")});
      proxy.all('count','list',function(count,list){
        return res.send({
              code:1,
              count:count,
              pagecount: Math.ceil(count / options.pagesize),
              currentpage:options.currentpage,
              list: list
            });

      })
      query.count({},proxy.done(function(count){
        proxy.emit('count',count);
      }))
      query.find().sort("-createtime").skip(options.skip).limit(options.pagesize).exec(proxy.done(function(models){
        var list=[];
        if(models){
            models.forEach(function(model, index) {
              var modelObj = model.toObject();
              modelObj.index = options.skip + index + 1;
              modelObj.createtime = moment(modelObj.createtime).format('YYYY-MM-DD HH:mm:ss');
              models[index] = modelObj;
            });
            list=models;
        }
        proxy.emit('list',list);
      }))
    }
}
exports.statistics=function(req,res){
   /*今日上传报料数、昨日上传报料数
    今日发布预告数、昨日发布预告数
    今日申请实名认证数、昨日申请实名认证数
    今日直播视频数、昨日直播视频数 */
    var proxy=new eventproxy();
    var events = ['todayTrailer', 'yestodyTrailer', 'todayLives','yestodyLives','todayVod','yestodyVod','todayAuth','yestodayAuth'];
    proxy.all(events, function (todayTrailer, yestodyTrailer, todayLives,yestodyLives,todayVod,yestodyVod,todayAuth,yestodayAuth) {
        return res.render('admin/lives/statistics', {
            title: "微统计",
            data:{
                today:{trailer:todayTrailer,lives:todayLives,vod:todayVod},
                yestody:{trailer:yestodyTrailer,lives:yestodyLives,vod:yestodyVod}
            }
        });
    })
    var today=moment().utc().format('YYYY-MM-DD');//转为格林威治时间,mongodb不知道如何设置时区
    var yestoday=moment().utc().add('-1','d').format('YYYY-MM-DD');//转为格林威治时间,mongodb不知道如何设置时区
    Lives.find({createtime:{$gte:today},status:{$gt:-2}}).exec(proxy.done(function(models){
        var _trailer_index=0,_live_index=0,_vod_index=0;
        if(models){
            models.forEach(function(node,index){
                if(node.type===2){
                    _trailer_index++;
                }else if(node.type===0){
                    _live_index++;
                }else if(node.type===1 || node.type===3){
                    _vod_index++;
                }
            })
        }
        proxy.emit('todayTrailer',_trailer_index);
        proxy.emit('todayLives',_live_index);
        proxy.emit('todayVod',_vod_index);
    }))
    Lives.find({createtime:{$gte:yestoday,$lt:today},status:{$gt:-2}}).exec(proxy.done(function(models){
        var _trailer_index=0,_live_index=0,_vod_index=0;
        if(models){
            models.forEach(function(node,index){
                if(node.type===2){
                    _trailer_index++;
                }else if(node.type===0){
                    _live_index++;
                }else if(node.type===1 || node.type===3){
                    _vod_index++;
                }
            })
        }
        proxy.emit('yestodyTrailer',_trailer_index);
        proxy.emit('yestodyLives',_live_index);
        proxy.emit('yestodyVod',_vod_index);
    }))
    proxy.emit('todayAuth',[]);
    proxy.emit('yestodayAuth',[]);
}