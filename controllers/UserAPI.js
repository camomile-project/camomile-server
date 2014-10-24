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

exports.currentUserIsAdmin = function(req, res, next) {
	if (req.session.user.role == "admin") return next();
	else res.status(400).json( {message:"Acces denied, you are not an admin user"});
}

//check if a id_user exists
exports.exist = function(req, res, next) {
	User.findById(req.params.id_user, 'username affiliation role', function(error, data){
		if (!error) next();
		else res.status(400).json({"message":"id_user don't exists"});
	});
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
				if (newUser) res.status(200).json(newUser);
				callback(error);
			});			
		}
	], function (error) {
		if (error) res.status(400).json({"message":error});
	});
}

printRes = function(data, res) {
	var p = {
		"username":data.username,
		"role":data.role,
		"description":data.description
	};
	res.status(200).json(p);
}

// retrieve all users
exports.getAll = function (req, res) {	
	User.find({}, 'username role affiliation', function (error, users) {
    	if (error) res.status(400).json({error:"error", message:error});
    	if (users) res.status(200).json(users);
		else res.status(200).json([]);
	});
}

//retrieve a particular user (with id)
exports.getInfo = function(req, res){
	User.findById(req.params.id_user, function(error, data){
		printRes(data,res);
	});
}

exports.update = function(req, res){
	var error;
	var update = {};
	async.waterfall([		
		function(callback) {
			if (req.body.password == "") 								error="empty password for username is not allow";
			if (req.body.role && req.body.role != 'admin' && req.body.role != 'user')	error="the role must be 'user' or 'admin'";	
			callback(error);
		},
		function(callback) {
			User.findById(req.params.id_user, function(error, data){
				if (req.body.role && data.username == "root") error = "change the role of this id_user is not allowed"
				else if (req.body.role) update.role = req.body.role
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
			User.findByIdAndUpdate(req.params.id_user, update, function (error, data) {
				if (error) res.status(400).json({message:error});
				else printRes(data, res);
				callback(error)
			});			
		}
	], function (error) {
		if (error) res.status(400).json({"message":error});
	});
}

/*


// check if the given user name or group name exists
exports.requiredRightUGname = function(role) {
	return function(req, res, next) {
    	if (req.session.user) { 
    		if (req.session.user.role == "admin") next();
			else if (commonFuncs.isAllowedUser(req.session.user.role, role) < 0) res.status(403).json({error:"access denied"});
			else {
				var userLogin = req.body.username;
				var groupLogin = req.body.groupname;
				if (userLogin == undefined) userLogin = "root";
				User.findOne({username : {$regex : new RegExp('^'+ userLogin + '$', "i")}}, function(error, data){
					if (error) res.status(403).json( {error:"access denied", message:error});
					else {
						if (data == null) res.status(400).json( {error:"this user does not exist"});
						else {
							if (groupLogin == undefined) next();
							else {
								Group.findOne({groupname : {$regex : new RegExp('^'+ groupLogin + '$', "i")}}, function(error2, data){
									if (error2) res.status(403).json( {error:"access denied", message:error2});
									else {
										if (data == null)res.status(400).json( {error:"this group does not exist"});
										else next();
									}
								});
							}
						}
					}
				});
			}
		}
		else res.status(403).json( {error:"access denied"});
	}
}





//retrieve a particular user (with id)
exports.listGroupsOfUserId = function(req, res){
	if (req.params.id == undefined) return res.status(400).json({error:"the given ID is not correct"});
	var connectedUser = req.session.user;	
	User.findById(req.params.id, 'username affiliation role', function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else if (data == null) res.status(200).json(400, '{"error":"no such user"}')
		else {			
			Group.find({'usersList' : {$regex : new RegExp('^'+ data.username + '$', "i")}}, function(error2, dataGroup) {
				if (error2) res.status(400).json({error:"error", message:error2});
				else {
					if (connectedUser.role == "admin")  res.status(200).json(dataGroup);
					else {				
						if (data.username == connectedUser.username)	res.status(200).json(dataGroup);
						else res.status(403).json({error:"You dont have enough right to access this resource"});
					}
				}
			});
		}
	});
}

exports.update = function(req, res){
	if (req.params.id == undefined) return res.status(400).json({error:"one or more data fields are not filled out properly"});
	var connectedUser = req.session.user;

	User.findById(req.params.id, 'username affiliation role', function(error0, data0){
		if (error0) res.status(400).json({error:"error", message:error0});
		else if (data0 == null) res.status(400).json({error:"no such user"});
		else {
			var update = {};
			if (connectedUser.role == "admin" && GLOBAL.list_user_role.indexOf(req.body.role)!=-1 && connectedUser.username != "root") update.role = req.body.role;		
			if (req.body.affiliation) update.affiliation = req.body.affiliation;
			if (req.body.password == undefined) {
				User.findByIdAndUpdate(req.params.id, update, function (error, data) {
					if (error) res.status(400).json({error:"error", message:error});
					else res.status(200).json(data);
				});
			} 
			else { 
				pass.hash(req.body.password, function (error, salt, hash) {
					if (error) res.status(400).json({error:"error", message:error});
					else {
						update.salt = salt;
						update.hash = hash;
						User.findByIdAndUpdate(req.params.id, update, function (error2, data) {
							if (error2) res.status(400).json({error:"error", message:error2});
							else res.status(200).json(data);
						});
					} 
				});
			}
		}
	});
}

// remove a user
exports.remove  = function(req, res){
	if (req.params.id == undefined) return res.status(400).json({error:"one or more data fields are not filled out properly"});
	User.remove({_id : req.params.id}, function (error, data) {
		if (error) res.status(400).json({error:"error", message:error});
		else if (data == 1){
			ACLAPI.removeAUserFromALC(data.username);
			res.status(200).json({message:"The user as been delete"});
		}
		else  res.status(200).json({message:"The user do not exist"});
	});
}
*/