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

var http = require('http');
var express = require('express');

var cors = require('cors');
var logger = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var cookieParser = require('cookie-parser');

var program = require('commander');
var mongoose = require('mongoose');
var mongoStore = require('connect-mongo')(session);

var routes = require('./routes');
var User = require('./models/User');
var Authentication = require('./controllers/Authentication');

program
  .option('--port <port>', 'Local port to listen to (default: 3000)', parseInt)
  .option('--mongodb-host <host>', 'MongoDB host (default: localhost)')
  .option('--mongodb-port <port>', 'MongoDB port (default: 27017)', parseInt)
  .option('--mongodb-name <dbname>',
    'MongoDB database name (default: camomile)')
  .option('--root-password <dbname>', 'Change/set root password')
  .option('--media <dir>', 'Path to media root directory')
  .parse(process.argv);

var port = program.port || process.env.PORT || 3000;
var mongodb_host = program.mongodbHost || process.env.MONGO_HOST || process.env
  .MONGODB_PORT_27017_TCP_ADDR || 'localhost';
var mongodb_port = program.mongodbPort || process.env.MONGO_PORT || process.env
  .MONGODB_PORT_27017_TCP_PORT || 27017;
var mongodb_name = program.mongodbName || process.env.MONGO_NAME || 'camomile';
var root_password = program.rootPassword || process.env.ROOT_PASSWORD;
var media = program.media || process.env.MEDIA || '/media';
var cookieSecret = process.env.COOKIE_SECRET || Authentication.helper.cookieSecret();

mongoose.connect('mongodb://' + mongodb_host + ':' + mongodb_port + '/' +
  mongodb_name);

var cors_options = {
  origin: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  allowedHeaders: ['X-CSRF-Token', 'X-Requested-With', 'Accept',
    'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date',
    'X-Api-Version'
  ],
  credentials: true,
};

var sessionStore = new mongoStore({
  mongooseConnection: mongoose.connection,
  db: mongoose.connections[0].db,
  clear_interval: 60
});

var app = express();

app.set('port', port);
app.set('media', media);
app.use(logger('dev'));
app.use(cors(cors_options));
app.use(methodOverride());
app.use(session({
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000,
  },
  name: 'camomile.sid',
  proxy: true,
  resave: false,
  rolling: false,
  saveUninitialized: false,
  secret: cookieSecret,
  store: sessionStore,
}));

app.use(cookieParser(cookieSecret));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// handle CORS pre-flight requests
// (must be added before any other route)
app.options('*', cors(cors_options));

//start routes:
routes.initialize(app);

User.findOne({
  username: "root"
}, function (error, root) {

  if (!root) {

    if (!root_password) {
      console.log('Please set root password. Exiting.');
      process.exit(-1);
    }

    root = new User({
      username: 'root',
      role: 'admin'
    });

  }

  if (root_password) {
    Authentication.helper.generateSaltAndHash(root_password, function (error, salt,
      hash) {
      root.salt = salt;
      root.hash = hash;
      root.save(function (error) {
        if (error) {
          console.log('Could not set root password. Exiting.');
          process.exit(-1);
        }
        console.log('Root password successfully set.');
      });
    });
  }
});

app.listen(app.get('port'), function () {
  console.log('Server listening on port ' + app.get('port'));
});