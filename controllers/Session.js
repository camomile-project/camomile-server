/*
The MIT License (MIT)

Copyright (c) 2013-2014 CNRS

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

var User = require('../models/User');
var crypto = require('crypto');

// ----------------------------------------------------------------------------
// CRYPTOGRAPHY
// ----------------------------------------------------------------------------

var KEYLEN = 128;
var ITERATIONS = 12000;
// var DIGEST = 'sha1'; 

// Get password hash using provided salt
var getHash = function(password, salt, callback) {
  // password: user password
  // salt: user salt
  // callback: function(error, hash)

  try {

    crypto.pbkdf2(password, salt, ITERATIONS, KEYLEN, function (error, buffer) {
      var hash = buffer.toString('base64');
      callback(error, hash);
    });
  }
  catch(error) {
    callback(error);
  }

};

// Get password hash using random salt
exports.generateSaltAndHash = function (password, callback) {
  // password: user password
  // callback: function(error, salt, hash)

  crypto.randomBytes(KEYLEN, function (error, buffer) {
    if (error) {
      callback(error); 
    } else {
      var salt = buffer.toString('base64');
      getHash(password, salt, function(error, hash) {
        callback(error, salt, hash);
      });
    }
  });
};

// ----------------------------------------------------------------------------
// MIDDLEWARES
// ----------------------------------------------------------------------------

// user is logged in?
exports.isLoggedIn = function (req, res, next) {
  if (!req.session.user) {
    res.status(401)
       .json({message: "Access denied."});
  } else {
    next();
  }
};

// user has admin privileged?
exports.isAdmin = function (req, res, next) {
  if (req.session.user.role !== "admin") {
    res.status(401)
       .json({message: "Access denied (admin only)."});
  } else {
    next();
  }
};

// user is root?
exports.isRoot = function (req, res, next) {
  if (req.session.user.username !== "root") {
    res.status(401)
       .json({message: "Access denied (root only)."});
  } else {
    next();
  }
};

// ----------------------------------------------------------------------------
// ROUTES
// ----------------------------------------------------------------------------

// Login
exports.login = function (req, res) {
  
  var failure = {message: 'Authentication failed (check your username and password).'}

  // check that both username and password are defined
  if (req.body.username === undefined || 
      req.body.password === undefined)
  {
    res.status(400).json(failure); 
  } else {

    // find user by its name
    User.findOne({username: req.body.username}, function (error, user) {
      
      // if error or user does not exist, report authentication failure
      if (error || !user) { res.status(400).json(failure); } 
      else {

        // generate hash from password and salt and compare it to stored hash
        getHash(req.body.password, user.salt, function(error, hash) {
          if (error || user.hash !== hash) {
            res.status(400).json(failure);
          } else {
            // if hash is correct, success!
            req.session.regenerate(function() {
              req.session.user = user;
              res.status(200)
                 .json({message: 'Authentication succeeded.'});            
            });
          }
        });
      }
    });
  }
};

// logout
exports.logout = function (req, res) {
  req.session.destroy(function () {
    res.status(200)
       .json({message: 'Logout succeeded.'});
  });
};

// to now who is logged in
exports.me = function (req, res) {
  res.status(200)
     .json({_id: req.session.user._id,
            username: req.session.user.username,
            role: req.session.user.role,
            description: req.session.user.description});
};

