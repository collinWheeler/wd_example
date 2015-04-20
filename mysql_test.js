var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'js'
});

connection.connect();

connection.query('SELECT * from entries', function(err, rows, fields) {
  if (!err){
      rows.forEach(function(entryRow){
          console.log(entryRow.entry)
      })
  }
  else
    console.log('Error while performing Query.');
});

connection.end();