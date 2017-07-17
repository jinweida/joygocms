var medias = require('../../proxy/medias');
var moment = require('moment');
var response = require('../../lib/response');
var comm = require('../../lib/comm');
var columns = require('../../models/columns').columns;
var appstatus = require('../../models/appstatus').appstatus;
var config = require('../../config');
var url=require('url');
var cache = require('../../lib/cache');
var eventproxy = require('eventproxy');
//menustype: [
//        { "id": -1, "name": "无", style: "label label-default" },
//        { "id": 100, "name": "电视直播" , style: "label label-primary" },
//        { "id": 200, "name": "云端影视", style: "label label-success" },
//        { "id": 300, "name": "简单列表", style: "label label-default" },
//        { "id": 400, "name": "多列新闻" , style: "label label-info" },
//        { "id": 500, "name": "网页列表" , style: "label label-info" },// 300与500 枚举一样
//        { "id": 600, "name": "个人中心" , style: "label label-info" },
//        { "id": 700, "name": "商城" , style: "label label-info" },
//        { "id": 800, "name": "商家美食" , style: "label label-info" },
//        { "id": 11, "name": "摇福" , style: "label label-info" },
//        { "id": 12, "name": "全程直击" , style: "label label-info" },
//        hometype: 0010=直播 0000=0  0100=4  1000=8   1100=12
//        高1 一排还是两排 1=一排 0=两排
//        高2 1=mediaitem 0=menuitem
//        后两位留给直播了
//    ],
exports.get_home = function (req, res) {
    cache.get(config.session_secret+"_get_home",function(err,get_home){
        if(get_home){
            return res.send(get_home);
        }else{
            var proxy = new eventproxy();
            proxy.all('hot', 'world','qingyun','liaozhai','che', function (hot, world,qingyun,liaozhai,che) {
                var home = {
                    code: 1,
                    list: []
                };
                var _hot_menu = {
                    title: "福州时政",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 1000,
                        name:'福州时政',
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
                    list: hot
                };
                var _world_menu = {
                    title: "社会热点",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 1000,
                        name:'社会热点',
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
                    list: world
                };
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
                    list: qingyun
                };
                var _liaozhai_menu = {
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
                    list: liaozhai
                };
                var _area_menu={
                    title: "本地服务",
                    hometype:3,//
                    rowcount:2,//2,3,4,5 几行
                    columncount:4,//2,3,4,5 几行
                    menuitem: {},
                    list: [
                        {
                            name: "马上就办",
                            pics: config.website + "/images/system/icon_zhengwu.png",
                            upstatus: 0,
                            adstatus: 0,
                            pid: 0,
                            url: config.website+"/html5/page/goverment/gover_center.html",
                            commentstatus: 1,
                            cid:5000,
                            menutype: 300,
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
                            url: "http://yf.joygo.com:8081/m/home/indexcoin",
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
                }
                var _shop_menu = {
                    title: "商城",
                    hometype: 4,//
                    rowcount:1,//2,3,4,5 几行
                    columncount:1,//2,3,4,5 几行
                    menuitem: {},
                    list: [{
                            name: "商城",
                            pics: config.website + "/images/system/shop.png",
                            upstatus: 0,
                            adstatus: 0,
                            pid: 0,
                            url: config.shopsite+"/m",
                            commentstatus: 1,
                            cid: 30,
                            menutype: 700,
                            icon:config.website + "/images/system/shop.png",
                            listtype: 3,
                        }
                    ]
                };
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
                home.list.push(_hot_menu);
                home.list.push(_world_menu);
                home.list.push(_qingyun_menu);
                home.list.push(_liaozhai_menu);
                home.list.push(_area_menu);
                home.list.push(_shop_menu);
                home.list.push(_tv_menu);
                cache.set(config.session_secret+'_get_home', home, config.redis.time);//设置缓存
                res.send(home);
            })
            req.query.pagesize = 8;
            var options = comm.api_get_page_options(req);
            var select = {
                content: 0, "commentstatus": 0, slides: 0,
                "status": 0, "password": 0,
            };
            //时政
            medias.getFullMeidas({ cid: 100011}, select, options, proxy.done(function (models) {
                proxy.emit('hot', get_form_medias(models));
            }));
            //社会
            medias.getFullMeidas({ cid: 1561}, select, options, proxy.done(function (models) {
                proxy.emit('world', get_form_medias(models));
            }));
            //青运来了
            medias.getFullMeidas({ cid: {$gt:8000,$lte:8004}}, select, options, proxy.done(function (models) {
                proxy.emit('qingyun', get_form_medias(models));
            }));
            //聊斋夜话
            medias.getFullMeidas({ cid: 4007}, select, options, proxy.done(function (models) {
                proxy.emit('liaozhai', get_form_medias(models));
            }));
            medias.getFullMeidas({ cid: {$gt:6000,$lt:6002}}, select, options, proxy.done(function (models) {
                proxy.emit('che', get_form_medias(models));
            }));
            /*
            comm.http_request_get('http://yf.joygo.com:8089/CoinProduct/CoinProList/?top=4',{},req,proxy.done(function (error, response, body){
                var list=[];
                var info=JSON.parse(response);
                if(info.result){
                    info.lists.forEach(function(node,index){
                        list.push({
                            name: node.PName,
                            pics: node.PImage,
                            upstatus: 0,
                            adstatus: 0,
                            pid: 0,
                            url: node.Phref,
                            commentstatus: 1,
                            cid: 30,
                            menutype: 700,
                            icon:'',
                            listtype: 3,
                        });
                    });
                }
                proxy.emit('shop', list);
            }));*/
        }
    })
}
exports.get_ios_home = function (req, res) {
    cache.get(config.session_secret+"_get_ios_home",function(err,get_ios_home){
        if(get_ios_home){
            return res.send(get_ios_home);
        }else{
            var proxy = new eventproxy();
            proxy.all('hot', 'world','qingyun','liaozhai','che', function (hot, world,qingyun,liaozhai,che) {
                var home = {
                    code: 1,
                    list: []
                };
                var _hot_menu = {
                    title: "福州时政",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 1000,
                        name:'福州时政',
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
                    list: hot
                };
                var _world_menu = {
                    title: "社会热点",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 1000,
                        name:'社会热点',
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
                    list: world
                };
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
                    list: qingyun
                };
                var _liaozhai_menu = {
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
                    list: liaozhai
                };
                var _area_menu={
                    title: "本地服务",
                    hometype:3,//
                    rowcount:2,//2,3,4,5 几行
                    columncount:4,//2,3,4,5 几行
                    menuitem: {},
                    list: [
                        {
                            name: "马上就办",
                            pics: config.website + "/images/system/icon_zhengwu.png",
                            upstatus: 0,
                            adstatus: 0,
                            pid: 0,
                            url: config.website+"/html5/page/goverment/gover_center.html",
                            commentstatus: 1,
                            cid:5000,
                            menutype: 300,
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
                            upstatus: 0,
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
                            url: "http://yf.joygo.com:8081/m/home/indexcoin",
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
                }
                var _shop_menu = {
                    title: "商城",
                    hometype: 4,//
                    rowcount:1,//2,3,4,5 几行
                    columncount:1,//2,3,4,5 几行
                    menuitem: {},
                    list: [{
                            name: "商城",
                            pics: config.website + "/images/system/shop.png",
                            upstatus: 0,
                            adstatus: 0,
                            pid: 0,
                            url: config.shopsite+'/m',
                            commentstatus: 1,
                            cid: 30,
                            menutype: 700,
                            icon:config.website + "/images/system/shop.png",
                            listtype: 3,
                        }
                    ]
                };
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

                home.list.push(_hot_menu);
                home.list.push(_world_menu);
                home.list.push(_qingyun_menu);
                home.list.push(_liaozhai_menu);
                home.list.push(_area_menu);
                home.list.push(_shop_menu);
                home.list.push(_tv_menu);

                cache.set(config.session_secret+'_get_ios_home', home, config.redis.time);//设置缓存
                res.send(home);
            })
            req.query.pagesize = 8;
            var options = comm.api_get_page_options(req);
            var select = {
                content: 0, "commentstatus": 0, slides: 0,
                "status": 0, "password": 0,
            };
            //时政
            medias.getFullMeidas({ cid: 100011}, select, options, proxy.done(function (models) {
                proxy.emit('hot', get_form_medias(models));
            }));
            //社会
            medias.getFullMeidas({ cid: 1561}, select, options, proxy.done(function (models) {
                proxy.emit('world', get_form_medias(models));
            }));
            //青运来了
            medias.getFullMeidas({ cid: {$gt:8000,$lte:8004}}, select, options, proxy.done(function (models) {
                proxy.emit('qingyun', get_form_medias(models));
            }));
            //聊斋夜话
            medias.getFullMeidas({ cid: 4007}, select, options, proxy.done(function (models) {
                proxy.emit('liaozhai', get_form_medias(models));
            }));
            medias.getFullMeidas({ cid: {$gt:6000,$lt:6002}}, select, options, proxy.done(function (models) {
                proxy.emit('che', get_form_medias(models));
            }));
            /*
            comm.http_request_get('http://yf.joygo.com:8089/CoinProduct/CoinProList/?top=4',{},req,proxy.done(function (error, response, body){
                var list=[];
                var info=JSON.parse(response);
                if(info.result){
                    info.lists.forEach(function(node,index){
                        list.push({
                            name: node.PName,
                            pics: node.PImage,
                            upstatus: 0,
                            adstatus: 0,
                            pid: 0,
                            url: node.Phref,
                            commentstatus: 1,
                            cid: 30,
                            menutype: 700,
                            icon:'',
                            listtype: 3,
                        });
                    });
                }
                proxy.emit('shop', list);
            }));*/
        }
    })
}
exports.get_android_home=function(req,res){
    cache.get(config.session_secret+"_get_android_home",function(err,get_android_home){
        if(get_android_home){
            return res.send(get_android_home);
        }else{
            var proxy = new eventproxy();
            proxy.all('hot', 'world','qingyun','liaozhai','che', function (hot, world,qingyun,liaozhai,che) {
                var home = {
                    code: 1,
                    list: []
                };
                var _hot_menu = {
                    title: "福州时政",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 1000,
                        name:'福州时政',
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
                    list: hot
                };
                var _world_menu = {
                    title: "社会热点",
                    hometype: 0,//0=子项是mediaitem 1=子项是menuitem 2=直播
                    rowcount:1,//2,3,4,5 几行
                    columncount:3,
                    menuitem: {
                        pid: 0,
                        cid: 1000,
                        name:'社会热点',
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
                    list: world
                };
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
                    list: qingyun
                };
                var _liaozhai_menu = {
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
                    list: liaozhai
                };
                var _area_menu={
                    title: "本地服务",
                    hometype:3,//
                    rowcount:2,//2,3,4,5 几行
                    columncount:4,//2,3,4,5 几行
                    menuitem: {},
                    list: [
                        {
                            name: "马上就办",
                            pics: config.website + "/images/system/icon_zhengwu.png",
                            upstatus: 0,
                            adstatus: 0,
                            pid: 0,
                            url: config.website+"/html5/page/goverment/gover_center.html",
                            commentstatus: 1,
                            cid:5000,
                            menutype: 300,
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
                            upstatus: 0,
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
                            url: "http://yf.joygo.com:8081/m/home/indexcoin",
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
                }
                var _shop_menu = {
                    title: "商城",
                    hometype: 4,//
                    rowcount:1,//2,3,4,5 几行
                    columncount:1,//2,3,4,5 几行
                    menuitem: {},
                    list: [{
                            name: "商城",
                            pics: config.website + "/images/system/shop.png",
                            upstatus: 0,
                            adstatus: 0,
                            pid: 0,
                            url: config.shopsite+'/m',
                            commentstatus: 1,
                            cid: 30,
                            menutype: 700,
                            icon:config.website + "/images/system/shop.png",
                            listtype: 3,
                        }
                    ]
                };
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
                home.list.push(_hot_menu);
                home.list.push(_world_menu);
                home.list.push(_qingyun_menu);
                home.list.push(_liaozhai_menu);
                home.list.push(_area_menu);
                home.list.push(_shop_menu);
                home.list.push(_tv_menu);
                cache.set(config.session_secret+'_get_android_home', home, config.redis.time);//设置缓存
                res.send(home);
            })
            req.query.pagesize = 8;
            var options = comm.api_get_page_options(req);
            var select = {
                content: 0, "commentstatus": 0, slides: 0,
                "status": 0, "password": 0,
            };
            //时政
            medias.getFullMeidas({ cid: 100011}, select, options, proxy.done(function (models) {
                proxy.emit('hot', get_form_medias(models));
            }));
            //社会
            medias.getFullMeidas({ cid: 1561}, select, options, proxy.done(function (models) {
                proxy.emit('world', get_form_medias(models));
            }));
            //青运来了
            medias.getFullMeidas({ cid: {$gt:8000,$lte:8004}}, select, options, proxy.done(function (models) {
                proxy.emit('qingyun', get_form_medias(models));
            }));
            //聊斋夜话
            medias.getFullMeidas({ cid: 4007}, select, options, proxy.done(function (models) {
                proxy.emit('liaozhai', get_form_medias(models));
            }));
            medias.getFullMeidas({ cid: {$gt:6000,$lt:6002}}, select, options, proxy.done(function (models) {
                proxy.emit('che', get_form_medias(models));
            }));
            /*
            comm.http_request_get(config.shopsite,{},req,proxy.done(function (error, response, body){
                var list=[];
                var info=JSON.parse(response);
                if(info.result){
                    info.lists.forEach(function(node,index){
                        list.push({
                            name: node.PName,
                            pics: node.PImage,
                            upstatus: 0,
                            adstatus: 0,
                            pid: 0,
                            url: node.Phref,
                            commentstatus: 1,
                            cid: 30,
                            menutype: 700,
                            icon:'',
                            listtype: 3,
                        });
                    });
                }
                proxy.emit('shop', list);
            }));*/
        }
    })
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
        }]
    }
    return res.send(data);
}