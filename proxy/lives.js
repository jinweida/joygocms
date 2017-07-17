var lives = require('../models/lives').lives;
var livesColumns = require('../models/lives').livescolumns;
var livesUsers = require('../models/lives').livesusers;
var livesSetting = require('../models/lives').livessetting;

exports.getFullLives = function(query, select, options, callback) {
    lives.find(query).sort("-createtime").skip(options.skip).limit(options.pagesize).select(select)
        .exec(function(err, models) {
            callback(err, models);
        });
}
exports.getCountByQuery = function(query, callback) {
    lives.count(query, callback);
};

// live users
exports.getUserCountByQuery = function(query, callback) {
    livesUsers.count(query, callback);
};

exports.getLivesUsersByPageAndQuery = function(query, options, callback) {
	console.log(options.pagesize + "," + options.skip);
	livesUsers.find(query).sort("-createtime").skip(options.skip).limit(options.pagesize)
		.exec(function(err, models) {
			callback(err, models);
		});
};

exports.findLivesUserById = function(id, callback) {
    livesUsers.find({
        _id: id
    }).exec(function(err, model) {
        if (err) {
            console.log(err);
        }
        callback(err, model);
    });
};

exports.findLivesUserByMpno = function(mpno, callback) {
    livesUsers.find({
        mpno: mpno
    }).exec(function(err, model) {
        if (err) {
            console.log(err);
        }
        callback(err, model);
    });
};

exports.createLivesUsers = function(model, callback){
	//var _live_user = new livesUsers();
    var _live_user=new livesUsers({
        mpno:model.mpno,
        name:model.name,
        occupation:model.occupation,
        place:model.place,
        idnumber:model.idnumber,
        applyreasons:model.applyreasons,
        rejectreasons:model.rejectreasons,
        status:model.status,
        phone:model.phone,
    });
	_live_user.save(function(err){
        if(err) console.log(err);
        callback(err);
	});
}

//live columns
exports.getColumnsCountByQuery = function (query, callback) {
	livesColumns.count(query, callback);
};

exports.getLivesColumnsByPageAndQuery = function(query, options, callback) {
	livesColumns.find(query).sort("-createtime").skip(options.skip).limit(options.pagesize)
		.exec(function(err, models) {
			callback(err, models);
		});
};

exports.findLivesColumnsById = function(id, callback) {
    livesColumns.find({
        _id: id
    }).exec(function(err, model) {
        if (err) {
            console.log(err);
        }
        callback(err, model);
    });
};

exports.findAllColumns = function(callback) {
    livesColumns.find().sort('order').exec(function(err, models) {
        if (err) console.log(err);
        callback(err, models);
    });
}

exports.remove = function(id, callback) {
    livesColumns.remove({
        "_id": id
    }, function(err, model) {
        if (err) console.log(err);
        callback(err, model);
    });
}

exports.createLivesColumns = function(model, callback) {
    var _live_column = new livesColumns(model);
    _live_column.save(function(err) {
        if (err) console.log(err);
        callback(err);
    });
};

exports.findAllSetting = function(callback) {
    livesSetting.find().exec(function(err, models) {
        if (err) console.log(err);
        callback(err, models);
    });
};

exports.findSettingById = function(id, callback) {
    livesSetting.find({
        _id: id
    }).exec(function(err, model) {
        if (err) {
            console.log(err);
        }
        callback(err, model);
    });
}

exports.saveSetting = function(setObj, callback) {
    var _liveSet = new livesSetting(setObj);
    _liveSet.save(function(err) {
        if (err) console.log(err);
        callback(err);
    });
}
