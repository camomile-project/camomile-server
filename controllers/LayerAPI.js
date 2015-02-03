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
var commonFuncs = require('../controllers/commonFuncs');

var User = require('../models/User');
var	Group = require('../models/Group');
var Corpus = require('../models/Corpus');
var	Media = require('../models/Media');
var	Layer = require('../models/Layer');
var	Annotation = require('../models/Annotation');
var	Queue = require('../models/Queue');

//check if the id_layer exists in the db
exports.exist = function(req, res, next) {
	Layer.findById(req.params.id_layer, function(error, layer){
		if (error) res.status(400).json(error);
		else if (!layer) res.status(400).json({message:"The layer doesn't exists"});
		else next();
	});
}

// print _id, name, description, fragment_type, data_type and history 
printResLayer = function(layer, res) {
	res.status(200).json({"_id":layer._id,
						  "id_corpus":layer.id_corpus,
						  "name":layer.name,
						  "description":layer.description,
						  "fragment_type":layer.fragment_type,
						  "data_type":layer.data_type,
						});
}

// for the list of layer print _id, name, description, fragment_type, data_type and history 
exports.printMultiRes = function(l_layer, res, history) {
	var p = [];
	for (i = 0; i < l_layer.length; i++) { 
		var layer = {"_id":l_layer[i]._id,
			    "id_corpus":l_layer[i].id_corpus,
				"name":l_layer[i].name,
				"description":l_layer[i].description,
				"fragment_type":l_layer[i].fragment_type,
				"data_type":l_layer[i].data_type,				
		  	   }
		if (history== 'ON') layer["history"] = l_layer[i].history
		p.push(layer)
	} 
	res.status(200).json(p);
}

// check if req.session.user._id have the good right to see this req.params.id_layer
exports.AllowUser = function (list_right){
	return function(req, res, next) {
		async.waterfall([
			function(callback) {										// find the user
				User.findById(req.session.user._id, function(error, user){
					callback(error, user);
				});
			},
			function(user, callback) {									// find the list of group belong the user
				Group.find({'users_list' : {$regex : new RegExp('^'+ req.session.user._id + '$', "i")}}, function(error, groups) {
					callback(error, user, groups);
				});
			},
			function(user, groups, callback) {							// find if the user have the right to access this layer
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

// retrieve a particular layer with his _id, name, description, fragment_type, data_type and history 
exports.getInfo = function(req, res){
	var field = '_id id_corpus name description fragment_type data_type';
	if (req.query.history == 'ON') field = '_id id_corpus name description fragment_type data_type history';	
	Layer.findById(req.params.id_layer, 'name description history fragment_type data_type', function(error, layer){
		if (error) res.status(400).json({message:error});
    	else res.status(200).json(layer);
	});
}

// retrieve all layer
exports.getAll = function (req, res) {
	var field = '_id id_corpus name description fragment_type data_type';
	if (req.query.history == 'ON') field = '_id id_corpus name description fragment_type data_type history';		
	var filter = {};
	if (req.query.id_corpus) 	 filter['id_corpus'] 	 = req.query.id_corpus;	
	if (req.query.name) 	     filter['name'] 	 	 = req.query.name;	
	if (req.query.fragment_type) filter['fragment_type'] = req.query.fragment_type;	
	if (req.query.data_type) 	 filter['data_type'] 	 = req.query.data_type;		
	Layer.find(filter, field, function (error, layers) {
    	if (error) res.status(400).json({error:"error", message:error});
    	if (layers) res.status(200).json(layers);
		else res.status(200).json([]);
	});
}

// remove a given layer
exports.remove = function (req, res) {
	Layer.remove({_id : req.params.id_layer}, function (error, layer) {
		if (!error && layer == 1) res.status(200).json({message:"The layer has been deleted"});
		else res.status(400).json({message:error});
	});
}

// remove a given layer
exports.remove = function (req, res) {
	async.waterfall([
		function(callback) {											// check if there is no annotation into the corpus
			Annotation.remove({id_layer : req.params.id_layer}, function (error, annotations) {
				callback(error);	
			});
		},
		function(callback) {											// check if there is no annotation into the media
			Layer.remove({_id : req.params.id_layer}, function (error, layers) {
				callback(error);	
			});
		},			
	], function (error, trueOrFalse) {
		if (error) res.status(400).json({message:error});
		else res.status(200).json({message:"The layer has been deleted"});
	});
}



//update information of a layer
exports.update = function(req, res){
	var newHistory = {};
	Layer.findById(req.params.id_layer, function(error, layer){
		if (req.body.name) {											// check field
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
		layer.history.push({date:new Date(), id_user:req.session.user._id, modification:newHistory})	// update history with the modification
		layer.save(function(error, newLayer) {						// save the layer in the db
			if (error) res.status(400).json({message:error});
			else printResLayer(newLayer, res);
		});
	});
}

//retrieve a particular user (with id)
exports.getACL = function(req, res){
	Layer.findById(req.params.id_layer, 'ACL', function(error, layer){
		if (error) res.status(400).json({message:error});
    	else res.status(200).json(layer);
	});
}

// update ACL of a user
exports.updateUserACL = function(req, res){
	if (req.body.right != 'O' && req.body.right != 'W' && req.body.right != 'R') res.status(400).json({message:"right must be 'O' or 'W' or 'R'"});
	Layer.findById(req.params.id_layer, function(error, layer){			// find the layer
		if (error) res.status(400).json({message:error});
		var update = {ACL:layer.ACL};	
		if (!update.ACL.users) update.ACL.users = {};
		update.ACL.users[req.params.id_user]=req.body.right;			// udpate acl
		Layer.findByIdAndUpdate(req.params.id_layer, update, function (error, newLayer) {	// save the layer with the new ACL
			if (error) res.status(400).json({message:error});
			else res.status(200).json(newLayer.ACL);
		});	
	});
}

// update ACL of a group
exports.updateGroupACL = function(req, res){
	if (req.body.right != 'O' && req.body.right != 'W' && req.body.right != 'R') res.status(400).json({message:"right must be 'O' or 'W' or 'R'"});
	Layer.findById(req.params.id_layer, function(error, layer){			// find the layer
		if (error) res.status(400).json({message:error});
		var update = {ACL:layer.ACL};	
		if (!update.ACL.groups) update.ACL.groups = {};
		update.ACL.groups[req.params.id_group]=req.body.right;			// udpate acl
		Layer.findByIdAndUpdate(req.params.id_layer, update, function (error, newLayer) {	// save the layer with the new ACL
			if (error) res.status(400).json({message:error});
			else res.status(200).json(newLayer.ACL);
		});	
	});
}

// remove a user from ACL
exports.removeUserFromACL = function(req, res){	
	Layer.findById(req.params.id_layer, function(error, layer){			// find the layer
		if (error) res.status(400).json({message:error});
		var update = {ACL:layer.ACL};	
		if (!update.ACL.users || update.ACL.users==null) res.status(404).json({message:req.params.id_user+" is not in ACL.users"}); 
		else if (!update.ACL.users[req.params.id_user]) res.status(404).json({message:req.params.id_user+" is not in ACL.users"}); 
		else {
			delete update.ACL.users[req.params.id_user];				// delete the user from ACL
			if (Object.getOwnPropertyNames(update.ACL.users).length === 0) update.ACL.users = undefined;
			Layer.findByIdAndUpdate(req.params.id_layer, update, function (error, newLayer) {	// save the layer with the new ACL
				if (error) res.status(400).json({message:error});
				else res.status(200).json(newLayer.ACL);
			});	
		}				
	});
}

// remove a group from ACL
exports.removeGroupFromACL = function(req, res){
	Layer.findById(req.params.id_layer, function(error, layer){			// find the layer
		if (error) res.status(400).json({message:error});
		var update = {ACL:layer.ACL};	
		if (!update.ACL.groups || update.ACL.groups==null) res.status(404).json({message:req.params.id_group+" is not in ACL.groups"}); 
		else if (!update.ACL.groups[req.params.id_group]) res.status(404).json({message:req.params.id_group+" is not in ACL.groups"}); 
		else {
			delete update.ACL.groups[req.params.id_group];				// delete the group from ACL
			if (Object.getOwnPropertyNames(update.ACL.groups).length === 0) update.ACL.groups = undefined;
			Layer.findByIdAndUpdate(req.params.id_layer, update, function (error, newLayer) {	// save the layer with the new ACL
				if (error) res.status(400).json({message:error});
				else res.status(200).json(newLayer.ACL);
			});	
		}				
	});
}

//add a multi annotation
exports.addAnnotation = function(req, res){
	var l_annotation_req = req.body;
	var add_one_annotation = false;	
	if (l_annotation_req.constructor != Array) {
		l_annotation_req = [req.body];
		add_one_annotation = true;
	}
	async.waterfall([
		function(callback) {											// check field
			if (l_annotation_req == undefined) callback("The list of annotations is not defined");
			if (l_annotation_req.length == 0)  callback("The list of annotations is empty");				
			for (var i = 0; i < l_annotation_req.length; i++) { 
				if (!l_annotation_req[i].id_media )  callback("id_media is not defined for one annotation");
			}
			callback(null);
		}, 
		function(callback) {								// create the new annotation			
			var l_annotation = []
			async.map(l_annotation_req, function(annotation, callback) {
					var new_annotation = {};
					new_annotation.fragment = annotation.fragment;
					new_annotation.data = annotation.data;
					new_annotation.id_layer = req.params.id_layer;
					new_annotation.id_media = annotation.id_media;
					new_annotation.history = []
					new_annotation.history.push({date:new Date(), 
												 id_user:req.session.user._id, 
												 modification:{"fragment":new_annotation.fragment, 
												 			   "data":new_annotation.data
												 			  }
												 });
						var c_annotation = new Annotation(new_annotation).save(function (error, newAnnotation) {	// save the new media
							l_annotation.push(newAnnotation)
							callback(error);
						});
				}, function(error) {
					callback(error, l_annotation); 
				}
			);
		}
	], function (error, l_annotation) {
		if (error) res.status(400).json({message:error});
		else if (add_one_annotation) res.status(200).json(l_annotation[0]);
		else res.status(200).json(l_annotation);
	});
};

// retrieve all annotation of a layer and where the user logged is 'O' or 'W' or 'R' on the corresponding layer
// and print _id, id_layer, fragment and data
exports.getAllAnnotation = function(req, res){
	var field = '_id id_layer id_media fragment data';
	if (req.query.history == 'ON') field = '_id id_layer id_media fragment data history';	
	var filter = {'id_layer': req.params.id_layer};
	if (req.query.id_media) filter['id_media'] = req.query.id_media;
	if (req.query.fragment) filter['fragment'] = req.query.fragment;
	if (req.query.data) 	filter['data'] 	   = req.query.data;
	Annotation.find(filter, field, function(error, annotations){
		if (error) res.status(400).json(error);
		else res.status(200).json(annotations);
	});
}
