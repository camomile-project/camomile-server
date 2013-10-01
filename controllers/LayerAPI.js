/* The API controller
   Exports 3 methods:
   * post - Creates a new layer
   * listAll - Returns a list of layers
   * listWithId - Returns a specific layer of a given id
*/
var Media = require('../models/Media').Media; //get the media model for cross-check
var Layer = require('../models/Layer').Layer; //get the layer model

// for the uri : app.get('/corpus/:id_corpus/media/:id_media/layer', 
exports.listAll = function(req, res){
	Layer.find({id_media : req.params.id_media}, function(error, data){
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

//for the uri: app.get('/corpus/:id_corpus/media/:id_media/layer/:id_layer 
exports.listWithId = function(req, res){
	Layer.findById(req.params.id_layer, function(error, data){
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

//test for Posting corpus
//app.post('/corpus/:id_corpus/media/:id_media/layer', 
exports.post = function(req, res){
	Media.findById(req.params.id_media, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('Could not post this layer because the given id_media is incorrect'); return;
		}
		else {
			var layer_data = {
				"id_media" : req.params.id_media,
				"layer_type" : req.body.layer_type,
				"fragment_type" : req.body.fragment_type,
				"data_type" : req.body.data_type,
				"source" : req.body.source,
				"history" : req.body.history
			};
	
			var layer = new Layer(layer_data);
	
			layer.save( function(errorLayer, dataLayer){
				if(errorLayer){
					console.log('error in posting layer data, the id_media does not exist');
					res.json(errorLayer);
					return;
				}
				else{
					console.log('Success on saving layer data');
					res.json(dataLayer);
				}
			});
		}
	});
	/*var layer_data = {
			"id_media" : req.params.id_media,
			"layer_type" : req.body.layer_type,
			"fragment_type" : req.body.fragment_type,
			"data_type" : req.body.data_type,
			"source" : req.body.source,
			"history" : req.body.history
	};
	
	var layer = new Layer(layer_data);
	
	layer.save( function(error, dataLayer){
		if(error){
			console.log('error in posting layer data, the id_media does not exist');
			res.json(error);
			return;
		}
		else{
			console.log('Success on saving layer data');
			res.json(dataLayer);
		}
	});*/
}

//test for updating layers
//app.put('/corpus/:id_corpus/media/:id_media/layer/:id_layer', 
exports.updateAll = function(req, res){
	//Corpus.update(_id : req.params.id, function(error, data){
	var update = {
			id_media : req.params.id_media,
			layer_type : req.body.layer_type,
			fragment_type : req.body.fragment_type,
			data_type : req.body.data_type,
			source : req.body.source
	//		history : req.body.history
	};
	Layer.findByIdAndUpdate(req.params.id_layer, update, function (error, oneLayer) {
		if(error){
			res.json(error);
		}
		else
		{
			//oneLayer.history.push({name: req.body.history.name});
			oneLayer.history.push({name:req.body.history.name, date: req.body.history.date});
			oneLayer.save( function(error, data){
				if(error){
					res.json(error);
				}
				else{
					res.json(data);
				}
			});
			//res.json(data);
		}
	});
}