var V='v1';
var apis = require('../../api/v1/apisController');
var apis_home = require('../../api/v1/homesController');
var cds = require('../../api/v1/cdsController');
var ios = require('../../api/v1/iosController');
var homes = require('../../api/v1/homesController');
var express = require('express');
var filter = require('../../lib/filter');
var router = express.Router();
//获取APP首页 判断是否ios上架
router.get('/api/get_home', ios.up,apis_home.get_home);
//获取APP首页 ios
router.get('/api/get_ios_home',ios.up, apis_home.get_ios_home);
//获取APP首页 android
router.get('/api/get_android_home', apis_home.get_android_home);
//获取菜单 判断是否ios上架
router.get('/api/get_menu', ios.up, apis_home.get_menu);
//获取启动图片
router.get('/api/get_start_pics', apis_home.get_start_pics);
//获取系统参数项 判断是否ios上架
router.get('/api/get_system_config', ios.up, apis_home.get_system_config);
//获取个人中心及商城的链接地址 判断是否ios上架
router.get('/api/get_init_config', ios.up, apis_home.get_init_config);

//***************************cms api接口*****************************************
router.get('/api/get_medias', apis.get_medias_list);
router.get('/api/get_specials', apis.get_specials_list);
router.get('/api/get_detail', apis.get_detail);
//获取分类列表
router.get('/api/get_columns' , apis.get_columns_list);
//获取城市
router.get('/api/get_areas', apis.get_areas_list);
//获取行业
router.get('/api/get_hangyes', apis.get_hangyes_list);
//获取评论
router.get('/api/get_comments', apis.get_comments_list);
//获取分类下的幻灯片，最多显示5个
router.get('/api/get_slides', apis.get_slides_list);
//获取评论
router.get('/api/get_favorites', apis.get_favorites);
//获取绩效
router.get('/api/get_kpis', apis.get_kpis);
//获取福币规则
router.get('/api/get_coins', apis.get_coins);
//获取我的上传
router.get('/api/get_myuploads', apis.get_myuploads);
//获取我的上传明细
router.get('/api/get_myuploads_detail', apis.get_myuploads_detail);
router.get('/api/get_ad', apis.get_ad);
//获取机关黄页
router.get('/api/get_organ_yellow', apis.get_organ_yellow);
router.get('/api/get_sign_status', apis.get_sign_status);
//技师评分
router.get('/api/get_scores', apis.get_scores);
router.get('/api/get_dishes', apis.get_dishes);
router.get('/api/get_votes', apis.get_votes);
//***************************cms api接口*****************************************

//***************************写入*****************************************
//评论
router.post('/api/set_comments', filter.authcookie, apis.set_comments);
//评论点赞
router.post('/api/set_assist', filter.authcookie, apis.set_assist);
//媒资点赞
router.post('/api/set_posts_assist', filter.authcookie, apis.set_posts_assist);
//要验证用户
router.post('/api/set_posts', filter.authcookie, apis.set_posts);
router.post('/api/set_upload', filter.authcookie, apis.set_upload);
//手机上传
router.post('/api/set_attachs', filter.authcookie,apis.set_attachs);
//添加评论
router.post('/api/set_favorites', filter.authcookie, apis.set_favorites);
router.post('/api/delete_favorites', filter.authcookie, apis.delete_favorites);
//活动报名
router.post('/api/set_activitys',filter.authcookie,  apis.set_activitys);
//取消活动报名
router.post('/api/set_activitys_cancel',filter.authcookie, apis.set_activitys_cancel);
//获取活动报名状态
router.get('/api/get_activitys_status', apis.get_activitys_status);
//技师评分
router.post('/api/set_scores', filter.authcookie, apis.set_scores);
router.post('/api/set_coin',filter.authcookie, apis.set_coin);
//提交反馈
router.post('/api/set_feedback',filter.authcookie,apis.set_feedback);
//投票
router.post('/api/set_votes',filter.authcookie,apis.set_votes);
//获取绩效
//***************************写入*****************************************
//测试post

//***************************cds api接口*****************************************
//导入cds xml文档
router.post('/cds/set_posts', cds.set_posts);
router.post('/cds/set_upload', apis.set_upload);
module.exports = router;