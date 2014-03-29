var mongoose = require('mongoose')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId;
   
/**
 * Modification is a generic type, which can be used to store any kind of data
 */
 
exports.History = HistorySchema = new Schema({
	date : {type: Date, 'default': Date.now},
	name: {type: String, required: true, trim: true, index : true},
	modification: {type: Schema.Types.Mixed, 'default' : '', index : true} 	
}, { versionKey: false }); 

