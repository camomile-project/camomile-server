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


exports.exist = function(req, res, next) {
	Queue.findById(req.params.id_queue, function(error, queue){
		if (error) res.status(400).json(error);
		else if (!queue) res.status(400).json({message:"id_queue don't exists"});
		else next();
	});
}

// create a queue
exports.create = function (req, res) {
	if (req.body.name == undefined) res.status(400).json({message:"the name is not define"}); 
	if (req.body.name == "") 		res.status(400).json({message:"empty string for name is not allow"});
	var queue = new Queue({
		name: req.body.name,
		description: req.body.description,
		list: [],
	}).save(function (error, newQueue) {
		if (error) res.status(400).json({message:error});
		if (newQueue) printRes(newQueue, res);
	});
}
