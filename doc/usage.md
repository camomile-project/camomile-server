How to use Camomile's RESTFUL API web services
===============================================

Preparation
----------

We use Node.js (npm is also installed as a node module) and Express (which is the middleware used to create the web server on the Node.js environment) to build the API web services. All resources are stored in mongodb (which is a nosql database). To start using the APIs, you need to do the following:
	
	1. Install Node.js and MongoDB if they’re not already installed (just download them from their corresponding websites, and follow the corresponding installation instructions)
	2. Clone the camomile-node.js-rest-api repository into a new directory:
		$> git clone git clone git@bitbucket.org:camomile_project/camomile-node.js-rest-api.git
	3. Go in the directory in which you cloned the camomile project, do the following commands to install express:
		$> cd camomile-node.js-rest-api
		$> npm install express

Now it’s time to discover our APIs.

The supported API resources
---------------------------

Let's us recall some supported APIs built for the Camomile project:

		GET /corpus : return all available corpus
		GET /corpus/:id : return the corpus identified by the given :id
		GET /corpus/:id/media : return all media of the corpus identified by the given :id
		GET /corpus/:id/media/:id1 : return the media identified by the given :id1 GET /corpus/:id/media/:id1/layer : return all layers of the media identified by the given :id1
		GET /corpus/:id/media/:id1/layer/:id2 : return the layer identified by the given :id2
		GET /corpus/:id/media/:id1/layer/:id2/annotation : return all annotations
		of the layer identified by the given :id2
		GET /corpus/:id/media/:id1/layer/:id2/annotation/:id3 : return the annotaion identified by the given :id3
		POST /corpus : create a new corpus corresponding to the JSON object given in the body request
		POST /corpus/:id/media : create a new media (corresponding to the JSON object given in the body request), under the corpus id
		POST /corpus/:id/media/:id1/layer : create a new layer, under the media id1 POST /corpus/:id/media/:id1/layer : create a new annotation, under the layer id2
		PUT /corpus/:id : update the corpus with values of the JSON object given in the body request. Other resources can be updated in a similar way.
		DELETE /corpus/:id : delete the corpus with the given id. Other resources can be deleted in a similar way.

Using the APIs
--------------

Now it’s time to test our APIs. Open two different terminal sessions, and type on each one the following commands:

	$> mongod
	$> node appCam.js

If everything is ok, you will see the following message:

	Express server listening on port 3000 Connected to Mongoose

It means that your node js server is running and listening on the port 3000, and you have successfully connected to the Mongodb database. Now you can test the APIs. 
These APIs are usually invoked in a client application through jQuery or Ajax calls. If you want to test your APIs before using them, you can type directly your REST 
services (specified by an URL) on browsers, for example:

	http://localhost:3000/corpus

However, by this way you can only test your GET services. A widely used solution to test all REST API services is to use CURL - a command line tool for transferring data with URL syntax, supporting DICT , FILE, FTP, FTPS, Gopher, HTTP, HTTPS, IMAP, IMAPS, LDAP, LDAPS, POP3, etc. For example, to get all available corpus (as above) you can type:

	$ curl -i http://localhost:3000/corpus
	
The output should be:

	HTTP/1.1 200 OK
	X-Powered-By: Express
	Content-Type: application/json; charset=utf-8
	Content-Length: 2
	Set-Cookie: connect.sid=s%3ARBFU8_z7NsXrlNl1y4AKff7e.TEyEu7CIASMuEJYjatxK%2Fzlk63s4htKLbqZkGiE%2BRzw; Path=/; HttpOnly Date: Sun, 01 Sep 2013 13:11:32 GMT
	Connection: keep-alive
		[]

It is an empty list because we have not added any resources yet. Try to add some resources!

Create a corpus
---------------

Let's insert a new corpus named Repere by typing:

	curl -i -X POST http://localhost:3000/corpus --data '{"name":"Repere"}' -H "Content-Type: application/json"
	HTTP/1.1 200 OK
	X-Powered-By: Express
	Content-Type: application/json; charset=utf-8
	Content-Length: 59
	Set-Cookie: connect.sid=s%3AFm5OzpAdJ96rIIgmZcjATjOI.8wBHDk%2FBYt90btShBs4skTwdLJFwk2jB%2Fdo4OzneZQ0; Path=/; HttpOnly Date: Sun, 01 Sep 2013 13:25:34 GMT
	Connection: keep-alive
	{
		"name": "Repere",
		"_id": "5223404ef22f9e1305000001"
	}

It's ok! Now the corpus list should contain one corpus whose id was automatically generated. Try to see what happened by:

	$ curl -i http://localhost:3000/corpus
	HTTP/1.1 200 OK
	X-Powered-By: Express
	Content-Type: application/json; charset=utf-8 Content-Length: 71
	Set-Cookie: connect.sid=s%3Avzfkc-8eZTzS-vkpH0IEr8lD.ha8NIAGuPukW%2FuwL5Wdw5D2XLwaOIms7xpD3DOFZARg; Path=/; HttpOnly Date: Sun, 01 Sep 2013 13:31:09 GMT
	Connection: keep-alive
	[
		{
			"name": "Repere",
			"_id": "5223404ef22f9e1305000001" 
		}
	]
	
You can retrieve the corpus with the above given id, for example:

	$ curl -i http://localhost:3000/corpus/5223404ef22f9e1305000001
	HTTP/1.1 200 OK
	X-Powered-By: Express
	Content-Type: application/json; charset=utf-8
	Content-Length: 59
	Set-Cookie: connect.sid=s%3ADo7GiAGjDItjzZESwgD4Pzzf.0FT%2Fl9u%2FVprQFfbkaR4DONkXu4ervC9qBlTN1myZgA4; Path=/; HttpOnly Date: Sun, 01 Sep 2013 13:49:40 GMT
	Connection: keep-alive
	{
		"name": "Repere",
		"_id": "5223404ef22f9e1305000001"
	}
	
Create a new media
------------------

Once you have created a corpus, you can insert media into this corpus. The following example shows how to insert a new media to the corpus Repere:

	$ curl -i -X POST http://localhost:3000/corpus/5223404ef22f9e1305000001/media --data '{"id_corpus" : "5223404ef22f9e1305000001","name":"Video 01"}' -H "Content-Type: application/json"
	HTTP/1.1 200 OK
	X-Powered-By: Express
	Content-Type: application/json; charset=utf-8
	Content-Length: 104
	Set-Cookie: connect.sid=s%3ASWnOFU-jI3Q3JacmizACGKva.UDMhW4i4PJ8rwaZzyY9TydzgB31qltn22zNPD0niY%2Bw; Path=/; HttpOnly Date: Sun, 01 Sep 2013 14:21:40 GMT
	Connection: keep-alive
	{
		"id_corpus": "5223404ef22f9e1305000001", "name": "Video 01",
		"_id": "52234d74f22f9e1305000002"
	}
	
Let's see if the media was inserted:
	
	$ curl -i http://localhost:3000/corpus/5223404ef22f9e1305000001/media
	HTTP/1.1 200 OK
	X-Powered-By: Express
	Content-Type: application/json; charset=utf-8
	Content-Length: 118
	Set-Cookie: connect.sid=s%3AgYWarUEyU-9HsI44mgioBtF0.1HM6QHSvNDFzuNbBBYstOlV%2BayWwpvhn89Hd%2B9kKNn4; Path=/; HttpOnly Date: Mon, 02 Sep 2013 09:00:38 GMT
	Connection: keep-alive
	[
		{
		}
	]
	
Create new layers or annotations
--------------------------------

In a similar way, you can insert a layer or an annotation!!

Update a corpus/media/layer/annotation
--------------------------------------

Let’s update the name of the corpus by setting its value to "Repere train phase1" (its current name is "Repere"):

		$ curl -i -X PUT http://localhost:3000/corpus/5223404ef22f9e1305000001 --data '{"name":"Repere train phase1"}' -H "Content-Type: application/json"
		HTTP/1.1 200 OK
		X-Powered-By: Express
		Content-Type: application/json; charset=utf-8
		Content-Length: 72
		Set-Cookie: connect.sid=s%3AGjpg70xrgGjiaxn1VgjJT_lH.SOsJBdemzvtGvJRunp1hg6C0C0PF5kOXT7IakMb8ToI; Path=/; HttpOnly Date: Mon, 02 Sep 2013 09:09:05 GMT
		Connection: keep-alive
		{
			"_id": "5223404ef22f9e1305000001",
			"name": "Repere train phase1"
		}
		
Let's retrieve the corpus to see if its name was correctly updated:

		$ curl -i http://localhost:3000/corpus/5223404ef22f9e1305000001
		HTTP/1.1 200 OK
		X-Powered-By: Express
		Content-Type: application/json; charset=utf-8
		Content-Length: 72
		Set-Cookie: connect.sid=s%3AD-QpaW8C4FXCPXjJoAM4p7bn.nkKeEPjYP5BtFGGXSyoWy591nhQqwHK1HL2i%2Bv5Ikwg; Path=/; HttpOnly Date: Mon, 02 Sep 2013 09:11:45 GMT
		Connection: keep-alive
		{
			"_id": "5223404ef22f9e1305000001", "name": "Repere train phase1"
		}
		
Yes! Well done! Similarly, you can update a media/layer or an annotation.

Delete a corpus/media/layer/annotation
--------------------------------------

Now it’s time the test the deletion of the resources. Note that, if you delete a corpus, all resources belonging to this corpus should be deleted. Here is an example showing the deletion of a media:

	$ curl -i -X DELETE http://localhost:3000/corpus/5223404ef22f9e1305000001/media/52234d74f22f9e1305000002
	HTTP/1.1 200 OK
	X-Powered-By: Express
	Content-Type: application/json; charset=utf-8
	Content-Length: 43
	"name": "Repere",
	"id_corpus": "5223404ef22f9e1305000001", "name": "Video 01",
	"_id": "52234d74f22f9e1305000002"
	Set-Cookie: connect.sid=s%3AXTBHOxK7rIi2gLDzPPOTOVfR.UDN2LwB%2BbBxIOS%2FCrzb2HgcFL8oD8dvt7buw95Uou9w; Path=/; HttpOnly Date: Mon, 02 Sep 2013 09:19:48 GMT
	Connection: keep-alive
	{
		"data": 1, "listRemovedLayerId": []
	}


The listRemovedLayerId contains ids of related layers that have been automatically deleted. The list is empty because there is no layer belonging to the media with id 52234d74f22f9e1305000002.
Now if you try to retrieve the deleted media, the output should be "not found":

	$ curl -i http://localhost:3000/corpus/5223404ef22f9e1305000001/media/52234d74f22f9e1305000002
	HTTP/1.1 200 OK
	X-Powered-By: Express
	Content-Type: application/json; charset=utf-8
	Content-Length: 19
	Set-Cookie: connect.sid=s%3Ao2DjuwxciLn6CGtzR-aFzhWF.Axqf8uTJBVsk33cR3SYSwyDHzGN0kzkvGesGry5%2F6Lg; Path=/; HttpOnly Date: Mon, 02 Sep 2013 09:29:56 GMT
	Connection: keep-alive
	"no such id_media!"

Conclusion
-----------

Through these small examples, I hope that you can get started on the REST APIs!

