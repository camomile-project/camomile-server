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

var path = require('path');
var async = require('async');
var _ = require('./utils');

var Medium = require('../models/Medium');
var Annotation = require('../models/Annotation');

// create medium(a)
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
      Medium.create(id_user, id_corpus, datum, callback);
    },
    function (error, media) {
      if (only_one) {
        _.response.fSendResource(res, Medium)(error, media[0]);
      } else {
        _.response.fSendResources(res, Medium)(error, media);
      }
    }
  );
};

// update a medium
exports.update = function (req, res) {

  if (req.body.name && req.body.name === '') {
    _.response.sendError(res, 'Invalid name.', 400);
    return;
  }

  Medium.findById(req.params.id_medium, function (error, medium) {

    var changes = {};

    if (req.body.name) {
      medium.name = changes.name = req.body.name;
    }

    if (req.body.description) {
      medium.description = changes.description = req.body.description;
    }

    if (req.body.url) {
      medium.url = changes.url = req.body.url;
    }

    medium.history.push({
      date: new Date(),
      id_user: req.session.user._id,
      changes: changes
    });

    medium.save(_.response.fSendResource(res, Medium));
  });
};

// get all READable media
exports.getAll = function (req, res) {

  var filter = {};
  if (req.query.name) {
    filter.name = req.query.name;
  }

  _.request.fGetResources(req, Medium, filter)(
    _.response.fSendResources(res, Medium));

};

// get one specific medium
exports.getOne = function (req, res) {
  _.request.fGetResource(req, Medium)(
    _.response.fSendResource(res, Medium)
  );
};

// get all media of a specific corpus
exports.getCorpusMedia = function (req, res) {

  var filter = {};

  // only this corpus
  filter.id_corpus = req.params.id_corpus;

  // filter by name
  if (req.query.name) {
    filter.name = req.query.name;
  }

  _.request.fGetResources(req, Medium, filter)(
    _.response.fSendResources(res, Medium)
  );

};

// get number of media of a specific corpus
exports.getCorpusMediaCount = function (req, res) {

  var filter = {};

  // only this corpus
  filter.id_corpus = req.params.id_corpus;

  // filter by name
  if (req.query.name) {
    filter.name = req.query.name;
  }

  _.request.fCountResources(req, Medium, filter)(
    _.response.fSendData(res)
  );

};

// remove one medium and its annotations
exports.remove = function (req, res) {

  var id_medium = req.params.id_medium;

  async.parallel([

      // remove annotations
      function (callback) {
        Annotation.remove({
            id_medium: id_medium
          },
          callback);
      },

      // remove medium
      function (callback) {
        Medium.remove({
            _id: id_medium
          },
          callback);
      }

    ],
    _.response.fSendSuccess(res, 'Successfully deleted.'));

};

var streamFormat = function (req, res, extension) {
  Medium.findById(req.params.id_medium, function (error, medium) {

    if (error || medium.url === undefined) {
      _.response.sendError(res, 'Failed stream.');
      return;
    }

    var absolutePathToFile = medium.url + '.' + extension;
    absolutePathToFile = path.join(req.app.get('media'), absolutePathToFile);
    res.status(200).sendFile(
      absolutePathToFile,
      function (error) {
        if (error) {
          res.status(error.status).end();
        }
      });
  });
};

exports.stream = function (req, res) {
  streamFormat(req, res, 'webm');
};

exports.streamWebM = function (req, res) {
  streamFormat(req, res, 'webm');
};

exports.streamMp4 = function (req, res) {
  streamFormat(req, res, 'mp4');
};

exports.streamOgv = function (req, res) {
  streamFormat(req, res, 'ogv');
};