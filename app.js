var express = require('express');
var app = express();
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded())

//app.use(express.json());
//app.use(express.urlencoded());
//app.use(express.multipart());

app.get("/", function (req, res) {
	res.send("<html> <body> <h1> HELLO MOM </h1> </body> </html>")
});
app.get("/form1", function (req, res) {
	res.send("<html> <body> <h1> HELLO MOM "+ req.query.kevin +  "</h1> </body> </html>")
});

app.post("/form22", function (req, res) {
	res.send( "<html> <body> <h1>A: "+ req.body.a1 +" </h1><h1>B: " + req.body.b1 + "</h1> </body> </html>" ) });
app.get("/form2", function (req, res) {
	res.send("<html> <body> <h1> HELLO FORM2 </h1> <form action=\"/form22\" method=\"post\" > <input id=\"a1\" type=\"text\"name=\"a1\"/><input id=\"b1\" type=\"text\"name=\"b1\"/> <input id=\"s1\" type=\"submit\" name=\"sumbit\"/> </form> </body> </html>")
});

app.listen( 8088, function (){} );

