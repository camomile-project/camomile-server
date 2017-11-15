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
var User = require('../models/User');
var crypto = require('crypto');

// ----------------------------------------------------------------------------
// HELPER
// ----------------------------------------------------------------------------

exports.helper = {};

var KEYLEN = 128;
var ITERATIONS = 12000;
// var DIGEST = 'sha1';

exports.helper.cookieSecret = function () {
  return crypto.randomBytes(64).toString();
};

// Get password hash using provided salt
var getHash = function (password, salt, callback) {
  // password: user password
  // salt: user salt
  // callback: function (error, hash)

  try {
    crypto.pbkdf2(password, salt, ITERATIONS, KEYLEN, function (error, buffer) {
      var hash = buffer.toString('base64');
      callback(error, hash);
    });
  } catch (error) {
    callback(error);
  }

};

// Get password hash using random salt
exports.helper.generateSaltAndHash = function (password, callback) {
  // password: user password
  // callback: function (error, salt, hash)

  crypto.randomBytes(KEYLEN, function (error, buffer) {
    if (error) {
      callback(error);
    } else {
      var salt = buffer.toString('base64');
      getHash(password, salt, function (error, hash) {
        callback(error, salt, hash);
      });
    }
  });
};

// ----------------------------------------------------------------------------
// MIDDLEWARES
// ----------------------------------------------------------------------------

exports.middleware = {};

// user is logged in?
exports.middleware.isLoggedIn = function (req, res, next) {
  if (!req.session.user) {
    _.response.sendError(res, 'Access denied.', 401);
    return;
  }
  next();
};

// user has admin privileged?
exports.middleware.isAdmin = function (req, res, next) {
  if (req.session.user.role !== "admin") {
    _.response.sendError(res, 'Access denied (admin only).', 403);
    return;
  }
  next();
};

// user is root?
exports.middleware.isRoot = function (req, res, next) {
  if (req.session.user.username !== "root") {
    _.response.sendError(res, 'Access denied (root only).', 403);
    return;
  }
  next();
};

// ----------------------------------------------------------------------------
// ROUTES
// ----------------------------------------------------------------------------

// Login
exports.login = function (req, res) {

  var failure = 'Authentication failed (check your username and password).';

  // check that both username and password are defined
  if (req.body.username === undefined ||
    req.body.password === undefined) {
    _.response.sendError(res, failure, 401);
    return;
  }

  // find user by its name
  User.findOne({
    username: req.body.username
  }, function (error, user) {

    // if error or user does not exist, report authentication failure
    if (error || !user) {
      _.response.sendError(res, failure, 401);
      return;
    }

    // generate hash from password and salt and compare it to stored hash
    getHash(req.body.password, user.salt, function (error, hash) {

      if (error || user.hash !== hash) {
        _.response.sendError(res, failure, 401);
        return;
      }

      // if hash is correct, success!
      req.session.regenerate(function () {
        req.session.user = user;
        _.response.sendSuccess(res, 'Authentication succeeded.');
        return;
      });

    });

  });
};

// logout
exports.logout = function (req, res) {
  req.session.destroy(
    _.response.fSendSuccess(res, 'Logout succeeded.'));
};

// whoami
exports.me = function (req, res) {

  var user = req.session.user;

  // add groups to user and send
  var callback = function(error, groups) {
    var data = {
      _id: user._id,
      username: user.username,
      role: user.role,
      description: user.description,
      groups: groups,
    };
    _.response.fSendData(res)(error, data);
  };

  User.fGetGroups(user._id)(callback);

};

// get groups of logged in user
exports.getGroups = function (req, res) {
  var user = req.session.user;
  User.fGetGroups(user._id)(
    _.response.fSendData(res));
};
