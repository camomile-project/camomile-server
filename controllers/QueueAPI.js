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

var User = require('../models/User');
var	Group = require('../models/Group');
var Corpus = require('../models/Corpus');
var	Media = require('../models/Media');
var	Layer = require('../models/Layer');
var	Annotation = require('../models/Annotation');
var	Queue = require('../models/Queue');

// check if the id_queue exists in the db
exports.exist = function(req, res, next) {
	Queue.findById(req.params.id_queue, function(error, queue){
		if (error) res.status(400).json(error);
		else if (!queue) res.status(400).json({message:"The queue doesn't exists"});
		else next();
	});
}

// create a queue
exports.create = function (req, res) {
	if (req.body.name == undefined) res.status(400).json({message:"the name is not defined"}); 
	if (req.body.name == "") 		res.status(400).json({message:"empty string for name is not allowed"});
	var queue = new Queue({
		name: req.body.name,
		description: req.body.description,
		list: [],
	}).save(function (error, newQueue) {
		if (error) res.status(400).json({message:error});
		if (newQueue) res.status(200).json(newQueue);
	});
}

// retrieve all queues
exports.getAll = function (req, res) {	
	Queue.find({}, 'name description list', function (error, queues) {
    	if (error) res.status(400).json({error:"error", message:error});
    	if (queues) res.status(200).json(queues);
		else res.status(200).json([]);
	});
}

// retrieve a particular queue with his _id
exports.getInfo = function(req, res){
	Queue.findById(req.params.id_queue, function(error, queue){
		res.status(200).json(queue);
	});
}

//update information of a queue
exports.update = function(req, res){
	var error=null;
	var update = {};
	if (req.body.name) update.name = req.body.name;
	if (req.body.description) update.description = req.body.description;
	if (req.body.list) update.list = req.body.list;
	Queue.findByIdAndUpdate(req.params.id_queue, update, function (error, queue) {
		if (!error) res.status(200).json(queue);
	});
}

//push element at the end of the queue
exports.push = function(req, res){
	if (req.body.list == undefined) res.status(400).json({message:"list of field is empty"});
	Queue.findById(req.params.id_queue, function (error, queue) {
		for(var i = 0; i < req.body.list.length; i++) queue.list.push(req.body.list[i]);
		queue.save(function(error, newQueue) {
			if (!error) res.status(200).json(newQueue);
		});		
	});	
}

//pop element at the end of the queue
exports.pop = function(req, res){
	Queue.findById(req.params.id_queue, function (error, queue) {
		if (queue.list.length <0) res.status(400).json({message:"list is empty"});
		ret = queue.list.slice(0,1);
		queue.list.splice(0,1);
		queue.save(function(error2, newQueue) {
			if (error2) res.status(400).json({message:error2});
			else res.status(200).json(ret[0]);
		});		
	});
}

// remove a given queue
exports.remove = function (req, res) {
	Queue.remove({_id : req.params.id_queue}, function (error, queue) {
		if (!error && queue == 1) res.status(200).json({message:"The queue has been deleted"});
		else res.status(400).json({message:error});
	});
}
