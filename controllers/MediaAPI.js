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

/* The API controller
   Exports 3 methods:
   * post - Creates a new media
   * listAll - Returns a list of media
   * listWithId - Returns a specific media of a given id
*/


var fileSystem = require('fs'); //working with video streaming

// for the uri : app.get('/corpus/:id/media'
/*
	- First: retrieves all media regardless of user/group's rights
	- Second: finds all groups belonging to the connected user
	- For each found media, check ACLs (the permission of the connected user and its groups)
	- If not found, check ACLs of the related corpus 
*/
exports.listAll = function(req, res){	
	function final(resultReturn, n) { 
		if (resultReturn.length == 0 && n > 0) res.status(403).json({error: "You dont have enough permission to get this resource"});
		else res.status(200).json(resultReturn);
	}
	//find all media under this corpus
	Media.find({id_corpus : req.params.id}, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else {
			var connectedUser = req.session.user;
			if (GLOBAL.no_auth == true || (connectedUser != undefined && connectedUser.role == "admin")) res.status(200).json(data);
			else if (connectedUser != undefined && data != null){
				//first find groups to which the connected user belongs
				Group.find({'usersList' : {$regex : new RegExp('^'+ connectedUser.username + '$', "i")}}, function(error2, dataGroup) {
					if (error2) res.status(400).json({error:"error", message:error2});
					else {
						result = [];
						resultReturn = [];
						for(var i = 0; i < data.length; i++) result.push(data[i]._id);
						ACL.find({id:{$in:result}}, function(error3, dataACL){										// find all acl of these ids
							if (error3)  res.statut(500).json({error:"error in ACL-corpusListall:", message:error3});
							else if (dataACL != null) {
								var dataACLLen = dataACL.length;
								var countTreatedACL = 0;
								var  deferredCollection = [];
								for(var i = 0; i < dataACL.length; i++) { 
									var foundPos = commonFuncs.findUsernameInACL(connectedUser.username, dataACL[i].users);
									// if the user has at least a R right on this resource
									if (foundPos != -1) {
										if (dataACL[i].users[foundPos].right != 'N') {
											resultReturn.push(data[i]);
											countTreatedACL += 1; 
										}
									} //not found this user's right on the current resource, look for its group's one
									else {
										foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL[i].groups);

										if (foundPos != -1) {
										 	if (dataACL[i].groups[foundPos].right != 'N') {
												resultReturn.push(data[i]);
												countTreatedACL += 1;
											}
										}
										else { //not found user right, nor group one, do a back propagation
											(function(d){								
												ACL.findOne({id:req.params.id}, function(error4, dataACL1){
													if (error4) res.status(400).json({error:"error", message:error4});
													else if (dataACL1 != null) {
														countTreatedACL += 1;
														var foundPos = commonFuncs.findUsernameInACL(connectedUser.username, dataACL1.users);

														if (foundPos != -1) {
															if (dataACL1.users[foundPos].right != 'N') resultReturn.push(d);
														}
														else {
															foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL1.groups);
															if (foundPos != -1 && dataACL1.groups[foundPos].right != 'N') resultReturn.push(d);
														}
														if (countTreatedACL == dataACLLen) {
															countTreatedACL = -1
															final(resultReturn, data.length);
														}
													}
												}); 
											})(data[i]);
										} 
									}
								} 
								if (countTreatedACL == dataACLLen) 
									final(resultReturn, data.length);			
							} 
							else res.status(400).json({error: "error in finding acl"});
						}); 
					} 
				}); 
			} 
			else { 
				if (data != null) res.status(403).json({error:"You dont have permission to access this resource"}); 
				else return([]);
			}
		}
var async = require('async');
var commonFuncs = require('../lib/commonFuncs');

//check if a id_user exists
exports.exist = function(req, res, next) {
	Media.findById(req.params.id_media, function(error, media){
		if (error) res.status(400).json(error);
		else if (!media) res.status(400).json({message:"id_media don't exists"});
		else next();
	});
} 

//for the uri: app.get('/corpus/:id_corpus/media/:id_media', 
exports.listWithId = function(req, res) {


						  

	console.log('ici');
}

// check if req.session.user._id have the good right to see this media.id_corpus
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
				Media.findById(req.params.id_media, function(error, media){
					callback(error, user, groups, media);
	    		});
			},
			function(user, groups, media, callback) {
				Corpus.findById(media.id_corpus, function(error, corpus){
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

//test for Posting corpus
//app.post('/corpus/:id_corpus/media', 
exports.post = function(req, res){
	if (req.body.name == undefined) return res.status(400).json({error:"one or more data fields are not filled out properly"});	
	Corpus.findById(req.params.id_corpus, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else if (data == null) res.status(400).json({error:'Could not post this media because the given id_corpus is incorrect'});
		else {
			var media_data = {id_corpus: req.params.id_corpus, name: req.body.name, url : ""};
			if (req.body.url) media_data.url = req.body.url;
			var media = new Media(media_data);
			// create a new media
			media.save(function(error2, data1){
				if (error2) res.status(400).json({error:"error", message:error2});
				else {
					//add the current user to the ACL list
					var connectedUser = "root";
					if (req.session.user) connectedUser = req.session.user.username;
					ACLAPI.addUserRightGeneric(data1._id, connectedUser, 'A');
					res.status(200).json(data1);
				}
			});
		}
//retrieve a particular user (with id)
exports.getInfo = function(req, res){
	Media.findById(req.params.id_media, 'name description id_corpus url history', function(error, media){
		if (error) res.status(400).json({message:error});
    	else res.status(200).json(media);
	});
}

//app.put('/corpus/:id_corpus/media/:id_media', 
exports.update = function(req, res){
	if (req.params.id_corpus == undefined && req.body.name == undefined && req.body.url == undefined) return res.status(400).json({error:"one or more data fields are not filled out properly"});
	var update = {};
	if (req.params.id_corpus) update.id_corpus = req.params.id_corpus;
	if (req.body.name) update.name = req.body.name;
	if (req.body.url) update.url = req.body.url;
	Media.findByIdAndUpdate(req.params.id_media, update, function (error, data) {
		if (error) res.status(400).json({error:"error", message:error});
		else res.status(200).json(data);
	});
}

function getVideoWithExtension(req, res, extension) {
	Media.findById(req.params.id_media, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else if (data == null) res.status(400).json({error: 'no such id_media!'})
		else {			
			var filePath = data.url + '.' + extension;
			if (data.url == undefined) return res.status(404).send({error:'not found the video corresponding to this media'});
			if (GLOBAL.video_path) filePath = GLOBAL.video_path + '/' + filePath;
			res.status(200).sendfile(filePath);
		}
	});
}

exports.getVideo = function(req, res) {
	getVideoWithExtension(req, res, 'webm');
}

exports.getVideoWEBM = function(req, res) {
	getVideoWithExtension(req, res, 'webm');
}

exports.getVideoMP4 = function(req, res) {
	getVideoWithExtension(req, res, 'mp4');
}

exports.getVideoOGV = function(req, res) {
	getVideoWithExtension(req, res, 'ogv');
}
