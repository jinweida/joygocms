var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CoinsSchema = new Schema({
    rule: [{
            key: { type: String, default: '' },
            val: { type: String, default: '' },
        }],    
    content: { type: String, default: '' }
});
exports.coins = mongoose.model('coins', CoinsSchema);