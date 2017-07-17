var V='v1.5';
var express = require('express');
var filter = require('../../lib/filter');
var ext = require('../../api/'+V+'/extendsController');

var router = express.Router();
//获取房产信息
router.get('/'+V+'/api/get_houses',ext.get_houses);
//获取房产明细
router.get('/'+V+'/api/get_houses_detail',ext.get_houses_detail);
//获取区域信息
router.get('/'+V+'/api/get_houses_regions',ext.get_houses_regions);
//获取价格区间
router.get('/'+V+'/api/get_houses_config',ext.get_houses_config);
//报名培训
router.post('/'+V+'/api/set_regs',ext.set_regs);
//主播秀
router.get('/'+V+'/api/get_anchors',ext.get_anchors);
//主播秀详情
router.get('/'+V+'/api/get_anchors_detail',ext.get_anchors_detail);
//获取提问|获取我的提问|获取向我提问的
router.get('/'+V+'/api/get_questions',ext.get_questions);
router.get('/'+V+'/api/get_questions_detail',ext.get_questions_detail);
//获取回答
router.get('/'+V+'/api/get_answers',ext.get_answers);
//获取我的回答
router.get('/'+V+'/api/get_myanswerquestions',ext.get_myanswerquestions);
//获取主播动态
router.get('/'+V+'/api/get_anchors_dynamics',ext.get_anchors_dynamics);
router.get('/'+V+'/api/get_anchors_dynamics_detail',ext.get_anchors_dynamics_detail);
router.get('/'+V+'/api/get_posts_albums',ext.get_posts_albums);
router.get('/'+V+'/api/get_posts_normal_albums',ext.get_posts_normal_albums);
router.get('/'+V+'/api/get_posts_albums_isexist',ext.get_posts_albums_isexist);
router.get('/'+V+'/api/get_awards',ext.get_awards);

//发布房产信息
router.post('/'+V+'/api/set_houses',filter.authcookie,ext.set_houses)
//写入提问
router.post('/'+V+'/api/set_questions',filter.authcookie,ext.set_questions);
router.post('/'+V+'/api/set_anchors_dynamics',ext.set_anchors_dynamics);
//问吧提问
router.post('/'+V+'/api/set_new_questions',filter.authcookie,ext.set_new_questions);
//合作单位
router.post('/'+V+'/api/set_cooper',ext.set_cooper);
router.get('/'+V+'/api/get_cooper',ext.get_cooper);
router.get('/'+V+'/api/cooper_detail',ext.cooper_detail);
//写入回答
router.post('/'+V+'/api/set_answers',filter.authcookie,ext.set_answers);
//写入图片
router.post('/'+V+'/api/set_new_img',ext.set_new_img);
router.post('/'+V+'/api/set_new_video',ext.set_new_video);
//写入回答
router.post('/'+V+'/api/set_anchors_text',ext.set_anchors_text);
//写入回答
router.post('/'+V+'/api/set_anchors_img',ext.set_anchors_img);
//活动相册上传
router.post('/'+V+'/api/set_posts_albums',ext.set_posts_albums);
//活动相册点赞
router.post('/'+V+'/api/set_posts_albumns_assist',ext.set_posts_albumns_assist);
router.post('/'+V+'/api/set_awards',ext.set_awards);
//活动排行榜
router.post('/'+V+'/api/set_user_ranking',ext.set_user_ranking);
router.get('/'+V+'/api/get_ranking',ext.get_ranking);

router.get('/'+V+'/api/get_uptoken',ext.get_uptoken);
router.post('/'+V+'/api/set_qiniu_notify',ext.set_qiniu_notify);
router.post('/'+V+'/api/set_posts_video',ext.set_posts_video);

module.exports = router;