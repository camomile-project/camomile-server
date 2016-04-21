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

var sseChannel = require('../lib/SSEChannels');

exports.post = function(req, res) {
    var channelId = sseChannel.getAvailableChannel();
    if (channelId === false) {
        res.status(404).json({error: 'No channel available'});
    } else {
        res.status(201).json({channel_id: channelId});
    }
};

exports.get = function(req, res) {
    if (!sseChannel.initializeChannel(req, res, req.params.channel_id)) {
        res.status(404).json({error: 'Channel not found'});
        return;
    }
};

exports.subscribe = function(req, res) {
    res.status(201).json('Not implementend');
};

exports.unsubscribe = function(req, res) {
    res.status(400).json('Not implementend');
};