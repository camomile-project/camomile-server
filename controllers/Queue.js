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

var _ = require('./utils');

var Queue = require('../models/Queue');

// create a queue
exports.create = function (req, res) {

  if (
    req.body.name === undefined ||
    req.body.name === '') {
    _.sendError(res, 'Invalid name', 400);
    return;
  }

  var queue = new Queue({
    name: req.body.name,
    description: req.body.description,
    list: [],
  });

  queue.save(_.response.fSendResource(res, Queue));
};

// get all queues (root only)
exports.getAll = function (req, res) {

  var field = 'name description list';

  var filter = {};
  if (req.query.name) {
    filter['name'] = req.query.name;
  }

  Queue.find(filter, field, _.response.fSendResources(res, Queue));
};

// retrieve a particular queue with his _id
exports.getOne = function (req, res) {
  Queue.findById(req.params.id_queue, _.response.fSendResource(res, Queue));
};

// update information of a queue
exports.update = function (req, res) {
  var error = null;

  var update = {};
  if (req.body.name) {
    update.name = req.body.name;
  }
  if (req.body.description) {
    update.description = req.body.description;
  }
  if (req.body.list) {
    update.list = req.body.list;
  }

  Queue.findByIdAndUpdate(
    req.params.id_queue, update,
    _.response.fSendData(res));
};

// push element into the queue
exports.push = function (req, res) {

  var data;
  if (req.body.constructor !== Array) {
    data = [req.body];
  } else {
    data = req.body;
  }

  Queue.findByIdAndUpdate(
    req.params.id_queue, {
      $push: {
        list: {
          $each: data
        }
      }
    }, {
      new: true
    }, _.response.fSendData(res));
};

// pop element from the queue
exports.pop = function (req, res) {

  Queue.findByIdAndUpdate(
    req.params.id_queue, {
      $pop: {
        list: -1
      }
    }, {
      new: false
    },
    function (error, queue) {
      if (error || queue.list.length > 0) {
        _.response.fSendData(res)(error, queue.list[0]);
      } else {
        _.response.sendError(res, 'Empty queue.', 400);
      }
    }
  )
};

// remove a given queue
exports.remove = function (req, res) {
  Queue.findByIdAndRemove(
    req.params.id_queue,
    _.response.fSendSuccess(res, 'Successfully deleted.')
  );
};