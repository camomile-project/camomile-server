/* The API controller for Corpus
   Exports 3 methods:
   * post - Creates a new corpus
   * listAll - Returns a list of corpus
   * listWithId - Returns a specific corpus of a given id
*/

var Corpus = require('../models/Corpus').Corpus;

// for the uri : app.get('/corpus', 
exports.listAll = function(req, res){
	Corpus.find({}, function(error, data){
		res.json(data);
	});
};

//for the uri app.get('/corpus/:id', 
exports.listWithId = function(req, res){
	//Media.findOne({id_corpus: req.params.id}, function(error, data){
	Corpus.findById(req.params.id, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('no such id_corpus!')
		}
		else
			res.json(data);
	});
};

//test for Posting corpus
//app.post('/corpus', 
exports.post = function(req, res){
	var corpus_data = {
          name: req.body.name
        };

	var corpus = new Corpus(corpus_data);

	corpus.save(function(error, data){
		if(error){
			console.log('error in posting corpus data');
			res.json(error);
		}
		else {
			console.log('Success on saving corpus data');
			res.json(data);
		}
	});
}


//app.put('/corpus/:id', 
exports.update = function(req, res){
	//Corpus.update(_id : req.params.id, function(error, data){
	var update = {name: req.body.name};
	Corpus.findByIdAndUpdate(req.params.id, update, function (error, data) {
	//Corpus.findOne({_id:req.params.id}, function (err, cor) {
		if(error){
			res.json(error);
		}
		else {
		//	cor.name = req.body.name;
			res.json(data);
			/*cor.save( function(error, data){
                if(error){
                    res.json(error);
                }
                else{
                    res.json(data);
                }
            });*/
		}
	});
}
