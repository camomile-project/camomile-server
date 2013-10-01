
/*
 * GET home page.
 */

var corpus = require('../controllers/CorpusAPI'),
  	media = require('../controllers/MediaAPI'),
  	layer = require('../controllers/LayerAPI'),
  	anno = require('../controllers/AnnotationAPI'),
  	compound = require('../controllers/CompoundAPI'),
  	authenticate = require('../middleware/authenticate');

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
	app.get("/signup", authenticate.signupGET);
	app.post("/signup", authenticate.userExist, authenticate.signup);
	//----------------
	app.get("/login", function (req, res) {
    	res.render("login");
	});
	app.get("/login/:username/:password", authenticate.login);
	app.post("/login", authenticate.login);
	//----------------
	app.get('/logout', authenticate.logoutGET);
	
	app.get('/profile', authenticate.requiredAuthentication("user"), authenticate.profile);
	app.get('/profile/:username', authenticate.requiredAuthentication("admin"), authenticate.profile);
	//----------------
	app.get('/chmodUser', authenticate.requiredAuthentication("admin"), function (req, res) {
		res.render("chmodUser");
	});
	app.post("/chmodUser/:username/:role", authenticate.requiredAuthentication("admin"), authenticate.chmodUser);
	app.post("/chmodUser", authenticate.requiredAuthentication("admin"), authenticate.chmodUser);
	//----------------
	app.get('/allUsers', authenticate.requiredAuthentication("admin"), authenticate.listAllUsers);
	//----------------
	app.get('/allSessions', authenticate.requiredAuthentication("admin"), authenticate.listAllSessions);
	
	//end of authenticating configurations
	
	// ===================================

	app.get("/", authenticate.racine); // rout
	
	app.get('/corpus', authenticate.requiredAuthentication("user"), corpus.listAll);
	app.get('/corpus/:id', authenticate.requiredAuthentication("user"), corpus.listWithId);
	//-------------
	app.get('/corpus/:id/media', authenticate.requiredAuthentication("user"), media.listAll);
	app.get('/corpus/:id_corpus/media/:id_media', authenticate.requiredAuthentication("user"), media.listWithId);
	//-------------
	app.get('/corpus/:id_corpus/media/:id_media/layer', authenticate.requiredAuthentication("user"), layer.listAll);
	app.get('/corpus/:id_corpus/media/:id_media/layer/:id_layer', authenticate.requiredAuthentication("user"), layer.listWithId);
	//-------------
	app.get('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation', authenticate.requiredAuthentication("user"), anno.listAll);		
	app.get('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno', authenticate.requiredAuthentication("user"), anno.listWithId);
		
	//post
	app.post('/corpus', authenticate.requiredAuthentication("supervisor"), corpus.post);
	//-------------
	app.post('/corpus/:id_corpus/media', authenticate.requiredAuthentication("supervisor"), media.post);
	//-------------
	app.post('/corpus/:id_corpus/media/:id_media/layer', authenticate.requiredAuthentication("supervisor"), layer.post);
	//-------------
	app.post('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation', authenticate.requiredAuthentication("supervisor"), anno.post);
	//-------------
	app.post('/corpus/:id_corpus/media/:id_media/layerAll', authenticate.requiredAuthentication("supervisor"), compound.postAll); //layer + its annotations
	
	//put
	app.put('/corpus/:id', authenticate.requiredAuthentication("supervisor"), corpus.update);
	//-------------
	app.put('/corpus/:id_corpus/media/:id_media', authenticate.requiredAuthentication("supervisor"), media.update);
	//-------------
	app.put('/corpus/:id_corpus/media/:id_media/layer/:id_layer', authenticate.requiredAuthentication("supervisor"), layer.updateAll);
	//-------------
	app.put('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno', authenticate.requiredAuthentication("supervisor"), anno.updateAll);
		
	//delete
	app.delete('/corpus/:id', authenticate.requiredAuthentication("admin"), compound.removeCorpus);
	//-------------
	app.delete('/corpus/:id_corpus/media/:id_media', authenticate.requiredAuthentication("admin"), compound.removeMedia);
	//-------------
	app.delete('/corpus/:id_corpus/media/:id_media/layer/:id_layer', authenticate.requiredAuthentication("admin"), compound.removeLayer);
	//-------------
	app.delete('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno', authenticate.requiredAuthentication("admin"), compound.removeAnno); //*/
}
