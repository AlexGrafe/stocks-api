// server.js
// where your node app starts

// init project
var express = require('express');
var bodyParser = require('body-parser');
const request = require('request');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// init sqlite db
var fs = require('fs');
var dbFile = './.data/sqlite.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function(){
  if (!exists) {
    db.run('CREATE TABLE Dreams (dream TEXT)');
    // console.log('New table Dreams created!');
    
    // insert default dreams
    db.serialize(function() {
      db.run('INSERT INTO Dreams (dream) VALUES ("Find and count some sheep"), ("Climb a really tall mountain"), ("Wash the dishes")');
    });
  }
  else {
    // console.log('Database "Dreams" ready to go!');
    db.each('SELECT * from Dreams', function(err, row) {
      if ( row ) {
        //console.log('record:', row);
      }
    });
  }
});


const reqResponse = (error, response, rawBody) => ({
  headers: response.headers,
  body: response.body,
  bodyJSON: JSON.parse(response.body),
  statusCode: response.statusCode,
  headersRaw: response.rawHeaders
});




// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(req, res) {
  // response.sendFile(__dirname + '/views/index.html');
  

  
  request({
    method: "POST",
    uri: "https://www.tradegate.de/refresh.php",
    qs: {
      isin: "US70450Y1038"      
    },
    headers: {
      "accept": "application/json, text/javascript, */*; q=0.01",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "en-US,en;q=0.9,de-DE;q=0.8,de;q=0.7",
      "content-length": "0",
      "origin": "https://www.tradegate.de",
      "referer": "https://www.tradegate.de/orderbuch.php?isin=US70450Y1038",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3861.0 Safari/537.36",
      "x-requested-with": "XMLHttpRequest" 
    },
    gzip: true
  },
  function (error, response, body) {
    if (error === null) {
      const r = reqResponse(error, response, body);
      console.log("request response", r);
      // response.request. method, uri, headers, port, path
      res.send("ISIN US70450Y1038: ...: € PayPal" + r.bodyJSON.avg);
    }
    else {
      console.warn("error", {error, response})
      res.send("An error occured");
    }
  });
  
});

// endpoint to get all the dreams in the database
// currently this is the only endpoint, ie. adding dreams won't update the database
// read the sqlite3 module docs and try to add your own! https://www.npmjs.com/package/sqlite3
app.get('/getDreams', function(request, response) {
  db.all('SELECT * from Dreams', function(err, rows) {
    response.send(JSON.stringify(rows));
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
