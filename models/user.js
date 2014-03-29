/*
Module Dependencies 
*/
var mongoose = require('mongoose')
   , Schema = mongoose.Schema;

/*
Database and Models
*/
//mongoose.connect("mongodb://localhost/myapp");


exports.UserSchema = UserSchema = new Schema({
    username: {type:String, lowercase: true, trim: true, required: true},
   // password: String, //dont need to know, and should not know:D
    affiliation: String,
    role: String,
    salt: String,
    hash: String
}, { versionKey: false });

exports.User = User = mongoose.model('users', UserSchema);
