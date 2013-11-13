/* The API controller for compound methods
   
*/

var Corpus = require('../models/Corpus').Corpus;

var Media = require('../models/Media').Media; //get the media model

var Layer = require('../models/Layer').Layer; //get the layer model

var Annotation = require('../models/Annotation').Annotation; //get the annotation model

var ACL = require('../models/ACL').ACL;

var User = require('../models/user').User;

var Group = require('../models/Group').Group;

exports.listAll = function(req, res){
	ACL.find({}, function(error, data){
		if(error) throw error;
		else
			res.json(data);
	});
}

exports.listWithId = function(req, res){
	ACL.findById(req.params.id, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('no such id!')
		}
		else
			res.json(data);
	});
};

exports.listWithIdOfResource = function(req, res){
	var idSought = req.params.id_anno;///corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno/acl
	if(idSought == undefined) idSought = req.params.id_layer;
	if(idSought == undefined) idSought = req.params.id_media;
	if(idSought == undefined) idSought = req.params.id;
	ACL.findOne({id:idSought}, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('no such id!')
		}
		else
			res.json(data);
	});
};
//update
exports.updateWithIdOfResource = function(req, res){
	var idSought = req.params.id_anno;///corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno/acl
	if(idSought == undefined) idSought = req.params.id_layer;
	if(idSought == undefined) idSought = req.params.id_media;
	if(idSought == undefined) idSought = req.params.id;
	
	ACL.findOne({id:idSought}, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('no such id!');
		}
		else {
			//console.log("here: "); console.log(data);
			var username = req.body.username,
				userright = req.body.userright,
				groupname = req.body.groupname,
				groupright = req.body.groupright;
			if(username != undefined) {
				User.findOne({username : {$regex : new RegExp(username, "i")}}, function(error, datU){
					if(error) send(error);
					else 
					{
						if(datU == null){
							console.log("This group does not exist");
							res.send("This group does not exist");
						}
						else {
							var i = findUserInUsersRightArr(username, data.users);
							if(i == -1)
								data.users.push({login : username, right : userright});
							else data.users[i].right = userright;
							data.save(function(error, dat){
								if(error){
									res.send(404, error);
								}
								else {
									console.log("saved: " + dat);
									res.json(dat);
								}
							});
						} //else
					}
				});	
			}			
			
			else if(groupname != undefined) {
				Group.findOne({groupname : {$regex : new RegExp(groupname, "i")}}, function(error, datG){
					if(error) send(error);
					else 
					{
						if(datG == null){
							console.log("This group does not exist");
							res.send("This group does not exist");
						}
						else {
							var i = findUserInUsersRightArr(groupname, data.groups);
							if(i == -1)
								data.groups.push({login : groupname, right : groupright});
							else data.groups[i].right = groupright;
							
							data.save(function(error, dat){
								if(error){
									res.send(404, error);
								}
								else {
									console.log("saved: " + dat);
									res.json(dat);
								}
							});
						} //else
					}
				});	
			}
		} //else
	});
};


exports.getRightOfId = function(id1, callback){
	ACL.findOne({id:id1}, callback);
};


exports.getRightOfIdSynChro = function(id) {
        var callback = function() {
            return function(error, data) {
                if(error) {
                    console.log("Error: " + error);
                }
                console.log("success");
            }
        };
        return ACL.findById(id, callback);
};

var ready = false;
    var result = null;	
    var check = function() {
		if (ready === true) {
			 return;
		}
		setTimeout(check, 1000);
	}
exports.getRightOfIdHachedSyncho = function(id1){
	
	
	/*var callback = function() {
            return function(error, data) {
                if(error) {
                    console.log("Error: " + error); throw error;
                }
                else {result = data; console.log("data ready: "); console.log(data); ready = true;}
            }
        };*/
	ACL.find({id:id1}, function(error, data) {
                if(error) {
                    console.log("Error: " + error); throw error;
                }
                else {result = data; console.log("data ready: "); console.log(result); ready = true;}
            });
	check();
	return result;
}

exports.getRightAllId = function(callback){
	ACL.findById({}, callback);
};

exports.addUserRightGeneric = function addUserRightGeneric(id1, userLogin, userRight){
	User.findOne({username : {$regex : new RegExp(userLogin, "i")}}, function(error, data){
		if(error) throw error;
		else 
		{
			if(data == null){
				console.log("This user does not exist");
			}
			else {
		
				ACL.findOne({id:id1}, function(error, dataACL){
					if(error){
						throw error;
					}
					else if(dataACL == null || dataACL.length == 0){
						//not exist, create a new entry
						var item = {
							"id" : id1,
							"users" : [],
							"groups" : []
						};
						item.users.push({login : userLogin, right : userRight});
		
						var aclItem = new ACL(item);

						aclItem.save(function(err){
							if(err) { throw err; }
							console.log('saved');
						});
					}
					else {
						// just update the user account
						console.log("data generic: "); console.log(dataACL);
						var i = findUserInUsersRightArr(userLogin, dataACL.users);
						if(i == -1)
							dataACL.users.push({login : userLogin, right : userRight});
						else dataACL.users[i].right = userRight;
						
						//data.users.push({login : userLogin, right : userRight});
						dataACL.save(function(error, dat){
							if(error){
								throw error;
							}
							else {
								console.log("saved: " + dat);
							}
						});
					}
				});
			}
		}
	});
}

function findUserInUsersRightArr(login, users){
	for(var i = 0; i < users.length; i++) {
		if(users[i].login == login.toLowercase()) return i;
	}
	return -1;
} 

exports.addUserRight = function(req, res){
	User.findOne({username : {$regex : new RegExp(req.body.userLogin, "i")}}, function(error, data){
		if(error) throw error;
		else 
		{
			if(data == null){
				console.log("This user does not exist");
				res.send("This user does not exist");
			}
			else {
		
				ACL.findOne({id:req.body.id}, function(error, data){
					if(error){
						throw error;
					}
					else if(data == null){
						//not exist, create a new entry
						var item = {
							"id" : req.body.id,
							"users" : [],
							"groups" : []
						};
						item.users.push({login : req.body.userLogin, right : req.body.userRight});
		
						var aclItem = new ACL(item);

						aclItem.save(function(err, acl){
							if(err) { throw err; }
							console.log('saved');
							res.send(acl);
						});
					}
					else {
						// just update the user account
						var i = findUserInUsersRightArr(req.body.userLogin, data.users);
						if(i == -1)
							data.users.push({login : req.body.userLogin, right : req.body.userRight});
						else data.users[i].right = req.body.userRight;
						
						data.save(function(error, dat){
							if(error){
								throw error;
							}
							else {
								console.log("saved");
								res.send(dat);
							}
						});
					}
				});
			}
		}
	});
}

exports.addGroupRight = function(req, res){
	Group.findOne({groupname : {$regex : new RegExp(req.body.groupLogin, "i")}}, function(error, data){
		if(error) throw error;
		else 
		{
			if(data == null){
				console.log("This group does not exist");
				res.send("This group does not exist");
			}
			else {
				
				ACL.findOne({id:req.body.id}, function(error, data){
					if(error){
						throw error;
					}
					else if(data == null){
						//not exist, create a new entry
						var item = {
							"id" : req.body.id,
							"users" : [],
							"groups" : []
						};
						item.groups.push({login : req.body.groupLogin, right : req.body.groupRight});
			
						var aclItem = new ACL(item);

						aclItem.save(function(err, dat){
							if(err) { throw err; }
							console.log('saved');
							res.send(dat);
						});
					}
					else {
						// just update the group account
						var i = findUserInUsersRightArr(req.body.groupLogin, data.groups);
						console.log('i = ' + i);
						if(i == -1)
							data.groups.push({login : req.body.groupLogin, right : req.body.groupRight});
						else data.groups[i].right = req.body.groupRight;
						
						
						data.save(function(error, dat){
							if(error){
								throw error;
							}
							else{
								console.log("saved");
								res.send(dat);
							}
						});
					} //else
				});			
				
			} //else
		} //first else
	}); // group.find
}


exports.addGroupRightGeneric = function addGroupRightGeneric(id1, groupLogin, groupRight){
	Group.findOne({groupname : {$regex : new RegExp(groupLogin, "i")}}, function(error, data){
		if(error) throw error;
		else 
		{
			if(data == null){
				console.log("This group does not exist");
			}
			else {
				
				ACL.findOne({id:id1}, function(error, data){
					if(error){
						throw error;
					}
					else if(data == null || data.length == 0){
						//not exist, create a new entry
						var item = {
							"id" : id1,
							"users" : [],
							"groups" : []
						};
						item.groups.push({login : groupLogin, right : groupRight});
			
						var aclItem = new ACL(item);

						aclItem.save(function(err){
							if(err) { throw err; }
							console.log('saved');
						});
					}
					else {
						// just update the group account
						var i = findUserInUsersRightArr(groupLogin, data.groups);
						console.log('i = ' + i);
						if(i == -1)
							data.groups.push({login : groupLogin, right : groupRight});
						else data.groups[i].right = groupRight;
						
						//data.groups.push({login : groupLogin, right : groupRight});
						data.save(function(error, data){
							if(error){
								throw error;
							}
							else{
								console.log("saved");
							}
						});
					}
				});			
				
			} //else
		} //first else
	}); // group.find
}

exports.removeAnACLEntry = function removeAnACLEntry(id2remove){
	ALC.remove({id : id2remove}, function(error, data){
		if(error) {
			console.log(error); return;
		}
		else {
			console.log("just removed the " + id2remove + " from the ACL");
		}
	});
}

function removeItemFromArray(a, item){
	var index = -1;
	console.log("index = " + index);
	for(var j = 0; j < a.length; j++) {
		if(a[j].login == item.toLowercase()) {
			index = j; break;
		}
	}	
	if(index != -1)
		a.splice(index, 1);
}

exports.removeAUserFromALC = function removeAnUserFromALC(user2remove){
	ACL.find({'users.login' : {$regex : new RegExp(user2remove, "i")}}, function(error, data){
		if(error){
			console.log(error); return;
		}
		else if(data != null) {
			for(var i = 0; i < data.length; i++) {
				removeItemFromArray(data[i].users, user2remove);
				
				data[i].save(function(error, dat) {
					if(error) throw error;
					else {
					//	console.log("dat: "); console.log(dat);
						console.log("just removed the " + user2remove + " from the ACL");
					}
				});
			}
		}
	});
}

exports.removeAGroupFromALC = function removeAnGroupFromALC(group2remove){
	ACL.find({'groups.login' : {$regex : new RegExp(group2remove, "i")}}, function(error, data){
		if(error){
			console.log(error); return;
		}
		else if(data != null) {
			for(var i = 0; i < data.length; i++) {
				removeItemFromArray(data[i].groups, group2remove);
				
				data[i].save(function(error, dat) {
					if(error) throw error;
					else {
					//	console.log("dat: "); console.log(dat);
						console.log("just removed the " + group2remove + " from the ACL");
					}
				});
			}
		}
	});
}
