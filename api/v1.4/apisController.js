var Areas = require('../../models/areas').areas;
var Medias = require('../../models/medias').medias;
var Posts = require('../../models/posts').posts;
var Postvideo = require('../../models/postvideo').postvideo;
var Specials = require('../../models/specials').specials;
var Pics = require('../../models/pics').pics;
var Columns = require('../../models/columns').columns;
var Hangyes = require('../../models/hangyes').hangyes;
var Kpis = require('../../models/kpis').kpis;
var Comments = require('../../models/comments').comments;
var Favorites = require('../../models/favorites').favorites;
var Activitys = require('../../models/activitys').activitys;
var Scores = require('../../models/scores').scores;
var Uploads = require('../../models/uploads').uploads;
var Organs = require('../../models/organs').organs;
var Signs = require('../../models/signs').signs;
var Videos = require('../../models/videos').videos;
var Attachs = require('../../models/attachs').attachs;
var Dishes = require('../../models/dishes').dishes;
var Votes = require('../../models/votes').votes;
var Sysconfigs = require('../../models/sysconfigs').sysconfigs;
var Votesrecords = require('../../models/votesrecords').votesrecords;
var Feedbacks = require('../../models/feedbacks').feedbacks;
var Anchorsdynamics = require('../../models/anchorsdynamics').anchorsdynamics;
var Anchors = require('../../models/anchors').anchors;
var Answers = require('../../models/answers').answers;
var Sysconfigs=require('../../models/sysconfigs').sysconfigs;
var Ads = require('../../models/ads').ads;
var Operatorlogs = require('../../proxy/operatorlogs');
var moment = require('moment');
var response = require('../../lib/response');
var comm = require('../../lib/comm');
var cloud = require('../../lib/cloud');
var cache = require('../../lib/cache');
var config = require('../../config');
var validator = require('validator');
var url = require('url');
var path=require('path');
var fs = require("fs");
var _ = require('lodash');
var formidable = require('formidable');
var eventproxy = require('eventproxy');
var coin_url=config.usercenter+'/coin/Add';
var _const={
    'get_ad':config.session_secret+'get_ad_'+config.version,
    'get_medias':config.session_secret+'get_medias_'+config.version,
    'get_detail_next':config.session_secret+'get_detail_next_'+config.version,
    'get_detail':config.session_secret+'get_detail_'+config.version
}
//获取栏目列表接口
exports.get_columns_list = function (req, res) {
    var select={
        name: 1,
        icon: 1,
        pics: 1,
        upstatus: 1,
        adstatus: 1,
        pid:1,
        position: 1,
        url: 1,
        menutype: 1,
        listtype: 1,
        isselect:1,
        haschild:1,
        istitle:1,
        isshow:1,
        commentstatus: 1,
        _id: 1
    }
    var where={};
    where.status=0;
    var menutype=req.query.menutype;
    var pid=req.query.pid;
    if(menutype!==undefined && menutype!=="")where.menutype=menutype;
    if(pid!==undefined && pid!=="")where.pid=pid;
    Columns.find(where).select(select).sort('order').exec(function (err, models) {
        if (err)return res.send({ "code": 0 });
        var json = {};
        models.forEach(function (node, index) {
            node = node.toObject();
            node.cid = node._id;
            node.icon = comm.replace_pics(node.icon);
            node.pics = comm.replace_pics(node.icon);
            models[index] = node;
        });
        return response.api(res, {}, models);
    });
}
//获取专题接口
exports.get_specials= function (req, res) {
    var mid = req.query.mid;
    var where = { sid: mid };
    var options = comm.api_get_page_options(req);
    Specials.find(where)
    .populate('mid').skip(options.skip).limit(options.limit)
        .sort("-createtime")
        .exec(function (err, models) {
        if (err || !models) return res.send({ "code": 0 });
        else {
            var list=[];
            models.forEach(function (node, index) {
                if(node.mid){
                    list.push(node.mid);
                }
            });
            return response.api(res, {}, get_medias_format(list));
        }
    });
}
exports.get_specials_group=function(req,res){
    var mid = req.query.mid;
    var mpno = req.query.mpno;
    var where = { sid: mid };
    var options = comm.api_get_page_options(req);
    Specials.find(where).populate('mid').sort("-createtime")
        .exec(function (err, models) {
        if (err || !models) return res.send({ "code": 0 });
        else {
            var groupname=_.groupBy(models, 'name');
            var group=[];
            for(var key in groupname){
                var result=[];
                if(groupname[key]){
                    groupname[key].forEach(function(node,index){
                        if(node.mid){
                            var item=node.mid;//不能toObject 使用item.area 替换assisted
                            var key=_.findIndex(item.user_like_this_post, function(chr) {
                              return chr.mpno == mpno;
                            });
                            if(key>-1){item.area = 1;}
                            else{
                                item.area=0;
                            }
                            result.push(item);
                        }
                    })
                }
                group.push({name:key,item:get_medias_format(result)});
            }
            /*
            models.forEach(function (node, index) {
                if(node.mid)list.push(node.mid);
            });*/
            return response.api(res, {}, group);
        }
    });
}
var search = function (req, res,condition) {
    var select = {
        content: 0, "commentstatus": 0, slides: 0,
        "status": 0, "password": 0,
    };
    var options = comm.api_get_page_options(req);
    var where = {status:2};
    if(condition.mid){
        var mid=condition.mid;
        where._id={$ne:mid}
    }
    if(condition.type){
        where.type = condition.type;
    }
    if(condition.title){
        where.title = { $regex: condition.title, $options: 'i' };
    }
    var orderby="-attr -createtime";
    if(condition.orderby){
        orderby=condition.orderby;
    }
    Posts.find(where).where({'post_publish_status.cid':{$exists:true}})
        .skip(options.skip)
        .limit(options.limit).sort(orderby).select(select)//降序
		.exec(function (err, models) {
        if (err || !models) {
            return res.send({ "code": 0 });
        } else {
            models.forEach(function (node, index) {
                node.mid = node._id;
            });
            return response.api(res, { }, get_medias_format(models));
        }
    });
}
function get_medias_format(models){
    models.forEach(function (node, index) {
        var node=node.toObject();
        node.createtime = parseInt(moment(node.createtime).format('X'));
        if(node.imgextra){
            node.imgextra.forEach(function(m,i){
                if (m) m.src=comm.replace_pics(m.src);
            })
        }
        if(node.activityetime)node.activityetime = parseInt(moment(node.activityetime).format('X'));
        if(node.activitystime)node.activitystime = parseInt(moment(node.activitystime).format('X'));
        if(node.address)node.activityaddress=node.address;
        if(node.pics)node.pics = comm.replace_pics(node.pics);
        if(node.post_publish_status){
            if(!node.cid && node.post_publish_status.length)node.cid=node.post_publish_status[0]['cid'];//不能存在cid
        }
        if(!node.mid)node.mid=node._id;
        if(node.link){
            node.url=node.link
        }else{
            if(!node.url)node.url = comm.replace_url(node);
        }
        if(node.video)node.video = comm.replace_pics(node.video);
        if(!node.shareurl)node.shareurl = comm.replace_shareurl(node);
        node.assisted=node.area;
        delete node.post_publish_status;
        delete node.user_like_this_post;
        delete node._id;
        delete node.order;
        //delete node.area;
        delete node.hangye;
        delete node.attr;
        delete node.toptime;
        delete node.publish_size;
        delete node.columnid;
        delete node.status;
        delete node.members;
        delete node.__v;
        delete node.password;
        delete node.commentstatus;
        delete node.content;
        models[index]=node;
    });
    return models;
}
//获取资源列表接口
exports.get_medias = function (req, res) {
    var cid = validator.trim(req.query.cid);
    var type = validator.trim(req.query.type);
    var title = validator.trim(req.query.title);
    var mid=validator.trim(req.query.mid);
    var sort=validator.trim(req.query.sort);
    var orderby="-attr -createtime";
    if(sort==="0")orderby="-clickcount -commentcount -assistcount";
    if(sort==="1"){
        var a=['-attr',' -createtime','-clickcount','-commentcount','-assistcount','assistcount','commentcount','clickcount','createtime','attr'];
        orderby=a[parseInt(Math.random()*10)];
        return search(req, res, {type:type,orderby:orderby,mid:mid});
    }
    var where = { } ;
    var index=-1;
    if (cid !== "") {
        index=cid;
        where = { cid: cid };
    }
    if (title !== '') {
        where.title = { $regex: title, $options: 'i' };
        return search(req, res, {title:title});
    }
    if(type!=="")where.type=type;
    if(mid!=="")where.mid={$ne:mid};//不等于
    var select = {
        "content": 0, "commentstatus": 0, "slides":0,
        "status": 0, "password": 0,
    };
    var options = comm.api_get_page_options(req);
    //如果是30000 获取joygo 云端数据
    if(cid==='30000'){
        return cloud.get_remote_medias(options,function(error,models){
            response.api(res, {}, get_medias_format(models));
        });
    }
    var cachekey=_const.get_medias+index+options.page+cid+type+mid;
    cache.get(cachekey,function(err,get_medias){
        var json = {  };
        if(get_medias){
            return response.api(res, json, get_medias);
        }else{
            Medias.find().where(where).skip(options.skip).limit(options.limit).sort(orderby).select(select)//降序
                .exec(function (err, models) {
                if (err || !models) return res.send({ "code": 0 });
                else {
                    var models=get_medias_format(models);
                    cache.set(cachekey, models, config.redis.time);//设置缓存
                    return response.api(res, json, models);
                }
            });
        }
    })
}
//获取资源详情接口
exports.get_detail = function (req, res) {
    var _id = comm.get_req_string(req.query.mid,'');
    var mpno = comm.get_req_string(req.query.mpno,'');
    var cid=comm.get_req_string(req.query.cid,'');
    if (_id==='')return res.send({ "code": 0 });
    var proxy = new eventproxy();
    var cachekey=_const.get_detail+_id;
    Posts.findOne({ _id: _id }, { __v: 0, status:0, post_publish_status: 0,password:0, publish_size:0,attr:0}, function (err, models) {
        if (err)return res.send({ "code": 0 });
        if (models != null) {
            var node = models.toObject();
            node.mid = node._id;
            node.url = comm.replace_url(node);
            node.shareurl = comm.replace_shareurl(node);
            node.assisted = 0;
            node.activityaddress=node.address;
            var regexp=/(\d{3})\d{4}(\d{4})/;
            node.author=node.author.replace(regexp,"$1****$2");
            if (node.user_like_this_post instanceof Array) {
                node.user_like_this_post.forEach(function (item, i) {
                    if ( mpno== item.mpno) {
                        node.assisted = 1;
                        return
                    }
                });
            }
            node.createtime = parseInt(moment(node.createtime).format("X"));
            node.activityetime = parseInt(moment(node.activityetime).format('X'));
            node.activitystime = parseInt(moment(node.activitystime).format('X'));
            // node.content = comm.replace_html(node.content);
	    node.content = node.content;
            node.pics = comm.replace_pics(node.pics);
            node.video = comm.replace_pics(node.video);
            node.favoritesed = 0;// 1=已经收藏过了
            proxy.all('pics','postvideos',"favorites_count","columns", function (pics,postvideos,favorites_count,columns) {
                node.images = [];
                if (pics != null) {
                    if (pics.imgs != null && pics.imgs !== undefined) {
                        pics.imgs.forEach(function (m, i) {
                            if (m.imgurl != "" && m.imgurl.indexOf("http://") < 0 && m.imgurl.indexOf("https://") < 0) {
                                m.imgurl = config.website + m.imgurl;
                            }
                            node.images.push(m);
                        });
                    }
                }
                if(node.imgextra){
                    node.imgextra.forEach(function(m,index){
                        m.src=comm.replace_pics(m.src);
                    })
                }
                node.activityvideos = [];
                if (postvideos != null) {
                    postvideos.forEach(function (v, index) {
                        item=v.toObject();
                        if(item.vtype===3 || item.vtype===null){
                            if(item.vpath)item.vpath=comm.replace_pics(item.vpath);
                        }
                        if(item.imgurl)item.imgurl=comm.replace_pics(item.imgurl);
                        v=item;
                        node.activityvideos.push(v);
                    });
                }
                if(favorites_count>0)node.favoritesed = 1;
                if(columns != null){
                    var cstatus=columns.commentstatus;
                    console.log(cstatus);
                    if(cstatus==0){
                        node.commentstatus=0
                    }
                    if(cstatus==2){
                        if(node.commentstatus==0){
                            node.commentstatus=0
                        }else{
                            node.commentstatus=2
                        }
                    }
                }
                delete node.user_like_this_post;
                delete node._id;
                delete node.columnid;
                delete node.area;
                delete node.hangye;
                delete node.videoid;
                delete node.slides;
                delete node.order;
                delete node.tag;
                models=node;
                //cache.set(cachekey, models, config.redis.time);//设置缓存
                return response.apidetail(res, {}, models);
            })
            var get_pics=function(where,callback){
                cache.get(cachekey+"pics",function(err,pics){
                    if(pics)callback(err,pics);
                    else{
                        Pics.findOne(where).exec(function(err,models){
                            cache.set(cachekey, models, config.redis.time);//设置缓存
                            callback(err,models);
                        });
                    }
                })
            }
            //加入缓存
            var get_favorites=function(where,callback){
                Favorites.count(where, function (error, count) {
                    callback(err,count);
                });
            }
            //加入缓存
            var get_postvideos=function(where,callback){
                cache.get(cachekey+"postvideos",function(err,postvideos){
                    if(postvideos)callback(err,postvideos);
                    else{
                        Postvideo.find(where).exec(function (err, models) {
                            cache.set(cachekey, models, config.redis.time);//设置缓存
                            callback(err,models);
                        });
                    }
                })
            }
            get_favorites({ mid: _id ,mpno: mpno},proxy.done(function(count){
                proxy.emit('favorites_count',count);
            }))
            Columns.findOne({_id:cid},function(err,model){
                proxy.emit('columns',model);
            })
            if (node.type == 3){
                get_pics({_id:_id},proxy.done(function(item){
                    proxy.emit('pics',item);
                }))
            }else{
                proxy.emit('pics',null);
            }
            if (node.type == 5){
                get_postvideos({pid:_id},proxy.done(function(models){
                    proxy.emit('postvideos',models);
                }))
            }else{
                proxy.emit('postvideos',null);
            }
        } else {
            response.apidetail(res, {}, {});
        }
    });
}
//获取上一篇下一篇 有缓存
exports.get_detail_next=function(req,res){
    var _id = validator.trim(req.query.mid);
    var type = validator.trim(req.query.type);
    var cid = validator.trim(req.query.cid);
    var createtime = validator.trim(req.query.createtime);
    createtime=new Date(createtime * 1000).toLocaleString();
    //,createtime:{$gte:new Date(createtime * 1000).toLocaleString()}
    if (_id==='' && createtime==='')return res.send({ "code": 0 ,message:'paramter error'});
    var proxy = new eventproxy();
    var cachekey=_const.get_detail_next+_id+type+createtime;
    cache.get(cachekey,function(err,data){
        if(data)return res.send(data);
        else{
            var proxy = new eventproxy();
            proxy.all('next','prev',function(next,prev){
                var result={code:1};
                var get_format_detail=function(model){
                    var node=model.toObject();
                    node.cid=cid;
                    if(!node.mid)node.mid=node._id;
                    if(!node.url)node.url = comm.replace_url(node);
                    if(!node.shareurl)node.shareurl = comm.replace_shareurl(node);
                    delete node._id;
                    return node;
                }
                if(next)result.next=get_format_detail(next);
                if(prev)result.prev=get_format_detail(prev);
                cache.set(cachekey, result, config.redis.time);//设置缓存
                return res.send(result);
            })
            var where={createtime:{$gt:createtime},'post_publish_status.cid':{$exists:true},status:2}
            Posts.findOne(where).select({title:1,_id:1}).sort("createtime").exec(proxy.done(function ( models) {
                proxy.emit('next',models);
            }));
            where.createtime={$lt:createtime};
            Posts.findOne(where).select({title:1,_id:1}).sort("-createtime").exec(proxy.done(function ( models) {
                proxy.emit('prev',models);
            }));
        }
    })
}
//获取地区列表
exports.get_areas_list = function (req, res) {
    try {
        Areas.find({}, { id: 1, name: 1, pid: 1, _id: 0 })
		.exec(function (err, models) {
            if (err || !models) {
                return res.send({ "code": 0 });
            } else {
                response.api(res, {}, models);
            }
        });
    } catch (e) {
        console.log('error when exit', e.stack);
    }
}
//获取行业接口
exports.get_hangyes_list = function (req, res) {
    try {
        Hangyes.find({}, { id: 1, name: 1, order: 1, _id: 0 })
		.exec(function (err, models) {
            if (err || !models) {
                return res.send({ "code": 0 });
            } else {
                response.api(res, {}, models);
            }
        });
    } catch (e) {
        console.log('error when exit', e.stack);
    }
}
//获取评论列表接口
exports.get_comments_list = function (req, res) {
    try {
        var mid = req.query.mid;
        var mpno = req.query.mpno;
        var type = req.query.type;
        var where = {status:0};
        if (type == undefined || type == "") {
            return res.send({ "code": 0 });
        }

        if (type == 0) {
            if (mpno === undefined && mpno == "") {
                return res.send({ "code": 0 });
            }
            if (mid !== undefined && mid !== "") {
                where.mid = mid;
            } else {
                return res.send({ "code": 0 });
            }
        }
        else if (type == 1) {
            if (mpno !== undefined && mpno !== "") {
                where.mpno = mpno;
            }
        }
        else {
            //否则参数非法了，啥也不给你
            return res.send({ "code": 0 });
        }
        var select = {
            "__v": 0
        };
        var options = comm.api_get_page_options(req);

        var json = {};
        Comments.find().where(where).skip(options.skip).limit(options.limit).select(select).sort("-createtime")
		.exec(function (err, models) {
            if (err || !models) {
                return res.send({ "code": 0 });
            } else {
                models.forEach(function (node, index) {
                    var node = node.toObject();
                    node.assisted = 0;
                    node.commentid = node._id;
                    if (type == 0) {
                        if (node.assistuser instanceof Array) {
                            node.assistuser.forEach(function (item, i) {
                                if (mpno == item.mpno) {
                                    node.assisted = 1;
                                    return
                                }
                            });
                        }
                    }
                    delete node.assistuser;
                    delete node._id;
                    delete node.mid;
                    delete node.ip;
                    node.createtime = parseInt(moment(node.createtime).format('X'));
                    models[index] = node;
                });
                response.api(res, json, models);
            }
        });

    } catch (e) {
        console.log('error when exit', e.stack);
    }
}
//获取幻灯片
exports.get_slides_list = function (req, res) {
    var cid = req.query.cid;
    if (cid == undefined || cid == "") {
        return res.send({ "code": 0 });
    }
    //获取总数 进行分页
    var where = { "cid": cid,attr:100 };//属性100代表幻灯
    var select = {
        content: 0, "attr": 0, "commentstatus": 0,
        "status": 0, "password": 0, "__v": 0
    };
    //最多显示5个
    Medias.find().where(where).sort("-attr -createtime").select(select)//降序
		.exec(function (err, models) {
        if (err || !models) {
            return res.send({ "code": 0 });
        } else {
            models.forEach(function (node, index) {
                node = node.toObject();
                node.createtime = parseInt(moment(node.createtime).format('X'));

                if (node.type == 5) {
                    node.type = 1;//原来幻灯片自动替换为新闻
                }
                node.pics = comm.replace_pics(node.pics);
                models[index] = node;
                delete node._id;
                node.url = comm.replace_url(node);
                node.shareurl = comm.replace_shareurl(node);
                delete node.order;
                delete node.tag;
                delete node.area;
                delete node.hangye;
                delete node.publish_size;
                delete node.activityetime;
                delete node.activitystime;
            });
            response.api(res, {}, models);
        }
    });
}
//获取收藏列表接口
exports.get_favorites = function (req, res) {
    var mpno = req.query.mpno;
    if (mpno == undefined || mpno == "") {
        return res.send({ "code": 0 });
    }
    var options = comm.api_get_page_options(req);
    var where = { mpno: mpno };
    Favorites.find(where).skip(options.skip).sort('-createtime').limit(options.limit).exec(function (err, models) {
        if (err) {

        } else {
            models.forEach(function (node, index) {
                node = node.toObject();
                node.createtime = parseInt(moment(node.createtime).format('X'));
                node.pics = comm.replace_pics(node.pics);
                node.url = comm.replace_url(node);
                node.shareurl = comm.replace_shareurl(node);
                models[index] = node;
            });
            response.api(res, {}, models);
        }
    });
}
//获取技师评分
exports.get_scores = function (req, res) {
    if (!validator.trim(req.query.mid)) {
        return res.send({ "code": 0, message: "请选择技师" });
    }
    var mid = req.query.mid;
    Scores.find({ mid: mid }).exec(function (err, models) {
        if (err || !models) {
            return { "code": 0, message: "无评分" }
        }
        var count = models.length;
        if (count == 0) {
            return res.send({
                "code": 1, data: {
                    mid: mid,
                    num: 0
                }
            });
        }
        var num = 0;
        models.forEach(function (node, index) {
            num += parseInt(node.num);
        })
        res.send({
            code: 1,
            data: {
                mid: mid,
                num: Math.ceil(num / count)
            }
        });
    });
}
//绩效考核
exports.get_kpis = function (req, res) {
    var title = comm.get_req_string(req.query.title,"");
    var param_sort = req.query.sort;//sort=0 按年、月排序 降序  sort=1 综合降序
    var year = req.query.year;
    var month = req.query.month;
    var modelunit = req.query.modelunit;
    var advanced = req.query.advanced;
    var flag = parseInt(req.query.flag);//标识 1=客户端首页 0=其他
    var type = req.query.type;
    var where= {}
    if (title !== undefined && title !== '') {
        where.title = { $regex: title, $options: 'i' };
    }else{
        req.query.pagesize=10000;//不是搜索全都传给客户端，主要用于首页一次呈现个人单位，客户端自己过滤
    }
    if (year !== undefined && year !== '') {
        where.year = year;
    }
    if (month !== undefined && month !== '') {
        where.month = month;
    }
    if (modelunit !== undefined && modelunit !== '') {
        where.modelunit = modelunit;
    }
    if (advanced !== undefined && advanced !== '') {
        where.advanced = advanced;
    }
    if (type !== undefined && type !== '') {
        where.type = type;
    }
    where.veto=0;
    var sort = {};
    var options = comm.api_get_page_options(req);
    if (param_sort !== undefined && param_sort !== '') {
        param_sort=parseInt(param_sort);
        if (param_sort === 0) {
            sort.year = -1;//1升序 -1降序
            sort.month = -1;
        }
        if (param_sort === 1) {
            sort.total = -1;
        }
    }
    var select = {
        __v: 0
    };
    if(!flag){
        get_kpis(where,sort,select,options,res);
    }else{
        Kpis.findOne().sort('-createtime').exec(function(err,model){
            if(err || !model){
                return res.send({code:0});
            }else{
                where.year=model.year;
                where.month=model.month;
                get_kpis(where,sort,select,options,res);
            }
        });
    }
}
function get_kpis(where,sort,select,options,res){
    Kpis.find(where).sort(sort).skip(options.skip).select(select).limit(options.limit).exec(function (err, models) {
        if (err || !models) {
            return res.send({code:0})
        } else {
            models.forEach(function (node, index) {
                node = node.toObject();
                node.createtime = parseInt(moment(node.createtime).format('X'));
                models[index] = node;
            });
            response.api(res, {}, models);
        }
    });
}
exports.get_coins = function (req, res) {
    response.apidetail(res, {}, "");
}
//获取我的上传
exports.get_myuploads = function (req, res) {
    var options = comm.api_get_page_options(req);
    var select = {
        mpno: 1,pics: 1,video: 1,status:1,content:1,type:1,title:1,position:1,createtime:1,
    };
    if (!validator.trim(req.query.mpno)) {
        return res.send({ "code": 0 ,message:'用户手机号不能为空'});
    }
    var where ={}
    where.mpno= req.query.mpno;
    where.status ={$in:[1,2,-2]};
    where.from=2;
    Attachs.find(where).sort('-createtime').skip(options.skip).select(select).limit(options.limit).exec(function (err, models) {
        if (err) {
            return res.send({ "code": 0,message:'出错了' });
        } else {
            models.forEach(function (node, index) {
                node = node.toObject();
                node.createtime = parseInt(moment(node.createtime).format('X'));
                node.video = comm.replace_pics(node.video);
                node.pics = comm.replace_pics(node.pics);
                node.url=comm.replace_myuploads_url(node);
                models[index] = node;
            });
            response.api(res, {}, models);
        }
    });
}
//获取我的上传明细
exports.get_myuploads_detail=function(req,res){
    var select = {
        mpno: 1,pics: 1,video: 1,status:1,content:1,type:1,title:1,position:1,createtime:1,
        files:1,location:1
    };
    if (!validator.trim(req.query.mid)) {
        return res.send({ "code": 0 });
    }
    var where ={}
    where._id= req.query.mid;
    where.from=2;
    Attachs.findOne(where,select,function (err, model) {
        if (err) {
            return res.send({ "code": 0 });
        } else {
            var node = model.toObject();
            node.createtime = parseInt(moment(node.createtime).format('X'));
            node.video = comm.replace_pics(node.video);
            node.pics = comm.replace_pics(node.pics);
            if(node.location)node.position=node.location.address;
            node.files.forEach(function(item,index){
                item.pics = comm.replace_pics(item.pics);
                node.files[index] = item;
            })
            model = node;
            return response.apidetail(res, {}, model);
        }
    });
}
exports.delete_myuploads=function(req,res){
    var _ids=validator.trim(req.body._ids);
    var mpno=validator.trim(req.body.mpno);
    if(_ids==='' || mpno==='')return res.send({ "code": 0 ,message:'mpno or ids is not empty!'});
    var idarray=[];
    _ids.split(",").forEach(function(node,index){
        idarray.push(node);
    })
    //删除只改变状态
    Attachs.update({ _id: {$in:idarray},mpno:mpno }, {status:-3},{ multi: true },function (err) {
        if(!err){
            Operatorlogs.save({
                desc: "删除了手机上传 :" + idarray.toString() ,
                user_login: "app："+mpno
            });
            return res.send({ "code": 1 ,message:'remove myuploads success!'});
        }
    });
}
//获取广告 adposition=0 首页
exports.get_ad = function (req, res) {
    var cachekey=_const.get_ad+"_"+req.query.adposition;
    cache.get(cachekey,function(err,get_ad){
        var json = {  };
        if(get_ad)return response.api(res, json, get_ad);
        else{
            var where={};
            where.adposition=comm.get_req_int(req.query.adposition,0);
            var select={title:1,adimg:1,adurl:1,menuitem:1,mediaitem:1,adtype:1,_id:0};
            Ads.find()
            .populate('menuitem','name upstatus pid position url commentstatus cid menutype pics icon listtype')
            .populate('mediaitem','title mid author members price pics score address tel type assistcount clickcount commentcount createtime source video desc cid')
            .sort('order').where(where)
            .exec(function(err,models){
                if(err)return res.send({code:0});
                var list=[];
                models.forEach(function (node, index) {
                    var node = node.toObject();
                    if(node.menuitem){
                        node.menuitem.cid=node.menuitem._id;
                        node.menuitem.pics=comm.replace_pics(node.menuitem.pics);
                        node.menuitem.icon=comm.replace_pics(node.menuitem.icon);
                        delete node.menuitem._id;
                    }else{
                        node.menuitem={};
                    }
                    if(node.mediaitem){
                        node.mediaitem.createtime = parseInt(moment(node.mediaitem.createtime).format('X'));
                        node.mediaitem.pics = comm.replace_pics(node.mediaitem.pics);
                        node.mediaitem.url = comm.replace_url(node.mediaitem);
                        node.mediaitem.video = comm.replace_pics(node.mediaitem.video);
                        node.mediaitem.shareurl = comm.replace_shareurl(node.mediaitem);
                    }else{
                        node.mediaitem={};
                    }
                    node.adimg=comm.replace_pics(node.adimg);
                    if(!node.timing)list.push(node);
                    else{
                        if(moment()>=node.stime && moment()<=node.etime)list.push(node);
                    }
                })

                cache.set(cachekey, list, config.redis.time);//设置缓存
                return res.send({code:1,list:list});
            });
        }
    })
}
//获取机关黄页
exports.get_organ_yellow=function(req,res){
    var pid=comm.get_req_string(req.query.pid,"");
    var id=comm.get_req_string(req.query.id,"");
    var where={};
    if(pid!==""){
        where.pid=pid;
    }
    if(id!==""){
        where._id=id
    }
    if (pid=="" && id=="") {
        where.level=1
    }
    Organs.find(where).exec(function(err,models){
        var json={code:1,list:[]};
        models.forEach(function(node,index){
            var node = node.toObject();
            node.pics=comm.replace_pics(node.pics);
            models[index]=node;
        })
        json.list=(models);
        return res.send(json);

    })
}
//获取登录状态
exports.get_sign_status=function(req,res){
    var mpno=comm.get_req_string(req.query.mpno,'');
    if(mpno===''){
        return res.send({ "code": 0, message: "出错了"});
    }
    var date=moment().utc().format('YYYY-MM-DD');//转为格林威治时间,mongodb不知道如何设置时区
    Signs.find({mpno:mpno,createtime:{$gt:date}}).exec(function(err,models){
        if(err){
            return res.send({ "code": 0, message: "出错了"});
        }else{
            if(models.length===0){
                return res.send({ "code": 1, message: "未签到"});
            }else{
                return res.send({ "code": 2, message: "已经签过到了"});
            }
        }
    })
}
//获取美食菜谱
exports.get_dishes=function(req,res){
    var mid=comm.get_req_string(req.query.mid,"");
    if (mid === '') {
        return res.send({code:0});
    }
    var select={
        name:-1,price:-1,pics:-1
    }
    Dishes.find({mid:mid})
    .sort('-createtime')
    .select(select)
    .exec(function(err,models){
        if(err){
            return res.send({code:0});
        }
        models.forEach(function (node, index) {
            var node = node.toObject();
            node.pics=comm.replace_pics(node.pics);
            models[index] = node;
        })
        return res.send({code:1,list:models});
    });
}
//获取投票
exports.get_votes=function(req,res){
    var mpno=comm.get_req_string(req.query.mpno,'');
    var vid=comm.get_req_string(req.query.vid,'');
    Votes.findOne({_id:vid}).select({_id:0,__v:0,createtime:0}).exec(function(err,model){
        if(err || !model){
            return res.send({code:0});
        }
        var where={vid:vid};
        where.mpno=mpno;
        node = model.toObject();
        node.votesed = 0;
        Votesrecords.count(where,function(err,count){
            if (count > 0) node.votesed=1;//count>0 已经投过票了
            node.endtime = parseInt(moment(node.endtime).format('X'));
            node.pics = comm.replace_pics(node.pics);
            node.list.forEach(function(item,i){
                var t=0;
                if(node.type==0 || node.type==2){
                    t=parseFloat(item.count)*100/parseFloat(node.totalvotes);
                }else{
                    t=parseFloat(item.count)*100/parseFloat(node.count);
                }
                t=_.isNaN(t)?0:t;
                item.percent=(t).toFixed(2)+"%";
            })
            model=node;
            response.apidetail(res, {}, model);
        })
    })
}
//添加收藏
exports.set_favorites = function (req, res) {
    var mid = req.body.mid;
    var mpno = req.body.mpno;
    if (mid == undefined || mid == "" || mpno == undefined ||  mpno == "") {
        return res.send({ "code": 0 });
    }
    Posts.findOne({ _id: mid }).exec(function (err, model) {
        if (err || !model) {
            return res.send({ "code": 0 });
        } else {
            Favorites.update({ mid: mid, mpno: mpno }, {
                title: model.title,
                type: model.type,
                clickcount: model.clickcount,
                assistcount: model.assistcount,
                pics: model.pics,
                mpno: mpno,
                desc: model.desc,
                video: model.video,
                source: model.source,
                author: model.author,
                createtime:moment(),
            } , { upsert: true }, function (err) {
                if (err) {
                    return res.send({ "code": 0 });
                } else {
                    return res.send({ "code": 1 });
                }
            });
        }
    });
}
//删除收藏
exports.delete_favorites = function (req, res) {
  var _id=validator.trim(req.body._id);
  var mpno=validator.trim(req.body.mpno);
  if(_id==='' || mpno==='')return res.send({ "code": 0 ,message:'mpno or ids is not empty!'});
  Favorites.remove({ _id: {$in:_id.split(',')},mpno:mpno }, function (err) {
      if (err)return res.send({ "code": 0 });
      else {
          return res.send({ "code": 1 });
      }
  });
}
//添加评论
exports.set_comments = function (req, res) {
  var type=validator.trim(req.body.type);//0=文章评论 1=主播动态评论
  var mid=validator.trim(req.body.mid);
  var commentstatus=validator.trim(req.body.commentstatus)
  Posts.findOne({_id:mid},function(err,model){
    var status=0;
    if(commentstatus==2){
        status=-1
    }
    var comments = new Comments({
        title:model.title,
        status:status,
        mid : validator.trim(req.body.mid),
        nickname : validator.trim(req.body.nickname),
        mpno : validator.trim(req.body.mpno),
        content :  validator.trim(req.body.content),
        head : validator.trim(req.body.head) ,
        type:type===''?0:type,
    });
    if (comments.mid === "" || comments.content === "") {
        return res.send({ "code": 0 ,message:'mid or content is not empty'});
    }
    if(!validator.isLength(comments.content,1,500)){
        return res.send({ "code": 0 ,message:'您的评论字数必须是1~500个字符'});
    }
    //评论加
    var where={ "_id": comments.mid };
    if(comments.status==-1){
       var model={$inc: { "commentcount": 0 }};
    }else{
       var model={$inc: { "commentcount": 1 }};
    }
    var proxy = new eventproxy();
    proxy.all('posts', 'anchorsdynamics','sysconfigs','medias',function (posts, anchorsdynamics,sysconfigs,medias) {
      if(sysconfigs)return res.send({ "code": 0 ,message:'您的评论包含非法字符'});
      if(!posts && !anchorsdynamics)return res.send({code:0,message:'post anchorsdynamics is null '});
      comments.save(function (err) {
        add_coin({req:req,type:'coin',key:'set_comments',kind:'2',subject:'用户评论'+comments.mid,content:'用户评论'+comments.mid},function(num){});
        return res.send({code:1,message:""});
      });
    });
    if(type==='' || type==='0'){
      Posts.findOneAndUpdate(where,model , proxy.done(function (posts) {
        proxy.emit('posts', posts);
        proxy.emit('anchorsdynamics', null);
      }));
    }else if(type==='1'){
      Anchorsdynamics.findOneAndUpdate(where,model,proxy.done(function (anchorsdynamics) {
        proxy.emit('anchorsdynamics', anchorsdynamics);
        proxy.emit('posts', null);
      }));
    }
    Sysconfigs.findOne({type:'comments',key:'filter'},proxy.done(function(model){
      var filter=false;
      if(model){
        model.val.trim().split(',').forEach(function(node,index){
          if (node) {
            if(comments.content.indexOf(node)>-1 && node)filter=true;
          }
        })
      }
      proxy.emit('sysconfigs',filter);
    }));
    Medias.update({mid:comments.mid},model,{multi: true},proxy.done(function () {
      proxy.emit('medias', '');
    }));
  })
}
//评论点赞接口
exports.set_assist = function (req, res) {
  var commentid = req.body.commentid;
  var mpno = req.body.mpno;
  if (commentid === undefined || commentid == "" || mpno === undefined || mpno == "") {
    return res.send({ "code": 0 });
  }
  var assistuser = {
    mpno: mpno
  };
  //这里还没做是否点过
  Comments.update({ "_id": commentid },
    { $push: { "assistuser": assistuser }, $inc: { "assistcount": 1 } },
     function (err) {
    if (err) {
      return res.send({ "code": 0 });
    }
  });

  res.send({ "code": 1 });
}
//媒资点赞接口
exports.set_posts_assist = function (req, res) {
    var mid = validator.trim(req.body.mid);
    var mpno = validator.trim(req.body.mpno);
    var type = validator.trim(req.body.type);//''||0=文章点暂 1=主播动态点暂 2=主播点赞 3=回答内容点赞
    if (mid === "" || mpno == "") {
        return res.send({ "code": 0 });
    }
    var assistuser = {mpno: mpno};
    //评论加
    var where={ "_id": mid };
    var model={ $push: { "user_like_this_post": assistuser }, $inc: { "assistcount": 1 } };
    var proxy = new eventproxy();
    proxy.all('posts', 'anchorsdynamics','anchors','answers', function (posts, anchorsdynamics,anchors,answers) {
        if(!posts && !anchorsdynamics && !anchors && !answers){
            return res.send({code:0});
        }
        add_coin({req:req,type:'coin',key:'set_posts_assist',kind:'5',subject:'用户赞了'+mid,content:'用户赞了'+mid},function(num){});
        return res.send({ "code": 1 });
    });
    if(type==='' || type==='0'){
        Posts.findOneAndUpdate(where,model , proxy.done(function (posts) {
            proxy.emit('posts', posts);
            proxy.emit('anchorsdynamics', null);
            proxy.emit('anchors', null);
            proxy.emit('answers', null);
        }));
    }else if(type==='1'){
        Anchorsdynamics.findOneAndUpdate(where,model,proxy.done(function (anchorsdynamics) {
            proxy.emit('anchorsdynamics', anchorsdynamics);
            proxy.emit('posts', null);
            proxy.emit('anchors', null);
            proxy.emit('answers', null);
        }));
    }else if(type==="2"){
        Anchors.findOneAndUpdate(where,model,proxy.done(function(anchors){
            proxy.emit('anchorsdynamics', null);
            proxy.emit('posts', null);
            proxy.emit('anchors', anchors);
            proxy.emit('answers', null);
        }))
    }else if(type==="3"){
        Answers.findOneAndUpdate(where,model,proxy.done(function(answers){
            proxy.emit('anchorsdynamics', null);
            proxy.emit('posts', null);
            proxy.emit('anchors', null);
            proxy.emit('answers', answers);
        }))
    }
}
//上传附件
exports.set_attachs=function(req,res){
    var dir = moment().format("YYYY-MM-DD");
    var form = new formidable.IncomingForm({
        maxFieldsSize: 50 * 1024 * 1024,// 最大申请到50m内存
        keepExtensions:true,
        maxFields:10,
        multiples:true,
        uploadDir :'./public/upload/' + dir
    }), files = [], fields = [], docs = [];
    if (fs.existsSync(form.uploadDir)) {
        console.log('已经创建过此目录了');
    } else {
        fs.mkdirSync(form.uploadDir);
        console.log('目录已创建成功\n');
    }
    form.on('file', function (field, file) {
        file.path=path.join('/upload', dir, path.basename(file.path));
        file.path=file.path.replace(/\\/ig, '/');
        if(file.size>0){
            docs.push({
                pics:file.path,
                name:file.name
            });
        }
    }).parse(req,function(error, fields, files){
        var mpno =comm.get_req_string(_.get(fields,'mpno'),'');
        if (mpno==='') {
            return res.send({ "code": 0 ,message:'mpno is not empty！'});
        }
        var attachs = new Attachs({
            title:comm.get_req_string(_.get(fields,'title'),''),
            desc:comm.get_req_string(_.get(fields,'desc'),''),
            content:comm.get_req_string(_.get(fields,'content'),''),
            columnid:comm.get_req_int(_.get(fields,'columnid'),-1),
            mpno:mpno,
            from:comm.get_req_int(_.get(fields,'from'),2),//拍客上传
            type:comm.get_req_int(_.get(fields,'type'),1),
            files:docs
        });
        attachs.location.lon=validator.trim(_.get(fields,'lon'));
        attachs.location.lat=validator.trim(_.get(fields,'lat'));
        attachs.location.address=validator.trim(_.get(fields,'address'));
        if(attachs.type===1){//type=1 图片 2=视频
            attachs.pics=docs.length>0?docs[0].pics:"";
            attachs.status=1;//默认进入待审核
        }else{
            attachs.originalvideo = docs.length>0?docs[0].pics:"";
            attachs.status=0;//默认进入转码
        }
        attachs.save(function (err) {
            if (err) {
                return res.send({ "code": 0});
            } else {
                add_coin({req:req,type:'coin',key:'set_attachs',kind:'4',subject:'用户上传附件'+attachs.pics,content:'用户上传附件'+attachs.pics},function(num){});
                res.send({ "code": 1,message:"success"});
            }
        });
    });
}
//手机上传
exports.set_posts = function (req, res) {
    // parse a file upload
    //存放目录
    var attachs = new Attachs();
    attachs.title = req.body.title;
    attachs.desc = req.body.desc;
    attachs.content = req.body.content;
    attachs.type = req.body.type;
    var kind=4;
    var nums="2";
    if(attachs.type===1){//type=1 图片 2=视频
        attachs.pics=req.body.path;
        attachs.status=1;//默认进入待审核
        kind=3;
        nums=2;
    }
    else{
        attachs.originalvideo = req.body.path;
        attachs.status=0;//默认进入转码
    }
    attachs.columnid = req.body.columnid;
    attachs.mpno = req.body.mpno;
    attachs.from=2;//拍客上传

    if (attachs.mpno == undefined || attachs.mpno == "") {
        return res.send({ "code": 0 });
    }
    attachs.save(function (err) {
        if (err) {
            return res.send({ "code": 0});
        } else {
            comm.http_request_post(coin_url,{
                kind:kind,
                nums:nums,
                subject:'用户上传附件'+req.body.path,
                content :'用户上传附件'+req.body.path
            },req,function(error, response, body){
                console.log('用户上传附件加福币'+body);
            });
            res.send({ "code": 1});
        }
    });
}
//手机上传图片视频
exports.set_upload = function (req, res) {
    // parse a file upload
    var form = new formidable.IncomingForm(), files = [], fields = [], docs = [];
    form.maxFieldsSize = 50 * 1024 * 1024;// 最大申请到50m内存
    form.keepExtensions = true;
    console.log('start upload');
    //存放目录
    var dir = moment().format("YYYY-MM-DD");
    form.uploadDir = './public/upload/' + dir;
    if (fs.existsSync(form.uploadDir)) {
        console.log('已经创建过此目录了');
    } else {
        fs.mkdirSync(form.uploadDir);
        console.log('目录已创建成功\n');
    }
    form.on('field', function (field, value) {
        fields.push([field, value]);
    }).on('file', function (field, file) {
        files.push([field, file]);
        docs.push(file);
        file.path=path.join('/upload', dir, path.basename(file.path));
        file.path=file.path.replace(/\\/ig, '/');
    }).on('end', function () {
        console.log('-> upload done');
        res.writeHead(200, {
            'content-type': 'application/json'
        });
        var out = {
            code: 1 ,
            data: {
                size: docs[0].size,
                path: docs[0].path,
                name: docs[0].name,
            }
        };

        var sout = JSON.stringify(out);
        res.end(sout);
    }).on('error', function (err, fields, files) {
        err && console.log('formidabel error : ' + err);
        res.end({ code: 0 });
    });

    form.parse(req, function (err, fields, files) {
        err && console.log('formidabel error : ' + err);
        console.log('parsing done');
    });
}
//取消报名
exports.set_activitys_cancel=function(req,res){
    var mid=comm.get_req_string(req.body.mid,'');
    var mpno=comm.get_req_string(req.body.mpno,'');
    if (!validator.trim(mid)) {
        return res.send({ "code": 0});
    }
    if (!validator.trim(mpno)) {
        return res.send({ "code": 0});
    }
    var where = {
        mid: mid,
        mpno:mpno
    }
    Activitys.remove(where,function(err){
        if(err){
            return res.send({ code: 0});
        }else{
            return res.send({ code: 1});
        }
    })
}
//获取活动报名状态
exports.get_activitys_status = function (req, res) {
    var mid=comm.get_req_string(req.query.mid,'');
    var mpno=comm.get_req_string(req.query.mpno,'');
    if (!validator.trim(mid)) {
        return res.send({ "code": 0});
    }
    if (!validator.trim(mpno)) {
        return res.send({ "code": 0});
    }
    var where = {
        mid: mid,
        mpno:mpno
    }
    Activitys.count(where,function(err, count){
        if (err) {
            return res.send({ code: 0 });
        } else {
            if (count > 0) return res.send({ code: 2 });//已经报名了
            else
                return res.send({ code: 1 });//未报名
        }
    })
}
//活动报名
exports.set_activitys = function (req, res) {
    var mid=validator.trim(req.body.mid);
    var fullname=validator.trim(req.body.fullname);
    var mpno=validator.trim(req.body.mpno);
    var phone=validator.trim(req.body.phone);
    var sex=validator.trim(req.body.sex);
    var card=validator.trim(req.body.card);
    if (!mid) {
        return res.send({ "code": 0, message: "请选择活动名" });
    }
    if (!fullname) {
        return res.send({ "code": 0, message: "姓名是必填项" });
    }
    if (!validator.isLength(fullname, 2,8)) {
        return res.send({ "code": 0, message: "姓名长度是2到8个字" });
    }
    if (!mpno) {
        return res.send({ "code": 0, message: "用户名是必填项" });
    }
    var activitys = new Activitys({
        mid : mid,
        title : req.body.title,
        fullname : fullname,
        sex : sex,
        phone : phone,
        card : card,
        mpno : mpno,
    });
    var where = {
        mid: activitys.mid,
        card:activitys.card,
        mpno:activitys.mpno
    }
    Activitys.count(where, function (err, count) {
        if (err) {
            return res.send({ code: 0, message: "异常信息" });
        } else {
            if (count > 0) return res.send({ code: 0, message: "已经报名了" });
            activitys.save(function (err) {
                if (err) {
                    return res.send({ "code": 0, message: "异常信息" });
                } else {
                    res.send({ "code": 1,message:"恭喜您成功报名！" });
                }
            });
        }
    })
}
//技师评分
exports.set_scores = function (req, res) {
    if (!validator.trim(req.body.mid)) {
        return res.send({ "code": 0, message: "请选择技师" });
    }
    if (!validator.isInt(req.body.num)) {
        return res.send({ "code": 0, message: "分数必须是整数" });
    }
    if (!validator.trim(req.body.mpno)) {
        return res.send({ "code": 0, message: "手机号是必填项" });
    }
    if (!validator.isMobilePhone(req.body.mpno, "zh-CN")) {
        return res.send({ "code": 0, message: "手机号非法" });
    }
    var scores = new Scores();
    scores.mid = req.body.mid;
    scores.title = req.body.title;
    scores.num = req.body.num;
    scores.mpno = req.body.mpno;
    var where = {
        mid: scores.mid,
        mpno: scores.mpno
    }
    Scores.count(where, function (err, count) {
        if (err) {
            return res.send({ code: 0, message: "异常信息" });
        } else {
            if (count > 0) return res.send({ code: 0, message: "已经评过分了" });
            scores.save(function (err) {
                if (err) {
                    return res.send({ "code": 0, message: "异常信息" });
                } else {
                    res.send({ "code": 1, message: "评分成功！" });
                }
            });
        }
    })
}
//获取福币接口
exports.set_coin=function(req,res){
    var cointype=parseInt(req.body.cointype);
    var mpno=req.body.mpno;
    if(!validator.trim(cointype))return res.send({ "code": 0, message: "请选择获取途径" });
    if(cointype===1){//签到
        var _date=moment().utc().format('YYYY-MM-DD');//utc时间
        var _yestoday_date=moment().utc().add('-1','d').format('YYYY-MM-DD');
        var proxy = new eventproxy();
        proxy.all('todays','yestodays',function(todays,yestodays){
            if(todays)return res.send({ "code": 2, message: "已经签过到了", num:0});
            else{
                var signs=new Signs({mpno:mpno});
                if(yestodays)signs.continuous=yestodays.continuous+1;
                signs.save(function (err) {
                    if(err){
                        return res.send({ "code": 0, message: "save error", num:1});
                    }else{
                        add_coin({req:req,type:'coin',key:'set_signs',kind:'1',subject:'用户签到',content:signs.continuous},function(num){
                            return res.send({ "code": 1, message: "签到成功！", num:num});
                        });
                    }
                });
            }
        });
        Signs.findOne({mpno:mpno,createtime:{$gte:_date}}).exec(proxy.done(function(models){
            proxy.emit('todays', models);
        }));
        Signs.findOne({mpno:mpno,createtime:{$gte:_yestoday_date}},proxy.done(function(model){
            proxy.emit('yestodays', model);
        }));
    }
    else if(cointype===2){//
        add_coin({req:req,type:'coin',key:'set_coin',kind:'6',subject:'用户分享',content:'用户分享'},function(num){
            return res.send({ "code": 1, message: "获得成功！",num:num});
        });
    }else{
        return res.send({ "code": 1, message: "不知道是什么途径" ,num:1});
    }
}
//提交反馈
exports.set_feedback=function(req,res){
  var mpno=validator.trim(req.body.mpno);
  var content=validator.trim(req.body.content);
  if (!mpno) {
      return res.send({ "code": 0, message: "手机号是必填项" });
  }
  var feedbacks=new Feedbacks({
    mpno:mpno,
    content:content,
    contact:validator.trim(req.body.contact),
    feedbacktype:validator.trim(req.body.feedbacktype),
    from:validator.trim(req.body.from),//来自那里 默认-1
    mid:validator.trim(req.body.mid)//_id
  });
  var date=moment().format('YYYY-MM-DD');
  var where={};
  where.mpno=mpno;
  where.createtime={$gt:date};
  Feedbacks.count(where, function (err, count) {
    if (err) {
      return res.send({ code: 0, message: "异常信息" });
    } else {
      if (count > 500){
        res.send({ "code": 0, message: "反馈提的太多了" });
      }else{
        feedbacks.save(function (err) {
          if (err) {
            return res.send({ "code": 0, message: "异常信息" });
          } else {
            add_coin({req:req,type:'coin',key:'set_feedback',kind:'7',subject:'用户反馈',content:'用户反馈'},function(num){});
            res.send({ "code": 1, message: "反馈成功！" });
          }
        });
      }
    }
  });
}
exports.get_feedback=function(req,res){
  var mpno=validator.trim(req.query.mpno);
  if(mpno===''){
    return res.send({code:0,message:'mpno is not empty !'})
  };
  var options = comm.api_get_page_options(req);
  var query=Feedbacks.find();
  query.where({mpno:mpno}).skip(options.skip).limit(options.limit).exec(function(err,models){
    if(err)return res.send({code:0,message:'find error!'})
    models.forEach(function (node, index) {
        node = node.toObject();
        node.createtime = parseInt(moment(node.createtime).format('X'));
        node.reply.replytime = parseInt(moment(node.reply.replytime).format('X'));
        models[index] = node;
    });
    return res.send({
      code: 1,
      list:models
    });
  })
}
//设置投票
exports.set_votes=function(req,res){
  var mpno =validator.trim(req.body.mpno);
  var vid =validator.trim(req.body.vid);
  var rid =validator.trim(req.body.rid);
  if (mpno==='' || vid==='' || rid==='' ) {
    return res.send({ "code": 0 });
  }
  var votesrecords = new Votesrecords({
    mpno:mpno,
    vid:vid,
    rid:rid
  });
  Votesrecords.count({vid:vid,mpno:mpno},function(err,count){
    if(err){
      return res.send({ "code": 0,message:'出错了'});
    }
    if(count>0){
      return res.send({ "code": 2,message:'已经投过票了'});
    }else{
      votesrecords.save(function (err) {
        if (err) {
          return res.send({ "code": 0,message:'出错了'});
        } else {
          var rarray=rid.split(/,/);
          Votes.update({_id : vid }, { $inc: { count: 1 ,totalvotes:rarray.length}}, function (err) {});
          rarray.forEach(function(_id){
            Votes.update({ "list._id": _id }, { $inc: { "list.$.count": 1 }}, function (err) {
            });
          })
          add_coin({req:req,type:'coin',key:'set_votes',kind:'8',subject:'用户投票',content:'用户投票'},function(num){});
          return res.send({ "code": 1,message:'votes success'});
        }
      });
    }
  })
}
//增加福币
function add_coin(options,callback){
  var proxy = new eventproxy();
  proxy.all('sysconfigs', function (sysconfigs) {
    var nums=0;
    if(sysconfigs){
        if(options.key==='set_signs'){//判断app签到吗？
            var data=[];
            sysconfigs.val.split(',').forEach(function(node,index){
                var v=node.split('|');
                 data.push({day:v[0],num:v[1]});
            })
            data.sort( function(a, b){
                return parseInt(a.day) < parseInt(b.day) ? 1 : parseInt(a.day) == parseInt(b.day) ? 0 : -1;
            });
            nums=_.result(_.find(data, function(chr) {
                    return chr.day <= options.content;
                  }), 'num');
        }else{
            nums=sysconfigs?sysconfigs.val:1;
        }
        comm.http_request_post(coin_url,{
            kind:options.kind,
            nums:nums,
            subject:options.subject,
            content :options.content
        },options.req,function(err, response, body){
            console.log(options.key+' 币：'+body);
        });
    }
    callback(nums);
  });
  Sysconfigs.findOne({type:options.type,key:options.key},proxy.done(function(models){
    proxy.emit('sysconfigs', models);
  }));
}
exports.get_start_pics=function(req,res){
    var os=validator.trim(req.query.os);
    //固定id
    Ads.find({adposition:29000}).exec(function (err,models){
        var list=[];
        models.forEach(function(node,index){
            list.push({title:node.title,url:node.adurl,pics:comm.replace_pics(node.adimg)});
        });
        return res.send({code:1,list:list});
    })
    /*
    return res.send({
      "list": [
            {
              "title": "启动图",
              "url": "http://www.baidu.com",
              "pics": comm.replace_pics("/images/lancher/1.png"),
            },
            {
              "title": "启动图",
              "url": "http://www.163.com",
              "pics": comm.replace_pics("/images/lancher/2.png"),
            }
          ],
        "code": 1
    });*/
}

exports.get_ios_neighbor=function(req,res){
    return res.send({
        list:[
        /*{
        cmspath:"http://hainan.cms.joygo.com/v1.3/api/",
        userpath :"http://user.joygo.com/hainan/",
        appspath :"http://fuzhou.talk.joygo.com/",
        oispath:"http://hainan.micro.joygo.com:5000",
        ois_android_path:"http://hainan.micro.joygo.com:5001",
        appname:"海南新闻",
        appdep:"海南广播电视台总台篮网",
        appicon :comm.replace_pics("/upload/neighbor/hainan/icon.png"),
        applogo:comm.replace_pics("/upload/neighbor/hainan/logo.png"),
        appcolor:"#eb413d",
        appdistance:"1485",
        appimg:comm.replace_pics("/upload/neighbor/hainan/ad.jpg"),
        appdesc:"登上杰格云\n天涯若比邻",
        },*/{
        cmspath:"http://qinghai.cms.joygo.com/v1.3/api/",
        userpath :"http://user.joygo.com/qinghai/",
        appspath :"http://fuzhou.talk.joygo.com",
        oispath:"http://qinghai.micro.joygo.com:5000",
        ois_android_path:"http://qinghai.micro.joygo.com:5001",
        appname:"三江源",
        appdep:"三江源广播电视台",
        appicon :comm.replace_pics("/upload/neighbor/sanjiang/icon.png"),
        applogo:comm.replace_pics("/upload/neighbor/sanjiang/logo.png"),
        appcolor:"#56b330",
        appdistance:"1485",
        appimg:comm.replace_pics("/upload/neighbor/sanjiang/ad.jpg"),
        appdesc:"登上杰格云\n天涯若比邻",
        appcoin:'积分',
        appcoinunit:'个'
        },{
        cmspath:"http://yingtan.cms.joygo.com/v1.3/api/",
        userpath :"http://user.joygo.com/yingtan/",
        appspath :"http://fuzhou.talk.joygo.com/",
        oispath:"http://yingtan.micro.joygo.com:5000",
        ois_android_path:"http://yingtan.micro.joygo.com:5001",
        appname:"鹰视天下",
        appdep:"鹰潭电视台",
        appicon :comm.replace_pics("/upload/neighbor/yingtan/icon.png"),
        applogo:comm.replace_pics("/upload/neighbor/yingtan/logo.png"),
        appcolor:"#315DBD",
        appdistance:"1485",
        appimg:comm.replace_pics("/upload/neighbor/yingtan/ad.jpg"),
        appdesc:"登上杰格云\n天涯若比邻",
        appcoin:'积分',
        appcoinunit:'个'
        },{
        cmspath:"http://yanshi.cms.joygo-dev.com/v1.3/api/",
        userpath :"http://user.test.joygo-dev.com/hele/",
        appspath :"http://test.chat.joygo-dev.com/",
        oispath:"http://yanshi.micro.joygo.com:5000",
        appname:"合乐",
        appdep:"杰格（北京）科技有限公司",
        appicon :comm.replace_pics("/upload/neighbor/hele/icon.png"),
        applogo:comm.replace_pics("/upload/neighbor/hele/logo.png"),
        appcolor:"#eb413d",
        appdistance:"1485",
        appimg:comm.replace_pics("/upload/neighbor/hele/ad.jpg"),
        appdesc:"登上杰格云\n天涯若比邻",
        appcoin:'积分',
        appcoinunit:'个'
        }],
        code:1
    });
}
exports.get_android_neighbor=function(req,res){
    return res.send({
        list:[/*{
        cmspath:"hainan.cms.joygo.com",
        userpath :"user.joygo.com/hainan",
        appspath :"fuzhou.talk.joygo.com",
        oispath:"hainan.micro.joygo.com:5001",
        appname:"海南新闻",
        appdep:"鹰视天下",
        appicon :comm.replace_pics("/upload/neighbor/hainan/icon.png"),
        applogo:comm.replace_pics("/upload/neighbor/hainan/logo.png"),
        appcolor:"#eb413d",
        verion:"v1.3",
        appdistance:"1485",
        appimg:comm.replace_pics("/upload/neighbor/hainan/ad.jpg"),
        appdesc:"登上杰格云\n天涯若比邻",
        },*/{
        cmspath:"qinghai.cms.joygo.com",
        userpath :"user.joygo.com/qinghai",
        appspath :"fuzhou.talk.joygo.com",
        oispath:"qinghai.micro.joygo.com:5000",
        appname:"三江源",
        appdep:"三江源广播电视台",
        appicon :comm.replace_pics("/upload/neighbor/sanjiang/icon.png"),
        applogo:comm.replace_pics("/upload/neighbor/sanjiang/logo.png"),
        appcolor:"#56b330",
        verion:"v1.3",
        appdistance:"1485",
        appimg:comm.replace_pics("/upload/neighbor/sanjiang/ad.jpg"),
        appdesc:"登上杰格云\n天涯若比邻",
        appcoin:'积分',
        appcoinunit:'个'
        },{
        cmspath:"yingtan.cms.joygo.com",
        userpath :"user.joygo.com/yingtan",
        appspath :"fuzhou.talk.joygo.com",
        oispath:"yingtan.micro.joygo.com:5000",
        appname:"鹰视天下",
        appdep:"鹰潭电视台",
        appicon :comm.replace_pics("/upload/neighbor/yingtan/icon.png"),
        applogo:comm.replace_pics("/upload/neighbor/yingtan/logo.png"),
        appcolor:"#315DBD",
        verion:"v1.3",
        appdistance:"1485",
        appimg:comm.replace_pics("/upload/neighbor/yingtan/ad.jpg"),
        appdesc:"登上杰格云\n天涯若比邻",
        appcoin:'积分',
        appcoinunit:'个'
        },{
        cmspath:"yanshi.cms.joygo-dev.com",
        userpath :"user.test.joygo-dev.com/hele",
        appspath :"test.chat.joygo-dev.com",
        oispath:"yanshi.micro.joygo.com:5001",
        appname:"合乐",
        appdep:"杰格（北京）科技有限公司",
        appicon :comm.replace_pics("/upload/neighbor/hele/icon.png"),
        applogo:comm.replace_pics("/upload/neighbor/hele/logo.png"),
        appcolor:"#eb413d",
        verion:"v1.3",
        appdistance:"1485",
        appimg:comm.replace_pics("/upload/neighbor/hele/ad.jpg"),
        appdesc:"登上杰格云\n天涯若比邻",
        appcoin:'积分',
        appcoinunit:'个'
        }],
        code:1
    });
}

