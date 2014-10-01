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
	app.post('/logout', authenticate.requiredAuthentication("user", "R", "global"), authenticate.logout);
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
					    corpus.post);
	app.get('/corpus', corpus.listAll);
	app.get('/corpus/:id', authenticate.requiredConsistentID("user", 'R', "corpus"),  
						   authenticate.requiredAuthentication("user", 'R', "corpus"), 
						   corpus.listWithId);							   
	app.put('/corpus/:id', authenticate.requiredConsistentID("user", 'E', "corpus"), 
						   authenticate.requiredAuthentication("user", 'E', "corpus"), 
						   corpus.update);
	app.delete('/corpus/:id', authenticate.requiredConsistentID("user", 'D', "corpus"), 
						 	  authenticate.requiredAuthentication("user", 'D', "corpus"), 
						 	  compound.removeCorpus);
	// media
	app.post('/corpus/:id_corpus/media', authenticate.requiredConsistentID("user", 'C', "corpus"), 
										 authenticate.requiredAuthentication("user", 'C', "corpus"), 
										 media.post);
	app.get('/corpus/:id/media', media.listAll);
	app.get('/corpus/:id_corpus/media/:id_media', authenticate.requiredConsistentID("user", 'R', "media"), 
												  authenticate.requiredAuthentication("user", 'R', "media"), 
												  media.listWithId);
	app.put('/corpus/:id_corpus/media/:id_media', authenticate.requiredConsistentID("user", 'E', "media"),
												  authenticate.requiredAuthentication("user", 'E', "media"), 
												  media.update);											  
	app.delete('/corpus/:id_corpus/media/:id_media', authenticate.requiredConsistentID("user", 'D', "media"), 
													 authenticate.requiredAuthentication("user", 'D', "media"), 
													 compound.removeMedia);											  
	// layer
	app.post('/corpus/:id_corpus/media/:id_media/layer', authenticate.requiredConsistentID("user", 'C', "media"), 
														 authenticate.requiredAuthentication("user", 'C', "media"), 
														 layer.post);
	app.get('/corpus/:id_corpus/media/:id_media/layer', authenticate.requiredConsistentID("user", 'R', "media"), 
														layer.listAll);	
	app.get('/corpus/:id_corpus/media/:id_media/layer/:id_layer', authenticate.requiredConsistentID("user", 'R', "layer"), 
													   			  authenticate.requiredAuthentication("user", 'R', "layer"), 
													   			  layer.listWithId);
	app.put('/corpus/:id_corpus/media/:id_media/layer/:id_layer', authenticate.requiredConsistentID("user", 'E', "layer"), 
																  authenticate.requiredAuthentication("user", 'E', "layer"), 
																  layer.updateAll);
	app.delete('/corpus/:id_corpus/media/:id_media/layer/:id_layer', authenticate.requiredConsistentID("user", 'D', "layer"), 
																 	 authenticate.requiredAuthentication("user", 'D', "layer"), 
																 	 compound.removeLayer);
 	// annotation
 	app.post('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation', authenticate.requiredConsistentID("user", 'C', "layer"), 
																			  authenticate.requiredAuthentication("user", 'C', "layer"), 
																			  anno.post);
	app.get('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation', authenticate.requiredConsistentID("user", 'R', "layer"), 
																		 	 anno.listAll);		
	app.get('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno', authenticate.requiredConsistentID("user", 'R', "annotation"), 
													   								  authenticate.requiredAuthentication("user", 'R', "annotation"), 
													   								  anno.listWithId);
	app.put('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno', authenticate.requiredConsistentID("user", 'E', "annotation"), 
																					  authenticate.requiredAuthentication("user", 'E', "annotation"), 
																					  anno.updateAll);
	app.delete('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno', authenticate.requiredConsistentID("user", 'D', "annotation"), 
																						  authenticate.requiredAuthentication("user", 'D', "annotation"), 
																						  compound.removeAnno); 
	// read video
	app.get('/corpus/:id_corpus/media/:id_media/video', authenticate.requiredConsistentID("user", 'R', "media"), 
														authenticate.requiredAuthentication("user", 'R', "media"), 
														media.getVideo);
	app.get('/corpus/:id_corpus/media/:id_media/webm', authenticate.requiredConsistentID("user", 'R', "media"), 
													   authenticate.requiredAuthentication("user", 'R', "media"), 
													   media.getVideoWEBM);
	app.get('/corpus/:id_corpus/media/:id_media/mp4', authenticate.requiredConsistentID("user", 'R', "media"), 
													  authenticate.requiredAuthentication("user", 'R', "media"), 
													  media.getVideoMP4);
	app.get('/corpus/:id_corpus/media/:id_media/ogv', authenticate.requiredConsistentID("user", 'R', "media"), 
													  authenticate.requiredAuthentication("user", 'R', "media"), 
													  media.getVideoOGV);					  
													  	
	// --- queue routes --- \\
	app.post('/queue', authenticate.requiredValidUser, 
					   queue.post);
	app.put('/queue/:id', authenticate.requiredValidUser, 
						  queue.update); //create or replace a list of ids
	app.get('/queue', authenticate.requiredAuthentication("admin"), 
					  queue.listAll); 
	app.get('/queue/:id', authenticate.requiredValidUser, 
					      queue.listWithId);
	app.get('/queue/:id/next', authenticate.requiredValidUser, 
							   queue.getNext);
	app.put('/queue/:id/next', authenticate.requiredValidUser, 
							   queue.putnext);
	app.delete('/queue/:id', authenticate.requiredValidUser, 
							 queue.remove);
	
	// You can view your own histories, or as a root user you can check all other users' histories
	app.get('/history/:name', authenticate.requiredValidUser, 
							  compound.retrieveUserHistory);															// retrieve histories of a user, 

	// --- ASL routes --- \\
	// corpus
	app.get("/corpus/:id/acl", authenticate.requiredConsistentID("user", 'A', "corpus"), 
							   authenticate.requiredAuthentication("user", 'A', "corpus"), 
							   ACLAPI.listWithIdOfResource);
	app.put("/corpus/:id/acl", authenticate.requiredConsistentID("user", 'A', "corpus"), 
							   authenticate.requiredRightUGname("user"), authenticate.requiredAuthentication("user", 'A', "corpus"), 
							   ACLAPI.updateWithIdOfResource);
	// media
	app.get("/corpus/:id_corpus/media/:id_media/acl", authenticate.requiredConsistentID("user", 'A', "media"),
													  authenticate.requiredAuthentication("user", 'A', "media"), 
													  ACLAPI.listWithIdOfResource);
	app.put("/corpus/:id_corpus/media/:id_media/acl", authenticate.requiredConsistentID("user", 'A', "media"), 
													  authenticate.requiredRightUGname("user"), 
													  authenticate.requiredAuthentication("user", 'A', "media"), 
													  ACLAPI.updateWithIdOfResource);
	// layer
	app.get("/corpus/:id_corpus/media/:id_media/layer/:id_layer/acl", authenticate.requiredConsistentID("user", 'A', "layer"), 
																	  authenticate.requiredAuthentication("user", 'A', "layer"), 
																	  ACLAPI.listWithIdOfResource);
	app.put("/corpus/:id_corpus/media/:id_media/layer/:id_layer/acl", authenticate.requiredConsistentID("user", 'A', "layer"), 
																	  authenticate.requiredRightUGname("user"), 
																	  authenticate.requiredAuthentication("user", 'A', "layer"), 
																	  ACLAPI.updateWithIdOfResource);
	// annotation
	app.get("/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno/acl", authenticate.requiredConsistentID("user", 'A', "annotation"), 
																						  authenticate.requiredAuthentication("user", 'A', "annotation"), 
																						  ACLAPI.listWithIdOfResource);
	app.put("/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno/acl", authenticate.requiredConsistentID("user", 'A', "annotation"), 
																						  authenticate.requiredRightUGname("user"),	
																						  authenticate.requiredAuthentication("user", 'A', "annotation"), 
																						  ACLAPI.updateWithIdOfResource);
}
