/* The API controller for Corpus
   Exports 3 methods:
   * post - Creates a new corpus
   * listAll - Returns a list of corpus
   * listWithId - Returns a specific corpus of a given id
*/

var Corpus = require('../models/Corpus').Corpus;
var ACL = require('../models/ACL').ACL,
	ACLAPI = require('../controllers/ACLAPI'),
	Group = require('../models/Group').Group,
	commonFuncs = require('../lib/commonFuncs');

// for the uri : app.get('/corpus', 
exports.listAll = function(req, res){  	
	Corpus.find({}, function(error, data){
		if(error) res.json(error);
		else {
			var connectedUser = req.session.user;
			if(GLOBAL.no_auth == true || (connectedUser != undefined && connectedUser.role == "admin")){
				res.json(data); return;
			}
			else if(connectedUser != undefined && data != null)
			{
				//first find the group to which the connecteduser belongs
				Group.find({'usersList' : {$regex : new RegExp(connectedUser.username, "i")}}, function(error, dataGroup) {
					if(error) throw error;
					else {
						//console.log("Finding a user in a group for: " + connectedUser.username); console.log(dataGroup);
						result = [];//JSON.stringify(data);
						resultReturn = [];
						//console.log("test listall Corpus: " + data.length);
						for(var i = 0; i < data.length; i++){
							console.log(data[i]._id);
							result.push(data[i]._id);
						}
						ACL.find({id:{$in:result}}, function(error, dataACL){
							if(error) console.log("error in ACL-corpusListall:");
							else if(dataACL != null) {
							//	console.log("dataACL");
							//	console.log(dataACL);
								//console.log("connectedUser"); console.log(connectedUser);
								for(var i = 0; i < dataACL.length; i++){
									var foundPos = commonFuncs.findUsernameInACL(connectedUser.username, dataACL[i].users);
							//		console.log("foundPos: " + foundPos);
									if(foundPos != -1 && dataACL[i].users[foundPos].right != 'N')
										resultReturn.push(data[i]);
									else {
										foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL[i].groups);
							//			console.log("foundPos: " + foundPos + " for : ");
										if(foundPos != -1 && dataACL[i].groups[foundPos].right != 'N')
											resultReturn.push(data[i]);
									}
								} //for
								if(resultReturn.length == 0)
									res.json(403, "You dont have enough permission to get this resource");
								else res.json(resultReturn);
							}
						}); //ACL.find
					} //else
				}); // group
				//res.json(resultReturn);
			} // else if (connectedUser)
			else res.json(403, "You dont have permission to access this resource");
		}
	}); //corpus.find
};

//for the uri app.get('/corpus/:id', 
exports.listWithId = function(req, res){
	//Media.findOne({id_corpus: req.params.id}, function(error, data){
	Corpus.findById(req.params.id, function(error, data){
		if(error){
			res.json(error);
		}
		else if(data == null){
			res.json('no such id_corpus!')
		}
		else {
			//console.log("data"); console.log(data);	
			res.json(data);
		}
	});
};

//test for Posting corpus
//app.post('/corpus', 
exports.post = function(req, res){
	var corpus_data = {
          name: req.body.name
        };

	var corpus = new Corpus(corpus_data);

	corpus.save(function(error, data){
		if(error){
			console.log('error in posting corpus data');
			res.json(error);
		}
		else {
			console.log('Success on saving corpus data'); 
			// now we need to create the first ACL for the current user
			var connectedUser = req.session.user.username;
			if(connectedUser == undefined)
				connectedUser = "root";
			ACLAPI.addUserRightGeneric(data._id, connectedUser, 'A');
			res.json(data);
		}
	});
}

//app.put('/corpus/:id', 
exports.update = function(req, res){
	//Corpus.update(_id : req.params.id, function(error, data){
	var update = {name: req.body.name};
	Corpus.findByIdAndUpdate(req.params.id, update, function (error, data) {
	//Corpus.findOne({_id:req.params.id}, function (err, cor) {
		if(error){
			res.json(error);
		}
		else {
		//	cor.name = req.body.name;
			res.json(data);
			/*cor.save( function(error, data){
                if(error){
                    res.json(error);
                }
                else{
                    res.json(data);
                }
            });*/
		}
	});
}
