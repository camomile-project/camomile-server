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

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Group = require('./Group');


var User = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: Schema.Types.Mixed,
    'default': ''
  },
  role: String,
  salt: String,
  hash: String
}, {
  versionKey: false
});

// User.methods.getGroups = function (callback) {
//   Group.find({
//       users: this._id
//     }, '_id',
//     function (error, groups) {

//       var group_ids = [];

//       if (groups) {
//         for (var i = groups.length - 1; i >= 0; i--) {
//           group_ids.push(groups[i]._id);
//         };
//       }

//       callback(error, group_ids);

//     });
// };

module.exports = mongoose.model('User', User);