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
var _ = require('./utils');

var Group = require('../models/Group');
var Corpus = require('../models/Corpus');
var Layer = require('../models/Layer');

// ----------------------------------------------------------------------------
// ROUTES
// ----------------------------------------------------------------------------

// retrieve all groups
exports.getAll = function (req, res) {

  var filter = {};
  if (req.query.name) {
    filter.name = req.query.name;
  }

  _.request.fGetResources(req, Group, filter)(
    _.response.fSendResources(res, Group));
};

// retrieve a specific group
exports.getOne = function (req, res) {
  _.request.fGetResource(req, Group)(
    _.response.fSendResource(res, Group));
};

// create a new group
exports.create = function (req, res) {

  // check name validity
  if (
    req.body.name === undefined ||
    req.body.name.indexOf(' ') > -1) {
    _.response.sendError(res, 'Invalid name', 400);
    return;
  }

  // create new group
  var group = new Group({
    name: req.body.name,
    description: req.body.description,
    users: []
  });

  // save it
  group.save(function (error, group) {
    if (error && error.code === 11000) {
      error = 'Invalid name (duplicate).';
    }

    // send new group (or error, if any)
    _.response.fSendResource(res, Group)(error, group)
  });

};

// update group
exports.update = function (req, res) {

  Group.findById(req.params.id_group, function (error, group) {
    if (req.body.description) {
      group.description = req.body.description;
    }
    group.save(_.response.fSendResource(res, Group));
  });

};

// delete a group
exports.remove = function (req, res) {

  var id_group = req.params.id_group;

  async.waterfall([

      // remove group in all corpora permissions
      function (callback) {
        var path = 'permissions.groups.' + id_group;

        var filter = {};
        filter[path] = {
          $exists: true
        };

        var update = {
          $unset: {}
        };
        update.$unset[path] = '';

        Corpus.update(filter, update,
          function (error, number) {
            callback(error);
          });
      },

      // remove group in all layers permissions
      function (callback) {
        var path = 'permissions.groups.' + id_group;

        var filter = {};
        filter[path] = {
          $exists: true
        };

        var update = {
          $unset: {}
        };
        update.$unset[path] = '';

        Layer.update(filter, update,
          function (error, number) {
            callback(error);
          });
      },

      // remove group
      function (callback) {
        Group.findByIdAndRemove(id_group, callback);
      },
    ],

    _.response.fSendSuccess(res, 'Successfully deleted.'));
};

// remove user from a group
exports.addUser = function (req, res) {

  Group.findByIdAndUpdate(
    req.params.id_group, {
      $addToSet: {
        'users': req.params.id_user
      }
    }, {
      new: true
    },
    _.response.fSendResource(res, Group)
  );
};

// remove user from a group
exports.removeUser = function (req, res) {

  Group.findByIdAndUpdate(
    req.params.id_group, {
      $pull: {
        'users': req.params.id_user
      }
    }, {
      new: true
    },
    _.response.fSendResource(res, Group)
  );
};