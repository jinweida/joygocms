var V='v1.4';
var apis = require('./apisController');
var apis_home = require('./homesController');
var audit = require('./auditController');
var cds = require('./cdsController');
var ios = require('./iosController');
var statistics = require('./statisticsController');
var homes = require('./homesController');
var express = require('express');
var filter = require('../../lib/filter');
var des = require('../../lib/des');
var router = express.Router();
//发现
router.get('/'+V+'/api/get_found',apis_home.get_found);
//服务
router.get('/'+V+'/api/get_service',apis_home.get_service);
//获取APP首页 ios
router.get('/'+V+'/api/get_ios_home',ios.up, apis_home.get_ios_home);
//获取APP首页 android
router.get('/'+V+'/api/get_android_home', apis_home.get_android_home);
//获取菜单 判断是否ios上架
router.get('/'+V+'/api/get_menu', ios.up, apis_home.get_menu);
router.get('/'+V+'/api/get_menu_bottom', ios.up, apis_home.get_menu_bottom);
//获取系统参数项 判断是否ios上架
router.get('/'+V+'/api/get_system_config', ios.up, apis_home.get_system_config);
//获取个人中心及商城的链接地址 判断是否ios上架
router.get('/'+V+'/api/get_init_config', ios.up, apis_home.get_init_config);
//获取个人中心及商城的链接地址 判断是否ios上架--add
router.get('/'+V+'/api/get_init_config_add', ios.up, apis_home.get_init_config_add);

//***************************cms api接口*****************************************
router.get('/'+V+'/api/get_medias', apis.get_medias);
router.get('/'+V+'/api/get_specials', apis.get_specials);
router.get('/'+V+'/api/get_specials_group', apis.get_specials_group);
router.get('/'+V+'/api/get_detail',statistics.set, apis.get_detail);
router.get('/'+V+'/api/get_detail_next',statistics.set, apis.get_detail_next);
router.get('/'+V+'/api/get_statistics',statistics.get_statistics);
//获取分类列表
router.get('/'+V+'/api/get_columns' , apis.get_columns_list);
//获取城市
router.get('/'+V+'/api/get_areas', apis.get_areas_list);
//获取行业
router.get('/'+V+'/api/get_hangyes', apis.get_hangyes_list);
//获取评论
router.get('/'+V+'/api/get_comments', apis.get_comments_list);
//获取分类下的幻灯片，最多显示5个
router.get('/'+V+'/api/get_slides', apis.get_slides_list);
//获取评论
router.get('/'+V+'/api/get_favorites', apis.get_favorites);
//获取绩效
router.get('/'+V+'/api/get_kpis', apis.get_kpis);
//获取福币规则
router.get('/'+V+'/api/get_coins', apis.get_coins);
//获取我的上传
router.get('/'+V+'/api/get_myuploads', apis.get_myuploads);
//获取我的上传明细
router.get('/'+V+'/api/get_myuploads_detail', apis.get_myuploads_detail);
router.post('/'+V+'/api/delete_myuploads', apis.delete_myuploads);

router.get('/'+V+'/api/get_ad', apis.get_ad);
//获取机关黄页
router.get('/'+V+'/api/get_organ_yellow', apis.get_organ_yellow);
router.get('/'+V+'/api/get_sign_status', apis.get_sign_status);
//技师评分
router.get('/'+V+'/api/get_scores', apis.get_scores);
router.get('/'+V+'/api/get_dishes', apis.get_dishes);
router.get('/'+V+'/api/get_votes', apis.get_votes);
//获取启动图片
router.get('/'+V+'/api/get_start_pics', apis.get_start_pics);
//***************************cms api接口*****************************************

//***************************写入*****************************************
//cookie验证
router.post('/'+V+'/api/authcookie', filter.authcookie , function(req,res){
	return res.send({code:1})
});
//评论
router.post('/'+V+'/api/set_comments', filter.authcookie, apis.set_comments);
//评论点赞
router.post('/'+V+'/api/set_assist', filter.authcookie, apis.set_assist);
//媒资点赞
router.post('/'+V+'/api/set_posts_assist', filter.authcookie, apis.set_posts_assist);
//要验证用户
router.post('/'+V+'/api/set_posts', filter.authcookie, apis.set_posts);
router.post('/'+V+'/api/set_upload', filter.authcookie, apis.set_upload);
//手机上传
router.post('/'+V+'/api/set_attachs', filter.authcookie,apis.set_attachs);
//添加评论
router.post('/'+V+'/api/set_favorites', filter.authcookie, apis.set_favorites);
router.post('/'+V+'/api/delete_favorites', filter.authcookie, apis.delete_favorites);
//活动报名
router.post('/'+V+'/api/set_activitys',filter.authcookie, apis.set_activitys);
//取消活动报名
router.post('/'+V+'/api/set_activitys_cancel',filter.authcookie, apis.set_activitys_cancel);
//获取活动报名状态
router.get('/'+V+'/api/get_activitys_status', apis.get_activitys_status);
//技师评分
router.post('/'+V+'/api/set_scores', filter.authcookie, apis.set_scores);
router.post('/'+V+'/api/set_coin',filter.authcookie,apis.set_coin);
//提交反馈
router.post('/'+V+'/api/set_feedback',filter.authcookie,apis.set_feedback);
router.get('/'+V+'/api/get_feedback',apis.get_feedback);
//投票
router.post('/'+V+'/api/set_votes',filter.authcookie,apis.set_votes);
router.get('/'+V+'/api/get_ios_neighbor',apis.get_ios_neighbor)
router.get('/'+V+'/api/get_android_neighbor',apis.get_android_neighbor);

//===============内容审核系统接口====================
router.post('/'+V+'/api/get_login',audit.get_login);
router.get('/'+V+'/api/get_article',audit.get_article);
router.get('/'+V+'/api/get_micro_live',audit.get_micro_live);
router.get('/'+V+'/api/get_audit_comments',audit.get_audit_comments);
router.get('/'+V+'/api/get_authentication',audit.get_authentication);
router.get('/'+V+'/api/get_active_list',audit.get_active_list);
router.get('/'+V+'/api/get_active_postsalbums',audit.get_active_postsalbums);
router.get('/'+V+'/api/get_news_broke',audit.get_news_broke);
router.post('/'+V+'/api/mobile_audit', des.token , audit.mobile_audit);

//====================================================

//获取绩效
//***************************写入*****************************************
//测试post

//***************************cds api接口*****************************************
//导入cds xml文档
router.post('/'+V+'/cds/set_posts', cds.set_posts);
router.post('/'+V+'/cds/set_upload', apis.set_upload);
module.exports = router;