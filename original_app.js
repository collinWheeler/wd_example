var express = require('express');
var app = express();
var path = require("path");

app.get("/login", function (req, res) {
    res.sendFile(path.join(__dirname + "/login.html"));
});

app.get("/home", function (req, res) {
    var username = req.query.name;
    var passwd = req.query.password;
    if (username != undefined && passwd != undefined) {
        if (username != "collin" || passwd != 'collin') {
            var thealert = "alert('INCORRECT NAME OR PASSWORD! THE HOUNDS HAVE BEEN RELEASED!')";
        }
    }
});

app.get("/form1", function (req, res) {
    var input = req.query.kevin;
    if (input == undefined) {
        input = '';
    }
    res.send("<html> <body><a href='home'>Home</a> <h1> Entered value: " + input + "</h1><form action='' method='get'><input type='text' name='kevin' value='" + input + "'><input type='submit' value='Change Value'></form>  </body> </html>")
});

app.post("/form22", function (req, res) {
    res.send("<html> <body><a href='home'>Home</a> <h1>A: " + req.body.a1 + " </h1><h1>B: " + req.body.b1 + "</h1></body> </html>")
});
app.get("/form2", function (req, res) {
    res.send("<html> <body><a href='home'>Home</a> <h1> HELLO FORM2 </h1> <form action=\"/form22\" method=\"post\" > <input id=\"a1\" type=\"text\"name=\"a1\"/><input id=\"b1\" type=\"text\"name=\"b1\"/> <input id=\"s1\" type=\"submit\" name=\"sumbit\"/> </form> </body> </html>")
});

app.get("/form3", function (req, res) {
    res.send("<html><body></body></html>")
});

app.listen(8088, function () {
});
