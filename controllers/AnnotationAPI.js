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

var async = require('async');
var commonFuncs = require('../lib/commonFuncs');

//check if a id_annotation exists
exports.exist = function(req, res, next) {
	Annotation.findById(req.params.id_annotation, function(error, annotation){
		if (error) res.status(400).json(error);
		else if (!annotation) res.status(400).json({message:"id_annotation don't exists"});
		else next();
	});
}

//retrieve a particular user (with id)
exports.getInfo = function(req, res){
	Annotation.findById(req.params.id_annotation, function(error, annotation){
		if (error) res.status(400).json({message:error});
    	else res.status(200).json(annotation);
	});
}

// retrieve all annotation
exports.getAll = function (req, res) {	
	Annotation.find({}, function (error, annotations) {
    	if (error) res.status(400).json({error:"error", message:error});
    	if (annotations) res.status(200).json(annotations);
		else res.status(200).json([]);
	});
}

// remove a given annotation
exports.remove = function (req, res) {
	Annotation.remove({_id : req.params.id_annotation}, function (error, annotation) {
		if (!error && annotation == 1) res.status(200).json({message:"The annotation as been delete"});
		else res.status(400).json({message:error});
	});
}
//update information of a annotation
exports.update = function(req, res){
	var newHistory = {};
	Annotation.findById(req.params.id_annotation, function(error, annotation){
		if (req.body.fragment) {
			annotation.fragment = req.body.fragment;
			newHistory.fragment = req.body.fragment;
		}
		if (req.body.data) {
			annotation.data = req.body.data;
			newHistory.data = req.body.data;
		}	
		annotation.history.push({date:new Date(), id_user:req.session.user._id, modification:newHistory})
		annotation.save(function(error, newAnnotation) {
			if (error) res.status(400).json({message:error});
			if (!error) res.status(200).json(newAnnotation);
		});
	});	
}

