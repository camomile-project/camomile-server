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


var userModel = require('../models/User').User;
var	groupModel = require('../models/Group');
var corpusModel = require('../models/Corpus');
var	mediaModel = require('../models/Media');
var	layerModel = require('../models/Layer');
var	annotationModel = require('../models/Annotation');
var	queueModel = require('../models/Queue');

var	userAPI = require('../controllers/UserAPI');
var	groupAPI = require('../controllers/GroupAPI');
var corpusAPI = require('../controllers/CorpusAPI');
var	mediaAPI = require('../controllers/MediaAPI');
var	layerAPI = require('../controllers/LayerAPI');
var	annotationAPI = require('../controllers/AnnotationAPI');
var	queueAPI = require('../controllers/QueueAPI');
var	authenticate = require('../middleware/authenticate');

exports.index = function(req, res){
	res.render('index', { title: 'Camomille' });
};

exports.initialize = function(app){
	// --- authentification routes --- \\
	// POST /login --data '{"username":"...", "password":"..."}' --cookie-jar "cookies.txt"
	app.post("/login", authenticate.login);
	// POST /logout --cookie-jar "cookies.txt"
	app.post('/logout', authenticate.logout);
	// POST /me --cookie-jar "cookies.txt"
	app.post('/me', userAPI.getInfo(req.session.user));


	// --- user routes --- \\
	// create user
	// POST /user --data '{"username":"...", "password":"...", "role":"admin", "description":{"...":"..."}}'
	app.post("/user", userAPI.currentUserIsAdmin, 
					  userAPI.create);
	// get list of all users
	// GET /user
	app.get('/user', userAPI.currentUserIsAdmin, 
					 userAPI.getAll);
	// info on a specific user
	// GET /user/id_user
	app.get('/user/:id_user', userAPI.exist, 
							  userAPI.currentUserIsAdmin, 
							  userAPI.getInfo);
	// update information on a specific user
	// PUT /user/id_user --data '{"password":"...", "role":"admin", "description":{"...":"..."}}'
	app.put('/user/:id_user', userAPI.exist,
							  userAPI.currentUserIsAdmin, 
							  userAPI.update);
	// delete a specific user
	// DELETE /user/id_user
	app.delete('/user/:id_user', userAPI.exist, 
								 userAPI.isRoot, 
							 	 userAPI.delete);
	// get all group of a user
	// GET /user/id_user/group
	app.get('/user/:id_user', userAPI.exist, 
							  userAPI.currentUserIsAdmin, 
							  userAPI.getAllGroupOfAUser);
	
	// --- group routes --- \\
	// create a group
	// POST /group --data '{"name":"...", "description":{"...":"..."}}}}'
	app.post("/group", userAPI.currentUserIsAdmin, 
					   groupAPI.create);
	// get list of all groups
	// GET /group
	app.get('/group', userAPI.currentUserIsAdmin, 
					  groupAPI.getAll);
	// info on a specific group
	// GET /group/id_group
	app.get('/group/:id_group', groupAPI.exist, 
								userAPI.currentUserIsAdmin,  
								groupAPI.getInfo);
	// update information of a group
	// PUT /group/id_group --data '{"description":"desc"}'
	app.put('/group/:id_group', groupAPI.exist, 
								userAPI.currentUserIsAdmin,  
								groupAPI.update);
	// delete a group
	// DELETE /group/id_group
	app.delete('/group/:id_group', groupAPI.exist, 
								   userAPI.userIsRoot,  
								   groupAPI.delete);
	// add user to a group
	// POST /group/id_group/user/id_user
	app.post("/group/:id_group/user/:id_user", groupAPI.exist, 
											   userAPI.exist,
											   userAPI.currentUserIsAdmin,  
											   groupAPI.addUser);
	// remove a user from a group
	// DELETE /group/id_group/user/id_user
	app.delete('/group/:id_group/user/:id_user', groupAPI.exist, 
												 userAPI.exist, 
												 userAPI.currentUserIsAdmin,  
												 groupAPI.removeUser);

	// --- resources routes --- \\
	// corpus
	// create new corpus
	// POST /corpus --data '{"name":"new corpus", "description":{"...":"..."}' 
	app.post('/corpus', userAPI.currentUserIsAdmin, 
					    corpusAPI.create);

	// GET /corpus
	app.get('/corpus', corpusAPI.getAll);
	// info on a particular corpus
	// GET /corpus/id_corpus
	app.get('/corpus/:id_corpus', corpusAPI.exist,
								  corpusAPI.AllowUser(['O', 'W', 'R'], next()),
								  corpusAPI.getInfo);
	// update info of a corpus
	// PUT /corpus/id_corpus --data '{"name":"new corpus", "description":{"...":"..."}}'
	app.put('/corpus/:id_corpus', corpusAPI.exist, 
								  corpusAPI.AllowUser(['O'], next()),
								  corpusAPI.update);
	// delete a corpus
	// DELETE /corpus/id_corpus
	app.delete('/corpus/:id_corpus', corpusAPI.exist, 
									 corpusAPI.currentUserIsAdmin,
									 corpusAPI.delete);
	// create a media for a corpus
	// POST /corpus/id_corpus/media --data '{"name":"...", "url":"...", "description":{"...":"..."}}' 
	app.post('/corpus/:id_corpus/media', corpusAPI.exist, 
										 corpusAPI.AllowUser(['O', 'W'], next()),
										 corpusAPI.addMedia);
	// create a layer
	// POST /corpus/id_corpus/layer --data '{"name":"new layer", "description":{"...":"..."}, "fragment_type":{"...":"..."}, "data_type":{"...":"..."}}' 
	app.post('/corpus/:id_corpus/layer', corpusAPI.exist, 
										 corpusAPI.AllowUser(['O', 'W'], next()),
										 corpusAPI.addLayer);
	// list all media of a corpus
	// GET /corpus/id_corpus/media
	app.get('/corpus/:id_corpus/media', corpusAPI.exist,
										corpusAPI.AllowUser(['O', 'W', 'R'], next()), 
										corpusAPI.getAllMedia);
	// list all layer of a corpus	
	// GET /corpus/id_corpus/layer
	app.get('/corpus/:id_corpus/layer', corpusAPI.exist,
										corpusAPI.getAllLayer);
	// ACL of a particular corpus
	// GET /corpus/id_corpus/acl
	app.get('/corpus/:id_corpus/ACL', corpusAPI.exist,
									  corpusAPI.AllowUser(['O'], next()),
									  corpusAPI.getACL);
	// update user ACL for a corpus
    // PUT /corpus/id_corpus/user/id_user --data '{"Right":"O"}'
    app.put('/acl/id_corpus/user/id_user', corpusAPI.exist, 
										   userAPI.exist, 
										   corpusAPI.AllowUser(['O'], next()),
										   corpusAPI.updateUserACL);
    // update group ACL for a corpus
    // PUT /corpus/id_corpus/group/id_group --data '{"Right":"O"}'
    app.put('/acl/id_corpus/group/id_group', corpusAPI.exist,
											 groupAPI.exist, 
											 corpusAPI.AllowUser(['O'], next()),
											 corpusAPI.updateGroupACL);
    
    // DELETE /corpus/id_corpus/user/id_user 
    app.delete('/acl/id_corpus/user/id_user', corpusAPI.exist, 
											  userAPI.exist, 
											  corpusAPI.AllowUser(['O'], next()),
											  corpusAPI.removeUserFromACL);
    // delete a group right for a corpus
    // DELETE /corpus/id_corpus/group/id_group 
    app.delete('/acl/id_corpus/group/id_group', corpusAPI.exist,
												groupAPI.exist, 
												corpusAPI.AllowUser(['O'], next()),
												corpusAPI.removeGroupFromACL);

	// media
	// info on a particular media
	// GET /media/id_media
	app.get('/media/:id_media', mediaAPI.exist,
								corpusAPI.AllowUser(['O', 'W', 'R'], next()),
								mediaAPI.getInfo);
	// update info of a media
	// PUT /media/id_media --data '{"name":"...", "url":"...", "description":{"...":"..."}}'
	app.put('/media/:id_media', mediaAPI.exist, 
								corpusAPI.AllowUser(['O'], next()),
								mediaAPI.update);
	// delete a media
	// DELETE /media/id_media
	app.delete('/media/:id_media', mediaAPI.exist,
								   corpusAPI.AllowUser(['O'], next()),
								   corpusAPI.remove);
	// get video stream
	// GET /media/id_media/video
	app.get('/media/:id_media/video', mediaAPI.exist, 
									  corpusAPI.AllowUser(['O', 'W', 'R'], next()),
									  mediaAPI.getVideo);
	// get webm stream
	// GET /media/id_media/webm
	app.get('/media/:id_media/webm', mediaAPI.exist,
									 corpusAPI.AllowUser(['O', 'W', 'R']), next(), 
									 mediaAPI.getVideoWEBM);
	// get mp4 stream
	// GET /media/id_media/mp4
	app.get('/media/:id_media/mp4', mediaAPI.exist, 
									corpusAPI.AllowUser(['O', 'W', 'R'], next()),
									mediaAPI.getVideoMP4);
	// get ogv stream
	// GET /media/id_media/ogv
	app.get('/media/:id_media/ogv', mediaAPI.exist, 
									corpusAPI.AllowUser(['O', 'W', 'R'], next()),
									mediaAPI.getVideoOGV);

	// layer
	// info on a particular layer
	// GET /layer/id_layer
	app.get('/layer/:id_layer', layerAPI.exist,
								layerAPI.AllowUser(['O', 'W', 'R'], next()),
								layerAPI.getInfo);
	// update info of a layer
	// PUT /layer/id_layer --data '{"name":"speaker", "description":{"...":"..."}}'
	app.put('/layer/:id_layer', layerAPI.exist,
								layerAPI.AllowUser(['O'], next()),
								layerAPI.update);
	// delete a layer
	// DELETE /layer/id_layer
	app.delete('/layer/:id_layer', layerAPI.exist,
								   layerAPI.AllowUser(['O'], next()),
								   layerAPI.delete);
	// create an annotation
	// POST /layer/id_layer/annotation --data '{"fragment":{"start":0, "end":15}, "data":"value", "id_media":""}' 
	app.post('/layer/:id_layer/annotation', layerAPI.exist,
											layerAPI.AllowUser(['O', 'W'], next()),
											layerAPI.addAnnotation);
	// list all annotation of a layer
	// GET /layer/id_layer/annotation
	app.get('/layer/:id_layer/annotation', layerAPI.exist,
										   layerAPI.AllowUser(['O', 'W', 'R'], next()),
										   layerAPI.getAllAnnotation);
	// ACL of a particular layer
	// GET /corpus/id_layer/acl
	app.get('/layer/:id_layer/ACL', layerAPI.exist,
									layerAPI.AllowUser(['O'], next()),
									layerAPI.getACL("layer"));
	// update user ACL for a layer
	// PUT /corpus/id_layer/user/id_user --data '{"Right":"O"}'
	app.put('/acl/id_layer/user/id_user', layerAPI.exist, 
										  userAPI.exist, 
										  layerAPI.AllowUser(['O'], next()),
										  layerAPI.updateUserACL("layer"));
	// update group ACL for a layer
	// PUT /corpus/id_layer/group/id_group --data '{"Right":"O"}'
	app.put('/acl/id_layer/group/id_group', layerAPI.exist,
											groupAPI.exist, 
											layerAPI.AllowUser(['O'], next()),
											layerAPI.updateGroupACL("layer"));
	// delete a user right for a layer
	// DELETE /corpus/id_layer/user/id_user 
    app.delete('/acl/id_layer/user/id_user', layerAPI.exist, 
											 userAPI.exist, 
											 layerAPI.AllowUser(['O'], next()),
											 layerAPI.removeUserFromACL("layer"));
    // delete a group right for a layer
	// DELETE /corpus/id_layer/group/id_group
    app.delete('/acl/id_layer/group/id_group', layerAPI.exist,
											   groupAPI.exist, 
											   layerAPI.AllowUser(['O'], next()),
											   layerAPI.removeGroupFromACL("layer"));

	// annotation
	// info on a particular annotation
	// GET /annotation/id_annotation
	app.get('/annotation/:id_annotation', annotationAPI.exist,
										  layerAPI.AllowUser(['O', 'W', 'R'], next()),
										  annotationAPI.getInfo);
	// update info of an annotation
	// PUT /annotation/id_annotation --data '{"user":"id_user", fragment":{"start":0, "end":15}, "data":"value", "id_media":""}'
	app.put('/annotation/:id_annotation', annotationAPI.exist,
										  layerAPI.AllowUser(['O', 'W'], next()),
										  annotationAPI.update);
	// delete annotation
	// DELETE /annotation/id_annotation
	app.delete('/annotation/:id_annotation', annotationAPI.exist,
											 layerAPI.AllowUser(['O'], next()),
											 annotationAPI.delete);

	// --- queue routes --- \\
	// create a queue
	// POST /queue --data '{"name":"...", "description":{"...":"..."}, "list": [{}, {}, ...]}'
	app.post('/queue', queueAPI.add);
	// list all ids in a queue
	// GET /queue
	app.get('/queue', userAPI.userIsRoot,
					  queueAPI.getAll);
	// info on a queue
	// GET /queue/id_queue
	app.get('/queue/:id_queue', queueAPI.exist,
								queueAPI.getInfo);
	// create or replace a list of ids
	// PUT /queue/id_queue --data '{"name":"...", "description":{"...":"..."}, "list": [{}, {}, ...]}'
	app.put('/queue/:id_queue', queueAPI.exist,
								queueAPI.update);
	// add new annotation in a queue
	// PUT /queue/id_queue/next --data '{}'
	app.put('/queue/:id_queue/next/', queueAPI.exist,
									  queueAPI.push);
	// get next annotation of a queue
	// GET /queue/id_queue/next
	app.get('/queue/:id_queue/next/', queueAPI.exist,  
									  queueAPI.pop);
	// delete a queue
	// DELETE /queue/id_queue
	app.delete('/queue/:id_queue', queueAPI.exist,
								   userAPI.currentUserIsAdmin,  
								   queueAPI.delete);
}
