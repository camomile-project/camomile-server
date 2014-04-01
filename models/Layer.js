/*
The MIT License (MIT)

Copyright (c) 2013-2014 CNRS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

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
