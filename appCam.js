
var express = require('express'), 
    http = require('http'), 
    path = require('path'), 
	routes = require('./routes/routes'),
    mongoose = require('mongoose'), 
    program = require('commander'),
    //config = require('./config'),
    mongoStore = require('connect-mongo')(express);

var app = express();
	
	//parsing the arguments
	program
  	.option('-p, --server_port <port>', 'Local port to listen to (default: 3000)', parseInt)
  	.option('-d, --db_host <dbhost>', 'Database host (default: mongodb://localhost)')
  	.option('-P, --db_port <dbport>', 'Database port (default: 27017)', parseInt)
  	.option('-n, --db_name <dbname>', 'Database name (default: camomile)')
  	.option('-r, --root_pass <dbname>', 'Password of the root user (default: camomile)')
  	.option('-v, --video_path <vpath>', 'Path to the video directory (default: /corpora/video)')
  	.option('-c, --config_dir <cdir>', 'Path to the directory containing config. files (default: .)')
  	.option('-t, --cookie_timeout <timeout>', 'Set the cookie timeout (unit is hour, default: 3h)', parseInt)
  	.option('-a, --noauth', 'Disables authenticated mode (default: authenticated)')
  	.parse(process.argv);
	
// Cross-domain connections.
// The current solution is to allow CORS by overloading the middleware function:
var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin)
	//res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
	// intercept OPTIONS method
    if('OPTIONS' == req.method) {
    	res.send(200); // force the server to treat such a request as a normal GET or POST request.
    }
    else {
    	next(); // otherwise, do anything else, on s'en fiche (dont care)
    }
}

//here is the configuration, where sever's parameters will be set
var config;
if(program.config_dir == undefined)
	config = require('./config');
else config = require(program.config_dir + '/config');

GLOBAL.config_dir = program.config_dir || false;

GLOBAL.no_auth 		= program.no_auth || false;
GLOBAL.video_path 	= program.video_path || config.video_path;
GLOBAL.root_passdef = config.root_pass;
GLOBAL.root_pass 	= program.root_pass || config.root_pass;

var server_port = program.server_port || config.server_port;
var db_name 	= program.db_name || config.mongo.db_name;
var db_host 	= program.db_host || config.mongo.db_host;
var video_path 	= program.video_path || config.video_path;
var cookie_timeout = program.cookie_timeout || config.cookie_timeout;
//end of the configuration

// connect to the db:
db_name = db_host + '/' + db_name;
// mongoose.connect('mongodb://localhost/sampledb');
mongoose.connect(db_name);
mongoose.connection.on('open', function(){
	console.log("Connected to Mongoose:") ;
});

// used to pass values to a template (mostly used in view)
keepSession = function (req, res, next) {
    var err = req.session.error,
        msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    next();
}

//store all information related to sessions
var sessionStore = new mongoStore({mongoose_connection: mongoose.connection, 
			db: mongoose.connections[0].db, clear_interval: 60}, function(){
                          console.log('connect mongodb session success...');
});

// configure all environments
app.configure(function(){
	app.set('port', server_port);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	
    app.use(allowCrossDomain); // for CORS problem!
    
	app.use(express.cookieParser('your secret here'));
	
	app.use(express.session({
    	key : "camomile.sid",
    	secret: "123camomile",
    	cookie: { 
    		//expires: new Date(Date.now() + 60 * 10000) 
    		maxAge: cookie_timeout*3600000 //equivalent to the above option
  		},
  		store: sessionStore
    }));
	app.use(keepSession);
	
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

//start routes:
routes.initialize(app);

//finally boot up the server:
http.createServer(app).listen(app.get('port'), process.env.IP, function(){
	console.log('Express server listening on port ' + app.get('port'));
	if(GLOBAL.no_auth == true){
		console.log('be careful: any user can access the data without authentication');
	}
});

