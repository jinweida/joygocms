var main = require('../controllers/mainController');
var users = require('../controllers/usersController');
var posts = require('../controllers/postsController');
var areas = require('../controllers/areasController');
var activitys = require('../controllers/activitysController');
var hangyes = require('../controllers/hangyesController');
var specials = require('../controllers/specialsController');
var comments = require('../controllers/commentsController');
var videos = require('../controllers/videosController');
var medias = require('../controllers/mediasController');
var authors = require('../controllers/authorsController');
var uploads = require('../controllers/uploadsController');
var sysconfigs = require('../controllers/sysconfigsController');
var ads = require('../controllers/adsController');
var kpis = require('../controllers/kpisController');
var roles = require('../controllers/rolesController');
var operatorlogs = require('../controllers/operatorlogsController');
var columns = require('../controllers/columnsController');
var menus = require('../controllers/menusController');
var attachs = require('../controllers/attachsController');
var feedbacks = require('../controllers/feedbacksController');
var houses = require('../controllers/housesController');
var anchors = require('../controllers/anchorsController');
var questions = require('../controllers/questionsController');
var regions = require('../controllers/regionsController');
var dishes = require('../controllers/dishesController');
var broadcasts = require('../controllers/broadcastsController');
var postsalbums = require('../controllers/postsalbumsController');
var organs = require('../controllers/organsController');
var epgs = require('../controllers/epgsController');
var homes = require('../controllers/homesController');
var lives = require('../controllers/livesController');
var messages = require('../controllers/messagesController');
var statistics = require('../controllers/statisticsController');
var usergroups = require('../controllers/usergroupController');
var cloud = require('../controllers/cloudController');
var express = require('express');
var router = express.Router();
var filter = require('../lib/filter');
var moment = require('moment');
var path = require('path');
var fs = require("fs");

var multiparty = require("multiparty");

router.get('/login', main.login);//登录页
router.post('/signin', users.signin);//登录
router.get('/logout', users.logout);//退出
router.get('/admin/index', filter.authorize, main.index);//退出

router.get('/admin/settongji',statistics.settongji);

//媒资管理
router.post('/admin/changepwd', filter.authorize, users.changepwd);
router.get('/admin', filter.authorize, users.admin);
router.get('/admin/posts', filter.authorize, posts.list);
router.get('/admin/audit', filter.authorize, posts.audit_list);
router.get('/admin/posts_add', filter.authorize,columns.loadStatusAll,posts.loadAll,posts.add);
router.get('/admin/posts_edit', filter.authorize,columns.loadStatusAll,posts.loadAll,posts.edit);
router.post('/admin/posts_update', filter.authorize, posts.update);
router.post('/admin/posts_create', filter.authorize,  posts.create);
router.post('/admin/posts_delete', filter.authorize, posts.delete);
router.post('/admin/posts_postsalbums_delete', filter.authorize, posts.postsalbums_del);
router.post('/admin/posts_publish', filter.authorize, posts.publish);
router.get('/admin/ajax_posts_list', filter.authorize, posts.ajax_posts_list);
router.get('/admin/ajax_posts_audit_list', filter.authorize, posts.ajax_posts_audit_list);
router.get('/admin/ajax_getall_list', filter.authorize, posts.ajax_getall_list);
router.get('/admin/ajax_getall_count', filter.authorize, posts.ajax_getall_count);
router.get('/admin/phone', filter.authorize, uploads.list);
router.post('/admin/upload_audit', filter.authorize, uploads.audit);
router.post('/admin/uploads_delete', filter.authorize, uploads.delete);
router.get('/admin/ajax_get_uploads_list', filter.authorize, uploads.ajax_get_uploads_list);


//绩效考核
router.get('/admin/kpis', filter.authorize, kpis.list);
router.get('/admin/ajax_get_kpis_list', filter.authorize, kpis.ajax_get_kpis_list);
router.get('/admin/kpis_add', filter.authorize,kpis.loadAll, kpis.add);
router.post('/admin/kpis_create', filter.authorize, kpis.create);
router.get('/admin/kpis_edit', filter.authorize,kpis.loadAll, kpis.edit);
router.post('/admin/kpis_update', filter.authorize, kpis.update);
router.post('/admin/kpis_delete', filter.authorize, kpis.delete);

//图片集管理
router.get('/admin/ajax_get_pics', filter.authorize, posts.ajax_get_pics);
//专题管理
router.post('/admin/specials_delete', filter.authorize, specials.delete);
//栏目管理
router.get('/admin/columns', filter.authorize, columns.list);
router.get('/admin/columns_add', filter.authorize, columns.loadAll,columns.add);
router.post('/admin/columns_create', filter.authorize, columns.create);
router.post('/admin/columns_remove', filter.authorize, columns.remove);
router.get('/admin/columns_delete', filter.authorize, columns.delete);
router.get('/admin/ajax_get_columns_list', filter.authorize, columns.ajax_get_columns_list);
//操作日志
router.get('/admin/operatorlogs', filter.authorize, operatorlogs.list);
router.get('/admin/ajax_operatorlogs_list', filter.authorize, operatorlogs.ajax_list);
router.post('/admin/operatorlogs_remove', filter.authorize, operatorlogs.remove);
router.get('/admin/sysconfigs', filter.authorize, sysconfigs.list);
router.post('/admin/sysconfigs/create', filter.authorize, sysconfigs.create);
router.put('/admin/sysconfigs/save', filter.authorize, sysconfigs.save);

//发布管理
router.get('/admin/up', filter.authorize, columns.loadAll, medias.up);
router.get('/admin/down', filter.authorize, columns.loadAll, medias.down);
router.post('/admin/doup', filter.authorize, medias.doup);
router.post('/admin/dodown', filter.authorize, medias.dodown);
router.get('/admin/medias/getFullMedias',filter.authorize,medias.getFullMedias);
router.post('/admin/setTime', filter.authorize, medias.setTime);
//置顶操作
router.post('/admin/dotop', filter.authorize, medias.dotop);
router.get('/admin/ajax_up_list', filter.authorize, medias.ajax_up_list);
router.get('/admin/ajax_up_count', filter.authorize, medias.ajax_up_count);
router.get('/admin/ajax_down_list', filter.authorize, medias.ajax_down_list);
router.get('/admin/ajax_down_count', filter.authorize, medias.ajax_down_count);
//附件管理
router.get('/admin/attachs', filter.authorize,columns.loadAll, attachs.list);
router.get('/admin/attachs_ajax_get_list', filter.authorize, attachs.ajax_get_list);
router.get('/admin/attachs_ajax_get_count', filter.authorize, attachs.ajax_get_count);
router.post('/admin/attachs_delete', filter.authorize, attachs.delete);
router.post('/admin/attachs_update_status',attachs.update_status);

//评论管理
router.get('/admin/comments', filter.authorize, comments.get_comments_list);
router.post('/admin/comments_delete', filter.authorize, comments.delete);
router.get('/admin/ajax_get_comments_list', filter.authorize, comments.ajax_get_comments_list);
router.get('/admin/set_comments', filter.authorize, comments.set_comments);
router.post('/admin/comments_pass', filter.authorize, comments.comments_pass);
//建议反馈
router.get('/admin/feedbacks', filter.authorize, feedbacks.list);
router.get('/admin/feedbacks_ajax_list', filter.authorize, feedbacks.ajax_list);
router.post('/admin/feedbacks_remove', filter.authorize, feedbacks.remove);
router.put('/admin/feedbacks_reply', filter.authorize, feedbacks.reply);
//机关黄页
router.get('/admin/organs', filter.authorize, organs.list);
router.get('/admin/organs_add', filter.authorize,organs.loadAll, organs.add);
router.get('/admin/organs_edit', filter.authorize,organs.loadAll, organs.edit);
router.post('/admin/organs_create', filter.authorize, organs.create);
router.post('/admin/organs_update', filter.authorize, organs.update);
router.post('/admin/organs_remove', filter.authorize, organs.remove);
//商户管理
router.get('/admin/cooper', filter.authorize, organs.cooper);
router.get('/admin/get_cooper',filter.authorize,organs.get_cooper);
router.post('/admin/del_cooper',filter.authorize,organs.del_cooper);
router.post('/admin/set_cooper',filter.authorize,organs.set_cooper);
router.get('/admin/cooper_detail',filter.authorize,organs.cooper_detail);
//角色管理
router.get('/admin/roles', filter.authorize, roles.list);
router.get('/admin/roles_add', filter.authorize, roles.add);
router.post('/admin/roles_create', filter.authorize, roles.create);
router.get('/admin/roles_delete', filter.authorize, roles.delete);
router.get('/admin/roles_edit', filter.authorize, roles.edit);
router.post('/admin/roles_update', filter.authorize, roles.update);
router.get('/admin/users', filter.authorize, users.list);
router.get('/admin/users_add', filter.authorize, users.add);
router.get('/admin/users_edit', filter.authorize, users.edit);
router.post('/admin/users_update', filter.authorize, users.update);
router.post('/admin/users_create', filter.authorize, users.create);
router.get('/admin/user_delete', filter.authorize, users.delete);
//作者管理
router.get('/admin/epgs', filter.authorize,epgs.get_epgs_list);
router.get('/admin/authors', filter.authorize, authors.list);
router.get('/admin/authors_add', filter.authorize, authors.add);
router.get('/admin/authors_edit', filter.authorize, authors.edit);
router.post('/admin/authors_create', filter.authorize, authors.create);
router.post('/admin/authors_update', filter.authorize, authors.update);
router.post('/admin/authors_delete', filter.authorize, authors.delete);
router.get('/admin/ajax_get_authors_list', filter.authorize, authors.ajax_get_authors_list);
router.get('/admin/areas', filter.authorize, areas.create);
router.get('/admin/hangyes', filter.authorize, hangyes.create);
//活动报名
router.get('/admin/activitys', filter.authorize, activitys.list);
router.get('/admin/activitys/excel', filter.authorize, activitys.excel);
router.post('/admin/activitys_delete', filter.authorize, activitys.delete);
router.get('/admin/ajax_get_activitys_list', filter.authorize, activitys.ajax_get_list);
//创建媒资中选择视频
router.get('/admin/videos',filter.authorize,columns.loadAll,videos.list);
router.get('/admin/videos_ajax_get_list',filter.authorize,videos.ajax_get_list);
router.get('/admin/videos_ajax_get_count',filter.authorize,videos.ajax_get_count);
router.get('/admin/videos_ajax_get_addlist',filter.authorize,videos.ajax_get_addlist);
router.get('/admin/videos_ajax_get_addcount',filter.authorize,videos.ajax_get_addcount);
router.get('/admin/audio_ajax_get_addlist',filter.authorize,videos.ajax_getAudio_addlist);
router.get('/admin/audio_ajax_get_addcount',filter.authorize,videos.ajax_getAudio_addcount);
router.get('/admin/undotop', medias.undotop);
//广告管理
router.get('/admin/ads', filter.authorize, ads.list);
router.get('/admin/ads/ajax_ads_list', filter.authorize, ads.ajax_ads_list);
router.get('/admin/ads_add', filter.authorize,columns.loadAll, ads.add);
router.get('/admin/ads_edit', filter.authorize,columns.loadAll, ads.edit);
router.post('/admin/ads_create', filter.authorize, ads.create);
router.post('/admin/ads_update', filter.authorize, ads.update);
router.post('/admin/ads_delete', filter.authorize, ads.delete);

//主播管理
router.get('/admin/anchors', filter.authorize, anchors.list);
router.get('/admin/anchors_add', filter.authorize, anchors.add);
router.get('/admin/anchors_edit', filter.authorize, anchors.edit);
router.post('/admin/anchors_create', filter.authorize, anchors.create);
router.post('/admin/anchors_update', filter.authorize, anchors.update);
router.post('/admin/anchors_delete', filter.authorize, anchors.delete);

//问答管理
router.get('/admin/questions', filter.authorize, questions.list);
router.get('/admin/questions_ajax_get_list',filter.authorize,questions.ajax_get_list);
router.post('/admin/questions_delete', filter.authorize, questions.delete);

//问吧管理
router.get('/admin/wenba', filter.authorize, questions.wenba_list);
router.get('/admin/wenba_ajax_get_list',filter.authorize,questions.wenba_ajax_get_list);
router.post('/admin/wenba_set_answers',filter.authorize,questions.wenba_set_answers);

//菜品管理
router.get('/admin/dishes', filter.authorize, dishes.list);
router.get('/admin/dishes_add', filter.authorize,dishes.add);
router.get('/admin/dishes_edit', filter.authorize,dishes.edit);
router.post('/admin/dishes_create', filter.authorize, dishes.create);
router.post('/admin/dishes_update', filter.authorize, dishes.update);
router.post('/admin/dishes_delete', filter.authorize, dishes.delete);
//活动管理
router.get('/admin/posts/albums', filter.authorize, columns.loadStatusAll,postsalbums.postsalbums_list);
router.post('/admin/posts/set_postsalbums', filter.authorize ,postsalbums.set_postsalbums);
router.post('/admin/posts/open_air', filter.authorize ,postsalbums.open_air);
router.post('/admin/posts/set_air', filter.authorize ,postsalbums.set_air);
router.post('/admin/posts/set_host', filter.authorize ,postsalbums.set_host);
router.post('/admin/posts/del_host', filter.authorize ,postsalbums.del_host);
router.get('/admin/albums/host_ajax_list', filter.authorize ,postsalbums.host_ajax_list);
router.post('/admin/albums/ajax_list', filter.authorize, postsalbums.postsalbums_ajax_list);
router.post('/admin/albums/update', filter.authorize, postsalbums.postsalbums_update);
router.get('/admin/albums/excel', filter.authorize, postsalbums.excel);
router.get('/admin/albums/reg_excel', filter.authorize, postsalbums.reg_excel);
router.post('/admin/albums/set_associated', filter.authorize, postsalbums.set_associated);
router.post('/admin/albums/del_associated', filter.authorize, postsalbums.del_associated);
router.get('/admin/albums/get_associated', filter.authorize, postsalbums.get_associated);
router.post('/admin/albums/set_regtemplate', filter.authorize, postsalbums.set_regtemplate);
router.get('/admin/albums/get_regtemplate', filter.authorize, postsalbums.get_regtemplate);
router.get('/admin/albums/get_registration', filter.authorize, postsalbums.get_registration);
router.get('/admin/albums/get_regnotice', filter.authorize, postsalbums.get_regnotice);
//二手房管理
router.get('/admin/houses', filter.authorize, houses.list);
router.get('/admin/houses_ajax_get_list', filter.authorize, houses.ajax_get_list);
router.post('/admin/houses_remove', filter.authorize, houses.remove);
router.get('/admin/regions', filter.authorize, regions.list);
router.get('/admin/regions_add', filter.authorize,regions.loadAll, regions.add);
router.post('/admin/regions_create', filter.authorize, regions.create);
router.get('/admin/regions_edit', filter.authorize,regions.loadAll, regions.edit);
router.post('/admin/regions_update', filter.authorize, regions.update);
router.get('/admin/regions_remove', filter.authorize, regions.remove);
//菜单管理
router.get('/admin/menus', filter.authorize, menus.list);
router.get('/admin/set_test', filter.authorize, function(req, res) {
	res.render('admin/set_test', {
		title: "测试评论点暂"
	})
});
router.get('/admin/get_token', filter.authorize, function(req, res) {
  res.render('index', {
    title: "秦皇岛获取token"
  })
});
//微直播管理
router.get('/admin/lives/columns/list', filter.authorize, lives.columns.list);
router.get('/admin/lives/columns/ajax_list', filter.authorize, lives.columns.ajax_list);
router.post('/admin/lives/columns/update', filter.authorize, lives.columns.update);
router.get('/admin/lives/columns/list_add', filter.authorize, lives.columns.add_page);
router.post('/admin/lives/columns/add_submit', filter.authorize, lives.columns.column_submit);
router.post('/admin/lives/columns/delete', filter.authorize, lives.columns.column_delete);
router.get('/admin/lives/columns/list_edit', filter.authorize, lives.columns.edit_page);

router.get('/admin/lives/live', filter.authorize, lives.columns.loadAll, lives.live.list);
router.get('/admin/lives/director', filter.authorize, lives.director.list);
router.post('/admin/lives/director_message', filter.authorize, lives.director.message);
router.get('/admin/lives/director_message_list', filter.authorize, lives.director.message_list);
router.get('/admin/lives/ajax_director', filter.authorize, lives.director.ajax_list);
router.get('/admin/lives/director/detail', filter.authorize, lives.All,lives.director.detail);
router.get('/admin/lives/director/director_live_list', filter.authorize, lives.All,lives.director.director_live_list);
router.post('/admin/lives/director/director_update_url', filter.authorize, lives.All,lives.director.update_url);
router.post('/admin/lives/director/director_update_suburl', filter.authorize, lives.All,lives.director.update_suburl);
router.post('/admin/lives/director/director_update', filter.authorize, lives.All,lives.director.update);
router.post('/admin/lives/live/ajax_list', filter.authorize, lives.live.ajax_list);
router.post('/admin/lives/live/ajax_posts_list', filter.authorize, lives.live.ajax_posts_list);
router.get('/admin/lives/live/monitor', filter.authorize, lives.live.monitor);
router.post('/admin/lives/live/chat_messages', filter.authorize, lives.live.chat_messages);
router.get('/admin/lives/live/detail', filter.authorize, lives.All , lives.live.detail);
router.post('/admin/lives/live/update', filter.authorize, lives.live.update);
router.post('/admin/lives/live/delete', filter.authorize, lives.live.delete);
router.get('/admin/lives/vod', filter.authorize, lives.columns.loadAll, lives.vod.list);
router.post('/admin/lives/vod/ajax_list', filter.authorize, lives.vod.ajax_list);
router.get('/admin/lives/vod_add', filter.authorize, lives.columns.loadAll,lives.vod.add);
router.post('/admin/lives/vod/save', filter.authorize, lives.columns.loadAll, lives.vod.save);
router.get('/admin/lives/vod/detail', filter.authorize, lives.All,lives.vod.detail);
router.post('/admin/lives/vod/update', filter.authorize, lives.vod.update);
router.post('/admin/lives/vod/delete', filter.authorize, lives.vod.delete);
router.get('/admin/lives/users/list',filter.authorize,lives.users.list);
router.get('/admin/lives/users/ajax_list',filter.authorize,lives.users.ajax_list);
router.get('/admin/lives/users/list_addAuthPage',filter.authorize,lives.users.addAuthPage);
router.get('/admin/lives/users/list/:id',filter.authorize,lives.users.authPage);
router.post('/admin/lives/users/auth',filter.authorize,lives.users.auth);
router.get('/admin/lives/users/cancleauth',filter.authorize,lives.users.cancleauth);
router.get('/admin/lives/publish/list',filter.authorize,lives.publish.list);
router.post('/admin/lives/publish/ajax_list',filter.authorize,lives.publish.publish_ajax_list);
router.get('/admin/lives/publish/list/:id',filter.authorize,lives.publish.view_page);
router.get('/admin/lives/publish/list_pass/:id',filter.authorize,lives.publish.pass_page);
router.get('/admin/lives/publish/list_reject/:id',filter.authorize,lives.publish.reject_page);
router.post('/admin/lives/publish/list_pass_submit',filter.authorize,lives.publish.pass_submit);
router.post('/admin/lives/publish/list_reject_submit',filter.authorize,lives.publish.reject_submit);

router.get('/admin/lives/message/list', filter.authorize, messages.message.list);
router.post('/admin/lives/message/ajax_list', filter.authorize, messages.message.ajax_list);
router.get('/admin/lives/message/list_send_page', filter.authorize, columns.loadAll, messages.message.loadGroup, messages.message.send_page);
router.post('/admin/lives/message/list_send', filter.authorize, messages.message.loadGroupUser, messages.message.send_message);

router.get('/admin/lives/setting', filter.authorize, lives.setting.loadAll, lives.setting.set_page);
router.post('/admin/lives/setting/update', filter.authorize, lives.setting.update_setting);

router.get('/admin/lives/trailer', filter.authorize, lives.columns.loadAll, lives.trailer.list);
router.post('/admin/lives/trailer/ajax_list', filter.authorize, lives.columns.loadAll, lives.trailer.ajax_list);
router.get('/admin/lives/trailer/add', filter.authorize, lives.columns.loadAll, lives.All, lives.trailer.list_add);
router.post('/admin/lives/trailer/save', filter.authorize, lives.columns.loadAll, lives.trailer.save);
router.post('/admin/trailer/delete', filter.authorize, lives.columns.loadAll, lives.trailer.delete);
router.get('/admin/lives/trailer/edit', filter.authorize, lives.columns.loadAll,lives.All,lives.trailer.edit);
router.get('/admin/lives/signs', filter.authorize, lives.signs.list);
router.get('/admin/lives/signs/ajax_list', filter.authorize, lives.signs.ajax_list);
router.get('/admin/lives/statistics', filter.authorize, lives.statistics);

router.get('/admin/usergroup/list', filter.authorize, usergroups.usergroup.list);
router.get('/admin/usergroup/list_ajax', filter.authorize, usergroups.usergroup.list_ajax);
router.post('/admin/usergroup/list_delete', filter.authorize, usergroups.usergroup.delete_group);
router.post('/admin/usergroup/list_user_delete', filter.authorize, usergroups.usergroup.delete_user);
router.post('/admin/usergroup/list_add', filter.authorize, usergroups.usergroup.addOrUpdateGroup);
router.post('/admin/usergroup/list_never_set', filter.authorize, usergroups.usergroup.loadUserByGroupId, usergroups.usergroup.ajaxNeverSetUser);
router.get('/admin/usergroup/list_child/:id', filter.authorize, usergroups.usergroup.loadUserByGroupId, usergroups.usergroup.list_child);
router.post('/admin/usergroup/add_child', filter.authorize, usergroups.usergroup.addChild);
//统计
router.get('/admin/posts/statistics/list', filter.authorize, statistics.list);
router.get('/admin/statistics/ajax_list', filter.authorize, statistics.ajax_list);
router.get('/admin/lives/live/statistics/list', filter.authorize, statistics.list);
router.get('/admin/lives/vod/statistics/list', filter.authorize, statistics.list);
router.get('/admin/lives/statistics/ajax_list', filter.authorize, statistics.ajax_list);
router.get('/admin/daily_browsing', filter.authorize, statistics.daily_browsing);
router.get('/admin/daily_browsing_ajax', filter.authorize, statistics.daily_browsing_ajax);

//广播
router.get('/admin/lives/broadcasts', filter.authorize, broadcasts.get_broadcasts);
router.get('/admin/lives/broadcasts/add', filter.authorize, broadcasts.add);
router.get('/admin/lives/broadcasts/edit', filter.authorize, broadcasts.edit);
router.post('/admin/lives/broadcasts/save', filter.authorize, broadcasts.save);
router.post('/admin/lives/broadcasts/delete', filter.authorize, broadcasts.delete);
router.get('/admin/lives/broadcasts/programs', filter.authorize, broadcasts.programs.list);
router.post('/admin/lives/broadcasts/programs/delete', filter.authorize, broadcasts.programs.delete);
router.post('/admin/lives/broadcasts/programs/import', filter.authorize, broadcasts.programs.import);
router.get('/admin/regs', filter.authorize, columns.regs_list);

//彩票
router.get('/admin/awards', filter.authorize, columns.awards_list);
router.post('/admin/awards_ajax', filter.authorize, columns.awards_list_ajax);
//推送
router.get('/admin/medialist', filter.authorize, cloud.media_list);
router.get('/admin/microlist', filter.authorize, cloud.micro_list);
router.get('/admin/media_ajax', filter.authorize, cloud.media_ajax_list);
router.get('/admin/micro_ajax', filter.authorize, cloud.micro_ajax_list);
router.post('/admin/postspush', filter.authorize, cloud.postspush_ajax);
router.post('/admin/livespush', filter.authorize, cloud.livespush_ajax);
router.post('/admin/livesunpush', filter.authorize, cloud.livesunpush_ajax);
router.post('/admin/postsunpush', filter.authorize, cloud.postsunpush_ajax);
router.get('/admin/cloud_list', filter.authorize, cloud.get_cloud_list);
router.post('/admin/cloudup', filter.authorize, cloud.cloud_up);

//统计查询
router.get('/admin/statistics/columns', filter.authorize, statistics.columns);
//kindeditor 上传专用
router.post("/uploadImg", filter.authorize,function (req, res, next) {
    var date = new Date();
    //debugger;
    var dir = './public/upload/' + moment().format("YYYY-MM-DD");
    //debugger;
    if (fs.existsSync(dir)) {
        console.log('已经创建过此目录了');
    } else {
        fs.mkdirSync(dir);
        console.log('目录已创建成功\n');
    }
    var form = new multiparty.Form({
        uploadDir: dir
    });

    form.parse(req, function (err, fields, files) {
        var filesTmp = JSON.stringify(files, null, 2);
        if (err) {
            console.log('parse error: ' + err);
        } else {
            var img = files.imgFile[0];
            var paths = img.path.replace(/public/ig,'');
            paths = paths.replace(/\\/g, '/');
            var info = {
                "error": 0,
                "url": paths
            };
            console.log(info);
            res.setHeader('Content-Type', "text/html; charset = utf-8");
            res.send(info);
        }
    });
});
//附件视频上传
router.post('/upload', filter.authorize, function(req, res) {
    formidable = require('formidable');
    // parse a file upload
    var form = new formidable.IncomingForm(),
        files = [],
        fields = [],
        docs = [];
    var date = new Date();
    //存放目录
    var dir = moment().format("YYYY-MM-DD");
    form.uploadDir = './public/upload/'+dir;
    form.keepExtensions = true;
    form.maxFieldsSize = 50 * 1024 * 1024;// 最大申请到50m内存
    if (fs.existsSync(form.uploadDir )) {
      console.log('已经创建过此目录了');
    } else {
      fs.mkdirSync(form.uploadDir );
      console.log('目录已创建成功\n');
    }
    form.on('field', function (field, value) {
      fields.push([field, value]);
    }).on('file', function (field, file) {
      files.push([field, file]);
      docs.push(file);
      file.path = path.join('/upload', dir, path.basename(file.path));
      file.path = file.path.replace(/\\/ig, '/');
    }).on('end', function() {
      res.writeHead(200, {
          'content-type': 'text/plain'
      });
      var out = {
          Resopnse: {
              'result-code': 0,
              timeStamp: new Date(),
          },
          files: docs
      };
      var sout = JSON.stringify(out);
      res.end(sout);
    });
    form.parse(req, function (err, fields, files) {
        docs.forEach(function (node,index){
          node.columnid=fields.columnid;
          docs[index]=node;
        });
        attachs.add(req,docs);
    });
});

module.exports = router;