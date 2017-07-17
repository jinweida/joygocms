var V='v1.2';
var express = require('express');
var filter = require('../../lib/filter');
var lives = require('../../api/'+V+'/livesController');
var statistics = require('./statisticsController');

var router = express.Router();
router.get('/'+V+'/api/lives/get_home',lives.get_home);
router.get('/'+V+'/api/lives/get_lives',lives.get_lives);
router.get('/'+V+'/api/lives/get_lives_histories',lives.get_lives_histories);
router.get('/'+V+'/api/lives/get_trailer_near',lives.get_trailer_near);
router.get('/'+V+'/api/lives/get_detail',statistics.set,lives.get_detail);
router.get('/'+V+'/api/lives/get_columns',lives.get_columns);
router.get('/'+V+'/api/lives/get_users',lives.get_users);
router.get('/'+V+'/api/lives/get_lives_status',lives.get_lives_status);

router.post('/'+V+'/api/lives/set_users',filter.authcookie,lives.set_users);
router.post('/'+V+'/api/lives/set_lives',filter.authcookie,lives.set_lives);
router.post('/'+V+'/api/lives/set_lives_attachs',filter.authcookie,lives.set_lives_attachs);
//直播点赞
router.post('/'+V+'/api/lives/set_lives_assist',filter.authcookie,lives.set_lives_assist);
router.post('/'+V+'/api/lives/set_vod',filter.authcookie,lives.set_vod);
router.post('/'+V+'/api/lives/set_lives_notice',filter.authcookie,lives.set_lives_notice);
router.post('/'+V+'/api/lives/set_lives_histories',filter.authcookie,lives.set_lives_histories);
router.post('/'+V+'/api/lives/set_signs',filter.authcookie,lives.set_signs);
router.post('/'+V+'/api/lives/set_lives_destroy',filter.authcookie,lives.set_lives_destroy);
router.post('/'+V+'/api/lives/set_ois_destroy',lives.set_ois_destroy);//ois 不需要cookie
//广播
router.get('/'+V+'/api/get_broadcasts',lives.get_broadcasts);
router.get('/'+V+'/api/get_broadprograms',lives.get_broadprograms);
router.get('/'+V+'/api/get_utc_time',lives.get_utc_time);
router.get('/'+V+'/api/get_broadcasts_detail',lives.get_broadcasts_detail);
router.post('/'+V+'/api/set_broadcasts_assist',lives.set_broadcasts_assist);


module.exports = router;