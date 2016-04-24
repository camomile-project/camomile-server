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
var _ = require('underscore');
var async = require('async');
var Q = require('q');
var fs = require('node-fs');
var path = require('path');
var crypto = require('crypto');

var Schema = mongoose.Schema;

var options = {discriminatorKey: 'kind'};
var metadataSchema = Schema({
    type: String,
    path: {
        type: String,
        required: true,
        trim: true
    },
    value: Schema.Types.Mixed,
    keys: [String]
}, options);

metadataSchema.index({type: 1, path: 1, kind: 1, corpus: 1}, {sparse: true});
metadataSchema.index({type: 1, path: 1, kind: 1, layer: 1}, {sparse: true});
metadataSchema.index({type: 1, path: 1, kind: 1, medium: 1}, {sparse: true});

/**
 * Create metadata
 *
 * @param modelName
 * @param resource
 * @param metadata
 * @param callback
 */
metadataSchema.statics.create = function (modelName, resource, metadata, upload_dir) {
    var deferred = Q.defer();
    var tree = this.constructTreeSchema(metadata, upload_dir);
    var model = this.getModelByName(modelName);
    var models = [];

    if (model === false) {
        return Q.reject('Model not found');
    }
    
    tree.forEach(function(item) {
        item[modelName.toLowerCase()] = resource;
        var query = {
            type: item.type,
            path: item.path
        };
        query[modelName.toLowerCase()] = resource;
        models.push(model.update.bind(model, query, item, {upsert: true}));
    });

    async.parallel(models, function(error, result) {
        if (error) {
            deferred.reject(error);
        } else {
            deferred.resolve(result);
        }
    });

    return deferred.promise;
};


/**
 * Get metadatas by key
 *
 * @param modelName
 * @param resource
 * @param key
 *
 * @returns {*|promise}
 */
metadataSchema.statics.getByKey = function(modelName, resource, key) {
    var deferred = Q.defer();
    var t = this;
    var model,
        object = {},
        returnKeys = false;

    key = ',' + key.replace(/\./g,',');
    model = this.getModelByName(modelName);

    if (model === false) {
        return Q.reject({code: 400, msg: 'Model not found.'});
    }

    var query = {};
    query[modelName.toLowerCase()] = resource;
    if (key.slice(-1) === ',' || key === ',') {
        returnKeys = true;
        key = key.slice(0, -1);
        query.type = 'keys';
        query.path = key;//new RegExp('^' + key + '$');
    } else {
        query.type = 'data';
        query.path = new RegExp('^' + key + ',');
    }

    model.find(query, function(err, docs) {
        if (err) {
            deferred.reject(err);
        } else if (docs.length === 0) {
            deferred.reject({code: 404, msg: 'Metadata does not exist.'});
        } else {
            if (returnKeys) {
                deferred.resolve(docs[0].keys);
            } else {
                object = t.buildTreeWithDocs(key, docs, modelName.toLowerCase(), resource._id);
                deferred.resolve(object);
            }
        }
    });

    return deferred.promise;
};

/**
 * Remove metadata by key
 *
 * @param modelName
 * @param resource
 * @param key
 * @returns {*}
 */
metadataSchema.statics.removeByKey = function(modelName, resource, key) {
    var deferred = Q.defer();
    var model;

    key = ',' + key.replace(/\./g,',');
    model = this.getModelByName(modelName);

    var removeDatasFind = {};
    removeDatasFind[modelName.toLowerCase()] = resource;
    removeDatasFind['path'] = new RegExp('^' + key + ',');

    var removeKeysFind = {};
    removeKeysFind[modelName.toLowerCase()] = resource;
    removeKeysFind['type'] = 'keys';
    removeKeysFind['path'] = key;

    var keys = key.split(',');
    var current_key = keys.pop(), parent_key = keys.join(',') || ',';

    var updateRootKeysFind = {};
    updateRootKeysFind[modelName.toLowerCase()] = resource;
    updateRootKeysFind['type'] = 'keys';
    updateRootKeysFind['path'] = parent_key;

    Q(model.remove(removeDatasFind).exec())
        .then(Q(model.remove(removeKeysFind).exec()))
        .then(Q(model.update(updateRootKeysFind, {$pull: { keys: current_key }}).exec()))
        .then(function() {
            return deferred.resolve();
        }, function(error) {
            return deferred.reject(error);
        });


    return deferred.promise;
};

/**
 * Remove all metadata by resource
 *
 * @param modelName
 * @param resource
 * @param key
 * @returns {*}
 */
metadataSchema.statics.removeByResource = function(modelName, id , callback) {
    var model = this.getModelByName(modelName);
    var removeDatasFind = {};
    removeDatasFind[modelName.toLowerCase()] = id;

    return model.remove(removeDatasFind, callback);
};

/**
 * Construct tree schema with metadata object
 *
 * @param metadata
 * @param parent_path
 * @param parent_tree
 *
 * @returns {*|Array}
 */
metadataSchema.statics.constructTreeSchema = function (metadata, upload_dir,  parent_path, parent_tree) {
    var t = this;

    var tree = parent_tree || [];
    parent_path = parent_path || '';

    var keys = Object.keys(metadata);
    keys.forEach (function(key) {
        if (t.isFileObject(metadata[key])) {
            var data = t.saveFile(metadata[key], upload_dir);
            tree.push({
                type: 'data',
                path: parent_path + ',' + key + ',',
                value: data
            });
        } else if (_.isObject(metadata[key]) && !_.isArray(metadata[key])) {
            t.constructTreeSchema(metadata[key], upload_dir, parent_path + ',' + key, tree);
        } else {
            tree.push({
                type: 'data',
                path: parent_path + ',' + key + ',',
                value: metadata[key]
            });
        }
    });

    tree.push({
        type: 'keys',
        path: (parent_path || ','),
        $addToSet: { keys: { $each: keys } }
    });

    return tree;
};

/**
 * Build object with docs collection
 *
 * @param request_key
 * @param docs
 *
 * @returns {*}
 */
metadataSchema.statics.buildTreeWithDocs = function (request_key, docs, modelName, id) {
    var object;

    if (docs.length == 1 && !_.isArray(docs[0].value)) {
        object = constructResponse(request_key, docs[0].value, true);
    } else {
        object = {};

        docs.forEach(function (item) {
            var path = item.path.replace(request_key, '');
            path = path.slice(0, -1);
            var keys = path.split(',');
            keys.shift();

            var accessor = object;
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (accessor[key] === undefined) {
                    if (i === (keys.length - 1)) {
                        accessor[key] = constructResponse(item.path, item.value);
                    } else {
                        accessor[key] = {};
                    }
                }

                accessor = accessor[key];
            }
        });
    }

    function constructResponse(key, value, with_token) {
        if (_.isObject(value) && value.type && value.type === 'file') {
            if (value.token && value.filename) {
                var object = {
                    type: 'file',
                    filename: value.filename,
                    url: ['', modelName, id, 'metadata', key.replace(/\,/g,'.').slice(1, -1)].join('/')
                };

                if (with_token === true) {
                    object.token = value.token;
                }
                return object;
            }
        }

        return value;
    }

    return object;
};

/**
 * Get Mongoose Model with name
 *
 * @param {string} modelName
 *
 * @returns {boolean}
 */
metadataSchema.statics.getModelByName = function(modelName) {
    modelName = modelName.toLowerCase();

    var model = false;

    if (modelName == 'corpus') {
        model = CorpusMetadata;
    } else if(modelName == 'layer') {
        model = LayerMetadata;
    } else if(modelName == 'medium') {
        model = MediumMetadata;
    }

    return model;
};

/**
 * Check file object
 *
 * @param {object} object
 *
 * @returns {boolean}
 */
metadataSchema.statics.isFileObject = function(object) {
    if (object.type && object.type === 'file') {
        if (object.data && object.filename) {
            return true;
        }
    }

    return false;
};

/**
 *
 * @param token
 * @param filename
 * @param upload_dir
 *
 * @returns {{rootPath: string, filename: (string|*), fullPath: *}}
 */
metadataSchema.statics.generateFilePath = function (token, filename, upload_dir) {
    var rootPath = path.join(upload_dir, token.substr(0,4).split('').join('/'));
    filename = token.substr(4,8) + '_' + filename;

    return {
        rootPath: rootPath,
        filename: filename,
        fullPath: path.join(rootPath, filename)
    };
};

/**
 *
 * @param object
 * @param upload_dir
 * @returns {*}
 */
metadataSchema.statics.saveFile = function(object, upload_dir) {
    if (!this.isFileObject(object)) {
        return false;
    }

    var buffer = new Buffer(object.data, 'base64');
    var pWrite = Q.denodeify(fs.writeFile);
    var pMkdir = Q.denodeify(fs.mkdir);

    var shasum = crypto.createHash('sha1');
    var token = shasum.update(buffer.toString('binary')).digest('hex');
    var filePath = this.generateFilePath(token, object.filename, upload_dir);

    pMkdir(filePath.rootPath, 0755, true)
        .then(function() {
            return pWrite(filePath.fullPath, buffer);
        })
        .then(function pWriteSuccess() {
            console.log('File created in ' + filePath.fullPath);
        }, function(error) {
            console.log(error);
        });

    return {
        type: 'file',
        filename: object.filename,
        size: buffer.length,
        token: token
    };
};

var Metadata = mongoose.model('Metadata', metadataSchema);

var CorpusMetadata = Metadata.discriminator('CorpusMetadata',
    new mongoose.Schema({corpus: {type: mongoose.Schema.Types.ObjectId, ref: 'Corpus'}}, options));

var MediumMetadata = Metadata.discriminator('MediumMetadata',
    new mongoose.Schema({medium: {type: mongoose.Schema.Types.ObjectId, ref: 'Medium'}}, options));

var LayerMetadata = Metadata.discriminator('LayerMetadata',
    new mongoose.Schema({layer: {type: mongoose.Schema.Types.ObjectId, ref: 'Layer'}}, options));

module.exports = {
    Metadata: Metadata,
    CorpusMetadata: CorpusMetadata,
    MediumMetadata: MediumMetadata,
    LayerMetadata: LayerMetadata
};

