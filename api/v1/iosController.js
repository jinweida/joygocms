var response = require('../../lib/response');
var comm = require('../../lib/comm');
var url = require('url');
var ios = require('../../ios');
var config = require('../../config');

exports.up=function(req,res,next){
    var ver=comm.get_req_string(req.query.ver,'');
    var os=comm.get_req_string(req.query.os,'');//1=android 2=ios 3=ipad
    var project=comm.get_req_string(req.query.project,'');//1=android 2=ios 3=ipad

    var path=req.path;
    if(ios.ver===ver && ios.os===os && ios.project===project){
        if(path.match(/api\/get_home/i) || path.match(/api\/get_ios_home/i)){
            return res.send(ios.home);
        }else if(path.match(/api\/get_menu/i)){
            return res.send(ios.menus);
        }else if(path.match(/api\/get_init_config/i)){
            var data={
                code:1,
                list:[{
                    key:'shopright',val:config.shopsite+'/m'
                },{
                    key:'shopcart',val:config.shopsite+'/MShop/sc/ci/cartapp'
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
        }else if(path.match(/api\/get_system_config/i)){
            return res.send(ios.system_config);
        }
    }
    next();
}