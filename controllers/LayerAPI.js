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


//check if the id_layer exists in the db
exports.exist = function(req, res, next) {
	Layer.findById(req.params.id_layer, function(error, layer){
		if (error) res.status(400).json(error);
		else if (!layer) res.status(400).json({message:"id_layer don't exists"});
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
						  "history":layer.history
						});
}

// for the list of layer print _id, name, description, fragment_type, data_type and history 
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

// remove a given layer
exports.remove = function (req, res) {
	async.waterfall([
		function(callback) {											// check if there is no annotation into the corpus
			if (req.session.user.username === "root"){
				Annotation.remove({id_layer : req.params.id_layer}, function (error, annotations) {
					callback(error);	
				});
			}
			else callback(null);		
		},
		function(callback) {											// check if there is no annotation into the media
			if (req.session.user.username === "root") {
				Layer.remove({_id : req.params.id_layer}, function (error, layers) {
					callback(error);	
				});
			}
			else {
				Annotation.find({id_layer:req.params.id_layer}, function(error, annotations){
					if (annotations.length>0) error = "layer is not empty (one or more annotations is remaining)";
					callback(error);
				});
			}
		},			
	], function (error, trueOrFalse) {
		if (error) res.status(400).json({message:error});
		else res.status(200).json({message:"The layer as been delete"});
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
	if (req.body.Right != 'O' && req.body.Right != 'W' && req.body.Right != 'R') res.status(400).json({message:"Right must be 'O' or 'W' or 'R'"});
	Layer.findById(req.params.id_layer, function(error, layer){			// find the layer
		if (error) res.status(400).json({message:error});
		var update = {ACL:layer.ACL};	
		if (!update.ACL.users) update.ACL.users = {};
		update.ACL.users[req.params.id_user]=req.body.Right;			// udpate acl
		Layer.findByIdAndUpdate(req.params.id_layer, update, function (error, newLayer) {	// save the layer with the new ACL
			if (error) res.status(400).json({message:error});
			else res.status(200).json(newLayer.ACL);
		});	
	});
}

// update ACL of a group
exports.updateGroupACL = function(req, res){
	if (req.body.Right != 'O' && req.body.Right != 'W' && req.body.Right != 'R') res.status(400).json({message:"Right must be 'O' or 'W' or 'R'"});
	Layer.findById(req.params.id_layer, function(error, layer){			// find the layer
		if (error) res.status(400).json({message:error});
		var update = {ACL:layer.ACL};	
		if (!update.ACL.groups) update.ACL.groups = {};
		update.ACL.groups[req.params.id_group]=req.body.Right;			// udpate acl
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
		if (!update.ACL.users || update.ACL.users==null) res.status(400).json({message:req.params.id_user+" not in ACL.users"}); 
		else if (!update.ACL.users[req.params.id_user]) res.status(400).json({message:req.params.id_user+" not in ACL.users"}); 
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
		if (!update.ACL.groups || update.ACL.groups==null) res.status(400).json({message:req.params.id_group+" not in ACL.groups"}); 
		else if (!update.ACL.groups[req.params.id_group]) res.status(400).json({message:req.params.id_group+" not in ACL.groups"}); 
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

//add a annotation
exports.addAnnotation = function(req, res){
	var error=null;
	async.waterfall([
		function(callback) {											// check field
			if (req.body.id_media == undefined) error="an annotation must be link to a id_media";
			callback(error);
		},
		function(callback) {											// create the new annotation
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
			var annotation = new Annotation(new_annotation).save(function (error, newAnnotation) {	// save the new annotation
				if (newAnnotation) res.status(200).json(newAnnotation);
				callback(error);
			});			
		}
	], function (error) {
		if (error) res.status(400).json({message:error});
	});
};


//add a multi annotation
exports.addAnnotations = function(req, res){
	async.waterfall([
		function(callback) {											// check field
			if (req.body.annotation_list) {
				for (var i = 0; i < req.body.annotation_list.length; i++) { 
					if (req.body.annotation_list[i].id_media == undefined) callback("an annotation must be link to a id_media");
				}
			}
			callback(null);
		},
		function(callback) {											// create the new annotation
			var l_annotation = []
			async.map(req.body.annotation_list, function(annotation, callback) {
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
		else res.status(200).json(l_annotation);
	});
};

// retrieve all annotation of a layer and where the user logged is 'O' or 'W' or 'R' on the corresponding layer
// and print _id, id_layer, fragment and data
exports.getAllAnnotation = function(req, res){
	var filter = {};
	if (req.query.id_media) filter = {id_media:req.query.id_media};
	Annotation.find(filter, function(error, annotations){
		async.filter(annotations, 
		        	 function(annotation, callback) { 
		        	 	if (annotation.id_corpus == req.params.id_corpus) callback(true);
		        	 	else callback(false);
		        	 },
		        	 function(results) { res.status(200).json(results); } 
		);	
	});
}
