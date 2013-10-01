var mongoose = require('mongoose')
   ,Schema = mongoose.Schema
   ,ObjectId = Schema.ObjectId;
   
/**
 * 
 */
 
exports.CorpusSchema = CorpusSchema = new Schema({
	//_id: {type:mongoose.Schema.ObjectId, default: new mongoose.Types.ObjectId()},
	name: {type: String, required: true, trim: true} 	
}, { versionKey: false });

exports.Corpus = Corpus = mongoose.model('Corpus', CorpusSchema);
