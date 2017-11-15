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
var User = require('../models/User');
var Group = require('../models/Group');
var Corpus = require('../models/Corpus');
var Medium = require('../models/Medium');
var Layer = require('../models/Layer');
var Annotation = require('../models/Annotation');
var Queue = require('../models/Queue');

// ----------------------------------------------------------------------------
// VARIABLES
// ----------------------------------------------------------------------------

exports.READ = 1;
exports.WRITE = 2;
exports.ADMIN = 3;

// ----------------------------------------------------------------------------
// HELPER
// ----------------------------------------------------------------------------

var getFields = function (model, history, extra_fields) {

  var modelName = model.modelName;

  var fields = '_id';

  if (history === 'on') {
    fields = fields + ' history';
  }

  if (extra_fields !== undefined) {
    fields = fields + ' ' + extra_fields;
  }

  if (model.modelName === 'User') {
    return fields + ' username role description';
  }

  if (model.modelName === 'Group') {
    return fields + ' name description users';
  }

  if (model.modelName === 'Corpus') {
    return fields + ' name description permissions';
  }

  if (model.modelName === 'Medium') {
    return fields + ' name description url id_corpus';
  }

  if (model.modelName === 'Layer') {
    return fields + ' name description id_corpus fragment_type data_type permissions';
  }

  if (model.modelName === 'Annotation') {
    return fields + ' id_layer id_medium fragment data';
  }

  if (model.modelName === 'Queue') {
    return fields + ' name description permissions';
  }

  return fields;

};

// check if user have the good right for the resource (corpus or layer)
var hasPermission = function (acl, user, groups, min_right) {

  // check if user was granted right directly
  if (acl.users && (user in acl.users) && (acl.users[user] >= min_right)) {
    return true;
  }

  // check if user was granted right through its group membership
  if (acl.groups) {
    for (var i = groups.length - 1; i >= 0; i--) {
      if (groups[i] in acl.groups &&
        acl.groups[groups[i]] >= min_right) {
        return true;
      }
    };
  }

  return false;

};

// ----------------------------------------------------------------------------
// REQUEST
// ----------------------------------------------------------------------------

exports.request = {};

exports.request.fGetResource = function (req, model, extra_fields) {

  var fields = getFields(model, req.query.history, extra_fields);

  // model = Corpus ==> modelName = Corpus ==> paramName = id_corpus
  var paramName = 'id_' + model.modelName.toLowerCase();

  return function (callback) {
    model.findById(req.params[paramName], fields, callback)
  };

};

exports.request.fGetResources = function (req, model, filter, extra_fields) {

  var fields = getFields(model, req.query.history, extra_fields);

  return function (callback) {
    model.find(filter, fields, callback);
  };

};

exports.request.fCountResources = function (req, model, filter) {

  return function (callback) {
    model.count(filter, callback);
  };

};

// returns a function that filters a list of resources
// based on current user's permission (min_right)
exports.request.fFilterResources = function (req, min_right) {

  // special treatment for (omnipotent) root user
  if (req.session.user.username === 'root') {
    return function (resources, callback) {
      callback(null, resources);
    };
  }

  var id_user = req.session.user._id;

  return function (resources, callback) {

    async.waterfall([

        // get user groups
        User.fGetGroups(id_user),

        // filter according to rights
        function (groups, callback) {
          async.filter(
            resources,

            // check if current user has enough permission
            // on given resource and callback the answer...
            function (resource, callback) {
              resource.getPermissions(
                function (error, permissions) {
                  if (error) {
                    callback(false);
                  } else {
                    callback(hasPermission(permissions, id_user, groups, min_right));
                  }
                }
              );
            },

            // remove other users' and groups' permissions
            function (filtered_resources) {
              var returned_resources = [];

              // for each resources that passed the permission test
              for (var r = 0; r < filtered_resources.length; r++) {

                // get the resource
                var resource = filtered_resources[r];

                if (!('permissions' in resource)) {
                  returned_resources.push(resource);
                  continue;
                }

                // update users permission dictionary to only contain
                // permission of current user
                if ('users' in resource.permissions) {
                  var users_permissions = {};
                  if (id_user in resource.permissions.users) {
                    users_permissions[id_user] = resource.permissions.users[id_user];
                  }
                  resource.permissions.users = users_permissions;
                }

                // update groups permission dictionary to only contain
                // permissions of current user's groups
                if ('groups' in resource.permissions) {
                  var groups_permissions = {};
                  for (var g = 0; g < groups.length; g++) {
                    var group = groups[g];
                    if (group in resource.permissions.groups) {
                      groups_permissions[group] = resource.permissions.groups[group];
                    }
                  } // END loop on groups
                  resource.permissions.groups = groups_permissions;
                }

                returned_resources.push(resource);

              } // END loop on resources

              callback(null, returned_resources);
            });  // END filter
        }
      ],
      callback);
  };

};

// ----------------------------------------------------------------------------
// MIDDLEWARES
// ----------------------------------------------------------------------------

exports.middleware = {};

// exists(Corpus) === exists(Corpus, 'id_corpus') !== exists(Corpus, 'id')
// exists(Medium) === exists(Medium, 'id_medium') !== exists(Medium, 'id')

exports.middleware.fExists = function (model) {

  var paramName = 'id_' + model.modelName.toLowerCase();

  return function (req, res, next) {

    model.findById(req.params[paramName], function (error, resource) {

      if (error) {
        sendError(res, error, 500);
        return;
      }

      if (!resource) {
        sendError(res, model.modelName + ' does not exist.', 404);
        return;
      }

      next();
    });
  };
};

// assume route shaped like this: .../resource/:id_resource/...
// usage: hasRights(READ, Annotation) is a middleware enforcing read access
exports.middleware.fExistsWithRights = function (model, min_right) {
  /*  // Annotation ==> Layer
  var parentModel;
  if (model.modelName === 'Annotation') {
    parentModel = Layer;
  }
  if (model.modelName === 'Medium') {
    parentModel = Corpus;
  }

  // Annotation ==> 'id_layer'
  var id_parentName = '';
  if (parentModel !== undefined) {
    id_parentName = 'id_' + parentModel.modelName.toLowerCase();
  }*/

  return function (req, res, next) {
    var id_name;

    // Used for standardized routing permissions (e.g: Metadata)
    if (req.params['resource_type']) {
      if (req.params['resource_type'] == 'corpus') {
        model = Corpus;
      } else if (req.params['resource_type'] == 'medium') {
        model = Medium;
      } else if (req.params['resource_type'] == 'layer') {
        model = Layer;
      } else if (req.params['resource_type'] == 'queue') {
        model = Queue;
      } else {
        sendError(res, 'Incorrect resource type.', 400);
        return;
      }

      req.current_resource = model;
      id_name = 'resource_id';
      req.params['id_' + model.modelName.toLowerCase()] = req.params[id_name];
    } else {
      id_name = 'id_' + model.modelName.toLowerCase();
    }

    var getResourcePermissions = function (callback) {
      model.findById(
        req.params[id_name],
        function (error, resource) {

          if (error) {
            callback(error, null);
            return;
          }

          if (!resource) {
            callback(model.modelName + ' does not exist.', null);
            return;
          }

          resource.getPermissions(callback);

        });
    };

    async.parallel(
      // find groups and resource in parallel
      {
        groups: User.fGetGroups(req.session.user._id),
        permissions: getResourcePermissions,
      },

      // then combine them
      function (error, result) {

        if (error) {
          sendError(res, error, 500);
          return;
        }

        // root is omnipotent
        if (req.session.user.username === "root") {
          next();
          return;
        }

        // otherwise check for rights
        var user = req.session.user._id;
        var groups = result.groups;
        var permissions = result.permissions;

        if (!hasPermission(permissions, user, groups, min_right)) {
          sendError(res, 'Access denied.', 403);
          return;
        }

        next();

      }
    );
  };
};

// ----------------------------------------------------------------------------
// ROUTES
// ----------------------------------------------------------------------------

exports.route = {};

exports.route.date = function (req, res) {
  var date = new Date();
  res.status(200).json({
    date: date
  });
}

// ----------------------------------------------------------------------------
// RESPONSE
// ----------------------------------------------------------------------------

exports.response = {};

var sendError = exports.response.sendError = function (res, error, code) {

  if (code === undefined) {
    code = 500;
  }

  res.status(code).json({
    error: error
  });

};

var sendSuccess = exports.response.sendSuccess = function (res, success) {
  res.status(200).json({
    success: success
  });
};

exports.response.fSendSuccess = function (res, success) {
  return function (error) {
    if (error) {
      sendError(res, error, 500);
      return;
    }
    sendSuccess(res, success);
  };
};

var fSendData = exports.response.fSendData = function (res) {

  return function (error, data) {

    if (error) {
      sendError(res, error, 500);
      return;
    }

    res.status(200).json(data);

  };
};

exports.response.fSendResource = function (res, model) {

  var modelName = model.modelName;

  return function (error, resource) {

    if (error) {
      sendError(res, error, 500);
      return;
    }

    if (modelName === 'Corpus' || modelName === 'Layer') {
      resource.permissions = undefined;
    } else if (modelName === 'User') {
      resource.salt = resource.hash = undefined;
    }

    res.status(200).json(resource);

  };
};

exports.response.fSendResources = function (res, model) {

  var modelName = model.modelName;

  return function (error, resources) {

    if (error) {
      sendError(res, error, 500);
      return;
    }
    fSendData(res)(null, resources)
  };
};
