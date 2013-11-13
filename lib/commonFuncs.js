var Group = require('../models/Group').Group;

// Here is to define common functions


exports.returnAccessDenied = function returnAccessDenied(req, res) {
	req.session.error = 'Access denied!';
	res.send(401, 'Access denied!');
}

exports.findUsernameInACL = function findUsernameInACL(username, users) {
	var found = false;
	for(var i = 0; i < users.length; i++) {
		if(users[i].login === username.toLowerCase()) {
			found = true;
			return i;
		}
	}
	if(found == false)
		return -1;
}; 

var userRoleConstant = new Array();
	userRoleConstant["user"] = 1; // normal user
	userRoleConstant["supervisor"] = 2;
	userRoleConstant["admin"] = 3;		

exports.isAllowedUser = function isAllowedUser(currentRole, requiredRole) {
	return userRoleConstant[currentRole] - userRoleConstant[requiredRole];
}


//N R E C D A
var rightConstant = new Array(); 
	rightConstant["N"] = 1; //none		
	rightConstant["R"] = 2; //read
	rightConstant["E"] = 3; //edit
	rightConstant["C"] = 4; //create
	rightConstant["D"] = 5; //create
	rightConstant["A"] = 6; //admin

function compareRight(r1, r2) {
	if(r1 == r2) return 0;
	return rightConstant[r1] - rightConstant[r2];
}

exports.isAllowedRight = function isAllowedRight(requiredRight, currentRight) {
//	if(requiredRight == currentRight) return 0;
	return rightConstant[currentRight] - rightConstant[requiredRight];
}

exports.findUsernameInGroupACL = function findUsernameInACL(groupname, groups) {
	var found = false, maxPos = -1;
	var maxRight = 'N';
	for(var j = 0; j < groupname.length; j++) { //group to which the person belongs
		for(var i = 0; i < groups.length; i++) { //group for which the resource has been granted
			if(groups[i].login.tolowercase() === groupname[j].groupname.toLowerCase()) {
				found = true;
				//console.log("I am here: " + groups[i].right); console.log(rightConstant[groups[i].right]);
				if(compareRight(maxRight.toUpperCase(), groups[i].right.toUpperCase()) <= 0) {
					maxRight = 	groupname[i].right;
					maxPos = i;
				}
			}
		} //for 
	}
	
	if(found == false)
		return -1;
	else return maxPos;
}; 