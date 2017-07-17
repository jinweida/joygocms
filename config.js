module.exports = {
    database:{
        db:'mongodb://127.0.0.1:25000/fuzhoucms-dev',//数据库链接
        options:{//数据库配置项
            db: { native_parser: true },
            server: { poolSize: 5 },
            replset: { rs_name: 'myReplicaSetName' },
            user: 'siteUserAdmin',
            pass: 'password'
        }
    },
    mysql:{
    	host: '127.0.0.1',
	    user: 'root',
	    password: 'database',
	    database: 'usercenter',
	    port: 3306
    },
    redis:{
        host: '127.0.0.1',
        port: 6379,
        time:1*60,//过期时间 秒
        password:'joygo$.123'
    },
    wwwname:"福视悦动",
    version:'v1.5',
    website: "http://fuzhou.cms.joygo-dev.com",//html5服务器 不能带"/"
    imgsite:"http://fuzhou.cms.joygo-dev.com",//图片服务器 不能"/"
    // usercenter:"http://user.dev.joygo-dev.com/dev",
    usercenter:"http://user.test.joygo-dev.com/test",
    shopsite:"http://test.shopapi.joygo-dev.com/test",//媒资商品ip地址
    envelope:"http://user.test.joygo-dev.com/test",//红包ip地址
    notice:"http://sms.joygo-dev.com:8002",//活动发送短信服务器
    neighbor:"http://tvadmin.joygo-dev.com:3020/api/neighbour",//邻居计划服务器
    appkey:"yichuncms",//appkey
    ver:"1.4",//邻居计划版本 不带v
    ads:"http://test.shopapi.joygo-dev.com/test/mobile/shop/shop/videoIndex2.html",
    // ads:"http://115.159.5.29:8001/mobile/shop/shop/videoIndex2.html",
    session_secret:'fushiyuedong',//新项目必改,否则缓存会冲突
    live_ois_url:"http://121.40.230.231",//微直播域名，生产系统必须是http://*.micro.joygo.com
    live_ois_port:5000,//视频播放地址
    live_chatroom_create:"http://fuzhou.talk.joygo-dev.com/chatroomapi/createchatroom",//融云聊天
    joygo_cloud_url:"http://cloudtest.cms.joygo-dev.com/v1.0",//云端地址
    rongclound_appkey:'6tnym1brns7w7',//默认是开发版本 融云appkey,更换项目 必换
    rongclound_secret:'rO8bg8IvANFfB',//融云secret
    umeng_appkey_iphone:"umengkey",//必须在umeng后台开放本cms服务器的固定IP
    umeng_appkey_android:"umengkey",
    umeng_appmastersecret_ios:"umengkey",
    umeng_appmastersecret_android:"umengkey",
    umeng_alias_type_ios:"QQ",
    umeng_alias_type_android:"FUSHIYUEDONG",
    umeng_production_mode:"false",//Umeng推送开发环境配置项，false表示只推送开发环境，true表示推送生产环境
    upload: '',//用户上传目录
    types: [//媒资类型
        { "id": 1, "name": "新闻", style: "label label-default" },
        { "id": 2, "name": "视频" , style: "label label-primary" },
        { "id": 3, "name": "图片集", style: "label label-success" },
        { "id": 4, "name": "专题" , style: "label label-info" },
        { "id": 5, "name": "活动" , style: "label label-danger" },
        { "id": 6, "name": "美食" , style: "label label-warning" },
        { "id": 7, "name": "投票" , style: "label label-danger" },
        { "id": 8, "name": "广告" , style: "label label-danger" },
        { "id": 9, "name": "公告" , style: "label label-danger" },
        { "id": 100, "name": "活动" , style: "label label-danger" },
    ],
    tags: [//标签类型 0=无标签 20=独家 2=视频 3=推广 4=专题 5=分析 6= 7=投票 8=直播 9=广播 10=音乐
    //0=无标签 21=独家 22=视频 23=推广 24=专题 25=分析 26=热门 27=投票 28=直播 29=广播 30=音乐
        { "id": 0, "name": "选择标签", style: "label label-default" },
        { "id": 21, "name": "独家", style: "label label-default" },
        { "id": 22, "name": "视频" , style: "label label-primary" },
        { "id": 23, "name": "推广", style: "label label-success" },
        { "id": 24, "name": "专题" , style: "label label-info" },
        { "id": 25, "name": "分析" , style: "label label-danger" },
        { "id": 26, "name": "热门" , style: "label label-warning" },
        { "id": 27, "name": "投票" , style: "label label-danger" },
        { "id": 28, "name": "直播" , style: "label label-danger" },
        { "id": 29, "name": "广播" , style: "label label-danger" },
        { "id": 30, "name": "音乐" , style: "label label-danger" },
    ],
    menutype: [//菜单类型 810 700 900 800 v1.3 可以删掉了
        { "id": -1, "name": "选择菜单类型", style: "label label-default" },
        { "id": 100, "name": "电视直播" , style: "label label-primary" },
        { "id": 110, "name": "微广播" , style: "label label-primary" },
        { "id": 200, "name": "云端影视", style: "label label-success" },
        { "id": 300, "name": "简单列表", style: "label label-default" },// 300与500 枚举一样
        { "id": 400, "name": "多列新闻" , style: "label label-info" },
        { "id": 810, "name": "多列新闻无底栏网页" , style: "label label-info" },//&
        { "id": 600, "name": "个人中心" , style: "label label-info" },
        { "id": 700, "name": "商城" , style: "label label-info" },//&
        { "id": 800, "name": "无底栏网页" , style: "label label-info" },
        { "id": 900, "name": "无顶栏网页" , style: "label label-info" },//&
        { "id": 1000, "name": "全屏网页" , style: "label label-info" },//&
        { "id": 1100, "name": "新闻首页" , style: "label label-info" },//&
        { "id": 1200, "name": "服务" , style: "label label-info" },//&
        { "id": 1400, "name": "搜索" , style: "label label-info" },//&
        { "id": 1500, "name": "荔枝财经" , style: "label label-info" },//&
        { "id": 1300, "name": "发现" , style: "label label-info" },//&
        { "id": 10, "name": "首页" , style: "label label-info" },
        { "id": 11, "name": "摇福" , style: "label label-info" },
        { "id": 12, "name": "微直播" , style: "label label-info" },
        { "id": 13, "name": "扫一扫" , style: "label label-info" },
        { "id": 14, "name": "邻居计划" , style: "label label-info" },//&
    ],
    menuposition: [//菜单位置
        { "id": 0, "name": "中",},
        { "id": 1, "name": "左",},
        { "id": 2, "name": "右",},
    ],
    //列表样式
    listtype: [//1,4可以合并为7
        { "id": 1, "name": "普通列表", style: "label label-info"},
        { "id": 7, "name": "混合列表", style: "label label-warning" },
        { "id": 8, "name": "瀑布列表", style: "label label-warning" },
        { "id": 4, "name": "无图列表", style: "label label-warning" },
        { "id": 2, "name": "二列表格", style: "label label-primary"},
        { "id": 5, "name": "单列表格", style: "label label-warning" },
        { "id": 6, "name": "微直播", style: "label label-warning" },
        { "id": 9, "name": "微广播", style: "label label-warning" },
        { "id": 10, "name": "电视直播", style: "label label-warning" },
        { "id": 11, "name": "云端影视", style: "label label-warning" },
        { "id": 3, "name": "网页", style: "label label-warning" },
        { "id": 20, "name": "敬请期待", style: "label label-warning" },
        { "id": 21, "name": "荔枝微直播", style: "label label-warning" },
        { "id": 22, "name": "左文右图", style: "label label-warning" },
    ],
};