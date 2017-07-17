var moment = require('moment');
var response = require('../../lib/response');
var comm = require('../../lib/comm');
var Lives = require('../../models/lives').lives;
var Livescolumns = require('../../models/lives').livescolumns;
var Livesusers = require('../../models/lives').livesusers;
var Livessetting = require('../../models/lives').livessetting;
var Livessigns = require('../../models/lives').livessigns;
var Liveshistories = require('../../models/lives').liveshistories;
var Broadcasts = require('../../models/broadcasts').broadcasts;
var Broadprograms = require('../../models/broadcasts').broadprograms;
var Sysconfigs=require('../../models/sysconfigs').sysconfigs;
var appstatus = require('../../models/appstatus').appstatus;
var config = require('../../config');
var url=require('url');
var cloud = require('../../lib/cloud');
var cache = require('../../lib/cache');
var eventproxy = require('eventproxy');
var validator = require('validator');
var cookie = require('../../lib/cookie.js');
var _ = require('lodash');
var path=require('path');
var fs = require("fs");
var multer = require('multer');
//微直播首页
exports.get_home=function(req,res){
  var proxy = new eventproxy();
  proxy.all('top','yugao','living','system','other','columns','cloudlives',function(top,yugao,living,system,other,columns,cloudlives){
    var models = {
      code: 1,
      list: []
    };
    var _top_list={
      title: "",
      hometype: 0,// 0=置顶,1=预告,2=正在直播,3=系统栏目 4=自定义栏目
      rowcount:1,//2,3,4,5 几行
      columncount:2,
      condition : {},
      list: top
    };
    var _yugao_list={
      title: "预告",
      hometype: 1,//
      rowcount:2,//2,3,4,5 几行
      columncount:3,
      icon: config.website + "/images/system/live/trailer.png",
      condition : {
        columntype:'',//-1=全部  0=系统栏目 1=自定义的
        livetype:'2',
        columnname:'',
        listtype: 2,
      },
      list: yugao
    };
    var _living_list={
      title: "正在直播",
      hometype: 2,//
      rowcount:1,//2,3,4,5 几行
      columncount:3,
      icon: config.website + "/images/system/live/live.png",
      condition: {
        columntype:'',//-1=全部 0=系统栏目 1=自定义的
        livetype:'0',
        columnname:'',
        listtype: 2,
      },
      list: living
    };
    var _cloudlives_list={
      title: "云端直播",
      hometype: 3,//
      rowcount:1,//2,3,4,5 几行
      columncount:3,
      icon: config.website + "/images/system/live/column.png",
      condition: {
        columntype:'0',//0=系统栏目 1=自定义的
        columnname:"",
        livetype:'',//-1=全部
        listtype: 2,
      },
      list: cloudlives
    };
    var _other_list={
      title: "其他",
      hometype: 4,//
      rowcount:1,//2,3,4,5 几行
      columncount:3,
      icon: config.website + "/images/system/live/other.png",
      condition: {
        columntype:'1',//0=系统栏目 1=自定义的
        livetype:'',//-1=全部
        columnname:'',
        listtype: 2,
      },
      list: other
    };
    if(top.length>0)models.list.push(_top_list);
    if(yugao.length>0)models.list.push(_yugao_list);
    if(living.length>0)models.list.push(_living_list);
    if(cloudlives.length>0)models.list.push(_cloudlives_list);
    columns.forEach(function(node,i){
      var rows={
        title: node.name,
        hometype: 3,//
        rowcount:1,//2,3,4,5 几行
        columncount:3,
        icon: config.website + "/images/system/live/column.png",
        condition: {
          columntype:'0',//0=系统栏目 1=自定义的
          columnname:node.name,
          livetype:'',//-1=全部
          listtype: 2,
        },
        list: get_form_medias(system[i])
      };
      if(system[i].length>0){
        models.list.push(rows);
      }
    })
    if(other.length>0)models.list.push(_other_list);
    return res.send(models);
  });
  var num=6;
  var condition={status:{$gt:0}};//审核通过的 ，发布成功的
  //置顶
  Lives.find().where(condition).where({attr:1}).limit(2).exec(proxy.done(function (models) {
    proxy.emit('top', get_form_medias(models));
  }));
  //预告
  Lives.find().where(condition).where({type:2,starttime:{$gte:moment().utc()}}).limit(num).sort("-createtime").exec(proxy.done(function (models) {
    proxy.emit('yugao', get_form_medias(models));
  }));
  //正在直播
  Lives.find().where(condition).where({type:0}).limit(num).sort("-createtime").exec(proxy.done(function (models) {
    proxy.emit('living', get_form_medias(models));
  }));
  //其他
  Lives.find().where(condition).where({'columns.type':1,type:{$ne:2}}).limit(num).sort("-createtime").exec(proxy.done(function (models) {
    proxy.emit('other', get_form_medias(models));
  }));
  //系统栏目
  Livescolumns.find({type:0}).exec(proxy.done(function(models){
    proxy.emit('columns',models);
    proxy.after( "lives",models.length,function(lives){
      proxy.emit('system',lives);
    })
    models.forEach(function(node,i){
      Lives.find().where(condition).where({'columns.name':eval('/'+node.name+'/'),type:{$ne:2}}).limit(num).sort("-createtime")
      .exec(proxy.group('lives',function (item) {
        return item;
      }));
    })
  }))
  cloud.get_lives(null,proxy.done(function(models){
    console.log(models);
      proxy.emit('cloudlives',get_form_medias(models));
  }))
}
function get_form_medias(models){
  models.forEach(function (node, index) {
    node = node.toObject();
    node.createtime = parseInt(moment(node.createtime).format('X'));
    node.starttime = parseInt(moment(node.starttime).format('X'));
    node.pics = comm.replace_pics(node.pics);
    if(node.type===0){
      node.tagicon=config.website + "/images/system/live/tag_live.png";
    }
    if(node.type===2){
      node.tagicon=config.website + "/images/system/live/tag_trailer.png";
    }
    if(node.type===3){
      node.cds.url=comm.replace_pics(node.cds.url);
    }else{
      //live_cdn_url
      node.cds.url = config.live_ois_url+":"+ config.live_ois_port + '/' + node.cds.cid + '.m3u8?protocal=hls&user=' + node.cds.uid + '&tid=' + node.cds.tid + '&sid=' + node.cds.cid + '&type=3&token=guoziyun';
    }
    if(node.isads){
      node.ads.url=config.ads+"?_id="+node._id;
    }
    models[index] = node;
  });

  return models;
}
//获取直播配置信息并缓存
function livessetting(){};
livessetting.get=function(key){
  var proxy = new eventproxy();
  proxy.all('settings', function (settings) {
    return _.result(_.find(settings, 'key', key), 'val');
  })
  var cachekey=config.session_secret+'_get_livessetting';
  cache.get(cachekey,function(err,get_livessetting){
    if(get_livessetting){
      proxy.emit('settings', get_livessetting);
    }else{
      Livessetting.find().exec(proxy.done(function(models){
        cache.set(cachekey, models, config.redis.time);//设置缓存
        proxy.emit('settings', models);
      }));
    }
  });
}
//查询微直播分类
exports.get_lives=function(req,res){
  var columntype=validator.trim(req.query.columntype);
  var columnname=validator.trim(req.query.columnname);
  var livetype=validator.trim(req.query.livetype);
  var _id=validator.trim(req.query._id);
  var options = comm.api_get_page_options(req);
  var mpno=validator.trim(req.query.mpno);
  var sort={type:1,createtime:-1};
  var query=Lives.find();//审核通过的 ，发布成功的
  if(_id!==''){ //相关视频 不包含预告
    query.where({_id:{$ne:_id},type:{$ne:2}});//审核通过的
    if(columnname!=='' && columntype==="0")query.where({'columns.name':eval('/'+columnname+'/')});
    else
      query.where({'columns.type':columntype});//栏目为自定义的时候
    query.where({status:{$gt:0}});
  }else{
    if(mpno!==''){
      query.where({'user.mpno':mpno}); //我的微直播包含预告无时间限制
    }else{
      if(livetype!=='')query.where({type:livetype});//直播列表或者录播列表
      query.where({starttime:{$gte:moment().utc()}});      
      if(columntype!==''){
        query.where({'columns.type':columntype});//栏目为自定义的时候
        //query.where({starttime:{$gte:moment().utc()}});
      }
      if(columnname!=='')query.where({'columns.name':eval('/'+columnname+'/')});
      query.where({status:{$gt:0}});
    }
  }

  query.skip(options.skip).limit(options.limit).sort(sort)
  .exec(function(err,models){
    if (err || !models) {
      return res.send({ "code": 0 });
    }else{
      return response.api(res, {}, get_form_medias(models));
    }
  })
}
exports.get_lives_histories=function(req,res){
  var mpno=validator.trim(req.query.mpno);
  Liveshistories.find({mpno:mpno}).populate('livesid').sort('-createtime').limit(30)
  .exec(function(err,items){
    var list=[];
    items.forEach(function(node,index){
      if(node.liveid!=null)list.push(node.livesid);
    })
    return res.send({
      code: 1,
      list:get_form_medias(list)
    });
  })
}
exports.set_lives_histories=function(req,res){
  var mpno=validator.trim(req.body.mpno);
  var livesid=validator.trim(req.body._id);
  if (!Boolean(mpno) || !Boolean(livesid)) {
    return res.send({ "code": 0,message:'mpno or lives is not empty!' });
  }
  Liveshistories.count({mpno:mpno,livesid:livesid}).exec(function(err,count){
    if(err || count) return res.send({ "code": 0,message:'find error or count gt zero！' });
    if(!count){
      var history=new Liveshistories({
        mpno:mpno,livesid:livesid
      })
      history.save(function(err){
        if(err)return res.send({ "code": 0,message:'save error！' });
        else
          return res.send({ "code": 1,message:'success' });
      });
    }
  })
}
//获取最近的预告
exports.get_trailer_near=function(req,res){
  var starttime=moment().utc();
  var endtime=moment().utc().add('30','m');//转为格林威治时间,mongodb不知道如何设置时区
  var mpno=validator.trim(req.query.mpno);//用户id
  if (mpno==='')return res.send({ "code": 0,message:'mpno is not empty!'});
  var options = comm.api_get_page_options(req);
  var query=Lives.find({'user.mpno':mpno,type:2,status:{$gt:0}});
  //开发阶段先关闭
  query.where({starttime:{$gte:starttime,$lte:endtime}});
  query.skip(options.skip).limit(options.limit).sort("-createtime").exec(function(err,models){
    if (err || !models) {
      return res.send({ "code": 0 });
    }else{
      return response.api(res, {}, get_form_medias(models));
    }
  })
}
//获取微直播详情
exports.get_detail=function(req,res){
  var mpno =validator.trim(req.query.mpno) ;
  var _id=validator.trim(req.query._id);
  //必须是审核过的
  Lives.findOne({_id:_id,status:{$gt:0}},function(err,model){
    if(err || !model){
      var url=config.joygo_cloud_url+"/api/get_cloud_lives_detail?_id="+_id+"&mpno="+mpno;
      return res.redirect(url);
      //return res.send({code:0});
    }else{
      var node = model.toObject();
      node.createtime = parseInt(moment(node.createtime).format('X'));
      node.starttime = parseInt(moment(node.starttime).format('X'));
      if(_.isDate(node.ads.time))node.ads.time=parseInt(moment(node.ads.time).format('X'));
      node.pics = comm.replace_pics(node.pics);
      if(node.type===3)node.cds.url=comm.replace_pics(node.cds.url);
      else{
        node.cds.url = config.live_ois_url + ':' + config.live_ois_port + '/' + node.cds.cid + '.m3u8?protocal=hls&user=' + node.cds.uid + '&tid=' + node.cds.tid + '&sid=' + node.cds.cid + '&type=3&token=guoziyun'
      }
      if(node.type===0){
        node.tagicon=config.website + "/images/system/live/tag_live.png";
      }
      if(node.type===2){
        node.tagicon=config.website + "/images/system/live/tag_trailer.png";
      }
      model = node;
      if(mpno!==''){
        Liveshistories.count({mpno:mpno,livesid:_id}).exec(function(err,count){
          if(!count){
            var history=new Liveshistories({mpno:mpno,livesid:_id})
            history.save(function(err){});
          }
        })
      }
      return response.apidetail(res, {}, model);
    }
  });
}
//获取微直播状态
exports.get_lives_status=function(req,res){
  var mpno =validator.trim(req.query.mpno);
  var proxy = new eventproxy();
  proxy.all('user','sysconfigs',function(user,sysconfigs){
    if(!user && !sysconfigs)return res.send({ "code": 1,data:{message:'开',status:3}});
    if(!Number(sysconfigs.val))return res.send({ "code": 1,data:{message:'直播已被禁止，请联系后台管理员',status:2}});
    else{
      //再查用户是否是黑名单
      if(user){
        if(user.status===-2){
          return res.send({ "code": 1,data:{message:'您是黑名单用户',status:2}});
        }
      }
      return res.send({ "code": 1,data:{message:'开',status:3}});
    }
  })
  Sysconfigs.findOne({type:'live',key:'live_switch'},proxy.done(function(model){
    proxy.emit('sysconfigs',model);
  }));
  getByMnpoUser(mpno,proxy.done(function(model){
    proxy.emit('user',model);
  }));
}
//发起直播
exports.set_lives=function(req,res){
  var mpno =validator.trim(req.body.mpno);
  var title=validator.trim(req.body.title);
  var _id=validator.trim(req.body._id);
  if (mpno==='') return res.send({ "code": 0,message:'mpno is not empty!'});
  var type=validator.trim(req.body.type);
  var chatroomdata={chatroomid:moment().format("YYYYMMDDHHmmss"),chatroomname:title,isjoin:true};
  var dir='/upload/lives/'+moment().format('YYYY-MM-DD');
  var proxy = new eventproxy();
  proxy.all('user','live','chatroom','sysconfigs',function(user,live,chatroom,sysconfigs){
    var live_delay_time=_.result(_.find(sysconfigs, {key:'live_delay_time'}), 'val');
    //判断是否可以发直播
    if(!_.result(_.find(sysconfigs, {key:'live_switch'}), 'val')){
      return res.send({ "code": 0,message:'直播已被禁止，请联系后台管理员'});
    }
    var status='1';//预告、录播待审核
    if(type==='0'){
      status='-2';//直播默认是正在创建，需要点开始发通知改变状态
    }
    var model=new Lives({
      title:title,
      desc:validator.trim(req.body.desc),
      user:{
        mpno:mpno,
        face:validator.trim(req.body.face),
        nickname:validator.trim(req.body.nickname),
        roles:user?user.roles:'',
      },
      cds:{
        tid:validator.trim(req.body.tid),
        uid:validator.trim(req.body.uid),
        cid:validator.trim(req.body.cid),
        cdsid:validator.trim(req.body.cdsid),
        delaytime:live_delay_time?live_delay_time:0//无配置项，不延时
      },
      location:{
        show:validator.trim(req.body.show),
        lon:validator.trim(req.body.lon),
        lat:validator.trim(req.body.lat),
        address:validator.trim(req.body.address),
        city:validator.trim(req.body.city),
      },
      columns:{
        name:validator.trim(req.body.columnsname),
        type:validator.trim(req.body.columnstype),
      },
      pics:req.body.pics?comm.base64_decode({
        base64str:req.body.pics,
        absolutelydir:'./public'+dir,
        relativedir:dir,
      }):'',
      type:validator.trim(req.body.type),
      status:status,
    });
    var date=moment.unix(validator.trim(req.body.starttime)).format("YYYY-MM-DD HH:mm:ss");
    if(!validator.isDate(date))return res.send({cod:0,message:'预告时间非法'});
    model.starttime=date;
    if(live){
      live.pics=req.body.pics?comm.base64_decode({
        base64str:req.body.pics,
        absolutelydir:'./public'+dir,
        relativedir:dir,
      }):'';
      live.title=model.title;
      live.desc=model.desc;
      live.type=model.type;//变成录播|直播
      live.cds=model.cds;
      live.columns=model.columns;
      chatroomdata.chatroomid='';
      chatroomdata.chatroomname='';
      chatroomdata.isjoin=false;
      model=live;
    }else{
      //model.status=livessetting.get('live_default_status');//获取默认系统状态
      //此处创建聊天室
      if(chatroom.code==='200'){
        model.chatroom.chatroomid=chatroomdata.chatroomid;
        model.chatroom.chatroomname=chatroomdata.chatroomname;
        model.chatroom.isjoin=true;
      }
      chatroomdata._id=model._id;
    }
    model.save(function(err){
      if(err)return res.send({cod:0,message:'save error！'});
      else{
        return res.send({code:1,data:chatroomdata});
      }
    })
  });
  Livesusers.findOne({mpno:mpno},proxy.done(function(model){
    proxy.emit('user', model);
  }));
  if(!_id){//新增的时候创建聊天室
    proxy.emit('live', '');
    var request = require('request');
    request.post({url:config.live_chatroom_create,form:chatroomdata},proxy.done(function(response, body){
      var info=JSON.parse(body);
      proxy.emit('chatroom', info);
    }));
  }else{
    Lives.findOne({_id:_id},proxy.done(function(model){
      proxy.emit('live', model);
    }));
    proxy.emit('chatroom', {code:0});
  }

  Sysconfigs.find({type:'live'},proxy.done(function(models){
    proxy.emit('sysconfigs', models);
  }));
}
exports.set_lives_attachs=function(req,res){
  var dir = moment().format("YYYY-MM-DD");
  var upload = multer({ dest: './public/upload/lives/' + dir });
  upload(req, res, function (err) {
    if (err)return res.send({ "code": 0 ,message:"upload fail!"});
    var _id=validator.trim(req.body._id);
    if (_id==='') return res.send({ "code": 0,message:'_id is not empty!'});
    var pics=function (){
      for(key in req.files){
        var name=req.files[key].name;
        return path.join('/upload/lives/',dir, name).replace(/\\/ig, '/');
      }
    }
    Lives.findOne({_id:_id},function(err,model){
      if (err || !model)return res.send({ "code": 0 ,message:"find error!"});
      model.pics=pics();
      model.save(function(err){
        if(err)return res.send({cod:0,message:'save error！'});
        else{
          return res.send({code:1,message:"success"});
        }
      })
    });
  })
}
//微直播点赞
exports.set_lives_assist=function(req,res){
  var _id=validator.trim(req.body._id);
  var assistcount=validator.trim(req.body.assistcount);
  if (_id==='')return res.send({ "code": 0,message:'_id is not empty!'});
  Lives.findOneAndUpdate({_id:_id},{$inc:{assistcount:assistcount}},function(err,model){
    if(err)return res.send({code:0,message:'save error!'});
    else
      return res.send({code:1,message:'success!'});
  })
}

exports.set_vod=function(req,res){
  var dir = '/upload/lives/'+moment().format("YYYY-MM-DD");
  var upload = multer({ dest: './public' + dir });
  upload(req, res, function (err) {
    if (err)return res.send({ "code": 0 ,message:"upload fail!"});
    var mpno =validator.trim(req.body.mpno);
    var title=validator.trim(req.body.title);
    var _id=validator.trim(req.body._id);
    if (mpno==='') return res.send({ "code": 0,message:'mpno is not empty!'});
    var video=function (){
      for(key in req.files){
        var name=req.files[key].name;
        return path.join(dir, name).replace(/\\/ig, '/');
      }
    }
    var chatroomdata={chatroomid:moment().format("YYYYMMDDhhmmss"),chatroomname:title};
    var proxy = new eventproxy();
    proxy.all('user','chatroom',function(user,chatroom){
      var model=new Lives({
        title:title,
        desc:validator.trim(req.body.desc),
        user:{
          mpno:mpno,
          face:validator.trim(req.body.face),
          nickname:validator.trim(req.body.nickname),
          roles:user?user.roles:'',
        },
        cds:{
          tid:validator.trim(req.body.tid),
          uid:validator.trim(req.body.uid),
          cid:validator.trim(req.body._id),
          originalurl:video(),
        },
        columns:{
          name:validator.trim(req.body.columnsname),
          type:validator.trim(req.body.columnstype),
        },
        pics:req.body.pics?comm.base64_decode({
          base64str:req.body.pics,
          absolutelydir:'./public'+dir,
          relativedir:dir,
        }):'',
        type:3,
        status:-2,//本地上传 转码中
      });
      if(chatroom.code==='200')model.chatroom=chatroomdata;
      model.save(function(err){
        if(err)return res.send({cod:0,message:'save error！'});
        else{
          return res.send({code:1,data:chatroomdata});
        }
      })
    });
    Livesusers.findOne({mpno:mpno},proxy.done(function(model){
      proxy.emit('user', model);
    }));
    var request = require('request');
    request.post({url:config.live_chatroom_create,form:chatroomdata},proxy.done(function(response, body){
      if (err)proxy.emit('chatroom', {code:0});
      else{
        var info=JSON.parse(body);
        proxy.emit('chatroom', info);
      }
    }));
  })
}
//销毁微直播 变为录播
exports.set_lives_destroy=function(req,res){
  var _id=validator.trim(req.body._id);
  destory({_id:_id,type:0},res);
}
exports.set_ois_destroy=function(req,res){
  var cid=validator.trim(req.body.cid);
  destory({'cds.cid':cid,status:1,type:0},res);
}
function destory(where,res){
  var proxy = new eventproxy();
  proxy.all('lives','sysconfigs',function(lives,sysconfigs){
    if(!lives)return res.send({code:0,message:'Parameter error!'});
    var live_default_status=_.result(_.find(sysconfigs, {key:'live_default_status'}), 'val');
    lives.status=live_default_status?live_default_status:0;//无配置项，状态为待审核
    lives.type=1;//变为录播
    var _new_cid=lives.cds.cid+'_0';
    lives.cds.cid=_new_cid;
    lives.save(function(err){
      if(err)return res.send({code:0,message:'save error!'});
      else
        return res.send({code:1,message:'success!'});
    })
  })
  Lives.findOne(where,proxy.done(function(model){
    proxy.emit('lives', model);
  }))
  Sysconfigs.find({type:'live'},proxy.done(function(model){
    proxy.emit('sysconfigs', model);
  }));
}
//通知微直播开始
exports.set_lives_notice=function(req,res){
  var _id=validator.trim(req.body._id);
  var proxy = new eventproxy();
  proxy.all('lives','sysconfigs',function(lives,sysconfigs){
    if(!lives)return res.send({code:0,message:'Parameter error!'});
    var live_default_status=_.result(_.find(sysconfigs, {key:'live_default_status'}), 'val');
    lives.status=live_default_status?live_default_status:0;//无配置项，状态为待审核
    lives.save(function(err){
      if(err)return res.send({code:0,message:'save error!'});
      else{
        if(lives.status===1){
          comm.sendMessage({chatroomid:lives.chatroom.chatroomid,info:'直播开始了！',extra:'info'});
        }
        return res.send({code:1,message:'success!'});
      }
    })
  })
  Lives.findOne({_id:_id,type:0,status:-2},proxy.done(function(model){
    proxy.emit('lives', model);
  }))
  Sysconfigs.find({type:'live'},proxy.done(function(model){
    proxy.emit('sysconfigs', model);
  }));
}
//获取微栏目
exports.get_columns=function(req,res){
  var cachekey=config.session_secret+'_get_livescolumns';
  cache.get(cachekey,function(err,get_livescolumns){
    if(get_livescolumns){
      return response.api(res, {}, get_livescolumns);
    }else{
      var query=Livescolumns.find({type:0});//获取系统栏目
      query.select({createtime:0,creator:0}).exec(function(err,models){
        if(err){return res.send({code:0,message:'出错了'})}
        return response.api(res, {}, models);
      })
    }
  })
}
//获取认证用户信息
exports.get_users=function(req,res){
  var mpno =validator.trim(req.query.mpno);
  if (mpno==='') {
    return res.send({ "code": 0,message:'mpno is empty!' });
  }
  getByMnpoUser(mpno,function(err,model){
    return response.apidetail(res, {}, model);
  });
}
function getByMnpoUser(mpno,callback){
  Livesusers.findOne({mpno:mpno}).select({updatetime:0,endtime:0,starttime:0,order:0}).exec(function(err,model){
    if(err || !model)return callback(err,{});
    var node = model.toObject();
    node.createtime = parseInt(moment(node.createtime).format("X"));
    node.idpics=comm.replace_pics(node.idpics);
    if(node.roles!=null){
      if(node.roles.indexOf('记者')>-1)
        node.issign=1;
      else
        node.issign=0;
    }
    model=node;
    return callback(err,model);
  })
}
//实名认证
exports.set_users=function(req,res){
  var mpno =validator.trim(req.body.mpno);
  if (mpno==='') {
    return res.send({ "code": 0,message:'mpno is not empty!' });
  }
  var dir='/upload/lives/'+moment().format('YYYY-MM-DD');
  var user=new Livesusers({
    mpno:mpno,
    name:validator.trim(req.body.name),
    occupation:validator.trim(req.body.occupation),
    place:validator.trim(req.body.place),
    idnumber:validator.trim(req.body.idnumber),
    idpics:req.body.idpics?comm.base64_decode({
        base64str:req.body.idpics,
        absolutelydir:'./public'+dir,
        relativedir:dir,
      }):'',
    phone:validator.trim(req.body.phone),
    applyreasons:validator.trim(req.body.applyreasons),
  });
  Livesusers.findOne({mpno:mpno},function(err,model){
    if(err)return res.send({ "code": 0 ,message:'find error!'});
    if(model){
      //判断用户是否已经认证了，禁止重复认证
      if(model.status){
        return res.send({ "code": 0,message:"can not repeat certification;" });
      }
      model.name=user.name;
      model.occupation=user.occupation;
      model.place=user.place;
      model.idnumber=user.idnumber;
      model.phone=user.phone;
      model.applyreasons=user.applyreasons;
      user=model;
    }
    user.save(function(err){
      if(err){
        return res.send({ "code": 0,message:"save error!" });
      }else{
        return res.send({"code":1,message:"success!"});
      }
    })
  })
}
//微直播签到
exports.set_signs=function(req,res){
  var mpno=validator.trim(req.body.mpno);
  if (mpno==='') return res.send({ "code": 0,message:'mpno is not empty!' });
  getByMnpoUser(mpno,function(err,model){
    if(err || !model)return res.send({ "code": 0,message:'find err!' });
    if(model.status===1){
      var signs=new Livessigns({
        mpno:mpno,location:{
          lon:validator.trim(req.body.lon),
          lat:validator.trim(req.body.lat),
          address:validator.trim(req.body.address),
          city:validator.trim(req.body.city),
        }
      });
      signs.save(function (err) {
        if(err)return res.send({ "code": 0,message:'save err!' });
        return res.send({ "code": 1, message: "签到成功！"});
      });
    }else{
      return res.send({ "code": 0, message: "您认证未通过不能签到！"});
    }
  });
}
exports.get_broadcasts=function(req,res){
  var query=Broadcasts.find();
  var proxy = new eventproxy();
  var cachekey=config.session_secret+'_get_broadcasts_1.3.0';
  cache.get(cachekey,function(err,data){
    if(data)return response.api(res, {}, data);
    else{
      proxy.all('broadcasts','programs',function(broadcasts,programs){
        broadcasts.forEach(function(node,index){
          var p=programs[index];
          if(p)node.desc='正在直播：'+p.title;
        })
        var models=get_format_broadcasts(broadcasts)
        cache.set(cachekey,models , config.redis.time);//设置缓存
        return response.api(res, {},models);
      })
      //系统栏目
      Broadcasts.find().exec(proxy.done(function(models){
          proxy.emit('broadcasts',models);
        proxy.after( "programs",models.length,function(programs){
          proxy.emit('programs',programs);
        })
        var stime=moment();
        models.forEach(function(node,i){
          Broadprograms.findOne({broadid:node._id,stime:{$lte:stime},etime:{$gte:stime}}).sort("-etime").exec(proxy.group('programs',function (item) {
            return item;
          }));
        })
      }))
    }
  });
}
exports.get_broadcasts_detail=function(req,res){
  var _id=validator.trim(req.query._id);
  var query=Broadcasts.find();
  Broadcasts.find({_id:_id}).exec(function(err,models){
    if(err)return res.send({ "code": 0,message:'find err!' });
    return response.apidetail(res, {}, get_format_broadcasts(models)[0]);
  })
}
exports.get_broadprograms=function(req,res){
  var broadid=validator.trim(req.query.broadid);
  var stime=validator.trim(req.query.stime);
  var etime=validator.trim(req.query.etime);
  var query=Broadprograms.where('broadid',broadid);
  if (broadid==='')return res.send({ "code": 0,message:'broadid is not empty!'});
  if(stime!=='')query.where('stime').gte(new Date(stime * 1000).toLocaleString());
  if(etime!=='')query.where('etime').lte(new Date(etime * 1000).toLocaleString());
  Broadprograms.find(query).exec(function(err,models){
    if(err)return res.send({ "code": 0,message:'find err!' });
    return response.api(res, {}, get_format_broadcasts(models));
  })
}
//微直播点赞
exports.set_broadcasts_assist=function(req,res){
  var _id=validator.trim(req.body._id);
  var assistcount=validator.trim(req.body.assistcount);
  if (_id==='')return res.send({ "code": 0,message:'_id is not empty!'});
  Broadcasts.findOneAndUpdate({_id:_id},{$inc:{assistcount:assistcount}},function(err,model){
    if(err)return res.send({code:0,message:'save error!'});
    else
      return res.send({code:1,message:"save successs",data:{
        assistcount:model.assistcount}
      });
  })
}
exports.get_utc_time=function(req,res){
  return res.send({code:1,data:{utc:parseInt(moment().format('X'))}});
}
function get_format_broadcasts(models){
  models.forEach(function (node, index) {
    node = node.toObject();
    node.createtime = parseInt(moment(node.createtime).format('X'));
    node.pics = comm.replace_pics(node.pics);
    if(Boolean(node.stime))node.stime = parseInt(moment(node.stime).format('X'))
      //moment(new Date(node.stime * 1000).toLocaleString()).format('X');
    if(Boolean(node.etime))node.etime = parseInt(moment(node.etime).format('X'));
    models[index] = node;
  });
  return models;
}


