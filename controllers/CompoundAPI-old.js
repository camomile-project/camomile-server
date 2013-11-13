/* The API controller for compound methods
   
*/

var Corpus = require('../models/Corpus').Corpus;

var Media = require('../models/Media').Media; //get the media model

var Layer = require('../models/Layer').Layer; //get the layer model

var Annotation = require('../models/Annotation').Annotation; //get the annotation model


//test for deleting corpus
//app.delete('/corpus/:id', 
exports.removeCorpus = function(req, res){
	Corpus.remove({ _id : req.params.id}, function(error, data){
		if(error){
			res.json(error); return;
		}
		else { //else 1
			var listRemovedMediaId = [];
			var listRemovedLayerId = [];	//keep all layer removed
			var listRemovedAnnoId = [];	
			//delete the related medias
			var rem = {
				"data_media" : data,
				"listMediaIDs" : listRemovedMediaId,
				"listLayerIDs" : listRemovedLayerId,
				"listAnnoIDs" : listRemovedAnnoId
			};
			//res.json(rem);
			//resultMedia = removeAllMediaWithCorpusId1(req.params.id, resultMedia);
			(function (listRemovedMediaId){
				Media.find({id_corpus : req.params.id}, function(err, docs){
					if(err) { 
						res.json("error in deleting all media of the corpus : " + req.params.id);
						console.log(err); 
					}
					if (!docs || !Array.isArray(docs) || docs.length === 0)
					{
						res.json(data);
						return;
					}
					//var listId = [];
					console.log("I am here, inside the removeAllMediaWithCorpusId, before docs.forEach");
					docs.forEach( function (doc) {
						console.log("xoa"); console.log(doc);
						listRemovedMediaId.push({'id': doc._id});
						doc.remove(); //will verify its order
						rem.listMediaIDs.push({'id': doc._id});
						//now remove the corresponding layers of this media
						(function(listRemovedLayerId){	
							Layer.find({id_media : doc._id}, function(err1, doc1s){
								if(err1) { 
									res.json("error in deleting all layers of the media : " + doc._id);
									console.log(err1); 
								}
								if (!doc1s || !Array.isArray(doc1s) || doc1s.length === 0)
								{
									res.json(data);
									return;
								}
								
								doc1s.forEach( function (doc1) {
									console.log("xoa1"); console.log(doc1);
									listRemovedLayerId.push({'id': doc1._id});
									doc1.remove();
									
									//now consider the annotations of this layer
									(function(listRemovedAnnoId){	
										Annotation.find({id_layer : doc1._id}, function(err2, doc2s){
											if(err2) { 
												res.json("error in deleting all annotations of the layer : " + doc1._id);
												console.log(err2); 
											}
											if (!doc2s || !Array.isArray(doc2s) || doc2s.length === 0)
											{
												res.json(data);
												return;
											}
											
											doc2s.forEach( function (doc2) {
												console.log("xoa2"); console.log(doc2);
												listRemovedAnnoId.push({'id': doc2._id});
												doc2.remove();
											});		
										}); //annotation.find		
									})(listRemovedAnnoId); //annotation.find
								}); //doc1s.foreach
							}); 
						})(listRemovedLayerId);	//layer.find
						
					}); //doc.foreach
				});
			})(listRemovedMediaId); //media.find
			
		} //else above 1
		
	}); //media function
}


//test for deleting corpus
//app.delete('/corpus/:id_corpus/media/:id_media', 
exports.removeMedia = function(req, res){
	Media.remove({_id : req.params.id_media}, function(error, data){
		if(error){
			res.json(error);
		}
		else {
			
			var listRemovedLayerId = [];
			var listRemovedAnnoId = [];
			
			//delete the related layers
			(function(listRemovedLayerId){	
				Layer.find({id_media : req.params.id_media}, function(err1, doc1s){
					if(err1) { 
						res.json("error in deleting all layers of the media : " + doc._id);
						console.log(err1); 
					}
					if (!doc1s || !Array.isArray(doc1s) || doc1s.length === 0)
					{
						res.json(data);
						return;
					}
					
					doc1s.forEach( function (doc1) {
						console.log("xoa1"); console.log(doc1);
						listRemovedLayerId.push({'id': doc1._id});
						doc1.remove();
						
						//now consider the annotations of this layer
						(function(listRemovedAnnoId){	
							Annotation.find({id_layer : doc1._id}, function(err2, doc2s){
								if(err2) { 
									res.json("error in deleting all annotations of the layer : " + doc1._id);
									console.log(err2); 
								}
								if (!doc2s || !Array.isArray(doc2s) || doc2s.length === 0)
								{
									res.json(data);
									return;
								}
								
								doc2s.forEach( function (doc2) {
									console.log("xoa2"); console.log(doc2);
									listRemovedAnnoId.push({'id': doc2._id});
									doc2.remove();
								});		
							}); //annotation.find		
						})(listRemovedAnnoId); //annotation.find
					}); //doc1s.foreach
				}); 
			})(listRemovedLayerId);	//layer.find
			res.json({"data":data, "listRemovedLayerId" : listRemovedLayerId});
		} //else
	}); //media function
}

//test for deleting corpus
//app.delete('/corpus/:id_corpus/media/:id_media', 
exports.removeMedia1 = function(req, res){
	Media.remove({_id : req.params.id_media}, function(error, data){
		if(error){
			res.json(error);
		}
		else{
			
			var listRemovedLayerId = [];
			
			//delete the related layers
			Layer.find({id_media : req.params.id_media}, function(err, docLayerMedia){
				if(err) { 
					res.json("error in deleting all layers of the media : " + req.params.id_media);
					console.log(err); return;
				}
				if (!docs || !Array.isArray(docLayerMedia) || docLayerMedia.length === 0)
				{
					res.json(data);
					console.log('no docs found'); return;
				}
			  	
			  	docLayerMedia.forEach( function (docL) {
			  		listRemovedLayerId.push(docL._id);
					docL.remove();
			  	});		
			});
			
			if(listRemovedLayerId.length == 0) {
				res.json(data); return;
			}
			else {
				
				var listRemovedIdAnno = [];	
				for(var id in listRemovedLayerId) {
					result = removeOneAnno(listRemovedLayerId[id]._id);
					if(result.seccess == false) {
						//res.json(data); break;
					}
					else {
						listRemovedIdAnno.push[result._id];
					}
				} //for id
				if(listRemovedIdAnno.length == 0) {
					res.json(data); return;
				}
				else {
					var rem = {
						"data_media" : data,
						"listLayerIDs" : listRemovedLayerId,
						"listAnnoIDs" : listRemovedIdAnno
					};
					res.json(rem); return;
				}
			} //else
		} //else above
	}); //media function
}

removeAllMediaWithCorpusId = function(id){
	var result;
	console.log("toi here");
	result = Media.find({id_corpus : id}, function(err, docs){
		if(err) { 
			console.log(err); 
			return {'success' : false, 'data' : error}; return;
		}
		if (!docs || !Array.isArray(docs) || docs.length == 0)
		{
			return {'success' : true, 'data' : docs, 'listId' : []}; return;
		}
		var listId = [];
		console.log("I am here, inside the removeAllMediaWithCorpusId, before docs.forEach");
		docs.forEach( function (doc) {
			console.log("xoa"); console.log(doc);
			listId.push({'id': doc._id});
			doc.remove();
		});
		return {'success' : true, 'data' : docs, 'listId' : listId}; return;	
	});
	return result;
}


removeAllLayersWithMediaId = function(id){
	console.log('in function removeAllLayersWithMediaId');
	var result;
	result = Layer.find({id_media : id}, function(err, docs){
		if(err) { 
			res.json("error in deleting all annotations of the layer : " + id);
			console.log(err); 
			return {'success' : false, 'data' : error};
		}
		if (!docs || !Array.isArray(docs) || docs.length === 0)
		{
			return {'success' : true, 'data' : docs, 'listId' : []};
		}
		var listId = [];
		docs.forEach( function (doc) {
			listId.push({'id': doc._id});
			doc.remove();
		});
		return {'success' : true, 'data' : docs, 'listId' : listId};			
	});
	return result;
}

removeAllAnnoWithLayerId = function(id){
	var result;
	result = Annotation.find({id_layer : id}, function(err, docs){
		if(err) { 
			res.json("error in deleting all annotations of the layer : " + id);
			console.log(err); 
			return {'success' : false, 'data' : error};
		}
		if (!docs || !Array.isArray(docs) || docs.length === 0)
		{
			return {'success' : true, 'data' : docs, 'listId' : []};
		}
		var listId = [];
		docs.forEach( function (doc) {
			listId.push({'id': doc._id});
			doc.remove();
		});
		return {'success' : true, 'data' : docs, 'listId' : listId};			
	});
	return result;
}


removeOneAnno = function(id){
	Annotation.findByIdAndRemove(id, function(error, anno){
		if(error){
			return {'success' : false, 'data' : error};
		}
		else {
			var res = {'success' : true, 'data' : anno};
			anno.remove();
			return res;
		}
	});
}
//deleting a layer, implying the removal the related annotations
//app.delete('/corpus/:id_corpus/media/:id_media/layer/:id_layer', 
exports.removeLayer = function(req, res){
	Layer.remove({_id : req.params.id_layer}, function(error, data){
		if(error){
			res.json(error);
		}
		else // remove the annotations of this layer
		{
			Annotation.find({id_layer : req.params.id_layer}, function(err, docs){
				if(err) { 
					res.json("error in deleting the annotations of the layer : " + req.params.id_layer);
					console.log(err); return;
				}
				if (!docs || !Array.isArray(docs) || docs.length === 0)
				{
					res.json(data);
					console.log('no docs found'); return;
				}
			  	
				var removedIdItem = [];	
			  	
			  	docs.forEach( function (doc) {
			  		removedIdItem.push(doc._id);
					doc.remove();
			  	});
			  	
			  	var removedID = {"layer_id" : req.params.id_layer, "annotation_ids" : removedIdItem};
			  	res.json(removedID);
			});
			//res.json(data);
		}
	});
} 

// remove an annotation
// app.delete('/corpus/:id_corpus/media/:id_media/layer/:id_layer/annotation/:id_anno', 
exports.removeAnno = function(req, res){
	Annotation.remove({_id : req.params.id_anno}, function(error, data){
		if(error){					
			console.log('Error in deleting one annotation');
			res.json(error);
		}
		else {
			res.json(data);
			console.log('already deleted one annotation');
		}
	});
}


//test for posting a compound layer: a layer with a list of detailed annotations
//app.post('/corpus/:id_corpus/media/:id_media/layerAll', 
exports.postAll = function(req, res){
	Media.findById(req.params.id_media, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('Could not post this media because the given id_corpus is incorrect');
		}
		else {
			
			var layer_data = {
					"id_media" : req.body.id_media,
					"layer_type" : req.body.layer_type,
					"fragment_type" : req.body.fragment_type,
					"data_type" : req.body.data_type,
					"source" : req.body.source
					, "history" : []//req.body.history
			};
	
			var saved = false;
	
			var layer = new Layer(layer_data);
			//just added 12/07/2013
			layer.history.push({name : req.body.history.name, date : req.body.history.date});
	
			layer.save( function(errorLayer, dataLayer){
				if(errorLayer){
					console.log('error in posting layer data, the id_media does not exist');
					res.json(errorLayer);
					return;
				}
				else{
					console.log('Success on saving layer data');
					saved = true;
					//res.json(dataLayer);
					//	}
					//});//*/
					//now we insert the annotation list into the annotation collection
					var id_layer = layer._id; //get the new id_layer for this list of annotations
					console.log('id_layer ' + id_layer);
					console.log('req.body');
					console.log(req.body.annotation.length);
					var cpt = 0;
					var annoObj = [];
	
					for(var i in req.body.annotation) {
						var annoItem = {
							"id_layer" : id_layer,
							"fragment" : {
									"start" : req.body.annotation[i].fragment.start,
									"end" : req.body.annotation[i].fragment.end
							},
							"data" : req.body.annotation[i].data
							, "history" : [] //req.body.history
						};
			
						(function (annoitem){
								var anno = new Annotation(annoItem);
								//just added 12/07/2013
								anno.history.push({name : req.body.history.name, date : req.body.history.date});
						
								anno.save( function(error, annoData){
									if(error){
										console.log('error in posting the annotation list');
										console.log(error);
										saved = false;
										return;
									}
									else{
										console.log('Success on saving annotation data');
										saved = true;
										//res.json(dataLayer);
									}
								});
							}
						)(annoItem);

						if(saved == false) {
							console.log('break because getting error in saving an annotation');
							break;//*/
						}
						cpt =  cpt+1;
					}
	
					if(saved) {
						var str_id = {"id_layer" : id_layer};
						res.json(str_id);
					}
					else 
						res.json('error in saving');
					console.log('already saved ' + cpt);
				}
			});
		}
	});
}
