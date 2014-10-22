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

var	authenticate = require('../middleware/authenticate');
var	user = require('../controllers/UserAPI');
var	group = require('../controllers/GroupAPI');
var corpus = require('../controllers/CorpusAPI');
var	media = require('../controllers/MediaAPI');
var	layer = require('../controllers/LayerAPI');
var	annotation = require('../controllers/AnnotationAPI');
var	acl = require('../controllers/acl');
var	queue = require('../controllers/QueueAPI');

exports.index = function(req, res){
	res.render('index', { title: 'Camomille' });
};

exports.initialize = function(app){
	app.post("/login", authenticate.login);
	app.post('/logout', authenticate.logout);
	app.post('/me', authenticate.me);

	// --- user routes --- \\
	app.post("/user", user.userRoleAllowed("admin"), 
					  user.userNameFree, 
					  user.createUser);													// create user
	app.get('/user', user.userRoleAllowed("admin"), 
					 user.getAllUsers);													// get list of all users
	app.get('/user/:id_user', user.userRoleAllowed("admin"), 
							  user.id_userExist, 
							  user.getInfoOnUser);               						// info on a specific user
	app.put('/user/:id_user', user.userRoleAllowed("admin"), 
							  user.id_userExist,
							  user.updateUser);						  					// update information on a specific user
	app.delete('/user/:id_user', user.userIsRoot, 
							 	 user.id_userExist, 
								 user.deleteUser);										// delete a specific user
	app.get('/user/:id_user', user.userRoleAllowed("admin"), 
							  user.id_userExist, 
							  user.getAllGroupOfAUser); 								// get all group of a user
	
	// --- group routes --- \\
	app.post("/group", user.userRoleAllowed("admin"), 
					   group.groupNameFree, 
					   group.createGroup); 												// create a group
	app.get('/group', user.userRoleAllowed("admin"), 
					  group.getAllGroup); 												// get list of all groups
	app.get('/group/:id_group', user.userRoleAllowed("admin"),  
								group.id_groupExist, 
								group.getInfoOnGroup); 									// info on a specific group
	app.put('/group/:id_group', user.userRoleAllowed("admin"),  
								group.id_groupExist, 
								group.updateGroup); 									// update information of a group
	app.delete('/group/:id_group', user.userIsRoot,  
								   group.id_groupExist, 
								   group.deleteGroup); 									// delete a group
	app.post("/group/:id_group/user/:id_user", user.userRoleAllowed("admin"),  
											   group.id_groupExist, 
											   user.id_userExist,
											   group.addUserToGroup); 					// add user to a group
	app.get('/group/:id_group/user', user.userRoleAllowed("admin"), 
									 group.id_groupExist,  
									 group.getAllUserOfAGroup);							// list user of a group
	app.delete('/group/:id_group/user/:id_user', user.userRoleAllowed("admin"),  
												 group.id_groupExist, 
												 user.id_userExist, 
												 group.removeUserFromGroup); 			// remove a user from a group

	// --- resources routes --- \\
	// corpus
	app.post('/corpus', user.userRoleAllowed("admin"), 
					    corpus.createCorpus);											// create new corpus
	app.get('/corpus', acl.AllowUser("corpus", ["O"]),, 
					   corpus.getAllcorpus);											// list all corpus
	app.get('/corpus/:id_corpus', acl.AllowUser("corpus", ["O"]),
								  corpus.id_corpusExist,
								  corpus.getInfoOnCorpus);								// info on a particular corpus
	app.put('/corpus/:id_corpus', acl.AllowUser("corpus", ["O"]),
								  corpus.id_corpusExist, 
								  corpus.updateCorpus);									// update info of a corpus
	app.delete('/corpus/:id_corpus', acl.AllowUser("corpus", ["O"]),
									 corpus.id_corpusExist, 
									 corpus.deleteCorpus);								// delete a corpus
	app.post('/corpus/:id_corpus/media', acl.AllowUser("corpus", ["O"]),
										 corpus.id_corpusExist, 
										 corpus.addMedia);								// create a media for a corpus
	app.post('/corpus/:id_corpus/layer', acl.AllowUser("corpus", ["O"]),
										 corpus.id_corpusExist, 
										 corpus.addLayer);								// create a layer
	app.get('/corpus/:id_corpus/media', acl.AllowUser("corpus", ["O", "W", "V"]), 
										corpus.id_corpusExist,
										corpus.getAllMedia);							// list all media of a corpus	
	app.get('/corpus/:id_corpus/layer', acl.AllowUser("corpus", ["O", "W", "V"]),
										corpus.id_corpusExist,
										corpus.getAllLayer);							// list all layer of a corpus	
	app.get('/corpus/:id_corpus/ACL', acl.AllowUser("corpus", ["O"]),
									  corpus.id_corpusExist,
									  acl.getInfoOnACL("corpus"));						// ACL of a particular corpus
    app.get('/acl/id_corpus', acl.AllowUser("corpus", ["O"]),
							  corpus.id_corpusExist,
							  getInfoOnACL("corpus")
    app.put('/acl/id_corpus/user/id_user', acl.AllowUser("corpus", ["O"]),
										   corpus.id_corpusExist, 
										   user.id_userExist, 
										   updateACLUser("corpus")
    app.put('/acl/id_corpus/group/id_group', acl.AllowUser("corpus", ["O"]),
											 corpus.id_corpusExist,
											 group.id_groupExist, 
											 updateACLGroup("corpus")
    app.delete('/acl/id_corpus/user/id_user', acl.AllowUser("corpus", ["O"]),
											  corpus.id_corpusExist, 
											  user.id_userExist, 
											  removeUserFromACL("corpus")
    app.delete('/acl/id_corpus/group/id_group', acl.AllowUser("corpus", ["O"]),
												corpus.id_corpusExist,
												group.id_groupExist, 
												removeGroupFromACL("corpus")
    app.get('/acl/id_corpus/user/is_user', acl.AllowUser("corpus", ["O"]),
										   corpus.id_corpusExist,
										   user.id_userExist, 
										   getUserRight("corpus")

	// media									
	app.get('/media/:id_media', acl.AllowUser("corpus", ["O", "W", "V"])
								media.id_mediaExist,
								media.getInfoOnMedia);									// info on a particular media
	app.put('/media/:id_media', acl.AllowUser("corpus", ["O"]),
								media.id_mediaExist, 
								media.updateMedia);										// update info of a media
	app.delete('/media/:id_media', acl.AllowUser("corpus", ["O"]), 
								   media.id_mediaExist,
								   corpus.removeMedia);									// delete a media
	app.get('/media/:id_media/video', acl.AllowUser("corpus", ["O", "W", "V"]),
									  media.id_mediaExist, 
									  media.getVideo);
	app.get('/media/:id_media/webm', acl.AllowUser("corpus", ["O", "W", "V"]), 
									 media.id_mediaExist,
									 media.getVideoWEBM);
	app.get('/media/:id_media/mp4', acl.AllowUser("corpus", ["O", "W", "V"]),
									media.id_mediaExist, 
									media.getVideoMP4);
	app.get('/media/:id_media/ogv', acl.AllowUser("corpus", ["O", "W", "V"]),
									media.id_mediaExist, 
									media.getVideoOGV);

	// layer
	app.get('/layer/:id_layer', acl.AllowUser("layer", ["O", "W", "V"]]),
								layer.id_layerExist,
								layer.getInfoOnLayer);									// info on a particalar layer
	app.put('/layer/:id_layer', acl.AllowUser("layer", ["O"]),
								layer.id_layerExist,
								layer.updateLayer);										// update info of a layer
	app.delete('/layer/:id_layer', acl.AllowUser("layer", ["O"]),
								   layer.id_layerExist,
								   layer.deleteLayer);									// delete a layer
	app.post('/layer/:id_layer/annotation', acl.AllowUser("layer", ["O", "W"]),
											layer.id_layerExist,
											layer.addAnnotation);						// create an annotation
	app.get('/layer/:id_layer/annotation', acl.AllowUser("layer", ["O", "W", "V"]]),
										   layer.id_layerExist,
										   layer.getAllAnnotation);						// list all annotation of a layer
	app.get('/layer/:id_layer/ACL', acl.AllowUser("layer", ["O"]),
									layer.id_layerExist,
									acl.getInfoOnACL("layer")));						// ACL of a particular layer
    app.put('/acl/id_layer/user/id_user', acl.AllowUser("layer", ["O"]),
										   layer.id_layerExist, 
										   user.id_userExist, 
										   updateACLUser("layer")
    app.put('/acl/id_layer/group/id_group', acl.AllowUser("layer", ["O"]),
											 layer.id_layerExist,
											 group.id_groupExist, 
											 updateACLGroup("layer")
    app.delete('/acl/id_layer/user/id_user', acl.AllowUser("layer", ["O"]),
											  layer.id_layerExist, 
											  user.id_userExist, 
											  removeUserFromACL("layer")
    app.delete('/acl/id_layer/group/id_group', acl.AllowUser("layer", ["O"]),
												layer.id_layerExist,
												group.id_groupExist, 
												removeGroupFromACL("layer")
    app.get('/acl/id_layer/user/is_user', acl.AllowUser("layer", ["O"]),
										   layer.id_layerExist,
										   user.id_userExist, 
										   getUserRight("layer")

	// annotation
	app.get('/annotation/:id_annotation', acl.AllowUser("layer", ["O", "W", "V"]),
										  annotation.id_annotationExist,
										  annotation.getInfoOnAnnotation);				// info on a particular annotation
	app.put('/annotation/:id_annotation', acl.AllowUser("layer", ["O", "W"]),
										  annotation.id_annotationExist,
										  annotation.updateAnnotation);					// update info of an annotation
	app.delete('/annotation/:id_annotation', acl.AllowUser("layer", ["O"),
											 annotation.id_annotationExist,
											 annotation.deleteAnnotation); 				// delete annotation

	// --- queue routes --- \\
	app.post('/queue', user.currentUserExist,
					   queue.addQueue);													// create a queue
	app.get('/queue', user.userIsRoot,
					  queue.getAllQueue); 												// list all ids in a queue
	app.get('/queue/:id_queue', user.currentUserExist,
								queue.id_queueExist,
								queue.getInfoOnAQueue);									// info on a queue
	app.put('/queue/:id_queue', user.currentUserExist,
								queue.id_queueExist,
								queue.updateQueue); 									// create or replace a list of ids
	app.put('/queue/:id_queue/next/', user.currentUserExist,
									  queue.id_queueExist,
									  queue.push);									// add new annotation in a queue
	app.get('/queue/:id_queue/next/', user.currentUserExist,
									  queue.id_queueExist,  
									  queue.pop);									// get next annotation of a queue
	app.delete('/queue/:id_queue', user.currentUserExist,
								   queue.id_queueExist,
								   queue.deleteQueue);									// delete a queue
}
