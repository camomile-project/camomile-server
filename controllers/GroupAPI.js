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
	Group.find({}, function(error, data){
		if(error) throw error;
		else
			res.json(data);
	});
}

exports.listWithId = function(req, res){
	Group.findById(req.params.id, function(error, data){
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

exports.createGroup = function(req, res){
	if(req.body.groupname == undefined || req.body.description == undefined)
		return res.send(404, "one or more data fields are not filled out properly");
		
	Group.findOne({groupname : {$regex : new RegExp(req.body.groupname, "i")}}, function(error, data){
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
					console.log('saved');
					res.json(dat);
				}
			});	
		}
		else {
			res.send("This group already exists");
		}
	});
};


exports.addUser2Group = function(req, res){
	if(req.body.username == undefined || req.body.groupname == undefined)
		return res.send(404, "one or more data fields are not filled out properly");
		
	User.findOne({username : {$regex : new RegExp(req.body.username, "i")}}, function(error, data1){
		if(error) throw error;
		else 
		{
			if(data1 == null){
				console.log("This user does not exist");
				res.json('The user does not exist');
			}
			else {
				
				Group.findOne({groupname : {$regex : new RegExp(req.body.groupname, "i")}}, function(error, data){
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
};

