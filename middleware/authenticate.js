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


var hash = require('./pass').hash,
    User = require('../models/user').User,
    ACLModel = require('../models/ACL').ACL,
    ACL = require('../controllers/ACLAPI'),
    Group = require('../models/Group').Group,
    GroupAPI = require('../controllers/GroupAPI'),
    commonFuncs = require('../lib/commonFuncs'),
    mongoose = require('mongoose'),
    ses = require('../models/sessions')(mongoose); //for listing all sessions

var corpus = require('../controllers/CorpusAPI'),
  	media = require('../controllers/MediaAPI'),
  	layer = require('../controllers/LayerAPI'),
  	anno = require('../controllers/AnnotationAPI'),
  	compound = require('../controllers/CompoundAPI');

// check for authentication
authenticateElem = function(name, pass, fn) {
    User.findOne({username: name}, function (err, user) {
       	if (user) {
           	if (err) {
           		return fn(new Error('could not find user'));
           	}
           	hash(pass, user.salt, function (err, hash) {
            	if (err) {
            		return fn(err);
				}
            	if (hash == user.hash) {
            		return fn(null, user);
            	}
            	fn(new Error('invalid password'));
           	});
       	} 
       	else {
           	return fn(new Error('could not find this user'));
    	}
    }); 
}

exports.authenticate = function(name, pass, fn) {
    return authenticateElem(name, pass, fn);
}

exports.requiredValidUser = function(req, res, next) {
	if(req.session.user) {
		next();
	}
	else {
		commonFuncs.returnAccessDenied(req, res);
	}
}

// check if the given user name or group name exists
exports.requiredRightUGname = function(role) {
	return function(req, res, next) {
    	if(req.session.user) { 
    		if(req.session.user.role == "admin") {
				next();
			}
			else if(commonFuncs.isAllowedUser(req.session.user.role, role) < 0) {			
				commonFuncs.returnAccessDenied(req, res);
			}
			else {
				var userLogin = req.body.username,
					groupLogin = req.body.groupname;
				if(userLogin == undefined) {
					userLogin = "root";
				}
				User.findOne({username : {$regex : new RegExp('^'+ userLogin + '$', "i")}}, function(error, data){
					if(error) {
						console.log(error); 
						commonFuncs.returnAccessDenied(req, res);
					}
					else {
						if(data == null){
							console.log("This user does not exist");
							commonFuncs.returnAccessDenied(req, res);
						}
						else {
							if(groupLogin == undefined) {
								next();
							}
							else {
								Group.findOne({groupname : {$regex : new RegExp('^'+ groupLogin + '$', "i")}}, function(error, data){
									if(error) {
										console.log(error); 
										commonFuncs.returnAccessDenied(req, res);
									}
									else {
										if(data == null){
											console.log("This group does not exist");
											commonFuncs.returnAccessDenied(req, res);
										}
										else {
											next();
										}
									}
								});
							}
						}
					}
				});
			}
		}
		else {
			commonFuncs.returnAccessDenied(req, res);
		}
	}
}

// check if the IDs given for an operation are consistent, 
// ie., id_layer is under its id_media, ...
exports.requiredConsistentID = function(role, minimumRightRequired, level) {
	return function(req, res, next) {
		if(req.session.user) { 
    		if(req.session.user.role == "admin" || minimumRightRequired == 'N') {
				next();
			}
		else if(commonFuncs.isAllowedUser(req.session.user.role, role) < 0) {
			commonFuncs.returnAccessDenied(req, res);
		}
		else {
			switch(level){
				case "corpus":
					var id_corpus = req.params.id;
					if(id_corpus == undefined) {
						id_corpus = req.params.id_corpus;
					}
					Corpus.findById(id_corpus, function(error, data){
						if(error){
							req.session.error = 'Access denied!';
							res.send(401, 'error');
						}
						else if(data == null){
							req.session.error = 'Not found this id';
							res.send(401, 'error');
						}
						else {
							next();
						}
					});
					break;
				case "media":
					Media.findById(req.params.id_media, function(error, data){
						if(error){
							req.session.error = 'Access denied!';
							res.send(401, 'error');
						}
						else if(data == null){
							req.session.error = 'Not found this id';
							res.send(401, 'error');
						}
						else if(req.params.id_corpus == data.id_corpus) {
							next();
						}
						else {
							req.session.error = 'Access denied!';
							res.send(401, 'One of these ids is not correct');
						}
					});						
					break;
				case "layer":
					Layer.findById(req.params.id_layer, function(error, data){
						if(error){
							req.session.error = 'Access denied!';
							res.send(401, 'error');
						}
						else if(data == null){
							req.session.error = 'Not found this id';
							res.send(401, 'error');
						}
						else if(data.id_media != req.params.id_media) {
								req.session.error = 'Access denied!';
								res.send(401, 'One of these ids is not correct');
							}
						else {
							Media.findById(req.params.id_media, function(error, data1){
								if(error){
									req.session.error = 'Access denied!';
									res.send(401, 'error');
								}
								else if(data1 == null){
									req.session.error = 'Not found this id';
									res.send(401, 'error');
								}
								else if(req.params.id_corpus == data1.id_corpus) {
									next();
								}
								else {
									req.session.error = 'Access denied!';
									res.send(401, 'One of these ids is not correct');
								}
							});
						}
					});
					break;
				
				case "annotation":
					Annotation.findById(req.params.id_anno, function(error, dat){
						if(error){
							req.session.error = 'Access denied!';
							res.send(401, 'error');
						}
						else if(dat == null){
							req.session.error = 'Not found this id';
							res.send(401, 'error');
						}
						else if(dat.id_layer != req.params.id_layer) {
							req.session.error = 'Access denied!';
							res.send(401, 'One of these ids is not correct');
						}
						else {
							Layer.findById(req.params.id_layer, function(error, data){
								if(error){
									req.session.error = 'Access denied!';
									res.send(401, 'error');
								}
								else if(data == null){
									req.session.error = 'Not found this id';
									res.send(401, 'error');
								}
								else if(data.id_media != req.params.id_media) {
										req.session.error = 'Access denied!';
										res.send(401, 'One of these ids is not correct');
									}
								else {
									Media.findById(req.params.id_media, function(error, data1){
										if(error){
											req.session.error = 'Access denied!';
											res.send(401, 'error');
										}
										else if(data1 == null){
											req.session.error = 'Not found this id';
											res.send(401, 'error');
										}
										else if(req.params.id_corpus == data1.id_corpus) {
											next();
										}
										else {
											req.session.error = 'Access denied!';
											res.send(401, 'One of these ids is not correct');
										}
									});
								}
							});		
						}
					});
					break;
					
				default:
					break;
				}	
			}
		}
	}
}


exports.requiredAuthentication = function(role, minimumRightRequired, level) {
	return function(req, res, next) {
		if(req.session.user) { 
    		if(req.session.user.role == "admin" || minimumRightRequired == 'N') {
				next();
			}
			else if(commonFuncs.isAllowedUser(req.session.user.role, role) < 0)	{
				commonFuncs.returnAccessDenied(req, res);
			}
			else {
				var connectedUser = req.session.user;
				var i = level;
				var found = false;
				switch(i) {
					case "annotation": 
						Group.find({'usersList' : {$regex : new RegExp('^'+ connectedUser.username + '$', "i")}}, function(error, dataGroup) {
							if(error) {
								throw error;
							}
							else {
								result = [];
								result.push(req.params.id_anno);
								result.push(req.params.id_layer);
								result.push(req.params.id_media);
								result.push(req.params.id_corpus);
								ACLModel.find({id:{$in:result}}, function(error, dataACL) {
									if(error) { 
										console.log("Error: " + error); 
										res.send(404, error);
									}
									else if(dataACL != null) {
										var contd = true;
										for(var i = 0; i < dataACL.length && contd; i++){
											var foundPos = commonFuncs.findUsernameInACL(connectedUser.username, dataACL[i].users);
											if(foundPos != -1 && commonFuncs.isAllowedRight(minimumRightRequired, dataACL[i].users[foundPos].right) >= 0) {
												found = true; 
												contd = false;
												next();
											}	
											else {
												foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL[i].groups);
												if(foundPos != -1 && commonFuncs.isAllowedRight(minimumRightRequired, dataACL[i].groups[foundPos].right) >= 0) {
													found = true; 
													contd = false; 
													next(); 
												}
											}
											if(foundPos != -1 && contd) {
												contd = false;  // found the user right, but not satisfied
											}
										} 
										if(found == false) {
											commonFuncs.returnAccessDenied(req, res);
										}
									}
									else {
										commonFuncs.returnAccessDenied(req, res); 
									}
								});
							}
						});	
						break;
						
					case  "layer": 
						Group.find({'usersList' : {$regex : new RegExp('^'+ connectedUser.username + '$', "i")}}, function(error, dataGroup) {
							if(error) 
								throw error;
							else {
								result = [];
								result.push(req.params.id_layer);
								result.push(req.params.id_media);
								result.push(req.params.id_corpus);
								ACLModel.find({id:{$in:result}}, function(error, dataACL) {
									if(error) {
										console.log("Error: " + error); 
										res.send(404, error);
									}
									else if(dataACL != null) {
										var contd = true;
										for(var i = 0; i < dataACL.length && contd; i++){
											var foundPos = commonFuncs.findUsernameInACL(connectedUser.username, dataACL[i].users);
											if(foundPos != -1 && commonFuncs.isAllowedRight(minimumRightRequired, dataACL[i].users[foundPos].right) >= 0) {
												contd = false; 
												found = true;
												next();
											}	
											else {
												foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL[i].groups);
												if(foundPos != -1 && commonFuncs.isAllowedRight(minimumRightRequired, dataACL[i].groups[foundPos].right) >= 0) { 
													found = true; 
													contd = false; 
													next(); 
												}
											}
											if(foundPos != -1 && contd) {
												contd = false;  // found the user right, but not satisfied
											}
										} 
										if(found == false) {
											commonFuncs.returnAccessDenied(req, res);
										}
									}
									else {
										commonFuncs.returnAccessDenied(req, res);
									}
								});
							}
						});	
						break;
						
					case "media": 
						var id_media = req.params.id_media;
						Group.find({'usersList' : {$regex : new RegExp('^'+ connectedUser.username + '$', "i")}}, function(error, dataGroup) {
							if(error) {
								throw error;
							}
							else {
								result = [];
								result.push(req.params.id_media);
								result.push(req.params.id_corpus);
								ACLModel.find({id:{$in:result}}, function(error, dataACL) {
									if(error) {
										console.log("Error: " + error); throw error;
									}
									else if(dataACL != null) {
										var contd = true;
											for(var i = 0; i < dataACL.length && contd; i++){
											var foundPos = commonFuncs.findUsernameInACL(connectedUser.username, dataACL[i].users);
											if(foundPos != -1 && commonFuncs.isAllowedRight(minimumRightRequired, dataACL[i].users[foundPos].right) >= 0) {
												contd = false; 
												found = true;
												next();
											}	
											else {
												foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL[i].groups);
												if(foundPos != -1 && commonFuncs.isAllowedRight(minimumRightRequired, dataACL[i].groups[foundPos].right) >= 0) {
													found = true; 
													contd = false; 
													next(); 
												}
											}
											if(foundPos != -1 && contd) {
												contd = false;  // found the user right, but not satisfied
											}
										} 
										if(found == false) {
											commonFuncs.returnAccessDenied(req, res);
										}
									}
									else {
										commonFuncs.returnAccessDenied(req, res);
									}
								});
							}
						});
						break;
						
					case "corpus": 
						var id_corpus = req.params.id;
							if(id_corpus == undefined) {
								id_corpus = req.params.id_corpus;
							}
						
						Group.find({'usersList' : {$regex : new RegExp('^'+ connectedUser.username + '$', "i")}}, function(error, dataGroup) {
							if(error) {
								throw error;
							}
							else {									
								ACLModel.findOne({id:id_corpus}, function(error, dataACL) {
									if(error) { 
										console.log("Error: " + error); 
										throw error;
									}
									else if(dataACL != null) {										
										var foundPos = commonFuncs.findUsernameInACL(connectedUser.username, dataACL.users);
										if(foundPos != -1 && commonFuncs.isAllowedRight(minimumRightRequired, dataACL.users[foundPos].right) >= 0) {
											found = true;
											next();
										}	
										else {
											foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL.groups);
											if(foundPos != -1 && commonFuncs.isAllowedRight(minimumRightRequired, dataACL.groups[foundPos].right) >= 0) {
												found = true; next();
											}
										}
										if(found == false) {
											commonFuncs.returnAccessDenied(req, res);
										}
									}
									else {
										commonFuncs.returnAccessDenied(req, res);
									}
								});
							}
						});
					break;
					case "global":						
						if(commonFuncs.isAllowedUser(req.session.user.role, role) >= 0)	{
							next();
						}
						else {
							commonFuncs.returnAccessDenied(req, res);
						}
						break;
					default:
						commonFuncs.returnAccessDenied(req, res);					//keep only the permitted resources
				}
			}  
		} 
		else {
			commonFuncs.returnAccessDenied(req, res);	
		}	
	}
}

// create a root user if it does not exist
exports.createRootUser = function(){
	User.findOne({username:"root"}, function(err, data){
   		if(err) {
   			throw err;
   		}
   		if(!data) {
   			var pass = GLOBAL.root_pass;
   			
			hash(pass, function (err, salt, hash) {
				if (err) {
					throw err;
				}
				var user = new User({
					username: "root",
					affiliation: "camomile",
					role: "admin",
					salt: salt,
					hash: hash,
				}).save(function (err, newUser) {
					if (err) {
						throw err;
					}
					console.log("already added the root user");
				}); 
			});	
   		} 
   		else if(GLOBAL.root_passdef != GLOBAL.root_pass){
   			console.log("change the root pass");
   			var pass = GLOBAL.root_pass;
   			console.log("new pass: " + pass);
			hash(pass, function (err, salt, hash) {
				data.salt = salt;
				data.hash = hash;
				data.save(function (err, newUser) {
					if (err) {
						throw err;
					}
					console.log("already updated the root pass");
				});
			});
   		}
	});
}
//check if a user exists
exports.userExist = function(req, res, next) {
    User.count({username: req.body.username}, function (err, count) {
        if (count === 0) {
            next();
        } 
        else {
            req.session.error = "This user already exists"
            res.send(200, "This user already exists");
        }
    });
}

exports.login = function (req, res) {
	var username = req.body.username,
		pass = req.body.password;
	if(username == undefined) { //login via a GET
		username = req.params.username;
		pass = req.params.password;
	}
	if(username == undefined || pass == undefined) {
		res.send(401, 'Authentication failed, please check your username or password');
	}
	else {
		authenticateElem(username, pass, function (err, user) {
			if (user) {
				req.session.regenerate(function () {
					req.session.user = user;
					req.session.success = 'Authenticated as ' + user.username + ' click to <a href="logout">logout</a>.';
					res.send(200, 'You have been successfully logged in'); 
				});
			} 
			else {
				req.session.error = 'Authentication failed, please check your ' + ' username and password.';
				res.send(401, 'Authentication failed, please check your username or password');
			}
		});
	}
}

// create a user
exports.signup = function (req, res) {
	if(req.body.password == undefined || req.body.username == undefined) {
		res.send(404, "The username and/or password fields have not been filled up with data");
	}
	else {
		var roleuser = req.body.role;
		if(GLOBAL.list_user_role.indexOf(roleuser)==-1)  {
			roleuser = "user";
		}	
		hash(req.body.password, function (err, salt, hash) {
			if (err) {
				throw err;
			}
			var user = new User({
				username: req.body.username,
				affiliation: req.body.affiliation,
				role: roleuser,//req.body.role,
				salt: salt,
				hash: hash,
			}).save(function (err, newUser) {
				if (err) {
					throw err;
				}
				if(newUser){ 
					res.send(200, newUser);
				}
			});
		});		
	}
}

/*
// change the role of the user
exports.chmodUser = function (req, res) {
	var usrname = req.body.username,
		newrole = req.body.role;
	
	if(usrname == undefined) { //login via a POST
		usrname = req.params.username;
		newrole = req.params.role;
	}
	if(usrname == undefined) {
		return res.send(404,'The field username has not been filled');
	}
	if(usrname == "root") {
		return res.send(501, "cannot change the root user");
	}
	
	var strRights = ["admin", "user", "supervisor"];
	if(strRights.indexOf(newrole) < 0) {
		console.log("role should be either user, admin, or supervisor");
		return res.send(404, "role is not correct");//redirect('/');
	}

	User.findOne({username:{$regex : new RegExp('^'+ usrname + '$', "i")}}, function(err, data){
   		if(err) {
   			throw err;
   		}
   		if(data){
			data.role = newrole;
			data.save(function(err) {
				if(err) {
					throw err;
				}
				console.log('successfully changed the role (as ' +  newrole  + ') for the username ' + usrname);
				var olduser = req.session.user;
				if(usrname == req.session.user.username){
					req.session.destroy(function () {
						res.send(200, 'successfully changed the role of ' + usrname);
					});
				}
				else {
					res.send(200, 'successfully changed the role of ' + usrname);
				}
			});
		}
   	});
}
*/

exports.racine = function (req, res) {
    if (req.session.user) {
        res.send("Welcome " + req.session.user.username + "<br>" + "<a href='logout'>logout</a>");
    }
    else {
        res.send("<h1 ALIGN="+ "CENTER>" + "Welcome to Camomile project!</h1>" + "<br>" + "<h2>You have to log in to use the APIs</h2>" + "<br>" + "<a href='login'> Login</a>" + "<br>" + "<a href='signup'> Sign Up</a>");
	}
}

// used for test, and it will be removed from the production version
exports.logout = function (req, res) {
    if(req.session.user) {
    	var uname = req.session.user.username;
    	req.session.destroy(function () {
        	res.send(200, uname + " logged out");
    	});
    }
    else {
    	res.send(200);
    }
}

// remove a given group ID, also remove this group in the ACL table
exports.removeGroupByID  = function (req, res) {
    if(req.params.id == undefined) {
    	return res.send(404, 'The id parameter has not been sent');
    }
	Group.remove({_id : req.params.id}, function(error, data){
		if(error){					
			console.log('Error in deleting one annotation');
			res.json(error);
		}
		else {
			ACLAPI.removeAGroupFromALC(data.groupname);
			res.send(data);
		}
	});    
}
