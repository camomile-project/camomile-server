var fs = require('fs');

var env = process.env.NODE_ENV || 'global';
var cfg;

var cdir = GLOBAL.config_dir;
if(cdir == undefined)
	cdir = './';
else 
	cdir = cdir + '/';

cfg = require(cdir + 'config.'+env);

module.exports = cfg;