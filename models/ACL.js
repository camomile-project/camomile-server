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

/*
Module Dependencies 
*/
var mongoose = require('mongoose')
   , Schema = mongoose.Schema;


userRightsSchema =  new Schema({
	login : {type:String, lowercase: true, trim: true, required: true},
	right : {type:String, uppercase: true, trim: true, required: true}
}, { versionKey: false });

groupRightsSchema =  new Schema({
	login : {type:String, lowercase: true, trim: true, required: true},
	right : {type:String, uppercase: true, trim: true, required: true}
}, { versionKey: false });


exports.ACLSchema = ACLSchema = new Schema({
    id: {type:String, required: true, index: true},
    users: [userRightsSchema],
    groups: [groupRightsSchema]
}, { versionKey: false });

exports.ACL = ACL = mongoose.model('ACLs', ACLSchema);
