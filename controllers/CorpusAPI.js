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
exports.listAll = function(req, res){  	
	console.log('ici');

	Corpus.find({}, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else {
			var connectedUser = req.session.user;
			if (GLOBAL.no_auth == true || (connectedUser != undefined && connectedUser.role == "admin")) {
				res.status(200).json(data); 
				return;
			}
			else if (connectedUser != undefined && data != null)	{
				
				Group.find({'usersList' : {$regex : new RegExp('^'+ connectedUser.username + '$', "i")}}, function(error2, dataGroup) {		//first find groups to which the connected user belongs
					if (error2) res.status(400).json({error:"error", message:error2});
					else {
						result = [];
						resultReturn = [];						
						for(var i = 0; i < data.length; i++) result.push(data[i]._id);
						
						ACL.find({id:{$in:result}}, function(error3, dataACL){																// then find all acls of the data
							if (error3) res.status(500).json({error:"error in ACL-corpusListall:", message:error3});
							else if (dataACL != null) {
								for(var i = 0; i < dataACL.length; i++){
									var foundPos = commonFuncs.findUsernameInACL(connectedUser.username, dataACL[i].users);

									if (foundPos != -1 && dataACL[i].users[foundPos].right != 'N') resultReturn.push(data[i]);
									else {
										foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL[i].groups);
										if (foundPos != -1 && dataACL[i].groups[foundPos].right != 'N') resultReturn.push(data[i]);
									}
								} 
								if (resultReturn.length == 0) res.status(403).json({error:"You dont have enough permission to get this resource"});
								else res.status(200).json(resultReturn);
							} 
							else res.status(400).json({error:"error in finding acl"});
						}); 
					} 
				}); 
			} 
			else res.status(403).json({error:"You dont have permission to access this resource"});
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


//check if a id_user exists
exports.exist = function(req, res, next) {
	Corpus.findById(req.params.id_corpus, function(error, corpus){
		if (error) res.status(400).json(error);
		else if (!corpus) res.status(400).json({"message":"id_corpus don't exists"});
		else next();
	});
}












//for the uri app.get('/corpus/:id', 
exports.listWithId = function(req, res){
	var error=null;
	async.waterfall([
		function(callback) {
			ACLAPI.checkRightCorpus(req, 'R', callback);
		},		
		function(userAllow, callback){
			Corpus.findById(req.params.id, function(error, data){
				if (error) res.status(400).json({error:"error", message:error});
				else if (data==null) res.status(400).json({error:'no such id_corpus!'});
  				else res.status(200).json(data);
				callback(null);
			});
		}
	],  function(err) { }); 
};









//test for Posting corpus
//app.post('/corpus', 
exports.post = function(req, res){
	if (req.body.name == undefined) return res.status(400).json({error:"one or more data fields are not filled out properly"});
	var corpus_data = {name: req.body.name};
	var corpus = new Corpus(corpus_data);
	corpus.save(function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else {
			var connectedUser = "root";
			if (req.session.user) connectedUser = req.session.user.username;
			ACLAPI.addUserRightGeneric(data._id, connectedUser, 'A');
			res.status(200).json(data);
		}
	});
}

//app.put('/corpus/:id', 
exports.update = function(req, res){
	if (req.body.name == undefined) return res.status(400).send({error:"one or more data fields are not filled out properly"});
	var update = {name: req.body.name};
	Corpus.findByIdAndUpdate(req.params.id, update, function (error, data) {
		if (error) res.status(400).json({error:"error", message:error});
		else res.status(200).json(data);
	});
}
