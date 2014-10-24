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

var async = require('async');

//check if the current user is admin
exports.currentUserIsAdmin = function(req, res, next) {
	if (req.session.user.role === "admin") next();
	else res.status(400).json({message:"Acces denied, you are not an admin user"});
}

//check if the current user is root
exports.currentUserIsroot = function(req, res, next) {
	if (req.session.user.username === "root") next();
	else res.status(400).json({message:"Acces denied, you are not an admin user"});
}

//check if a id_user exists
exports.exist = function(req, res, next) {
	User.findById(req.params.id_user, function(error, user){
		if (error) res.status(400).json(error);
		else if (!user) res.status(400).json({"message":"id_user don't exists"});
		else next();
	});
}

// only print username, role and description
printRes = function(user, res) {
	var p = {
		"username":user.username,
		"role":user.role,
		"description":user.description
	};
	res.status(200).json(p);
}

// create a user
exports.create = function (req, res) {
	var error=null;
	async.waterfall([
		function(callback) {
			if (req.body.username == undefined) 						error="the username is not define";
			if (req.body.username == "") 								error="empty string for username is not allow";
			if (req.body.password == undefined)							error="the password is not define";
			if (req.body.password == "") 								error="empty password for username is not allow";
			if (req.body.role == undefined) 							error="the role is not define";
			if (req.body.role != 'admin' && req.body.role != 'user')	error="the role must be 'user' or 'admin'";	
			callback(error);
		},
		function(callback) {
			User.count({username: req.body.username}, function (error, count) {	
				if ((!error) && (count != 0)) error = "the username is already used, choose another name";
		        callback(error);
		    });
		},
		function(callback) {
			hash(req.body.password, function (error, salt, hash) {
				callback(error, salt, hash);
			});			
		},
		function(salt, hash, callback) {
			var user = new User({
				username: req.body.username,
				description: req.body.description,
				role: req.body.role,
				salt: salt,
				hash: hash,
			}).save(function (error, newUser) {
				if (newUser) printRes(newUser, res);
				callback(error);
			});			
		}
	], function (error) {
		if (error) res.status(400).json({"message":error});
	});
}

// retrieve all users
exports.getAll = function (req, res) {	
	User.find({}, 'username role description', function (error, users) {
    	if (error) res.status(400).json({error:"error", message:error});
    	if (users) res.status(200).json(users);
		else res.status(200).json([]);
	});
}

//retrieve a particular user (with id)
exports.getInfo = function(req, res){
	User.findById(req.params.id_user, function(error, user){
		printRes(user,res);
	});
}

//update information of a user
exports.update = function(req, res){
	var error;
	var update = {};
	async.waterfall([		
		function(callback) {
			if (req.body.password == "") 												error="empty password for username is not allow";
			if (req.body.role && req.body.role != 'admin' && req.body.role != 'user')	error="the role must be 'user' or 'admin'";	
			callback(error);
		},
		function(callback) {
			User.findById(req.params.id_user, function(error, user){
				if (req.body.role && user.username == "root") 	error = "change the role of this id_user is not allowed"
				else if (req.body.role) 						update.role = req.body.role
				callback(error, update);
			});
		},
		function(update, callback) {
			if (req.body.password) {
				hash(req.body.password, function (error, salt, hash) {
					if (req.body.password) {
						update.salt = salt;
						update.hash = hash;	
					}
					callback(error, update);				
				});
			}
			else callback(error, update);
		},
		function(update, callback) {
			if (req.body.description) update.description = req.body.description;
			User.findByIdAndUpdate(req.params.id_user, update, function (error, user) {
				if (!error) printRes(user, res);
				callback(error)
			});			
		}
	], function (error) {
		if (error) res.status(400).json({"message":error});
	});
}

// delete a user
exports.remove  = function(req, res){
	var error;
	async.waterfall([		
		function(callback) {
			User.findById(req.params.id_user, function(error, user){
				if (user.username == "root") error = "You can't delete the root user"
				callback(error);
			});
		},
		function(callback) {
			User.remove({_id : req.params.id_user}, function (error, user) {
				if (!error && user == 1) res.status(200).json({message:"The user as been delete"});
				callback(error);
			});
		}
		// delete user from acl
		// delete user from group
	], function (error) {
		if (error) res.status(400).json({"message":error});
	});
}

//retrieve the list of group of a particular user (with id)
exports.getAllGroupOfAUser = function(req, res){
	User.findById(req.params.id_user, 'username affiliation role', function(error, user){
		if (error) res.status(400).json({error:"error", message:error});
		else {			
			Group.find({'users_list' : {$regex : new RegExp('^'+ req.params.id_user + '$', "i")}}, function(error2, Groups) {
				if (error2) res.status(400).json({error:"error", message:error2});
				else res.status(200).json(Groups);
			});
		}
	});
}
