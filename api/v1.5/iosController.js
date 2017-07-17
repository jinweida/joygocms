var response = require('../../lib/response');
var comm = require('../../lib/comm');
var url = require('url');
var ios = require('../../ios');
var config = require('../../config');
var V='v1.5';
exports.up=function(req,res,next){
    var ver=comm.get_req_string(req.query.ver,'');
    var os=comm.get_req_string(req.query.os,'');//1=android 2=ios 3=ipad
    var project=comm.get_req_string(req.query.project,'');//1=android 2=ios 3=ipad

    var path=req.path;
    if(ios.ver===ver && ios.os===os && ios.project===project){
        if(path.match(/api\/get_home/g) || path.match(/api\/get_ios_home/g)){
            return res.send(ios.home);
        }else if(path.match(/api\/get_menu_bottom/g)){
            return res.send(ios.menus_bottom);
        }else if(path.match(/api\/get_menu/g)){
            return res.send(ios.menus);
        }else if(path.match(/api\/get_init_config_add/g)){
            var data={
                code:1,
                data: {
                    discount: url.resolve(config.website,"/html5/page/discount/discount.html"),
                    mycoin: url.resolve(config.website,"/html5/page/coin/my_coin.html"),
                    coindesc: url.resolve(config.website,"/html5/page/coin/coin_desc.html"),
                    feedback: url.resolve(config.website, "/html5/page/feedback/feedback.html"),
                    agreement: url.resolve(config.website,"/html5/agreement.html"),
                    about: url.resolve(config.website,"/html5/page/about/about.html"),
                    welfare: url.resolve(config.website,"/html5/page/coin/my_coin_discoin.html"),
                    qrcode: url.resolve(config.website,"/html5/page/about/about_code.html"),
                    myqna: url.resolve(config.website,"/html5/page/anchor/my_answer_nohead.html"),
                    vodabout: url.resolve(config.website,"/html5/page/vod/VODabout.html"),
                    myvod: url.resolve(config.website,"/html5/page/vod/my_vod.html"),
                    myfeedback: url.resolve(config.website, "/html5/page/feedback/myback.html"),
                    vodshare: url.resolve(config.website, "/html5/page/vod/share.html"),
                    uploadagreement: url.resolve(config.website, "/html5/page/upload/uploadagreement.html"),
                    broadcastshare: url.resolve(config.website, "/html5/page/news/broadcast_share.html"),
                }
            }
            return res.send(data);
        }else if(path.match(/api\/get_init_config/g)){
            var data={
                code:1,
                list:[{
                    key:'shopright',val:'http://yf.joygo.com:8081/m/home/indexcoin'
                },{
                    key:'shopcart',val:'http://yf.joygo.com:8081/MShop/sc/ci/cartapp'
                },{
                    key:'discount',val:url.resolve(config.website,'/html5/page/discount/discount.html')
                },{
                    key:'mycoin',val:url.resolve(config.website,'/html5/page/coin/my_coin_ios.html')
                },{
                    key:'coindesc',val:url.resolve(config.website,'/html5/page/coin/coin_desc_ios.html')
                },{
                    key:'feedback',val:url.resolve(config.website,'/html5/page/feedback/feedback.html')
                },{
                    key:'about',val:url.resolve(config.website,'/html5/page/about/about.html')
                },{
                    key:'agreement',val:url.resolve(config.website,'/html5/agreement.html')
                },{
                    key:'live',val:'10000'
                }]
            }
            return res.send(data);
        }else if(path.match(/api\/get_system_config/g)){
            return res.send(ios.system_config);
        }else if(path.match(/api\/get_broadprograms/g)){
            return res.send(ios.broadprograms_config);
        }else if(path.match(/api\/get_broadcasts_detail/g)){
            return res.send(ios.broadcasts_detail_config);
        }else if(path.match(/api\/get_broadcasts/g)){
            return res.send(ios.broadcasts_config);
        }

    }
    next();
}