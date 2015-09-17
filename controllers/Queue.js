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
var async = require('async');

var Queue = require('../models/Queue');

// create a queue
exports.create = function (req, res) {

  var id_user = req.session.user._id;
  Queue.create(id_user, req.body, _.response.fSendResource(res, Queue));
};

// update a queue
exports.update = function (req, res) {

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

// get all READable queues
exports.getAll = function (req, res) {

  var filter = {};
  if (req.query.name) {
    filter['name'] = req.query.name;
  }

  async.waterfall([
      _.request.fGetResources(req, Queue, filter),
      _.request.fFilterResources(req, _.READ)
    ],
    _.response.fSendResources(res, Queue));

};

// get one specific queue
exports.getOne = function (req, res) {
  _.request.fGetResource(req, Queue)(
    _.response.fSendResource(res, Queue));
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
    }, _.response.fSendSuccess(res, 'Successfully pushed.')
  );
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

exports.pickLength = function (req, res) {
  var extra_fields = 'list';
  _.request.fGetResource(req, Queue, extra_fields)(
    function (error, queue) {
      if (error) {
        _.response.sendError(res, 'Could not get queue content.');
      } else {
        _.response.fSendData(res)(error, queue.list.length);
      }
    });
};

exports.pickOne = function (req, res) {
  var extra_fields = 'list';
  _.request.fGetResource(req, Queue, extra_fields)(
    function (error, queue) {
      if (error) {
        _.response.sendError(res, 'Could not get queue content.');
      } else {
        if (queue.list.length == 0) {
          _.response.sendError(res, 'Empty queue.', 400);
        } else {
          _.response.fSendData(res)(error, queue.list[0]);
        }
      }
    });
};

exports.pickAll = function (req, res) {
  var extra_fields = 'list';
  _.request.fGetResource(req, Queue, extra_fields)(
    function (error, queue) {
      if (error) {
        _.response.sendError(res, 'Could not get queue content.');
      } else {
        _.response.fSendData(res)(error, queue.list);
      }
    });
};

// remove a given queue
exports.remove = function (req, res) {
  Queue.findByIdAndRemove(
    req.params.id_queue,
    _.response.fSendSuccess(res, 'Successfully deleted.')
  );
};

// get queue rights
exports.getRights = function (req, res) {
  Queue.findById(
    req.params.id_queue,
    'permissions',
    function (error, queue) {
      _.response.fSendData(res)(error, queue.permissions);
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

  Queue.findByIdAndUpdate(
    req.params.id_queue,
    update, {
      new: true
    },
    function (error, queue) {
      _.response.fSendData(res)(error, queue.permissions);
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

  Queue.findByIdAndUpdate(
    req.params.id_queue,
    update, {
      new: true
    },
    function (error, queue) {
      _.response.fSendData(res)(error, queue.permissions);
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

  Queue.findByIdAndUpdate(
    req.params.id_queue,
    update, {
      new: true
    },
    function (error, queue) {
      _.response.fSendData(res)(error, queue.permissions);
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

  Queue.findByIdAndUpdate(
    req.params.id_queue,
    update, {
      new: true
    },
    function (error, queue) {
      _.response.fSendData(res)(error, queue.permissions);
    }
  );

};