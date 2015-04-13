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
var Group = require('../models/Group');
var Corpus = require('../models/Corpus');
var Medium = require('../models/Medium');
var Layer = require('../models/Layer');
var Annotation = require('../models/Annotation');
var Queue = require('../models/Queue');

// ----------------------------------------------------------------------------
// MIDDLEWARES
// ----------------------------------------------------------------------------

// exists(Corpus) === exists(Corpus, 'id_corpus') !== exists(Corpus, 'id')
// exists(Medium) === exists(Medium, 'id_medium') !== exists(Medium, 'id')

exports.exists = function(model, paramName) {
    return function(req, res, next) {

        if (paramName === undefined) { 
            // model = Corpus ==> modelName = Corpus ==> paramName = id_corpus
            paramName = 'id_' + model.modelName.toLowerCase(); 
        }
        model.findById(req.params[paramName], function(error, resource) {
            if (error || !resource) {
                res.status(400)
                   .json({message: model.modelName + ' does not exist.'});
            }
        })
    };
};

exports.READ = 1;
exports.WRITE = 2;
exports.ADMIN = 3;

// check if user have the good right for the resource (corpus or layer)
exports.checkRights = function (resource, user, groups, minRight) {

  // root is omnipotent
  if (user.username == "root") { return true; }

  // check if user was granted right directly
  if (resource.ACL.users && 
    user._id in resource.ACL.users && 
    resource.ACL.users[user._id] >= minRight ) {
    return true;
  }

  // check if user was granted right through its group membership
  if (resource.ACL.groups) {
    for (var i = groups.length - 1; i >= 0; i--) {
      if (groups[i]._id in resource.ACL.groups &&
          resource.ACL.groups[groups[i]._id] >= minRight) {
        return true;
      }
    };
  }

  return false;

}

exports.date = function (req, res) {
    var date = new Date();
    res.status(200).json({date:date});
}


/*

var mimeTypes = {
    ".swf": "application/x-shockwave-flash",
    ".flv": "video/x-flv",
    ".f4v": "video/mp4",
    ".f4p": "video/mp4",
    ".mp4": "video/mp4",
    ".asf": "video/x-ms-asf",
    ".asr": "video/x-ms-asf",
    ".asx": "video/x-ms-asf",
    ".avi": "video/x-msvideo",
    ".mpa": "video/mpeg",
    ".mpe": "video/mpeg",
    ".mpeg": "video/mpeg",
    ".mpg": "video/mpeg",
    ".mpv2": "video/mpeg",
    ".mov": "video/quicktime",
    ".movie": "video/x-sgi-movie",
    ".mp2": "video/mpeg",
    ".qt": "video/quicktime",
    ".mp3": "audio/mpeg",
    ".wav": "audio/x-wav",
    ".aif": "audio/x-aiff",
    ".aifc": "audio/x-aiff",
    ".aiff": "audio/x-aiff",
    ".jpe": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png" : "image/png",
    ".svg": "image/svg+xml",
    ".tif": "image/tiff",
    ".tiff": "image/tiff",
    ".gif": "image/gif",
    ".txt": "text/plain",
    ".xml": "text/xml",
    ".css": "text/css",
    ".htm": "text/html",
    ".html": "text/html",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".vcf": "text/x-vcard",
    ".vrml": "x-world/x-vrml",
    ".zip": "application/zip",
    ".webm": "video/webm",
    ".m3u8": "application/x-mpegurl",
    ".ts": "video/mp2t",
    ".ogg": "video/ogg"
};

exports.getMineType = function (filePath) {
    var fileMIME = filePath.split('.').pop();
    var tmpMine = "." + fileMIME;
    fileMIME = mimeTypes[tmpMine];
    return fileMIME;
};
*/
