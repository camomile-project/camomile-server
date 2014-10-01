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

/* The API controller for user's methods
   
*/

var Corpus = require('../models/Corpus').Corpus;
var Media = require('../models/Media').Media; //get the media model
var Layer = require('../models/Layer').Layer; //get the layer model
var Annotation = require('../models/Annotation').Annotation; //get the annotation model
var ACL = require('../models/ACL').ACL;
var User = require('../models/user').User;
var Group = require('../models/Group').Group;
var ACLAPI = require('../controllers/ACLAPI');
var pass = require('../middleware/pass');

// retrieve all users
exports.listUsers = function (req, res) {
	var connectedUser = req.session.user;	
	if (connectedUser.role == "admin") {				
		User.find({}, 'username role affiliation', function (error, users) {
        	if (error) res.status(400).json({error:"error", message:error});
        	if (users) res.status(200).json(users);
			else return res.status(200).json([]);
    	});
	}
    else {
    	User.findOne({username: connectedUser.username}, 'username role affiliation', function (error, users) {
        	if (error) res.status(400).json({error:"error", message:error});
        	if (users) res.status(200).json(users);
        	else return res.status(200).json([]);
    	});
    }
}

//retrieve a particular user (with id)
exports.listWithId = function(req, res){
	if (req.params.id == undefined) return res.status(400).json({error:"the given ID is not correct"});
	var connectedUser = req.session.user;	
	User.findById(req.params.id, 'username affiliation role', function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else if (data == null) res.status(400).json({error:"no such user"});
		else
			if (connectedUser.role == "admin")  res.status(200).json(data);
			else {				
				if (data.username == connectedUser.username)	res.status(200).json(data);
				else res.status(403).json({error:"You dont have enough right to access this resource"});
			}
	});
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
