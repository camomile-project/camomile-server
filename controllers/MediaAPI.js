/* The API controller
   Exports 3 methods:
   * post - Creates a new media
   * listAll - Returns a list of media
   * listWithId - Returns a specific media of a given id
*/

var Media = require('../models/Media').Media; //get the media model
var Corpus = require('../models/Corpus').Corpus;

// for the uri : app.get('/corpus/:id/media', 
exports.listAll = function(req, res){
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
			};

			var media = new Media(media_data);

			media.save(function(error1, data1){
				if(error1){
					console.log('error in posting media data');
					res.json(error1);
				}
				else {
					console.log('Success on saving media data');
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
	//Corpus.update(_id : req.params.id, function(error, data){
	//console.log('I am here'); 	console.log(req.body.name);
	//var update = {"id_corpus" : req.params.id_corpus, "name" : req.body.name};
	//Media.findByIdAndUpdate(req.params.id_media, update, function (err, data) {
	Media.update({_id:req.params.id_media}, { $set: { 'name' : req.body.name}}, function (error, data) {
		if(error){
			console.log('error'); console.log(error);
			res.json(error);
		}
		else {
			console.log('ok');
			res.json(data);
		}
	});
}