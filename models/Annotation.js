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

var Schema = mongoose.Schema;
var historySchema = require('./History');

var annotationSchema = new Schema({
  id_layer: {
    type: Schema.Types.ObjectId,
    ref: 'Layer'
  },
  id_medium: {
    type: Schema.Types.ObjectId,
    ref: 'Medium'
  },
  fragment: {
    type: Schema.Types.Mixed,
    index: true,
    'default': ''
  },
  data: {
    type: Schema.Types.Mixed,
    'default': ''
  },
  history: [historySchema]
});

annotationSchema.methods.getPermissions = function (callback) {
  return this.model('Layer').findById(
    this.id_layer,
    function (error, layer) {
      if (error) {
        callback(error, {
          users: {},
          groups: {}
        });
      } else {
        callback(error, layer.ACL);
      }
    });
};

annotationSchema.statics.create = function (id_user, id_layer, data,
  callback) {

  // TODO: check validity

  var annotation = new this({
    fragment: data.fragment,
    data: data.data,
    id_layer: id_layer,
    id_medium: data.id_medium,
    history: [{
      date: new Date(),
      id_user: id_user,
      changes: {
        fragment: data.fragment,
        data: data.data
      }
    }]
  });

  annotation.save(function (error, annotation) {
    if (!error) {
      annotation.history = undefined;
      annotation.__v = undefined;
    }
    callback(error, annotation);
  });

};

module.exports = mongoose.model('Annotation', annotationSchema);