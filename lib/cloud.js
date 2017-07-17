
var Medias = require('../models/medias').medias;
var Lives = require('../models/lives').lives;
var config = require('../config');
var url = require('url');
var querystring = require('querystring');
var cookie = require('./cookie.js');
var http = require('http');
var request = require('request');
var fs = require("fs");
var crypto = require('crypto');
var request = require('request');
//杰格云端
exports.get_remote_medias=function(options,callback){
    var url=config.joygo_cloud_url+"/api/get_cloud?page="+options.page+"&pagesize="+options.pagesize;
    request(url, function (error, response, body) {
      var list=[];
      if (!error && response.statusCode == 200) {
        var info=JSON.parse(body);
        info.list.forEach(function(node,index){
            list.push(new Medias(node));
        })
      }
      callback(error,list);
    })
}
exports.get_lives=function(options,callback){
  var url=config.joygo_cloud_url+"/api/get_cloud_lives";
  if(options)url+="?page="+options.page+"&pagesize="+options.pagesize;
  console.log(url);
  request(url, function (error,response, body) {
    var list=[];
    if (!error && response.statusCode == 200) {
        var info=JSON.parse(body);
        info.list.forEach(function(node,index){
            list.push(new Lives(node));
        })
    }
    callback(error,list);
  })
}