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

var queueSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: Schema.Types.Mixed,
    'default': ''
  },
  permissions: {
    type: Schema.Types.Mixed,
    'default': null
  },
  list: [Schema.Types.Mixed]
}, {usePushEach: true});

queueSchema.methods.getPermissions = function (callback) {
  return callback(null, this.permissions);
};

queueSchema.statics.create = function (id_user, data, callback) {

  if (
    data.name === undefined ||
    data.name === '') {
    callback('Invalid name', null);
    return;
  }

  var queue = new this({
    name: data.name,
    description: data.description,
    permissions: {
      users: {},
      groups: {},
    },
    list: [],
  });

  queue.permissions.users[id_user] = _.ADMIN;

  queue.save(function (error, queue) {
    if (!error) {
      queue.permissions = undefined;
      queue.__v = undefined;
    }
    callback(error, queue);
  });

};

module.exports = mongoose.model('Queue', queueSchema);
