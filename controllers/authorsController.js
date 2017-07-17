var Authors = require('../models/authors').authors;
var response = require('../lib/response');
var comm = require('../lib/comm');
var moment = require('moment');

exports.add = function (req,res) {
    res.render('admin/authors_add', {
        title: "添加自媒体作者",
    });
}
exports.create = function (req, res) {
    var authors = new Authors();
    authors.name = req.body.authors_name
    authors.phone = req.body.authors_phone;
    authors.desc = req.body.authors_desc;
    authors.img = req.body.authors_img;
    authors.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            response.success(res, authors._id);
        }
    });
}
exports.edit = function (req, res) {
    var _id = req.query._id;

    Authors.findOne({ _id: _id })
    .exec(function (err, model) {
        if (err || !model) {
        }
        model.createtime = moment(model.createtime).format('YYYY-MM-DD HH:mm:ss');
        
        res.render('admin/authors_edit', {
            title: "修改自媒体作者",
            model: model
        });
    });
}
exports.update = function (req, res) {
    var authors = new Authors();
    authors._id = req.body.authors_id;
    authors.name = req.body.authors_name
    authors.phone = req.body.authors_phone;
    authors.desc = req.body.authors_desc;
    authors.img = req.body.authors_img;
    Authors.update({ _id: authors._id }, authors, function (err) {
        if (err) {            
            response.error(res, err);   
        }
        response.success(res, authors._id);
    });   
}
exports.delete = function (req, res) {
    var _ids = req.body._ids;
    var reg = /,/;
    var _idarray = _ids.split(reg);
    var success_num = 0;
    var err_num = 0;
    _idarray.forEach(function (_id) {
        Authors.remove({ _id: _id }, function (err) {
            if (err) {
                err_num++;
            } else {
                success_num++;
            }
        });
    });
    response.success(res, {});
}
exports.list = function (req, res) {
    try {
        var options = comm.get_page_options(req);
        var name = req.query.authors_name;
        var where = {};
        if (name !== "" && name !== undefined) {
            where.name = { $regex: name, $options: 'i' };
        }
        Authors.count(where, function (error, count) {
            if (error) {
            } else {
                Authors.find(where).sort("-createtime").limit(options.pagesize)
            .exec(function (err, models) {
                    models.forEach(function (node, index) {
                        var node = node.toObject();
                        node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
                        node.index = options.skip + index + 1;
                        models[index] = node;
                    })
                    res.render('admin/authors_list', {
                        title: "自媒体作者",
                        pagecount: Math.ceil(count / options.pagesize),
                        pagesize: options.pagesize,
                        models: models,
                        name:name
                    });
                });
            
            }
        });
    } catch (e) {
        console.log('error when exit', e.stack);
    }
}
exports.ajax_get_authors_list = function (req, res) {
    
    var options = comm.get_page_options(req);    
    var name = req.query.authors_name;
    var where = {};
    if (name !== "" && name !== undefined) {
        where.name = { $regex: name, $options: 'i' };
    }
    Authors.find(where).sort("-createtime").skip(options.skip).limit(options.pagesize)
            .exec(function (err, models) {
        if (err || !models) {
            return response.error(res, {});
        }
        
        models.forEach(function (node, index) {
            var node = node.toObject();
            node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
            node.index = options.skip + index + 1;
            models[index] = node;
        })
        response.success(res, models);
    });
            
}