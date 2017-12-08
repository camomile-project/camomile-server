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
var SSEChannels = require('../lib/SSEChannels');

var corpusSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: Schema.Types.Mixed,
    'default': ''
  },
  history: [historySchema],
  permissions: {
    type: Schema.Types.Mixed,
    'default': null
  },
}, {usePushEach: true});

corpusSchema.methods.getPermissions = function (callback) {
  return callback(null, this.permissions);
};

corpusSchema.statics.create = function (id_user, data, callback) {

  // check corpus name validity
  if (
    data.name === undefined ||
    data.name === '') {
    callback('Invalid name.', null);
    return;
  }

  var corpus = new this({
    name: data.name,
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

  corpus.permissions.users[id_user] = _.ADMIN;

  corpus.save(function (error, corpus) {

    if (error) {
      if (error.code === 11000) {
        callback('Invalid name (duplicate).', null);
        return;
      }
    } else {
      corpus.history = undefined;
      corpus.permissions = undefined;
      corpus.__v = undefined;
    }

    callback(error, corpus);

  });

};

// SSE Event
corpusSchema.post('save', function(doc) {
  if (doc.history.length > 0) {
    SSEChannels.dispatch('corpus:' + doc._id, {corpus: doc._id, event: {update: Object.keys(doc.history.pop().changes)} });
  }
});

module.exports = mongoose.model('Corpus', corpusSchema);
