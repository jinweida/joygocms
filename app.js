var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var ejs = require('ejs');
var mongoose = require('mongoose');
var config = require('./config');
var actions = require('./actions');
var moment = require('moment');
var fs = require("fs");
var mysqld = require('./lib/mysqld');


mongoose.connect(config.database.db);
mongoose.connection.on("error", function (error) {
    console.log("数据库连接失败：" + error);
});
mongoose.connection.on("open", function () {
    console.log("------数据库连接成功！------");
});
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('.html', ejs.__express);//两个下划线
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '20mb'}));
app.use(bodyParser.urlencoded({limit: '20mb', extended: true}));
app.use(cookieParser());
var setting = { cookieSecret: config.session_secret, db: "test" };
/**
app.use(session({
    secret: setting.cookieSecret,
    key: setting.db,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },
}));**/
app.use(session({
  secret: setting.cookieSecret,
  store: new RedisStore({
    port: config.redis.port,
    host: config.redis.host,    
    auth_pass:config.redis.password
  }),
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 }//一个月
}));
app.use(function (req, res, next) {
    res.locals.current_user = req.session.user;
    res.locals.current_user_roles = req.session.roles;
    res.locals.action = actions.permission;
    res.locals.path = req.path;
    res.locals.wwwname = req.session.wwwname;
    res.locals.version= config.version;
    next();
});
// 静态文件目录
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// will print stacktrace
if (app.get('env') === 'development') {
    //app.set("ShowStrackError",true);
    //app.use(express.logger(":method :url :status"));
    //app.locals.pretty=true;
    mongoose.set("debug",true);
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
// initialize routes
var webRoutes = require('./routes/web');//管理routes
var apiRoutes = require('./api/v1/api');//web api routes
var extendRoutes = require('./api/v1/extend');//插件 routes
var apiRoutes_v1_2 = require('./api/v1.2/api');//web api routes
var extendRoutes_v1_2 = require('./api/v1.2/extend');//插件 routes
var liveRoutes_v1_2 = require('./api/v1.2/live');//插件 routes

var apiRoutes_v1_3 = require('./api/v1.3/api');//web api routes
var extendRoutes_v1_3 = require('./api/v1.3/extend');//插件 routes
var liveRoutes_v1_3 = require('./api/v1.3/live');//插件 routes

var apiRoutes_v1_4 = require('./api/v1.4/api');//web api routes
var extendRoutes_v1_4 = require('./api/v1.4/extend');//插件 routes
var liveRoutes_v1_4 = require('./api/v1.4/live');//插件 routes

var apiRoutes_v1_5 = require('./api/v1.5/api');//web api routes
var extendRoutes_v1_5 = require('./api/v1.5/extend');//插件 routes
var liveRoutes_v1_5 = require('./api/v1.5/live');//插件 routes
app.use('/', webRoutes);
app.use('/', apiRoutes);
app.use('/', extendRoutes);
app.use('/', apiRoutes_v1_2);
app.use('/', extendRoutes_v1_2);
app.use('/', liveRoutes_v1_2);
app.use('/', apiRoutes_v1_3);
app.use('/', extendRoutes_v1_3);
app.use('/', liveRoutes_v1_3);
app.use('/', apiRoutes_v1_4);
app.use('/', extendRoutes_v1_4);
app.use('/', liveRoutes_v1_4);
app.use('/', apiRoutes_v1_5);
app.use('/', extendRoutes_v1_5);
app.use('/', liveRoutes_v1_5);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('页面不存在');
    err.status = 404;
    res.render('404.html', {
        title: 'No Found',
        error:err.message
    })
});
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
/*
    https://lodash.com/docs#indexOf
                 *db.test0.update( { "count" : { $gt : 1 } } , { $set : { "test2" : "OK"} } ); 只更新了第一条记录
                    db.test0.update( { "count" : { $gt : 3 } } , { $set : { "test2" : "OK"} },false,true ); 全更新了
                    db.test0.update( { "count" : { $gt : 4 } } , { $set : { "test5" : "OK"} },true,false ); 只加进去了第一条
                    db.test0.update( { "count" : { $gt : 5 } } , { $set : { "test5" : "OK"} },true,true ); 全加进去了
                    db.test0.update( { "count" : { $gt : 15 } } , { $inc : { "count" : 1} },false,true );全更新了
                    db.test0.update( { "count" : { $gt : 10 } } , { $inc : { "count" : 1} },false,false );只更新了第一条
                    db.attachs.update( { name:/梦之地/ } , {$set:{ video:'/outfiles/2015-09-23/upload_9f9da0fc858311858cc54d742c7fe92f_352_500k.m3u8',pics:'/outfiles/2015-09-23/upload_9f9da0fc858311858cc54d742c7fe92f.jpg',type:2}} ,false,true );
                 */
//var exist = false;
                //models.post_publish_status.forEach(function (item) {
                //    if (item.cid == cid) {
                //        //已经发布到分类下就不再发布了
                //        exist = true;
                //        return;
                //    }
                //});
                //if (!exist) {
                //    //不存在 改变当前文档的发布状态
                //    Posts.update({ _id: _id }, {
                //        $push: { "post_publish_status": post_publish_status }
                //    }, function (err) { });
                //}

                //循环调用
//                var EventProxy = require('eventproxy').EventProxy;
//var ep = new EventProxy();
//https://www.npmjs.com/package/pm2https://www.npmjs.com/package/pm2
//https://github.com/Unitech/PM2/blob/master/ADVANCED_README.md#startup-script

//Columns.find().exec(function (err, models) {
//    ep.after('find', models.length, function (list) {
//        console.log(list);
//    });
//    models.forEach(function (node, index) {
//        Medias.count({ cid: node._id }, function (err, count) {
//            ep.emit('find', node.name + "-" + count);
//        });
//    })
//});
//https://www.npmjs.com/package/eventproxy
//https://github.com/alsotang/node-lessons
//db.posts.update({"commentstatus":"open"},{$unset:{"pics":1}},false,true);
//后台分割 http://demo.baigo.net/
//odata http://tossshinhwa.github.io/node-odata/cn/#41-filter
//http://www.bootstrap-switch.org/examples.html
//moment http://momentjs.com/docs/
// view engine setup
//http://mongoosejs.com/docs/api.html
//http://segmentfault.com/blog/news/1190000000341210
//http://mongodb.github.io/node-mongodb-native/2.0/
//http://www.51testing.com/html/57/60357-842145.html
//kindeditor http://www.jb51.net/article/60705.htm
//https://github.com/nodejitsu/forever
//http://www.expressjs.com.cn/migrating-4.html#overview
//http://www.cnblogs.com/kongxianghai/archive/2015/02/15/4293139.html
//http://www.embeddedjs.com/
//http://tossshinhwa.github.io/node-odata/cn/#7-odata
//https://github.com/youyudehexie/node123
//https://github.com/dead-horse/node-style-guide node 编写风格
//http://www.cnblogs.com/linjiqin/archive/2013/05/27/3101694.html redis window
//http://www.runoob.com/w3cnote/linux-common-command.html
//http://www.runoob.com/mongodb/mongodb-aggregate.html