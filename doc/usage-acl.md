This document describes how to use the authentication of the API-tool.  
===============================================

Preparation
----------

First, make sure that all the necessary packages are installed. We can then start by typing on two different terminal windows the following commands:
--------------

	$> mongod
	$> node appCam.js

To use the APIs, you must login with a valid username and password. To login, make a post operation with username and password, for exemple:

	curl -i -X POST http://localhost:3000/login --data '{"username":"ta", "pass":"****"}' -H "Content-Type: application/json"

If you perform a GET, a window form will appear where you can fill the corresponding fields:

	http://localhost:3000/login
	

To logout, run:

	http://localhost:3000/logout


Create a user
----------

To create a username, login as root user and make a post:

	curl -i -X POST http://localhost:3000/signup --data '{"username":"ta", "pass":"****", "affiliation": "LIMSI", "role" : "user"}' -H "Content-Type: application/json"

Or if you would like to use a dialog form to enter create your user, simply type:

	http://localhost:3000/signup

	
Change the role of an existing user
----------

The role of the create user is assigned to "user" by default, but you can then change it later by making a post operation, for example:

	curl -i -X POST http://localhost:3000/chmodUser --data '{"username":"ta", "role":"admin"}' -H "Content-Type: application/json"


Alternatively, you can use a window form to enter the username and its new role, for instance:

		http://localhost:3000/chmodUser


Remove a user
----------

Login as an admin user. You can then remove a user through its loginname by:

	$ curl -i -X DELETE http://localhost:3000/removeUserByname --data '{"username":"ta"}' -H "Content-Type: application/json"


Get all users
----------

To list all users, login as an admin account and type (i.e., make a GET):

	http://localhost:3000/allUsers

Create a group
--------------

Login as an admin user and make a post, for example:

	curl -i -X POST http://localhost:3000/Group --data '{"groupname":"CRP", "description":"People at CRP"}' -H "Content-Type: application/json"
	
	
As an alternative way, you can do so by filling up a form through a GET:

	http://localhost:3000/addGroup
	
	
Remove a group
--------------

Login as an admin user, then perform a delete operation:	
	
	$ curl -i -X DELETE http://localhost:3000/removeGroupByName --data '{"groupname":"CRP"}' -H "Content-Type: application/json"
	
	
Add a user to a group
--------------
	
Login as an admin user, and perform a post request like:
	
	curl -i -X POST http://localhost:3000/addUser2Group --data '{"groupname":"CRP", "username":"bredin"}' -H "Content-Type: application/json"
	
Alternatively, you can fill a form by making the following GET:

	http://localhost:3000/addUser2Group


Get all groups
----------

To list all groups, login as an admin account and type:

	http://localhost:3000/allGroups
	

Working with the ACL (only users which have an admin rights on the requested resource can view its content)
----------

- View all acls (only users which have an admin rights on the requested resource can view or modify its content)

Login as an admin user, and type:
	
	http://localhost:3000/allACLs

- View alcs of a specific resource (a corpus, a medium, a layer, an annotation):

Type either the following command (only users which have an admin rights on the requested resource can view or modify its content): 

	http://localhost:3000/corpus/id/acl
	
or (for media):
	
	http://localhost:3000/corpus/id_corpus/media/id_media/acl
	
or (for layer):
	
	http://localhost:3000/corpus/id_corpus/media/id_media/layer/id_layer/acl

or (for annnotation):
	
	http://localhost:3000/corpus/id_corpus/media/id_media/layer/id_layer/annotation/id_anno/acl
	
- Update the right of an ACL resource

http://localhost:3000/corpus/id/acl

You can either add a username right or a groupname right to a specific resource. If the username or groupname being updated exists, it simply updates its corresponding new right.
	
To update a username and its right for a specific resource id, execute the following command:	

	$ curl -i -X PUT http://localhost:3000/corpus/id/acl --data '{"username":"ta", "userright" : "C"}' -H "Content-Type: application/json"
	
Or for a group:
	
	$ curl -i -X PUT http://localhost:3000/corpus/id/acl --data '{"groupname":"CRP", "groupright" : "A"}' -H "Content-Type: application/json"

Similarly, we can update a username right of a media, a layer, or an annotation:
	
	$ curl -i -X PUT http://localhost:3000/corpus/id_corpus/media/id_media/acl --data '{"username":"ta", "userright" : "C"}' -H "Content-Type: application/json"
	
	$ curl -i -X PUT http://localhost:3000/corpus/id_corpus/media/id_media/layer/id_layer/acl --data '{"username":"ta", "userright" : "C"}' -H "Content-Type: application/json"
	
	$ curl -i -X PUT http://localhost:3000/corpus/id_corpus/media/id_media/layer/id_layer/annotation/id_anno/acl --data '{"username":"ta", "userright" : "C"}' -H "Content-Type: application/json"

	

Conclusion
-----------

Enjoy!!!!

