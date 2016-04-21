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

var SSEChannels = function(maxChannel) {
    var t = this;
    var _channels = [];
    var _maxChannel = maxChannel || 10;
    var _pingIntervalId;

    return {
        initializeChannel: initializeChannel,
        getAvailableChannel: getAvailableChannel,
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
        for (var i = 0; i < _maxChannel; i++) {
            if (_channels[i] !== null) {
                channelId = i;
                break;
            }
        }

        return channelId;
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

        if (_.isEmpty(_channels) && _pingIntervalId) {
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
        if (!_.isUndefined(_pingIntervalId)) return;

        _pingIntervalId = setInterval(sendPing.bind(t), 3000);
    }

    /**
     *
     */
    function sendPing() {
        for (var i = 0; i < _maxChannel; i++) {
            if (!_.isUndefined(_channels[i])) {
                send(i, 'ping', {});
            }
        }
    }

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
     * @param event
     * @param datas
     */
    function dispatch(event, datas) {
            send(0, event, datas);
    }
};

module.exports = new SSEChannels();