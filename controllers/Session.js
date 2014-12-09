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

var User = require('../models/User');
var Group = require('../models/Group');
var Corpus = require('../models/Corpus');
var Media = require('../models/Media');
var Layer = require('../models/Layer');
var Annotation = require('../models/Annotation');
var Queue = require('../models/Queue');

var crypto = require('crypto');

var len = 128;				//Bytesize
var iterations = 12000;

// to hash password
hash = function (pwd, salt, fn) {
	if (arguments.length == 3) crypto.pbkdf2(pwd, salt, iterations, len, fn);		// if salt is known
  	else {																			// else generate a new salt
    	fn = salt;
    	crypto.randomBytes(len, function(error, salt){
			if (error) return fn(error);
			salt = salt.toString('base64');
			crypto.pbkdf2(pwd, salt, iterations, len, function(error2, hash){
				if (error2) return fn(error);
				fn(null, salt, hash);
			});
		});
	}
};

// check if login and pasword correspond
authenticateElem = function(name, pass, fn) {
    User.findOne({username: name}, function (error, user) {							// find the first user with username
       	if (user) {
           	if (error)  return fn(new Error('could not find user'));
           	hash(pass, user.salt, function (error2, hash) {							// ask the hash for this user
				if (error2) return fn(error2);
            	if (hash == user.hash) return fn(null, user);						// check if the 2 hash correspond
				fn(new Error('invalid password'));
           	});
       	} 
       	else return fn(new Error('could not find this user'));
    }); 
}

// login
exports.login = function (req, res) {
	if (req.body.username == undefined || req.body.password == undefined) res.status(400).json({error:"authentication failed, username or password are not define"});
	else {
		authenticateElem(req.body.username, req.body.password, function (error, user) {
			if (user) {
				req.session.regenerate(function () {
					req.session.user = user;
					res.status(200).json({message:"You have been successfully logged in as "+req.body.username}); 
				});
			} 			
			else res.status(400).json({message:"authentication failed, check your username or password"});
		});
	}
}

// logout
exports.logout = function (req, res) {
	var username = req.session.user.username;
	req.session.destroy(function () {
		res.status(200).json({message:username +" is logged out"});
	});
}

// to now who is logged in
exports.me = function (req, res) {
    res.status(200).json({_id:req.session.user._id, 
    					  username:req.session.user.username,
    					  role:req.session.user.role,
    					  description:req.session.user.description
    					});
}

// check if a user is logged in
exports.islogin = function (req, res, next) {
    if (req.session.user) next();
    else res.status(400).json( {message:"Acces denied, you are not logged in"});
}
