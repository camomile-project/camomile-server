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
var	layerAPI = require('../controllers/LayerAPI');


//create a corpus
exports.create = function(req, res){
	var error=null;
	async.waterfall([
		function(callback) {											// check field
			if (req.body.name == undefined) error="the name is not define";
			if (req.body.name == "") 		error="empty string for name is not allow";
			callback(error);
		},
		function(callback) {											// create the group
			var new_corpus = {};
			new_corpus.name = req.body.name;
			new_corpus.description = req.body.description;
			new_corpus.history = []
			new_corpus.history.push({date:new Date(), 
									 id_user:req.session.user._id, 
									 modification:{"name":new_corpus.name, 
									 			   "description":new_corpus.description}
									});
			new_corpus.users_ACL = {};
			new_corpus.groups_ACL = {};
			new_corpus.users_ACL[req.session.user._id]='O';				// set 'O' right to the user logged
			var corpus = new Corpus(new_corpus).save(function (error, newCorpus) {		// save it into the db
				if (newCorpus) res.status(200).json(newCorpus);
				callback(error);
			});			
		}
	], function (error) {
		if (error) res.status(400).json({message:error});
	});
};

// print _id, name, description and history
printRes = function(corpus, res) {
	res.status(200).json({"_id":corpus._id,
			 			  "name":corpus.name,
						  "description":corpus.description,
						  "history":corpus.history
						 });
}

// for the list of corpus print _id, name, description and history
printMultiRes = function(l_corpus, res) {
	var p = [];
	for (i = 0; i < l_corpus.length; i++) { 
		p.push({"_id":l_corpus[i]._id,
				"name":l_corpus[i].name,
				"description":l_corpus[i].description,
				"history":l_corpus[i].history
		  	   })
	} 
	res.status(200).json(p);
}

// check if the id_corpus exists in the db
exports.exist = function(req, res, next) {
	Corpus.findById(req.params.id_corpus, function(error, corpus){
		if (error) res.status(400).json(error);
		else if (!corpus) res.status(400).json({message:"id_corpus don't exists"});
		else next();
	});
}

// check if req.session.user._id have the good right to see this req.params.id_corpus
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
			function(user, groups, callback) {							// find if the user have the right to access this corpus
				Corpus.findById(req.params.id_corpus, function(error, corpus){
					if (commonFuncs.checkRightACL(corpus, user, groups, list_right)) next();
					else error = "Acces denied";
					callback(error);
	    		});
			},
		], function (error, trueOrFalse) {
			if (error) res.status(400).json({message:error});
		});
	}
}

// retrieve all corpus where the user logged is 'O' or 'W' or 'R' and print _id, name, description and history
exports.getAll = function (req, res) {
	async.waterfall([
		function(callback) {											// find the user
			User.findById(req.session.user._id, function(error, user){
				callback(error, user);
			});
		},
		function(user, callback) {										// find the list of group belong the user
			Group.find({'users_list' : {$regex : new RegExp('^'+ req.session.user._id + '$', "i")}}, function(error, groups) {
				callback(error, user, groups);
			});
		},
		function(user, groups, callback) {
			Corpus.find({}, function(error, l_corpus){					// print all corpus where the user have the good right
    			async.filter(l_corpus, 
    			        	 function(corpus, callback) {
    			          		callback (commonFuncs.checkRightACL(corpus, user, groups, ['O', 'W', 'R']));
    			        	 },
    			        	 function(results) { printMultiRes(results, res); } 
    			);	
    			callback(error);		
    		});
		},
	], function (error, trueOrFalse) {
		if (error) res.status(400).json({message:error});
	});
}

// retrieve a particular corpus with his _id and print _id, name, description and history
exports.getInfo = function(req, res){
	Corpus.findById(req.params.id_corpus, '_id name description history', function(error, corpus){
		if (error) res.status(400).json({message:error});
    	else res.status(200).json(corpus);
	});
}

// update information of a corpus
exports.update = function(req, res){
	var newHistory = {};
	Corpus.findById(req.params.id_corpus, function(error, corpus){
		if (req.body.name) {											// check field
			if (req.body.name == "") res.status(400).json({message:"name can't be empty"});
			else {
				corpus.name = req.body.name;
				newHistory.name = req.body.name;
			}
		}				
		if (req.body.description) {
			corpus.description = req.body.description;
			newHistory.description = req.body.description;
		}
		corpus.history.push({date:new Date(), id_user:req.session.user._id, modification:newHistory})	// update history with the modification
		corpus.save(function(error, newCorpus) {						// save the corpus in the db
			if (error) res.status(400).json({message:error});
			else printRes(newCorpus, res);
		});
	});
}

// remove a given corpus
exports.remove = function (req, res) {
	async.waterfall([
		function(callback) {											// check if there is no layer into the corpus
			Layer.find({}, function(error, layers){
				for (i = 0; i < layers.length; i++) { 
					if (layers[i].id_corpus == req.params.id_corpus) error = "corpus is not empty (one or more layers is remaining)"; 
				} 
    			callback(error);		
    		});
		},
		function(callback) {											// check if there is no layer into the media
			Media.find({}, function(error, medias){
				for (i = 0; i < medias.length; i++) { 
					if (medias[i].id_corpus == req.params.id_corpus) error = "corpus is not empty (one or more medias is remaining)"; 
				} 
				callback(error);	
			});
		},	
		function(callback) {											// remove the corpus
			Corpus.remove({_id : req.params.id_corpus}, function (error, corpus) {
				if (!error && corpus == 1) res.status(200).json({message:"The corpus as been delete"});
				else res.status(400).json({message:error});
			});
		}
	], function (error, trueOrFalse) {
		if (error) res.status(400).json({message:error});
	});
}

// get ACL of the corpus
exports.getACL = function(req, res){
	Corpus.findById(req.params.id_corpus, 'users_ACL groups_ACL', function(error, corpus){
		if (error) res.status(400).json({message:error});
    	else res.status(200).json(corpus);
	});
}

// update ACL of a user
exports.updateUserACL = function(req, res){
	if (req.body.Right != 'O' && req.body.Right != 'W' && req.body.Right != 'R') res.status(400).json({message:"Right must be 'O' or 'W' or 'R'"});
	Corpus.findById(req.params.id_corpus, function(error, corpus){		// find the corpus
		if (error) res.status(400).json({message:error});
		var update = {users_ACL:corpus.users_ACL};
		if (!update.users_ACL) update.users_ACL = {};
		update.users_ACL[req.params.id_user]=req.body.Right;			// udpate acl
		Corpus.findByIdAndUpdate(req.params.id_corpus, update, function (error, newCorpus) {	// save the corpus with the new ACL
			if (error) res.status(400).json({message:error});
			else res.status(200).json(newCorpus.users_ACL);
		});	
	});
}

// update ACL of a group
exports.updateGroupACL = function(req, res){
	if (req.body.Right != 'O' && req.body.Right != 'W' && req.body.Right != 'R') res.status(400).json({message:"Right must be 'O' or 'W' or 'R'"});
	Corpus.findById(req.params.id_corpus, function(error, corpus){		// find the corpus
		if (error) res.status(400).json({message:error});
		var update = {groups_ACL:corpus.groups_ACL};
		if (!update.groups_ACL) update.groups_ACL = {};
		update.groups_ACL[req.params.id_group]=req.body.Right;			// udpate acl
		Corpus.findByIdAndUpdate(req.params.id_corpus, update, function (error, newCorpus) {	// save the corpus with the new ACL
			if (error) res.status(400).json({message:error});
			else res.status(200).json(newCorpus.groups_ACL);
		});	
	});
}

// remove a user from ACL
exports.removeUserFromACL = function(req, res){	
	Corpus.findById(req.params.id_corpus, function(error, corpus){		// find the corpus
		if (error) res.status(400).json({message:error});
		var update = {users_ACL : corpus.users_ACL};	
		if (!update.users_ACL || update.users_ACL==null) res.status(400).json({message:req.params.id_user+" not in users_ACL"}); 
		else if (!update.users_ACL[req.params.id_user]) res.status(400).json({message:req.params.id_user+" not in users_ACL"}); 
		else {
			delete update.users_ACL[req.params.id_user];				// delete the user from ACL
			if (Object.getOwnPropertyNames(update.users_ACL).length === 0) update.users_ACL = undefined;
			Corpus.findByIdAndUpdate(req.params.id_corpus, update, function (error, corpus) { 	// save the corpus with the new ACL
				if (error) res.status(400).json({message:error});
				else printRes(corpus, res);
			});	
		}				
	});
}

// remove a group from ACL
exports.removeGroupFromACL = function(req, res){
	Corpus.findById(req.params.id_corpus, function(error, corpus){		// find the corpus
		if (error) res.status(400).json({message:error});
		var update = {groups_ACL : corpus.groups_ACL};	
		if (!update.groups_ACL || update.groups_ACL==null) res.status(400).json({message:req.params.id_group+" not in groups_ACL"}); 
		else if (!update.groups_ACL[req.params.id_group]) res.status(400).json({message:req.params.id_group+" not in groups_ACL"}); 
		else {
			delete update.groups_ACL[req.params.id_group];				// delete the group from ACL
			if (Object.getOwnPropertyNames(update.groups_ACL).length === 0) update.groups_ACL = undefined;
			Corpus.findByIdAndUpdate(req.params.id_corpus, update, function (error, corpus) {	// save the corpus with the new ACL
				if (error) res.status(400).json({message:error});
				else printRes(corpus, res);
			});	
		}				
	});
}

//add a media
exports.addMedia = function(req, res){
	var error=null;
	async.waterfall([
		function(callback) {											// check field
			if (req.body.name == undefined) error="the name is not define";
			if (req.body.name == "") 		error="empty string for name is not allow";
			callback(error);
		},
		function(callback) {											// create the new media
			var new_media = {};
			new_media.name = req.body.name;
			new_media.description = req.body.description;
			new_media.url = req.body.url;
			new_media.id_corpus = req.params.id_corpus;
			new_media.history = []
			new_media.history.push({date:new Date(), 
									id_user:req.session.user._id, 
									modification:{"name":new_media.name, 
												  "description":new_media.description, 
												  "url":new_media.url}
								   });
			var media = new Media(new_media).save(function (error, newMedia) {	// save the new media
				if (newMedia) res.status(200).json(newMedia);
				callback(error);
			});			
		}
	], function (error) {
		if (error) res.status(400).json({message:error});
	});
};

//create a layer
exports.addLayer = function(req, res){
	var error=null;
	async.waterfall([
		function(callback) {											// check field
			if (req.body.name == undefined) 			error="the name is not define";
			if (req.body.name == "") 					error="empty string for name is not allow";
			if (req.body.fragment_type == undefined) 	error="the fragment_type is not define";
			if (req.body.data_type == undefined) 		error="the data_type is not define";
			callback(error);
		},
		function(callback) {											// create the new layer
			var new_layer = {};
			new_layer.name = req.body.name;
			new_layer.description = req.body.description;
			new_layer.id_corpus = req.params.id_corpus;
			new_layer.fragment_type = req.params.id_fragment_typecorpus;
			new_layer.data_type = req.params.data_type;
			new_layer.history = []
			new_layer.history.push({date:new Date(), 
									id_user:req.session.user._id, 
									modification:{"name":new_layer.name, 
												  "description":new_layer.description,
												  "fragment_type":new_layer.fragment_type,
												  "data_type":new_layer.data_type}
									});
			new_layer.users_ACL = {};
			new_layer.groups_ACL = {};
			new_layer.users_ACL[req.session.user._id]='O';				// set 'O' right to the user logged
			var layer = new Layer(new_layer).save(function (error, newLayer) {	// save the new layer
				if (newLayer) res.status(200).json(newLayer);
				callback(error);
			});			
		}
	], function (error) {
		if (error) res.status(400).json({message:error});
	});
};

// retrieve all media of a corpus and where the user logged is 'O' or 'W' or 'R' on the corresponding corpus 
// and print _id, name, id_corpus, description, url and history
exports.getAllMedia = function(req, res){
	Media.find({}, function(error, medias){								// fin all media
		async.filter(medias, 											// filter the list with media belong to the corpus
		        	 function(media, callback) { 
		        	 	if (media.id_corpus == req.params.id_corpus) callback(true);
		        	 	else callback(false);
		        	 },
		        	 function(results) { res.status(200).json(results); } 
		);	
	});
}

// retrieve all layer of a corpus and where the user logged is 'O' or 'W' or 'R' for layer 
// and print _id, name, description, id_corpus, fragment_type, data_type, history
exports.getAllLayer = function (req, res) {
	async.waterfall([
		function(callback) {
			User.findById(req.session.user._id, function(error, user){	// find the user logged
				callback(error, user);
			});
		},
		function(user, callback) {										// find the group belong to the user logged
			Group.find({'users_list' : {$regex : new RegExp('^'+ req.session.user._id + '$', "i")}}, function(error, groups) {
				callback(error, user, groups);
			});
		},
		function(user, groups, callback) {								// find all layer
			Layer.find({}, function(error, layers){
    			async.filter(layers, 									// filter the list with layer belong the corpus and where the user have the good right
    			        	 function(layer, callback) {
		        	 			if (layer.id_corpus == req.params.id_corpus && commonFuncs.checkRightACL(layer, user, groups, ['O', 'W', 'R'])) callback(true);
		        	 			else callback(false);    			        	 	
    			        	 },
    			        	 function(results) { layerAPI.printMultiRes(results, res); } 
    			);	
    			callback(error);		
    		});
		},
	], function (error, trueOrFalse) {
		if (error) res.status(400).json({message:error});
	});
}

