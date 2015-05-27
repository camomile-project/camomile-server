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
var User = require('../models/User');
var Group = require('../models/Group');
var Corpus = require('../models/Corpus');
var Layer = require('../models/Layer');
var Authentication = require('./Authentication');

// ----------------------------------------------------------------------------
// ROUTES
// ----------------------------------------------------------------------------

// retrieve all users (but root)
exports.getAll = function (req, res) {

  var filter = {};
  if (req.query.username) {
    filter.username = req.query.username;
  }
  if (req.query.role) {
    filter.role = req.query.role;
  }

  async.waterfall([

      // retrieve all users...
      _.request.fGetResources(req, User, filter),

      // ... but "root"
      function (users, callback) {
        var allUsersButRoot = users.filter(
          function (user) {
            return user.username !== 'root';
          });
        callback(null, allUsersButRoot);
      }
    ],

    // send users
    _.response.fSendResources(res, User)
  );
};

// retrieve a specific user
exports.getOne = function (req, res) {
  _.request.fGetResource(req, User)(
    _.response.fSendResource(res, User));
};

// create a new user
exports.create = function (req, res) {

  // check username validity
  if (
    req.body.username === undefined ||
    req.body.username.length < 2 ||
    req.body.username.indexOf(' ') > -1) {
    _.response.sendError(res, 'Invalid username.', 400);
    return;
  }

  // check role validity
  if (
    req.body.role === undefined ||
    (req.body.role != 'user' && req.body.role != 'admin')
  ) {
    _.response.sendError(res, 'Invalid role.', 400);
    return;
  }

  // check password validity
  if (
    req.body.password === undefined ||
    req.body.password.length < 8) {
    _.response.sendError(res, 'Invalid password.', 400);
    return;
  }

  // generate salt and hash
  Authentication.helper.generateSaltAndHash(
    req.body.password,
    function (error, salt, hash) {

      // error happened when generating salt and hash
      if (error) {
        _.response.sendError(res, error, 500);
        return;
      }

      // create new user
      var user = new User({
        username: req.body.username,
        description: req.body.description,
        role: req.body.role,
        salt: salt,
        hash: hash,
      });

      // save it
      user.save(function (error, user) {
        if (error && error.code === 11000) {
          error = 'Invalid username (duplicate).';
        } else {
          user.__v = undefined;
        }

        // send new user (or error, if any)
        _.response.fSendResource(res, User)(error, user)
      });
    }
  );

};

exports.change_password = function (req, res) {

  // check password validity
  if (
    req.body.password !== undefined &&
    req.body.password.length < 8) {
    _.response.sendError(res, 'Invalid password.', 400);
    return;
  }

  async.waterfall([

      // find self
      function (callback) {
        User.findById(req.session.user._id, callback);
      },

      // update user
      function (user, callback) {

        Authentication.helper.generateSaltAndHash(
          req.body.password,
          function (error, salt, hash) {
            user.salt = salt;
            user.hash = hash;
            callback(error, user);
          });
      },

      // save user
      function (user, callback) {
        user.save(callback);
      }
    ],

    // success
    _.response.fSendSuccess(res, 'Password successfully updated.'));
};

// update user
exports.update = function (req, res) {

  // check password validity
  if (
    req.body.password !== undefined &&
    req.body.password.length < 8) {
    _.response.sendError(res, 'Invalid password.', 400);
    return;
  }

  // check role validity
  if (
    req.body.role !== undefined &&
    (req.body.role !== 'user' && req.body.role !== 'admin')
  ) {
    _.response.sendError(res, 'Invalid role.', 400);
    return;
  }

  async.waterfall([

      // make sure we are not updating root
      function (callback) {
        User.findById(req.params.id_user, function (error, user) {
          if (user.username === "root" &&
            req.session.user.username !== "root") {
            callback('Access denied.', user);
          } else {
            callback(error, user);
          }
        });
      },

      // update user
      function (user, callback) {

        if (req.body.description) {
          user.description = req.body.description;
        }

        if (req.body.role) {
          user.role = req.body.role;
        }

        if (req.body.password) {

          Authentication.helper.generateSaltAndHash(
            req.body.password,
            function (error, salt, hash) {
              user.salt = salt;
              user.hash = hash;
              callback(error, user);
            });

        } else {
          callback(null, user);
        }
      },

      // save user
      function (user, callback) {
        user.save(callback);
      }
    ],

    // send to client 
    _.response.fSendResource(res, User));
};

// delete a user
exports.remove = function (req, res) {

  var id_user = req.params.id_user;

  async.waterfall([

      // make sure we are not removing root, nor ourselves
      function (callback) {
        if (id_user === req.session.user._id) {
          callback('One cannot delete their own account.');
        } else {
          User.findById(id_user, function (error, user) {
            if (user.username === "root") {
              callback('Access denied.');
            } else {
              callback(error);
            }
          });
        }
      },

      // remove user in all corpora permissions
      function (callback) {
        var path = 'permissions.users.' + id_user;

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

      // remove user in all layers permissions
      function (callback) {
        var path = 'permissions.users.' + id_user;

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

      // remove user from groups
      function (callback) {
        Group.update({}, {
            $pull: {
              'users': id_user
            }
          },
          function (error, number) {
            callback(error);
          }
        );
      },

      // remove user
      function (callback) {
        User.findByIdAndRemove(id_user, callback);
      },
    ],

    _.response.fSendSuccess(res, 'Successfully deleted.'));
};

// retrieve the list of group of a user
exports.getGroups = function (req, res) {
  User.fGetGroups(req.params.id_user)(
    _.response.fSendData(res));
};