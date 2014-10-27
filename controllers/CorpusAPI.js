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

/* The API controller for Corpus
   Exports 3 methods:
   * post - Creates a new corpus
   * listAll - Returns a list of corpus
   * listWithId - Returns a specific corpus of a given id
*/


// for the uri : app.get('/corpus', 
/*
	- First: retrieves all corpus regardless of user/group's rights
	- Second: finds all groups belonging to the connected user
	- For each found corpus, check ACLs (the permission of the connected user and its groups) 
*/

var async = require('async');

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
			var new_corpus = {};
			new_corpus.name = req.body.name;
			new_corpus.description = req.body.description;
			new_corpus.history = []
			new_corpus.history.push({data:new Date(), id_user:req.session.user._id, modification:"initial add"});
			new_corpus.users_ACL = {};
			new_corpus.groups_ACL = {};
			new_corpus.users_ACL[req.session.user._id]='O';
			var corpus = new Corpus(new_corpus).save(function (error, newCorpus) {
				if (newCorpus) res.status(200).json(newCorpus);
				callback(error);
			});			
		}
	], function (error) {
		if (error) res.status(400).json({"message":error});
	});
};

// only print username, role and description
printRes = function(corpus, res) {
	var p = {
		"name":corpus.name,
		"description":corpus.description,
		"history":corpus.history
	};
	res.status(200).json(p);
}


//check if a id_user exists
exports.exist = function(req, res, next) {
	Corpus.findById(req.params.id_corpus, function(error, corpus){
		if (error) res.status(400).json(error);
		else if (!corpus) res.status(400).json({"message":"id_corpus don't exists"});
		else next();
	});
}

// check if user have the good right for corpus
checkRight = function (corpus, user, groups, list_right) {
	var userInAcl = false;
	if (user.username == "root") return true
	else {
		if (corpus.users_ACL) {
			if (user._id in corpus.users_ACL) {
				if (list_right.indexOf(corpus.users_ACL[user._id])!=-1) return true;
				userInAcl = true;
			}
		}
		if (!userInAcl && corpus.groups_ACL) {
			for(var i = 0; i < groups.length; i++)	{
				if (groups[i]._id in corpus.groups_ACL) {
					if (list_right.indexOf(corpus.groups_ACL[groups[i]._id])!=-1) return true;
				}
			}
		}
	}
	return false;
}

// check if req.session.user._id have the good right to see this req.params.id_corpus
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
				Corpus.findById(req.params.id_corpus, function(error, corpus){
					if (checkRight(corpus, user, groups, list_right)) next();
					else error = "Acces denied";
					callback(error);
	    		});
			},
		], function (error, trueOrFalse) {
			if (error) res.status(400).json({"message":error});
		});
	}
}

// retrieve all corpus
exports.getAll = function (req, res) {
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
			Corpus.find({}, function(error, l_corpus){
    			async.filter(l_corpus, 
    			        	 function(corpus, callback) {
    			          		callback (checkRight(corpus, user, groups, ['O', 'W', 'R']));
    			        	 },
    			        	 function(results) { res.status(200).json(results); } 
    			);	
    			callback(error);		
    		});
		},
	], function (error, trueOrFalse) {
		if (error) res.status(400).json({"message":error});
	});
}

//retrieve a particular user (with id)
exports.getInfo = function(req, res){
	Corpus.findById(req.params.id_corpus, 'name description history users_ACL groups_ACL', function(error, corpus){
		if (error) res.status(400).json({error:"error", message:error});
    	else res.status(200).json(corpus);
	});
}

//update information of a corpus
exports.update = function(req, res){
	var update = {};
	if (req.body.name) {
		if (req.body.name == "") res.status(400).json({"message":"name can't be empty"});
		else update.name = req.body.name;		
	}
	if (req.body.description) update.description = req.body.description;
	Corpus.findByIdAndUpdate(req.params.id_corpus, update, function (error, corpus) {
		if (error) res.status(400).json(error);
		else res.status(200).json(corpus);
	});
}

// remove a given corpus
exports.remove = function (req, res) {

	// check if corpus is empty

	Corpus.remove({_id : req.params.id_corpus}, function (error, corpus) {
		if (!error && corpus == 1) res.status(200).json({message:"The corpus as been delete"});
		else res.status(400).json({"message":error});
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
			Corpus.findById(req.params.id_corpus, function(error, corpus){
				if (!error){
					update.users_ACL = corpus.users_ACL;
					if (!update.users_ACL) update.users_ACL = {};
					update.users_ACL[req.params.id_user]=req.body.Right;
				}
				callback(error, update);
			});
		},
		function(update, callback) {
			Corpus.findByIdAndUpdate(req.params.id_corpus, update, function (error, corpus) {
				if (!error) printRes(corpus, res);
				else res.status(400).json({"message":error});
				callback(error);
			});			
		}
	], function (error) {
		if (error) res.status(400).json({"message":error});
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
			Corpus.findById(req.params.id_corpus, function(error, corpus){
				if (!error){
					update.groups_ACL = corpus.groups_ACL;
					if (!update.groups_ACL) update.groups_ACL = {};
					update.groups_ACL[req.params.id_group]=req.body.Right;
				}
				callback(error, update);
			});
		},
		function(update, callback) {
			Corpus.findByIdAndUpdate(req.params.id_corpus, update, function (error, corpus) {
				if (!error) printRes(corpus, res);
				else res.status(400).json({"message":error});
				callback(error);
			});			
		}
	], function (error) {
		if (error) res.status(400).json({"message":error});
	});
}

// remove a user from ACL
exports.removeUserFromACL = function(req, res){
	var update = {};
	var error=null;
	async.waterfall([
		function(callback) {
			Corpus.findById(req.params.id_corpus, function(error, corpus){
				if (!error){
					update.users_ACL = corpus.users_ACL;
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
			Corpus.findByIdAndUpdate(req.params.id_corpus, update, function (error, corpus) {
				if (!error) printRes(corpus, res);
				else res.status(400).json({"message":error});
				callback(error);
			});			
		}
	], function (error) {
		if (error) res.status(400).json({"message":error});
	});
}

// remove a group from ACL
exports.removeGroupFromACL = function(req, res){
	var update = {};
	var error=null;
	async.waterfall([
		function(callback) {
			Corpus.findById(req.params.id_corpus, function(error, corpus){
				if (!error){
					update.groups_ACL = corpus.groups_ACL;
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
			Corpus.findByIdAndUpdate(req.params.id_corpus, update, function (error, corpus) {
				if (!error) printRes(corpus, res);
				else res.status(400).json({"message":error});
				callback(error);
			});			
		}
	], function (error) {
		if (error) res.status(400).json({"message":error});
	});
}

