
var hash = require('./pass').hash,
    User = require('../models/user').User,
    ACLModel = require('../models/ACL').ACL,
    ACL = require('../controllers/ACLAPI'),
    Group = require('../models/Group').Group,
    GroupAPI = require('../controllers/GroupAPI'),
    commonFuncs = require('../lib/commonFuncs'),
    mongoose = require('mongoose'),
    ses = require('../models/sessions')(mongoose); //phuong added le 1/10/2013 for listing all sessions

var corpus = require('../controllers/CorpusAPI'),
  	media = require('../controllers/MediaAPI'),
  	layer = require('../controllers/LayerAPI'),
  	anno = require('../controllers/AnnotationAPI'),
  	compound = require('../controllers/CompoundAPI');

authenticateElem = function(name, pass, fn) {
    //if (!module.parent) console.log('authenticating %s:%s', name, pass);  //use somewhere else, not in the main
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
					User.findOne({username : {$regex : new RegExp(userLogin, "i")}}, function(error, data){
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
									Group.findOne({groupname : {$regex : new RegExp(groupLogin, "i")}}, function(error, data){
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
					//console.log("hre");
					commonFuncs.returnAccessDenied(req, res);
				}
				else {
					var connectedUser = req.session.user;
					var i = level;
					var found = false;
					switch(i) {
						case 7: ///corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno
							Group.find({'usersList' : {$regex : new RegExp(connectedUser.username, "i")}}, function(error, dataGroup) {
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
							Group.find({'usersList' : {$regex : new RegExp(connectedUser.username, "i")}}, function(error, dataGroup) {
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
							Group.find({'usersList' : {$regex : new RegExp(connectedUser.username, "i")}}, function(error, dataGroup) {
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
							
							Group.find({'usersList' : {$regex : new RegExp(connectedUser.username, "i")}}, function(error, dataGroup) {
								if(error) throw error;
								else {
									
									ACLModel.findOne({id:id_corpus}, function(error, dataACL) {
										if(error) {
											console.log("Error: " + error); throw error;
										}
										else if(dataACL != null) {
											
											var foundPos = commonFuncs.findUsernameInACL(connectedUser.username, dataACL.users);
										//	console.log("foundPos: " + foundPos);
											if(foundPos != -1 && commonFuncs.isAllowedRight(minimumRightRequired, dataACL.users[foundPos].right) >= 0) {
									//			console.log("dd"); 
												found = true;
												next();
											}	
											else {
												foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL.groups);
										//		console.log("foundPos: " + foundPos + " for : ");
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
							
							break;
						default:
							//keep only the permitted resources
							console.log ("level = " + level);
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

/*exports.requiredAuthentication1 = function(role, minimumRightRequired, level) {
	return function(req, res, next) {
		if (GLOBAL.no_auth){
    		next();
    	}
    	else if(req.session.user) { 
    			if(req.session.user.role == "admin")
					next();
				else {
					//call once because of callback:)
					ALC.getRightAllId(function (err, data) {
						if(err) throw err;
						else {
							if(data == null) {
								
							}
							else { //
								var i = level;
								//verify from the lowest level
								while (i > 0) {
									var found = false;
									switch(i) {
										case  3: //get the right of annotation
											var id_anno = req.params.id_anno;
																	
											break;
										case 2:
											var id_layer = req.params.id_layer;
											
											break;
										case 1:
											var id_media = req.params.id_media;
											break;
										case 0:
											var id_corpus = req.params.id_corpus;
											break;
										default:
											console.log ("level = " + level);
									}
									
									if(found) i = 0;
									i--;
								} //while
							} //second else inside ACL function
						} //first else inside ACL function
					});
					
				} //else if (req.session.user)
			}
		/*else if(req.session.user && req.session.user.role === role) {
			next();
		} else {
			if(req.session.user && req.session.user.role == "supervisor" && role == "user")
				next();
			else if(req.session.user && req.session.user.role == "admin")
				next();
			else {
				req.session.error = 'Access denied!';
				res.redirect('login');
			}
		}
	}
}*/

exports.createRootUser = function(){
	User.findOne({username:"root"}, function(err, data){
   		if(err) throw err;
   		if(!data) {
   			var pass = "camomilecghp";
			hash(pass, function (err, salt, hash) {
				if (err) throw err;
				var user = new User({
					username: "root",
		//			password : pass,
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
	});
}

/*exports.signup = function(req, res){
    hash(req.body.password, function (err, salt, hash) {
        if (err) throw err;
        var user = new User({
            username: req.body.username,
            affiliation: req.body.affiliation,
            role: req.body.role,
            salt: salt,
            hash: hash,
        }).save(function (err, newUser) {
            if (err) throw err;
			if(newUser){
				req.session.regenerate(function(){
					req.session.user = newUser;//user;
					req.session.success = 'Authenticated as ' + newUser.username + ' click to <a href="logout">logout</a>.';
					res.redirect('/');
				})
			}
    	});
	});
}*/

exports.userExist = function(req, res, next) {
    User.count({
        username: req.body.username
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            req.session.error = "This user already exists"
            res.redirect("signup");
        }
    });
}

/*exports.createRootUser = function (){
	User.findOne({username:"root"}, function(err, data){
   		if(err) throw err;
   		if(!data) {
   			var pass = "camomilecghp";
			hash(pass, function (err, salt, hash) {
				if (err) throw err;
				var user = new User({
					username: "root",
		//			password : pass,
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
	});
}*/

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
		
	authenticateElem(username, pass, function (err, user) {
        if (user) {
            req.session.regenerate(function () {

                req.session.user = user;
                req.session.success = 'Authenticated as ' + user.username + ' click to <a href="logout">logout</a>.';
                //res.redirect('/');
                //res.redirect('/');
                res.send(200, 'You have been successfully logged in');
            });
        } else {
            req.session.error = 'Authentication failed, please check your ' + ' username and password.';
            res.redirect('login');
        }
    });
}

exports.signup = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send('Anonymous user is not allowed here');
    }
	//console.log("req.body.role: " + req.body.role);
    hash(req.body.password, function (err, salt, hash) {
        if (err) throw err;
        var user = new User({
            username: req.body.username,
//            password : req.body.password,
            affiliation: req.body.affiliation,
            role: req.body.role,
            salt: salt,
            hash: hash,
        }).save(function (err, newUser) {
            if (err) throw err;
            //authenticate(newUser.username, newUser.password, function(err, user){
//               if(user){
                 if(newUser){ 
                    /*req.session.regenerate(function(){
                        req.session.user = newUser;//user;
                        req.session.success = 'Authenticated as ' + newUser.username + ' click to <a href="logout">logout</a>.';
                        res.redirect('/');
                    })*/
                    res.send(200, "the user is created successfully");
                }
            //});
        });
    });
}

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
	
	if(usrname == "root") {
		res.redirect('/');
		return false;
	}
	
	var strRights = ["admin", "user", "supervisor"];
	if(strRights.indexOf(newrole) < 0) {
		console.log("role should be either user, admin, or supervisor");
		res.redirect('/');
		return false;
	}
	//console.log("role new:  " + newrole);
	User.findOne({username:{$regex : new RegExp(usrname, "i")}}, function(err, data){
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
					// res.redirect('/'); //phuong commented on 6/11/2013 to send 200 code status only
					res.send(200, 'successfully changed the role of ' + usrname);
			});
		}
   	});
}

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

/*
exports.signupGET = function (req, res) {
    if (req.session.user) {
        res.redirect("/");
    } else {
        res.render("signup");
    }
}
*/

exports.signupGET = function (req, res) {
    if (req.session.user) { //only admin can do it
        res.render("signup");
    } else {
        res.redirect("/"); 
    }
}


exports.logoutGET = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send('This is an anonymous user');
    }
    req.session.destroy(function () {
        res.redirect('/');
    });
}

exports.profile = function (req, res) {
    if (GLOBAL.no_auth){
    	return res.send('This is an anonymous user');
    }
    var usrname = req.session.user.username;
    if(req.params.username != undefined){
    	usrname = req.params.username
    }
    
    User.findOne({
        username: {$regex : new RegExp(usrname, "i")}
    },

    function (err, user) {
        if (user) {
 			res.send("username: " + user.username + "<br>" + " Role: " + user.role + "<br>" + " affiliation: " + user.affiliation +'<br>'+ 'click to <a href="logout">logout</a>');
        } else {
            return res.send('cannot find user');
        }
    });
}

exports.listAllUsers = function (req, res) {
	User.find({}, 'username role affiliation', function (err, users) {
        if(err) throw err;
        if (users) {
 			res.send(users);
        } else {
            return res.send('no user');
        }
    });
}

exports.listAllSessions = function (req, res) {
    ses.find({},function (err, sessions) {
        if (err) console.log(err);
        else res.send(sessions);
    });
}

// working with groups of users

exports.addGroupGET = function (req, res) {
    if (req.session.user) {
        res.render("addGroup");
    } else {
        res.redirect("/");
    }
}

exports.addGroup = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send('Anonymous user is not allowed here');
    }
    else {
    	Group.findOne({groupname : {$regex : new RegExp(req.body.groupname, "i")}}, function(error, group) {
    		if(error) res.send(error);
    		else if(group == null) {
				var groupItem = {
					groupname : req.body.groupname,
					description : req.body.description,
					usersList : []
				};
				var g = new Group(groupItem);
	
				g.save(function(err, data){
					if(err) { throw err; }
					else { 
						//res.redirect('/');
						res.send(200, data);
					}
				});
			} 
			else {
				res.send("This group already exists");
			}
		});
    }
}

exports.listGroups = function (req, res) {
	Group.find({}, function (err, groups) {
        if(err) throw err;
        if (groups) {
 			res.send(groups);
        } else {
            return res.send('no group');
        }
    });
}

exports.addUser2GroupGET = function (req, res) {
    if (req.session.user) {
        res.render("addUser2Group");
    } else {
        res.redirect("/");
    }
}

exports.addUser2Group = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send('Anonymous user is not allowed here');
    }
    else {
        GroupAPI.addUser2Group(req, res);
    }
}

exports.addUserRight2ResourceGET = function (req, res) {
    if (req.session.user) {
        res.render("addUserRight2Resource");
    } else {
        res.redirect("/");
    }
}

exports.addUserRight2Resource = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send('Anonymous user is not allowed here');
    }
    else {
		ACL.addUserRight(req, res);
    }
}


exports.addGroupRight2ResourceGET = function (req, res) {
    if (req.session.user) {
        res.render("addGroupRight2Resource");
    } else {
        res.redirect("/");
    }
}

exports.addGroupRight2Resource = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send('Anonymous user is not allowed here');
    }
    else {
		ACL.addGroupRight(req, res);
    }
}

exports.listACLs = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send('Anonymous user is not allowed here');
    }
    else {
		ACL.listAll(req, res);
    }
}

exports.removeUserByName  = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send('Anonymous user is not allowed here');
    }
    else {
		User.remove({username : {$regex : new RegExp(req.body.username, "i")}}, function(error, data){
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

exports.removeGroupByID  = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send('Anonymous user is not allowed here');
    }
    else {
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

exports.removeGroupByName  = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send('Anonymous user is not allowed here');
    }
    else {
		Group.remove({groupname : {$regex : new RegExp(req.body.groupname, "i")}}, function(error, data){
			if(error){					
				console.log('Error in deleting one annotation');
				res.json(error);
			}
			else {
				ACLAPI.removeAGroupFromALC(req.body.groupname);
				res.send(data);
			}
		});
    }
}