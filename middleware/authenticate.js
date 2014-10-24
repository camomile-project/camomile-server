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



var crypto = require('crypto');

var len = 128;				//Bytesize
var iterations = 12000;

/**
 * Hashes a password with optional `salt`, otherwise
 * generate a salt for `pass` and invoke `fn(error, salt, hash)`.
 *
 * @param {String} password to hash
 * @param {String} optional salt
 * @param {Function} callback
 * @api public
 */

hash = function (pwd, salt, fn) {
  if (3 == arguments.length) {
    crypto.pbkdf2(pwd, salt, iterations, len, fn);
  } else {
    fn = salt;
    crypto.randomBytes(len, function(error, salt){
      if (error) return fn(error);
      salt = salt.toString('base64');
      crypto.pbkdf2(pwd, salt, iterations, len, function(error2, hash){
        if (error2) return fn(error);
        fn(null, salt, hash);
      });
    });
  }
};

authenticateElem = function(name, pass, fn) {
    User.findOne({username: name}, function (error, user) {
       	if (user) {
           	if (error)  return fn(new Error('could not find user'));
           	hash(pass, user.salt, function (error2, hash) {
            	if (error2) return fn(error2);
            	if (hash == user.hash) return fn(null, user);
            	fn(new Error('invalid password'));
           	});
       	} 
       	else return fn(new Error('could not find this user'));
    }); 
}

exports.login = function (req, res) {
	var username = req.body.username;
	var	pass = req.body.password;
	if (username == undefined || pass == undefined) res.status(400).json({error:"authentication failed, username or password are not define"});
	else {
		authenticateElem(username, pass, function (error, user) {
			if (user) {
				req.session.regenerate(function () {
					req.session.user = user;
					res.status(200).json({message:"You have been successfully logged in as "+username}); 
				});
			} 			
			else res.status(400).json({message:error});
		});
	}
}

exports.logout = function (req, res) {
    if (req.session.user) {
    	var uname = req.session.user.username;
    	req.session.destroy(function () {
        	res.status(200).json({message:uname +" is logged out"});
    	});
    }
}

exports.me = function (req, res) {
    res.status(200).json({message:'user is logged as ' + req.session.user.username});
}

exports.islogin = function (req, res, next) {
    if (req.session.user) next();
    else res.status(400).json( {message:"Acces denied, you are not login"});
}















/***************************************************** old part ********************************************************/


/*
exports.authenticate = function(name, pass, fn) {
    return authenticateElem(name, pass, fn);
}
*/




/*
checkRequiredConsistentID_corpus = function(req, res, next) {
	var id_corpus = req.params.id;
	if (id_corpus == undefined) id_corpus = req.params.id_corpus;
	Corpus.findById(id_corpus, function(error, data){
		if (error) res.status(403).json({error:"access denied!", message:error});
		else if (data == null) res.status(403).json( {error:"access denied"});
		else next();
	});
}

checkRequiredConsistentID_media = function(req, res, next) {
	Media.findById(req.params.id_media, function(error, data){
		if (error) res.status(403).json({error:"access denied!", message:error});
		else if (data == null) res.status(400).json( {error:"Not found this id"});
		else if (req.params.id_corpus == data.id_corpus)  next();
		else res.status(400).json( {error:"One of these ids is not correct"});
	});
}

checkRequiredConsistentID_layer = function(req, res, next) {
	Layer.findById(req.params.id_layer, function(error, data){
		if (error) res.status(403).json({error:"access denied!", message:error});
		else if (data == null) res.status(400).json( {error:"Not found this id"});
		else if (data.id_media != req.params.id_media)  res.status(400).json( {error:"One of these ids is not correct"});
		else checkRequiredConsistentID_media(req, res, next);
	});
}

checkRequiredConsistentID_annotation = function(req, res, next) {
	Annotation.findById(req.params.id_anno, function(error, data){
		if (error) res.status(403).json({error:"access denied!", message:error});
		else if (data == null) res.status(400).json( {error:"Not found this id"});
		else if (data.id_layer != req.params.id_layer) res.status(400).json( {error:"One of these ids is not correct"});
		else checkRequiredConsistentID_layer(req, res, next);
	});
}

// check if the IDs given for an operation are consistent, 
// ie., id_layer is under its id_media, ...
exports.requiredConsistentID = function(role, minimumRightRequired, level) {
	return function(req, res, next) {
		if (req.session.user) {
    		if (req.session.user.role == "admin" || minimumRightRequired == 'N') next();
			else if (commonFuncs.isAllowedUser(req.session.user.role, role) < 0) res.status(403).json({error:"access denied"});
			else {
				switch(level){
					case "corpus":
						checkRequiredConsistentID_corpus(req, res, next);
						break;						
					case "media":
						checkRequiredConsistentID_media(req, res, next);
						break;						
					case "layer":
						checkRequiredConsistentID_layer(req, res, next);					
						break;					
					case "annotation":
						checkRequiredConsistentID_annotation(req, res, next);					
						break;						
					default:
						break;
				}	
			}
		}
		else res.status(401).json({error:"You are not connected"});
	}
}
*/




/*
checkRequiredAuthentication_old = function(req, res, result, connectedUser, dataGroup, minimumRightRequired, next){
	ACLModel.find({id:{$in:result}}, function(error, dataACL) {
		if (error) res.status(400).json({error:"access denied!", message:error});
		else if (dataACL != null) {
			var contd = true;
			for(var i = 0; i < dataACL.length && contd; i++){
				var foundPos = commonFuncs.findUsernameInACL(connectedUser.username, dataACL[i].users);
				if (foundPos != -1 && commonFuncs.isAllowedRight(minimumRightRequired, dataACL[i].users[foundPos].right) >= 0) {
					found = true; 
					contd = false;
					next();
				}	
				else {
					foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL[i].groups);
					if (foundPos != -1 && commonFuncs.isAllowedRight(minimumRightRequired, dataACL[i].groups[foundPos].right) >= 0) {
						found = true; 
						contd = false; 
						next(); 
					}
				}
				if (foundPos != -1 && contd)  contd = false;  // found the user right, but not satisfied
			} 
			if (found == false)  res.status(403).json( {error:"access denied"});
		}
		else res.status(403).json( {error:"access denied"}); 
	});
}

exports.requiredAuthentication_old = function(role, minimumRightRequired, level) {
	return function(req, res, next) {
		if (req.session.user) { 
    		if (req.session.user.role == "admin" || minimumRightRequired == 'N')  next();
			else if (commonFuncs.isAllowedUser(req.session.user.role, role) < 0)	 res.status(403).json({error:"access denied"});
			else {
				var connectedUser = req.session.user;
				var i = level;
				var found = false;
				switch(i) {
					case "annotation": 
						Group.find({'usersList' : {$regex : new RegExp('^'+ connectedUser.username + '$', "i")}}, function(error, dataGroup) {
							if (error) res.status(400).json({error:"access denied!", message:error});
							else {
								result = [];
								result.push(req.params.id_anno);
								result.push(req.params.id_layer);
								result.push(req.params.id_media);
								result.push(req.params.id_corpus);
								checkRequiredAuthentication_old(req, res, result, connectedUser, dataGroup, minimumRightRequired, next);
							}
						});	
						break;
						
					case  "layer": 
						Group.find({'usersList' : {$regex : new RegExp('^'+ connectedUser.username + '$', "i")}}, function(error, dataGroup) {
							if (error) res.status(400).json({error:"access denied!", message:error});
							else {
								result = [];
								result.push(req.params.id_layer);
								result.push(req.params.id_media);
								result.push(req.params.id_corpus);
								checkRequiredAuthentication_old(req, res, result, connectedUser, dataGroup, minimumRightRequired, next);
							}
						});	
						break;
						
					case "media": 
						var id_media = req.params.id_media;
						Group.find({'usersList' : {$regex : new RegExp('^'+ connectedUser.username + '$', "i")}}, function(error, dataGroup) {
							if (error) res.status(400).json({error:"access denied!", message:error});
							else {
								result = [];
								result.push(req.params.id_media);
								result.push(req.params.id_corpus);
								checkRequiredAuthentication_old(req, res, result, connectedUser, dataGroup, minimumRightRequired, next);
							}
						});
						break;
						
					case "corpus": 
						var id_corpus = req.params.id_corpus;
						Group.find({'usersList' : {$regex : new RegExp('^'+ connectedUser.username + '$', "i")}}, function(error, dataGroup) {
							if (error) res.status(400).json({error:"access denied!", message:error});
							else {
								result = [];
								result.push(req.params.id_corpus);
								checkRequiredAuthentication_old(req, res, result, connectedUser, dataGroup, minimumRightRequired, next);
							}
						});
						break;
					
					case "global":						
						if (commonFuncs.isAllowedUser(req.session.user.role, role) >= 0)	next();
						else res.status(403).json({error:"access denied"});
						break;
						
					default:
						res.status(403).json({error:"access denied"});					//keep only the permitted resources
				}
			}  
		} 
		else res.status(403).json({error:"access denied"});	
	}
}
*/


	/*
	var id_media=null; 
	var id_corpus=null;
	async.waterfall([
		function(callback) {
			LayerModel.findById(id_layer, function (error, data) {
				callback( error, data.id_media);
			});
		},
		function(id_media, callback) {
			MediaModel.findById(id_media, function (error, data) {
				callback( error, data.id_corpus, id_media);
			});
		},
		function(id_corpus, id_media, callback) {
			console.log(id_corpus+' '+id_media+' '+id_layer);
		}
	], res.status(403).json({error:"access denied"}));
	

	var id_media=null; 
	var id_corpus=null;
	async.waterfall([
		LayerModel.findById,
		data -> data.id_media,
		MediaModel.findById,
		data -> data.id_corpus,
		CorpusModel.findById,
	]
	)
		function(data) { return data.id_media },

		function(callback) {
			LayerModel.findById(id_layer, function (error, data) {
				callback( error, data.id_media);
			});
		},
		function(id_media, callback) {
			MediaModel.findById(id_media, function (error, data) {
				callback( error, data.id_corpus, id_media);
			});
		},
		function(id_corpus, id_media, callback) {
			console.log(id_corpus+' '+id_media+' '+id_layer);
		}
	], res.status(403).json({error:"access denied"}));
	*/



/*
checkRequiredAuthentication = function(req, res, error, dataACL, minimumRightRequired){
	if (!error && dataACL != null) {	
		var foundPosUser = commonFuncs.findUsernameInACL(req.session.user.username, dataACL.users);			
		if (foundPosUser != -1 && commonFuncs.isAllowedRight(minimumRightRequired, dataACL.users[foundPosUser].right) >= 0) return true;
		else {
			var foundPosGroup = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL.groups);
			if (foundPosGroup != -1 && commonFuncs.isAllowedRight(minimumRightRequired, dataACL.groups[foundPosGroup].right) >= 0) return true; 
		}			
	}
}

checkRequiredAuthenticationCorpus = function(req, res, id_corpus, dataGroup, minimumRightRequired, next){
	CorpusModel.findById(id_corpus, function(error, data){
		if (error || data == null) res.status(403).json({error:"access denied"});	
		else {
			ACLModel.findOne({id:id_corpus}, function(error, dataACL) {
				if (checkRequiredAuthentication(req, res, error, dataACL, minimumRightRequired)) next();
				else res.status(403).json({error:"access denied"});	
			});	
		}
	});	
}

checkRequiredAuthenticationMedia = function(req, res, id_media, dataGroup, minimumRightRequired, next){
	MediaModel.findById(id_media, function(error, data){
		if (error || data == null) res.status(403).json({error:"access denied"});	
		else {
			ACLModel.findOne({id:id_media}, function(error, dataACL) {
				if (checkRequiredAuthentication(req, res, error, dataACL, minimumRightRequired)) next();
				else checkRequiredAuthenticationCorpus(req, res, data.id_corpus, dataGroup, minimumRightRequired, next);
			});	
		}
	});	
}

checkRequiredAuthenticationLayer = function(req, res, id_layer, dataGroup, minimumRightRequired, next){
	LayerModel.findById(id_layer, function(error, data){
		if (error || data == null) res.status(403).json({error:"access denied"});	
		else {
			ACLModel.findOne({id:id_layer}, function(error, dataACL) {
				if (checkRequiredAuthentication(req, res, error, dataACL, minimumRightRequired)) next();
				else checkRequiredAuthenticationMedia(req, res, data.id_media, dataGroup, minimumRightRequired, next);
			});	
		}
	});	
}

checkRequiredAuthenticationAnnotation = function(req, res, id_annotation, dataGroup, minimumRightRequired, next){
	AnnotationModel.findById(id_annotation, function(error, data){
		if (error || data == null) res.status(403).json({error:"access denied"});	
		else {
			ACLModel.findOne({id:id_annotation}, function(error, dataACL) {
				if (checkRequiredAuthentication(req, res, error, dataACL, minimumRightRequired)) next();
				else checkRequiredAuthenticationLayer(req, res, data.id_layer, dataGroup, minimumRightRequired, next);
			});	
		}				
	});	
}

exports.requiredAuthentication = function(role, minimumRightRequired, level) {
	return function(req, res, next) {
		if (req.session.user) {	
    		//if (req.session.user.role == "admin" || minimumRightRequired == 'N')  next();
			if (commonFuncs.isAllowedUser(req.session.user.role, role) < 0) res.status(403).json({error:"access denied"});		 
			else {
				Group.find({'usersList' : {$regex : new RegExp('^'+ req.session.user.username + '$', "i")}}, function(error, dataGroup) {
					if (error) res.status(403).json({error:"access denied"});	
					else {
						switch(level) {
							case "corpus": 
								checkRequiredAuthenticationCorpus(req, res, req.params.id, dataGroup, minimumRightRequired, next);
								break;							
							case  "media":
								checkRequiredAuthenticationMedia(req, res, req.params.id, dataGroup, minimumRightRequired, next);
			 					break;							
							case  "layer": 
								checkRequiredAuthenticationLayer(req, res, req.params.id, dataGroup, minimumRightRequired, next);
								break;							
							case  "annotation": 
								checkRequiredAuthenticationAnnotation(req, res, req.params.id, dataGroup, minimumRightRequired, next);
								break;
							default:
								res.status(403).json({error:"access denied"});					//keep only the permitted resources
								break;
						}
					}
				});	
			}
		}
	}
}
*/


/*
// create a root user if it does not exist
exports.createRootUser = function(){
	User.findOne({username:"root"}, function(error, data){
   		if (error) res.status(400).json({error:"error", message:error});
   		if (!data) {
   			var pass = GLOBAL.root_pass;
   			
			hash(pass, function (error2, salt, hash) {
				if (error2) res.status(400).json({error:"error", message:error2});
				var user = new User({
					username: "root",
					affiliation: "camomile",
					role: "admin",
					salt: salt,
					hash: hash,
				}).save(function (error3, newUser) {  // already added the root user
					if (error3) res.status(400).json({error:"error", message:error3});
				}); 
			});	
   		} 
   		else if (GLOBAL.root_passdef != GLOBAL.root_pass){
   			var pass = GLOBAL.root_pass;
			hash(pass, function (error2, salt, hash) {
				data.salt = salt;
				data.hash = hash;
				data.save(function (error3, newUser) {  // already updated the root pass
					if (error3) res.status(400).json({error:"error", message:error3});
				});
			});
   		}
	});
}
*/









