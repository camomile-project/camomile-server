/* The API controller for compound methods
   
*/

var Corpus = require('../models/Corpus').Corpus;

var Media = require('../models/Media').Media; //get the media model

var Layer = require('../models/Layer').Layer; //get the layer model

var Annotation = require('../models/Annotation').Annotation; //get the annotation model

var ACLAPI = require('../controllers/ACLAPI');

var User = require('../models/user').User;

//test for deleting corpus
//app.delete('/corpus/:id', 
exports.removeCorpus = function(req, res){
	Corpus.remove({ _id : req.params.id}, function(error, data){
		if(error){
			res.json(error); return;
		}
		else { //else 1
			//already deleted this id, now remove it from the ACL
			ACLAPI.removeAnACLEntry(data._id);
			// end of removing from the ACL
			
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
				
					docs.forEach( function (doc) {
						//already deleted this id, now remove it from the ACL
						ACLAPI.removeAnACLEntry(doc._id);
						// end of removing from the ACL
					
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
									
									//already deleted this id, now remove it from the ACL
									ACLAPI.removeAnACLEntry(doc1._id);
									// end of removing from the ACL
							
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
												
												//already deleted this id, now remove it from the ACL
												ACLAPI.removeAnACLEntry(doc2._id);
												// end of removing from the ACL
												
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
			
			//already deleted this id, now remove it from the ACL
			ACLAPI.removeAnACLEntry(data._id);
			// end of removing from the ACL
			
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
						
						//already deleted this id, now remove it from the ACL
						ACLAPI.removeAnACLEntry(doc1._id);
						// end of removing from the ACL
			
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
									
									//already deleted this id, now remove it from the ACL
									ACLAPI.removeAnACLEntry(doc2._id);
									// end of removing from the ACL
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
			//already deleted this id, now remove it from the ACL
			ACLAPI.removeAnACLEntry(data._id);
			// end of removing from the ACL
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
			  		//already deleted this id, now remove it from the ACL
					ACLAPI.removeAnACLEntry(doc._id);
					// end of removing from the ACL
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
			//already deleted this id, now remove it from the ACL
			ACLAPI.removeAnACLEntry(data._id);
			// end of removing from the ACL
			res.json(data);
			console.log('already deleted one annotation');
		}
	});
}


//test for posting a compound layer: a layer with a list of detailed annotations
//app.post('/corpus/:id_corpus/media/:id_media/layerAll', 
exports.postAll = function(req, res){
	if(req.body.layer_type == undefined || req.body.fragment_type == undefined 
		|| req.body.data_type == undefined || req.body.source == undefined)
		return res.send(404, "one or more data fields are not filled out properly");
	if(req.body.annotation == undefined)
		return res.send(404, "one or more data fields are not filled out properly");	
	
	Media.findById(req.params.id_media, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('Could not post this media because the given id_corpus is incorrect');
		}
		else {
			
			var layer_data = {
					"id_media" : req.params.id_media,
					"layer_type" : req.body.layer_type,
					"fragment_type" : req.body.fragment_type,
					"data_type" : req.body.data_type,
					"source" : req.body.source
					, "history" : []//req.body.history
			};
	
			var saved = false;
	
			var layer = new Layer(layer_data);
			//just added 12/07/2013, modified on 14th, 02/2014
			
			var connectedUser = "root";					
			if(req.session.user)
				connectedUser = req.session.user.username;
				
			var modifiedL = {
				"id_media" : req.params.id_media,
				"layer_type" : req.body.layer_type,
				"fragment_type" : req.body.fragment_type,
				"data_type" : req.body.data_type,
				"source" : req.body.source
			};
			
			layer.history.push({name : connectedUser, date : new Date(), modification: modifiedL});
	
			layer.save( function(errorLayer, dataLayer){
				if(errorLayer){
					console.log('error in posting layer data, the id_media does not exist');
					res.json(errorLayer);
					return;
				}
				else {
					
					saved = true;
					
					ACLAPI.addUserRightGeneric(layer._id, connectedUser, 'A');
					
					//now we insert the annotation list into the annotation collection
					var id_layer = layer._id; //get the new id_layer for this list of annotations
					
					//keep all saved data to return to clients
					var ret = {};
					ret.layer = dataLayer;
					ret.annotation = [];
					
					var cpt = 0;
					var annoObj = [];
					var nbAnno = req.body.annotation.length;
					
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
								//anno.history.push({name : req.body.history.name, date : req.body.history.date});
								anno.history.push({name : connectedUser, date : new Date(), modification: annoItem});
								
								anno.save( function(error, annoData){
									if(error){
										console.log('error in posting the annotation list');
										console.log(error);
										saved = false;
										return;
									}
									else{
										saved = true;	
										ret.annotation.push(annoData);
										
										ACLAPI.addUserRightGeneric(anno._id, connectedUser, 'A');
										cpt =  cpt+1;
										if(cpt >= nbAnno)
											res.json(ret);
									}
								});
							}
						)(annoItem);

						if(saved == false) {
							console.log('break because getting error in saving an annotation');
							res.send("error in saving the annotation");
							break;
						}
					}
	
					/*if(saved) {
						var str_id = {"id_layer" : id_layer};
						res.json(str_id);
					}
					else 
						res.json('error in saving annotation data');
					*/
					if(cpt >= nbAnno)
						res.json(ret);
				}
			});
		}
	});
}

// retrieve histories of a user
exports.retrieveUserHistory = function(req, res){
	var name = req.params.name;
	var connectedUser = req.session.user;
	if(connectedUser.username != name && connectedUser.role != "admin")
	 	return res.send(403, "You dont have enough right to access this resource");

	User.findOne({username: name}, function (err, user) {
        if (err) {
        	res.send(err);
        }
        else if(user == null)
        	return res.send(401, "Invalid user");
        else
        {
        	Layer.find({'history.name' : {$regex : new RegExp('^'+ name + '$', "i")}}, 'history.modification',function(error, data) {
				if(error) return res.send("error in retrieving histories");
				else {
					var ret = {};
					ret.layer = data; //res.send(data);
					//now retrieve all histories of this user in the annotation table
					Annotation.find({'history.name' : {$regex : new RegExp('^'+ name + '$', "i")}}, 'history.modification',function(error, data) {
						if(error) return res.send(404, "error in retrieving histories");
						else {
							ret.annotation = data;
							res.json(ret);
						} //else
					}); //annotation.find
				} //else 
			}); //Layer.find    		 
        } //else
    }); //user.findOne
}
