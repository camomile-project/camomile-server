var mongoose = require('mongoose')
   ,Schema = mongoose.Schema
   ,ObjectId = Schema.ObjectId;
   
/**
 * 
 */
 
exports.History = HistorySchema = new Schema({
	//_id: {type:mongoose.Schema.ObjectId, default: new mongoose.Types.ObjectId()},
	date : {type: Date, 'default': Date.now}, 
	name: {type: String, required: true, trim: true} 	
}, { versionKey: false });

//exports.History = History = mongoose.model('Corpus', CorpusSchema);
