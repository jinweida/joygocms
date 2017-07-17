var config = require('../config');
var redis = require('redis');
var password="#joygo#$.123";
var client = redis.createClient(config.redis.port, config.redis.host);
client.auth(config.redis.password,function(err){

    console.log('redis通过认证');
});
exports = module.exports = client;
