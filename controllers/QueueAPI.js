/* The API controller for queue's methods
   For instance: 
   	- getnext to pick up the first element in the queue and remove it from the queue
   	- put: fill up the queue
   	- putnext: intert a list of id into the queue			
*/

var Queue = require('../models/Queue').Queue;

// retrieve all queues, only admin users can do so
// GET /queue
exports.listAll = function (req, res) {
	Queue.find({}, function (err, que) {
        if(err) throw err;
        if (que) {
 			res.send(que);
        } else {
            return res.send([]);
        }
    });
}

//retrieve a particular queue, any connected user can do it
// GET /queue/id
exports.listWithId = function(req, res){
	if(req.params.id == undefined)
		return res.send(404, "the given ID is not correct");
	
	Queue.findById(req.params.id, function (err, que) {
        if(err) throw err;
        if (que) {
 			res.send(que);
        } else {
            return res.send([]);
        }
    });
}

//get(pop) the next annotation to be annotated
// GET /queue/id/next
exports.getNext = function(req, res){
	if(req.params.id == undefined)
		return res.send(404, "the given ID is not correct");
	
	Queue.findById(req.params.id, function (err, que) {
        if(err) throw err;
        if (que) {
        	if(que.queue.length > 0){
        		ret = que.queue.slice(0,1);
        		que.queue.splice(0,1);
        		que.save(function(err, queNew) {
        			if(err) res.send(err);
        			else res.send(ret[0]);
        		});
        	}
			else res.send("''''");
        } else {
            return res.send([]);
        }
    });
}

//create a queue with a given name (and a queue containing a list of ids, optional)
// POST /queue
exports.post = function(req, res){
	if(req.body.name == undefined)
		return res.send(404, "You must fill in the name of the queue");
		
	var queue_data = {
          name: req.body.name,
          queue : []
        };

	if(req.body.queue)
		queue_data = req.body.queue;
		
	var queue = new Queue(queue_data);

	queue.save(function(error, data){
		if(error){
			console.log('error in posting queue data');
			res.json(error);
		}
		else {
			console.log('Success on saving queue data'); 
			res.json(data);
		}
	});
}

// update information of a queue: 
// PUT /user/:id; req.body.data : id_list = [ID_ANNOTATION, ID_ANNOTATION, ID_ANNOTATION, ... ] 
exports.update = function(req, res){
	if(req.params.id == undefined || req.body.id_list == undefined)
		return res.send(404, "one or more data fields are not filled out properly");
	
	Queue.findById(req.params.id, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('no such id_queue!')
		}
		else {
			if(req.body.name)
				data.name = req.body.name;
			
			if(req.body.id_list)
				data.queue = req.body.id_list;
	
			data.save(function(err, dat){
				if(err) res.send(err);
				else res.send(dat);
			});
		}
	});
}

// add a list of ids to the queue
//put /queue/:id/next
exports.putnext = function(req, res){
	if(req.params.id == undefined || req.body.id_list == undefined)
		return res.send(404, "one or more data fields are not filled out properly");
	
	Queue.findById(req.params.id, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('no such id_queue!')
		}
		else {
			if(req.body.name)
				data.name = req.body.name;
			
			if(req.body.id_list){
				var id_list = req.body.id_list;	
				for(var i = 0; i < id_list.length; i++) {
					var index = data.queue.indexOf(id_list[i]);
					if(index < 0) // not found, so insert it into the queue
						data.queue.push(id_list[i]);
				}
			}
			data.save(function(err, dat){
				if(err) res.send(err);
				else res.send(dat);
			});
		}
	});
}

// remove a queue
exports.remove  = function(req, res){
	if(req.params.id == undefined)
		return res.send(404, "one or more data fields are not filled out properly");
	Queue.remove({_id : req.params.id}, function (error, data) {
		if(error) {
			res.json(error);
		}
		else {
			res.json(data);
		}
	});
}
