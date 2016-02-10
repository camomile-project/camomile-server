/*
The MIT License (MIT)

Copyright (c) 2013-2015 CNRS

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
var _ = require('../controllers/utils');

var Corpus = require('../models/Corpus');
var Medium = require('../models/Medium');
var Layer = require('../models/Layer');
var Annotation = require('../models/Annotation');

// create a corpus
exports.create = function (req, res) {

  var id_user = req.session.user._id;
  Corpus.create(id_user, req.body, _.response.fSendResource(res, Corpus));

};

// update a corpus
exports.update = function (req, res) {
  if (
    req.body.name &&
    req.body.name === '') {
    _.response.sendError(res, 'Invalid name.', 400);
    return;
  }

  Corpus.findById(req.params.id_corpus, function (error, corpus) {

    var changes = {};

    if (req.body.name) {
      corpus.name = changes.name = req.body.name;
    }

    if (req.body.description) {
      corpus.description = changes.description = req.body.description;
    }

    // update history
    corpus.history.push({
      date: new Date(),
      id_user: req.session.user._id,
      changes: changes
    });

    corpus.save(_.response.fSendResource(res, Corpus));
  });
};
/*
//*version 1 filter fields on the server
// update a corpus metadata 
exports.updateMetadata = function (req, res) {
    var path ='metadata.' + req.body.key;
    var key = req.body.key;
    var update = {
    			$set: {}
    };
    update['$set'][path] = req.body.value;
    Corpus.findByIdAndUpdate(
   	 req.params.id_corpus,
   	 update, {
     		 upsert:true,
		 new :true,
		 select: path
    	},
	    function (error, corpus) {
		_.response.fSendSuccess(res, req.body.key + ' is successfully updated.')(error, corpus);
	});
};
*/
/* version 2 add a list in the metadata*/
exports.updateMetadata = function (req, res) {
    var path ='metadata.' + req.body.key;
    var key = req.body.key;
    var list = key.split('.')[0];
    var update = {
    			$set: {},
			$addToSet:{'metadata.list':list}
    };
    update['$set'][path] = req.body.value;
    Corpus.findByIdAndUpdate(
   	 req.params.id_corpus,
   	 update, {
     		 upsert:true,
		 new :true,
		 select: 'metadata' 
    	},
	    function (error, corpus) {
		_.response.fSendSuccess(res, req.body.key + ' is successfully updated.')(error, corpus);
	});
};

/*version 3 change the structure of metadata*/
//repetition
// update a corpus metadata 

//exports.updateMetadata = function (req, res) {
/*    var path1 ='metadata.key' + req.body.key;
    var key = req.body.key;
    var value = req.body.value;
   Corpus.findById(req.params.id_corpus,'metadata', function (error, corpus) {
    // update history
    corpus.metadata.push({
      key: key,
      value: value
    });

    corpus.save(_.response.fSendResource(res, Corpus));
   });
*/
  /*
    var path ='metadata';
    var key = req.body.key;
    var value = req.body.value;
    var metadata = {'key':key,'value':value}
    var update = {
    			$addToSet: {'metadata':metadata},
    };
    Corpus.findByIdAndUpdate(
   	 req.params.id_corpus,
   	 update, {
     		 upsert:true,
		 new :true,
	         safe:true,
		 select: path
    	},
	    function (error, corpus) {
		_.response.fSendSuccess(res, req.body.key + ' is successfully updated.')(error, corpus);
	});
};
 */
//get a corpus's metadata
exports.getMetadata = function (req, res){
    var fields = '';
    if(req.query.name){
    	fields = 'metadata.'+ req.query.name;
    }else{
	fields = 'metadata.list';
    }
    Corpus.findById(req.params.id_corpus, fields, function(error, corpus){
	_.response.fSendData(res)(error, corpus.metadata);
    });
};
/*
//delete a champ of corpus's metadata
exports.deleteMetadata = function (req, res){
  
    var path ='metadata.' + req.query.name;
    var name = req.query.name;
    var update = {
    			$unset: {},
			$set :{}
    };
    if(!req.query.name){
	path = 'metadata';
    }
    update['$unset'][path] = "";
    Corpus.findByIdAndUpdate(
   	 req.params.id_corpus,
   	 update, {
		 new :true,
		 select: '_id'
    	},
	    function (error, corpus) {
		console.log(corpus);
		_.response.fSendSuccess(res, path + ' is deleted now.')(error);
	});
};
*/
/*version 2 add a list in the metadata*/

//delete a champ of corpus's metadata
exports.deleteMetadata = function (req, res){
  
    var path ='metadata.' + req.query.name;
    var name = req.query.name;
    var update = {
    			$unset: {},
			$pull :{}
    };
    if(!req.query.name){
	path = 'metadata';
    }else{
	update['$pull']['metadata.list'] = name;
    }
    update['$unset'][path] = "";
    Corpus.findByIdAndUpdate(
   	 req.params.id_corpus,
   	 update, {
		 new :true,
		 select: ' metadata.list'
    	},
	    function (error, corpus) {
		_.response.fSendSuccess(res, path + ' is deleted now.')(error);
	});
};


// get all READable corpora
exports.getAll = function (req, res) {

  var filter = {};
  if (req.query.name) {
    filter['name'] = req.query.name;
  }

  async.waterfall([
      _.request.fGetResources(req, Corpus, filter),
      _.request.fFilterResources(req, _.READ)
    ],
    _.response.fSendResources(res, Corpus));

};

// get one specific corpus
exports.getOne = function (req, res) {
  _.request.fGetResource(req, Corpus)(
    _.response.fSendResource(res, Corpus));
};

// remove a given corpus
exports.remove = function (req, res) {

  var corpus = req.params.id_corpus;

  // remove layers and media in parallel
  async.parallel([

    // remove layers
    function (callback) {
      Layer.find({
          id_corpus: corpus
        },
        function (error, layers) {

          // create list of ids 
          var ids_layers = [];
          for (var i = layers.length - 1; i >= 0; i--) {
            ids_layers.push(layers[i]._id);
          };

          // remove layers and annotations in parallel
          async.parallel([

              // remove annotations
              function (callback) {
                Annotation.remove({
                    id_layer: {
                      $in: ids_layers
                    }
                  },
                  callback);
              },

              // remove layers
              function (callback) {
                Layer.remove({
                    _id: {
                      $in: ids_layers
                    }
                  },
                  callback);
              }
            ],
            callback);
        });
    },

    // remove media
    function (callback) {
      Medium.remove({
        id_corpus: corpus
      }, callback);
    },

    // remove corpus
    function (callback) {
      Corpus.remove({
          _id: corpus
        },
        callback);
    }

  ], _.response.fSendSuccess(res, 'Successfully deleted.'));
};

// get corpus rights
exports.getRights = function (req, res) {
  Corpus.findById(
    req.params.id_corpus,
    'permissions',
    function (error, corpus) {
      _.response.fSendData(res)(error, corpus.permissions);
    });
};

// update user rights
exports.updateUserRights = function (req, res) {

  if (
    req.body.right != _.ADMIN &&
    req.body.right != _.WRITE &&
    req.body.right != _.READ) {
    _.response.sendError(
      res,
      "Right must be 1 (READ), 2 (WRITE) or 3 (ADMIN).",
      400);
    return;
  }

  var path = 'permissions.users.' + req.params.id_user;
  var update = {
    $set: {}
  };
  update['$set'][path] = req.body.right;

  Corpus.findByIdAndUpdate(
    req.params.id_corpus,
    update, {
      new: true
    },
    function (error, corpus) {
      _.response.fSendData(res)(error, corpus.permissions);
    }
  );

};

// update group rights
exports.updateGroupRights = function (req, res) {

  if (
    req.body.right != _.ADMIN &&
    req.body.right != _.WRITE &&
    req.body.right != _.READ) {
    _.response.sendError(
      res,
      "Right must be 1 (READ), 2 (WRITE) or 3 (ADMIN).",
      400);
    return;
  }

  var path = 'permissions.groups.' + req.params.id_group;
  var update = {
    $set: {}
  };
  update['$set'][path] = req.body.right;

  Corpus.findByIdAndUpdate(
    req.params.id_corpus,
    update, {
      new: true
    },
    function (error, corpus) {
      _.response.fSendData(res)(error, corpus.permissions);
    }
  );

};

// remove user rights
exports.removeUserRights = function (req, res) {

  var path = 'permissions.users.' + req.params.id_user;
  var update = {
    $unset: {}
  };
  update['$unset'][path] = '';

  Corpus.findByIdAndUpdate(
    req.params.id_corpus,
    update, {
      new: true
    },
    function (error, corpus) {
      _.response.fSendData(res)(error, corpus.permissions);
    }
  );
};

// remove group rights
exports.removeGroupRights = function (req, res) {

  var path = 'permissions.groups.' + req.params.id_group;
  var update = {
    $unset: {}
  };
  update['$unset'][path] = '';
  
  Corpus.findByIdAndUpdate(
    req.params.id_corpus,
    update, {
      new: true
    },
    function (error, corpus) {
      _.response.fSendData(res)(error, corpus.permissions);
    }
  );

};
