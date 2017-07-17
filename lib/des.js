var crypto = require('crypto')
var key = "joygo";
var moment = require('moment');
//加密
exports.cipher=function(buf){
    var encrypted = "";
    var cip = crypto.createCipher('aes-256-cbc', key);
    encrypted += cip.update(buf, 'binary', 'hex');
    encrypted += cip.final('hex');
    return encrypted
}
//解密
function decipher(encrypted){
    var decrypted = "";
    try {
        var decipher = crypto.createDecipher('aes-256-cbc', key);
        decrypted += decipher.update(encrypted, 'hex', 'binary');
        decrypted += decipher.final('binary');
        return decrypted
    } catch(e) {
        return decrypted
    }
}
exports.token=function (req, res, next) {
    var token=req.body.token || req.query.token;
    if (!token) {
        return res.send("tonken empty");
    } else {
        var flag = false;
        var user=decipher(token)
        if (!user) {
            return res.send({code:3,message:'请重新登录'});
        }
        user=user.split('|')
        var time=moment().format('X')-user[2]
        if (time>=1200) {
            return res.send({code:3,message:'请重新登录'});
        }else{
          flag = true
          req.user_login=user[0]
        }
        if (flag) {
            next();
        } else {
            return res.send({code:3,message:'请重新登录'});
        }
    }
}