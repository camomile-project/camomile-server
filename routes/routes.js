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
    //get
	//create a root user if it does not exist
	authenticate.createRootUser();

	app.post("/login", authenticate.login);
	app.post('/logout', authenticate.requiredAuthentication("user", "R", 0), authenticate.logout);

	app.get('/user', authenticate.requiredAuthentication("user", "R", 0), user.listUsers);
	app.get('/user/:id', authenticate.requiredAuthentication("user", "R", 0), user.listWithId);
	app.get('/user/:id/group', authenticate.requiredAuthentication("user", "R", 0), user.listGroupsOfUserId); //testing
	app.put('/user/:id', authenticate.requiredAuthentication("admin"), user.update);
	app.delete('/user/:id', authenticate.requiredAuthentication("admin"), user.remove);
	app.post("/user", authenticate.requiredAuthentication("admin"), authenticate.userExist, authenticate.signup);
	// app.post("/chmodUser/:username/:role", authenticate.requiredAuthentication("admin"), authenticate.chmodUser);
	// app.post("/chmodUser", authenticate.requiredAuthentication("admin"), authenticate.chmodUser);
	
	// app.get('/session', authenticate.requiredAuthentication("admin"), authenticate.listAllSessions);
	
	//--------------------
	app.get('/group', authenticate.requiredAuthentication("user", "R", 0), group.listAll); // testing : done
	app.post("/group", authenticate.requiredAuthentication("admin"), group.addGroup); //done

	app.get('/group/:id', authenticate.requiredAuthentication("user", "R", 0), group.listWithId); // testing done
	app.put('/group/:id', authenticate.requiredAuthentication("admin"), group.update); // testing : done
	app.delete('/group/:id', authenticate.requiredAuthentication("admin"), authenticate.removeGroupByID); //done

	app.get('/group/:id/user', authenticate.requiredAuthentication("admin", "R", 0), group.listUserOfGroupId); // testing 
	app.post("/group/:id/user", authenticate.requiredAuthentication("admin"), group.addUser2Group); //done

	app.delete('/group/:id/user/:username', authenticate.requiredAuthentication("admin"), group.removeUserFromGroup); //done
	
	//--------------------------------
	app.get("/corpus/:id/acl", authenticate.requiredConsistentID("user", 'A', 1), 
		authenticate.requiredAuthentication("user", 'A', 1), ACLAPI.listWithIdOfResource);
	
	app.get("/corpus/:id_corpus/media/:id_media/acl", authenticate.requiredConsistentID("user", 'A', 3),
		authenticate.requiredAuthentication("user", 'A', 3), ACLAPI.listWithIdOfResource);
		
	app.get("/corpus/:id_corpus/media/:id_media/layer/:id_layer/acl", 
		authenticate.requiredConsistentID("user", 'A', 5), 
		authenticate.requiredAuthentication("user", 'A', 5), ACLAPI.listWithIdOfResource);
		
	app.get("/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno/acl", 
		authenticate.requiredConsistentID("user", 'A', 7), authenticate.requiredAuthentication("user", 'A', 7), 
		ACLAPI.listWithIdOfResource);
	
	app.put("/corpus/:id/acl", authenticate.requiredConsistentID("user", 'A', 1), 
		authenticate.requiredRightUGname("user"), authenticate.requiredAuthentication("user", 'A', 1), 
		ACLAPI.updateWithIdOfResource);
		
	//app.put("/corpus/:id/acl", authenticate.requiredRightUGname("user"), ACLAPI.updateWithIdOfResource);
	app.put("/corpus/:id_corpus/media/:id_media/acl", authenticate.requiredConsistentID("user", 'A', 3), 
		authenticate.requiredRightUGname("user"), 
		authenticate.requiredAuthentication("user", 'A', 3), ACLAPI.updateWithIdOfResource);

	app.put("/corpus/:id_corpus/media/:id_media/layer/:id_layer/acl", authenticate.requiredConsistentID("user", 'A', 5), 
		authenticate.requiredRightUGname("user"), 
		authenticate.requiredAuthentication("user", 'A', 5), ACLAPI.updateWithIdOfResource);
	
	app.put("/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno/acl", 
		authenticate.requiredConsistentID("user", 'A', 7), authenticate.requiredRightUGname("user"), 
		authenticate.requiredAuthentication("user", 'A', 7), ACLAPI.updateWithIdOfResource);
	//end of authenticating configurations
	
	// ===================================
	//N R E C D A : different rights
	app.get("/", authenticate.racine); // rout
	
	//app.get('/corpus', authenticate.requiredAuthentication("user", 0, 0), corpus.listAll);
	app.get('/corpus', corpus.listAll);
	
	app.get('/corpus/:id', authenticate.requiredConsistentID("user", 'R', 1),  
		authenticate.requiredAuthentication("user", 'R', 1), corpus.listWithId);
	//-------------
	//app.get('/corpus/:id/media', authenticate.requiredAuthentication("user", 'N', 2), media.listAll);
	app.get('/corpus/:id/media', media.listAll);
	app.get('/corpus/:id_corpus/media/:id_media', authenticate.requiredConsistentID("user", 'R', 3), 
		authenticate.requiredAuthentication("user", 'R', 3), media.listWithId);
	//-------------

	app.get('/corpus/:id_corpus/media/:id_media/video', authenticate.requiredConsistentID("user", 'R', 3), 
		authenticate.requiredAuthentication("user", 'R', 3), media.getVideo);

	app.get('/corpus/:id_corpus/media/:id_media/webm', authenticate.requiredConsistentID("user", 'R', 3), 
		authenticate.requiredAuthentication("user", 'R', 3), media.getVideoWEBM);

	app.get('/corpus/:id_corpus/media/:id_media/mp4', authenticate.requiredConsistentID("user", 'R', 3), 
		authenticate.requiredAuthentication("user", 'R', 3), media.getVideoMP4);

	app.get('/corpus/:id_corpus/media/:id_media/ogv', authenticate.requiredConsistentID("user", 'R', 3), 
		authenticate.requiredAuthentication("user", 'R', 3), media.getVideoOGV);

	//-------------
	//app.get('/corpus/:id_corpus/media/:id_media/layer', authenticate.requiredAuthentication("user"), layer.listAll);
	app.get('/corpus/:id_corpus/media/:id_media/layer', 
		authenticate.requiredConsistentID("user", 'R', 4-1), layer.listAll);
	
	app.get('/corpus/:id_corpus/media/:id_media/layer/:id_layer', authenticate.requiredConsistentID("user", 'R', 5), 
		authenticate.requiredAuthentication("user", 'R', 5), layer.listWithId);
	//-------------
	//app.get('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation', authenticate.requiredAuthentication("user"), anno.listAll);
	app.get('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation', 
		authenticate.requiredConsistentID("user", 'R', 6-1), anno.listAll);		
	
	app.get('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno', 
		authenticate.requiredConsistentID("user", 'R', 7), 
		authenticate.requiredAuthentication("user", 'R', 7), anno.listWithId);
		
	//post
	app.post('/corpus', authenticate.requiredAuthentication("admin"), corpus.post);
	//-------------
	app.post('/corpus/:id_corpus/media', authenticate.requiredConsistentID("user", 'C', 2-1), 
		authenticate.requiredAuthentication("user", 'C', 2-1), media.post);
	//-------------
	app.post('/corpus/:id_corpus/media/:id_media/layer', authenticate.requiredConsistentID("user", 'C', 4-1), 
		authenticate.requiredAuthentication("user", 'C', 4-1), layer.post);
	//-------------
	app.post('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation', 
		authenticate.requiredConsistentID("user", 'C', 6-1), 
		authenticate.requiredAuthentication("user", 'C', 6-1), anno.post);
	//-------------
	//app.post('/corpus/:id_corpus/media/:id_media/layerAll', authenticate.requiredConsistentID("user", 'C', 4-1), 
	//	authenticate.requiredAuthentication("user", 'C', 4-1), compound.postAll); //layer + its annotations
	
	//put
	app.put('/corpus/:id', authenticate.requiredConsistentID("user", 'E', 1), 
		authenticate.requiredAuthentication("user", 'E', 1), corpus.update);
	//-------------
	app.put('/corpus/:id_corpus/media/:id_media', authenticate.requiredConsistentID("user", 'E', 3),
		authenticate.requiredAuthentication("user", 'E', 3), media.update);
	//-------------
	app.put('/corpus/:id_corpus/media/:id_media/layer/:id_layer', authenticate.requiredConsistentID("user", 'E', 5), 
		authenticate.requiredAuthentication("user", 'E', 5), layer.updateAll);
	//-------------
	app.put('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno', 
		authenticate.requiredConsistentID("user", 'E', 7), 
		authenticate.requiredAuthentication("user", 'E', 7), anno.updateAll);
		
	//delete
	app.delete('/corpus/:id', authenticate.requiredConsistentID("user", 'D', 1), 
		authenticate.requiredAuthentication("user", 'D', 1), compound.removeCorpus);
	//-------------
	app.delete('/corpus/:id_corpus/media/:id_media', authenticate.requiredConsistentID("user", 'D', 3), 
		authenticate.requiredAuthentication("user", 'D', 3), compound.removeMedia);
	//-------------
	app.delete('/corpus/:id_corpus/media/:id_media/layer/:id_layer', authenticate.requiredConsistentID("user", 'D', 5), 
		authenticate.requiredAuthentication("user", 'D', 5), compound.removeLayer);
	//-------------
	app.delete('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno', authenticate.requiredConsistentID("user", 'D', 7), 
		authenticate.requiredAuthentication("user", 'D', 7), compound.removeAnno); //*/
		
	// queue configuration: trecvid tasks
	app.post('/queue', authenticate.requiredValidUser, queue.post);
	
	app.put('/queue/:id', authenticate.requiredValidUser, queue.update); //create or replace a list of ids
	
	app.get('/queue', authenticate.requiredAuthentication("admin"), queue.listAll); 
	
	app.get('/queue/:id', authenticate.requiredValidUser, queue.listWithId);
	
	app.get('/queue/:id/next', authenticate.requiredValidUser, queue.getNext);
	
	app.put('/queue/:id/next', authenticate.requiredValidUser, queue.putnext);
	
	app.delete('/queue/:id', authenticate.requiredValidUser, queue.remove);
	
	// retrieve histories of a user, 
	// You can view your own histories, or as a root user you can check all other users' histories
	app.get('/history/:name', authenticate.requiredValidUser, compound.retrieveUserHistory);
}
