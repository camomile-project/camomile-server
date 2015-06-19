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

var Layer = require('../models/Layer');
var Annotation = require('../models/Annotation');

// ----------------------------------------------------------------------------
// ROUTES
// ----------------------------------------------------------------------------

// add layer(s)
exports.create = function (req, res) {

  var id_user = req.session.user._id;
  var id_corpus = req.params.id_corpus;

  var data, only_one;
  if (req.body.constructor !== Array) {
    data = [req.body];
    only_one = true;
  } else {
    data = req.body;
    only_one = false;
  }

  async.map(
    data,
    function (datum, callback) {
      Layer.create(
        id_user, id_corpus, datum,
        function (error, layer) {

          if (datum.annotations === undefined) {
            callback(error, layer);
            return;
          }

          async.each(
            datum.annotations,
            function (annotation, callback) {
              Annotation.create(id_user, layer._id, annotation, callback)
            },
            function (error) {
              // TODO: remove layer (and its annotations) 
              //       if something went wrong
              if (error) {
                console.log('TODO - Remove just created layer.')
              }
              callback(error, layer);
            }
          );
        }
      );
    },
    function (error, layers) {
      if (only_one) {
        _.response.fSendResource(res, Layer)(error, layers[0]);
      } else {
        _.response.fSendResources(res, Layer)(error, layers);
      }
    }
  );
};

// update layer
exports.update = function (req, res) {

  if (
    req.body.name &&
    req.body.name === '') {
    _.response.sendError(res, 'Invalid name.', 400);
    return;
  }

  Layer.findById(req.params.id_layer, function (error, layer) {

    var changes = {};

    if (req.body.name) {
      layer.name = changes.name = req.body.name;
    }

    if (req.body.description) {
      layer.description = changes.description = req.body.description;
    }

    // // update history
    // layer.history.push({
    //   date: new Date(),
    //   id_user: req.session.user._id,
    //   changes: changes
    // });

    layer.save(_.response.fSendResource(res, Layer));
  });

};

// get all READable layers
exports.getAll = function (req, res) {

  var filter = {};

  if (req.query.name) {
    filter.name = req.query.name;
  }

  if (req.query.fragment_type) {
    filter.fragment_type = req.query.fragment_type;
  }

  if (req.query.data_type) {
    filter.data_type = req.query.data_type;
  }

  async.waterfall([
      _.request.fGetResources(req, Layer, filter),
      _.request.fFilterResources(req, _.READ)
    ],
    _.response.fSendResources(res, Layer));

};

// get one specific medium
exports.getOne = function (req, res) {
  _.request.fGetResource(req, Layer)(
    _.response.fSendResource(res, Layer));
};

// get all READable layers of a specific corpus
exports.getCorpusLayers = function (req, res) {

  var filter = {};

  // only this corpus
  filter.id_corpus = req.params.id_corpus;

  // filter by name
  if (req.query.name) {
    filter.name = req.query.name;
  }

  // filter by fragment_type
  if (req.query.fragment_type) {
    filter.fragment_type = req.query.fragment_type;
  }

  // filter by data_type
  if (req.query.data_type) {
    filter.data_type = req.query.data_type;
  }

  async.waterfall([
      _.request.fGetResources(req, Layer, filter),
      _.request.fFilterResources(req, _.READ)
    ],
    _.response.fSendResources(res, Layer));

};

// remove one layer and its annotations
exports.remove = function (req, res) {

  var id_layer = req.params.id_layer;

  async.parallel([

      // remove annotations
      function (callback) {
        Annotation.remove({
            id_layer: id_layer
          },
          callback);
      },

      // remove layer
      function (callback) {
        Layer.remove({
            _id: id_layer
          },
          callback);
      }

    ],
    _.response.fSendSuccess(res, 'Successfully deleted.'));

};

// get layer rights
exports.getRights = function (req, res) {
  Layer.findById(
    req.params.id_layer,
    'permissions',
    function (error, layer) {
      _.response.fSendData(res)(error, layer.permissions);
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

  Layer.findByIdAndUpdate(
    req.params.id_layer,
    update, {
      new: true
    },
    function (error, layer) {
      _.response.fSendData(res)(error, layer.permissions);
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

  Layer.findByIdAndUpdate(
    req.params.id_layer,
    update, {
      new: true
    },
    function (error, layer) {
      _.response.fSendData(res)(error, layer.permissions);
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

  Layer.findByIdAndUpdate(
    req.params.id_layer,
    update, {
      new: true
    },
    function (error, layer) {
      _.response.fSendData(res)(error, layer.permissions);
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

  Layer.findByIdAndUpdate(
    req.params.id_layer,
    update, {
      new: true
    },
    function (error, layer) {
      _.response.fSendData(res)(error, layer.permissions);
    }
  );

};