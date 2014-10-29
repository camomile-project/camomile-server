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
var commonFuncs = require('../lib/commonFuncs');


//check if a id_layer exists
exports.exist = function(req, res, next) {
	Layer.findById(req.params.id_layer, function(error, layer){
		if (error) res.status(400).json(error);
		else if (!layer) res.status(400).json({message:"id_layer don't exists"});
		else next();
	});
}

// only print username, role and description
printRes = function(layer, res) {
	var p = {"_id":layer._id,
			 "id_corpus":layer.id_corpus,
			 "name":layer.name,
			 "description":layer.description,
			 "fragment_type":layer.fragment_type,
			 "data_type":layer.data_type,
			 "history":layer.history,
			};
	res.status(200).json(p);
}

// only print username, role and description for the list of l_layer
exports.printMultiRes = function(l_layer, res) {
	var p = [];
	for (i = 0; i < l_layer.length; i++) { 
		p.push({"_id":l_layer[i]._id,
			    "id_corpus":l_layer[i].id_corpus,
				"name":l_layer[i].name,
				"description":l_layer[i].description,
				"fragment_type":l_layer[i].fragment_type,
				"data_type":l_layer[i].data_type,				
				"history":l_layer[i].history
		  	   })
	} 
	res.status(200).json(p);
}

// check if req.session.user._id have the good right to see this req.params.id_layer
exports.AllowUser = function (list_right){
	return function(req, res, next) {
		async.waterfall([
			function(callback) {
				User.findById(req.session.user._id, function(error, user){
					callback(error, user);
				});
			},
			function(user, callback) {
				Group.find({'users_list' : {$regex : new RegExp('^'+ req.session.user._id + '$', "i")}}, function(error, groups) {
					callback(error, user, groups);
				});
			},
			function(user, groups, callback) {
				Layer.findById(req.params.id_layer, function(error, layer){
					if (commonFuncs.checkRightACL(layer, user, groups, list_right)) next();
					else error = "Acces denied";
					callback(error);
	    		});
			},
		], function (error, trueOrFalse) {
			if (error) res.status(400).json({message:error});
		});
	}
}

//retrieve a particular user (with id)
exports.getInfo = function(req, res){
	Layer.findById(req.params.id_layer, 'name description history fragment_type data_type', function(error, layer){
		if (error) res.status(400).json({message:error});
    	else res.status(200).json(layer);
	});
}

// retrieve all layer
exports.getAll = function (req, res) {	
	Layer.find({}, function (error, layers) {
    	if (error) res.status(400).json({error:"error", message:error});
    	if (layers) res.status(200).json(layers);
		else res.status(200).json([]);
	});
}

// remove a given layer
exports.remove = function (req, res) {
	Layer.remove({_id : req.params.id_layer}, function (error, layer) {
		if (!error && layer == 1) res.status(200).json({message:"The layer as been delete"});
		else res.status(400).json({message:error});
	});
}

//update information of a layer
exports.update = function(req, res){
	var newHistory = {};
	Layer.findById(req.params.id_layer, function(error, layer){
		if (req.body.name) {
			if (req.body.name == "") res.status(400).json({message:"name can't be empty"});
			else {
				layer.name = req.body.name;
				newHistory.name = req.body.name;
			}
		}				
		if (req.body.description) {
			layer.description = req.body.description;
			newHistory.description = req.body.description;
		}
		layer.history.push({date:new Date(), id_user:req.session.user._id, modification:newHistory})
		layer.save(function(error, newLayer) {
			if (error) res.status(400).json({message:error});
			if (!error) res.status(200).json(newLayer);
		});
	});
}

//retrieve a particular user (with id)
exports.getACL = function(req, res){
	Layer.findById(req.params.id_layer, 'users_ACL groups_ACL', function(error, layer){
		if (error) res.status(400).json({message:error});
    	else res.status(200).json(layer);
	});
}

// update ACL of a user
exports.updateUserACL = function(req, res){
	var update = {};
	var error=null;
	async.waterfall([
		function(callback) {
			if (req.body.Right != 'O' && req.body.Right != 'W' && req.body.Right != 'R') error="Right must be 'O' or 'W' or 'R'";
			callback(error);
		},		
		function(callback) {
			Layer.findById(req.params.id_layer, function(error, layer){
				if (!error){
					update.users_ACL = layer.users_ACL;
					if (!update.users_ACL) update.users_ACL = {};
					update.users_ACL[req.params.id_user]=req.body.Right;
				}
				callback(error, update);
			});
		},
		function(update, callback) {
			Layer.findByIdAndUpdate(req.params.id_layer, update, function (error, layer) {
				if (!error) printRes(layer, res);
				else res.status(400).json({message:error});
				callback(error);
			});			
		}
	], function (error) {
		if (error) res.status(400).json({message:error});
	});
}

// update ACL of a group
exports.updateGroupACL = function(req, res){
	var update = {};
	var error=null;
	async.waterfall([
		function(callback) {
			if (req.body.Right != 'O' && req.body.Right != 'W' && req.body.Right != 'R') error="Right must be 'O' or 'W' or 'R'";
			callback(error);
		},		
		function(callback) {
			Layer.findById(req.params.id_layer, function(error, layer){
				if (!error){
					update.groups_ACL = layer.groups_ACL;
					if (!update.groups_ACL) update.groups_ACL = {};
					update.groups_ACL[req.params.id_group]=req.body.Right;
				}
				callback(error, update);
			});
		},
		function(update, callback) {
			Layer.findByIdAndUpdate(req.params.id_layer, update, function (error, layer) {
				if (!error) printRes(layer, res);
				else res.status(400).json({message:error});
				callback(error);
			});			
		}
	], function (error) {
		if (error) res.status(400).json({message:error});
	});
}

// remove a user from ACL
exports.removeUserFromACL = function(req, res){
	var update = {};
	var error=null;
	async.waterfall([
		function(callback) {
			Layer.findById(req.params.id_layer, function(error, layer){
				if (!error){
					update.users_ACL = layer.users_ACL;
					if (!update.users_ACL) error=req.params.id_user+" not in users_ACL";
					else {
						if (update.users_ACL[req.params.id_user]) {
							delete update.users_ACL[req.params.id_user];
							if (Object.getOwnPropertyNames(update.users_ACL).length === 0) update.users_ACL = undefined;
						}
						else error=req.params.id_user+" not in users_ACL";
					}
				}
				callback(error, update);
			});
		},
		function(update, callback) {
			Layer.findByIdAndUpdate(req.params.id_layer, update, function (error, layer) {
				if (!error) printRes(layer, res);
				else res.status(400).json({message:error});
				callback(error);
			});			
		}
	], function (error) {
		if (error) res.status(400).json({message:error});
	});
}

// remove a group from ACL
exports.removeGroupFromACL = function(req, res){
	var update = {};
	var error=null;
	async.waterfall([
		function(callback) {
			Layer.findById(req.params.id_layer, function(error, layer){
				if (!error){
					update.groups_ACL = layer.groups_ACL;
					if (!update.groups_ACL) error=req.params.id_group+" not in groups_ACL";
					else {
						if (update.groups_ACL[req.params.id_group]) {
							delete update.groups_ACL[req.params.id_group];
							if (Object.getOwnPropertyNames(update.groups_ACL).length === 0) update.groups_ACL = undefined;
						}
						else error=req.params.id_group+" not in groups_ACL";
					}
				}
				callback(error, update);
			});
		},
		function(update, callback) {
			Layer.findByIdAndUpdate(req.params.id_layer, update, function (error, layer) {
				if (!error) printRes(layer, res);
				else res.status(400).json({message:error});
				callback(error);
			});			
		}
	], function (error) {
		if (error) res.status(400).json({message:error});
	});
}

//add a annotation
exports.addAnnotation = function(req, res){
	var error=null;
	async.waterfall([
		function(callback) {
			if (req.body.id_media == undefined) error="an annotation must be link to a id_media";
			callback(error);
		},
		function(callback) {
			var new_annotation = {};
			new_annotation.fragment = req.body.fragment;
			new_annotation.data = req.body.data;
			new_annotation.id_layer = req.params.id_layer;
			new_annotation.id_media = req.body.id_media;
			new_annotation.history = []
			new_annotation.history.push({date:new Date(), 
										 id_user:req.session.user._id, 
										 modification:{"fragment":new_annotation.fragment, 
										 			   "data":new_annotation.data
										 			  }
										 });
			var annotation = new Annotation(new_annotation).save(function (error, newAnnotation) {
				if (newAnnotation) res.status(200).json(newAnnotation);
				callback(error);
			});			
		}
	], function (error) {
		if (error) res.status(400).json({message:error});
	});
};

//get all annotation of a corpus
exports.getAllAnnotation = function(req, res){
	Annotation.find({}, function(error, annotations){
		async.filter(annotations, 
		        	 function(annotation, callback) { 
		        	 	if (annotation.id_corpus == req.params.id_corpus) callback(true);
		        	 	else callback(false);
		        	 },
		        	 function(results) { res.status(200).json(results); } 
		);	
	});
}
