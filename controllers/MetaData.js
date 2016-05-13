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

var _ = require('../controllers/utils');
var u = require('underscore');

var Metadata = require('../models/MetaData').Metadata;

// get metadata
exports.get = function (req, res) {
    _.request.fGetResource(req, req.current_resource)(function(error, resource) {
        if (error) {
            res.status(404).json({
                error: error
            });
            return;
        }

        Metadata.getByKey(
            req.current_resource.modelName,
            resource,
            req.params['key'] || '.'
        ).then(function(object) {
            if (u.isObject(object) && object.type && object.type === 'file') {
                var pathInfos = Metadata.generateFilePath(object.token, object.filename, req.app.get('upload'));
                if (!u.isUndefined(req.query['file'])) {
                    res
                        .sendFile(pathInfos.fullPath, function(error) {
                            if (error) {
                                res.status(error.status).end();
                            }
                        });
                } else {
                    delete object.token;
                    Metadata
                        .getEncodedFile(pathInfos.fullPath)
                        .then(function(encodedFile) {
                            object.data = encodedFile;
                            res.status(200).json(object);
                        }, function(error) {
                            res.status(400).send({error: error});
                        });
                }
            } else {
                res.status(200).json(object);
            }
        }, function(error) {
            if (error.code !== undefined) {
                res.status(error.code).send({error: error.msg});
            } else {
                res.status(400).send({error: error});
            }
        });
    });
};


// Create or update MetaData
exports.save = function (req, res) {
    _.request.fGetResource(req, req.current_resource)(function(error, resource) {
        if (error) {
            res.status(404).json({
                error: error
            });
            return;
        }

        Metadata.create(
            req.current_resource.modelName,
            resource,
            req.body,
            req.app.get('upload')
        ).then(function() {
            res.status(201).send({success: "Successfully created."});
        }, function(error) {
            res.status(400).send({error: error});
        });
    });
};

exports.remove = function(req, res) {
    _.request.fGetResource(req, req.current_resource)(function(error, resource) {
        if (error) {
            res.status(404).json({
                error: error
            });
            return;
        }

        Metadata.removeByKey(
            req.current_resource.modelName,
            resource,
            req.params['key']
        ).then(function() {
            res.status(200).send({success: "Successfully deleted."});
        }, function(error) {
            res.status(400).send({error: error});

        });
    });
};