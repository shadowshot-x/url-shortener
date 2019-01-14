// server.js
// where your node app starts

// init project
const express = require('express');

var mongodb = require('mongodb');
var shortid = require('shortid');
var validUrl = require('valid-url');
// var mLab = "mongodb://ujjwal26:ujjwal26599@ds155864.mlab.com:55864/short-url";
var mLab=process.env.MONGOLAB_URI;
var MongoClient = mongodb.MongoClient
const app = express();
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/new/:url(*)', function (req, res, next) {
  MongoClient.connect(mLab, function (err, db) {
  if (err) {
    console.log("Unable to connect to server", err);
  } else {
    
    console.log("Connected to server")
    
    var collection = db.collection('links');
    var params = req.params.url;
    
    var local = req.get('host'); + "/"
    
    var newLink = function (db, callback) {
        collection.findOne({ "url": params }, { short: 1, _id: 0 }, function (err, doc) {
          if (doc != null) {
            res.json({ original_url: params, short_url: "https://url-shortener-shadow.glitch.me/" + doc.short });
          } else {
            if (validUrl.isUri(params)) {
              // if URL is valid, do this
              var shortCode = shortid.generate();
              var newUrl = { url: params, short: shortCode };
              collection.insert([newUrl]);
              res.json({ original_url: params, short_url: "https://url-shortener-shadow.glitch.me/" + shortCode });
            } else {
            // if URL is invalid, do this
              res.json({ error: "Wrong url format, make sure you have a valid protocol and real site." });
            };
          };
        });
      };

    newLink(db, function () {
      db.close();
    });
    
    
  };
});
});

app.get('/:short', function (req, res, next) {

  MongoClient.connect(mLab, function (err, db) {
    if (err) {
      console.log("Unable to connect to server", err);
    } else {
      console.log("Connected to server")

      var collection = db.collection('links');
      var params = req.params.short;

      var findLink = function (db, callback) {
        
        collection.findOne({ "short": params }, { url: 1, _id: 0 }, function (err, doc) {
          if (doc != null) {
            res.redirect(doc.url);
          } else {
            res.json({ error: "No corresponding shortlink found in the database." });
          };
        });
      };

      findLink(db, function () {
        db.close();
      });

    };
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
