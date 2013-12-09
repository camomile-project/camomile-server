/* The API controller
   Exports 3 methods:
   * post - Creates a new layer
   * listAll - Returns a list of layers
   * listWithId - Returns a specific layer of a given id
*/
var Media = require('../models/Media').Media; //get the media model for cross-check
var Layer = require('../models/Layer').Layer; //get the layer model

var ACL = require('../models/ACL').ACL,
	ACLAPI = require('../controllers/ACLAPI'),
	Group = require('../models/Group').Group,
	commonFuncs = require('../lib/commonFuncs');

// for the uri : app.get('/corpus/:id_corpus/media/:id_media/layer', 

exports.listAll = function(req, res){
	Layer.find({id_media : req.params.id_media}, function(error, data){
		if(error){
			res.json(error);
		}
		else {
			var connectedUser = req.session.user;
			if(GLOBAL.no_auth == true || (connectedUser != undefined && connectedUser.role == "admin")){
				res.json(data);
			}
			else if(connectedUser != undefined && data != null){
				//first find the group to which the connecteduser belongs
				Group.find({'usersList' : {$regex : new RegExp(connectedUser.username, "i")}}, function(error, dataGroup) {
					if(error) throw error;
					else {
					//	console.log("Finding a user in a group for: " + connectedUser.username); console.log(dataGroup);
						result = [];//JSON.stringify(data);
						resultReturn = [];
					//	console.log("test listall Corpus: " + data.length);
						for(var i = 0; i < data.length; i++){
							console.log(data[i]._id);
							result.push(data[i]._id);
						}
					//	console.log("Id of media: "); console.log(req.params.id_media);
						//result.push(req.params.id); //add the corpus id to the end of the list for back propagation
						
						ACL.find({id:{$in:result}}, function(error, dataACL){
							if(error) console.log("error in ACL-corpusListall:");
							else if(dataACL != null){
					//			console.log("dataACL");
					//			console.log(dataACL);
								//console.log("connectedUser"); console.log(connectedUser);
								for(var i = 0; i < dataACL.length; i++){ //the last one is the corpus id
									var foundPos = commonFuncs.findUsernameInACL(connectedUser.username, dataACL[i].users);
					//				console.log("foundPos: " + foundPos);
									if(foundPos != -1 && dataACL[i].users[foundPos].right != 'N')
										resultReturn.push(data[i]);
									else {
										foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL[i].groups);
					//					console.log("foundPos: " + foundPos + " for : ");
										if(foundPos != -1 && dataACL[i].groups[foundPos].right != 'N')
											resultReturn.push(data[i]);
									}
								} //for
								if(resultReturn.length == 0) {
								//	console.log("get id of his parent");
									parentID = [];
									parentID.push(req.params.id_media); parentID.push(req.params.id_corpus);
									ACL.findOne({id:{$in:parentID}}, function(error, dataACL1){
										if(error) res.send(403, error);
										else if(dataACL1 != null) {
											var contd = true;
											for(var i = 0; i < dataACL1.length && contd; i++) {
												var foundPos = commonFuncs.findUsernameInACL(connectedUser.username, dataACL1[i].users);
					//							console.log("foundPos: " + foundPos);
												if(foundPos != -1 && dataACL1[i].users[foundPos].right != 'N') {
													resultReturn.push(data); contd = false;
												}
												else {
													foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL1[i].groups);
					//								console.log("foundPos: " + foundPos + " for : ");
													if(foundPos != -1 && dataACL1[i].groups[foundPos].right != 'N') {
														resultReturn.push(data); contd = false;
													}
												}
											} //for
											if(resultReturn.length == 0 && data.length > 0)
												res.json(403, "You dont have enough permission to get this resource");
											else res.json(resultReturn);
										}
									}); //acl 2
								} //if(resultReturn.length == 0) {
								else res.json(resultReturn);
							}
						}); //ACL.find
					} //else
				}); // group
				//res.json(resultReturn);
			} // else if (connectedUser)
			else res.json(403, "You dont have permission to access this resource");
		}
	});
}

/*exports.listAll = function(req, res){
	Layer.find({id_media : req.params.id_media}, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('no such id_media!')
		}
		else
			res.json(data);
	});
}*/

//for the uri: app.get('/corpus/:id_corpus/media/:id_media/layer/:id_layer 
exports.listWithId = function(req, res){
	Layer.findById(req.params.id_layer, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('no such id_layer!')
		}
		else
			res.json(data);
	});
}

//test for Posting corpus
//app.post('/corpus/:id_corpus/media/:id_media/layer', 
exports.post = function(req, res){
	if(req.body.layer_type == undefined || req.body.fragment_type == undefined 
		|| req.body.data_type == undefined || req.body.source == undefined || req.body.history == undefined)
		return res.send(404, "one or more data fields are not filled out properly");
	
	Media.findById(req.params.id_media, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('Could not post this layer because the given id_media is incorrect'); return;
		}
		else {
			var layer_data = {
				"id_media" : req.params.id_media,
				"layer_type" : req.body.layer_type,
				"fragment_type" : req.body.fragment_type,
				"data_type" : req.body.data_type,
				"source" : req.body.source,
				"history" : req.body.history
			};
	
			var layer = new Layer(layer_data);
	
			layer.save( function(errorLayer, dataLayer){
				if(errorLayer){
					console.log('error in posting layer data, the id_media does not exist');
					res.json(errorLayer);
					return;
				}
				else{
					console.log('Success on saving layer data');
					// add the current id to the ACL list
					var connectedUser;
					if(req.session.user)
						connectedUser = req.session.user.username;
					else
						connectedUser = "root";
					ACLAPI.addUserRightGeneric(dataLayer._id, connectedUser, 'A');
					res.json(dataLayer);
				}
			});
		}
	});
	/*var layer_data = {
			"id_media" : req.params.id_media,
			"layer_type" : req.body.layer_type,
			"fragment_type" : req.body.fragment_type,
			"data_type" : req.body.data_type,
			"source" : req.body.source,
			"history" : req.body.history
	};
	
	var layer = new Layer(layer_data);
	
	layer.save( function(error, dataLayer){
		if(error){
			console.log('error in posting layer data, the id_media does not exist');
			res.json(error);
			return;
		}
		else{
			console.log('Success on saving layer data');
			res.json(dataLayer);
		}
	});*/
}

//test for updating layers
//app.put('/corpus/:id_corpus/media/:id_media/layer/:id_layer', 
exports.updateAll = function(req, res){
	if(req.body.layer_type == undefined && req.body.fragment_type == undefined 
		&& req.body.data_type == undefined && req.body.source == undefined)
		return res.send(404, "one or more data fields are not filled out properly");

	var update = {};
	if(req.body.id_media)
		update.id_media = req.params.id_media;
	if(req.body.layer_type)
		update.layer_type = req.body.layer_type;
	if(req.body.fragment_type)
		update.fragment_type = req.body.fragment_type;
	if(req.body.data_type)
		update.data_type = req.body.data_type;
	if(req.body.source)
		update.source = req.body.source;
			
	/*var update = {
			id_media : req.params.id_media,
			layer_type : req.body.layer_type,
			fragment_type : req.body.fragment_type,
			data_type : req.body.data_type,
			source : req.body.source
	//		history : req.body.history
	};*/
	Layer.findByIdAndUpdate(req.params.id_layer, update, function (error, oneLayer) {
		if(error){
			res.json(error);
		}
		else
		{
			//oneLayer.history.push({name: req.body.history.name});
			//oneLayer.history.push({name:req.body.history.name, date: req.body.history.date}); //phuong commented on 6th 11 2013
			var dateNow = new Date();
			var uname = req.session.user.username;
			if(uname == undefined) uname = "root";
			oneLayer.history.push({name:uname, date: dateNow});
			
			oneLayer.save( function(error, data){
				if(error){
					res.json(error);
				}
				else{
					res.json(data);
				}
			});
			//res.json(data);
		}
	});
}