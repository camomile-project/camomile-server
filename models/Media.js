var mongoose = require('mongoose')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId
   , CorpusSchema = require('./Corpus').CorpusSchema;
/**
 * 
 */
 
exports.MediaSchema = MediaSchema = new Schema({
	//_id: {type:mongoose.Schema.ObjectId, default: new mongoose.Types.ObjectId()},
	id_corpus : {type : ObjectId, ref : 'CorpusSchema'}
	, name: {type: String, required: true, trim: true} 	
}, { versionKey: false });

exports.Media = Media = mongoose.model('Media', MediaSchema);
