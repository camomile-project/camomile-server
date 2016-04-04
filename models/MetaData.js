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

var Schema = mongoose.Schema;

var options = {discriminatorKey: 'type'};
var metadataSchema = new Schema({
    path: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    value: Schema.Types.Mixed
}, options);

/**
 * Create metadata
 *
 * @param modelName
 * @param resource
 * @param metadata
 * @param callback
 */
metadataSchema.statics.create = function (modelName, resource, metadata) {
    var deferred = Q.defer();
    var tree = this.constructTreeSchema(metadata);
    var model = this.getModelByName(modelName);
    var models = [];

    if (model === false) {
        return Q.reject('Model not found');
    }

    tree.forEach(function(item) {
        item[modelName] = resource;
        models.push(model.findOneAndUpdate.bind(model, {path: item.path}, item, {upsert: true}));
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

    key = ',' + key.replace(/\./g,',');
    var model = this.getModelByName(modelName);

    if (model === false) {
        return Q.reject({code: 400, msg: 'Model not found.'});
    }

    var object = {};
    model.find({path: new RegExp('^' + key)}, function(err, docs) {
        if (err) {
            deferred.reject(err);
        } else {
            object = t.buildTreeWithDocs(key, docs);
            if (_.isEmpty(object)) {
                deferred.reject({code: 404, msg: 'Metadata does not exist.'});
            } else {
                deferred.resolve(object);
            }
        }
    });

    return deferred.promise;
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
metadataSchema.statics.constructTreeSchema = function (metadata, parent_path, parent_tree) {
    var t = this;

    var tree = parent_tree || [];
    parent_path = parent_path || '';

    Object.keys(metadata).forEach (function(key) {
        // TODO: check if file
        if (_.isObject(metadata[key]) && !_.isArray(metadata[key])) {
            t.constructTreeSchema(metadata[key], parent_path + ',' + key, tree);
        } else {
            tree.push({
                path: parent_path + ',' + key,
                value: metadata[key]
            });
        }
    });

    return tree;
};

/**
 * Build object with docs collection
 *
 * @param {array} docs
 * @param {object} object
 */
metadataSchema.statics.buildTreeWithDocs = function (request_key, docs) {
    var object;

    // TODO: check if file
    if (docs.length == 1) {
        object = docs[0].value;
    } else {
        object = {};

        docs.forEach(function (item) {
            var path = item.path.replace(request_key, '');
            var keys = path.split(',');
            keys.shift();

            var accessor = object;
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (accessor[key] === undefined) {
                    if (i === (keys.length - 1)) {
                        accessor[key] = item.value;
                    } else {
                        accessor[key] = {};
                    }
                }

                accessor = accessor[key];
            }
        });
    }

    return object;
};

/**
 * Get Mongoose Model with mode name
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
}

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

