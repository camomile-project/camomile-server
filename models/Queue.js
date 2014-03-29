var mongoose = require('mongoose')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId;

   
/**
 * Schema for queue, which can be contain any kinds of data
 */


exports.QueueSchema = QueueSchema = new Schema({
	name: {type: String, required: true, trim: true},
	queue: [Schema.Types.Mixed]//[annoID] 	
}, { versionKey: false });

exports.Queue = Queue = mongoose.model('Queue', QueueSchema);

