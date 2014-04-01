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

var config = module.exports = {};

config.env = 'development'; //default

// server node js: default port is 3000
config.hostname = process.env.HOSTNAME || 'camomile.limsi.fr';
config.server_port = process.env.PORT || 3000;

// authentification or not
config.no_auth = false;

config.video_path = '/corpora/video';

// mongo database: database name, database port
config.mongo = {};
config.mongo.db_host = process.env.MONGO_URI || 'mongodb://localhost';
config.mongo.db_name = 'camomile';
config.mongo.db_port = 27017;

// the password of the root user
config.root_pass = 'camomile';

// cookie timeout
config.cookie_timeout = 3;
