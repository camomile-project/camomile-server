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

var morgan = require('morgan');
var fileStreamRotator = require('file-stream-rotator');
var fs = require('fs');

var cors = require('cors');
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
  .option('--log <dir>', 'Path to log directory (default: ' + __dirname + '/log)')
  .parse(process.argv);

var port =
  program.port ||
  process.env.PORT ||
  3000;

// CLI || env || linked mongo Docker container || default 
var mongodb_host =
  program.mongodbHost ||
  process.env.MONGODB_HOST ||
  process.env.MONGO_PORT_27017_TCP_ADDR ||
  'localhost';

// CLI || env || linked mongo Docker container || default 
var mongodb_port =
  program.mongodbPort ||
  process.env.MONGODB_PORT ||
  process.env.MONGO_PORT_27017_TCP_PORT ||
  27017;

// CLI || env || default 
var mongodb_name =
  program.mongodbName ||
  process.env.MONGODB_NAME ||
  'camomile';

var root_password =
  program.rootPassword ||
  process.env.ROOT_PASSWORD;

var media =
  program.media ||
  process.env.MEDIA ||
  '/media';

// CLI || env || ./log
var logDirectory =
  program.log ||
  process.env.LOG ||
  __dirname + '/log';

// env || random
var cookieSecret =
  process.env.COOKIE_SECRET ||
  Authentication.helper.cookieSecret();

var app = express();

app.set('port', port);
app.set('media', media);

// === LOGGING ================================================================

// create log directory
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// create a (daily) rotating write stream
var accessLogStream = fileStreamRotator.getStream({
  filename: logDirectory + '/%DATE%.log',
  frequency: 'daily',
  verbose: false,
  date_format: 'YYYYMMDD'
});

morgan.token('user', function (req, res) {
  if (req.session && req.session.user) {
    return req.session.user.username;
  } else {
    return 'anonymous';
  };
});

var logFormat = '[:date[clf]] :user (:remote-addr) :method :url :status :response-time ms';

var logger = morgan(logFormat, {
  skip: function (req, res) {
    return req.method === 'GET' || req.method === 'OPTIONS';
  },
  stream: accessLogStream
});

app.use(logger);

// === CROSS-ORIGIN RESOURCE SHARING ==========================================

var cors_options = {
  origin: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  allowedHeaders: ['X-CSRF-Token', 'X-Requested-With', 'Accept',
    'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date',
    'X-Api-Version'
  ],
  credentials: true,
};

app.use(cors(cors_options));

// ============================================================================

app.use(methodOverride());

// === SESSION ================================================================

mongoose.connect('mongodb://' + mongodb_host + ':' + mongodb_port + '/' +
  mongodb_name);

var sessionStore = new mongoStore({
  mongooseConnection: mongoose.connection,
  db: mongoose.connections[0].db,
  clear_interval: 60
});

app.use(session({
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000,
  },
  name: 'camomile.sid',
  proxy: true,
  resave: false,
  rolling: true,
  saveUninitialized: false,
  secret: cookieSecret,
  store: sessionStore,
}));

app.use(cookieParser(cookieSecret));

// ============================================================================

app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));

// ============================================================================

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