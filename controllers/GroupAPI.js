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

/* The API controller for group's methods */

var async = require('async');

exports.exist = function(req, res, next) {
	Group.findById(req.params.id_group, function(error, group){
		if (error) res.status(400).json(error);
		else if (!group) res.status(400).json({"message":"id_group don't exists"});
		else next();
	});
}

//list all groups to which the connected user belong
exports.getAll = function (req, res) {
	Group.find({}, function (error, groups) {
		if (error) res.status(400).json(error);
		if (groups) res.status(200).json(groups);
		else return res.status(200).json([]);
	});
}

//retrieve a particular group (with id)
exports.getInfo = function(req, res){
	Group.findById(req.params.id_group, function(error, group){
		if (error) res.status(400).json(error);
		else  res.status(200).json(group);
	});
}

exports.create = function(req, res){
	var error=null;
	async.waterfall([
		function(callback) {
			if (req.body.name == undefined) error="the name is not define";
			if (req.body.name == "") 		error="empty string for name is not allow";
			callback(error);
		},
		function(callback) {
			Group.count({name: req.body.name}, function (error, count) {	
				if ((!error) && (count != 0)) error = "the name is already used, choose another name";
		        callback(error);
		    });
		},
		function(callback) {
			var group = new Group({
				name: req.body.name,
				description: req.body.description,
				users_list: []
			}).save(function (error, newGroup) {
				if (newGroup) res.status(200).json(newGroup);
				callback(error);
			});			
		}
	], function (error) {
		if (error) res.status(400).json({"message":error});
	});
};

// remove a given group ID
exports.remove = function (req, res) {
	var error;
	async.waterfall([		
		function(callback) {
			Group.remove({_id : req.params.id_group}, function (error, group) {
				if (!error && group == 1) res.status(200).json({message:"The group as been delete"});
				callback(error);
			});
		}
		// delete group from corpus acl
		// delete group from layer acl
	], function (error) {
		if (error) res.status(400).json({"message":error});
	});
}






/*




// remove a given group ID, also remove this group in the ACL table
exports.removeGroupByID  = function (req, res) {
    if (req.params.id == undefined) return res.status(400).json( {error:"The id parameter has not been sent"});
	Group.remove({_id : req.params.id}, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});			//Error in deleting one annotation		
		else {
			ACLAPI.removeAGroupFromALC(data.groupname);
			res.status(200).json(data);
		}
	});    
}

exports.createGroup = function(req, res){
	if (req.body.groupname == undefined || req.body.description == undefined)
		return res.status(400).json({error:"one or more data fields are not filled out properly"});
		
	Group.findOne({groupname : {$regex : new RegExp('^'+ req.body.groupname + '$', "i")}}, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else if (data == null){
			var groupItem = {
				groupname : req.body.groupname,
				description : req.body.description,
				usersList : []
			};
			var g = new Group(groupItem);
	
			g.save(function(error2, dat){
				if (error2) res.send({error:"error", message:error2});
				else res.status(200).json(dat);
			});	
		}
		else res.status(400).json({error:"This group already exists"});
	});
};

//add a user to a group
exports.addUser2Group = function(req, res){
	if (req.body.username)	{
		User.findOne({username : {$regex : new RegExp('^'+ req.body.username + '$', "i")}}, function(error, data1){
			if (error) res.status(400).json({error:"error", message:error});
			else {
				if (data1 == null) res.status(400).json({error:"The user does not exist"});
				else {
					Group.findById(req.params.id, function(error2, data){
						if (error2) res.status(400).json({error:"error", message:error2});
						else {
							if (data == null || data === undefined)  res.status(400).json({error:"The group does not exist"});
							else {
								if (data.usersList.indexOf(req.body.username.toLowerCase()) == -1) { 								//find if the user is already here
									data.usersList.push(req.body.username);							
									data.save(function(error3, dat){
										if (error3) res.status(400).json({error:"error", message:error3});
										else res.json(dat);
									}); 
								}
								else res.status(400).json({error:"This user is already in the group"});
							}
						}
					}); 
				} 
			}
		});
	} 
	else if (req.body.id_user){
		User.findById(req.body.id_user, function(error, data1){
			if (error) res.status(400).json({error:"error", message:error});
			else {
				if (data1 == null) res.status(400).json(400, {error:"The user does not exist"});
				else {				
					Group.findById(req.params.id, function(error2, data){
						if (error2) res.status(400).json({error:"error", message:error2});
						else {
							if (data == null || data === undefined) res.status(400).json({error:"The group does not exist"});
							else {
								if (data.usersList.indexOf(data1.username) == -1) { 								//find if the user is already here
									data.usersList.push(data1.username);
									data.save(function(error3, dat){
										if (error3) res.status(400).json({error:"error", message:error3});
										else res.json(dat);
									}); 
								}
								else res.status(400).json({error:"This user is already in the group"});
							}
						}
					}); 
				} 
			}
		});
	}
	else return res.status(400).json({error:"one or more data fields are not filled out properly"});
};



//retrieve a particular group (with id)
exports.listUserOfGroupId = function(req, res){
	if (req.params.id == undefined) return res.status(400).send({error:"the given ID is not correct"});//id of the group
	var connectedUser = req.session.user;	
	Group.findById(req.params.id, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else if (data == null) res.json({error:"no such id!"})
		else {
			if (connectedUser.role == "admin")  res.json(data.usersList);
			else res.status(403).json({error:"You dont have enough right to access this resource"});
		}
	});
}

// add a group
exports.addGroup = function (req, res) {
	if (req.body.groupname == undefined) return res.status(400).json({error:"The groupname field has not been filled in"});
	Group.findOne({groupname : {$regex : new RegExp('^'+ req.body.groupname + '$', "i")}}, function(error, group) {
		if (error) res.status(400).json({error:"error", message:error});
		else if (group == null) {
			var groupItem = {
				groupname : req.body.groupname,
				description : req.body.description || "unknown",
				usersList : []
			};
			var g = new Group(groupItem);

			g.save(function(error2, data){
				if (error2) res.status(400).json({error:"error", message:error2});
				else res.send(200, data);
			});
		} 
		else res.status(400).json({error:"This group already exists"});
	});    
}

// update information of a group: put /group/:id
exports.update = function(req, res){
	if (req.params.id == undefined) return res.status(400).json({error:"one or more data fields are not filled out properly"});
	var update = {};
	if (req.body.groupname) update.groupname = req.body.groupname;
	if (req.body.description) update.description = req.body.description;
	Group.findByIdAndUpdate(req.params.id, update, function (error, data) {
		if (error) res.status(400).json({error:"error", message:error});
		else res.json(data);
	});
}
//remove a user from a group
exports.removeUserFromGroup  = function(req, res){
	if (req.params.id == undefined || req.params.username == undefined)
		return res.status(400).json({error:"one or more data fields are not filled out properly"});
	Group.findById(req.params.id, function (error, data) {
		if (error) res.status(400).json({error:"error", message:error});
		else {
			var index = data.usersList.indexOf(req.params.username);
			if (index > -1) {//not working on IE8 and below
				data.usersList.splice(index, 1);
				data.save(function(error2, dat){
					if (error) res.status(400).json({error:"error", message:error});
					else res.json(dat);
				}); 
			}
			else res.json(data);
		}
	});
}
*/
