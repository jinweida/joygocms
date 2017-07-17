var http = require('http');
var querystring = require('querystring')
var response = require('../lib/response');
var config = require('../config');

exports.get_epgs_list = function (req, ress) {
    
    var title = req.query.title;
    var pageindex = req.query.pageindex;
    var qHref = "/epgs/appfuzhou/media/get?columnid=300&sort=time&pagesize=20&token=guoziyun&pageindex=0";
    var data = {
        sort: 'time',
        pagesize: 20,
        token: "guoziyun",
        pageindex:0
    };
    if (title !== undefined && title != "") {
        data.title = encodeURI(title);
    }

    function requestWithTimeout(options, timeout, callback) {
        var timeoutEventId,
            req = http.request(options, function (res) {
                
                res.on('end', function () {
                    clearTimeout(timeoutEventId);
                    console.log('response end...');
                });
                
                res.on('close', function () {
                    clearTimeout(timeoutEventId);
                    console.log('response close...');
                });
                
                res.on('abort', function () {
                    console.log('abort...');
                });
                
                callback(res);
            });
        
        req.on('timeout', function (e) {
            if (req.res) {
                req.res('abort');
            }
            req.abort();
        });
        
        
        timeoutEventId = setTimeout(function () {
            req.emit('timeout', { message: 'have been timeout...' });
        }, timeout);
        
        return req;
    }
    
    var options = {
        host: config.video.url,
        port: config.video.port,
        method: 'GET',
        path: qHref,
        headers: {            
            'Content-Type': 'application/json',
            'Content-Length': querystring.stringify(data).length
        } ,
        secureProtocol: 'SSLv3_method'
    };
    console.log(options);
    var pagedata = "";
    var reqs = requestWithTimeout(options, 6000, function (res) {
        res.on('data', function (chunk) {
            pagedata += chunk;
            console.log(pagedata);
            
        });
        res.on('end', function () {            
            response.success(ress, JSON.parse(pagedata));
        })
    });
    
    reqs.on('error', function (e) {
        console.log('error got :' + e.message);
    }).on('timeout', function (e) {
        console.log('timeout got :' + e.message);
    });
    
    reqs.end();


}

