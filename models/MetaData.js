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

metadataSchema.statics.create = function (modelName, resource, metadata, callback) {

    var tree = this.constructTree(metadata);
    var models = [];

    if (modelName == 'corpus') {
        model = CorpusMetadata;
    } else if(modelName == 'layer') {
        model = LayerMetadata;
    } else if(modelName == 'medium') {
        model = MediumMetadata;
    } else {
        callback('Model not found.');
        return;
    }

    tree.forEach(function(item) {
        item[modelName] = resource;
        models.push(model.findOneAndUpdate.bind(model, {path: item.path}, item, {upsert: true}));
    });

    async.parallel(models, function(error, result) {
        callback(error, result);
    });
};



metadataSchema.buildObject = function(modelName, resource, key, callback) {
    callback(null, {});
};

metadataSchema.statics.constructTree = function (metadata, parent_path, parent_tree) {
    var t = this;

    var tree = parent_tree || [];
    parent_path = parent_path || '';

    Object.keys(metadata).forEach (function(key) {
        // TODO: check if file
        if (_.isObject(metadata[key]) && !_.isArray(metadata[key])) {
            parent_path += ',' + key;
            t.constructTree(metadata[key], parent_path, tree);
        } else {
            tree.push({
                path: parent_path + ',' + key,
                value: metadata[key]
            });
        }
    });

    return tree;
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

