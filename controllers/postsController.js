var Posts = require('../models/posts').posts;
var Associated = require('../models/posts').associated;
var Postvideo = require('../models/postvideo').postvideo;
var Postsalbums = require('../models/postsalbums').postsalbums;
var Pics = require('../models/pics').pics;
var Specials = require('../models/specials').specials;
var Medias = require('../models/medias').medias;
var Votes = require('../models/votes').votes;
var Favorites = require('../models/favorites').favorites;
var Operatorlogs = require('../proxy/operatorlogs');
var response = require('../lib/response');
var comm = require('../lib/comm');
var moment = require('moment');
var config = require('../config');
var fs = require('fs');
var eventproxy = require('eventproxy');
var validator = require('validator');
var _ = require('lodash');
var request = require('request');
var Counters = require('../models/counters').counters;

exports.loadAll=function(req,res,next){
    var proxy = new eventproxy();
    proxy.all('votes','specials','commodity','envelope',function(votes,specials,commodity,envelope){
        req.specials=specials;
        req.votes=votes;
        req.commodity=commodity;
        req.envelope=envelope;
        next();
    })
    Votes.find().exec(proxy.done(function(models){
      proxy.emit('votes',models);
    }))
    Posts.find({type:4}).exec(proxy.done(function(models){
      proxy.emit('specials',models)
    }));
    //proxy.emit('commodity',[]);
    request.post({url:config.shopsite+'/functionid=ads',form:{type:1}},proxy.done(function(response, body){
        if (response.statusCode == 200) {
            body=JSON.parse(body);
            proxy.emit('commodity',body.items)
        }else{
            proxy.emit('commodity',[]);
        }
    }));
    var startdate=Math.floor(new Date().getTime()/1000)
    request.post({url:config.envelope+'/Discount/GetRuleList',form:{typeid:2,startdate:startdate}},proxy.done(function(response, body){
        if (response.statusCode===200) {
            body=JSON.parse(body);
            proxy.emit('envelope',body.RuleList)
        }else{
            console.log(typeof response.statusCode);
            proxy.emit('envelope',[]);
        }
    }));

}
exports.postsalbums_del=function(req,res){
    var _id=req.body.id;
    Postsalbums.remove({_id:_id},function(err){
        if(err){}
        response.success(res,'')
    })
}
exports.list = function (req, res) {
    var title = req.query.title;
    var type = req.query.type;
    var status = req.query.status;
    var author = req.query.author;
    var stime = req.query.stime;
    var etime = req.query.etime;
    var where = {};
    var query=Posts.where({});
    if (Boolean(title))query.where('title',eval('/'+title+'/ig'));
    if (Boolean(type) && type!=='-1') query.where('type',type);
    if (Boolean(status) && status !== '-1')query.where('status',status);
    if (Boolean(author)) query.where('author',eval('/'+author+'/ig'));
    if(validator.isDate(stime))query.where('createtime').gte(moment(stime).format('YYYY-MM-DD HH:mm:ss'));
    if(validator.isDate(etime))query.where('createtime').lte(moment(etime).format('YYYY-MM-DD HH:mm:ss'));
    var metatitle = "媒资列表";
    var url = "admin/posts/posts_list";
    var options = comm.get_page_options(req);
    Posts.count(query, function (error, count) {
        if (error) {
        } else {
            Posts.find(query).sort("-createtime").limit(options.pagesize)
            .exec(function (err, models) {
                models.forEach(function (node, index) {
                    var node = node.toObject();
                    node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
                    node.shorttitle=comm.get_substring({str:node.title});
                    node.index = options.skip + index + 1;
                    config.types.forEach(function (item, j) {
                        if (item.id == node.type) {
                            node.typename = item.name;
                            node.typestyle = item.style;
                            return
                        }
                    })

                    if (node.status === 1) {//文章状态 1=已发布 0=未发布 2=已审核
                        node.disabled = "disabled";
                        node.audit = "已发布";
                        node.auditstyle = "btn-info";
                    } else if (node.status === 2) {
                        node.disabled = "disabled";
                        node.audit = "已审核";
                        node.auditstyle = "btn-success";
                    } else if (node.status === 0) {
                        node.disabled = "";
                        node.audit = "未发布";
                        node.auditstyle = "btn-warning";
                    }
                    models[index] = node;
                })
                res.render(url, {
                    title: metatitle,
                    count:count,
                    pagecount: Math.ceil(count / options.pagesize),
                    pagesize: options.pagesize,
                    posts: err ? [] : models,
                    types: config.types,
                    type: type,
                    status: status,
                    findtitle: title,
                    findauthor:author,
                    stime:stime,
                    etime:etime
                });
            });

        }
    });
}
exports.audit_list = function (req, res) {
    var title = req.query.title;
    var type = req.query.type;
    var status = req.query.status;
    var where = {};
    if (title !== undefined && title !== '') {
        where.title = { $regex: title, $options: 'i' };
    }
    if (type !== undefined && type !== '' && type !== '-1') {
        where.type = type;
    }
    if (status !== undefined && status !== '') {
        where.status = status;
    } else {
        where.status =1; //只显示已经发布的
    }

    var metatitle = "媒资审核";
    var url = "admin/posts/posts_audit_list";
    var options = comm.get_page_options(req);
    Posts.count(where, function (error, count) {
        if (error) {
        } else {
            Posts.find(where).sort("-createtime").limit(options.pagesize)
            .exec(function (err, models) {
                if(models){
                    models.forEach(function (node, index) {
                        var node = node.toObject();
                        node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
                        node.shorttitle=comm.get_substring({str:node.title});
                        node.index = options.skip + index + 1;
                        config.types.forEach(function (item, j) {
                            if (item.id == node.type) {
                                node.typename = item.name;
                                node.typestyle = item.style;
                                return
                            }
                        })
                        node.audit = "通过";
                        node.auditstyle = "btn-primary";
                        if (node.status === 2) {//文章状态 1=已发布 0=未发布 2=已审核
                            node.audit = "驳回";
                            node.auditstyle = "btn-danger";
                        }
                        models[index] = node;
                    })
                }
                res.render(url, {
                    title: metatitle,
                    pagecount: Math.ceil(count / options.pagesize),
                    pagesize: options.pagesize,
                    posts: err ? [] : models,
                    types: config.types,
                    type: type,
                    status: status,
                    findtitle:title
                });
            });
        }
    });
}
exports.add = function (req, res) {//
    var type = parseInt(req.query.type);
    var title = "创建新闻";
    var add_url = 'admin/posts/posts_add';
    if (type === 2) {
        title = '创建视频';
        add_url = 'admin/posts/videos_add';
    } else if (type === 3) {
        title = '创建图片集';
        add_url = 'admin/posts/pics_add';
    } else if (type === 4 || type===100) {
        title = '创建专题';
        add_url = 'admin/posts/specials_add';
    } else if (type === 5) {
      title = '创建活动';
      add_url = 'admin/posts/activitys_add';
    } else if (type === 6) {
      title = '创建美食';
      add_url = 'admin/posts/foods_add';
    }else if (type === 7) {
      title = '创建投票';
      add_url = 'admin/posts/votes_add';
    }else if(type===8){
      title = '创建广告';
      add_url = 'admin/posts/ads_add';
    }
    res.render(add_url, {
          title: title,
          datetime: moment().format('YYYY-MM-DD HH:mm:ss'),
          types: config.types,
          columns:req.columns,
          type:type,
          tags:config.tags,
          voteslist:req.votes,
          specialslist:req.specials,
          commoditylist:req.commodity,
          envelopelist:req.envelope,
    });
}
exports.create = function (req, res) {
    try {
        var posts = new Posts();
        posts.title = validator.trim(req.body.post_title);
        posts.subtitle = validator.trim(req.body.post_subtitle);
        posts.desc = validator.trim(req.body.post_desc);
        posts.source = validator.trim(req.body.post_source);
        posts.address = validator.trim(req.body.post_address);
        posts.members = validator.trim(req.body.post_members);
        posts.score = comm.get_req_int(req.body.post_score,0);
        posts.price = comm.get_req_int(req.body.post_price,0);
        posts.clickcount = validator.trim(req.body.post_clickcount);
        posts.pvcount = validator.trim(req.body.post_pvcount);
        posts.link = validator.trim(req.body.post_link);
        var tag=validator.trim(req.body.post_tag);
        if(tag!==''){
            posts.tag=tag.split(',')[1];
            posts.tagtype=tag.split(',')[0];
            if(posts.tagtype==="0")posts.tag="";
        }
        posts.content = validator.trim(req.body.post_content);
        posts.author = validator.trim(req.body.post_author);
        posts.createtime = validator.trim(req.body.post_date);
        posts.activityetime = comm.get_req_string(req.body.post_activityetime, moment().format('YYYY-MM-DD HH:mm:ss'));
        posts.activitystime =comm.get_req_string(req.body.post_activitystime, moment().format('YYYY-MM-DD HH:mm:ss'));
        posts.area = validator.trim(req.body.post_area);
        posts.hangye = validator.trim(req.body.post_hangye);
        posts.commentstatus = validator.trim(req.body.post_commentstatus);
        posts.video = validator.trim(req.body.post_video);
        posts.isaudio = comm.get_req_int(req.body.post_audio,0);
        posts.type = validator.trim(req.body.post_type);
        posts.commodity = validator.trim(req.body.post_commodity);
        var pics= validator.trim(req.body.post_pics);
        posts.pics =pics;
        if(pics){
            var images = require("images");
            pics='./public/'+pics;
            if (fs.existsSync(pics)) {
                posts.pwidth=images(pics).width();
                posts.pheight=images(pics).height();
            }
        }
        posts.tel = validator.trim(req.body.post_tel);
        posts.picsstate = validator.trim(req.body.post_picsstate);
        posts.specials = validator.trim(req.body.post_special);
        posts.activityaddress = validator.trim(req.body.post_activityaddress);
        posts.activityceiling = validator.trim(req.body.post_activityceiling);
        posts.activityprotocol = validator.trim(req.body.post_activityprotocol);
        posts.activitywelfare = validator.trim(req.body.post_activitywelfare);
        posts.activitytype=comm.get_req_int(req.body.post_activitytype,0);
        posts.onlinepayment=comm.get_req_int(req.body.post_onlinepayment,0);
        posts.activityassist=comm.get_req_int(req.body.post_activityassist,0);
        posts.activityonline=comm.get_req_int(req.body.post_activityonline,1);
        posts.activitynotice=comm.get_req_int(req.body.post_activitynotice,0);
        posts.activityparticipate=comm.get_req_int(req.body.post_activityparticipate,1);
        posts.activitywelfare=comm.get_req_int(req.body.post_activitywelfare,0);
        posts.activitvouchers=validator.trim(req.body.post_activitvouchers,'');
        posts.activitintegral=comm.get_req_int(req.body.post_activitintegral,0);
        var post_publish_status = [];
        if(validator.trim(req.body.post_columnid)!==''){
            if(req.body.post_columnid instanceof Array){
                req.body.post_columnid.forEach(function(node,index){
                    post_publish_status.push({cid:node});
                })
            }else{
                post_publish_status.push({cid:req.body.post_columnid});
            }
            posts.post_publish_status=post_publish_status;
        }
        //写入主题
        if(posts.type!==4 && posts.specials){
            var join_special=new Specials({
                sid:posts.specials,
                mid:posts._id,
            });
            join_special.save(function(err){

            })
        }
        //判断是否为投票
        if(posts.type===7){
            var votes=new Votes({
                title:posts.title,
                pics:posts.pics,
                desc:posts.desc,
                content:posts.content,
                endtime:validator.trim(req.body.post_votes_endtime),
                type:validator.trim(req.body.post_votes_type),
            });
            var post_votes_title=req.body.post_votes_title;
            var post_votes_count=req.body.post_votes_count;
            var post_votes_pics=req.body.post_votes_pics;
            if (post_votes_title != "" && post_votes_title !== undefined) {
                var votesarray = [];
                var _totalvotes=0;
                var _multcount  = _.chain(post_votes_count)
                              .max(function(user){
                                return user;
                              }).value();
                if (post_votes_title instanceof Array) {
                    post_votes_title.forEach(function (node, index) {
                        _totalvotes+=parseInt(post_votes_count[index]);
                        votesarray.push({
                            title: node,
                            count: post_votes_count[index],
                            pics: post_votes_pics[index]
                        });
                    });
                }else{
                    _totalvotes+=parseInt(post_votes_count);
                    votesarray.push({
                        title: post_votes_title,
                        count: post_votes_count,
                        pics: post_votes_pics
                    });
                }
                votes.list=votesarray;
                votes.totalvotes=_totalvotes;
                if(votes.type==0 || votes.type==2){
                    votes.count=_totalvotes;
                }else{
                    votes.count=_multcount;//取最大的
                }
            }
            posts.votes=votes._id;
            votes.save(function(err){})
        }else if(posts.type===3){
            /**** 图片集 写入 image集合 ****/
            var imagesarray = [];
            var images = req.body.post_images;//
            var images_desc = req.body.post_images_desc;
            if (images != "" && images !== undefined) {
                if (images instanceof Array) {
                    images.forEach(function (node, index) {
                        imagesarray.push({
                            title: req.body.post_title,
                            subtitle: req.body.post_subtitle,
                            desc: images_desc[index] == ""?'':images_desc[index],//描述为空使用摘要
                            imgurl: node
                        });
                    });
                } else {
                    imagesarray.push({
                        title: req.body.post_title,
                        subtitle: req.body.post_subtitle,
                        desc: images_desc == ""?'':images_desc,//描述为空使用摘要
                        imgurl: images
                    });
                }
                /****图片集 节点****/
                Pics.update({_id: posts._id}, { "imgs": imagesarray}, {upsert:true},function (err) { });
                if(imagesarray.length>0){
                    imagesarray.forEach(function(node,index){
                        if(index<=2)posts.imgextra.push({src:node.imgurl});
                    })
                }
                // posts.imgextra.push({src:posts.pics});
            }
        }else{
            posts.votes=comm.get_req_string(req.body.post_votes, '');
        }
        posts.save(function (err) {
            if (err) {
                response.error(res, err);
            } else {
                /****专题*******/
                var group=req.body.post_special_group;
                if (group != "" && group !== undefined) {
                    var title = req.body.post_special_title;
                    var special = req.body.post_special_id;
                    var type = req.body.post_special_type;
                    var createtime = req.body.post_special_createtime;
                    var desc = req.body.post_special_desc;
                    var commentcount = req.body.post_special_commentcount;
                    var clickcount = req.body.post_special_clickcount;
                    var pics = req.body.post_special_pics;
                    var videos = req.body.post_special_video;
                    var source = req.body.post_special_source;
                    var author = req.body.post_special_author;
                    var specialarray = [];
                    var split = /,/;
                    group.forEach(function (node, index) {
                        // var picsarray = pics[index].split(split);
                        if(special[index] instanceof Array){
                            special[index].forEach(function(n,i){
                                Specials.update({ sid: posts._id,mid:n,name:group[index]}, {
                                    title: title[index][i],
                                    desc: desc[index][i],
                                    createtime: createtime[index][i],
                                    commentcount: commentcount[index][i],
                                    clickcount: clickcount[index][i],
                                    type: type[index][i],
                                    pics: pics[index][i].split(split),
                                    video: videos[index][i],
                                    source: source[index][i],
                                    author: author[index][i],
                                }, { upsert: true }, function (err) { });
                            })
                        }else{
                            Specials.update({ sid: posts._id,mid: special[index],name:group[index]}, {
                                title: title[index],
                                desc: desc[index],
                                createtime: createtime[index],
                                commentcount: commentcount[index],
                                clickcount: clickcount[index],
                                type: type[index],
                                pics: pics[index].split(split),
                                video: videos[index],
                                source: source[index],
                                author: author[index],
                            }, { upsert: true }, function (err) { });
                        }
                    });
                    //Specials.update({ _id: posts._id }, { "list": specialarray }, { upsert: true }, function (err) { });
                }
                /****专题结束****/
                Operatorlogs.save({
                    desc: "创建媒资 _id:"+posts._id,
                    user_login: req.session.user.user_login
                });
                response.success(res, posts._id);
            }
        });
    } catch (e) {
        console.log('error when exit', e.stack);
    }
}
exports.edit = function (req, res) {
    var _id = req.query.mid;
    var proxy = new eventproxy();
    Posts.findOne({ _id: _id })
    .exec(function (err, model) {
        if (err || !model) {}
        model = model.toObject();
        model.createtime = moment(model.createtime).format('YYYY-MM-DD HH:mm:ss');
        model.activityetime = moment(model.activityetime).format('YYYY-MM-DD HH:mm:ss');
        model.activitystime = moment(model.activitystime).format('YYYY-MM-DD HH:mm:ss');
        var edit_url = "admin/posts/posts_edit";
        var edit = function (req, res, model) {
            Votes.find().exec(function(err,votes){
                res.render(edit_url, {
                    title: "修改媒资",
                    types: config.types,
                    model: model,
                    columns:req.columns,
                    type: model.type,
                    tags:config.tags,
                    votes:model.votes,
                    voteslist:votes?votes:[],
                    specialslist:req.specials,
                    commoditylist:req.commodity,
                });
            })
        };
        if (model.type === 1 || model.type===9) {
            edit(req, res, model);
        } else if(model.type===2) {
            edit_url = "admin/posts/videos_edit";
            edit(req, res, model);
        } else if (model.type === 3) {
            edit_url = "admin/posts/pics_edit";
            Pics.findOne({_id:_id}).exec(function (err, item) {
                res.render(edit_url, {
                    title: "修改媒资",
                    types: config.types,
                    model: model,
                    columns:req.columns,
                    type: model.type,
                    tags:config.tags,
                    pics: item == null?[]:item.imgs,
                    specialslist:req.specials,
                    commoditylist:req.commodity
                });
            });
        } else if (model.type === 4 || model.type===100) {
            edit_url = "admin/posts/specials_edit";
            Specials.find({ sid: _id }).exec(function (err, item) {
                var group=[];
                item.forEach(function(node,i){
                    //查找node.name 是否包含在group
                    if(group.indexOf(node.name)==-1){
                        group.push(node.name)
                    }
                })
                res.render(edit_url, {
                    title: "修改媒资",
                    types: config.types,
                    model: model,
                    columns:req.columns,
                    type: model.type,
                    tags:config.tags,
                    specials: item == null?[]:item,
                    group:group,
                    commoditylist:req.commodity,
                });
            });
        } else if (model.type === 5) {
            edit_url = "admin/posts/activitys_edit";
                res.render(edit_url, {
                    title: "修改媒资",
                    types: config.types,
                    model: model,
                    columns: req.columns,
                    type: model.type,
                    tags:config.tags,
                    voteslist:req.votes?req.votes:[],
                    specialslist:req.specials,
                    commoditylist:req.commodity,
                    envelopelist:req.envelope
                });
        } else if (model.type === 6) {
            edit_url = "admin/posts/foods_edit";
            edit(req, res, model);
        } else if (model.type === 7) {
            edit_url = "admin/posts/votes_edit";
            Votes.findOne({_id:model.votes}).exec(function (err, item) {
                if(item!=null){
                    node=item.toObject();
                    node.endtime=moment(node.endtime).format('YYYY-MM-DD HH:mm:ss');
                    item=node;
                }
                res.render(edit_url, {
                    title: "修改媒资",
                    types: config.types,
                    model: model,
                    columns:req.columns,
                    tags:config.tags,
                    type: model.type,
                    votes: item,
                    specialslist:req.specials,
                    commoditylist:req.commodity
                });
            });
        } else if (model.type===8){
            edit_url = "admin/posts/ads_edit";
            edit(req, res, model);
        }
    });
}
exports.update = function (req, res) {
    try {
        var _id = req.body.post_id;
        console.log(req.body.post_address)
        var model = {
            title: comm.get_req_string(req.body.post_title,''),
            subtitle: comm.get_req_string(req.body.post_subtitle,''),
            desc: comm.get_req_string(req.body.post_desc,''),
            source: comm.get_req_string(req.body.post_source, ''),
            clickcount: comm.get_req_int(req.body.post_clickcount,0),
            pvcount: comm.get_req_int(req.body.post_pvcount,0),
            author: comm.get_req_string(req.body.post_author, ''),
            createtime: comm.get_req_string(req.body.post_date, moment().format('YYYY-MM-DD HH:mm:ss')),
            area: comm.get_req_int(req.body.post_area,-1),
            hangye: comm.get_req_int(req.body.post_hangye, -1),
            commentstatus: comm.get_req_int(req.body.post_commentstatus,1),
            video: comm.get_req_string(req.body.post_video,''),
            type: comm.get_req_int(req.body.post_type,1),
            tel: comm.get_req_string(req.body.post_tel,''),
            specials : comm.get_req_string(req.body.post_special,''),
            address : comm.get_req_string(req.body.post_address,''),
            members : comm.get_req_string(req.body.post_members,''),
            price : comm.get_req_int(req.body.post_price,0),
            score : comm.get_req_int(req.body.post_score,0),
            content:comm.get_req_string(req.body.post_content,''),
            status: 0,
            activityetime: comm.get_req_string(req.body.post_activityetime, moment().format('YYYY-MM-DD HH:mm:ss')),
            activitystime: comm.get_req_string(req.body.post_activitystime, moment().format('YYYY-MM-DD HH:mm:ss')),
            activityaddress: comm.get_req_string(req.body.post_activityaddress, ''),
            activitytype :comm.get_req_int(req.body.post_activitytype,0),
            activityassist :comm.get_req_int(req.body.post_activityassist,0),
            activityonline:comm.get_req_int(req.body.post_activityonline,1),
            activitynotice:comm.get_req_int(req.body.post_activitynotice,0),
            activityparticipate:comm.get_req_int(req.body.post_activityparticipate,1),
            activityceiling : comm.get_req_string(req.body.post_activityceiling),
            activityprotocol : comm.get_req_string(req.body.post_activityprotocol),
            activitywelfare : comm.get_req_int(req.body.post_activitywelfare,0),
            activitvouchers:validator.trim(req.body.post_activitvouchers,''),
            activitintegral:comm.get_req_int(req.body.post_activitintegral,0),
            onlinepayment:comm.get_req_int(req.body.post_onlinepayment,0),
            commodity:comm.get_req_string(req.body.post_commodity,''),
            link : comm.get_req_string(req.body.post_link,''),
            picsstate : comm.get_req_string(req.body.post_picsstate,1),
            isaudio : comm.get_req_int(req.body.post_audio,0)
        }
        var pics= validator.trim(req.body.post_pics);
        model.pics =pics;
        if(pics){
            var images = require("images");
            pics='./public/'+pics;
            if (fs.existsSync(pics)) {
                model.pwidth=images(pics).width();
                model.pheight=images(pics).height();
            }
        }
        var tag=validator.trim(req.body.post_tag);
        if(tag!==''){
            model.tag=tag.split(',')[1];
            model.tagtype=tag.split(',')[0];
            if(model.tagtype==="0")model.tag="";
        }
        //主题
        if(model.type!==4 && model.specials){
            var join_special=new Specials({
                sid:model.specials,
                mid:model._id,
            });
            join_special.save(function(err){

            })
        }
        //判断是否为投票
        if(model.type===7){
            var post_votes_title=req.body.post_votes_title;
            var post_votes_count=req.body.post_votes_count;
            var post_votes_pics=req.body.post_votes_pics;
            var post_votes_id=req.body.post_votes_id;
            var votes={
                title:model.title,
                pics:model.pics,
                desc:model.desc,
                content:model.content,
                endtime:comm.get_req_string(req.body.post_votes_endtime,''),
                type:comm.get_req_int(req.body.post_votes_type,0),
                votes:post_votes_id
            };
            var _multcount  = _.chain(post_votes_count)
                              .max(function(user){
                                return user;
                              }).value();
            if (post_votes_title != "" && post_votes_title !== undefined) {
                var votesarray = [];
                var _totalvotes=0;
                if (post_votes_title instanceof Array) {
                    post_votes_title.forEach(function (node, index) {
                        _totalvotes+=parseInt(post_votes_count[index]);
                        votesarray.push({
                            title: node,
                            count: post_votes_count[index],
                            pics: post_votes_pics[index]
                        });
                    });
                }else{
                    _totalvotes+=parseInt(post_votes_count);
                    votesarray.push({
                        title: post_votes_title,
                        count: post_votes_count,
                        pics: post_votes_pics
                    });
                }
                votes.list=votesarray;
                votes.totalvotes=_totalvotes;
                if(votes.type==0){
                    votes.count=_totalvotes;
                }else{
                    votes.count=_multcount;//取最大的
                }
                if(votes.list.length>0){
                    Votes.update({ _id: post_votes_id }, votes, { upsert: true }, function (err) { });
                }
            }
        }else if(model.type===3){
            /**** 图片集 写入 image集合 ****/
            var images = req.body.post_images;//
            var images_desc = req.body.post_images_desc;
            if (images != "" && images !== undefined) {
                var imagesarray = [];
                if (images instanceof Array) {
                    images.forEach(function (node, index) {
                        imagesarray.push({
                            title: req.body.post_title,
                            desc: images_desc[index] == ""?'':images_desc[index],//描述为空使用摘要
                            imgurl: node
                        });
                    });
                } else {
                    imagesarray.push({
                        title: req.body.post_title,
                        desc: images_desc == ""?'':images_desc,//描述为空使用摘要
                        imgurl: images
                    });
                }
                Pics.update({ _id: _id }, { "imgs": imagesarray }, { upsert: true }, function (err) { });
                var imgextra=[];
                if(imagesarray.length>0){
                    imagesarray.forEach(function(node,index){
                        if(index<=2)imgextra.push({src:node.imgurl});
                    })
                }
                // imgextra.push({src:model.pics});
                model.imgextra=imgextra;
            }
        }else{
            model.votes=comm.get_req_string(req.body.post_votes, '');
        }
        var post_publish_status = [];
        if(comm.get_req_string(req.body.post_columnid,'')!==''){
            if(req.body.post_columnid instanceof Array){
                req.body.post_columnid.forEach(function(node,index){
                    post_publish_status.push({cid:node});
                })
            }else{
                post_publish_status.push({cid:req.body.post_columnid});
            }
            model.post_publish_status=post_publish_status;
        }else{
            model.post_publish_status=[];
        }
        Posts.update({ _id: _id }, model, function (err) {
            if (err) {
                response.error(res, err);
            } else {
                /****专题*******/
                var group=req.body.post_special_group;

                Specials.remove({sid:_id},function(err){
                    if (group != "" && group !== undefined) {
                        var title = req.body.post_special_title;
                        var special = req.body.post_special_id;
                        var type = req.body.post_special_type;
                        var createtime = req.body.post_special_createtime;
                        var desc = req.body.post_special_desc;
                        var commentcount = req.body.post_special_commentcount;
                        var clickcount = req.body.post_special_clickcount;
                        var pics = req.body.post_special_pics;
                        var videos = req.body.post_special_video;
                        var source = req.body.post_special_source;
                        var author = req.body.post_special_author;
                        var specialarray = [];
                        var split = /,/;
                        group.forEach(function (node, index) {
                            if(special[index] instanceof Array){
                                special[index].forEach(function(n,i){
                                    Specials.update({ sid:_id,mid:n,name:group[index]}, {
                                        title: title[index][i],
                                        desc: desc[index][i],
                                        createtime: createtime[index][i],
                                        commentcount: commentcount[index][i],
                                        clickcount: clickcount[index][i],
                                        type: type[index][i],
                                        pics: pics[index][i].split(split),
                                        video: videos[index][i],
                                        source: source[index][i],
                                        author: author[index][i],
                                    }, { upsert: true }, function (err) { });
                                })
                            }else{
                                Specials.update({ sid:_id,mid: special[index],name:group[index]}, {
                                    title: title[index],
                                    desc: desc[index],
                                    createtime: createtime[index],
                                    commentcount: commentcount[index],
                                    clickcount: clickcount[index],
                                    type: type[index],
                                    pics: pics[index].split(split),
                                    video: videos[index],
                                    source: source[index],
                                    author: author[index],
                                }, { upsert: true }, function (err) { });
                            }
                        });
                    }
                })
                /****专题结束****/
                Operatorlogs.save({
                    desc: "修改媒资 _id:" + _id,
                    user_login: req.session.user.user_login
                });
                response.success(res, _id);
            }
        });
    } catch (e) {
        console.log(e.stack);
    }
}
exports.delete = function (req, res) {
  var _ids = req.body._ids;
  var reg = /,/;
  var _idarray = _ids.split(reg);
  var success_num = 0;
  var err_num = 0;
  _idarray.forEach(function (_id) {
      Posts.remove({ _id: _id }, function (err) {
          if (err) {
              err_num++;
          } else {
              success_num++;
          }
      });
      Specials.remove({sid:_id},function(err){})//删除专题
      Pics.remove({_id:_id},function(err){})//删除幻灯片
      Postvideo.remove({pid:_id},function(err){})//删除视频
      Postsalbums.remove({_id:_id},function(err){})//删除活动图片
      Medias.remove({mid:_id},function(err){});//下架
      Favorites.remove({mid:_id},function(err){});//下架
      Operatorlogs.save({
          desc: "删除媒资 _id:" + _id,
          user_login: req.session.user.user_login
      });
  });
  response.success(res, {});
}
//发布
exports.publish = function (req, res) {
  var _ids = req.body._ids;
  var order = parseInt(req.body.order);
  var reg = /,/;
  var _idarray = _ids.split(reg);
  var desc = "";
  if (order === 1) desc = "发布媒资";
  else if (order === 2) desc = "审核媒资";
  else if (order === 0) desc = "驳回媒资";
  _idarray.forEach(function (_id) {
    Posts.findOneAndUpdate({_id:_id}, { status: order }).select({_id:0}).exec(function (err, model) {
        if(order===2){
            Medias.remove({ mid: _id }, function (err) {});//先清空已上架的
            model.post_publish_status.forEach(function(node){
                var medias = {
                    title: model.title,
                    subtitle:model.subtitle,
                    desc : model.desc,
                    content : model.content,
                    video : model.video,
                    source : model.source,
                    author : model.author,
                    createtime : model.createtime,
                    password : model.password,
                    commentstatus : model.commentstatus,
                    commentcount : model.commentcount,
                    clickcount : model.clickcount,
                    assistcount : model.assistcount,
                    tel:model.tel,
                    address:model.address===null?"":model.address,//地址 用于美食
                    score:model.score===null?0:model.score,//评分 用于美食
                    price:model.price===null?0:model.price,//价格 用于美食
                    members:model.members===null?"":model.members,
                    order : model.order,
                    type : model.type,
                    area : model.area,
                    hangye : model.hangye,
                    tag : model.tag,
                    tagtype : model.tagtype,
                    link : model.link,
                    attr:-1,
                    pics:model.pics,
                    pwidth:model.pwidth,
                    pheight:model.pheight,
                    imgextra:model.imgextra,
                    user_like_this_post:model.user_like_this_post,
                    activitystime:model.activitystime,
                    activityetime:model.activityetime,
                    activityaddress:model.activityaddress,
                    price:model.price
                };
                medias.mid=_id;
                medias.cid=node.cid;
                // console.log(medias);
                Medias.update({ mid: _id, cid: node.cid }, medias , { upsert: true }, function (err) {
                    if(!err){
                      Operatorlogs.save({
                        desc: "媒资上架 _id:" + _id+" 上架到 分类["+ node.cid+"]",
                        user_login: req.session.user.user_login
                      });
                    }
                })
            })
        }
    });
    Operatorlogs.save({
        desc: desc+" _id:" + _id,
        user_login: req.session.user.user_login
    });
  });
  response.success(res, "ok");
}

exports.ajax_get_pics = function (req, res) {
  var _id = req.query._id;
  var where = { _id: _id };

  Pics.findOne(where).exec(function (err, model) {
      if (err || !model) {
          response.error(res, model);
      }
      else {
          response.success(res, model);
      }
  });
}

exports.ajax_posts_list = function (req, res) {
    var options = comm.get_page_options(req);
    var title = req.query.title;
    var type = req.query.type;
    var status = req.query.status;
    var author = req.query.author;
    var stime = req.query.stime;
    var etime = req.query.etime;
    var where={};
    var query=Posts.where({});
    if (Boolean(title))query.where('title',eval('/'+title+'/ig'));
    if (Boolean(type) && type!=='-1') query.where('type',type);
    if (Boolean(status) && status !== '-1')query.where('status',status);
    if (Boolean(author)) query.where('author',eval('/'+author+'/ig'));
    if(validator.isDate(stime))query.where('createtime').gte(moment(stime).format('YYYY-MM-DD HH:mm:ss'));
    if(validator.isDate(etime))query.where('createtime').lte(moment(etime).format('YYYY-MM-DD HH:mm:ss'));
    var proxy = new eventproxy();
    proxy.all('count','list',function(count,list){
        list.forEach(function (node, index) {
          var node = node.toObject();
          node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
          node.shorttitle=comm.get_substring({str:node.title});
          node.index = options.skip + index + 1;
          config.types.forEach(function (item, j) {
              if (item.id == node.type) {
                  node.typename = item.name;
                  node.typestyle = item.style;
                  return
              }
          })
          if (node.status === 1) {//文章状态 1=已发布 0=未发布 2=已审核
              node.disabled = "disabled";
              node.audit = "已发布";
              node.auditstyle = "btn-info";
          } else if (node.status === 2) {
              node.disabled = "disabled";
              node.audit = "已审核";
              node.auditstyle = "btn-success";
          } else if (node.status === 0) {
              node.disabled = "";
              node.audit = "未发布";
              node.auditstyle = "btn-warning";
          }
          node.url=comm.replace_url(node).split('?')[0];
          list[index] = node;
      })
        return response.success(res,{
            pagecount: Math.ceil(count / options.pagesize),
            currentpage:options.currentpage,
            list: list,
            count:count
        });
    });
    Posts.find(query).skip(options.skip).limit(options.limit)
      .sort('-createtime')
      .exec(proxy.done(function(models) {
            proxy.emit('list',models);
        }));
    Posts.count(query,proxy.done(function (count) {
        proxy.emit('count',count);
    }));
}

exports.ajax_posts_audit_list = function (req, res) {
  var options = comm.get_page_options(req);
  var where = {};
  var title = req.query.title;
  var type = req.query.type;
  var status = req.query.status;
  var where = {};
  if (title !== undefined && title !== '') {
      where.title = { $regex: title, $options: 'i' };
  }
  if (type !== undefined && type !== '' && type !== '-1') {
      where.type = type;
  }
  if (status !== undefined && status !== '' && status !== '-1') {
      where.status = status;
  } else {
      where.status = 1;
  }
  var proxy = new eventproxy();
  proxy.all('count','list',function(count,list){
      list.forEach(function (node, index) {
          var node = node.toObject();
          node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
          node.shorttitle=comm.get_substring({str:node.title});
          node.index = options.skip + index + 1;
          config.types.forEach(function (item, j) {
              if (item.id == node.type) {
                  node.typename = item.name;
                  node.typestyle = item.style;
                  return
              }
          })
          if (node.status === 1) {//文章状态 1=已发布 0=未发布 2=已审核
              node.audit = "通过";
              node.auditstyle = "btn-primary";
          } else if (node.status === 2) {
              node.disabled = "disabled";
              node.audit = "驳回";
              node.auditstyle = "btn-danger";
          }
          list[index] = node;
      })
      return response.success(res,{
          pagecount: Math.ceil(count / options.pagesize),
          currentpage:options.currentpage,
          list: list,
          count:count
      });
  });
  Posts.find(where).skip(options.skip).limit(options.limit)
    .sort('-createtime')
    .exec(proxy.done(function(models) {
          proxy.emit('list',models);
      }));
  Posts.count(where,proxy.done(function (count) {
      proxy.emit('count',count);
  }));
}

exports.ajax_getall_list = function (req, res) {
  var where = {};
  var title = validator.trim(req.query.title);
  var type = validator.trim(req.query.type);
  var status=validator.trim(req.query.status);
  if (title != '') where.title = { $regex: title, $options: 'i' };
  if (type !== '' && type !== '-1') where.type = type;
  if(status!=='')where.status = status;
  var options = comm.get_page_options(req);
  Posts.find(where).skip(options.skip).limit(options.limit).sort('-createtime')
      .exec(function (err, models) {
      models.forEach(function (node, index) {
          var node = node.toObject();
          node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
          node.shorttitle=comm.get_substring({str:node.title});
          node.index = options.skip + index + 1;
          config.types.forEach(function (item, j) {
              if (item.id == node.type) {
                  node.typename = item.name;
                  node.typestyle = item.style;
                  return
              }
          })
          models[index] = node;
      })
      response.success(res, models);
  });
}

exports.ajax_getall_count = function (req, res) {
  var where = {};
  var title = validator.trim(req.query.title);
  var type = validator.trim(req.query.type);
  var status=validator.trim(req.query.status);
  if (title != '') where.title = { $regex: title, $options: 'i' };
  if (type !== '' && type !== '-1') where.type = type;
  if(status!=='')where.status = status;
  var options = comm.get_page_options(req);
  Posts.count(where, function (error, count) {
      if (error) {
      } else {
          response.success(res, {
              pagecount: Math.ceil(count / options.pagesize),
              pagesize: options.pagesize,
          });

      }
  });
}
