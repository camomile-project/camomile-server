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
