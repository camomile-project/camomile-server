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


/*
 * GET home page.
 */

var corpus = require('../controllers/CorpusAPI'),
  	media = require('../controllers/MediaAPI'),
  	layer = require('../controllers/LayerAPI'),
  	anno = require('../controllers/AnnotationAPI'),
  	compound = require('../controllers/CompoundAPI'),
  	authenticate = require('../middleware/authenticate'),
  	ACLAPI = require('../controllers/ACLAPI'),
  	ACL = require('../models/ACL').ACL,
	group = require('../controllers/GroupAPI'),
	user = require('../controllers/UserAPI'),
	queue = require('../controllers/QueueAPI');
	
exports.index = function(req, res){
  	res.render('index', { title: 'Camomille' });
};

exports.initialize = function(app){
	authenticate.createRootUser();																						//create a root user if it does not exist

	//N R E C D A : different rights

	app.get("/", authenticate.racine); // rout

	// --- user routes --- \\
	app.post("/login", authenticate.login);
	app.post('/logout', authenticate.requiredAuthentication("user", "R", "global"), 
					    authenticate.logout);
	app.post("/user", authenticate.requiredAuthentication("admin"), 
				      authenticate.userExist, 
				      authenticate.signup);																				// create user
	app.get('/user', authenticate.requiredAuthentication("user", "R", "global"), 
				     user.listUsers);																					// get list of all users
	app.get('/user/:id', authenticate.requiredAuthentication("user", "R", "global"), 
						 user.listWithId);               																// info on a specific user
	app.put('/user/:id', authenticate.requiredAuthentication("admin"), 
						 user.update);						  															// update information on a specific user
	app.delete('/user/:id', authenticate.requiredAuthentication("admin"), 
							user.remove);                       														// delete a specific user
	
	// --- group routes --- \\
	app.post("/group", authenticate.requiredAuthentication("admin"), 
					   group.addGroup); 																				// create a group
	app.get('/group', authenticate.requiredAuthentication("user", "R", "global"), 
					  group.listAll); 																					// get list of all groups
	app.get('/group/:id', authenticate.requiredAuthentication("user", "R", "global"), 
						  group.listWithId); 																			// info on a specific group
	app.put('/group/:id', authenticate.requiredAuthentication("admin"), 
						  group.update); 																				// update information of a group
	app.delete('/group/:id', authenticate.requiredAuthentication("admin"), 
							 authenticate.removeGroupByID); 															// delete a group
	app.get('/group/:id/user', authenticate.requiredAuthentication("admin", "R", "global"), 
							   group.listUserOfGroupId); 																// list user of a group
	app.post("/group/:id/user", authenticate.requiredAuthentication("admin"), 
								group.addUser2Group); 																	// add user to a group
	app.get('/user/:id/group', authenticate.requiredAuthentication("user", "R", "global"), 
							   user.listGroupsOfUserId); 																// return list of group of a specific user
	app.delete('/group/:id/user/:username', authenticate.requiredAuthentication("admin"), 
											group.removeUserFromGroup); 												// remove a user from a group
	
	// --- resources routes --- \\
	// corpus
	app.post('/corpus', authenticate.requiredAuthentication("admin"), 
					    corpus.post);																					// create new corpus
	app.get('/corpus', authenticate.requiredAuthentication("user", 'R', "corpus"), 
					   corpus.listAll);																					// list all corpus
	app.get('/corpus/:id', authenticate.requiredAuthentication("user", 'R', "corpus"), 
						   authenticate.requiredConsistentID("user", 'R', "corpus"),  
						   corpus.listWithId);							   												// info on a particular corpus
	app.put('/corpus/:id', authenticate.requiredAuthentication("user", 'E', "corpus"), 
						   authenticate.requiredConsistentID("user", 'E', "corpus"), 
						   corpus.update);																				// update info of a corpus
	app.delete('/corpus/:id', authenticate.requiredAuthentication("user", 'D', "corpus"), 
							  authenticate.requiredConsistentID("user", 'D', "corpus"), 
						 	  compound.removeCorpus);																	// delete a corpus
	// media
	app.post('/corpus/:id_corpus/media', authenticate.requiredAuthentication("user", 'C', "corpus"), 
										 authenticate.requiredConsistentID("user", 'C', "corpus"), 
										 media.post);																	// create a media for a corpus
	app.get('/corpus/:id/media', authenticate.requiredAuthentication("user", 'R', "corpus"), 
								 authenticate.requiredConsistentID("user", 'R', "corpus"),
							     media.listAll);																		// list all media of a corpus												
	app.get('/corpus/:id_corpus/media/:id_media', authenticate.requiredAuthentication("user", 'R', "media"), 
												  authenticate.requiredConsistentID("user", 'R', "media"), 
												  media.listWithId);													// info on a particular media
	app.put('/corpus/:id_corpus/media/:id_media', authenticate.requiredAuthentication("user", 'E', "media"), 
												  authenticate.requiredConsistentID("user", 'E', "media"),
												  media.update);											  			// update info of a media
	app.delete('/corpus/:id_corpus/media/:id_media', authenticate.requiredAuthentication("user", 'D', "media"), 
													 authenticate.requiredConsistentID("user", 'D', "media"), 
													 compound.removeMedia);											  	// delete a media
	// layer
	app.post('/corpus/:id_corpus/media/:id_media/layer', authenticate.requiredAuthentication("user", 'C', "media"), 
														 authenticate.requiredConsistentID("user", 'C', "media"), 
														 layer.post);													// create a layer
	app.get('/corpus/:id_corpus/media/:id_media/layer', authenticate.requiredAuthentication("user", 'R', "media"),
														authenticate.requiredConsistentID("user", 'R', "media"), 
														layer.listAll);													// list of all layer for a media
	app.get('/corpus/:id_corpus/media/:id_media/layer/:id_layer', authenticate.requiredAuthentication("user", 'R', "layer"), 
													   			  authenticate.requiredConsistentID("user", 'R', "layer"), 
													   			  layer.listWithId);									// info on a particalar layer
	app.put('/corpus/:id_corpus/media/:id_media/layer/:id_layer', authenticate.requiredAuthentication("user", 'E', "layer"), 
																  authenticate.requiredConsistentID("user", 'E', "layer"), 
																  layer.updateAll);										// update info of a layer
	app.delete('/corpus/:id_corpus/media/:id_media/layer/:id_layer', authenticate.requiredAuthentication("user", 'D', "layer"), 
																 	 authenticate.requiredConsistentID("user", 'D', "layer"), 
																 	 compound.removeLayer);								// delete a layer
 	// annotation
 	app.post('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation', authenticate.requiredAuthentication("user", 'C', "layer"), 
																			  authenticate.requiredConsistentID("user", 'C', "layer"), 
																			  anno.post);								// create an annotation
	app.get('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation', authenticate.requiredAuthentication("user", 'R', "layer"), 
										 									 authenticate.requiredConsistentID("user", 'R', "layer"),
																		 	 anno.listAll);								// list all annotation of a layer
	app.get('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno', authenticate.requiredAuthentication("user", 'R', "annotation"), 
													   								  authenticate.requiredConsistentID("user", 'R', "annotation"), 
													   								  anno.listWithId);            		// info on a particular annotation
	app.put('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno', authenticate.requiredAuthentication("user", 'E', "annotation"), 
																					  authenticate.requiredConsistentID("user", 'E', "annotation"), 
																					  anno.updateAll);					// update info of an annotation
	app.delete('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno', authenticate.requiredAuthentication("user", 'D', "annotation"), 
																						 authenticate.requiredConsistentID("user", 'D', "annotation"), 
																						 compound.removeAnno); 			// delete annotation
	// read video
	app.get('/corpus/:id_corpus/media/:id_media/video', authenticate.requiredAuthentication("user", 'R', "media"), 
														authenticate.requiredConsistentID("user", 'R', "media"), 
														media.getVideo);
	app.get('/corpus/:id_corpus/media/:id_media/webm', authenticate.requiredAuthentication("user", 'R', "media"), 
													   authenticate.requiredConsistentID("user", 'R', "media"), 
													   media.getVideoWEBM);
	app.get('/corpus/:id_corpus/media/:id_media/mp4', authenticate.requiredAuthentication("user", 'R', "media"), 
													  authenticate.requiredConsistentID("user", 'R', "media"), 
													  media.getVideoMP4);
	app.get('/corpus/:id_corpus/media/:id_media/ogv', authenticate.requiredAuthentication("user", 'R', "media"), 
													  authenticate.requiredConsistentID("user", 'R', "media"), 
													  media.getVideoOGV);					  
													  	
	// --- queue routes --- \\
	app.post('/queue', authenticate.requiredValidUser, 
					   queue.post);																						// create a queue
	app.put('/queue/:id', authenticate.requiredValidUser, 
						  queue.update); 																				// create or replace a list of ids
	app.get('/queue', authenticate.requiredAuthentication("admin"), 
					  queue.listAll); 																					// list all ids in a queue
	app.get('/queue/:id', authenticate.requiredValidUser, 
					      queue.listWithId);																			// info on a queue
	app.get('/queue/:id/next', authenticate.requiredValidUser, 
							   queue.getNext);																			// get next annotation of a queue
	app.put('/queue/:id/next', authenticate.requiredValidUser, 
							   queue.putnext);																			// add new annotation in a queue
	app.delete('/queue/:id', authenticate.requiredValidUser, 
							 queue.remove);																				// delete a queue
	
	// You can view your own histories, or as a root user you can check all other users' histories
	app.get('/history/:name', authenticate.requiredValidUser, 
							  compound.retrieveUserHistory);															// retrieve histories of a user, 

	// --- ASL routes --- \\
	// corpus
	app.get("/corpus/:id/acl", authenticate.requiredAuthentication("user", 'A', "corpus"), 
							   authenticate.requiredConsistentID("user", 'A', "corpus"), 
							   ACLAPI.listWithIdOfResource);															// Get acl of a corpus
	app.put("/corpus/:id/acl", authenticate.requiredAuthentication("user", 'A', "corpus"), 
							   authenticate.requiredConsistentID("user", 'A', "corpus"), 
							   authenticate.requiredRightUGname("user"), 
							   ACLAPI.updateWithIdOfResource);															// Set acl of a corpus for user or a group
	// media
	app.get("/corpus/:id_corpus/media/:id_media/acl", authenticate.requiredAuthentication("user", 'A', "media"), 
													  authenticate.requiredConsistentID("user", 'A', "media"),
													  ACLAPI.listWithIdOfResource);										// Get acl of a media
	app.put("/corpus/:id_corpus/media/:id_media/acl", authenticate.requiredAuthentication("user", 'A', "media"), 
													  authenticate.requiredConsistentID("user", 'A', "media"), 
													  authenticate.requiredRightUGname("user"), 
													  ACLAPI.updateWithIdOfResource);									// Set acl of a media for user or a group
	// layer
	app.get("/corpus/:id_corpus/media/:id_media/layer/:id_layer/acl", authenticate.requiredAuthentication("user", 'A', "layer"), 
																	  authenticate.requiredConsistentID("user", 'A', "layer"), 
																	  ACLAPI.listWithIdOfResource);						// Get acl of a media
	app.put("/corpus/:id_corpus/media/:id_media/layer/:id_layer/acl", authenticate.requiredAuthentication("user", 'A', "layer"), 
																	  authenticate.requiredConsistentID("user", 'A', "layer"), 
																	  authenticate.requiredRightUGname("user"), 
																	  ACLAPI.updateWithIdOfResource);					// Set acl of a layer for user or a group
	// annotation
	app.get("/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno/acl", authenticate.requiredAuthentication("user", 'A', "annotation"),
																						  authenticate.requiredConsistentID("user", 'A', "annotation"), 																						  
																						  ACLAPI.listWithIdOfResource);	// Get acl of an annotation
	app.put("/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno/acl", authenticate.requiredAuthentication("user", 'A', "annotation"), 
																						  authenticate.requiredConsistentID("user", 'A', "annotation"), 
																						  authenticate.requiredRightUGname("user"),	
																						  ACLAPI.updateWithIdOfResource);// Set acl of an annotation for user or a group
}
