var mongoose = require('mongoose')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId
   , CorpusSchema = require('./Corpus').CorpusSchema;
/**
 * Url is the relative path to the media (video)
 */
 
exports.MediaSchema = MediaSchema = new Schema({
	id_corpus : {type : ObjectId, ref : 'CorpusSchema'}
	, name: {type: String, required: true, trim: true}
	, url : {type: String, default:""} 	
}, { versionKey: false });

exports.Media = Media = mongoose.model('Media', MediaSchema);
