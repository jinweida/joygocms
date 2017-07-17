var Columns = require('../models/columns').columns;
var response = require('../lib/response');
var moment = require('moment');
var config = require('../config');
var Operatorlogs = require('../proxy/operatorlogs');
var validator = require('validator');
var Regs=require('../models/regs').regs;
var Awards=require('../models/regs').awards;
var comm = require('../lib/comm');
var eventproxy = require('eventproxy');
//报名表加载
exports.regs_list = function (req, res) {
    try {
        Regs.find().sort("-createtime")
        .exec(function (err, models) {
            models.forEach(function (node, index) {
                var node = node.toObject();
                node.createtime = moment(node.createtime).format('YYYY-MM-DD HH:mm:ss');
                node.index = index + 1;
                models[index] = node;
            })
            res.render('admin/registration', {
                title: '报名表',
                regs: models,
            });
        });
    } catch (e) {
        console.log('error when exit', e.stack);
    }
};
//彩票
exports.awards_list=function(req,res){
    return res.render('admin/posts/awards',{
        title:'福州彩票'
    })
}
exports.awards_list_ajax=function(req,res){
    try {
        var mpno=validator.trim(req.body.mpno);
        var no=validator.trim(req.body.no);
        var proxy = new eventproxy();
        var options = comm.get_page_options(req);
        proxy.all('count','list',function(count,list){
            list.forEach(function (node, index) {
                var node = node.toObject();
                node.createtime = moment(node.createtime).format('MM-DD HH:mm');
                list[index] = node;
            })
            return response.success(res,{
                pagecount: Math.ceil(count / options.pagesize),
                currentpage:options.currentpage,
                list: list
            });
        });
        var where={};
        if (no !== '')where.no=no;
        if (mpno !== '')where.mpno=mpno;
        var query=Awards.find(where).sort('-no');
        query.skip(options.skip).limit(options.limit)
        .exec(proxy.done(function(models) {
            proxy.emit('list',models);
        }));
        Awards.count(where,proxy.done(function (count) {
            proxy.emit('count',count);
        }));
    }catch (e) {
        console.log('error when exit', e.stack);
    }
}
//加载全部类别的中间件
exports.loadAll = function (req, res, next) {
    Columns.find().sort("order")
		.exec(function (err, models) {
        req.columns = recursive_list(models,[],0);
        next();
    });
};
//加载允许上架的
exports.loadStatusAll=function(req,res,next){
    Columns.find({pubstatus:1}).sort("order")
        .exec(function (err, models) {
        req.columns = recursive_list(models,[],0);
        next();
    });
}

exports.add = function (req, res) {
    var _id = req.query._id;
    var model = new Columns();
    req.columns.forEach(function (node, index) {
        if (node._id == _id) {
            node.display='none';
            model = node;
            return;
        }
    });
    res.render('admin/columns_add', {
        title: "创建栏目",
        columns: req.columns,
        model: model,
        listtype: config.listtype,
        menutype: config.menutype,
        menuposition: config.menuposition
    });
};
exports.create = function (req, res) {
    //1426757930796
    var columns = new Columns();
    var pl = req.body.columns_pid;
    var reg = /,/;
    var plarray = pl.split(reg);
    _id = req.body.columns_id;
    if (!validator.isInt(_id)) {
        return response.error(res, {message:"columns_id:编号必须是数字"});
    }
    if (!validator.isInt(_id,{min:1})) {
        return response.error(res, {message:"columns_id:编号必须必须大于0"});
    }
    if (!validator.trim(req.body.columns_name)) {
        return response.error(res, { message: "columns_name:栏目名称是必填项" });
    }
    if (!validator.isInt(req.body.columns_order)) {
        return response.error(res, { message: "columns_order:排序必须是数字" });
    }
    if (!validator.isInt(req.body.columns_menuorder)) {
        return response.error(res, { message: "columns_menuorder:菜单排序必须是数字" });
    }
    columns._id = _id;
    columns.name = validator.trim(req.body.columns_name);
    columns.order = req.body.columns_order;
    columns.menuorder = req.body.columns_menuorder;
    columns.listtype = req.body.columns_type;
    columns.pics = validator.trim(req.body.columns_pics);
    columns.icon = validator.trim(req.body.columns_icon);
    columns.menutype = validator.trim(req.body.columns_menutype);
    columns.url = validator.trim(req.body.columns_url);
    columns.upstatus = req.body.columns_upstatus;
    columns.adstatus = req.body.columns_adstatus;
    columns.pubstatus = req.body.columns_pubstatus;
    columns.commentstatus = req.body.columns_commentstatus;
    columns.position = req.body.columns_position;
    columns.status=   req.body.columns_status;
    columns.pid = plarray[0];
    columns.level = plarray[1];
    columns.createtime = moment.utc().valueOf();
    columns.isslide=req.body.columns_isslide;
    columns.isselect=req.body.columns_isselect;
    columns.haschild=req.body.columns_haschild;
    columns.istitle=req.body.columns_istitle;
    columns.isshow=req.body.columns_isshow;
    Columns.update({_id:_id},columns.toObject(),{ upsert: true },function (err) {//modify by liubo
        console.log(err);
        if (err) {
            response.error(res, err);
        } else {
            response.success(res, _id);
        }
    });
};
//隐藏or显示
exports.delete = function (req, res) {
    // 逻辑删除
    Columns.update({ _id: req.query._id }, { status: req.query.status }, function (err) {
        //response.handle(res, err);
        var desc = !parseInt(req.query.status)?"【显示】":"【隐藏】";
         desc = "修改栏目分类状态 _id:" + req.query._id + " 状态改为："+ desc;
        Operatorlogs.save({
            desc: desc,
            user_login: req.session.user.user_login
        });
        res.redirect('/admin/columns');
    });
};
//删除了
exports.remove = function (req, res) {
    var _id=req.body._id;
    Columns.find({pid:_id}).exec(function(err,models){
        if(err){
            response.error(res, err);
        }
        //判断是否有子类，需要先删除子类
        if(models.length>0){
            response.error(res, {message:'请先删除子类'});
        }else{
            Columns.remove({ _id: _id }, function (err) {
            });
            Operatorlogs.save({
                desc: "删栏目 _id:" + _id,
                user_login: req.session.user.user_login
            });
            response.success(res, _id);
        }
    })
};
exports.list = function (req, res) {
    try {
        Columns.find()
		.sort('order -id')
		.exec(function (err, models) {
            res.render('admin/columns_list', {
                title: '栏目分类',
                columns: err ? [] : recursive_list(models,[],0),
                listtype:config.listtype,
            });
        });
    } catch (e) {
        console.log('error when exit', e.stack);
    }

};
exports.ajax_get_columns_list = function (req, res) {
    var where = { status: 0,pubstatus:1};
    Columns.find(where).select({ name: 1, _id: 1, pid: 1 })
		.sort('order')
		.exec(function (err, models) {
        var parent = { "id": "0", "text": "栏目分类", "parent": "#",state:{ opened:true}};
        var json=[];
        var m=recursive(models,json,0);
        res.send(m);
    });
};

function recursive(models,json,pid){
    models.forEach(function (node, i) {
        if (node != null) {
            var node = node.toObject();
            var item={};
            if(node.pid==pid){
                item.text=node.name;
                item.id=node._id;
                item.parent=node.pid;
                if(pid===0){
                    item.parent="#";
                }
                json.push(item)
                recursive(models,json,node._id);
            }
        }
    });
    return json;
}
function recursive_list(models,json,pid){
    models.forEach(function (node, i) {
        if (node != null) {
            var node = node.toObject();
            var item={};
            if(node.pid==pid){
                json.push(node)
                recursive_list(models,json,node._id);
            }
        }
    });
    return json;
}
