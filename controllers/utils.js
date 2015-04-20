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

var async = require('async');
var User = require('../models/User');
var cUser = require('../controllers/User');
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

var getFields = function (model, history) {

  var modelName = model.modelName;

  var fields = '_id';

  if (history === 'on') {
    fields = fields + ' history';
  }

  if (model.modelName === 'User') {
    return fields + ' username role description';
  }

  if (model.modelName === 'Group') {
    return fields + ' name description users';
  }

  if (model.modelName === 'Corpus') {
    return fields + ' name description ACL';
  }

  if (model.modelName === 'Medium') {
    return fields + ' name description url id_corpus';
  }

  if (model.modelName === 'Layer') {
    return fields + ' name description id_corpus fragment_type data_type ACL';
  }

  if (model.modelName === 'Annotation') {
    return fields
  }

  return fields;

};

// check if user have the good right for the resource (corpus or layer)
var checkRights = function (acl, user, groups, min_right) {

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

exports.request.fGetResource = function (req, model) {

  var fields = getFields(model, req.query.history);

  // model = Corpus ==> modelName = Corpus ==> paramName = id_corpus
  var paramName = 'id_' + model.modelName.toLowerCase();

  return function (callback) {
    model.findById(req.params[paramName], callback)
  };

};

exports.request.fGetResources = function (req, model, filter) {

  var fields = getFields(model, req.query.history);

  return function (callback) {
    model.find(filter, fields, callback);
  };

};

exports.request.fFilterResources = function (req, min_right) {

  var id_user = req.session.user._id;

  return function (resources, callback) {

    async.waterfall([
        // get user groups
        cUser.helper.fGetGroups(id_user),
        // filter according to rights
        function (groups, callback) {
          async.filter(
            resources,
            function (resource, callback) {
              callback(checkRights(resource.ACL, id_user, groups,
                min_right));
            },
            function (filtered) {
              callback(null, filtered);
            })
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
        sendError(res, error);
        return;
      }

      if (!resource) {
        sendError(res, model.modelName + ' does not exist.');
        return;
      }

      next();
    });
  };
};

// assume route shaped like this: .../resource/:id_resource/...
// usage: hasRights(READ, Annotation) is a middleware enforcing read access
exports.middleware.fExistsWithRights = function (model, min_right) {

  // Corpus ==> 'id_corpus'
  var id_name = 'id_' + model.modelName.toLowerCase();

  // Annotation ==> Layer
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
  }

  return function (req, res, next) {

    // ------------
    // get resource (or its parent if needed)
    // ------------

    // this function looks for a resource by its id (from the request)
    var _getChildResource = function (callback) {
      model.findById(req.params[id_name], callback);
    };

    var tasks = [_getChildResource];

    if (parentModel !== undefined) {

      // this function looks for the parent of a given resource
      var _getParentResource = function (callback, resource) {
        parentModel.findById(resource[id_parentName], callback);
      };

      tasks.push(_getParentResource);

    }

    var getResource = function (callback) {
      async.waterfall(tasks, callback);
    };

    // ------------
    // 
    // ------------

    async.parallel(
      // find groups and resource in parallel    
      {
        groups: cUser.helper.fGetGroups(req.session.user._id),
        resource: getResource,
      },
      // then combine them 

      function (error, result) {

        if (error) {
          sendError(res, error);
          return;
        }

        if (!result.resource) {
          sendError(res, model.modelName + ' does not exist.');
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
        var acl = result.resource.ACL;

        if (!checkRights(acl, user, groups, min_right)) {
          sendError(res, 'Access denied.');
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
    code = 400;
  }

  res.status(code).json({
    message: error
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
      sendError(error);
      return;
    }
    sendSuccess(res, success);
  };
};

var fSendData = exports.response.fSendData = function (res) {

  return function (error, data) {

    if (error) {
      sendError(res, error);
      return;
    }

    res.status(200).json(data);

  };
};

exports.response.fSendResource = function (res, model) {

  var modelName = model.modelName;

  return function (error, resource) {

    if (error) {
      sendError(res, error);
      return;
    }

    if (modelName === 'Corpus' || modelName === 'Layer') {
      resource.ACL = undefined;
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
      sendError(res, error);
      return;
    }

    // remove ACL attributes
    async.map(
      resources,
      function (item, callback) {

        if (modelName === 'Corpus' || modelName === 'Layer') {
          item.ACL = undefined;
        }
        callback(null, item);
      },
      fSendData(res)
    );

  };
};