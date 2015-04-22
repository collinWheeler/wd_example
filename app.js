var express = require('express');
var app = express();
var path = require("path");
var cheerio = require("cheerio");
var fs = require("fs");
var bodyParser = require('body-parser');
var mysql = require('mysql');
app.use(bodyParser.urlencoded());


app.get("/test", function (req, res) {
    $ = get_page('magic_page.html');
    $('#magic').text('Here is some new text!');
    res.send($.html())
})

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
    $ = get_page('home.html')
    res.send($.html());
});


app.get("/form1", function (req, res) {
    var input = req.query.kevin;
    if (input == undefined) {
        input = '';
    }
    $ = get_page('form1.html');
    $('#val').text(input);
    $('#textbox').val(input);
    res.send($.html());
    //res.send("<html> <body><a href='home'>Home</a> <h1> Entered value: " + input + "</h1><form action='' method='get'><input type='text' name='kevin' value='" + input + "'><input type='submit' value='Change Value'></form>  </body> </html>")
});

app.get("/magic",function(req,res){
    $=get_page('magic_page.html')
    if(req.query.var=='blue'){
        $('body').css('background-color','lightblue');
    }
    res.send($.html());
});

app.post("/form2", function (req, res) {
    var postData = req.body;

    var $ = get_page('form2_results.html');
    var jsonfile=fs.readFile('employees.json');
   // var thejson=JSON.parse(jsonfile);
    res.send(jsonfile);
    /*var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'js'
    });
    connection.connect();
    //connection.query('INSERT INTO entries VALUES (0,"test");');
    connection.query('SELECT * from entries', function (err, rows, fields) {
        if (!err) {
            rows.forEach(function (entryRow) {
                $('#results').append('<p>Entry: ' + entryRow.entry + '</p>')
            })
            for(var i=0;i<rows.length;i++){
                var entryRow=rows[0];
                $('#results').append('<p>Entry: ' + entryRow.entry + '</p>');
            }
        } else {
            $('#results').append('Query Error');
        }
    });
    connection.end();
    res.send($.html());*/
});
app.get("/form2", function (req, res) {
    $ = get_page('form2.html');
    res.send($.html());
});

app.get("/form3", function (req, res) {
    res.send("<html><body></body></html>")
});

app.listen(8088, function () {
});

function get_page(filepath) {
    var thefile=fs.readFileSync(filepath);
    return cheerio.load(thefile);
}

function db_connect() {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'js'
    });
}

function db_test() {
    //var mysql = require('mysql');
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'js'
    });

    connection.connect();

    connection.query('SELECT * from entries', function (err, rows, fields) {
        if (!err) {
            rows.forEach(function (entryRow) {
                console.log(entryRow.entry)
            })
        }
        else
            console.log('Error while performing Query.');
    });

    connection.end();
}