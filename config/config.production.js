
var config = require('./config.global');
config.env = 'production';

/* 
	- You can customize all predefined parameters
	- Please have a look at the config.global.js before customizing anything
*/

config.hostname = 'production.camomile.limsi.fr';

config.mongo.db = 'production';

// Please do not change this line
module.exports = config;
