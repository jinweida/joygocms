/**
 * Created by Leo on 14-11-10.
 */

exports.success = function (res, message) {
  var result = {};
	result.code = 0;
	result.message = message || '操作成功';
	res.json(result);
};

exports.error = function (res, err) {
	var result = {};
	var errors = err.errors || [err];
	var keys = Object.keys(errors);
	var message = '';

	if (!keys) {
		message = '操作失败';
	} else {

		var errs = [];
		keys.forEach(function (key) {
			if (errors[key]) {
				errs.push(errors[key].message);
			}
        });

		message = errs.join(', ');
	}
	result.code = -1;
	result.message = message;
	res.json(result);
};
exports.api = function (res,json,models) {
    json.list = models;
    var code = 1;
    json.code = code;
    res.setHeader('Content-Type', 'application/json');
    res.json(json);
};
exports.apidetail = function (res, json, models) {
    json.data = models;
    var code = 1;
    json.code = code;
    res.setHeader('Content-Type', 'application/json');
    res.json(json);
};
exports.handle = function (res, err) {
	if (err)
		this.error(res, err);
	else
		this.success(res);
};
exports.onListSuccess = function (res,options) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('X-Powered-By', 'JINWEIDA');
  res.setHeader('Server', 'Server');
  res.setHeader('Content-Type', 'application/json');
  var result={
    code:200,
    list:options.list,
    message:"ok"
  };
  if(options.count)result.count=options.count;
  if(options.data)result.data=options.data;
  res.jsonp(result);
};
exports.onDataSuccess = function(res,options){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('X-Powered-By', 'JINWEIDA');
  res.setHeader('Server', 'Server');
  res.setHeader('Content-Type', 'application/json');

  res.jsonp({
    code:200,
    data:options.data,
    message:"ok"
  });
};
exports.onSuccess = function(res, message){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('X-Powered-By', 'JINWEIDA');
  res.setHeader('Server', 'Server');
  var result = {};
  result.code = 200;
  result.message = message || '操作成功';
  res.jsonp(result);
};
exports.onError = function(res, err){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('X-Powered-By', 'JINWEIDA');
  res.setHeader('Server', 'Server');
  res.setHeader('Content-Type', 'application/json');
  var result = {};
  var errors = err.errors || [err];
  var keys = Object.keys(errors);
  var message = '';
  if (!keys) {
    message = '操作失败';
  } else {
    var errs = [];
    keys.forEach(function (key) {
      if (errors[key]) {
        errs.push(errors[key].message);
      }
    });
    message = errs.join(', ');
  }
  result.code = 500;
  result.message = message;
  res.json(result);
};

// var audit={
//   onListSuccess:function (res,options) {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//     res.setHeader('X-Powered-By', 'JINWEIDA');
//     res.setHeader('Server', 'Server');
//     res.setHeader('Content-Type', 'application/json');
//     var result={
//       code:200,
//       list:options.list,
//       message:"ok"
//     };
//     if(options.count)result.count=options.count;
//     if(options.data)result.data=options.data;
//     res.jsonp(result);
//   },
//   onDataSuccess:function(res,options){
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//     res.setHeader('X-Powered-By', 'JINWEIDA');
//     res.setHeader('Server', 'Server');
//     res.setHeader('Content-Type', 'application/json');

//     res.jsonp({
//       code:200,
//       data:options.data,
//       message:"ok"
//     });
//   },
//   onSuccess:function(res, message){
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//     res.setHeader('X-Powered-By', 'JINWEIDA');
//     res.setHeader('Server', 'Server');
//     var result = {};
//     result.code = 200;
//     result.message = message || '操作成功';
//     res.jsonp(result);
//   },
//   onError:function(res, err){
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//     res.setHeader('X-Powered-By', 'JINWEIDA');
//     res.setHeader('Server', 'Server');
//     res.setHeader('Content-Type', 'application/json');
//     var result = {};
//     var errors = err.errors || [err];
//     var keys = Object.keys(errors);
//     var message = '';
//     if (!keys) {
//       message = '操作失败';
//     } else {
//       var errs = [];
//       keys.forEach(function (key) {
//         if (errors[key]) {
//           errs.push(errors[key].message);
//         }
//       });
//       message = errs.join(', ');
//     }
//     result.code = 500;
//     result.message = message;
//     res.json(result);
//   },
// }

// module.exports =audit; 