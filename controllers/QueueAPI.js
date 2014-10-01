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

/* The API controller for queue's methods
   For instance: 
   	- getnext to pick up the first element in the queue and remove it from the queue
   	- put: fill up the queue
   	- putnext: intert a list of id into the queue			
*/

var Queue = require('../models/Queue').Queue;

// retrieve all queues, only admin users can do so
exports.listAll = function (req, res) {
	Queue.find({}, function (error, que) {
        if (error) res.status(400).json({error:"error", message:error});
        if (que) res.status(200).json(que);
        else return res.status(200).json([]);
    });
}

//retrieve a particular queue, any connected user can do it
exports.listWithId = function(req, res){
	if (req.params.id == undefined) return res.status(400).json({error:"the given ID is not correct"});
	Queue.findById(req.params.id, function (error, que) {
        if (error) res.status(400).json({error:"error", message:error});
        if (que) res.status(200).json(que);
        else return res.status(200).json([]);
    });
}

//get(pop) the next annotation to be annotated
exports.getNext = function(req, res){
	if (req.params.id == undefined) return res.status(200).json({error:"the given ID is not correct"});
	Queue.findById(req.params.id, function (error, que) {
        if (error) res.status(400).json({error:"error", message:error});
        if (que) {
        	if (que.queue.length > 0){
        		ret = que.queue.slice(0,1);
        		que.queue.splice(0,1);
        		que.save(function(error2, queNew) {
        			if (error2) res.status(400).json({error:"error", message:error2});
        			else res.status(200).json(ret[0]);
        		});
        	}
			else res.status(200).json([]);
        } 
        else return res.status(200).json([]);
    });
}

//create a queue with a given name (and a queue containing a list of ids, optional)
exports.post = function(req, res){
	if (req.body.name == undefined) return res.status(400).json({error:"You must fill in the name of the queue"});
	var queue_data = {name: req.body.name, queue : []};
	if (req.body.queue) queue_data = req.body.queue;
	var queue = new Queue(queue_data);
	queue.save(function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else res.status(200).json(data);
	});
}

// update information of a queue: 
exports.update = function(req, res){
	if (req.params.id == undefined || req.body.id_list == undefined)	return res.status(400).json({error:"one or more data fields are not filled out properly"});
	Queue.findById(req.params.id, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else if (data == null) res.status(400).json({error:'no such id_queue!'})
		else {
			if (req.body.name) data.name = req.body.name;
			if (req.body.id_list) data.queue = req.body.id_list;
			data.save(function(error2, dat){
				if (error2) res.status(400).json(error2);
				else res.status(200).json(dat);
			});
		}
	});
}

// add a list of ids to the queue
exports.putnext = function(req, res){
	if (req.params.id == undefined || req.body.id_list == undefined) return res.status(400).json({error:"one or more data fields are not filled out properly"});
	Queue.findById(req.params.id, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else if (data == null) res.status(400).json({error:'no such id_queue!'})
		else {
			if (req.body.name) data.name = req.body.name;
			if (req.body.id_list){
				var id_list = req.body.id_list;	
				for(var i = 0; i < id_list.length; i++) {
					var index = data.queue.indexOf(id_list[i]);
					if (index < 0) data.queue.push(id_list[i]);										// not found, so insert it into the queue
				}
			}
			data.save(function(error2, dat){
				if (error2) res.status(400).json({error:"error", message:error2});
				else res.status(200).json(dat);
			});
		}
	});
}

// remove a queue
exports.remove  = function(req, res){
	if (req.params.id == undefined) return res.status(400).json({error:"one or more data fields are not filled out properly"});
	Queue.remove({_id : req.params.id}, function (error, data) {
		if (error) res.status(400).json({error:"error", message:error});
		else res.status(200).json(data);
	});
}