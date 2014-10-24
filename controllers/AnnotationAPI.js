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










/***************************************************** old part ********************************************************/

/* The API controller
   Exports 3 methods:
   * post - Creates a new annotation
   * listAll - Returns a list of annotations
   * listWithId - Returns a specific annotation of a given id
*/


// for the uri : app.get('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation'
/*
	- First: retrieves all annotations regardless of user/group's rights
	- Second: finds all groups belonging to the connected user
	- For each found annotation, check ACLs (the permission of the connected user and its groups)
	- If not found, do a back propagation
*/ 
exports.listAll = function(req, res){
	
	function final(resultReturn, n) { 
		if (resultReturn.length == 0 && n > 0) res.status(403).json({error: "You dont have enough permission to get this resource"});
		else res.status(200).json(resultReturn);
	}
	Annotation.find({id_layer : req.params.id_layer}, function(error, data){	// get all annotations under this id
		if (error) res.status(400).json({error:"error", message:error});
		else {
			var connectedUser = req.session.user;
			if (GLOBAL.no_auth == true || (connectedUser != undefined && connectedUser.role == "admin")) res.status(200).json(data);
			else if (connectedUser != undefined && data != null){
				Group.find({'usersList' : {$regex : new RegExp('^'+ connectedUser.username + '$', "i")}}, function(error2, dataGroup) {				//first find the groups to which the connecteduser belongs
					if (error2) res.status(400).json({error:"error", message:error2});
					else {					
						result = [];
						resultReturn = [];
						for(var i = 0; i < data.length; i++) result.push(data[i]._id);
						ACL.find({id:{$in:result}}, function(error3, dataACL){												// then find all acls of these id
							if (error3) res.status(500).json({error:"error in ACL-corpusListall", message:error3});
							else if (dataACL != null){
								var dataACLLen = dataACL.length;
								var countTreatedACL = 0;
								for(var i = 0; i < dataACL.length; i++){ 
									var foundPos = commonFuncs.findUsernameInACL(connectedUser.username, dataACL[i].users);

									if (foundPos != -1) { 
										if (dataACL[i].users[foundPos].right != 'N') {
											resultReturn.push(data[i]);
											countTreatedACL += 1;
										}
									} 
									else {																					// not found user's right, find its group's one
										foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL[i].groups);
										if (foundPos != -1) {
											if (dataACL[i].groups[foundPos].right != 'N') {
												resultReturn.push(data[i]);
												countTreatedACL += 1;
											}
										}
										else { 																				//not found user right, nor group one, do a back propagation
											(function(d){
												parentID = [];																//be careful, the order of push is important
												parentID.push(req.params.id_layer);
												parentID.push(req.params.id_media); 
												parentID.push(req.params.id_corpus);
												ACL.find({id:{$in:parentID}}, function(error4, dataACL1){					// get all parent's acl 
													if (error4) res.status(400).json({error:"error", message:error4});
													else if (dataACL1 != null) {
														countTreatedACL += 1;
														var contd = true; 													// stop when found any right
														for(var j = 0; j < dataACL1.length && contd; j++) {
															var foundPos = commonFuncs.findUsernameInACL(connectedUser.username, dataACL1[j].users);
														
															if (foundPos != -1) {
																if (dataACL1[j].users[foundPos].right != 'N') {
																	resultReturn.push(d); 
																	contd = false;
																}
															}
															else {
																foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL1[j].groups);
							
																if (foundPos != -1) {
																	if (dataACL1[j].groups[foundPos].right != 'N') {
																		resultReturn.push(d); 
																		contd = false;
																	}
																	else contd = false; 									// stop because we already found the right N
																}
															}
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
								if (countTreatedACL == dataACLLen) final(resultReturn, data.length);
							}
							else res.status(400).json({error: "error in finding acl"});
						}); 
					} 
				}); 
			} 
			else res.status(403).json({error: "You dont have permission to access this resource"});
		}
	});
}

exports.listWithId = function(req, res){
	Annotation.findById(req.params.id_anno, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else if (data == null) res.status(400).json({error:'no such id_layer!'})
		else res.status(200).json(data);
	});
}





exports.post = function(req, res){


	if (req.body.fragment == undefined || req.body.data == undefined) return res.status(400).json({error: "one or more data fields are not filled out properly"});
	Layer.findById(req.params.id, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else if (data == null) res.status(400).json({error:'Could not post this annotation because the given id is incorrect'});
		else {		
			var annoItem = {"id" : req.params.id, "fragment" : req.body.fragment, "data" : req.body.data, "history" : []};
			var anno = new Annotation(annoItem);
			var connectedUser = req.session.user.username;
			var modified = {"id" : req.params.id, "fragment" : req.body.fragment, "data" : req.body.data};			// changed after the meeting with the CRP and grenoble
			anno.history.push({name : connectedUser, date : new Date(), modification:modified});
			anno.save( function(error2, annoData){
				if (error2) res.status(400).json({error:"error", message:error2});
				else {
					ACLAPI.addUserRightGeneric(annoData._id, connectedUser, 'A');
					res.status(200).json(annoData);
				}
			});
		}
	});
}

exports.updateAll = function(req, res){
	if (req.body.fragment == undefined && req.body.data == undefined) return res.status(400).json({error: "one or more data fields are not filled out properly"});
	var update = {};
	if (req.body.fragment) update.fragment = req.body.fragment;
	if (req.body.data) update.data = req.body.data;
	
	Annotation.findByIdAndUpdate(req.params.id_anno, update, function (error, anno) {
		if (error) res.status(400).json({error:"error", message:error});
		else {
			var dateNow = new Date();
			var uname = "root"; 
			if (req.session.user) uname = req.session.user.username;
			anno.history.push({name:uname, date: dateNow, modification: update});			//changed after the meeting with RCP and grenoble
			anno.save( function(error2, data){
				if (error2) res.status(400).json({error:"error", message:error2});
				else res.status(200).json(data);
			});
		}
	});
}