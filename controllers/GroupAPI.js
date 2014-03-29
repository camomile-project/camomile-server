/* The API controller for group's methods
   
*/

var Corpus = require('../models/Corpus').Corpus;

var Media = require('../models/Media').Media; //get the media model

var Layer = require('../models/Layer').Layer; //get the layer model

var Annotation = require('../models/Annotation').Annotation; //get the annotation model

var ACL = require('../models/ACL').ACL;

var User = require('../models/user').User;

var Group = require('../models/Group').Group;


//list all groups to which the connected user belong
exports.listAll = function (req, res) {
	var connectedUser = req.session.user;	
	if(connectedUser.role == "admin") {				
		Group.find({}, function (err, groups) {
			if(err) throw err;
			if (groups) {
				res.send(groups);
			} else {
				return res.send([]);
			}
		});
	}
    else {
    	Group.find({'usersList' : {$regex : new RegExp('^'+ connectedUser.username + '$', "i")}}, function(error, dataGroup) {
			if(error) throw error;
			else {
				res.send(dataGroup);
			}
		});
    }
}

exports.createGroup = function(req, res){
	if(req.body.groupname == undefined || req.body.description == undefined)
		return res.send(404, "one or more data fields are not filled out properly");
		
	Group.findOne({groupname : {$regex : new RegExp('^'+ req.body.groupname + '$', "i")}}, function(error, data){
		if(error) res.send(error);
		else if(data == null){
			var groupItem = {
				groupname : req.body.groupname,
				description : req.body.description,
				usersList : []
			};
			var g = new Group(groupItem);
	
			g.save(function(err, dat){
				if(err) { res.send(err); }
				else { 
					res.json(dat);
				}
			});	
		}
		else {
			res.send("This group already exists");
		}
	});
};

//add a user to a group
exports.addUser2Group = function(req, res){
	if(req.body.username)	{
		User.findOne({username : {$regex : new RegExp('^'+ req.body.username + '$', "i")}}, function(error, data1){
			if(error) throw error;
			else 
			{
				if(data1 == null){
					console.log("This user does not exist");
					res.json('The user does not exist');
				}
				else {
					//Group.findOne({groupname : {$regex : new RegExp(req.body.groupname, "i")}}, function(error, data){
					Group.findById(req.params.id, function(error, data){
						if(error) throw error;
						else 
						{
							if(data == null || data === undefined) {
								console.log("This group does not exist");
								res.json('The group does not exist');
							}
							else {
								//console.log('data in dataUser2group = '); console.log(data);
								//find if the user is already here
								if(data.usersList.indexOf(req.body.username.toLowerCase()) == -1) {
									data.usersList.push(req.body.username);
							
									data.save(function(err, dat){
										if(err) { throw err; }
										else { 
											console.log('added the user');
											res.json(dat);
										}
									}); //data.save
								}
								else res.json("This user is already in the group");
							}
						}
					}); //group find
				} //second else
			}
		});
	} //username and groupname
	else if(req.body.id_user){
		User.findById(req.body.id_user, function(error, data1){
			if(error) throw error;
			else 
			{
				if(data1 == null){
					console.log("This user does not exist");
					res.json(404, 'The user does not exist');
				}
				else {
				
					Group.findById(req.params.id, function(error, data){
						if(error) throw error;
						else 
						{
							if(data == null || data === undefined) {
								console.log("This group does not exist");
								res.json(404,'The group does not exist');
							}
							else {
								//console.log('data in dataUser2group = '); console.log(data);
								//find if the user is already here
								if(data.usersList.indexOf(data1.username) == -1) {
									data.usersList.push(data1.username);
							
									data.save(function(err, dat){
										if(err) { throw err; }
										else { 
											console.log('added the user');
											res.json(dat);
										}
									}); //data.save
								}
								else res.json("This user is already in the group");
							}
						}
					}); //group find
				} //second else
			}
		});
	}
	else return res.send(404, "one or more data fields are not filled out properly");
};

//retrieve a particular group (with id)
exports.listWithId = function(req, res){
	if(req.params.id == undefined)
		return res.send(404, "the given ID is not correct");
		
	var connectedUser = req.session.user;	

	Group.findById(req.params.id, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('no such id!')
		}
		else
			if(connectedUser.role == "admin") {	
				res.json(data);
			}
			else {
				
				if(data.usersList.indexOf(connectedUser.username) > -1) //not working on IE8 and below
					res.json(data);
				else res.send(401, "You dont have enough right to access this resource");
			}
	});
}

//retrieve a particular group (with id)
exports.listUserOfGroupId = function(req, res){
	if(req.params.id == undefined) //id of the group
		return res.send(404, "the given ID is not correct");
		
	var connectedUser = req.session.user;	

	Group.findById(req.params.id, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('no such id!')
		}
		else
			if(connectedUser.role == "admin") {	
				res.json(data.usersList);
			}
			else {
				res.send(401, "You dont have enough right to access this resource");
			}
	});
}

// add a group
exports.addGroup = function (req, res) {
	if (GLOBAL.no_auth){
    	return res.send(401, 'Anonymous user is not allowed here');
    }
    else {
    	if(req.body.groupname == undefined)
    		return res.send(404, 'The groupname field has not been filled in');
    		
    	Group.findOne({groupname : {$regex : new RegExp('^'+ req.body.groupname + '$', "i")}}, function(error, group) {
    		if(error) res.send(error);
    		else if(group == null) {
				var groupItem = {
					groupname : req.body.groupname,
					description : req.body.description || "unknown",
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

// update information of a group: put /group/:id
exports.update = function(req, res){
	if(req.params.id == undefined)
		return res.send(404, "one or more data fields are not filled out properly");
	
	var update = {};
	if(req.body.groupname)
		update.groupname = req.body.groupname;
	if(req.body.description)
		update.description = req.body.description;
		
	Group.findByIdAndUpdate(req.params.id, update, function (error, data) {
	
		if(error){
			res.json(error);
		}
		else {
	
			res.json(data);
		}
	});
}
//remove a user from a group
exports.removeUserFromGroup  = function(req, res){
	if(req.params.id == undefined || req.params.username == undefined)
		return res.send(404, "one or more data fields are not filled out properly");
	Group.findById(req.params.id, function (error, data) {
		if(error) {
			res.json(error);
		}
		else {
			var index = data.usersList.indexOf(req.params.username);
			if(index > -1) {//not working on IE8 and below
				data.usersList.splice(index, 1);
				data.save(function(err, dat){
					if(err) { res.send(err); }
					else { 
						console.log('removed the user');
						res.json(dat);
					}
				}); //data.save
			}
			else res.json(data);
		}
	});
}
