/*
Module Dependencies
*/
var mongoose = require('mongoose')
   , Schema = mongoose.Schema;

/*
Database and Models
*/

exports.UserSchema = UserSchema = new Schema({
    username: {type:String, lowercase: true, trim: true, required: true},
    affiliation: String,
    role: String,
    salt: String,
    hash: String
}, { versionKey: false });

exports.User = User = mongoose.model('users', UserSchema);
