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

/* The API controller for compound methods
   
*/

var Corpus = require('../models/Corpus').Corpus;
var Media = require('../models/Media').Media; //get the media model
var Layer = require('../models/Layer').Layer; //get the layer model
var Annotation = require('../models/Annotation').Annotation; //get the annotation model
var ACLAPI = require('../controllers/ACLAPI');
var User = require('../models/user').User;

exports.removeCorpus = function(req, res){
	Corpus.remove({ _id : req.params.id}, function(error, data){
		if (error){
			res.status(400).json({error:"error", message:error});
			return;
		}
		else { 																						//already deleted this id, now remove it from the ACL
			ACLAPI.removeAnACLEntry(data._id);
			
			var listRemovedMediaId = [];
			var listRemovedLayerId = [];	//keep all layer removed
			var listRemovedAnnoId = [];	
			var rem = {"data_media" : data, "listMediaIDs" : listRemovedMediaId, "listLayerIDs" : listRemovedLayerId, "listAnnoIDs" : listRemovedAnnoId};

			(function (listRemovedMediaId){
				Media.find({id_corpus : req.params.id}, function(error2, docs){
					if (error2) res.status(400).json({error:"error in deleting all media of the corpus : " + req.params.id, message:error2});
					if (!docs || !Array.isArray(docs) || docs.length === 0)	{
						res.status(200).json(data);
						return;
					}
				
					docs.forEach( function (doc) {													//already deleted this id, now remove it from the ACL
						ACLAPI.removeAnACLEntry(doc._id);				
						listRemovedMediaId.push({'id': doc._id});
						doc.remove(); //will verify its order
						rem.listMediaIDs.push({'id': doc._id});
						(function(listRemovedLayerId){												//remove the corresponding layers of this media
							Layer.find({id_media : doc._id}, function(err1, doc1s){
								if (err1) res.status(400).json({error:"error in deleting all layers of the media : " + doc._id});
								if (!doc1s || !Array.isArray(doc1s) || doc1s.length === 0){
									res.status(200).json(data);
									return;
								}								
								doc1s.forEach( function (doc1) {									//already deleted this id, now remove it from the ACL
									ACLAPI.removeAnACLEntry(doc1._id);
									listRemovedLayerId.push({'id': doc1._id});
									doc1.remove();
									
									(function(listRemovedAnnoId){									//consider the annotations of this layer
										Annotation.find({id_layer : doc1._id}, function(err2, doc2s){
											if (err2) res.status(400).json({error:"error in deleting all annotations of the layer : " + doc1._id});
											if (!doc2s || !Array.isArray(doc2s) || doc2s.length === 0) {
												res.status(200).json(data);
												return;
											}
											
											doc2s.forEach( function (doc2) {												//already deleted this id, now remove it from the ACL
												ACLAPI.removeAnACLEntry(doc2._id);
												listRemovedAnnoId.push({'id': doc2._id});
												doc2.remove();
											});		
										}); 	
									})(listRemovedAnnoId); 
								}); 
							}); 
						})(listRemovedLayerId);							
					}); 
				});
			})(listRemovedMediaId); 			
		} 		
	}); 
}


//test for deleting corpus
exports.removeMedia = function(req, res){
	Media.remove({_id : req.params.id_media}, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else {																						//already deleted this id, now remove it from the ACL
			ACLAPI.removeAnACLEntry(data._id);
			var listRemovedLayerId = [];
			var listRemovedAnnoId = [];
			
			(function(listRemovedLayerId){															//delete the related layers
				Layer.find({id_media : req.params.id_media}, function(error2, doc1s){
					if (erro2) res.status(400).json({error:"error in deleting all layers of the media : " + doc._id, message:error2});
					if (!doc1s || !Array.isArray(doc1s) || doc1s.length === 0){
						res.status(200).json(data);
						return;
					}
					
					doc1s.forEach( function (doc1) {												//already deleted this id, now remove it from the ACL
						ACLAPI.removeAnACLEntry(doc1._id);
						listRemovedLayerId.push({'id': doc1._id});
						doc1.remove();
						
						(function(listRemovedAnnoId){												//now consider the annotations of this layer
							Annotation.find({id_layer : doc1._id}, function(err2, doc2s){
								if (err2) res.status(400).json({error:"error in deleting all annotations of the layer : " + doc1._id});
								if (!doc2s || !Array.isArray(doc2s) || doc2s.length === 0) {
									res.status(200).json(data);
									return;
								}								
								doc2s.forEach( function (doc2) {									//already deleted this id, now remove it from the ACL
									ACLAPI.removeAnACLEntry(doc2._id);
									listRemovedAnnoId.push({'id': doc2._id});
									doc2.remove();
								});		
							}); 
						})(listRemovedAnnoId); 
					}); 
				}); 
			})(listRemovedLayerId);	
			res.status(200).json({"data":data, "listRemovedLayerId" : listRemovedLayerId});
		} 
	}); 
}

removeOneAnno = function(id){
	Annotation.findByIdAndRemove(id, function(error, anno){
		if (error) return {'success' : false, 'data' : error};
		else {
			var res = {'success' : true, 'data' : anno};
			anno.remove();
			return res;
		}
	});
}

//deleting a layer, implying the removal the related annotations
exports.removeLayer = function(req, res){
	Layer.remove({_id : req.params.id_layer}, function(error, data){
		if (error) res.status(400).json(error);
		else {																						// remove the annotations of this layer
			ACLAPI.removeAnACLEntry(data._id);														//already deleted this id, now remove it from the ACL
			Annotation.find({id_layer : req.params.id_layer}, function(error2, docs){
				if (error2) { 
					res.status(400).json({error:"error in deleting the annotations of the layer : " + req.params.id_layer, message:error2});
					return;
				}
				if (!docs || !Array.isArray(docs) || docs.length === 0)	{
					res.status(200).json(data);
					return;
				}			  	
				var removedIdItem = [];	
			  	docs.forEach( function (doc) {
			  		removedIdItem.push(doc._id);								  		//already deleted this id, now remove it from the ACL
					ACLAPI.removeAnACLEntry(doc._id);
					doc.remove();
			  	});			  	
			  	var removedID = {"layer_id" : req.params.id_layer, "annotation_ids" : removedIdItem};
			  	res.status(200).json(removedID);
			});
		}
	});
} 

// remove an annotation
exports.removeAnno = function(req, res){
	Annotation.remove({_id : req.params.id_anno}, function(error, data){
		if (error) res.status(400).json({error:'Error in deleting one annotation'});
		else {																						//already deleted this id, now remove it from the ACL
			ACLAPI.removeAnACLEntry(data._id);
			res.status(200).json(data);
		}
	});
}


//test for posting a compound layer: a layer with a list of detailed annotations
exports.postAll = function(req, res){
	if (req.body.layer_type == undefined || req.body.fragment_type == undefined || req.body.data_type == undefined || req.body.source == undefined) return res.status(400).json({error:"one or more data fields are not filled out properly"});
	if (req.body.annotation == undefined) return res.status(400).json({error:"one or more data fields are not filled out properly"});	
	Media.findById(req.params.id_media, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else if (data == null) res.status(400).json({error:'Could not post this media because the given id_corpus is incorrect'});
		else {			
			var layer_data = {"id_media" : req.params.id_media, "layer_type" : req.body.layer_type, "fragment_type" : req.body.fragment_type, "data_type" : req.body.data_type, "source" : req.body.source, "history" : []};
			var saved = false;
			var layer = new Layer(layer_data);
			var connectedUser = "root";					
			if (req.session.user) connectedUser = req.session.user.username;
			var modifiedL = {"id_media" : req.params.id_media, "layer_type" : req.body.layer_type, "fragment_type" : req.body.fragment_type, "data_type" : req.body.data_type, "source" : req.body.source};
			layer.history.push({name : connectedUser, date : new Date(), modification: modifiedL});
			layer.save( function(error2, dataLayer){
				if (error2){
					res.status(400).json({error:'error in posting layer data, the id_media does not exist', message:error2});
					return;
				}
				else {					
					saved = true;
					ACLAPI.addUserRightGeneric(layer._id, connectedUser, 'A');
					var id_layer = layer._id; //get the new id_layer for this list of annotations
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
							anno.history.push({name : connectedUser, date : new Date(), modification: annoItem});
							anno.save( function(error3, annoData){
								if (error3){
									res.status(400).json({error:'error in posting the annotation list', message:error3});
									saved = false;
									return;
								}
								else{
									saved = true;	
									ret.annotation.push(annoData);
									ACLAPI.addUserRightGeneric(anno._id, connectedUser, 'A');
									cpt =  cpt+1;
									if (cpt >= nbAnno) res.status(200).json(ret);
								}
							});
						})(annoItem);

						if (saved == false) {
							res.status(400).json({error:"error in saving the annotation"});
							break;
						}
					}
					if (cpt >= nbAnno) res.status(200).json(ret);
				}
			});
		}
	});
}

// retrieve histories of a user
exports.retrieveUserHistory = function(req, res){
	var name = req.params.name;
	var connectedUser = req.session.user;
	if (connectedUser.username != name && connectedUser.role != "admin") return res.status(403).json({error:"You dont have enough right to access this resource"});

	User.findOne({username: name}, function (error, user) {
        if (error) res.status(400).json({error:"error", message:error});
        else if (user == null) return res.status(401).json({error:"Invalid user"});
        else {
        	Layer.find({'history.name' : {$regex : new RegExp('^'+ name + '$', "i")}}, 'history.modification',function(error2, data) {
				if (error2) return res.status(400).json({error:"error in retrieving histories", message:error2});
				else {
					var ret = {};
					ret.layer = data; 
					Annotation.find({'history.name' : {$regex : new RegExp('^'+ name + '$', "i")}}, 'history.modification',function(error3, data) {					//now retrieve all histories of this user in the annotation table
						if (error3) return res.status(400).json({error:"error in retrieving histories", message:error3});
						else {
							ret.annotation = data;
							res.status(200).json(ret);
						} 
					}); 
				}  
			});     		 
        } 
    }); 
}
