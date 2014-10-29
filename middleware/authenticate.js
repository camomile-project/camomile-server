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



var crypto = require('crypto');

var len = 128;				//Bytesize
var iterations = 12000;

/**
 * Hashes a password with optional `salt`, otherwise
 * generate a salt for `pass` and invoke `fn(error, salt, hash)`.
 *
 * @param {String} password to hash
 * @param {String} optional salt
 * @param {Function} callback
 * @api public
 */

// to hash password
hash = function (pwd, salt, fn) {
  if (3 == arguments.length) {
    crypto.pbkdf2(pwd, salt, iterations, len, fn);
  } else {
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

authenticateElem = function(name, pass, fn) {
    User.findOne({username: name}, function (error, user) {
       	if (user) {
           	if (error)  return fn(new Error('could not find user'));
           	hash(pass, user.salt, function (error2, hash) {
				if (error2) return fn(error2);
            	if (hash == user.hash) return fn(null, user);	
				fn(new Error('invalid password'));
           	});
       	} 
       	else return fn(new Error('could not find this user'));
    }); 
}

exports.login = function (req, res) {
	var username = req.body.username;
	var	pass = req.body.password;
	if (username == undefined || pass == undefined) res.status(400).json({error:"authentication failed, username or password are not define"});
	else {
		authenticateElem(username, pass, function (error, user) {
			if (user) {
				req.session.regenerate(function () {
					req.session.user = user;
					res.status(200).json({message:"You have been successfully logged in as "+username}); 
				});
			} 			
			else res.status(400).json({message:"authentication failed, check your username or password"});
		});
	}
}

exports.logout = function (req, res) {
    if (req.session.user) {
    	var uname = req.session.user.username;
    	req.session.destroy(function () {
        	res.status(200).json({message:uname +" is logged out"});
    	});
    }
}

exports.me = function (req, res) {
    res.status(200).json({message:'user is logged as ' + req.session.user.username});
}

exports.islogin = function (req, res, next) {
    if (req.session.user) next();
    else res.status(400).json( {message:"Acces denied, you are not login"});
}
