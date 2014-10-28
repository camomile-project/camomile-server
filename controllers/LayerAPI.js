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

var async = require('async');
var commonFuncs = require('../lib/commonFuncs');


//check if a id_layer exists
exports.exist = function(req, res, next) {
	Layer.findById(req.params.id_layer, function(error, layer){
		if (error) res.status(400).json(error);
		else if (!layer) res.status(400).json({message:"id_layer don't exists"});
		else next();
	});
}



// only print username, role and description
printRes = function(layer, res) {
	var p = {"name":layer.name,
			 "description":layer.description,
			 "fragment_type":layer.fragment_type,
			 "data_type":layer.data_type,
			 "history":layer.history,
			};
	res.status(200).json(p);
}

// only print username, role and description for the list of l_layer
exports.printMultiRes = function(l_layer, res) {
	var p = [];
	for (i = 0; i < l_layer.length; i++) { 
		p.push({"name":l_layer[i].name,
				"description":l_layer[i].description,
				"fragment_type":l_layer[i].fragment_type,
				"data_type":l_layer[i].data_type,				
				"history":l_layer[i].history
		  	   })
	} 
	res.status(200).json(p);
}
exports.getInfo = function(req, res){
