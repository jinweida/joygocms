var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DishesSchema = new Schema({
	name:{type:String,default:''},
	pics:{type:String,default:''},	
    mid: { type: String, ref:'posts',default: "" },//栏目id
    price:{type:Number,default:0},
    attr:{type:Number,default:-1},//0=推荐
    createtime: { type: Date, default: Date.now }
});
exports.dishes = mongoose.model('dishes', DishesSchema);