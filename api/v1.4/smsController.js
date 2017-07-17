var response = require('../../lib/response');
var comm = require('../../lib/comm');
var config = require('../../config');
var request = require('request');
var appkey="fuzhoutv";
var param={
    appkey:"fuzhoutv",
    url:"http://120.26.201.218:8001"
}
/**
 *　 应用名称  APPKEY
      福州  自贸区进口商城 fuzhoushop
        福视悦动  fuzhoutv
      红河  红视商城  hongheshop
        红河电视台 honghetv
      秦皇岛 秦币商城  qinhuangdaoshop
        秦皇岛手机台  qinhuangdaotv
      鹰潭  网上商城  yingtanshop
        鹰视天下  yingtantv
      乐山  网上商城  leshanshop
        视听乐山  leshantv
      泉州  网上商城  quanzhoushop
        无线泉州  quanzhoutv
      吉林教育  网上商城  jilinjiaoyushop
        好上网 jilinjiaoyutv
      广西  美丽天下购 guangxishop
        美丽天下  guangxitv
      淮南  乐购商城  huainanshop
        淮南发布  huainantv
      青海汉语  青海好物产 qinghaihanyushop
        三江源 qinghaihanyutv
      青海藏语  ཀུན་འདུས་ཚོང་ཁྲོམ།  qinghaizangyushop
        雪域明镜གངས་ལྗོངས་མེ་ལོང་།  qinghaizangyutv
      海南  蓝网手机商城  hainanshop
        海南新闻  hainantv
      张掖  金视商城  zhangyeshop
        LOVE张掖  zhangyetv
      宜春  宜广商城  yichunshop
        宜广传媒  yichuntv
      贵州  贵视商城  guizhoushop
        贵视生活宝 guizhoutv
      四平  网上商城  sipingshop
        掌沃四平  sipingtv
      太原  福币商城  taiyuanshop
        悦动龙城  taiyuantv
      辽宁  瓢虫汇-商城  liaoningshop
        瓢虫汇 liaoningtv
      　 创星工厂  cxgc

 *
 */
//上传xml内容
var Sms={
  get_sms_code:function(req,res){
    var body={
      mobileno:req.query.mobileno,appkey:param.appkey,funccode:req.query.funccode || 'regcheck'
    }
    request.get({url:param.url+'/sms/getvalidatecode',
      form:body
    },function(err,response, body){
      console.log(err);
      if(err)return res.send({ "code": 1 ,message:"err"});
      var info=JSON.parse(body);
      if(info.success){
        return res.send({ "code": 1 ,message:'success'});
      }else{
        return res.send({ "code": 1 ,message:info.message});
      }
    });
  },
  get_sms_verification:function(req,res){
    var body={
        mobileno:req.query.mobileno,appkey:param.appkey,code:req.query.code,funccode:req.query.funccode || 'regcheck'
    }
    request.get({url:param.url+'/sms/validatecode',
        form:body
    },function(err,response, body){
      console.log(err);
      if(err)return res.send({ "code": 1 ,message:"err"});
      var info=JSON.parse(body);
      if(info.success){
        return res.send({ "code": 1 ,message:'success'});
      }else{
        return res.send({ "code": 1 ,message:info.message});
      }
    });
  }
}
module.exports=Sms;