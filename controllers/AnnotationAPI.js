/* The API controller
   Exports 3 methods:
   * post - Creates a new annotation
   * listAll - Returns a list of annotations
   * listWithId - Returns a specific annotation of a given id
*/

var Layer = require('../models/Layer').Layer; //get the layer model
var Annotation = require('../models/Annotation').Annotation; //get the annotation model

// for the uri : app.get('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation', 
exports.listAll = function(req, res){
	Annotation.find({id_layer : req.params.id_layer}, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('no such id_layer!')
		}
		else
			res.json(data);
	});
}

//for the uri: app.get('/corpus/:id_corpus/media/:id_media/layer/:id_layer/:id_layer/annotation/:id_anno 
exports.listWithId = function(req, res){
	Annotation.findById(req.params.id_anno, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('no such id_layer!')
		}
		else
			res.json(data);
	});
}

//test for Posting 
//app.post('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation', 
exports.post = function(req, res){
	Layer.findById(req.params.id_layer, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('Could not post this annotation because the given id_layer is incorrect');
		}
		else {
		
			var annoItem = {
				"id_layer" : req.params.id_layer, // req.body.id_layer,
				"fragment" : req.body.fragment,
				"data" : req.body.data,
				"history" : []//req.body.history
			};
	
			var anno = new Annotation(annoItem);
			//just added 12/07/2013
			anno.history.push({name : req.body.history.name, date : req.body.history.date});
	
			anno.save( function(errorAnno, annoData){
				if(errorAnno){
					console.log('error in posting the annotation list');
					console.log(errorAnno);
					//saved = false;
					return;
				}
				else{
					console.log('Success on saving annotation data');
					//saved = true;
					res.json(annoData);
				}
			});
		}
	});
}

//test for updating annotation
//app.put('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno', 
exports.updateAll = function(req, res){
	//Corpus.update(_id : req.params.id, function(error, data){
	var update = {
		id_layer : req.params.id_layer, // req.body.id_layer,
		fragment : req.body.fragment,
		data : req.body.data
	};
	Annotation.findByIdAndUpdate(req.params.id_anno, update, function (error, anno) {
		if(error){
			res.json(error);
		}
		else
		{
			anno.history.push({name: req.body.history.name, date : req.body.history.date});
			anno.save( function(error, data){
				if(error){
					res.json(error);
				}
				else{
					res.json(data);
				}
			});
			//res.json(anno);
		}
	});
}