if (process.argv.indexOf('--no-auth') > -1 ){
  /**
   * Indicates when to run without requiring auth for API
   */
  GLOBAL.no_auth = true;
}

//parser the arguments
process.argv.forEach(function(arg) {
  	if(arg.indexOf("--video-path") == 0)
    	GLOBAL.video_path = arg.split("=")[1];
	if (arg.indexOf("--db-port") == 0)
     	GLOBAL.db_port = arg.split("=")[1];
	if (arg.indexOf("--db-host") == 0)
     	GLOBAL.db_host = arg.split("=")[1];
    if (arg.indexOf("--db-name") == 0)
     	GLOBAL.db_name = arg.split("=")[1];
    if (arg.indexOf("--server-port") == 0)
    	GLOBAL.server_port = arg.split("=")[1];
});

var express = require('express'), 
    http = require('http'), 
    path = require('path'), 
	routes = require('./routes/routes'),
    mongoose = require('mongoose'), 
    mongoStore = require('connect-mongo')(express);

var app = express();

// Le 2/9/2013, Phuong tried to fix cross-domain connections.
// The current solution is to allow CORS by overloading the middleware function:

var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
	res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With'); // Pierrick: needed by REST calls from angular

	// intercept OPTIONS method
    if('OPTIONS' == req.method) {
    	res.send(200); // force the server to treat such a request as a normal GET or POST request.
    }
    else {
    	next(); // otherwise, do anything else, on s'en fiche (dont care)
    }
}

// connect to the db:
//var db_name = 'TAM';
var db_name = 'sampledb';//'tmpNov';
var db_host = 'mongodb://localhost';

if(GLOBAL.db_host)
	db_host = GLOBAL.db_host;
	
if(GLOBAL.db_name)
	db_name = GLOBAL.db_name;

db_name = db_host + '/' + db_name;
// mongoose.connect('mongodb://localhost/sampledb');

mongoose.connect(db_name);//('mongodb://localhost/TAM');
// mongoose.connect('mongodb://localhost/tmpCURL');
mongoose.connection.on('open', function(){
	console.log("Connected to Mongoose:") ;
});

keepSession = function (req, res, next) {
    var err = req.session.error,
        msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    //console.log("res.locals"); console.log(res.locals);
    next();
}

var sessionStore = new mongoStore({mongoose_connection: mongoose.connection, db: mongoose.connections[0].db, clear_interval: 60}, function(){
                          console.log('connect mongodb session success...');
});

var server_port = process.env.PORT || 3000;
if(GLOBAL.server_port)
	server_port = GLOBAL.server_port;
//console.log("server_port: " + server_port);

// configure all environments
app.configure(function(){
	app.set('port', server_port);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	
    app.use(allowCrossDomain); //phuong added on 2/9/2013 for CORS problem!
    
	app.use(express.cookieParser('your secret here'));
	
	//app.use(express.session());
	app.use(express.session({
    	key : "camomile.sid",
    	secret: "123camomile",
    	cookie: { 
    		//expires: new Date(Date.now() + 60 * 10000) 
    		maxAge: 3*3600000 // 3 h resolved the prob encountered when one user is timeout
  		},
  		/*store: new mongoStore({ host: 'http://localhost/', 
  			port: 27017, 
  			db: 'session', 
  			collection: 'sessions',
  			interval: 120000,
  			clear_interval : (10)//search db to clear the expired every 10 seconds 
  			})*/
  		//store: new mongoStore({db: mongoose.connections[0].db})
  		store: sessionStore
    }));
	app.use(keepSession); //added
	
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

