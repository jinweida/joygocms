var config = require('../config');
var url = require('url');
var querystring = require('querystring');
var cookie = require('./cookie.js');
var http = require('http');
var request = require('request');
var fs = require("fs");
var crypto = require('crypto');
var moment = require('moment');

exports.get_page_options = function(req) {
    var pagesize = req.query.pagesize || req.body.pagesize;
    var page = req.query.page || req.body.page;
    if (page === undefined || page == "") page = 1;
    if (pagesize === undefined || pagesize == "") pagesize = 12;
	//var countQuery = Posts.where(where).count();//总数

    var options = {
        skip: (page - 1) * pagesize,
        limit: pagesize,
        currentpage:page,
        pagesize: pagesize
    };
    return options;
}
exports.api_get_page_options = function (req) {
    var pagesize = Number(req.query.pagesize);
    var page = Number(req.query.page);
    if (pagesize === undefined || pagesize == "") pagesize = 20;//最多显示加载20条
    if (pagesize == 0) pagesize = 100;
    if (page === undefined || page == "") page = 0;
    //var countQuery = Posts.where(where).count();//总数
    var options = {
        skip: (page) * pagesize,
        limit: pagesize,
        pagesize: pagesize,
        page:page,
    };
    return options;
}

//替换pics中的图片地址
exports.replace_pics = function (pics) {
    if (pics!=="" && pics.indexOf("http://") < 0 && pics.indexOf("https://") < 0) {
        pics = url.resolve(config.imgsite, pics);
    }
    return pics;
}
exports.replace_html = function (content) {
    //var content = '<p style="text-indent: 0px;"><img src="http://fuzhou.cms.joygo.com:8088//upload/596293584160952320.jpg" title="" alt="4.jpg"></p><p style="sdfsdf">==========================================<br style="white-space: normal;"/>看    到有人说粤语歌太经典不敢改，这简直开玩笑，论经典《hey jude》的经典程度如何啊？&nbsp;&nbsp;&nbsp;&nbsp;邓丽君的歌难道不够经典？<a href="#" data-style="sdf:Asdf">罗大佑的</a>歌不够经典？越是经典的歌，翻唱者越多，\r\n而不是越少。当然选秀节目又有点不同，炫技和突出不同比较重要，并不一定追<script>asdfsadf</script>寻经典，而是要一些特别的歌。总之经典不经典跟这个事情没关系。看到有人说粤语歌太经典不敢改</p><style>.s{display:none;}</style>';
    //var content.replace(/content/, "W3School");
    　　//var reg = /(<img).+(src=\"?.+)images\/(.+\.(jpg|gif|bmp|bnp|png)\"?).+>/i;
    //content = content.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
    //content = content.replace(/[ | ]*\n/g, '\n'); //去除行尾空白
    //str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
    //content = content.replace(/&nbsp;/ig, '');//去掉&nbsp;
    //content = content.replace(/style.+(?=\s)/ig, '');
    function strip_tags(input, allowed) {
        //  discuss at: http://phpjs.org/functions/strip_tags/
        // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // improved by: Luke Godfrey
        // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        //    input by: Pul
        //    input by: Alex
        //    input by: Marc Palau
        //    input by: Brett Zamir (http://brett-zamir.me)
        //    input by: Bobby Drake
        //    input by: Evertjan Garretsen
        // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // bugfixed by: Onno Marsman
        // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // bugfixed by: Eric Nagel
        // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // bugfixed by: Tomasz Wesolowski
        //  revised by: Rafał Kukawski (http://blog.kukawski.pl/)
        //   example 1: strip_tags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '<i><b>');
        //   returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
        //   example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>');
        //   returns 2: '<p>Kevin van Zonneveld</p>'
        //   example 3: strip_tags("<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>", "<a>");
        //   returns 3: "<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>"
        //   example 4: strip_tags('1 < 5 5 > 1');
        //   returns 4: '1 < 5 5 > 1'
        //   example 5: strip_tags('1 <br/> 1');
        //   returns 5: '1  1'
        //   example 6: strip_tags('1 <br/> 1', '<br>');
        //   returns 6: '1 <br/> 1'
        //   example 7: strip_tags('1 <br/> 1', '<br><br/>');
        //   returns 7: '1 <br/> 1'

        allowed = (((allowed || '') + '')
    .toLowerCase()
    .match(/<[a-z][a-z0-9]*>/g) || [])
    .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
            commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
        return input.replace(commentsAndPhpTags, '')
                    .replace(tags, function ($0, $1) {
                            return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
                        });
    }

    content = content.replace(/<\s*style[^>]*>(.|[\r\n])*?<\s*\/style[^>]*>/gi, '')
                     .replace(/<\s*script[^>]*>(.|[\r\n])*?<\s*\/script[^>]*>/gi, '')
                     .replace(/<p><\/p>/gi, '')
                     //.replace(/style="[^"]*"/gi, '')
                     //.replace(/class="[^"]*"/gi, '')
                     .replace(/width="[^"]*"/gi, '')
                     .replace(/height="[^"]*"/gi, '')
                     .replace(/\n[\s| | ]*\r/gi, '\n')
                     .replace(/&nbsp;/gi, '')
                     .replace(/[ | ]*\n/gi, '\n')
                     .replace(/src=\"\/upload\//ig, "src=\""+config.imgsite + "/upload/");
                     //.replace(/^\/upload\//ig, config.website + "/upload/");

    content = strip_tags(content, "<p><a><h3><video><img><span><br><div>");
    return content;
}
exports.replace_url = function (node) {
    if (node.type == 1) {
        return url.resolve(config.website, "/html5/page/news/news_detail.html?mid=" + node.mid+"&cid="+node.cid);
    } else if (node.type == 2) {
        return url.resolve(config.website, "/html5/page/news/video_detail.html?mid=" + node.mid+"&cid="+node.cid);
    } else if (node.type == 3) {
        return url.resolve(config.website, "/html5/page/news/images_detail.html?mid=" + node.mid+"&cid="+node.cid);
    } else if (node.type == 5) {
        return url.resolve(config.website, "/html5/page/news/activity_detail_v1.5.html?mid=" + node.mid+"&cid="+node.cid);
        // if (node.activitytype==0) {
        //     return url.resolve(config.website, "/html5/page/news/video_activity.html?mid=" + node.mid+"&cid="+node.cid);
        // }
        // if (node.activitytype==1) {
        //    return url.resolve(config.website, "/html5/page/news/images_activity.html?mid=" + node.mid+"&cid="+node.cid);
        // }
        // if (node.activitytype==2) {
        //    return url.resolve(config.website, "/html5/page/news/normal_activity_detail_v1.5.html?mid=" + node.mid+"&cid="+node.cid);
        // }
    } else if (node.type == 7) {
        return url.resolve(config.website, "/html5/page/news/vote_detail.html?mid=" + node.mid+"&cid="+node.cid);
    } else if (node.type == 100) {
        return url.resolve(config.website, "/html5/page/videovotes/video_votes.html?mid=" + node.mid+"&cid="+node.cid);
    }else {
        return url.resolve(config.website, "/html5/page/news/news_detail.html?mid=" + node.mid+"&cid="+node.cid);
    }
};
exports.replace_cms_url = function (node) {
    if (node.type == 1) {
        return url.resolve(config.website, "/cmsHTML5/page/news/news_detail.html?mid=" + node.mid+"&cid="+node.cid);
    } else if (node.type == 2) {
        return url.resolve(config.website, "/cmsHTML5/page/news/video_detail.html?mid=" + node.mid+"&cid="+node.cid);
    } else if (node.type == 3) {
        return url.resolve(config.website, "/cmsHTML5/page/news/images_detail.html?mid=" + node.mid+"&cid="+node.cid);
    } else if (node.type == 5) {
        return url.resolve(config.website, "/cmsHTML5/page/news/activity_detail.html?mid=" + node.mid+"&cid="+node.cid);
    } else if (node.type == 7) {
        return url.resolve(config.website, "/cmsHTML5/page/news/vote_detail.html?mid=" + node.mid+"&cid="+node.cid);
    } else if (node.type == 100) {
        return url.resolve(config.website, "/cmsHTML5/page/videovotes/video_votes.html?mid=" + node.mid+"&cid="+node.cid);
    }else {
        return url.resolve(config.website, "/cmsHTML5/page/news/news_detail.html?mid=" + node.mid+"&cid="+node.cid);
    }
};
exports.replace_broke_url = function (node) {
    if (node.type == 1) {
        return url.resolve(config.website, "/cmsHTML5/page/news/images_broke.html");
    } else if (node.type == 2) {
        return url.resolve(config.website, "/cmsHTML5/page/news/video_broke.html");
    } else if (node.type == 3) {
        return url.resolve(config.website, "/cmsHTML5/page/news/audio_broke.html");
    }
};
exports.replace_myuploads_url = function (node) {
    if (node.type == 1) {
        return url.resolve(config.website, "/html5/page/news/my_uploads_picsdetail.html?mid=" + node._id);
    } else if (node.type == 2) {
        return url.resolve(config.website, "/html5/page/news/my_uploads_videodetail.html?mid=" + node._id);
    }
};
exports.cloud_replace_url = function (node) {
    if (node.type == 1) {
        return url.resolve(config.website, "/html5/page/news/news_detail.html?mid=" + node.mid+"&cid="+node.cid+"&source=cloud");
    } else if (node.type == 2) {
        return url.resolve(config.website, "/html5/page/news/video_detail.html?mid=" + node.mid+"&cid="+node.cid+"&source=cloud");
    } else if (node.type == 3) {
        return url.resolve(config.website, "/html5/page/news/images_detail.html?mid=" + node.mid+"&cid="+node.cid+"&source=cloud");
    } else if (node.type == 5) {
        return url.resolve(config.website, "/html5/page/news/activity_detail.html?mid=" + node.mid+"&cid="+node.cid+"&source=cloud");
    } else if (node.type == 7) {
        return url.resolve(config.website, "/html5/page/news/vote_detail.html?mid=" + node.mid+"&cid="+node.cid+"&source=cloud");
    } else if (node.type == 100) {
        return url.resolve(config.website, "/html5/page/videovotes/video_votes.html?mid=" + node.mid+"&cid="+node.cid+"&source=cloud");
    }else {
        return url.resolve(config.website, "/html5/page/news/news_detail.html?mid=" + node.mid+"&cid="+node.cid+"&source=cloud");
    }
};
exports.cloud_replace_shareurl = function (node) {
    if (node.type == 1) {
        return url.resolve(config.website, "/html5/page/news/news_share.html?mid=" + node.mid+"&cid="+node.cid+"&source=cloud");
    } else if (node.type == 2) {
        return url.resolve(config.website, "/html5/page/news/video_share.html?mid=" + node.mid+"&cid="+node.cid+"&source=cloud");
    } else if (node.type == 3) {
        return url.resolve(config.website, "/html5/page/news/images_share.html?mid=" + node.mid+"&cid="+node.cid+"&source=cloud");
    } else if (node.type == 5) {
        return url.resolve(config.website, "/html5/page/news/activity_share.html?mid=" + node.mid+"&cid="+node.cid+"&source=cloud");
    }else if (node.type == 7) {
        return url.resolve(config.website, "/html5/page/news/vote_share.html?mid=" + node.mid+"&cid="+node.cid+"&source=cloud");
    }  else if (node.type == 100) {
        return url.resolve(config.website, "/html5/page/videovotes/video_votes_share.html?mid=" + node.mid+"&cid="+node.cid+"&source=cloud");
    } else {
        return url.resolve(config.website, "/html5/page/news/news_share.html?mid=" + node.mid+"&cid="+node.cid+"&source=cloud");
    }
};
exports.replace_shareurl = function (node) {
    if (node.type == 1) {
        return url.resolve(config.website, "/html5/page/news/news_share.html?mid=" + node.mid+"&cid="+node.cid);
    } else if (node.type == 2) {
        return url.resolve(config.website, "/html5/page/news/video_share.html?mid=" + node.mid+"&cid="+node.cid);
    } else if (node.type == 3) {
        return url.resolve(config.website, "/html5/page/news/images_share.html?mid=" + node.mid+"&cid="+node.cid);
    } else if (node.type == 5) {
        return url.resolve(config.website, "/html5/page/news/activity_share.html?mid=" + node.mid+"&cid="+node.cid);
    }else if (node.type == 7) {
        return url.resolve(config.website, "/html5/page/news/vote_share.html?mid=" + node.mid+"&cid="+node.cid);
    }  else if (node.type == 100) {
        return url.resolve(config.website, "/html5/page/videovotes/video_votes_share.html?mid=" + node.mid+"&cid="+node.cid);
    } else {
        return url.resolve(config.website, "/html5/page/news/news_share.html?mid=" + node.mid+"&cid="+node.cid);
    }
};
exports.cooper_share = function(node){
    return config.website+'/html5/page/businesses/share.html?id='+node._id
}
exports.get_req_int = function (key,val) {
    var result = key;
    if (key === undefined || key === null || key==='' || key==='null' || key==='undefined')
        result = val;
    return parseInt(result);
}
exports.get_req_string = function (key, val) {
    var result = key;
    if (key === undefined || key === null || key==='null' || key==='undefined')
        result = val;
    return result;
}
exports.http_request_post = function (url,data,req,callback) {
    //var c = new cookie(req.headers.cookie);
    //c.add("mpno","18614059766");
    //c.add("sid",'577d6d92-17b8-4a72-8632-4c1121bd476f');
    //AUTH=mpno=18614059766&sid=bfa0fa3c-56a7-4f80-8b42-24f0d69b4303; test=s%3AqmNaXrp2K719sWAgfgHjUJQSnD3wE_Rs.xsUTtPwpPoyJCnSIazmamzAw%2BcEhUtslb23VFmTmVUI

    //var mpno =c.get('mpno') ;
    //var sid = c.get('sid');
    //'Auth=mpno='+mpno+'&sid='+sid+'&expires=Thu, 07 May 2030 09:51:27 GMT&path=/'
    var options = {
      url: url,
      method:"POST",
      headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': req.headers.cookie,
            'Content-Length': querystring.stringify(data).length
      },form: data
    };
    request(options, callback);
}
exports.http_request_get = function (url,data,req,callback) {
    var options = {
      url: url,
      method:"GET",
      headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': req.headers.cookie,
            'Content-Length': querystring.stringify(data).length
      }
    };
    request(options, callback);
}
exports.set_coin=function(){
}

exports.get_convert_size=function(size){
    var big="";
    var filesize=size/1024 ;
    if(filesize< 1024){
         big=filesize.toFixed(2)+"KB";
    } else {
         big= (filesize/1024).toFixed(2)+"MB";
    }
    return big;
}
exports.get_filename=function(fieldname, filename) {
    var random_string = fieldname + filename + Date.now() + Math.random();
    return crypto.createHash('md5').update(random_string).digest('hex');
};
exports.base64_decode=function(options) {
    var filename=this.get_filename('imgdata','1.jpg')+'.jpg';
    if (!fs.existsSync(options.absolutelydir)) {
      fs.mkdirSync(options.absolutelydir);
    }
    console.log(options.base64str);
    var bitmap = new Buffer(options.base64str, 'base64');
    // write buffer to file
    fs.writeFileSync(options.absolutelydir+'/'+filename, bitmap);
    console.log('******** File created from base64 encoded string ********');
    return options.relativedir+'/'+filename;
}
exports.get_substring=function(options){
    var length=options.length || 50;
    if(options.str.length>length){
        return options.str.substring(0,length)+"...";
    }else{
        return options.str;
    }
}
exports.sendMessage=function(options,callback){
  var rongcloudSDK = require( 'rongcloud-sdk' );
  rongcloudSDK.init( config.rongclound_appkey, config.rongclound_secret );
  rongcloudSDK.message.chatroom.publish('joygo',options.chatroomid,'RC:TxtMsg', JSON.stringify({"content":options.info,"extra":"管理员|"+options.extra+"|"+config.imgsite+"/images/system/default_user.png"}),function(err,resultText){
    var result = JSON.parse( resultText );
    callback(err,result);
  });
}
exports.getOrderNo=function(options){
    var s=options.prefix+parseInt(Math.random()*10)+moment().format("YYMMDDHHmmssSS").toString()+parseInt(Math.random()*10);
    return s;
}