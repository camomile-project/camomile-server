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


var User = require('../models/User');
var	Group = require('../models/Group');
var Corpus = require('../models/Corpus');
var	Media = require('../models/Media');
var	Layer = require('../models/Layer');
var	Annotation = require('../models/Annotation');
var	Queue = require('../models/Queue');

var commonFuncs = require('../controllers/commonFuncs');
var	userAPI = require('../controllers/UserAPI');
var	groupAPI = require('../controllers/GroupAPI');
var corpusAPI = require('../controllers/CorpusAPI');
var	mediaAPI = require('../controllers/MediaAPI');
var	layerAPI = require('../controllers/LayerAPI');
var	annotationAPI = require('../controllers/AnnotationAPI');
var	queueAPI = require('../controllers/QueueAPI');
var	session = require('../controllers/Session');

exports.initialize = function(app){
	// --- authentification routes --- \\
	// POST /login --data '{"username":"...", "password":"..."}' --cookie-jar "cookies.txt"
	app.post("/login", session.login);
	// POST /logout --cookie-jar "cookies.txt"
	app.post('/logout', session.islogin,
						session.logout);
	// GET /me --cookie-jar "cookies.txt"
	app.get('/me', session.islogin,
				   session.me);

	// --- tools routes --- \\
	// GET /date --cookie-jar "cookies.txt"
	app.get('/date', session.islogin,
				     commonFuncs.date);

	// --- user routes --- \\
	// create user
	// POST /user --data '{"username":"...", "password":"...", "role":"admin", "description":{"...":"..."}}'
	app.post("/user", session.islogin,
					  userAPI.currentUserIsAdmin, 
					  userAPI.create);	
	// get list of all users
	// GET /user
	app.get('/user', session.islogin,
					 userAPI.currentUserIsAdmin, 
					 userAPI.getAll);
	// info on a specific user
	// GET /user/id_user
	app.get('/user/:id_user', session.islogin,
							  userAPI.exist, 
							  userAPI.currentUserIsAdmin, 
							  userAPI.getInfo);
	// update information on a specific user
	// PUT /user/id_user --data '{"password":"...", "role":"admin", "description":{"...":"..."}}'
	app.put('/user/:id_user', session.islogin,
							  userAPI.exist,
							  userAPI.currentUserIsAdmin, 
							  userAPI.update);
	// delete a specific user
	// DELETE /user/id_user
	app.delete('/user/:id_user', session.islogin,
								 userAPI.currentUserIsroot,
								 userAPI.exist, 
							 	 userAPI.remove);				// rajouter la suppression dans les acl
	// get all group of a user
	// GET /user/id_user/group
	app.get('/user/:id_user/group', session.islogin,
									userAPI.exist, 
									userAPI.currentUserIsAdmin, 
									userAPI.getAllGroupOfAUser);
	
	// --- group routes --- \\
	// create a group
	// POST /group --data '{"name":"...", "description":{"...":"..."}}'
	app.post("/group", session.islogin,
					   userAPI.currentUserIsAdmin, 
					   groupAPI.create);
	// get list of all groups
	// GET /group
	app.get('/group', session.islogin,
					  userAPI.currentUserIsAdmin, 
					  groupAPI.getAll);
	// info on a specific group
	// GET /group/id_group
	app.get('/group/:id_group', session.islogin,
								groupAPI.exist, 
								userAPI.currentUserIsAdmin,  
								groupAPI.getInfo);
	// update information of a group
	// PUT /group/id_group --data '{"description":"desc"}'
	app.put('/group/:id_group', session.islogin,
								groupAPI.exist, 
								userAPI.currentUserIsAdmin,  
								groupAPI.update);
	// delete a group
	// DELETE /group/id_group
	app.delete('/group/:id_group', session.islogin,
								   groupAPI.exist, 
								   userAPI.currentUserIsroot,  
								   groupAPI.remove);				// rajouter la suppression dans les acl
	// add user to a group
	// PUT /group/id_group/user/id_user
	app.put("/group/:id_group/user/:id_user", session.islogin,
											  groupAPI.exist, 
											  userAPI.exist,
											  userAPI.currentUserIsAdmin,  
											  groupAPI.addUser);
	// remove a user from a group
	// DELETE /group/id_group/user/id_user
	app.delete('/group/:id_group/user/:id_user', session.islogin,
												 groupAPI.exist, 
												 userAPI.exist, 
												 userAPI.currentUserIsAdmin,  
												 groupAPI.removeUser);

	// --- resources routes --- \\
	// corpus
	// create new corpus
	// POST /corpus --data '{"name":"new corpus", "description":{"...":"..."}' 
	app.post('/corpus', session.islogin,
						userAPI.currentUserIsAdmin, 
					    corpusAPI.create);

	// GET /corpus
	app.get('/corpus', session.islogin,
					   corpusAPI.getAll);
	// info on a particular corpus
	// GET /corpus/id_corpus
	app.get('/corpus/:id_corpus', session.islogin,
								  corpusAPI.exist,
								  corpusAPI.AllowUser(['O', 'W', 'R']),
								  corpusAPI.getInfo);
	// update info of a corpus
	// PUT /corpus/id_corpus --data '{"name":"new corpus", "description":{"...":"..."}}'
	app.put('/corpus/:id_corpus', session.islogin,
								  corpusAPI.exist, 
								  corpusAPI.AllowUser(['O']),
								  corpusAPI.update);
	// delete a corpus
	// DELETE /corpus/id_corpus
	app.delete('/corpus/:id_corpus', session.islogin,
									 corpusAPI.exist, 
									 userAPI.currentUserIsAdmin, 
									 corpusAPI.AllowUser(['O']),
									 corpusAPI.remove);
	// create a media for a corpus
	// POST /corpus/id_corpus/media --data '{"name":"...", "url":"...", "description":{"...":"..."}}' 
	app.post('/corpus/:id_corpus/media', session.islogin,
										 corpusAPI.exist, 
										 corpusAPI.AllowUser(['O', 'W']),
										 corpusAPI.addMedia);
	// create multi media for a corpus
	// POST /corpus/id_corpus/medias --data '{"media_list":[{"name":"...", "url":"...", "description":{"...":"..."}}, ...]}' 
	app.post('/corpus/:id_corpus/medias', session.islogin,
										  corpusAPI.exist, 
										  corpusAPI.AllowUser(['O', 'W']),
										  corpusAPI.addMedias);	
	// create a layer
	// POST /corpus/id_corpus/layer --data '{"name":"new layer", "description":{"...":"..."}, "fragment_type":{"...":"..."}, "data_type":{"...":"..."}}' 
	app.post('/corpus/:id_corpus/layer', session.islogin,
										 corpusAPI.exist, 
										 corpusAPI.AllowUser(['O', 'W']),
										 corpusAPI.addLayer);
	// list all media of a corpus
	// GET /corpus/id_corpus/media
	app.get('/corpus/:id_corpus/media', session.islogin,
										corpusAPI.exist,
										corpusAPI.AllowUser(['O', 'W', 'R']), 
										corpusAPI.getAllMedia);
	// list all layer of a corpus	
	// GET /corpus/id_corpus/layer
	app.get('/corpus/:id_corpus/layer', session.islogin,
										corpusAPI.exist,
										corpusAPI.getAllLayer);
	// ACL of a particular corpus
	// GET /corpus/id_corpus/acl
	app.get('/corpus/:id_corpus/ACL', session.islogin,
									  corpusAPI.exist,
									  corpusAPI.AllowUser(['O']),
									  corpusAPI.getACL);
	// update user ACL for a corpus
    // PUT /corpus/id_corpus/user/id_user --data '{"Right":"O"}'
    app.put('/corpus/:id_corpus/user/:id_user', session.islogin,
												corpusAPI.exist, 
												userAPI.exist, 
												corpusAPI.AllowUser(['O']),
												corpusAPI.updateUserACL);
    // update group ACL for a corpus
    // PUT /corpus/id_corpus/group/id_group --data '{"Right":"O"}'
    app.put('/corpus/:id_corpus/group/:id_group', session.islogin,
												  corpusAPI.exist,
												  groupAPI.exist, 
												  corpusAPI.AllowUser(['O']),
												  corpusAPI.updateGroupACL);
    
    // DELETE /corpus/id_corpus/user/id_user 
    app.delete('/corpus/:id_corpus/user/:id_user', session.islogin,
												   corpusAPI.exist, 
												   userAPI.exist, 
												   corpusAPI.AllowUser(['O']),
												   corpusAPI.removeUserFromACL);
    // delete a group right for a corpus
    // DELETE /corpus/id_corpus/group/id_group 
    app.delete('/corpus/:id_corpus/group/:id_group', session.islogin,
													 corpusAPI.exist,
													 groupAPI.exist, 
													 corpusAPI.AllowUser(['O']),
													 corpusAPI.removeGroupFromACL);

	// media
	// get all media
	// GET /media
	app.get('/media', session.islogin,
					  userAPI.currentUserIsroot,
					  mediaAPI.getAll);		
	// info on a particular media
	// GET /media/id_media
	app.get('/media/:id_media', session.islogin,
								mediaAPI.exist,
								mediaAPI.AllowUser(['O', 'W', 'R']),
								mediaAPI.getInfo);
	// update info of a media
	// PUT /media/id_media --data '{"name":"...", "url":"...", "description":{"...":"..."}}'
	app.put('/media/:id_media', session.islogin,
								mediaAPI.exist, 
								mediaAPI.AllowUser(['O']),
								mediaAPI.update);
	// delete a media
	// DELETE /media/id_media
	app.delete('/media/:id_media', session.islogin,
								   mediaAPI.exist,
								   mediaAPI.AllowUser(['O']),
								   mediaAPI.remove);
	// get video stream
	// GET /media/id_media/video
	app.get('/media/:id_media/video', session.islogin,
									  mediaAPI.exist, 
									  mediaAPI.AllowUser(['O', 'W', 'R']),
									  mediaAPI.getVideo);
	// get webm stream
	// GET /media/id_media/webm
	app.get('/media/:id_media/webm', session.islogin,
									 mediaAPI.exist,
									 mediaAPI.AllowUser(['O', 'W', 'R']), 
									 mediaAPI.getVideoWEBM);
	// get mp4 stream
	// GET /media/id_media/mp4
	app.get('/media/:id_media/mp4', session.islogin,
									mediaAPI.exist, 
									mediaAPI.AllowUser(['O', 'W', 'R']),
									mediaAPI.getVideoMP4);
	// get ogv stream
	// GET /media/id_media/ogv
	app.get('/media/:id_media/ogv', session.islogin,
									mediaAPI.exist, 
									mediaAPI.AllowUser(['O', 'W', 'R']),
									mediaAPI.getVideoOGV);

	// layer
	// get all layer
	// GET /layer
	app.get('/layer', session.islogin,
					  userAPI.currentUserIsroot,
					  layerAPI.getAll);	
	// info on a particular layer
	// GET /layer/id_layer
	app.get('/layer/:id_layer', session.islogin,
								layerAPI.exist,
								layerAPI.AllowUser(['O', 'W', 'R']),
								layerAPI.getInfo);
	// update info of a layer
	// PUT /layer/id_layer --data '{"name":"speaker", "description":{"...":"..."}}'
	app.put('/layer/:id_layer', session.islogin,
								layerAPI.exist,
								layerAPI.AllowUser(['O']),
								layerAPI.update);
	// delete a layer
	// DELETE /layer/id_layer
	app.delete('/layer/:id_layer', session.islogin,
								   layerAPI.exist,
								   layerAPI.AllowUser(['O']),
								   layerAPI.remove);
	// create an annotation
	// POST /layer/id_layer/annotation --data '{"fragment":{"start":0, "end":15}, "data":"value", "id_media":""}' 
	app.post('/layer/:id_layer/annotation', session.islogin,
											layerAPI.exist,
											layerAPI.AllowUser(['O', 'W']),
											layerAPI.addAnnotation);
	// create multi annotation
	// POST /layer/id_layer/annotation --data '{"annotation_list":[{"fragment":{"start":0, "end":15}, "data":"value", "id_media":""}, ...]}' 
	app.post('/layer/:id_layer/annotations', session.islogin,
											 layerAPI.exist,
											 layerAPI.AllowUser(['O', 'W']),
											 layerAPI.addAnnotations);
	// list all annotation of a layer
	// GET /layer/id_layer/annotation
	app.get('/layer/:id_layer/annotation', session.islogin,
										   layerAPI.exist,
										   layerAPI.AllowUser(['O', 'W', 'R']),
										   layerAPI.getAllAnnotation);
	// ACL of a particular layer
	// GET /corpus/id_layer/acl
	app.get('/layer/:id_layer/ACL', session.islogin,
									layerAPI.exist,
									layerAPI.AllowUser(['O']),
									layerAPI.getACL);
	// update user ACL for a layer
	// PUT /corpus/id_layer/user/id_user --data '{"Right":"O"}'
	app.put('/layer/:id_layer/user/:id_user', session.islogin,
											  layerAPI.exist, 
											  userAPI.exist, 
											  layerAPI.AllowUser(['O']),
											  layerAPI.updateUserACL);
	// update group ACL for a layer
	// PUT /corpus/id_layer/group/id_group --data '{"Right":"O"}'
	app.put('/layer/:id_layer/group/:id_group', session.islogin,
												layerAPI.exist,
												groupAPI.exist, 
												layerAPI.AllowUser(['O']),
												layerAPI.updateGroupACL);
	// delete a user right for a layer
	// DELETE /corpus/id_layer/user/id_user 
    app.delete('/layer/:id_layer/user/:id_user', session.islogin,
												 layerAPI.exist, 
												 userAPI.exist, 
												 layerAPI.AllowUser(['O']),
												 layerAPI.removeUserFromACL);
    // delete a group right for a layer
	// DELETE /corpus/id_layer/group/id_group
    app.delete('/layer/:id_layer/group/:id_group', session.islogin,
												   layerAPI.exist,
												   groupAPI.exist, 
												   layerAPI.AllowUser(['O']),
												   layerAPI.removeGroupFromACL);
    
	// annotation
	// get all annotation
	// GET /annotation
	app.get('/annotation', session.islogin,
						   userAPI.currentUserIsroot,
						   annotationAPI.getAll);		
	// info on a particular annotation
	// GET /annotation/id_annotation
	app.get('/annotation/:id_annotation', session.islogin,
										  annotationAPI.exist,
										  annotationAPI.AllowUser(['O', 'W', 'R']),
										  annotationAPI.getInfo);
	// update info of an annotation
	// PUT /annotation/id_annotation --data '{"user":"id_user", fragment":{"start":0, "end":15}, "data":"value", "id_media":""}'
	app.put('/annotation/:id_annotation', session.islogin,
										  annotationAPI.exist,
										  annotationAPI.AllowUser(['O', 'W']),
										  annotationAPI.update);
	// delete annotation
	// DELETE /annotation/id_annotation
	app.delete('/annotation/:id_annotation', session.islogin,
											 annotationAPI.exist,
											 annotationAPI.AllowUser(['O']),
											 annotationAPI.remove);

	// --- queue routes --- \\
	// create a queue
	// POST /queue --data '{"name":"...", "description":{"...":"..."}, "list": [{}, {}, ...]}'
	app.post('/queue', session.islogin,
					   queueAPI.create);
	// list all ids in a queue
	// GET /queue
	app.get('/queue', session.islogin,
					  userAPI.currentUserIsroot,
					  queueAPI.getAll);
	// info on a queue
	// GET /queue/id_queue
	app.get('/queue/:id_queue', session.islogin,
								queueAPI.exist,
								queueAPI.getInfo);
	// create or replace a list of ids
	// PUT /queue/id_queue --data '{"name":"...", "description":{"...":"..."}, "list": [{}, {}, ...]}'
	app.put('/queue/:id_queue', session.islogin,
								queueAPI.exist,
								queueAPI.update);
	// add new annotation in a queue
	// PUT /queue/id_queue/next --data '{}'
	app.put('/queue/:id_queue/next', session.islogin,
									  queueAPI.exist,
									  queueAPI.push);
	// get next annotation of a queue
	// GET /queue/id_queue/next
	app.get('/queue/:id_queue/next', session.islogin,
									  queueAPI.exist,  
									  queueAPI.pop);
	// delete a queue
	// DELETE /queue/id_queue
	app.delete('/queue/:id_queue', session.islogin,
								   queueAPI.exist,
								   userAPI.currentUserIsAdmin,  
								   queueAPI.remove);
}
