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

var layerSchema = Schema({
  id_corpus: {
    type: Schema.Types.ObjectId,
    ref: 'CorpusSchema'
  },
  name: {
    type: String,
    lowercase: true,
    trim: true,
    required: true
  },
  description: {
    type: Schema.Types.Mixed,
    'default': ''
  },
  fragment_type: {
    type: Schema.Types.Mixed,
    'default': ''
  },
  data_type: {
    type: Schema.Types.Mixed,
    'default': ''
  },
  history: [historySchema],
  permissions: {
    type: Schema.Types.Mixed,
    'default': null
  },
});

layerSchema.methods.getPermissions = function (callback) {
  return callback(null, this.permissions);
};

layerSchema.statics.create = function (id_user, id_corpus, data, callback) {

  if (
    data.name === undefined ||
    data.name === '') {
    callback('Invalid name.', null);
    return;
  }

  if (data.fragment_type === undefined) {
    callback('Invalid fragment type.', null);
    return;
  }

  if (data.data_type === undefined) {
    callback('Invalid data type.', null);
    return;
  }

  var layer = new this({
    id_corpus: id_corpus,
    name: data.name,
    description: data.description,
    fragment_type: data.fragment_type,
    data_type: data.data_type,
    history: [{
      date: new Date(),
      id_user: id_user,
      changes: {
        //   name: data.name,
        //   description: data.description
      }
    }],
    permissions: {
      users: {},
      groups: {}
    }
  });

  layer.permissions.users[id_user] = _.ADMIN;

  layer.save(function (error, layer) {
    if (!error) {
      layer.history = undefined;
      layer.permissions = undefined;
      layer.__v = undefined;
      SSEChannels.dispatch('corpus:' + id_corpus, { corpus: id_corpus, event: {add_layer: layer._id} });
    }
    callback(error, layer);
  });
};

layerSchema.statics.removeWithEvent = function(datas, callback) {
  var t = this;

  t.findById(datas._id, function(err, layer) {
    t.remove(datas, function(err) {
      if (err) {
        callback(err);
        return;
      }

      SSEChannels.dispatch('corpus:' + layer.id_corpus, { corpus: layer.id_corpus, event: {delete_layer: layer._id} });
    });
  });
};

module.exports = mongoose.model('Layer', layerSchema);