/*
Module Dependencies 
*/
var mongoose = require('mongoose')
   , Schema = mongoose.Schema;

/*
Database and Models
*/
//mongoose.connect("mongodb://localhost/myapp");


exports.GroupSchema = GroupSchema = new Schema({
    groupname: {type:String, lowercase: true, trim: true, required: true},
   	description: {type:String, default: ""},
    usersList: [{ type:String, lowercase: true, trim:true}]
}, { versionKey: false });

exports.Group = Group = mongoose.model('groups', GroupSchema);
