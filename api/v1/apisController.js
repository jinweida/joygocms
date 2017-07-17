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
var Votesrecords = require('../../models/votesrecords').votesrecords;
var Feedbacks = require('../../models/feedbacks').feedbacks;
var Ads = require('../../models/ads').ads;
var moment = require('moment');
var response = require('../../lib/response');
var comm = require('../../lib/comm');
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
        commentstatus: 1,
        _id: 1
    }
    var where={};
    where.status=0;
    var menutype=req.query.menutype;
    var pid=req.query.pid;
    if(menutype!==undefined && menutype!=="")
        where.menutype=menutype;
    if(pid!==undefined && pid!=="")
        where.pid=pid;
    Columns.find(where)
        .select(select)
		.sort('order')
		.exec(function (err, models) {
        if (err) {
            return res.send({ "code": 0 });
        }
        var json = {};
        models.forEach(function (node, index) {
            node = node.toObject();
            node.cid = node._id;
            node.pics = comm.replace_pics(node.pics);
            models[index] = node;
        });
        response.api(res, {}, models);
    });
}
//获取专题接口
exports.get_specials_list = function (req, res) {
    var mid = req.query.mid;
    var where = { sid: mid };
    var options = comm.api_get_page_options(req);
    var json = { totalcount: 1, pagecount: 1 };
    Specials.find(where)
        .skip(options.skip)
        .limit(options.limit)
        .sort("-createtime")
		.exec(function (err, models) {
        if (err || !models) {
            return res.send({ "code": 0 });
        } else {
            models.forEach(function (node, index) {
                node = node.toObject();
                node.createtime = parseInt(moment(node.createtime).format('X'));

                node.url = comm.replace_url(node);
                node.shareurl = comm.replace_shareurl(node);
                node.pics = comm.replace_pics(node.pics);
                node.assistcount = 0;
                delete node.order;
                delete node._id;
                delete node.sid;
                delete node.activityetime;
                delete node.activitystime;
                models[index] = node;
            });
            response.api(res, json, models);
        }
    });
}
var search = function (req, res, title) {
    var select = {
        content: 0, "commentstatus": 0, slides: 0,
        "status": 0, "password": 0,
    };
    var options = comm.api_get_page_options(req);
    var where = {};
    where.title = { $regex: title, $options: 'i' };
    Posts.find().where(where).where({'post_publish_status.cid':{$exists:true}})
        .skip(options.skip)
        .limit(options.limit).sort("-attr -createtime").select(select)//降序
		.exec(function (err, models) {
        if (err || !models) {
            return res.send({ "code": 0 });
        } else {
            var json = { totalcount: 1, pagecount: 1 };
            models.forEach(function (node, index) {
                node = node.toObject();
                node.cid = 0;
                node.createtime = parseInt(moment(node.createtime).format('X'));

                if (node.type == 5) {
                    node.type = 1;//原来幻灯片自动替换为新闻
                }
                node.pics = comm.replace_pics(node.pics);
                node.url = comm.replace_url(node);
                node.shareurl = comm.replace_shareurl(node);
                node.mid = node._id;
                delete node._id;
                delete node.order;
                delete node.post_publish_status;
                delete node.user_like_this_post;
                delete node.publish_size;
                delete node.__v;
                delete node.tag;
                delete node.area;
                delete node.hangye;
                delete node.attr;
                models[index] = node;
            });
            return response.api(res, json, models);
        }
    });
}
//获取资源列表接口
exports.get_medias_list = function (req, res) {
    var cid = req.query.cid;
    var type = req.query.type;
    var title = req.query.title;
    var hangye = req.query.hangye;
    var area = req.query.area;
    var where = { } ;
    var index=-1;
    if (cid !== undefined && cid != "") {
        index=cid;
        where = { cid: cid };
    }
    if (title !== undefined && title != '') {
        where.title = { $regex: title, $options: 'i' };
        return search(req, res, title);
    }
    if (area !== undefined && area != '' && area != -1) {
        where.area = area;
    }
    if (type !== undefined && type != '' && type != -1) {
        where.type = type;
    }
    if (hangye !== undefined && hangye != '' && hangye != -1) {
        where.hangye = hangye
    }
    var select = {
        "content": 0, "commentstatus": 0, "slides":0,
        "status": 0, "password": 0,
    };
    var options = comm.api_get_page_options(req);
    var cachekey=config.session_secret+'_get_medias_'+index+options.page+cid+type;
    cache.get(cachekey,function(err,get_medias){
        var json = {  };
        if(get_medias){
            return response.api(res, json, get_medias);
        }else{
            Medias.find().where(where).skip(options.skip).limit(options.limit).sort("-attr -createtime").select(select)//降序
                .exec(function (err, models) {
                if (err || !models) {
                    return res.send({ "code": 0 });
                } else {
                    models.forEach(function (node, index) {
                        node = node.toObject();
                        node.createtime = parseInt(moment(node.createtime).format('X'));
                        node.activityetime = parseInt(moment(node.activityetime).format('X'));
                        node.activitystime = parseInt(moment(node.activitystime).format('X'));

                        node.pics = comm.replace_pics(node.pics);
                        node.url = comm.replace_url(node);
                        node.video = comm.replace_pics(node.video);
                        node.shareurl = comm.replace_shareurl(node);
                        delete node.content;
                        delete node._id;
                        delete node.order;
                        delete node.tag;
                        delete node.area;
                        delete node.hangye;
                        delete node.attr;
                        delete node.toptime;
                        models[index] = node;
                    });
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
    if (_id==='') {
        return res.send({ "code": 0 });
    }
    var cachekey=config.session_secret+'_get_detail_'+_id+mpno;
    var proxy = new eventproxy();
    cache.get(cachekey,function(err,get_detail){
        if(get_detail){
            return response.apidetail(res, {}, get_detail);
        }else{
            Posts.findOne({ _id: _id }, { __v: 0, author: 0,status:0, post_publish_status: 0,password:0, publish_size:0,attr:0}, function (err, models) {
                if (err) {
                    return res.send({ "code": 0 });
                }
                if (models != null) {
                    var node = models.toObject();
                    node.mid = node._id;
                    node.url = comm.replace_url(node);
                    node.shareurl = comm.replace_shareurl(node);
                    node.assisted = 0;
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
                    node.content = comm.replace_html(node.content);
                    node.pics = comm.replace_pics(node.pics);
                    node.video = comm.replace_pics(node.video);
                    node.favoritesed = 0;// 1=已经收藏过了
                    proxy.all('pics','postvideos',"favorites_count", function (pics,postvideos,favorites_count) {
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
                        node.activityvideos = [];
                        if (postvideos != null) {
                            postvideos.forEach(function (v, index) {
                                item=v.toObject();
                                if(item.imgurl){
                                    item.imgurl=comm.replace_pics(item.imgurl);
                                }
                                if(item.imgurl){
                                    item.vpath=comm.replace_pics(item.vpath);
                                }
                                v=item;
                                node.activityvideos.push(v);
                            });
                        }
                        if(favorites_count>0)node.favoritesed = 1;
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
                        cache.set(cachekey, models, config.redis.time);//设置缓存
                        return response.apidetail(res, {}, models);
                    })

                    var get_pics=function(where,callback){
                        Pics.findOne(where).exec(function(err,models){
                            callback(err,models);
                        });
                    }
                    var get_favorites=function(where,callback){
                        Favorites.count(where, function (error, count) {
                            callback(err,count);
                        });
                    }
                    var get_postvideos=function(where,callback){
                        Postvideo.find(where).exec(function (err, items) {
                            callback(err,items);
                        });
                    }
                    get_favorites({ mid: _id ,mpno: mpno},proxy.done(function(count){
                        proxy.emit('favorites_count',count);
                    }))
                    if (node.type == 3){
                        get_pics({_id:_id},proxy.done(function(item){
                            proxy.emit('pics',item);
                        }))
                    }else{
                        proxy.emit('pics',null);
                    }
                    if (node.type == 5){
                        get_postvideos({pid:_id},proxy.done(function(item){
                            proxy.emit('postvideos',item);
                        }))
                    }else{
                        proxy.emit('postvideos',null);
                    }

                    /*
                    Pics.findOne({ _id: _id }).exec(function (err, item) { //因为是非阻塞的
                        node.images = [];
                        if (item != null) {
                            if (item.imgs != null && item.imgs !== undefined) {
                                item.imgs.forEach(function (m, i) {
                                    if (m.imgurl != "" && m.imgurl.indexOf("http://") < 0 && m.imgurl.indexOf("https://") < 0) {
                                        m.imgurl = config.website + m.imgurl;
                                    }
                                    node.images.push(m);
                                });
                            }
                        }

                        if (node.type == 5) {
                            Postvideo.find({ pid: _id }).exec(function (err, items) {
                                node.activityvideos = [];
                                if (items != null) {
                                    items.forEach(function (v, index) {
                                        node.activityvideos.push(v);
                                    });
                                }
                                models = node;
                                response.apidetail(res, {}, models);
                            });
                        } else {
                            models = node;
                            response.apidetail(res, {}, models);
                        }
                    });

                    Favorites.count({ mid: _id ,mpno: mpno}, function (error, count) {
                        if (count > 0) node.favoritesed = 1;
                    });
                    */
                } else {
                    response.apidetail(res, {}, {});
                }
            });
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
        var where = {};
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
        Comments.find().where(where).skip(options.skip).limit(options.limit).select(select).sort("-assistcount")
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
    Favorites.find(where).skip(options.skip).limit(options.limit).exec(function (err, models) {
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
    where.status ={$gt:0};
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
        files:1
    };
    if (!validator.trim(req.query.mid)) {
        return res.send({ "code": 0 });
    }
    var where ={}
    where._id= req.query.mid;
    where.status ={$gt:0};
    where.from=2;
    Attachs.findOne(where,select,function (err, model) {
        if (err) {
            return res.send({ "code": 0 });
        } else {
            var node = model.toObject();
            node.createtime = parseInt(moment(node.createtime).format('X'));
            node.video = comm.replace_pics(node.video);
            node.pics = comm.replace_pics(node.pics);
            node.files.forEach(function(item,index){
                item.pics = comm.replace_pics(item.pics);
                node.files[index] = item;
            })
            model = node;
            return response.apidetail(res, {}, model);
        }
    });
}
//获取广告 adposition=0 首页
exports.get_ad = function (req, res) {
    var where={};
    where.adposition=comm.get_req_int(req.query.adposition,0);
    var select={title:1,adimg:1,adurl:1,menuitem:1,mediaitem:1,adtype:1,_id:0};
    Ads.find()
    .populate('menuitem','name upstatus pid position url commentstatus cid menutype pics icon listtype')
    .populate('mediaitem','title mid author members price pics score address tel type assistcount clickcount commentcount createtime source video desc cid')
    .sort('order').where(where).select(select)
    .exec(function(err,models){
        if(err){
            console.log(err);
            return res.send({code:0});
        }
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
            models[index] = node;
        })
        return res.send({code:1,list:models});
    });
}
//获取机关黄页
exports.get_organ_yellow=function(req,res){
    var pid=comm.get_req_string(req.query.pid,"");
    var where={};
    if(pid!==""){
        where.pid=pid;
    }
    Organs.find(where).exec(function(err,models){
        var json={code:1,list:[]};
        if(pid!==""){
            models.forEach(function(node,index){
                var node = node.toObject();
                node.pics=comm.replace_pics(node.pics);
                models[index]=node;
            })
            json.list=(models);
            return res.send(json);
        }
        models.forEach(function(node,index){
            var node = node.toObject();
            if(node.level===1){
                node.children=recursive_list(models,node._id);
                json.list.push(node);
            }
        })
        res.send(json);
    })
}
function recursive_list(models,pid){
    var json=[];
    models.forEach(function (node, i) {
        if (node != null) {
            var node = node.toObject();
            if(node.pid==pid){
                node.pics=comm.replace_pics(node.pics);
                json.push(node);
            }
        }
    });
    return json;
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
                if(node.type==0){
                    item.percent=(parseFloat(item.count)*100/parseFloat(node.totalvotes)).toFixed(2)+"%";
                }else{
                    item.percent=(parseFloat(item.count)*100/parseFloat(node.count)).toFixed(2)+"%";
                }
            })
            model=node;
            response.apidetail(res, {}, model);
        })
    })
}
exports.set_test = function (req, res) {
    //function base64_encode(file) {

    //    var bitmap = fs.readFileSync(file);
    //    return new Buffer(bitmap).toString('base64');
    //}

    //// function to create file from base64 encoded string
    //function base64_decode(base64str, file) {
    //    var bitmap = new Buffer(base64str, 'base64');
    //    fs.writeFileSync(file, bitmap);
    //    console.log('******** File created from base64 encoded string ********');
    //}

    //var base64str = base64_encode('c:\\20150512141016.png');
    //console.log(base64str);
    //base64_decode(base64str, 'c:\\copy.jpg');
    res.render('admin/set_test', {
        title: "测试评论点暂"
    });
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
                author: model.author
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

    var _id = req.body._id;
    var mpno = req.body.mpno;
    var where = {};

    if (mpno !== "" && mpno !== undefined)
        where.mpno = mpno;
    if (_id !== "" && _id !== undefined)
        where._id = _id;

    if(!('mpno' in where) && !('_id' in where)){
        return res.send({ "code": 0 });
    }
    Favorites.remove(where, function (err) {
        if (err) {
            return res.send({ "code": 0 });
        } else {
            return res.send({ "code": 1 });
        }
    });
}
//添加评论
exports.set_comments = function (req, res) {
    var comments = new Comments();
    comments.mid = comm.get_req_string(req.body.mid,'');
    comments.nickname = comm.get_req_string(req.body.nickname,'');
    comments.mpno = comm.get_req_string(req.body.mpno,'');
    comments.content =  comm.get_req_string(req.body.content,'');
    comments.head = comm.get_req_string(req.body.head,'');
    if (comments.mid == "" || comments.content == "") {
        return res.send({ "code": 0 });
    }
    if(!validator.isLength(comments.content,1,500)){
        return res.send({ "code": 0 ,message:'您的评论字数必须是1~500个字符'});
    }
    /*
    //垃圾评论过滤，其他过滤规则可以自行增加正则表达式来实现
    if( /\d{7,}/i.test(comments.content) || //连续7个以上数字，过滤发Q号和Q群的评论
    /(\d.*){7,}/i.test(comments.content) || //非连续的7个以上数字，过滤用字符间隔开的Q号和Q群的评论
    /\u52A0.*\u7FA4/i.test(comments.content) || //包含“加群”两字的通常是发Q群的垃圾评论
    /江泽民/i.test(comments.content) || //包含“加群”两字的通常是发Q群的垃圾评论
    /(\u9876.*){5,}/i.test(comments.content) || //过滤5个以上“顶”字的评论
    /([\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D\u25CB\u58F9\u8D30\u53C1\u8086\u4F0D\u9646\u67D2\u634C\u7396\u96F6].*){7,}/i.test(comments.content) //过滤用汉字发Q号和Q群的评论
    ) {
        return res.send({code:0,message:"请不要发表灌水、广告、违法、Q群Q号等信息，感谢您的配合！"})
    }*/
    comments.save(function (err) {
        if (err) {
            return res.send({ "code": 0 });
        }
    });
    //评论加
    Posts.update({ _id: comments.mid }, { $inc: { "commentcount": 1 } }, function (err) {
        if (err) {
            return res.send({ "code": 0 });
        }
    });
    comm.http_request_post(coin_url,{
        kind:'2',
        nums:'1',
        subject:'用户评论了'+comments.mid,
        content :'用户评论了'+comments.mid
    },req,function(error, response, body){
        console.log('评论加福币：'+body);
    });
    res.send({ "code": 1 });
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
    var mid = req.body.mid;
    var mpno = req.body.mpno;
    if (mid === undefined || mid == "" || mpno === undefined || mpno == "") {
        return res.send({ "code": 0 });
    }
    var assistuser = {
        mpno: mpno
    };
    //这里还没做是否点过
    Posts.update({ "_id": mid },
        { $push: { "user_like_this_post": assistuser }, $inc: { "assistcount": 1 } },
         function (err) {
        if (err) {
            return res.send({ "code": 0 });
        }
    });

    comm.http_request_post(coin_url,{
        kind:'2',
        nums:'1',
        subject:'用户赞了'+mid,
        content :'用户赞了'+mid
    },req,function(error, response, body){
        console.log('赞加福币'+body);
    });
    res.send({ "code": 1 });
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
        console.log(file);
        if(file.size>0){
            docs.push({
                pics:file.path,
                name:file.name
            });
        }
    }).parse(req,function(error, fields, files){
        var mpno =comm.get_req_string(_.get(fields,'mpno'),'');
        if (mpno==='') {
            return res.send({ "code": 0 });
        }
        var attachs = new Attachs({
            title:comm.get_req_string(_.get(fields,'title'),''),
            desc:comm.get_req_string(_.get(fields,'desc'),''),
            content:comm.get_req_string(_.get(fields,'content'),''),
            columnid:comm.get_req_int(_.get(fields,'columnid'),-1),
            mpno:mpno,
            from:comm.get_req_int(_.get(fields,'from'),2),//拍客上传
            type:comm.get_req_int(_.get(fields,'type'),1),
            position:comm.get_req_int(_.get(fields,'position'),1),
            files:docs
        });
        var kind=4;
        var nums=2;
        if(attachs.type===1){//type=1 图片 2=视频
            attachs.pics=docs.length>0?docs[0].pics:"";
            attachs.status=1;//默认进入待审核
            kind=3;
        }else{
            attachs.originalvideo = docs.length>0?docs[0].pics:"";
            attachs.status=0;//默认进入转码
        }
        attachs.save(function (err) {
            if (err) {
                return res.send({ "code": 0});
            } else {
                comm.http_request_post(coin_url,{
                    kind:kind,
                    nums:nums,
                    subject:'用户上传附件'+attachs.pics,
                    content :'用户上传附件'+attachs.pics
                },req,function(error, response, body){
                    console.log('用户上传附件加福币'+body);
                });
                res.send({ "code": 1});
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
        //return res.send({ "code": 0, message: "姓名长度是2到8个字" });
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
    console.log(activitys);
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
    if(!validator.trim(cointype)){
        return res.send({ "code": 0, message: "手机号是必填项" });
    }
    if (!validator.trim(mpno)) {
        return res.send({ "code": 0, message: "手机号是必填项" });
    }
    if (!validator.isMobilePhone(mpno, "zh-CN")) {
        return res.send({ "code": 0, message: "手机号非法" });
    }
    var date=moment().utc().format('YYYY-MM-DD');
    //var yesterday=moment().add(-1,'d').format('YYYY-MM-DD');//昨天
    if(cointype===1){//签到

        /**var proxy = new eventproxy();
        proxy.all('models','item',function(models,item){

        })
        Signs.findOne({mpno:mpno,createtime:{$gte:yeasterday,$lt:date}},proxy.done(function(err,model){

        }))*/
        Signs.find({mpno:mpno,createtime:{$gte:date}},function(err,models){
            if(err){
            }else{
                if(models.length===0){
                    console.log(models.length);
                    var signs=new Signs({mpno:mpno});
                    signs.save(function (err) {
                        if(err){
                        }else{
                            comm.http_request_post(coin_url,{
                                kind:1,
                                nums:1,
                                subject:'用户签到',
                                content :'用户签到'
                            },req,function(error, response, body){
                                console.log('用户签到加福币'+body);
                            });
                            res.send({ "code": 1, message: "签到成功！", num:1});
                        }
                    });
                }else{
                    res.send({ "code": 2, message: "已经签过到了", num:0});
                }
            }
        })
    }
    else if(cointype===2){//
        res.send({ "code": 1, message: "获得福币成功！",num:1});
    }else{
        res.send({ "code": 1, message: "不知道是什么途径" ,num:1});
    }
}
//提交反馈
exports.set_feedback=function(req,res){
    var mpno=comm.get_req_string(req.body.mpno,'');
    var content=comm.get_req_string(req.body.content,'');
    if (!validator.trim(mpno)) {
        return res.send({ "code": 0, message: "手机号是必填项" });
    }
    var feedbacks=new Feedbacks();
    feedbacks.mpno=mpno;
    feedbacks.content=content;
    feedbacks.contact=comm.get_req_string(req.body.contact,'');
    feedbacks.feedbacktype=comm.get_req_string(req.body.feedbacktype,'');

    var date=moment().format('YYYY-MM-DD');
    var where={};
    where.mpno=mpno;
    where.createtime={$gt:date};
    Feedbacks.count(where, function (err, count) {
        if (err) {
            return res.send({ code: 0, message: "异常信息" });
        } else {
            if (count > 5){
                res.send({ "code": 0, message: "反馈提的太多了" });
            }else{
                feedbacks.save(function (err) {
                    if (err) {
                        return res.send({ "code": 0, message: "异常信息" });
                    } else {
                        res.send({ "code": 1, message: "反馈成功！" });
                    }
                });
            }
        }
    });
}
//设置投票
exports.set_votes=function(req,res){
    var mpno =comm.get_req_string(req.body.mpno,'');
    var vid =comm.get_req_string(req.body.vid,'');
    var rid =comm.get_req_string(req.body.rid,'');
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
                    return res.send({ "code": 1});
                }
            });
        }
    })
}




