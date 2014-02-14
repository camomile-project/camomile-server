/* The API controller
   Exports 3 methods:
   * post - Creates a new media
   * listAll - Returns a list of media
   * listWithId - Returns a specific media of a given id
*/

var Media = require('../models/Media').Media; //get the media model
var Corpus = require('../models/Corpus').Corpus;
var ACL = require('../models/ACL').ACL,
	ACLAPI = require('../controllers/ACLAPI'),
	Group = require('../models/Group').Group,
	commonFuncs = require('../lib/commonFuncs');

var fileSystem = require('fs'), //working with video streaming
    path = require('path');
// for the uri : app.get('/corpus/:id/media', 
/*exports.listAll = function(req, res){
	Media.find({id_corpus : req.params.id}, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('no such id_corpus!')
		}
		else
			res.json(data);
	});
} */

exports.listAll = function(req, res){
	
	function async(arg, callback) {
  		//console.log('do something with \''+arg+'\', return 1 sec later');
  		setTimeout(function() { callback(arg); }, 1000);
	}
	
	function emptyAsync(callback) {
		setTimeout(function() { callback(); },1000);
	}
	
	function final(resultReturn, n) { 
		if(resultReturn.length == 0 && n > 0)										
			res.json(403, "You dont have enough permission to get this resource");
		else res.json(resultReturn);
	}
	
	Media.find({id_corpus : req.params.id}, function(error, data){
		if(error){
			res.json(error);
		}
		else {
			var connectedUser = req.session.user;
			if(GLOBAL.no_auth == true || (connectedUser != undefined && connectedUser.role == "admin")){
				res.json(data);
			}
			else if(connectedUser != undefined && data != null){
				//first find the groups to which the connecteduser belongs
				Group.find({'usersList' : {$regex : new RegExp(connectedUser.username, "i")}}, function(error, dataGroup) {
					if(error) throw error;
					else {
						result = [];//JSON.stringify(data);
						resultReturn = [];

						for(var i = 0; i < data.length; i++){
							//console.log(data[i]._id);
							result.push(data[i]._id);
						}
						// find all acl of these ids
						ACL.find({id:{$in:result}}, function(error, dataACL){
							if(error) console.log("error in ACL-corpusListall:");
							else if(dataACL != null) {
								var dataACLLen = dataACL.length;
								var countTreatedACL = 0;
								var  deferredCollection = [];
								for(var i = 0; i < dataACL.length; i++) { 
									var foundPos = commonFuncs.findUsernameInACL(connectedUser.username, dataACL[i].users);
									// if the user has at least a R right on this resource
									// 
									if(foundPos != -1) {
										if(dataACL[i].users[foundPos].right != 'N') {
											resultReturn.push(data[i]);
											countTreatedACL += 1; 
										}
									} //not found this user's right on the current resource, look for its group's one
									else {
										foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL[i].groups);
					//					console.log("foundPos: " + foundPos + " for : ");
										if(foundPos != -1) {
										 	if(dataACL[i].groups[foundPos].right != 'N') {
												resultReturn.push(data[i]);
												countTreatedACL += 1;
											}
										}
										else { //not found user right, nor group one, do a back propagation
											(function(d){								//		console.log("get id of his parent");
												ACL.findOne({id:req.params.id}, function(error, dataACL1){
													if(error) res.send(error);
													else if(dataACL1 != null) {
														countTreatedACL += 1;
														var foundPos = commonFuncs.findUsernameInACL(connectedUser.username, dataACL1.users);

														if(foundPos != -1) {
															if(dataACL1.users[foundPos].right != 'N') {
																resultReturn.push(d);
															}
														}
														else {
															foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL1.groups);
															if(foundPos != -1 && dataACL1.groups[foundPos].right != 'N')
																resultReturn.push(d);
														}
														if(countTreatedACL == dataACLLen) {
															countTreatedACL = -1
															final(resultReturn, data.length);
														}
													}
												}); //acl 2
											})(data[i]);
										} // else { //not found user right	
									}
								} //for
								if(countTreatedACL == dataACLLen) 
									final(resultReturn, data.length);
								//emptyAsync(function(){
								//	if(countTreatedACL == dataACLLen) 
								//		final(resultReturn, data.length);
								//});
								
							} // else if(dataACL != null){
						}); //ACL.find
					} //else
				}); // group
				//res.json(resultReturn);
			} // else if (connectedUser)
			else { 
				if(data != null)
					res.json("You dont have permission to access this resource"); 
				else return([]);
			}
		}
	});
} 

//for the uri: app.get('/corpus/:id_corpus/media/:id_media', 
exports.listWithId = function(req, res){
	//Media.findOne({id_corpus: req.params.id}, function(error, data){
	//Media.find({id_ : req.params.id_media}, function(error, data){
	Media.findById(req.params.id_media, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('no such id_media!')
		}
		else
			res.json(data);
	});
}

//test for Posting corpus
//app.post('/corpus/:id_corpus/media', 
exports.post = function(req, res){
	if(req.body.name == undefined)
		return res.send(404, "one or more data fields are not filled out properly");
		
	Corpus.findById(req.params.id_corpus, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('Could not post this media because the given id_corpus is incorrect');
		}
		else {
			var media_data = {
					id_corpus: req.params.id_corpus
				  , name: req.body.name
				  , url : ""
			};
			if(req.body.url)
				media_data.url = req.body.url;
				
			var media = new Media(media_data);

			media.save(function(error1, data1){
				if(error1){
					console.log('error in posting media data');
					res.json(error1);
				}
				else {
					console.log('Success on saving media data');
					//add the current user to the ACL list
					var connectedUser;
					if(req.session.user)
						connectedUser = req.session.user.username;
					else
						connectedUser = "root";
					ACLAPI.addUserRightGeneric(data1._id, connectedUser, 'A');
					res.json(data1);
				}
			});
		}
	});
	/*var media_data = {
            id_corpus: req.params.id_corpus
          , name: req.body.name
        };

	var media = new Media(media_data);

	media.save(function(error, data){
		if(error){
			console.log('error in posting media data');
			res.json(error);
		}
		else {
			console.log('Success on saving media data');
			res.json(data);
		}
	});*/
}

//app.put('/corpus/:id_corpus/media/:id_media', 
exports.update = function(req, res){
	if(req.params.id_corpus == undefined && req.body.name == undefined && req.body.url == undefined)
		return res.send(404, "one or more data fields are not filled out properly");
		
	var update = {};
	if(req.params.id_corpus)
		update.id_corpus = req.params.id_corpus;
	if(req.body.name)
		update.name = req.body.name;
	if(req.body.url)
		update.url = req.body.url;
	//var update = {"id_corpus" : req.params.id_corpus, "name" : req.body.name};
	Media.findByIdAndUpdate(req.params.id_media, update, function (error, data) {
	//Media.update({_id:req.params.id_media}, { $set: { 'name' : req.body.name, 'url': req.body.url}}, function (error, data) {
		if(error){
			console.log('error'); console.log(error);
			res.json(error);
		}
		else{
			console.log('ok');
			res.json(data);
		}
	});
}

//app.get('/corpus/:id_corpus/media/:id_media/video', 
exports.getVideo = function(req, res){
	Media.findById(req.params.id_media, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json(404, 'no such id_media!')
		}
		else {
			
			var filePath = data.url + '.webm';
			if(data.url == undefined) return res.send(404, 'not found the video corresponding to this media');
			if(GLOBAL.video_path)
				filePath = GLOBAL.video_path + '/' + filePath;
			
			//var filePath = 'data/05._Lau_Dai_Tinh_Ai.mp3';
			//var filePath = 'data/BFMTV_BFMStory_2011-07-07_175900.webm';
			var mineType = commonFuncs.getMineType(filePath);
			if(mineType == "video/webm")
				res.sendfile(filePath);
			else {	
				fileSystem.stat(filePath, function (err, stat){
					if(stat) {
						res.writeHead(200, {
							'Content-Type': mineType,//'audio/mpeg', 
							'Content-Length': stat.size
						});
	
						var readStream = fileSystem.createReadStream(filePath);
						readStream.on('data', function(dataS) {
							var flushed = res.write(dataS);
							// Pause the read stream when the write stream gets saturated
							if(!flushed)
								readStream.pause();
						});
	
						res.on('drain', function() {
							// Resume the read stream when the write stream gets hungry 
							readStream.resume();    
						});
	
						readStream.on('end', function() {
							res.end();        
						});
					} //if
					else res.send(404);
				});
			} //if(mineType
		}
	});
}