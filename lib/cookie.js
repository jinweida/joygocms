
function HttpCookie(cookie) {
    this.hashtable = {};
    var _this = this;
    //分解http请求内的cookie，其格式为 name=value; name=value; ...
    cookie && cookie.split(';').forEach(function (c) {
        var pair = c.split('=');
        _this.hashtable[pair[0].trim()] = [pair[1].trim(), {}];
    });
};
HttpCookie.prototype.add = function (name, value, options) {
    options || (options = {});
    //m_has.call(options, 'path') || (options.path = '/');
    this.hashtable[name] = [value, options];
};
HttpCookie.prototype.remove = function (name) {
    var options = this.hashtable[name] && this.hashtable[name][1] || {};
    options[MAX_AGE] = 0;
};
HttpCookie.prototype.toArray = function (callback) {
    var cookies = [];
    for (var k in this.hashtable) {
        var sb = [];
        sb.push(m_util.format(FORMAT, k, this.hashtable[k][0]));
        var options = this.hashtable[k][1];
        for (var op_k in options) {
            sb.push(m_util.format(FORMAT, op_k, options[op_k]));
        }
        cookies.push(sb.join('; '));
    }
    callback(cookies);
};
HttpCookie.prototype.get = function (name,callback) {
    return (this.hashtable[name] && this.hashtable[name][0] || '');
};

module.exports = HttpCookie;

//var MyUtil = function () {
//};
//var http = require('http');
//var request = require('request');
//MyUtil.prototype.get = function (url, callback) {
//    request(url, function (error, response, body) {
//        if (!error && response.statusCode == 200) {
//            callback(body, response.statusCode);
//        }
//    })
//}
//module.exports = new MyUtil();