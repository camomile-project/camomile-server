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

var Corpus = require('../models/Corpus').Corpus;
var ACL = require('../models/ACL').ACL,
	ACLAPI = require('../controllers/ACLAPI'),
	Group = require('../models/Group').Group,
	commonFuncs = require('../lib/commonFuncs');

// for the uri : app.get('/corpus', 
/*
	- First: retrieves all corpus regardless of user/group's rights
	- Second: finds all groups belonging to the connected user
	- For each found corpus, check ACLs (the permission of the connected user and its groups) 
*/
exports.listAll = function(req, res){  	
	Corpus.find({}, function(error, data){
		if(error) res.json(error);
		else {
			var connectedUser = req.session.user;
			if(GLOBAL.no_auth == true || (connectedUser != undefined && connectedUser.role == "admin")){
				res.json(data); return;
			}
			else if(connectedUser != undefined && data != null)
			{
				//first find groups to which the connected user belongs
				Group.find({'usersList' : {$regex : new RegExp('^'+ connectedUser.username + '$', "i")}}, function(error, dataGroup) {
					if(error) throw error;
					else {
						result = [];
						resultReturn = [];
						
						for(var i = 0; i < data.length; i++){
						
							result.push(data[i]._id);
						}
						// then find all acls of the data
						ACL.find({id:{$in:result}}, function(error, dataACL){
							if(error) console.log("error in ACL-corpusListall:");
							else if(dataACL != null) {
								for(var i = 0; i < dataACL.length; i++){
									var foundPos = commonFuncs.findUsernameInACL(connectedUser.username, dataACL[i].users);

									if(foundPos != -1 && dataACL[i].users[foundPos].right != 'N')
										resultReturn.push(data[i]);
									else {
										foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL[i].groups);

										if(foundPos != -1 && dataACL[i].groups[foundPos].right != 'N')
											resultReturn.push(data[i]);
									}
								} //for
								if(resultReturn.length == 0)
									res.json(403, "You dont have enough permission to get this resource");
								else res.json(resultReturn);
							} //if(dataACL != null)
							else {
								res.json(404, "error in finding acl");
							}
						}); //ACL.find
					} //else
				}); // group
				//res.json(resultReturn);
			} // else if (connectedUser)
			else res.json(403, "You dont have permission to access this resource");
		}
	}); //corpus.find
};

//for the uri app.get('/corpus/:id', 
exports.listWithId = function(req, res){
	Corpus.findById(req.params.id, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('no such id_corpus!')
		}
		else {	
			res.json(data);
		}
	});
};

//test for Posting corpus
//app.post('/corpus', 
exports.post = function(req, res){
	if(req.body.name == undefined)
		return res.send(404, "one or more data fields are not filled out properly");
		
	var corpus_data = {
          name: req.body.name
        };

	var corpus = new Corpus(corpus_data);

	corpus.save(function(error, data){
		if(error){
			console.log('error in posting corpus data');
			res.json(error);
		}
		else {
			console.log('Success on saving corpus data'); 
			// now we need to create the first ACL for the current user
			var connectedUser = "root";
			if(req.session.user)
				connectedUser = req.session.user.username;
				
			ACLAPI.addUserRightGeneric(data._id, connectedUser, 'A');
			res.json(data);
		}
	});
}

//app.put('/corpus/:id', 
exports.update = function(req, res){
	if(req.body.name == undefined)
		return res.send(404, "one or more data fields are not filled out properly");
	
	var update = {name: req.body.name};
	Corpus.findByIdAndUpdate(req.params.id, update, function (error, data) {
		if(error){
			res.json(error);
		}
		else {
			res.json(data);
		}
	});
}
