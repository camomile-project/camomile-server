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

var _ = require('underscore');
var crypto = require('crypto');


var SSEChannels = function(maxChannel) {
    var t = this;
    var _channels = {};
    var _maxChannel = maxChannel || 10;
    var _pingIntervalId = null;

    return {
        initializeChannel: initializeChannel,
        getAvailableChannel: getAvailableChannel,
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        dispatch: dispatch
    };

    /////

    /**
     * Get available channel
     *
     * @returns {boolean}
     */
    function getAvailableChannel() {
        var channelId = false;
        while (!channelId) {
            var tmpChannelId = generateId();
            if (_.isUndefined(_channels[tmpChannelId])) {
                channelId = tmpChannelId;
            }
        }
        return channelId;
    }

    function generateId() {
        var len = 12;
        return crypto.randomBytes(Math.ceil(len/2))
            .toString('hex')
            .slice(0, len);
    }

    /**
     * Close SSE Channel
     *
     * @param id
     */
    function closeChannel(id) {
        if (_channels[id]) {
            _channels[id].req.removeListener('close', closeChannel.bind(t, id));
            _channels[id].req.removeListener('end', closeChannel.bind(t, id));
            _channels[id] = null;
            delete _channels[id];
        }

        if (_.isEmpty(_channels) && !_.isNull(_pingIntervalId)) {
            clearInterval(_pingIntervalId);
            _pingIntervalId = null;
        }
    }

    /**
     * Initialize SSE Channel
     *
     * @param req
     * @param res
     * @param id
     * @returns {boolean}
     */
    function initializeChannel(req, res, id) {
        if (!_.isUndefined(_channels[id])) {
            return false;
        }

        // Init Server Sent Event
        req.socket.setTimeout(0x7FFFFFFF);
        res.setHeader('Content-Type', 'text/event-stream');
        res.writeHead(200);
        res.write('\n\n');

        _channels[id] = {
            res: res,
            req: req,
            events: []
        };

        req.on('close', closeChannel.bind(t, id));
        req.on('end', closeChannel.bind(t, id));

        startPingInterval();

        return true;
    }

    /**
     *
     */
    function startPingInterval() {
        if (!_.isNull(_pingIntervalId)) return;
        _pingIntervalId = setInterval(sendPing.bind(t), 3000);
    }

    /**
     *
     */
    function sendPing() {
        _.each(_channels, function(channel, id) {
            if (!_.isUndefined(_channels[id])) {
                send(id, 'ping', {});
            }
        });
    }

    /**
     *
     * @param channel_id
     * @param event
     * @param data
     */
    function send(channel_id, event, data) {
        if (!_.isUndefined(_channels[channel_id])) {
            var msg =
                'event:' + event + '\n' +
                'data:' + JSON.stringify(data) + '\n\n';
            _channels[channel_id].res.write(msg);
        }
    }

    /**
     *
     * @param channel_id
     * @param type
     * @param id
     * @returns {boolean}
     */
    function subscribe(channel_id, type, id) {
        if (_.isUndefined(_channels[channel_id])) {
            return false;
        }

        _channels[channel_id].events[type + ':' + id] = true;

        return true;
    }

    /**
     *
     * @param channel_id
     * @param type
     * @param id
     * @returns {boolean}
     */
    function unsubscribe(channel_id, type, id) {
        if (_.isUndefined(_channels[channel_id])) {
            return false;
        }

        if (_channels[channel_id].events[type + ':' + id]) {
            delete _channels[channel_id].events[type + ':' + id];
        }

        return true;
    }

    /**
     *
     * @param event
     * @param datas
     */
    function dispatch(event, datas) {
        _.each(_channels, function(channel, id) {
            if (_channels[id].events[event]) {
                send(id, event, datas);
            }
        });
    }
};

module.exports = new SSEChannels();
