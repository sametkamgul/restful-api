var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}


var MongoClient = require('mongodb').MongoClient;
const { json } = require("express");
const { rejects } = require("assert");
var url = "mongodb://localhost:27017/";
//var result;
var rank;
// configuring bodyParser
app.use(bodyParser.urlencoded({
  extended:true
}));
app.use(bodyParser.json());

app.listen(3000, () => {
    console.log("Server runs on port 3000");
});

// returns the leaderboard - 3 gamers
app.get("/leaderboard", (req, res, next) => {
  var result;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("game-x");
    var mysort = { points: -1 };       // descending order
    dbo.collection("users").find({}, {projection: {_id:0, points:1, display_name:1, country:1}}).sort(mysort).limit(3).toArray(function(err, _result) {
      if (err) throw err;
      console.log(_result);
      result = _result;
      db.close();
      res.json(result);
    });
  });
});

async function getTopPlayers() {
  var result;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("game-x");
    var mysort = { points: -1 };       // descending order
    dbo.collection("users").find({}, {projection: {_id:0, points:1, display_name:1, country:1}}).sort(mysort).limit(3).toArray(function(err, _result) {
      if (err) throw err;
      console.log(_result);
      result = _result;
      //getRankofPlayer(result[0].points);
      db.close();
      //res.json(result);
      new Promise((resolve, reject) => setTimeout(resolve, 100));
    });
  });
  return result;
}

// returns the leaderboard by country iso code
app.get("/leaderboard/:country_iso_code", (req, res, country_iso_code) => {
  MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("game-x");
      var mysort = { points: -1 };       // descending order
      dbo.collection("users").find({"country": req.params.country_iso_code}, {projection: {_id:0, points:1, display_name:1, country:1}}).sort(mysort).limit(3).toArray(function(err, result) {
        if (err) throw err;
        res.json(result); //TODO: add a null check here
        db.close();
      });
    });
});


// this post updates the user's score - TODO: score_worth?
app.post("/score/submit", (req, res) => {
  var newValues;
  var payload;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("game-x");
    payload = {
      "points" : req.body.score_worth,
      "user_id" : req.body.user_id,
      "timestamp" : req.body.timestamp
    }
    newValues = {
      $set: payload
    };
    var myQuery = {
      user_id : req.body.user_id
    };
    dbo.collection("users").updateOne(myQuery, newValues, function(err, res) {
      if (err) throw err;
      console.log(req.body.user_id + " is updated");
      db.close();
      //console.log(payload);
    });
    res.status(200).json(payload);
  });
});


// GET /user/profile/{guid}
// this returns the user profile info
app.get("/user/profile/:guid", (req, res, next) => {
  console.log("guid: " + req.params.guid );  // debug print
  var playerScore;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("game-x");
    dbo.collection("users").findOne({"user_id" : req.params.guid}, {projection: {_id:0, user_id:1, points:1, display_name:1}}).then((value) => {
      getRankofPlayer(value.points).then(function(rank){
        value.rank = rank + 1;
        res.json(value);
      });
    });
    
    // dbo.collection("users").find({"user_id" : req.params.guid}, {projection: {_id:0, user_id:1, points:1, display_name:1}}).sort(mysort).limit(1).toArray(function(err, result){
      //   if (err) throw err;
      //   db.close();
      //   result = result[0];
      //   playerScore = result.points;
      //   console.log(result);
      // });
    });
});

// getting the rank of player by its score
async function getRankofPlayer(playerScore) {
  var rank;
 
  console.log("search score: " + playerScore);
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("game-x");
    var pipeline = [
      {
        $match: {
          points: {
            $gt: playerScore
          }
        }
      },
      {
        $count: "passing_scores"
      }
    ];
    dbo.collection("users").aggregate(pipeline).toArray(function(err, res) {
      rank = res[0].passing_scores;
      //FIXME: passing value problem
    });

  });
  await new Promise((resolve, reject) => setTimeout(resolve, 100));
  console.log("return: " + rank);
  return rank;
};


// POST /user/create
// this creates a new user
app.post("/user/create", (req, res, next) => {
  console.log("post /user/create");
  console.log(req.body);
  var result = req.body;
  //console.log(result);
  
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("game-x");
    // creating unixtime for timestamp
    var epoch = Math.floor(Date.now() / 1000);
    result.timestamp = epoch; // add to JSON
    dbo.collection("users").insertOne(result, function (err, res) {
      if (err) throw err;
      //console.log("user is created.");
      //console.log(result);
     
    });
    dbo.collection("users").findOne({"user_id" : result.user_id}, {projection: {_id:0, user_id:1, points:1, display_name:1}}, (function(err, result){
      if (err) throw err;
      db.close();
      console.log(result);
      res.json(result);
    }));
  });
});


app.get("*", (req, res) => {
  res.status(404).json("The resource cannot be found");
});


