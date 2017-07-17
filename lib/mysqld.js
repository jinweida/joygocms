var config = require('../config');
var mysql = require('mysql');

var pool = mysql.createPool({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    port: 3306
});
console.log("mysql 数据库连接池创建成功");
exports.getConnection = function(callback){
	pool.getConnection(function (err, conn) {
		callback(conn);
	});
};
