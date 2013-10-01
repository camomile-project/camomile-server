var mongoose = require('mongoose')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId
   , MediaSchema = require('./Media').MediaSchema
   , HistorySchema = require('./History').HistorySchema;
/**
 * 
 */
 
exports.LayerSchema = LayerSchema = new Schema({
	//_id: {type:mongoose.Schema.ObjectId, default: new mongoose.Types.ObjectId()},
	id_media : {type : ObjectId, index : true, ref : 'MediaSchema'}
	, layer_type : {type: String, required: true, trim: true} 
	, fragment_type : {type : String, 'default' : 'segment'}
	, data_type : {type : String, 'default' : 'label'}
	, source : {type : Schema.Types.Mixed, 'default' : ''}	
	, history : [HistorySchema]
}, { versionKey: false });

exports.Layer = Layer = mongoose.model('Layer', LayerSchema);
