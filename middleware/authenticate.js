
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
    if (module.parent) console.log('authenticating %s:%s', name, pass);  //use somewhere else, not in the main

    User.findOne({
        username: name
    }, function (err, user) {
        	if (user) {
            	if (err) return fn(new Error('could not find user'));
            		hash(pass, user.salt, function (err, hash) {
                		if (err) return fn(err);
                		if (hash == user.hash) return fn(null, user);
                		fn(new Error('invalid password'));
            	});
        	} else {
            	return fn(new Error('could not find this user'));
        	}
    	}); 
}

exports.authenticate = function(name, pass, fn) {
    return authenticateElem(name, pass, fn);
}

exports.requiredValidUser = function(req, res, next) {
	if(req.session.user)
		next();
	else commonFuncs.returnAccessDenied(req, res);
}
// check if the given user name or group name exists
exports.requiredRightUGname = function(role) {
	return function(req, res, next) {
		if (GLOBAL.no_auth){
    		next();
    	}
    	else if(req.session.user) { 
    			if(req.session.user.role == "admin")
					next();
				else if(commonFuncs.isAllowedUser(req.session.user.role, role) < 0) {
					commonFuncs.returnAccessDenied(req, res);
				}
				else {
					var userLogin = req.body.username,
						groupLogin = req.body.groupname;
					if(userLogin == undefined) userLogin = "root";
					User.findOne({username : {$regex : new RegExp('^'+ userLogin + '$', "i")}}, function(error, data){
						if(error) {console.log(error); commonFuncs.returnAccessDenied(req, res);}
						else 
						{
							if(data == null){
								console.log("This user does not exist");
								commonFuncs.returnAccessDenied(req, res);
							}
							else {
								if(groupLogin == undefined)
									next();
								else {
									Group.findOne({groupname : {$regex : new RegExp('^'+ groupLogin + '$', "i")}}, function(error, data){
										if(error) {console.log(error); commonFuncs.returnAccessDenied(req, res);}
										else 
										{
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
// 1, 3, 5, 7 indicates the level of request : corpus is level 1, media is 2, layer is 3
exports.requiredConsistentID = function(role, minimumRightRequired, level) {
	return function(req, res, next) {
		if (GLOBAL.no_auth){
    		next();
    	}
    	else if(req.session.user) { 
    			if(req.session.user.role == "admin" || minimumRightRequired == 'N')
					next();
				else if(commonFuncs.isAllowedUser(req.session.user.role, role) < 0) {
					commonFuncs.returnAccessDenied(req, res);
				}
				else {
					switch(level){
						case 1:
							var id_corpus = req.params.id;
							if(id_corpus == undefined) id_corpus = req.params.id_corpus;
							
							Corpus.findById(id_corpus, function(error, data){
								if(error){
									req.session.error = 'Access denied!';
									res.send(401, 'error');
								}
								else if(data == null){
									req.session.error = 'Not found this id';
									res.send(401, 'error');
								}
								else
									next();
							});
							break;
						case 3:
							Media.findById(req.params.id_media, function(error, data){
								if(error){
									req.session.error = 'Access denied!';
									res.send(401, 'error');
								}
								else if(data == null){
									req.session.error = 'Not found this id';
									res.send(401, 'error');
								}
								else if(req.params.id_corpus == data.id_corpus)
									next();
									else {
										req.session.error = 'Access denied!';
										res.send(401, 'One of these ids is not correct');
									}
							});
							
							break;
						case 5:
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
											else if(req.params.id_corpus == data1.id_corpus)
												next();
												else {
													req.session.error = 'Access denied!';
													res.send(401, 'One of these ids is not correct');
												}
										});
									}
							});
							break;
						
						case 7:
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
														else if(req.params.id_corpus == data1.id_corpus)
															next();
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
		else {
			commonFuncs.returnAccessDenied(req, res);
		}
	}
}
//level = 0 => corpus, level = 1 > media, level = 2 => layer, level = 3 => annotation
///corpus = 0 /:id_corpus = 1 /media =  2/:id_media = 3/layer =  4/:id_layer = 5

exports.requiredAuthentication = function(role, minimumRightRequired, level) {
	return function(req, res, next) {
		if (GLOBAL.no_auth){
    		next();
    	}
    	else if(req.session.user) { 
    			if(req.session.user.role == "admin" || minimumRightRequired == 'N')
					next();
				else if(commonFuncs.isAllowedUser(req.session.user.role, role) < 0) {
					
					commonFuncs.returnAccessDenied(req, res);
				}
				else {
					var connectedUser = req.session.user;
					var i = level;
					var found = false;
					switch(i) {
						case 7: ///corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno
							Group.find({'usersList' : {$regex : new RegExp('^'+ connectedUser.username + '$', "i")}}, function(error, dataGroup) {
								if(error) throw error;
								else {
									result = [];
									result.push(req.params.id_anno);
									result.push(req.params.id_layer);
									result.push(req.params.id_media);
									result.push(req.params.id_corpus);
									ACLModel.find({id:{$in:result}}, function(error, dataACL) {
										if(error) {
											console.log("Error: " + error); res.send(404, error);
										}
										else if(dataACL != null) {
											var contd = true;
											for(var i = 0; i < dataACL.length && contd; i++){
												var foundPos = commonFuncs.findUsernameInACL(connectedUser.username, dataACL[i].users);
												
												//console.log("foundPos: " + foundPos);
												if(foundPos != -1 && commonFuncs.isAllowedRight(minimumRightRequired, dataACL[i].users[foundPos].right) >= 0) {
													//console.log("dd: " + i + " id = " + dataACL[i].id); 
												
													found = true; contd = false;
													next();
												}	
												else {
													foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL[i].groups);
													//console.log("foundPos: " + foundPos + " for : ");
													if(foundPos != -1 && commonFuncs.isAllowedRight(minimumRightRequired, dataACL[i].groups[foundPos].right) >= 0) {
												
														found = true; contd = false; next(); 
													}
												}
												if(foundPos != -1 && contd) {contd = false; } // found the user right, but not satisfied
											} //for
											if(found == false) commonFuncs.returnAccessDenied(req, res);
										}
										else {commonFuncs.returnAccessDenied(req, res); }
									});
								}
							});	
							break;
						case  5: ///corpus/:id_corpus/media/:id_media/layer/:id_layer
							//var id_layer = req.params.id_layer;	
							Group.find({'usersList' : {$regex : new RegExp('^'+ connectedUser.username + '$', "i")}}, function(error, dataGroup) {
								if(error) throw error;
								else {
									result = [];
									result.push(req.params.id_layer);
									result.push(req.params.id_media);
									result.push(req.params.id_corpus);
									ACLModel.find({id:{$in:result}}, function(error, dataACL) {
										if(error) {
											console.log("Error: " + error); res.send(404, error);
										}
										else if(dataACL != null) {
											var contd = true;
											for(var i = 0; i < dataACL.length && contd; i++){
												var foundPos = commonFuncs.findUsernameInACL(connectedUser.username, dataACL[i].users);
											//	console.log("foundPos: " + foundPos);
												if(foundPos != -1 && commonFuncs.isAllowedRight(minimumRightRequired, dataACL[i].users[foundPos].right) >= 0) {
											//		console.log("dd: " + i + " id = " + dataACL[i].id); 
													contd = false; found = true;
													next();
												}	
												else {
													foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL[i].groups);
											//		console.log("foundPos: " + foundPos + " for : ");
													if(foundPos != -1 && commonFuncs.isAllowedRight(minimumRightRequired, dataACL[i].groups[foundPos].right) >= 0) {
														found = true; contd = false; next(); 
													}
												}
												if(foundPos != -1 && contd) {contd = false; } // found the user right, but not satisfied
											} //for
											if(found == false) commonFuncs.returnAccessDenied(req, res);
										}
										else commonFuncs.returnAccessDenied(req, res);
									});
								}
							});	
							break;
						case 3: ///corpus/:id_corpus/media/:id_media
							var id_media = req.params.id_media;
							Group.find({'usersList' : {$regex : new RegExp('^'+ connectedUser.username + '$', "i")}}, function(error, dataGroup) {
								if(error) throw error;
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
											//	console.log("foundPos: " + foundPos);
												if(foundPos != -1 && commonFuncs.isAllowedRight(minimumRightRequired, dataACL[i].users[foundPos].right) >= 0) {
										//			console.log("dd: " + i + " id = " + dataACL[i].id); 
													contd = false; found = true;
													next();
												}	
												else {
													foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL[i].groups);
											//		console.log("foundPos: " + foundPos + " for : ");
													if(foundPos != -1 && commonFuncs.isAllowedRight(minimumRightRequired, dataACL[i].groups[foundPos].right) >= 0) {
														found = true; contd = false; next(); 
													}
												}
												if(foundPos != -1 && contd) {contd = false; } // found the user right, but not satisfied
											} //for
											if(found == false) commonFuncs.returnAccessDenied(req, res);
										}
										else commonFuncs.returnAccessDenied(req, res);
									});
								}
							});
							break;
							
						case 2:
							
							break;
						case 1: //corpus/:id
							var id_corpus = req.params.id;
							if(id_corpus == undefined) id_corpus = req.params.id_corpus;
							
							Group.find({'usersList' : {$regex : new RegExp('^'+ connectedUser.username + '$', "i")}}, function(error, dataGroup) {
								if(error) throw error;
								else {
									
									ACLModel.findOne({id:id_corpus}, function(error, dataACL) {
										if(error) {
											console.log("Error: " + error); throw error;
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
											if(found == false) commonFuncs.returnAccessDenied(req, res);
										}
										else commonFuncs.returnAccessDenied(req, res);
									});
								}
							});
							break;
						case 0:
							
							if(commonFuncs.isAllowedUser(req.session.user.role, role) >= 0)
								next();
							else commonFuncs.returnAccessDenied(req, res);
							break;
						default:
							//keep only the permitted resources
							commonFuncs.returnAccessDenied(req, res);

					}//next();
				} //else 
			} //else if(req.session.user) { 
			else {
				//req.session.error = 'Access denied!';
				//res.redirect('login');
				commonFuncs.returnAccessDenied(req, res);
			}		
	}
}

// create a root user if it does not exist
exports.createRootUser = function(){
	User.findOne({username:"root"}, function(err, data){
   		if(err) throw err;
   		if(!data) {
   			var pass = GLOBAL.root_pass;
   			
			hash(pass, function (err, salt, hash) {
				if (err) throw err;
				var user = new User({
					username: "root",
					affiliation: "camomile",
					role: "admin",
					salt: salt,
					hash: hash,
				}).save(function (err, newUser) {
					if (err) throw err;
					console.log("already added the root user");
				}); //save
			});	
   		} //data
   		else if(GLOBAL.root_passdef != GLOBAL.root_pass){
   			console.log("change the root pass");
   			var pass = GLOBAL.root_pass;
   			console.log("new pass: " + pass);
			hash(pass, function (err, salt, hash) {
				data.salt = salt;
				data.hash = hash;
				data.save(function (err, newUser) {
					if (err) throw err;
					console.log("already updated the root pass");
				});
			});
   		}
	});
}
//check if a user exists
exports.userExist = function(req, res, next) {
    User.count({
        username: req.body.username
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            req.session.error = "This user already exists"
            res.send(200, "This user already exists");
        }
    });
}

exports.login = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send('Without requiring authentification for API');
    }
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
					//res.redirect('/');
					res.send(200, 'You have been successfully logged in'); 
				});
			} else {
				req.session.error = 'Authentication failed, please check your ' + ' username and password.';
				//res.redirect('login');
				res.send(401, 'Authentication failed, please check your username or password');
			}
		});
	}
}

// create a user
exports.signup = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send('Anonymous user is not allowed here');
    }
	if(req.body.password == undefined || req.body.username == undefined) {
		res.send(404, "The username and/or password fields have not been filled up with data");
	}
	else {
		var roleuser = req.body.role;
		if(roleuser == undefined) roleuser = "user";
		
		hash(req.body.password, function (err, salt, hash) {
			if (err) throw err;
			var user = new User({
				username: req.body.username,
				affiliation: req.body.affiliation,
				role: roleuser,//req.body.role,
				salt: salt,
				hash: hash,
			}).save(function (err, newUser) {
				if (err) throw err;
					 if(newUser){ 
						res.send(200, newUser);
						//res.send(200, "the user is successfully created");
					}
			});
		});
	}//else
}

// change the role of the user
exports.chmodUser = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send('Anonymous user is not allowed here');
    }
	var usrname = req.body.username,
		newrole = req.body.role;
	
	if(usrname == undefined) { //login via a POST
		usrname = req.params.username;
		newrole = req.params.role;
	}
	//le 17/11/2013
	if(usrname == undefined)
		return res.send(404,'The field username has not been filled');
		
	if(usrname == "root") {
		//res.redirect('/');
		return res.send(501, "cannot change the root user");
	}
	
	var strRights = ["admin", "user", "supervisor"];
	if(strRights.indexOf(newrole) < 0) {
		console.log("role should be either user, admin, or supervisor");
		return res.send(404, "role is not correct");//redirect('/');
		//return false;
	}

	User.findOne({username:{$regex : new RegExp('^'+ usrname + '$', "i")}}, function(err, data){
   		if(err) throw err;
   		if(data){
   			//console.log("role: " + data.role + " new:  " + newrole);
			data.role = newrole;
			data.save(function(err) {
				if(err) throw err;
				console.log('successfully changed the role (as ' +  newrole  + ') for the username ' + usrname);
				var olduser = req.session.user;
				if(usrname == req.session.user.username){
					req.session.destroy(function () {
						//res.redirect('/'); //phuong commented on 6/11/2013 to send 200 code status only
						res.send(200, 'successfully changed the role of ' + usrname);
					});
				}
				else
					// res.redirect('/'); 
					res.send(200, 'successfully changed the role of ' + usrname);
			});
		}
   	});
}

// create an anonymous user in case where non-auth is applied
exports.racine = function (req, res) {
    if (GLOBAL.no_auth){
    	var user = {
    		username: "anonymous",
    		password: "anonymous",
    		affiliation: "anonymous",
    		role: "admin",
    		salt: "anonymous",
    		hash: "anonymous"
    	};
    	req.session.user = user;
    }
    if (req.session.user) {
        res.send("Welcome " + req.session.user.username + "<br>" + "<a href='logout'>logout</a>");
    } else {
        res.send("<h1 ALIGN="+ "CENTER>" + "Welcome to Camomile project!</h1>" + "<br>" + "<h2>You have to log in to use the APIs</h2>" + "<br>" + "<a href='login'> Login</a>" + "<br>" + "<a href='signup'> Sign Up</a>");
    }
}

// test purpose only, and it will be removed from the production version 
exports.signupGET = function (req, res) {
    if (req.session.user) { //only admin can do it
        res.render("signup");
    } else {
        //res.redirect("/"); 
        res.send(401, "You do not have enough right");
    }
}

// used for test, and it will be removed from the production version
exports.logoutGET = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send('This is an anonymous user');
    }
    if(req.session.user) {
    	var uname = req.session.user.username;
    	req.session.destroy(function () {
        	//res.redirect('/');
        	res.send(200, uname + " logged out");
    	});
    }
    else res.send(200);
}

// get a user's profile, but now we dont need any more, it will be removed
exports.profile = function (req, res) {
    if (GLOBAL.no_auth){
    	return res.send('This is an anonymous user');
    }
    var usrname = req.session.user.username;
    if(req.params.username != undefined){
    	usrname = req.params.username
    }
    if(usrname != undefined){
		User.findOne({
			username: {$regex : new RegExp('^'+ usrname + '$', "i")}
		},

		function (err, user) {
			if (user) {
				res.send("username: " + user.username + "<br>" + " Role: " + user.role + "<br>" + " affiliation: " + user.affiliation +'<br>'+ 'click to <a href="logout">logout</a>');
			} else {
				return res.send('cannot find user');
			}
		});
	}
	else {
		res.send(404, 'The username field has not been filled');
	}
}

//list all sessions
exports.listAllSessions = function (req, res) {
    ses.find({},function (err, sessions) {
        if (err) console.log(err);
        else res.send(sessions);
    });
}

// working with groups of users

// just for test, will be removed from the final version
exports.addGroupGET = function (req, res) {
    if (req.session.user) {
        res.render("addGroup");
    } else {
        //res.redirect("/");
        res.send(401, "You do not have enough right");
    }
}

// just for test, will be removed from the final version
exports.addUser2GroupGET = function (req, res) {
    if (req.session.user) {
        res.render("addUser2Group");
    } else {
        //res.redirect("/");
        res.send(401, "You do not have enough right");
    }
}

//add a user to a group
exports.addUser2Group = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send('Anonymous user is not allowed here');
    }
    else {
        GroupAPI.addUser2Group(req, res);
    }
}

// just for test, to be removed in the final version
exports.addUserRight2ResourceGET = function (req, res) {
    if (req.session.user) {
        res.render("addUserRight2Resource");
    } else {
        res.send(401, "You do not have enough right");
    }
}

// add user right to a given resource
exports.addUserRight2Resource = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send('Anonymous user is not allowed here');
    }
    else {
		ACL.addUserRight(req, res);
    }
}

// to be remove in the final version
exports.addGroupRight2ResourceGET = function (req, res) {
    if (req.session.user) {
        res.render("addGroupRight2Resource");
    } else {
        //res.redirect("/");
        res.send(401, "You do not have enough right");
    }
}

// add a group right to a given resource
exports.addGroupRight2Resource = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send('Anonymous user is not allowed here');
    }
    else {
		ACL.addGroupRight(req, res);
    }
}

// retrieve all ACLs, only admin user can do it
exports.listACLs = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send('Anonymous user is not allowed here');
    }
    else {
		ACL.listAll(req, res);
    }
}

// remove the user by it name, also remove it from the ACL
exports.removeUserByName  = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send('Anonymous user is not allowed here');
    }
    else {
    	var uname = req.body.username;
    	if(uname == undefined)
    		return res.send(404, 'The username field has not been filled in');
    		
		User.remove({username : {$regex : new RegExp('^'+ req.body.username + '$', "i")}}, function(error, data){
			if(error){					
				console.log('Error in deleting one annotation');
				res.json(error);
			}
			else {
				ACLAPI.removeAUserFromALC(req.body.username);
				res.send(data);
			}
		});
    }
}

// remove a group by its name, also remove it from the ACL table
exports.removeGroupByName  = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send('Anonymous user is not allowed here');
    }
    else {
    	var gname = req.params.name;
    	if(gname != undefined) {
			Group.remove({groupname : {$regex : new RegExp('^'+ req.body.groupname + '$', "i")}}, function(error, data){
				if(error){					
					console.log('Error in deleting one annotation');
					res.json(error);
				}
				else {
					ACLAPI.removeAGroupFromALC(gname);
					res.send(data);
				}
			});
		}
		else res.send(404, "The groupname has not been sent");
    }
}

// remove a given group ID, also remove this group in the ACL table
exports.removeGroupByID  = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send('Anonymous user is not allowed here');
    }
    else {
    	if(req.params.id == undefined)
    		return res.send(404, 'The id parameter has not been sent');
    		
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
}
