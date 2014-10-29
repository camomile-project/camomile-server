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

//create a group
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

//update information of a group
exports.update = function(req, res){
	Group.findById(req.params.id_group, function(error, group){
		if (req.body.description) group.description = req.body.description;
		group.save(function(error, newGroup) {
			if (error) res.status(400).json({message:error});
			if (!error) res.status(200).json(newGroup);
		});
	});
}

// remove a given group ID
exports.remove = function (req, res) {
	var error;
	async.waterfall([	
		function(callback) {
			Corpus.find(function(error, l_corpus){
				for(var i = 0; i < l_corpus.length; i++) {
					if (l_corpus[i].groups_ACL) {
						if (l_corpus[i].groups_ACL[req.params.id_group]) {
							var update = {groups_ACL : l_corpus[i].groups_ACL};	
							delete update.groups_ACL[req.params.id_group];
							if (Object.getOwnPropertyNames(update.groups_ACL).length === 0) update.groups_ACL = undefined;
							Corpus.findByIdAndUpdate(l_corpus[i]._id, update, function (error, corpus) {});	
						}
					}
				}
				callback(error);				
			});
		},
		function(callback) {
			Layer.find(function(error, l_layer){
				for(var i = 0; i < l_layer.length; i++) {
					if (l_layer[i].groups_ACL) {
						if (l_layer[i].groups_ACL[req.params.id_group]) {
							var update = {groups_ACL : l_layer[i].groups_ACL};	
							delete update.groups_ACL[req.params.id_group];
							if (Object.getOwnPropertyNames(update.groups_ACL).length === 0) update.groups_ACL = undefined;
							Layer.findByIdAndUpdate(l_layer[i]._id, update, function (error, layer) {});	
						}
					}
				}
				callback(error);				
			});
		},		
		function(callback) {
			Group.remove({_id : req.params.id_group}, function (error, group) {
				if (!error && group == 1) res.status(200).json({message:"The group as been delete"});
				callback(error);
			});
		},		
	], function (error) {
		if (error) res.status(400).json({"message":error});
	});
}

//add a user to a group
exports.addUser = function(req, res){
	Group.findById(req.params.id_group, function (error, group) {
		if (error) res.status(400).json(error);
		else if (group.users_list.indexOf(req.params.id_user) != -1) res.status(400).json({error:"This user is already in the group"})
		else {
			group.users_list.push(req.params.id_user);			
			group.save(function(error3, dat){
				if (error3) res.status(400).json(error);
				else res.status(200).json(dat);
			}); 			
		}
	});
};

//remove a user from a group
exports.removeUser  = function(req, res){
	Group.findById(req.params.id_group, function (error, group) {
		if (error) res.status(400).json(error);
		else {
			var index = group.users_list.indexOf(req.params.id_user);
			if (index > -1) {
				group.users_list.splice(index, 1);
				group.save(function(error2, dat){
					if (error) res.status(400).json(error);
					else res.json(dat);
				}); 
			}
			else res.status(400).json({message:"This user is not in the group"});
		}
	});
}
	
