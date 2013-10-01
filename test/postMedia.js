jQuery.post("/corpus/id", {
  	"id": "dd",  
	"name" : "ab"
}, function(data, textStatus, jqXHR) { 
    console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR); 
});