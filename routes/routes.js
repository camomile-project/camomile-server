
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
  	ACL = require('../models/ACL').ACL;

exports.index = function(req, res){
  res.render('index', { title: 'Camomille' });
};

exports.initialize = function(app){
    //get
    /*app.get('/', function(req, res){
  		res.render('index', { title: 'Camomille' })}); */
	
	//create a root user if it does not exist
	authenticate.createRootUser();

	// ===================================
	//authenticating configurations
	app.get("/signup", authenticate.requiredAuthentication("admin"), authenticate.signupGET);
	app.post("/signup", authenticate.requiredAuthentication("admin"), authenticate.userExist, authenticate.signup);
	//----------------
	app.get("/login", function (req, res) {
    	res.render("login");
	});
	app.get("/login/:username/:password", authenticate.login);
	app.post("/login", authenticate.login);
	//----------------
	app.get('/logout', authenticate.logoutGET);
	
	app.get('/profile', authenticate.requiredAuthentication("user", 'N', -1), authenticate.profile);
	app.get('/profile/:username', authenticate.requiredAuthentication("admin"), authenticate.profile);
	//----------------
	app.get('/chmodUser', authenticate.requiredAuthentication("admin"), function (req, res) {
		res.render("chmodUser");
	});
	app.post("/chmodUser/:username/:role", authenticate.requiredAuthentication("admin"), authenticate.chmodUser);
	app.post("/chmodUser", authenticate.requiredAuthentication("admin"), authenticate.chmodUser);
	app.delete("/removeUserByname", authenticate.requiredAuthentication("admin"), authenticate.removeUserByName);
	//----------------
	app.get('/allUsers', authenticate.requiredAuthentication("admin"), authenticate.listAllUsers);
	//----------------
	app.get('/allSessions', authenticate.requiredAuthentication("admin"), authenticate.listAllSessions);
	//--------------------
	app.get("/addGroup", authenticate.requiredAuthentication("admin"), authenticate.addGroupGET);
	app.post("/addGroup", authenticate.requiredAuthentication("admin"), authenticate.addGroup);
	app.post("/Group", authenticate.requiredAuthentication("admin"), authenticate.addGroup);
	app.get("/addUser2Group", authenticate.requiredAuthentication("admin"), authenticate.addUser2GroupGET);
	app.post("/addUser2Group", authenticate.requiredAuthentication("admin"), authenticate.addUser2Group);
	app.get('/allGroups', authenticate.requiredAuthentication("admin"), authenticate.listGroups);
	app.delete('/removeGroupByName', authenticate.requiredAuthentication("admin"), authenticate.removeGroupByName);
	app.delete('/removeGroup/:id', authenticate.requiredAuthentication("admin"), authenticate.removeGroupByID);
	//--------------------
	app.get("/addUserRight2Resource", authenticate.requiredAuthentication("admin"), authenticate.addUserRight2ResourceGET);
	app.post("/addUserRight2Resource", authenticate.requiredAuthentication("admin"), authenticate.addUserRight2Resource);
	app.get("/addGroupRight2Resource", authenticate.requiredAuthentication("admin"), authenticate.addGroupRight2ResourceGET);
	app.post("/addGroupRight2Resource", authenticate.requiredAuthentication("admin"), authenticate.addGroupRight2Resource);
	app.get('/allACLs', authenticate.requiredAuthentication("admin"), authenticate.listACLs);
	 
	/*app.get("/nhap/:username", function(req, res){
		//ACLAPI.removeAnUserFromALC("LIMSI");
		//res.send(200);
		ACL.find({'users.login': {$regex : new RegExp(req.params.username, "i")}}, function(error, data) {
			if(error) console.log(error);
			else res.send(data);
		}); 
	}); //*/
	//--------------------------------
	app.get("/corpus/:id/acl", authenticate.requiredConsistentID("user", 'A', 1), 
		authenticate.requiredAuthentication("user", 'A', 1), ACLAPI.listWithIdOfResource);
	//app.get("/corpus/:id/acl", ACLAPI.listWithIdOfResource); //draft, just for testing
	
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
	//N R E C D A
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
	app.post('/corpus/:id_corpus/media/:id_media/layerAll', authenticate.requiredConsistentID("user", 'C', 4-1), 
		authenticate.requiredAuthentication("user", 'C', 4-1), compound.postAll); //layer + its annotations
	
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
}
