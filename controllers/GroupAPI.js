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

var User = require('../models/User');
var	Group = require('../models/Group');
var Corpus = require('../models/Corpus');
var	Media = require('../models/Media');
var	Layer = require('../models/Layer');
var	Annotation = require('../models/Annotation');
var	Queue = require('../models/Queue');

// check if the id_group exists in the db
exports.exist = function(req, res, next) {
	Group.findById(req.params.id_group, function(error, group){
		if (error) res.status(400).json(error);
		else if (!group) res.status(400).json({message:"The group doesn't exists"});
		else next();
	});
}

// retrieve all group and print _id, name, description and the list of user belong the group
exports.getAll = function (req, res) {
	Group.find({}, function (error, groups) {
		if (error) res.status(400).json(error);
		if (groups) res.status(200).json(groups);
		else return res.status(200).json([]);
	});
}

// retrieve a particular group with his _id and print _id, name, description and list
exports.getInfo = function(req, res){
	Group.findById(req.params.id_group, function(error, group){
		if (error) res.status(400).json(error);
		else  res.status(200).json(group);
	});
}

// create a new group
exports.create = function(req, res){
	var error=null;
	async.waterfall([
		function(callback) {											// check field
			if (req.body.name == undefined) error="the name is not defined";
			if (req.body.name == "") 		error="empty string for name is not allowed";
			callback(error);
		},
		function(callback) {											// check is name not already used
			Group.count({name: req.body.name}, function (error, count) {	
				if ((!error) && (count != 0)) error = "the name is already used, choose another name";
		        callback(error);
		    });
		},
		function(callback) {											// create the group
			var group = new Group({
				name: req.body.name,
				description: req.body.description,
				users_list: []
			}).save(function (error, newGroup) {						// save it into the db
				if (newGroup) res.status(200).json(newGroup);
				callback(error);
			});			
		}
	], function (error) {
		if (error) res.status(400).json({message:error});
	});
};

// update the description of a group
exports.update = function(req, res){
	Group.findById(req.params.id_group, function(error, group){
		if (req.body.description) group.description = req.body.description;
		group.save(function(error, newGroup) {
			if (error) res.status(400).json({message:error});
			if (!error) res.status(200).json(newGroup);
		});
	});
}

// remove a group
exports.remove = function (req, res) {
	var error;
	async.waterfall([	
		function(callback) {											// remove id_group from ACL of all corpus
			Corpus.find(function(error, l_corpus){
				for(var i = 0; i < l_corpus.length; i++) {
					if (l_corpus[i].ACL.groups) {
						if (l_corpus[i].ACL.groups[req.params.id_group]) {
							var update = {ACL.groups : l_corpus[i].ACL.groups};	
							delete update.ACL.groups[req.params.id_group];
							if (Object.getOwnPropertyNames(update.ACL.groups).length === 0) update.ACL.groups = undefined;
							Corpus.findByIdAndUpdate(l_corpus[i]._id, update, function (error, corpus) {});	
						}
					}
				}
				callback(error);				
			});
		},
		function(callback) {											// remove id_group from ACL of all layer
			Layer.find(function(error, l_layer){
				for(var i = 0; i < l_layer.length; i++) {
					if (l_layer[i].ACL.groups) {
						if (l_layer[i].ACL.groups[req.params.id_group]) {
							var update = {ACL.groups : l_layer[i].ACL.groups};	
							delete update.ACL.groups[req.params.id_group];
							if (Object.getOwnPropertyNames(update.ACL.groups).length === 0) update.ACL.groups = undefined;
							Layer.findByIdAndUpdate(l_layer[i]._id, update, function (error, layer) {});	
						}
					}
				}
				callback(error);				
			});
		},		
		function(callback) {											// delete the group from the db
			Group.remove({_id : req.params.id_group}, function (error, group) {
				if (!error && group == 1) res.status(200).json({message:"The group has been deleted"});
				callback(error);
			});
		},		
	], function (error) {
		if (error) res.status(400).json({message:error});
	});
}

// add a user to the group
exports.addUser = function(req, res){
	Group.findById(req.params.id_group, function (error, group) {		// find the group
		if (error) res.status(400).json(error);
		else if (group.users_list.indexOf(req.params.id_user) != -1) res.status(400).json({error:"This user is already in the group"})
		else {
			group.users_list.push(req.params.id_user);					// add the user to the list
			group.save(function(error3, dat){							// save the group
				if (error3) res.status(400).json(error);
				else res.status(200).json(dat);
			}); 			
		}
	});
};

// remove a user from a group
exports.removeUser  = function(req, res){
	Group.findById(req.params.id_group, function (error, group) {		// find the group
		if (error) res.status(400).json(error);
		else {
			var index = group.users_list.indexOf(req.params.id_user);	// check if id_user is in the group
			if (index > -1) {
				group.users_list.splice(index, 1);
				group.save(function(error2, NewGroup){					// save the group
					if (error) res.status(400).json(error);
					else res.json(NewGroup);
				}); 
			}
			else res.status(400).json({message:"This user is not in the group"});
		}
	});
}	
