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

var User = require('../models/User');
var Group = require('../models/Group');
var Layer = require('../models/Layer');
var Annotation = require('../models/Annotation');

// ----------------------------------------------------------------------------
// ROUTES
// ----------------------------------------------------------------------------

// add annotation(s)
exports.create = function (req, res) {

  var id_user = req.session.user._id;
  var id_layer = req.params.id_layer;

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
      Annotation.create(
        id_user, id_layer, datum, callback);
    },
    function (error, annotations) {
      if (only_one) {
        _.response.fSendData(res)(error, annotations[0]);
      } else {
        _.response.fSendData(res)(error, annotations);
      }
    }
  );

};

// update annotation
exports.update = function (req, res) {
  Annotation.updateWithEvent(req.params.id_annotation, req.body.fragment, req.body.data, req.session.user._id,
    _.response.fSendData(res));
};

// get all annotations (root only)
exports.getAll = function (req, res) {

  var filter = {};
  if (req.query.id_medium) {
    filter.id_medium = req.query.id_medium;
  }
  if (req.query.id_layer) {
    filter.id_layer = req.query.id_layer;
  }
  if (req.query.fragment) {
    filter.fragment = req.query.fragment;
  }
  if (req.query.data) {
    filter.data = req.query.data;
  }

  _.request.fGetResources(req, Annotation, filter)(
    _.response.fSendData(res));

};

// get one specific medium
exports.getOne = function (req, res) {
  _.request.fGetResource(req, Annotation)(
    _.response.fSendData(res));
};

// retrieve all annotations of a layer
exports.getLayerAnnotations = function (req, res) {

  var filter = {};

  filter.id_layer = req.params.id_layer;

  // filter by medium
  if (req.query.id_medium) {
    filter.id_medium = req.query.id_medium;
  }

  // filter by fragment
  if (req.query.fragment) {
    filter.fragment = req.query.fragment;
  }

  // filter by data
  if (req.query.data) {
    filter.data = req.query.data;
  }

  _.request.fGetResources(req, Annotation, filter)(
    _.response.fSendData(res));

};

// retrieve number of annotations of a layer
exports.getLayerAnnotationsCount = function (req, res) {

  var filter = {};

  filter.id_layer = req.params.id_layer;

  // filter by medium
  if (req.query.id_medium) {
    filter.id_medium = req.query.id_medium;
  }

  // filter by fragment
  if (req.query.fragment) {
    filter.fragment = req.query.fragment;
  }

  // filter by data
  if (req.query.data) {
    filter.data = req.query.data;
  }

  _.request.fCountResources(req, Annotation, filter)(
    _.response.fSendData(res));

};

// remove a given annotation
exports.remove = function (req, res) {
  Annotation.removeWithEvent({
      _id: req.params.id_annotation
    },
    _.response.fSendSuccess(res, 'Successfully deleted.'));
};
