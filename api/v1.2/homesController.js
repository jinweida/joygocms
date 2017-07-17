var medias = require('../../proxy/medias');
var lives = require('../../proxy/lives');
var Ads = require('../../models/ads').ads;
var moment = require('moment');
var response = require('../../lib/response');
var comm = require('../../lib/comm');
var columns = require('../../models/columns').columns;
var appstatus = require('../../models/appstatus').appstatus;
var sysconfigs = require('../../models/sysconfigs').sysconfigs;
var config = require('../../config');
var url=require('url');
var cache = require('../../lib/cache');
var eventproxy = require('eventproxy');
exports.get_ios_home = function (req, res) {
    cache.get(config.session_secret+"_get_ios_home_1.2.0",function(err,get_home){
        if(get_home){
            return res.send(get_home);
        }else{
            var proxy = new eventproxy();
            var _shizheng_cid=100011;
            var _shehui_cid=1561;
            var _liaozhaiyehua_cid=4007;
			var _caijingxinshijie_cid=6100;
			var _miluzaifuzhou_cid=100023;
			var _jingdianmeichu_cid=100044;
			var _mashangjiuban_cid=5000;
			var _xinwenzhibo_cid=6100;
			var _xinwen_cid=4002;
			var _meichu_cid=10024;
            var events = ['shizheng', 'shehui', 'xinwenzhibo','mashangjiuban','qingyun','liaozhaiyehua','special','caijingxinshijie','miluzaifuzhou','investigation','jingdianmeichu','micro','area','shop','tv','microfilm','xinwen','meichu'];
            proxy.all(events, function (shizheng, shehui, xinwenzhibo,mashangjiuban,qingyun,liaozhaiyehua,special,caijingxinshijie,miluzaifuzhou,investigation,jingdianmeichu,micro,area,shop,tv,microfilm,xinwen,meichu) {
                var home = {
                    code: 1,
                    list: []
                };
				home.list.push(micro);
                home.list.push(shizheng);
				home.list.push(xinwenzhibo);
                home.list.push(shehui);
				home.list.push(mashangjiuban);
                home.list.push(microfilm);
                home.list.push(qingyun);
                home.list.push(liaozhaiyehua);
				home.list.push(xinwen);
				home.list.push(special);
				home.list.push(caijingxinshijie);
				home.list.push(miluzaifuzhou);
				home.list.push(investigation);
				home.list.push(jingdianmeichu);
				home.list.push(meichu);
                home.list.push(area);
                home.list.push(shop);
                home.list.push(tv);
                cache.set(config.session_secret+'_get_ios_home_1.2.0', home, config.redis.time);//设置缓存
                res.send(home);
            })
            req.query.pagesize = 8;
            var options = comm.api_get_page_options(req);
            var select = {
                content: 0, "commentstatus": 0, slides: 0,
                "status": 0, "password": 0,
            };
            //时政
            medias.getFullMeidas({ cid: _shizheng_cid}, select, options, proxy.done(function (models) {
                var _shizheng_menu = {
                    title: "福州头条",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 100011,
                        name:'福州头条',
                        listtype: 2,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 300,
                        icon: config.website + "/images/system/news.png",
                    },
                    list: get_form_medias(models)
                };
                proxy.emit('shizheng',_shizheng_menu);
            }));
			//特别直播室
			var _xinwenzhibo_menu = {
                title: "特别直播室",
                hometype: 4,//
                rowcount:1,//2,3,4,5 几行
                columncount:1,//2,3,4,5 几行
                menuitem: {},
                list: [{
                        name: "特别直播室",
                        pics: config.website + "/images/system/xinwenzhibo2.png",
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url:"http://fuzhou.cms.joygo.com/html5/page/news/video_detail.html?mid=561865d0a5f1f27a561e3ad4&cid=6100",
                        commentstatus: 1,
                        cid: 6100,
                        menutype: 300,
                        icon:config.website + "/images/system/xinwenzhibo2.png",
                        listtype: 3,
                    }
                ]
            };
			proxy.emit('xinwenzhibo', _xinwenzhibo_menu);
            //社会
            medias.getFullMeidas({ cid: _shehui_cid}, select, options, proxy.done(function (models) {
                var _shehui_menu = {
                    title: "社会热点",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 1561,
                        name:'社会热点',
                        listtype: 2,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 300,
                        icon: config.website + "/images/system/news.png",
                    },
                    list: get_form_medias(models)
                };
                proxy.emit('shehui',_shehui_menu );
            }));
			//马上就办
			var _mashangjiuban_menu = {
                title: "马上就办",
                hometype: 4,//
                rowcount:1,//2,3,4,5 几行
                columncount:1,//2,3,4,5 几行
                menuitem: {},
                list: [{
                        name: "马上就办",
                        pics: config.website + "/images/system/msjbnew.jpg",
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url:"",
                        commentstatus: 1,
                        cid: 5000,
                        menutype: 400,
                        icon:config.website + "/images/system/msjbnew.jpg",
                        listtype: 3,
                    }
                ]
            };
			proxy.emit('mashangjiuban', _mashangjiuban_menu);
            //青运来了
            medias.getFullMeidas({ cid: {$gt:8000,$lte:8004}}, select, options, proxy.done(function (models) {
                var _qingyun_menu = {
                    title: "青运来了",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 8000,
                        name:'青运来了',
                        listtype: 2,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 400,
                        icon: config.website + "/images/system/news.png",
                    },
                    list: get_form_medias(models)
                };
                proxy.emit('qingyun', _qingyun_menu);
            }));
            //聊斋夜话
            medias.getFullMeidas({ cid: _liaozhaiyehua_cid}, select, options, proxy.done(function (models) {
                var _liaozhaiyehua_menu = {
                    title: "聊斋夜话",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 4000,
                        name:'聊斋夜话',
                        listtype: 2,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 400,
                        icon: config.website + "/images/system/news.png",
                    },
                    list: get_form_medias(models)
                };
                proxy.emit('liaozhaiyehua', _liaozhaiyehua_menu);
            }));
			//新闻110
            medias.getFullMeidas({ cid: _xinwen_cid}, select, options, proxy.done(function (models) {
                var _xinwen_menu = {
                    title: "新闻110",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 4002,
                        name:'新闻110',
                        listtype: 2,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 300,
                        icon: config.website + "/images/system/news.png",
                    },
                    list: get_form_medias(models)
                };
                proxy.emit('xinwen',_xinwen_menu);
            }));
			 var _special_menu = {
                title: "特别专题",
                hometype: 4,//
                rowcount:1,//2,3,4,5 几行
                columncount:1,//2,3,4,5 几行
                menuitem: {},
                list: [{
                        name: "特别专题",
                        pics: config.website + "/images/system/zhuanti1.jpg",
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: "",
                        commentstatus: 1,
                        cid: 1225002,
                        menutype: 300,
                        icon:config.website + "/images/system/zhuanti1.jpg",
                        listtype: 5,
                    }
                ]
            };
            proxy.emit('special', _special_menu);
			//财经新视界
			medias.getFullMeidas({ cid: _caijingxinshijie_cid}, select, options, proxy.done(function (models) {
                var _caijingxinshijie_menu = {
                    title: "财经新视界",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 6100,
                        name:'财经新视界',
                        listtype: 2,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 400,
                        icon: config.website + "/images/system/news.png",
                    },
                    list: get_form_medias(models)
                };
                proxy.emit('caijingxinshijie', _caijingxinshijie_menu);
            }));
			//旅途
			medias.getFullMeidas({ cid: _miluzaifuzhou_cid}, select, options, proxy.done(function (models) {
                var _miluzaifuzhou_menu = {
                    title: "旅途",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 100023,
                        name:'旅途',
                        listtype: 2,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 300,
                        icon: config.website + "/images/system/news.png",
                    },
                    list: get_form_medias(models)
                };
                proxy.emit('miluzaifuzhou', _miluzaifuzhou_menu);
            }));
			//微调查
			var _investigation_menu = {
                title: "微调查",
                hometype: 4,//
                rowcount:1,//2,3,4,5 几行
                columncount:1,//2,3,4,5 几行
                menuitem: {},
                list: [{
                        name: "微调查",
                        pics: config.website + "/images/system/weidiaocha.jpg",
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: "",
                        commentstatus: 1,
                        cid: 13000,
                        menutype: 300,
                        icon:config.website + "/images/system/weidiaocha.jpg",
                        listtype: 1,
                    }
                ]
            };
            proxy.emit('investigation', _investigation_menu);
			//玩主天地
			medias.getFullMeidas({ cid: _jingdianmeichu_cid}, select, options, proxy.done(function (models) {
                var _jingdianmeichu_menu = {
                    title: "玩主天地",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 100044,
                        name:'玩主天地',
                        listtype: 2,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 300,
                        icon: config.website + "/images/system/news.png",
                    },
                    list: get_form_medias(models)
                };
                proxy.emit('jingdianmeichu', _jingdianmeichu_menu);
            }));
			//经典美厨
            medias.getFullMeidas({ cid: _meichu_cid}, select, options, proxy.done(function (models) {
                var _meichu_menu = {
                    title: "经典美厨",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 10024,
                        name:'经典美厨',
                        listtype: 2,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 300,
                        icon: config.website + "/images/system/news.png",
                    },
                    list: get_form_medias(models)
                };
                proxy.emit('meichu',_meichu_menu);
            }));
            //微直播 lives 不包含预告的
            lives.getFullLives({type:{$ne:2},status:{$gt:0}},{__v:0,reject:0,location:0,createtime:0,starttime:0}, options, proxy.done(function (models) {
                var _lives_menu = {
                    title: "直播福州",
                    hometype: 7,//微直播 hometype=7
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 4000,
                        name:'直播福州',
                        listtype: 6,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 12,
                        icon: config.website + "/images/system/news.png",
                    },
                    list: get_from_lives(models)
                };
                proxy.emit('micro', _lives_menu);
            }));
            Ads.find()
            .populate('menuitem','name upstatus pid position url commentstatus cid menutype pics icon listtype')
            .populate('mediaitem','title mid author members price pics score address tel type assistcount clickcount commentcount createtime source video desc cid')
            .sort('order').where({adposition:20001}).select({title:1,adimg:1,adurl:1,menuitem:1,mediaitem:1,adtype:1,_id:0}).limit(req.query.pagesize)
            .exec(proxy.done(function(models){
                var _microfilm_menu={
                    title: "微电影",
                    hometype:8,//微电影 hometype是8
                    rowcount:2,//2,3,4,5 几行
                    columncount:4,//2,3,4,5 几行
                    menuitem: {
                        pid: 0,
                        cid: 10045,
                        name:'微电影',
                        listtype: 2,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 300,
                        icon: config.website + "/images/system/news.png"
                    },
                    list:get_from_ads(models)
                }
                proxy.emit('microfilm', _microfilm_menu);
            }));

            var _area_menu={
                title: "本地服务",
                hometype:3,//
                rowcount:2,//2,3,4,5 几行
                columncount:4,//2,3,4,5 几行
                menuitem: {},
                list: [
                    {
                        name: "主播专区",
                        pics: config.website + "/images/system/icon_zhengwu.png",
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: "",
                        commentstatus: 1,
                        cid:12000,
                        menutype: 400,
                        icon:config.website + "/images/system/icon_zhengwu.png",
                        listtype: 3,
                    },
                    {
                        name: "12345",
                        pics: config.website + "/images/system/icon_qiche.png",
                        icon: '',
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: "http://wap.fz12345.gov.cn",
                        commentstatus: 1,
                        cid: 11000005,
                        menutype: 300,
                        icon:config.website + "/images/system/icon_qiche.png",
                        listtype: 3,
                    },
                    {
                        name: "新闻报料",
                        pics: config.website + "/images/system/icon_lvyou.png",
                        icon: '',
                        upstatus: 1,
                        adstatus: 0,
                        pid: 0,
                        url: "",
                        commentstatus: 1,
                        cid: 7000,
                        menutype: 300,
                        icon:config.website + "/images/system/icon_lvyou.png",
                        listtype: 1
                    },
                    {
                        name: "福币商城",
                        pics: config.website + "/images/system/icon_meishi.png",
                        icon: '',
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: config.shopsite+"/m/home/indexcoin",
                        commentstatus: 1,
                        cid: 5001,
                        menutype: 700,
                        icon:config.website + "/images/system/icon_meishi.png",
                        listtype: 3
                    },
                    {
                        name: "车市界",
                        pics: config.website + "/images/system/icon_fangchan.png",
                        icon: '',
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: "",
                        commentstatus: 1,
                        cid: 6000,
                        menutype: 400,
                        icon:config.website + "/images/system/icon_fangchan.png",
                        listtype: 1
                    },
                    {
                        name: "美食街",
                        pics: config.website + "/images/system/icon_yingshi.png",
                        icon: '',
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: config.website+"/html5/page/foodmall/foodsquare.html",
                        commentstatus: 1,
                        cid: 7001,
                        menutype: 300,
                        icon:config.website + "/images/system/icon_yingshi.png",
                        listtype: 3
                    },
                    {
                        name: "快递查询",
                        pics: config.website + "/images/system/icon_shenghuo.png",
                        icon: '',
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: "http://m.kuaidi100.com/index_all.html",
                        commentstatus: 1,
                        cid: 110001,
                        menutype: 300,
                        icon:config.website + "/images/system/icon_shenghuo.png",
                        listtype: 3
                    },
                    {
                        name: "违章查询",
                        pics: config.website + "/images/system/icon_paike.png",
                        icon: '',
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: "http://m.weizhangwang.com/",
                        commentstatus: 1,
                        cid: 12131313,
                        menutype: 300,
                        icon:config.website + "/images/system/icon_paike.png",
                        listtype: 3
                    }
                ]
            };
            proxy.emit('area', _area_menu);
            var _shop_menu = {
                title: "商城",
                hometype: 4,//
                rowcount:1,//2,3,4,5 几行
                columncount:1,//2,3,4,5 几行
                menuitem: {},
                list: [{
                        name: "商城",
                        pics: config.website + "/images/system/shop.jpg",
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: config.shopsite+"/m",
                        commentstatus: 1,
                        cid: 30,
                        menutype: 700,
                        icon:config.website + "/images/system/shop.jpg",
                        listtype: 3,
                    }
                ]
            };
            proxy.emit('shop', _shop_menu);
            var _tv_menu = {
                title: "微电视",
                hometype: 5,
                columncount:3,
                rowcount:2,//2,3,4,5 几行
                menuitem: {},
                list: [{
                        name: "电视直播",
                        pics: config.website + "/images/system/icon_home_tv.png",
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: "",
                        commentstatus: 1,
                        cid: 2000,
                        menutype: 100,
                        icon:config.website + "/images/system/icon_home_tv.png",
                        listtype: 3,
                    },{
                        name: "栏目点播",
                        pics: config.website + "/images/system/icon_home_columns.png",
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: "",
                        commentstatus: 1,
                        cid: 4000,
                        menutype: 400,
                        icon:config.website + "/images/system/icon_home_columns.png",
                        listtype: 3,
                    },{
                        name: "云端影视",
                        pics: config.website + "/images/system/icon_home_movie.png",
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: "",
                        commentstatus: 1,
                        cid: 3000,
                        menutype: 200,
                        icon:config.website + "/images/system/icon_home_movie.png",
                        listtype: 3,
                    }]
            };
            proxy.emit('tv', _tv_menu);
        }
    });
}
exports.get_android_home=function(req,res){
    cache.get(config.session_secret+"_get_android_home_1.2.0",function(err,get_home){
        if(get_home){
            return res.send(get_home);
        }else{
            var proxy = new eventproxy();
            var _shizheng_cid=100011;
            var _shehui_cid=1561;
            var _liaozhaiyehua_cid=4007;
			var _caijingxinshijie_cid=6100;
			var _miluzaifuzhou_cid=100023;
			var _jingdianmeichu_cid=100044;
			var _mashangjiuban_cid=5000;
			var _xinwenzhibo_cid=6100;
			var _xinwen_cid=4002;
			var _meichu_cid=10024;
            var events = ['shizheng', 'shehui','xinwenzhibo','mashangjiuban', 'qingyun','liaozhaiyehua','special','caijingxinshijie','miluzaifuzhou','investigation','jingdianmeichu','micro','area','shop','tv','microfilm','xinwen','meichu'];
            proxy.all(events, function (shizheng, shehui,xinwenzhibo, mashangjiuban,qingyun,liaozhaiyehua,special,caijingxinshijie,miluzaifuzhou,investigation,jingdianmeichu,micro,area,shop,tv,microfilm,xinwen,meichu) {
                var home = {
                    code: 1,
                    list: []
                };
				home.list.push(micro);
                home.list.push(shizheng);
				home.list.push(xinwenzhibo);
                home.list.push(shehui);
				home.list.push(mashangjiuban);
                home.list.push(microfilm);
                home.list.push(qingyun);
                home.list.push(liaozhaiyehua);
				home.list.push(xinwen);
				home.list.push(special);
				home.list.push(caijingxinshijie);
				home.list.push(miluzaifuzhou);
				home.list.push(investigation);
				home.list.push(jingdianmeichu);
				home.list.push(meichu);
                home.list.push(area);
                home.list.push(shop);
                home.list.push(tv);
                cache.set(config.session_secret+'_get_android_home_1.2.0', home, config.redis.time);//设置缓存
                res.send(home);
            })
            req.query.pagesize = 8;
            var options = comm.api_get_page_options(req);
            var select = {
                content: 0, "commentstatus": 0, slides: 0,
                "status": 0, "password": 0,
            };
            //时政
            medias.getFullMeidas({ cid: _shizheng_cid}, select, options, proxy.done(function (models) {
                var _shizheng_menu = {
                    title: "福州头条",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 100011,
                        name:'福州头条',
                        listtype: 2,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 300,
                        icon: config.website + "/images/system/news.png",
                    },
                    list: get_form_medias(models)
                };
                proxy.emit('shizheng',_shizheng_menu);
            }));
			//特别直播室
			var _xinwenzhibo_menu = {
                title: "特别直播室",
                hometype: 4,//
                rowcount:1,//2,3,4,5 几行
                columncount:1,//2,3,4,5 几行
                menuitem: {},
                list: [{
                        name: "特别直播室",
                        pics: config.website + "/images/system/xinwenzhibo2.png",
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url:"http://fuzhou.cms.joygo.com/html5/page/news/video_detail.html?mid=561865d0a5f1f27a561e3ad4&cid=6100",
                        commentstatus: 1,
                        cid: 6100,
                        menutype: 300,
                        icon:config.website + "/images/system/xinwenzhibo2.png",
                        listtype: 3,
                    }
                ]
            };
			proxy.emit('xinwenzhibo', _xinwenzhibo_menu);
            //社会
            medias.getFullMeidas({ cid: _shehui_cid}, select, options, proxy.done(function (models) {
                var _shehui_menu = {
                    title: "社会热点",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 1561,
                        name:'社会热点',
                        listtype: 2,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 300,
                        icon: config.website + "/images/system/news.png",
                    },
                    list: get_form_medias(models)
                };
                proxy.emit('shehui',_shehui_menu );
            }));
			//马上就办
			var _mashangjiuban_menu = {
                title: "马上就办",
                hometype: 4,//
                rowcount:1,//2,3,4,5 几行
                columncount:1,//2,3,4,5 几行
                menuitem: {},
                list: [{
                        name: "马上就办",
                        pics: config.website + "/images/system/msjbnew.jpg",
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url:"",
                        commentstatus: 1,
                        cid: 5000,
                        menutype: 400,
                        icon:config.website + "/images/system/msjbnew.jpg",
                        listtype: 3,
                    }
                ]
            };
			proxy.emit('mashangjiuban', _mashangjiuban_menu);
            //青运来了
            medias.getFullMeidas({ cid: {$gt:8000,$lte:8004}}, select, options, proxy.done(function (models) {
                var _qingyun_menu = {
                    title: "青运来了",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 8000,
                        name:'青运来了',
                        listtype: 2,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 400,
                        icon: config.website + "/images/system/news.png",
                    },
                    list: get_form_medias(models)
                };
                proxy.emit('qingyun', _qingyun_menu);
            }));
            //聊斋夜话
            medias.getFullMeidas({ cid: _liaozhaiyehua_cid}, select, options, proxy.done(function (models) {
                var _liaozhaiyehua_menu = {
                    title: "聊斋夜话",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 4000,
                        name:'聊斋夜话',
                        listtype: 2,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 400,
                        icon: config.website + "/images/system/news.png",
                    },
                    list: get_form_medias(models)
                };
                proxy.emit('liaozhaiyehua', _liaozhaiyehua_menu);
            }));
			//新闻110
            medias.getFullMeidas({ cid: _xinwen_cid}, select, options, proxy.done(function (models) {
                var _xinwen_menu = {
                    title: "新闻110",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 4002,
                        name:'新闻110',
                        listtype: 2,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 300,
                        icon: config.website + "/images/system/news.png",
                    },
                    list: get_form_medias(models)
                };
                proxy.emit('xinwen',_xinwen_menu);
            }));

			//特别专题
			 var _special_menu = {
                title: "特别专题",
                hometype: 4,//
                rowcount:1,//2,3,4,5 几行
                columncount:1,//2,3,4,5 几行
                menuitem: {},
                list: [{
                        name: "特别专题",
                        pics: config.website + "/images/system/zhuanti1.jpg",
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: "",
                        commentstatus: 1,
                        cid: 1225002,
                        menutype: 300,
                        icon:config.website + "/images/system/zhuanti1.jpg",
                        listtype: 5,
                    }
                ]
            };
			proxy.emit('special', _special_menu);
			//财经新视界
			medias.getFullMeidas({ cid: _caijingxinshijie_cid}, select, options, proxy.done(function (models) {
                var _caijingxinshijie_menu = {
                    title: "财经新视界",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 6100,
                        name:'财经新视界',
                        listtype: 2,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 400,
                        icon: config.website + "/images/system/news.png",
                    },
                    list: get_form_medias(models)
                };
                proxy.emit('caijingxinshijie', _caijingxinshijie_menu);
            }));
			//旅途
			medias.getFullMeidas({ cid: _miluzaifuzhou_cid}, select, options, proxy.done(function (models) {
                var _miluzaifuzhou_menu = {
                    title: "旅途",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 100023,
                        name:'旅途',
                        listtype: 2,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 300,
                        icon: config.website + "/images/system/news.png",
                    },
                    list: get_form_medias(models)
                };
                proxy.emit('miluzaifuzhou', _miluzaifuzhou_menu);
            }));
			//微调查
			var _investigation_menu = {
                title: "微调查",
                hometype: 4,//
                rowcount:1,//2,3,4,5 几行
                columncount:1,//2,3,4,5 几行
                menuitem: {},
                list: [{
                        name: "微调查",
                        pics: config.website + "/images/system/weidiaocha.jpg",
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: "",
                        commentstatus: 1,
                        cid: 13000,
                        menutype: 300,
                        icon:config.website + "/images/system/weidiaocha.jpg",
                        listtype: 1,
                    }
                ]
            };
            proxy.emit('investigation', _investigation_menu);
		   //玩主天地
			medias.getFullMeidas({ cid: _jingdianmeichu_cid}, select, options, proxy.done(function (models) {
                var _jingdianmeichu_menu = {
                    title: "玩主天地",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 100044,
                        name:'玩主天地',
                        listtype: 2,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 300,
                        icon: config.website + "/images/system/news.png",
                    },
                    list: get_form_medias(models)
                };
                proxy.emit('jingdianmeichu', _jingdianmeichu_menu);
            }));
			//经典美厨
            medias.getFullMeidas({ cid: _meichu_cid}, select, options, proxy.done(function (models) {
                var _meichu_menu = {
                    title: "经典美厨",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 10024,
                        name:'经典美厨',
                        listtype: 2,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 300,
                        icon: config.website + "/images/system/news.png",
                    },
                    list: get_form_medias(models)
                };
                proxy.emit('meichu',_meichu_menu);
            }));
            //微直播 lives 不包含预告的
            lives.getFullLives({type:{$ne:2},status:{$gt:0}},{__v:0,reject:0,location:0,createtime:0,starttime:0}, options, proxy.done(function (models) {
                var _lives_menu = {
                    title: "直播福州",
                    hometype: 7,//微直播 hometype=7
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 4000,
                        name:'直播福州',
                        listtype: 6,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 12,
                        icon: config.website + "/images/system/news.png",
                    },
                    list: get_from_lives(models)
                };
                proxy.emit('micro', _lives_menu);
            }));
            Ads.find()
            .populate('menuitem','name upstatus pid position url commentstatus cid menutype pics icon listtype')
            .populate('mediaitem','title mid author members price pics score address tel type assistcount clickcount commentcount createtime source video desc cid')
            .sort('order').where({adposition:10045}).select({title:1,adimg:1,adurl:1,menuitem:1,mediaitem:1,adtype:1,_id:0}).limit(req.query.pagesize)
            .exec(proxy.done(function(models){
                var _microfilm_menu={
                    title: "微电影",
                    hometype:8,//微电影 hometype是8
                    rowcount:2,//2,3,4,5 几行
                    columncount:4,//2,3,4,5 几行
                    menuitem: {
                        pid: 0,
                        cid: 10045,
                        name:'微电影',
                        listtype: 2,
                        url: "",
                        upstatus: 0,
                        adstatus: 0,
                        commentstatus: 1,
                        position: 0,
                        pics: '',
                        menutype: 300,
                        icon: config.website + "/images/system/news.png"
                    },
                    list:get_from_ads(models)
                }
                proxy.emit('microfilm', _microfilm_menu);
            }));

            var _area_menu={
                title: "本地服务",
                hometype:3,//
                rowcount:2,//2,3,4,5 几行
                columncount:4,//2,3,4,5 几行
                menuitem: {},
                list: [
                    {
                        name: "主播专区",
                        pics: config.website + "/images/system/icon_zhengwu.png",
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: "",
                        commentstatus: 1,
                        cid:12000,
                        menutype: 400,
                        icon:config.website + "/images/system/icon_zhengwu.png",
                        listtype: 3,
                    },
                    {
                        name: "12345",
                        pics: config.website + "/images/system/icon_qiche.png",
                        icon: '',
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: "http://wap.fz12345.gov.cn",
                        commentstatus: 1,
                        cid: 11000005,
                        menutype: 300,
                        icon:config.website + "/images/system/icon_qiche.png",
                        listtype: 3,
                    },
                    {
                        name: "新闻报料",
                        pics: config.website + "/images/system/icon_lvyou.png",
                        icon: '',
                        upstatus: 1,
                        adstatus: 0,
                        pid: 0,
                        url: "",
                        commentstatus: 1,
                        cid: 7000,
                        menutype: 300,
                        icon:config.website + "/images/system/icon_lvyou.png",
                        listtype: 1
                    },
                    {
                        name: "福币商城",
                        pics: config.website + "/images/system/icon_meishi.png",
                        icon: '',
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: config.shopsite+"/m/home/indexcoin",
                        commentstatus: 1,
                        cid: 5001,
                        menutype: 700,
                        icon:config.website + "/images/system/icon_meishi.png",
                        listtype: 3
                    },
                    {
                        name: "车市界",
                        pics: config.website + "/images/system/icon_fangchan.png",
                        icon: '',
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: "",
                        commentstatus: 1,
                        cid: 6000,
                        menutype: 400,
                        icon:config.website + "/images/system/icon_fangchan.png",
                        listtype: 1
                    },
                    {
                        name: "美食街",
                        pics: config.website + "/images/system/icon_yingshi.png",
                        icon: '',
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: config.website+"/html5/page/foodmall/foodsquare.html",
                        commentstatus: 1,
                        cid: 7001,
                        menutype: 300,
                        icon:config.website + "/images/system/icon_yingshi.png",
                        listtype: 3
                    },
                    {
                        name: "快递查询",
                        pics: config.website + "/images/system/icon_shenghuo.png",
                        icon: '',
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: "http://m.kuaidi100.com/index_all.html",
                        commentstatus: 1,
                        cid: 110001,
                        menutype: 300,
                        icon:config.website + "/images/system/icon_shenghuo.png",
                        listtype: 3
                    },
                    {
                        name: "违章查询",
                        pics: config.website + "/images/system/icon_paike.png",
                        icon: '',
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: "http://m.weizhangwang.com/",
                        commentstatus: 1,
                        cid: 12131313,
                        menutype: 300,
                        icon:config.website + "/images/system/icon_paike.png",
                        listtype: 3
                    }
                ]
            };
            proxy.emit('area', _area_menu);
            var _shop_menu = {
                title: "商城",
                hometype: 4,//
                rowcount:1,//2,3,4,5 几行
                columncount:1,//2,3,4,5 几行
                menuitem: {},
                list: [{
                        name: "商城",
                        pics: config.website + "/images/system/shop.jpg",
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: config.shopsite+"/m",
                        commentstatus: 1,
                        cid: 30,
                        menutype: 700,
                        icon:config.website + "/images/system/shop.jpg",
                        listtype: 3,
                    }
                ]
            };
            proxy.emit('shop', _shop_menu);
            var _tv_menu = {
                title: "微电视",
                hometype: 5,
                columncount:3,
                rowcount:2,//2,3,4,5 几行
                menuitem: {},
                list: [{
                        name: "电视直播",
                        pics: config.website + "/images/system/icon_home_tv.png",
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: "",
                        commentstatus: 1,
                        cid: 2000,
                        menutype: 100,
                        icon:config.website + "/images/system/icon_home_tv.png",
                        listtype: 3,
                    },{
                        name: "栏目点播",
                        pics: config.website + "/images/system/icon_home_columns.png",
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: "",
                        commentstatus: 1,
                        cid: 4000,
                        menutype: 400,
                        icon:config.website + "/images/system/icon_home_columns.png",
                        listtype: 3,
                    },{
                        name: "云端影视",
                        pics: config.website + "/images/system/icon_home_movie.png",
                        upstatus: 0,
                        adstatus: 0,
                        pid: 0,
                        url: "",
                        commentstatus: 1,
                        cid: 3000,
                        menutype: 200,
                        icon:config.website + "/images/system/icon_home_movie.png",
                        listtype: 3,
                    }]
            };
            proxy.emit('tv', _tv_menu);
        }
    });
}
function get_form_medias(models){
    models.forEach(function (node, index) {
        node = node.toObject();
        node.createtime = parseInt(moment(node.createtime).format('X'));
        node.pics = comm.replace_pics(node.pics);
        node.url = comm.replace_url(node);
        node.shareurl = comm.replace_shareurl(node);
        delete node._id;
        delete node.order;
        delete node.tag;
        delete node.area;
        delete node.hangye;
        delete node.attr;
        models[index] = node;
    });
    return models;
}
function get_from_lives(models){
    models.forEach(function (node, index) {
        //node.createtime = parseInt(moment(node.createtime).format('X'));
        //node.starttime = parseInt(moment(node.starttime).format('X'));
        node.pics = comm.replace_pics(node.pics);
        if(node.type===0){
          node.tagicon=config.website + "/images/system/live/tag_live.png";
        }
        if(node.type===2){
          node.tagicon=config.website + "/images/system/live/tag_trailer.png";
        }
        if(node.type===3){
          node.cds.url=comm.replace_pics(node.cds.url);
        }
        models[index] = node;
    });
    return models;
}
function get_from_ads(models){
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
    return models;
}
//获取滑动菜单 通用的
exports.get_menu = function (req, res) {
    var menu = {
        list: [],
        code: 1
    }
    var where = { status: 0,isslide:true};
    var select = {name: 1,upstatus: 1,adstatus: 1,pid: 1,position: 1,url: 1,commentstatus: 1, _id: 1,
        menutype: 1, pics: 1,icon: 1,listtype: 1
    };
    //按菜单排序id 升序
    columns.find(where).sort("menuorder").select(select).exec(function(err,models){
        models.forEach(function (node, index) {
            var node = node.toObject();
            node.cid=node._id;
            node.icon=comm.replace_pics(node.icon);
            node.pics=comm.replace_pics(node.pics);
            models[index]=node;
            delete node._id;
            menu.list=models;
        });
        res.send(menu);
    })
}
exports.get_start_pics = function (req, res) {
    res.send({
        code: 1,
        list: [{
                pics:"",url: "",
            }
        ]
    });
}
//获取系统配置参数
exports.get_system_config = function (req, res) {
    /*var ver=comm.get_req_string(req.query.ver,'');
    var os=comm.get_req_string(req.query.os,'');//1=android 2=ios 3=ipad
    var project=comm.get_req_string(req.query.project,'');//honghezhou fuzhou
    var result={};
    if(ver==='110' && os==='2' ){
        result.code=0;
    }else{
        result.code=1;
    }*/
    return res.send({code:1});
}
//获取个人中心及商城的链接地址
exports.get_init_config=function(req,res){
    sysconfigs.find({type:'init'}).select({key:1,val:1,_id:0}).exec(function(err,models){
        if(err)return res.send({code:0,message:'error!'});
        models.forEach(function(node,i){

            if (node.val!=="" && node.val.indexOf("http://") < 0 && node.val.indexOf("https://") < 0) {
                if(node.val.indexOf('/html5')>-1)
                    node.val=url.resolve(config.website, node.val);
                if(node.val.indexOf('/MShop')>-1)
                    node.val=url.resolve(config.shopsite, node.val);
                if(node.val.indexOf('/m/home/indexcoin')>-1)
                    node.val=url.resolve(config.shopsite, node.val);
            }
        })
        return res.send({
            code:1,list:models
        })
    })
    /*
    var data={
        code:1,
        list:[{
            key:'shopright',val:config.shopsite+'/m/home/indexcoin'
        },{
            key:'shopcart',val:config.shopsite+'/MShop/sc/ci?flag=appcart'
        },{
            key:'myorder',val:config.shopsite+'/MShop/u/Orders?flag=appcart'
        },{
            key:'discount',val:url.resolve(config.website,'/html5/page/discount/discount.html')
        },{
            key:'mycoin',val:url.resolve(config.website,'/html5/page/coin/my_coin.html')
        },{
            key:'coindesc',val:url.resolve(config.website,'/html5/page/coin/coin_desc.html')
        },{
            key:'feedback',val:url.resolve(config.website,'/html5/page/feedback/feedback.html')
        },{
            key:'agreement',val:url.resolve(config.website,'/html5/agreement.html')
        },{
            key:'about',val:url.resolve(config.website,'/html5/page/about/about.html')
        },{
            key:'live',val:'10000'
        },{
            key: 'welfare', val: url.resolve(config.website, '/html5/page/coin/my_coin_discoin.html')
        }, {
            key: 'qrcode', val: url.resolve(config.website, '/html5/page/about/about_code.html')
        },  {
            key: 'sharelink ', val: 'http://fuzhou.app.joygo.com/touch/'
        }, {
            key: 'sharetitle', val: '福视锐动'
        }, {
            key: 'sharecontent ', val: '上福视锐动，做有福之人'
        }, {
            key: 'shareicon', val: url.resolve(config.website, '/html5/page/about/img/logo.png')
        }, {
            key: 'myqna', val: url.resolve(config.website, '/html5/page/anchor/my_answer.html')
        }, {
            key: 'vodabout', val: url.resolve(config.website, '/html5/page/vod/VODabout.html')
        }, {
            key: 'myvod', val: url.resolve(config.website, '/html5/page/vod/my_vod.html')
        }]
    }
    return res.send(data);*/
}
