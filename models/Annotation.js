var mongoose = require('mongoose')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId
   , LayerSchema = require('./Layer').LayerSchema
   , HistorySchema = require('./History').HistorySchema;
/**
 * 
 */
 
exports.AnnotationSchema = AnnotationSchema = new Schema({
//	_id: {type:mongoose.Schema.ObjectId, default: new mongoose.Types.ObjectId()},
	id_layer : {type : ObjectId, ref : 'LayerSchema'}
	, fragment : {type : Schema.Types.Mixed, index : true, 'default' : ''}	
	, data : {type : Schema.Types.Mixed, 'default' : ''}
	, history : [HistorySchema]	
}, { versionKey: false });

exports.Annotation = Annotation = mongoose.model('Annotation', AnnotationSchema);
