
var config = require('./config.global');

config.env = 'test';

/* 
	- You can customize all predefined parameters
	- Please have a look at the config.global.js before customizing anything
*/

config.hostname = 'test.camomile.limsi.fr';

config.mongo.db = 'example_test';

// Please do not change this line
module.exports = config;
