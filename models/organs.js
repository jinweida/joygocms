var mongoose = require('mongoose');
//mongoose.Error.messages.general.required  = "Path `{PATH}` is required.";
var Schema = mongoose.Schema;

var OrgansSchema = new Schema({
		name:{type:String,required: "机关单位是必填项",unique: true},
		pid:{type:String,default:''},
		pics:{type:String,default:''},
		phone:{type:String,default:''},
		level:{type:Number,default:1},
		desc:{type:String,default:''},
		ads:{type:String,default:''},
		email:{type:String,default:''},
		fax:{type:String,default:''},
		createtime: { type: Date, default: Date.now }
	});
exports.organs = mongoose.model('organs', OrgansSchema);