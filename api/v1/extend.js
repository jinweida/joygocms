var V='v1';
var express = require('express');
var filter = require('../../lib/filter');
var ext = require('./extendsController');

var router = express.Router();
//获取房产信息
router.get('/api/get_houses',ext.get_houses);
//获取房产明细
router.get('/api/get_houses_detail',ext.get_houses_detail);
//获取区域信息
router.get('/api/get_houses_regions',ext.get_houses_regions);
//获取价格区间
router.get('/api/get_houses_config',ext.get_houses_config);
//发布房产信息
router.post('/api/set_houses',ext.set_houses)
router.get('/api/get_posts_albums',ext.get_posts_albums);
//报名培训
router.post('/api/set_regs',ext.set_regs);
//主播秀
router.get('/api/get_anchors',ext.get_anchors);
//主播秀详情
router.get('/api/get_anchors_detail',ext.get_anchors_detail);
//获取提问|获取我的提问|获取向我提问的
router.get('/api/get_questions',ext.get_questions);
router.get('/api/get_questions_detail',ext.get_questions_detail);
//写入提问
router.post('/api/set_questions',ext.set_questions);
//获取回答
router.get('/api/get_answers',ext.get_answers);
//获取我的回答
router.get('/api/get_myanswerquestions',ext.get_myanswerquestions);
//写入回答
router.post('/api/set_answers',ext.set_answers);
//活动相册上传
router.post('/api/set_posts_albums',ext.set_posts_albums);
//活动相册点赞
router.post('/api/set_posts_albumns_assist',ext.set_posts_albumns_assist);
module.exports = router;