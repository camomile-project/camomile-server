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

/* The API controller for ACL methods
   
   ACL is only for corpus and corpuslayer
*/






/***************************************************** old part ********************************************************/

var Corpus = require('../models/Corpus').Corpus;
var Media = require('../models/Media').Media; //get the media model
var Layer = require('../models/Layer').Layer; //get the layer model
var Annotation = require('../models/Annotation').Annotation; //get the annotation model
var ACL = require('../models/ACL').ACL;
var User = require('../models/user').User;
var Group = require('../models/Group').Group;
var commonFuncs = require('../lib/commonFuncs');

var CorpusModel = require('../models/Corpus').Corpus
var MediaModel = require('../models/Media').Media
var LayerModel = require('../models/Layer').Layer
var AnnotationModel = require('../models/Annotation').Annotation
var ACLModel = require('../models/ACL').ACL;

var userRoleConstant = new Array();
	userRoleConstant["user"] = 1; // normal user
	userRoleConstant["supervisor"] = 2;
	userRoleConstant["admin"] = 3;	

var rightConstant = new Array(); 
	rightConstant["N"] = 1; //none		
	rightConstant["R"] = 2; //read
	rightConstant["E"] = 3; //edit
	rightConstant["C"] = 4; //create
	rightConstant["D"] = 5; //delete
	rightConstant["A"] = 6; //admin

// retrieve all acl
exports.listAll = function(req, res){
	ACL.find({}, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else res.status(200).json(data);
	});
}

// retrieve an acl id
exports.listWithId = function(req, res){
	ACL.findById(req.params.id, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else if (data == null) res.status(400).json({error:'no such id!'})
		else res.status(200).json(data);
	});
};

//retrieve an ACL id
exports.listWithIdOfResource = function(req, res){
	var idSought = req.params.id_anno;///corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno/acl
	if (idSought == undefined) idSought = req.params.id_layer;
	if (idSought == undefined) idSought = req.params.id_media;
	if (idSought == undefined) idSought = req.params.id;
	if (idSought == undefined) return res.status(400).json({error: "The id has not been filled up"});
	
	ACL.findOne({id:idSought}, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else if (data == null) res.status(400).json('no such id!')
		else res.status(200).json(data);
	});
};

//update an acl entry
exports.updateWithIdOfResource = function(req, res){
	var idSought = req.params.id_anno;///corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno/acl
	if (idSought == undefined) idSought = req.params.id_layer;
	if (idSought == undefined) idSought = req.params.id_media;
	if (idSought == undefined) idSought = req.params.id;
	if (idSought == undefined) return res.status(400).json({error: "The id has not been filled up"});
	
	ACL.findOne({id:idSought}, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else if (data == null) res.status(400).json({error:'no such id!'});
		else {			
			var username = req.body.username;
			var userright = req.body.userright;
			var groupname = req.body.groupname;
			var groupright = req.body.groupright;
				
			if (username != undefined && userright != undefined) {
				User.findOne({username : {$regex : new RegExp('^'+ username + '$', "i")}}, function(error2, datU){
					if (error2) res.status(400).json({error:"error", message:error2});
					else {
						if (datU == null) res.status(400).json({error:"This group does not exist"});
						else {
							var i = findUserInUsersRightArr(username, data.users);
							if (i == -1) data.users.push({login : username, right : userright});
							else data.users[i].right = userright;
							data.save(function(error3, dat){
								if (error3) res.status(400).json({error:"error", message:error3});
								else res.status(200).json(dat);
							});
						} 
					}
				});	
			}			
			
			else if (groupname != undefined && groupright != undefined) {
				Group.findOne({groupname : {$regex : new RegExp('^'+ groupname + '$', "i")}}, function(error2, datG){
					if (error2) res.status(400).json({error:"error", message:error2});
					else {
						if (datG == null) res.status(400).json({error:"This group does not exist"});
						else {
							var i = findUserInUsersRightArr(groupname, data.groups);
							if (i == -1)	data.groups.push({login : groupname, right : groupright});
							else data.groups[i].right = groupright;
							
							data.save(function(error3, dat){
								if (error3) res.status(400).json({error:"error", message:error3});
								else res.status(200).json(dat);
							});
						} 
					}
				});	
			}
			else return res.status(400).json({error: "not found groupname or username or userright"});
		} 
	});
};


exports.getRightOfId = function(id1, callback){
	ACL.findOne({id:id1}, callback);
};




checkUserRight = function(username, dataACL, minimumRightRequired) {
	for(var i = 0; i < dataACL.users.length; i++) {
		if (dataACL.users[i].login === username && rightConstant[dataACL.users[i].right] - rightConstant[minimumRightRequired] >= 0 ) return true;
	}
	return false;
}

checkGroupRight = function(groupname, groups, dataACL, minimumRightRequired) {
	for(var j = 0; j < groupname.length; j++) { //group to which the person belongs
		for(var i = 0; i < groups.length; i++) { //group for which the resource has been granted
			if (groups[i].login === groupname[j].groupname && rightConstant[minimumRightRequired] - rightConstant[dataACL.users[foundPosUser].right] >= 0) return true;
		} 
	}
	return false;
}

exports.checkRightCorpus = function(req, minimumRightRequired, callback){
	Group.find({'usersList' : {$regex : new RegExp('^'+ req.session.user.username + '$', "i")}}, function(error, dataGroup) {
		ACLModel.findOne({id:req.params.id}, function(error, dataACL) {
			if (checkUserRight(req.session.user.username, dataACL, minimumRightRequired)) callback(null, true);
			else if (checkGroupRight(dataGroup, dataACL.groups, dataACL, minimumRightRequired)) callback(null, true);	
			else callback("Acces denied", false);
			
		});	
	});
}













exports.checkRightMedia = function(minimumRightRequired){
	return function(req, res, next) {
		Group.find({'usersList' : {$regex : new RegExp('^'+ req.session.user.username + '$', "i")}}, function(error, dataGroup) {
			ACLModel.findOne({id:req.params.id}, function(error, dataACL) {
				if (checkUserRight(req.session.user.username, dataACL, minimumRightRequired)) next();
				else if (checkGroupRight(dataGroup, dataACL.groups, dataACL, minimumRightRequired)) next();
				else {
					async.waterfall([
						function(callback) {
							MediaModel.findById(req.params.id, function (error, data) {
								callback(error, data.id_corpus);
							});
						},
						function(id_corpus, callback) {
							ACLModel.findOne({id:id_corpus}, function(error, dataACL) {
								if (checkUserRight(req.session.user.username, dataACL, minimumRightRequired)) next();
								else if (checkGroupRight(dataGroup, dataACL.groups, dataACL, minimumRightRequired)) next();	
								else res.status(403).json({error:"access denied"});									
							});	
						}
					], res.status(403).json({error:"access denied"}));
				}
			});	
		});
	}	
}




exports.requiredAuthentication = function(role, minimumRightRequired, level) {
	return function(req, res, next) {

		if (req.session.user) {	
    		//if (req.session.user.role == "admin" || minimumRightRequired == 'N')  next();
			if (commonFuncs.isAllowedUser(req.session.user.role, role) < 0) res.status(403).json({error:"access denied"});		 
			else {
				Group.find({'usersList' : {$regex : new RegExp('^'+ req.session.user.username + '$', "i")}}, function(error, dataGroup) {
					if (error) res.status(403).json({error:"access denied"});	
					else {
						var allowedRight=false;
						if(level == "corpus") {
							ACLModel.findOne({id:id_ressource}, function(error, dataACL) {
								if (checkUserRight(username, dataACL, minimumRightRequired)) next();
								else if (checkGroupRight(dataGroup, dataACL.groups, dataACL, minimumRightRequired)) next();
							});	
						}
						else if(level == "media") {

						}
						else if(level == "layer") {

							var id_media=null; 
							var id_corpus=null;
							async.waterfall([
								function(callback) {
									LayerModel.findById(id_layer, function (error, data) {
										callback( error, data.id_media);
									});
								},
								function(id_media, callback) {
									MediaModel.findById(id_media, function (error, data) {
										callback( error, data.id_corpus, id_media);
									});
								},
								function(id_corpus, id_media, callback) {
									console.log(id_corpus+' '+id_media+' '+id_layer);



								}
							], res.status(403).json({error:"access denied"}));


						}
						else if(level == "annotation") {

						}
						else res.status(403).json({error:"access denied 5"});					//keep only the permitted resources
					}
				});	
			}
		}
	}
}




/*
checkRequiredAuthenticationCorpus = function(req, res, id_corpus, dataGroup, minimumRightRequired, allowedRight){
	CorpusModel.findById(id_corpus, function(error, data){
		if (error || data == null) return false;
		else {
			ACLModel.findOne({id:id_corpus}, function(error, dataACL) {
				if (checkUserRight(req.session.user.username, dataACL, minimumRightRequired)) return true;
				else if (checkGroupRight(dataGroup, dataACL.groups, dataACL, minimumRightRequired)) return true;
				else return false;
			});	
		}
	});	
}

checkRequiredAuthenticationMedia = function(req, res, id_media, dataGroup, minimumRightRequired, allowedRight){
	MediaModel.findById(id_media, function(error, data){
		if (error || data == null) return false;
		else {
			ACLModel.findOne({id:id_media}, function(error, dataACL) {
				if (checkUserRight(req.session.user.username, dataACL, minimumRightRequired)) return true;
				else if (checkGroupRight(dataGroup, dataACL.groups, dataACL, minimumRightRequired)) return true;
				else checkRequiredAuthenticationCorpus(req, res, data.id_corpus, dataGroup, minimumRightRequired, allowedRight);
			});	
		}
	});	
}

checkRequiredAuthenticationLayer = function(req, res, id_layer, dataGroup, minimumRightRequired, allowedRight){
	LayerModel.findById(id_layer, function(error, data){
		if (error || data == null) return false;	
		else {
			ACLModel.findOne({id:id_layer}, function(error, dataACL) {
				if (checkUserRight(req.session.user.username, dataACL, minimumRightRequired)) return true;
				else if (checkGroupRight(dataGroup, dataACL.groups, dataACL, minimumRightRequired)) return true;
				else checkRequiredAuthenticationMedia(req, res, data.id_media, dataGroup, minimumRightRequired, next);
			});	
		}
	});	
}

checkRequiredAuthenticationAnnotation = function(req, res, id_annotation, dataGroup, minimumRightRequired, allowedRight){
	AnnotationModel.findById(id_annotation, function(error, data){
		if (error || data == null) return false;	
		else {
			ACLModel.findOne({id:id_layer}, function(error, dataACL) {
				if (checkUserRight(req.session.user.username, dataACL, minimumRightRequired)) return true;
				else if (checkGroupRight(dataGroup, dataACL.groups, dataACL, minimumRightRequired)) return true;
				else checkRequiredAuthenticationMedia(req, res, data.id_layer, dataGroup, minimumRightRequired, next);
			});	
		}
	});	
}
*/


/*
	var id_media=null; 
	var id_corpus=null;
	async.waterfall([
		function(callback) {
			LayerModel.findById(id_layer, function (error, data) {
				callback( error, data.id_media);
			});
		},
		function(id_media, callback) {
			MediaModel.findById(id_media, function (error, data) {
				callback( error, data.id_corpus, id_media);
			});
		},
		function(id_corpus, id_media, callback) {
			console.log(id_corpus+' '+id_media+' '+id_layer);
		}
	], res.status(403).json({error:"access denied"}));
*/

/*
exports.requiredAuthentication = function(role, minimumRightRequired, level) {
	return function(req, res, next) {
		if (req.session.user) {	
    		//if (req.session.user.role == "admin" || minimumRightRequired == 'N')  next();
			if (commonFuncs.isAllowedUser(req.session.user.role, role) < 0) res.status(403).json({error:"access denied"});		 
			else {
				Group.find({'usersList' : {$regex : new RegExp('^'+ req.session.user.username + '$', "i")}}, function(error, dataGroup) {
					if (error) res.status(403).json({error:"access denied"});	
					else {
						var allowedRight=false;
						if(level == "corpus") {
							if (checkRequiredAuthenticationCorpus(req, res, req.params.id, dataGroup, minimumRightRequired, allowedRight))	next();
							else res.status(403).json({error:"access denied 1"});
						}
						else if(level == "media") {
							if (checkRequiredAuthenticationMedia(req, res, req.params.id, dataGroup, minimumRightRequired, allowedRight)) next();
							else res.status(403).json({error:"access denied 2"});
						}
						else if(level == "layer") {
							if (checkRequiredAuthenticationLayer(req, res, req.params.id, dataGroup, minimumRightRequired, allowedRight)) next();
							else res.status(403).json({error:"access denied 3"});
						}
						else if(level == "annotation") {
							if (checkRequiredAuthenticationAnnotation(req, res, req.params.id, dataGroup, minimumRightRequired, allowedRight)) next();
							else res.status(403).json({error:"access denied 4"});
						}
						else res.status(403).json({error:"access denied 5"});					//keep only the permitted resources
					}
				});	
			}
		}
	}
}
*/



exports.addUserRightGeneric = function addUserRightGeneric(id1, userLogin, userRight){
	User.findOne({username : {$regex : new RegExp('^'+ userLogin + '$', "i")}}, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else {
			if (data == null) res.status(400).json({error:"This user does not exist"});
			else {		
				ACL.findOne({id:id1}, function(error2, dataACL){
					if (error2) res.status(400).json({error:"error", message:error2});
					else if ( dataACL == null || dataACL.length == 0){												//not exist, create a new entry
						var item = {"id" : id1, "users" : [], "groups" : []};
						item.users.push({login : userLogin, right : userRight});
						var aclItem = new ACL(item);
						aclItem.save(function(error3){	
							if (error3) res.status(400).json({error:"error", message:error3}); 
						});
					}
					else {																							// just update the user account						
						var i = findUserInUsersRightArr(userLogin, dataACL.users);
						if (i == -1)	dataACL.users.push({login : userLogin, right : userRight});
						else dataACL.users[i].right = userRight;
						
						dataACL.save(function(error3, dat){
							if (errro3) res.status(400).json({error:"error", message:error3});
						});
					}
				});
			}
		}
	});
}

function findUserInUsersRightArr(login, users){
	for(var i = 0; i < users.length; i++) {
		if (users[i].login == login.toLowerCase()) return i;
	}
	return -1;
} 

// this function is to add a user right
exports.addUserRight = function(req, res){
	if (req.body.userLogin == undefined || req.body.userRight == undefined) return res.status(400).json({error: "one or more data fields are not filled out properly"});
		
	User.findOne({username : {$regex : new RegExp('^'+ req.body.userLogin + '$', "i")}}, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else {
			if (data == null) res.status(400).json({error: "This user does not exist"});
			else {		
				ACL.findOne({id:req.body.id}, function(error2, data){
					if (error2) res.status(400).json({error:"error", message:error2});
					else if (data == null){
						//not exist, create a new entry
						var item = { "id" : req.body.id, "users" : [], "groups" : []};
						item.users.push({login : req.body.userLogin, right : req.body.userRight});
						var aclItem = new ACL(item);
						aclItem.save(function(error3, acl){
							if (error3) res.status(400).json({error:"error", message:error3});
							res.status(200).json(acl);
						});
					}
					else {																				// just update the user account
						var i = findUserInUsersRightArr(req.body.userLogin, data.users);
						if (i == -1) data.users.push({login : req.body.userLogin, right : req.body.userRight});
						else data.users[i].right = req.body.userRight;
						
						data.save(function(error3, dat){
							if (error3) res.status(400).json({error:"error", message:error3});
							else res.status(200).json(dat);
						});
					}
				});
			}
		}
	});
}

// grant group right to the resource
exports.addGroupRight = function(req, res){
	if (req.body.groupLogin == undefined || req.body.groupRight == undefined) return res.status(400).json({error: "one or more data fields are not filled out properly"});
		
	Group.findOne({groupname : {$regex : new RegExp('^'+ req.body.groupLogin + '$', "i")}}, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else {
			if (data == null) res.status(400).json({error:"This group does not exist"});
			else {
				ACL.findOne({id:req.body.id}, function(error2, data){
					if (error2) res.status(400).json({error:"error", message:error2});
					else if (data == null){						//not exist, create a new entry
						var item = {"id" : req.body.id,	"users" : [], "groups" : []};
						item.groups.push({login : req.body.groupLogin, right : req.body.groupRight});
						var aclItem = new ACL(item);
						aclItem.save(function(error3, dat){
							if (error3) res.status(400).json({error:"error", message:error3});
							res.status(200).json(dat);
						});
					}
					else {																							// just update the group account
						var i = findUserInUsersRightArr(req.body.groupLogin, data.groups);
						if (i == -1) data.groups.push({login : req.body.groupLogin, right : req.body.groupRight});
						else data.groups[i].right = req.body.groupRight;
						data.save(function(error3, dat){
							if (error3) res.status(400).json({error:"error", message:error3});
							else res.status(200).json(dat);
						});
					} 
				});			
				
			} 
		} 
	}); 
}


exports.addGroupRightGeneric = function addGroupRightGeneric(id1, groupLogin, groupRight){
	Group.findOne({groupname : {$regex : new RegExp('^'+ groupLogin + '$', "i")}}, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else {
			if (data == null) res.status(400).json({error:"This group does not exist"});
			else {				
				ACL.findOne({id:id1}, function(error2, data){
					if (error2) res.status(400).json({error:"error", message:error2});
					else if (data == null || data.length == 0){								//not exist, create a new entry
						var item = {"id" : id1, "users" : [], "groups" : []};
						item.groups.push({login : groupLogin, right : groupRight});
						var aclItem = new ACL(item);
						aclItem.save(function(error3){
							if (error3) res.status(400).json({error:"error", message:error3});
						});
					}
					else {																	// just update the group account
						var i = findUserInUsersRightArr(groupLogin, data.groups);
						if (i == -1)	data.groups.push({login : groupLogin, right : groupRight});
						else data.groups[i].right = groupRight;
						data.save(function(error3, data){
							if (error3) res.status(400).json({error:"error", message:error3});
						});
					}
				});			
				
			} 
		} 
	}); 
}

// remove an ACL entry
exports.removeAnACLEntry = function removeAnACLEntry(id2remove){
	ACL.remove({id : id2remove}, function(error, data){
		if (error) {
			res.status(400).json({error:"error", message:error}); 
			return;
		}
		else res.status(200).json({message :"removed the " + group2remove + " from the ACL"});
	});
}

function removeItemFromArray(a, item){
	var index = -1;
	for(var j = 0; j < a.length; j++) {
		if (a[j].login == item.toLowerCase()) {
			index = j; 
			break;
		}
	}	
	if (index != -1)	a.splice(index, 1);
}

// remove a user from acl
exports.removeAUserFromALC = function removeAnUserFromALC(user2remove){
	ACL.find({'users.login' : {$regex : new RegExp('^'+ user2remove + '$', "i")}}, function(error, data){
		if (error){
			res.status(400).json(error); 
			return;
		}
		else if (data != null) {
			for(var i = 0; i < data.length; i++) {
				removeItemFromArray(data[i].users, user2remove);
				data[i].save(function(error2, dat) {
					if (error2) res.status(400).json({error:"error", message:error2});
					else res.status(200).json({message :"removed the " + group2remove + " from the ACL"});
				});
			}
		}
	});
}

exports.removeAGroupFromALC = function removeAnGroupFromALC(group2remove){
	ACL.find({'groups.login' : {$regex : new RegExp('^'+ group2remove + '$', "i")}}, function(error, data){
		if (error){
			res.status(400).json(error); 
			return;
		}
		else if (data != null) {
			for(var i = 0; i < data.length; i++) {
				removeItemFromArray(data[i].groups, group2remove);
				data[i].save(function(error2, dat) {
					if (error2) res.status(400).json({error:"error", message:error2});
					else res.status(200).json({message :"removed the " + group2remove + " from the ACL"});
				});
			}
		}
	});
}
