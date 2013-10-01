
var hash = require('./pass').hash,
    User = require('../models/user').User,
    mongoose = require('mongoose'),
    ses = require('../models/sessions')(mongoose); //phuong added le 1/10/2013 for listing all sessions

authenticateElem = function(name, pass, fn) {
    //if (!module.parent) console.log('authenticating %s:%s', name, pass);  //use somewhere else, not in the main
    if (module.parent) console.log('authenticating %s:%s', name, pass);  //use somewhere else, not in the main

    User.findOne({
        username: name
    }, function (err, user) {
        	if (user) {
            	if (err) return fn(new Error('could not find user'));
            		hash(pass, user.salt, function (err, hash) {
                		if (err) return fn(err);
                		if (hash == user.hash) return fn(null, user);
                		fn(new Error('invalid password'));
            	});
        	} else {
            	return fn(new Error('could not find this user'));
        	}
    	}); 
}

exports.authenticate = function(name, pass, fn) {
    return authenticateElem(name, pass, fn);
}


exports.requiredAuthentication = function(role) {
	return function(req, res, next) {
		if(req.session.user && req.session.user.role === role) {
			next();
		} else {
			if(req.session.user && req.session.user.role == "supervisor" && role == "user")
				next();
			else if(req.session.user && req.session.user.role == "admin")
				next();
			else {
				req.session.error = 'Access denied!';
				res.redirect('/login');
			}
		}
	}
}

exports.createRootUser = function(){
	User.findOne({username:"root"}, function(err, data){
   		if(err) throw err;
   		if(!data) {
   			var pass = "camomilecghp";
			hash(pass, function (err, salt, hash) {
				if (err) throw err;
				var user = new User({
					username: "root",
		//			password : pass,
					affiliation: "camomile",
					role: "admin",
					salt: salt,
					hash: hash,
				}).save(function (err, newUser) {
					if (err) throw err;
					console.log("already added the root user");
				}); //save
			});	
   		} //data
	});
}

exports.signup = function(req, res){
    hash(req.body.password, function (err, salt, hash) {
        if (err) throw err;
        var user = new User({
            username: req.body.username,
            affiliation: req.body.affiliation,
            role: req.body.role,
            salt: salt,
            hash: hash,
        }).save(function (err, newUser) {
            if (err) throw err;
			if(newUser){
				req.session.regenerate(function(){
					req.session.user = newUser;//user;
					req.session.success = 'Authenticated as ' + newUser.username + ' click to <a href="/logout">logout</a>.';
					res.redirect('/');
				})
			}
    	});
	});
}

exports.userExist = function(req, res, next) {
    User.count({
        username: req.body.username
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            req.session.error = "This user already exists"
            res.redirect("/signup");
        }
    });
}

exports.createRootUser = function (){
	User.findOne({username:"root"}, function(err, data){
   		if(err) throw err;
   		if(!data) {
   			var pass = "camomilecghp";
			hash(pass, function (err, salt, hash) {
				if (err) throw err;
				var user = new User({
					username: "root",
		//			password : pass,
					affiliation: "camomile",
					role: "admin",
					salt: salt,
					hash: hash,
				}).save(function (err, newUser) {
					if (err) throw err;
					console.log("already added the root user");
				}); //save
			});	
   		} //data
	});
}

exports.login = function (req, res) {
	var username = req.body.username,
		pass = req.body.password;
	if(username == undefined) { //login via a GET
		username = req.params.username;
		pass = req.params.password;
	}
		
	authenticateElem(username, pass, function (err, user) {
        if (user) {
            req.session.regenerate(function () {

                req.session.user = user;
                req.session.success = 'Authenticated as ' + user.username + ' click to <a href="/logout">logout</a>.';
                res.redirect('/');
            });
        } else {
            req.session.error = 'Authentication failed, please check your ' + ' username and password.';
            res.redirect('/login');
        }
    });
}

exports.signup = function (req, res) {
	console.log("req.body.role: " + req.body.role);
    hash(req.body.password, function (err, salt, hash) {
        if (err) throw err;
        var user = new User({
            username: req.body.username,
//            password : req.body.password,
            affiliation: req.body.affiliation,
            role: req.body.role,
            salt: salt,
            hash: hash,
        }).save(function (err, newUser) {
            if (err) throw err;
            //authenticate(newUser.username, newUser.password, function(err, user){
//               if(user){
                 if(newUser){ 
                    req.session.regenerate(function(){
                        req.session.user = newUser;//user;
                        req.session.success = 'Authenticated as ' + newUser.username + ' click to <a href="/logout">logout</a>.';
                        res.redirect('/');
                    })
                }
            //});
        });
    });
}

exports.chmodUser = function (req, res) {
	var usrname = req.body.username,
		newrole = req.body.role;
	
	if(usrname == undefined) { //login via a POST
		usrname = req.params.username;
		newrole = req.params.role;
	}
	
	if(usrname == "root") {
		res.redirect('/');
		return false;
	}
	
	var strRights = ["admin", "user", "supervisor"];
	if(strRights.indexOf(newrole) < 0) {
		console.log("role should be either user, admin, or supervisor");
		res.redirect('/');
		return false;
	}
	//console.log("role new:  " + newrole);
	User.findOne({username:usrname}, function(err, data){
   		if(err) throw err;
   		if(data){
   			//console.log("role: " + data.role + " new:  " + newrole);
			data.role = newrole;
			data.save(function(err) {
				if(err) throw err;
				console.log('successfully changed the role (as ' +  newrole  + ') for the username ' + usrname);
				var olduser = req.session.user;
				if(usrname == req.session.user.username){
					req.session.destroy(function () {
						res.redirect('/');
					});
				}
				else
					res.redirect('/');
			});
		}
   	});
}

exports.racine = function (req, res) {
    if (req.session.user) {
        res.send("Welcome " + req.session.user.username + "<br>" + "<a href='/logout'>logout</a>");
    } else {
    	
        res.send("<h1 ALIGN="+ "CENTER>" + "Welcome to Camomile project!</h1>" + "<br>" + "<h2>You have to log in to use the APIs</h2>" + "<br>" + "<a href='/login'> Login</a>" + "<br>" + "<a href='/signup'> Sign Up</a>");
    }
}

exports.signupGET = function (req, res) {
    if (req.session.user) {
        res.redirect("/");
    } else {
        res.render("signup");
    }
}

exports.logoutGET = function (req, res) {
    req.session.destroy(function () {
        res.redirect('/');
    });
}

exports.profile = function (req, res) {
    var usrname = req.session.user.username;
    if(req.params.username != undefined){
    	usrname = req.params.username
    }
    
    User.findOne({
        username: usrname
    },

    function (err, user) {
        if (user) {
 			res.send("username: " + user.username + "<br>" + " Role: " + user.role + "<br>" + " affiliation: " + user.affiliation +'<br>'+ 'click to <a href="/logout">logout</a>');
        } else {
            return res.send('cannot find user');
        }
    });
}

exports.listAllUsers = function (req, res) {
	User.find({}, 'username role affiliation', function (err, users) {
        if(err) throw err;
        if (users) {
 			res.send(users);
        } else {
            return res.send('no user');
        }
    });
}

exports.listAllSessions = function (req, res) {
    ses.find({},function (err, sessions) {
        if (err) console.log(err);
        else res.send(sessions);
    });
}