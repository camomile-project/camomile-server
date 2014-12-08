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

var fileSystem = require('fs'); //working with video streaming
var async = require('async');
var path = require('path');
var commonFuncs = require('../controllers/commonFuncs');

var User = require('../models/User');
var	Group = require('../models/Group');
var Corpus = require('../models/Corpus');
var	Media = require('../models/Media');
var	Layer = require('../models/Layer');
var	Annotation = require('../models/Annotation');
var	Queue = require('../models/Queue');

// check if the id_media exists in the db
exports.exist = function(req, res, next) {
	Media.findById(req.params.id_media, function(error, media){
		if (error) res.status(400).json(error);
		else if (!media) res.status(400).json({message:"id_media don't exists"});
		else next();
	});
}


// check if req.session.user._id have the good right to see this media.id_corpus
exports.AllowUser = function (list_right){
	return function(req, res, next) {
		async.waterfall([
			function(callback) {										// find the user
				User.findById(req.session.user._id, function(error, user){
					callback(error, user);
				});
			},
			function(user, callback) {									// find the list of group belong the user
				Group.find({'users_list' : {$regex : new RegExp('^'+ req.session.user._id + '$', "i")}}, function(error, groups) {
					callback(error, user, groups);
				});
			},
			function(user, groups, callback) {							// find the media
				Media.findById(req.params.id_media, function(error, media){
					callback(error, user, groups, media);
	    		});
			},
			function(user, groups, media, callback) {					// find the corpus belong the media anc check if the user have the right to access this corpus
				Corpus.findById(media.id_corpus, function(error, corpus){
					if (commonFuncs.checkRightACL(corpus, user, groups, list_right)) next();
					else error = "Acces denied";
					callback(error);
	    		});
			},

		], function (error, trueOrFalse) {
			if (error) res.status(400).json({message:error});
		});
	}
}

// retrieve a particular media with his _id and print _id, name, description, url and history
exports.getInfo = function(req, res){
	Media.findById(req.params.id_media, 'name description id_corpus url history', function(error, media){
		if (error) res.status(400).json({message:error});
    	else res.status(200).json(media);
	});
}

//update information of a media
exports.update = function(req, res){
	var newHistory = {};
	Media.findById(req.params.id_media, function(error, media){
		if (req.body.name) {											// check field
			if (req.body.name == "") res.status(400).json({message:"name can't be empty"});
			else {
				media.name = req.body.name;
				newHistory.name = req.body.name;
			}
		}				
		if (req.body.description) {
			media.description = req.body.description;
			newHistory.description = req.body.description;
		}
		if (req.body.url) {
			media.url = req.body.url;
			newHistory.url = req.body.url;
		}
		media.history.push({date:new Date(), id_user:req.session.user._id, modification:newHistory})	// update history with the modification
		media.save(function(error, newMedia) {							// save the media in the db
			if (error) res.status(400).json({message:error});
			if (!error) res.status(200).json(newMedia);
		});
	});
}

// remove a given media
exports.remove = function (req, res) {
	Media.remove({_id : req.params.id_media}, function (error, media) {
		if (!error && media == 1) res.status(200).json({message:"The media as been delete"});
		else res.status(400).json({message:error});
	});
}

function getVideoWithExtension(req, res, extension) {
	Media.findById(req.params.id_media, function(error, media){
		if (error) res.status(400).json({message:error});
		else if (media == null) res.status(400).json({message: 'no such id_media!'})
		else {			
			if (media.url == undefined) return res.status(404).send({message:'not found the video corresponding to this media'});
			var filePath = media.url + '.' + extension;
			filePath = path.join(req.app.get('media'), filePath);
			res.status(200).sendfile(filePath);
		}
	});
}

// retrieve all media
exports.getAll = function (req, res) {	
	Media.find({}, function (error, medias) {
    	if (error) res.status(400).json({error:"error", message:error});
    	if (medias) res.status(200).json(medias);
		else res.status(200).json([]);
	});
}

exports.getVideo = function(req, res) {
	getVideoWithExtension(req, res, 'webm');
}

exports.getVideoWEBM = function(req, res) {
	getVideoWithExtension(req, res, 'webm');
}

exports.getVideoMP4 = function(req, res) {
	getVideoWithExtension(req, res, 'mp4');
}

exports.getVideoOGV = function(req, res) {
	getVideoWithExtension(req, res, 'ogv');
}
