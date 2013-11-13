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
