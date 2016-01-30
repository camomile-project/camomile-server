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

var mongoose = require('mongoose');
var _ = require('../controllers/utils');

var Schema = mongoose.Schema;
var historySchema = require('./History');

var MetadataSchema = new Schema({
  owner: [{
    type: Schema.Types.ObjectId
    //ref: 'User'
  }],
  description: {
    type: Schema.Types.Mixed,
    'default': ''
  },
  history: [historySchema],
  permissions: {
    type: Schema.Types.Mixed,
    'default': null
  }
  
});
MetadataSchema.methods.getPermissions = function (callback) {
  return callback(null, this.permissions);
};

MetadataSchema.statics.create = function (id_user, data, callback) {

  // check corpus name validity
  if (
    data.name === undefined ||
    data.name === '') {
    callback('Invalid name.', null);
    return;
  }

  var metadata = new this({
    owner: data.id_owner,
    description: data.description,
    history: [{
      date: new Date(),
      id_user: id_user,
      changes: {
        name: data.name,
        description: data.description
      }
    }],
    permissions: {
      users: {},
      groups: {},
    }
  });

  metadata.permissions.users[id_user] = _.ADMIN;
 
  metadata.save(function (error, metadata) {

    if (error) {
      if (error.code === 11000) {
        callback('Invalid name (duplicate).', null);
        return;
      }
    } else {
      metadata.history = undefined;
      metadata.permissions = undefined;
      metadata.__v = undefined;
    }

    callback(error, metadata);

  });

};

module.exports = mongoose.model('Metadata', MetadataSchema);
