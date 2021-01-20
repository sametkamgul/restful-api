var express = require("express");
var app = express();
var bodyParser = require("body-parser");

// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/website";

// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   console.log("Database created!");
//   db.close();
// });

// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("website");
//     var myobj = { name: "Company Inc", address: "Highway 37" };
//     dbo.collection("posts").insertOne(myobj, function(err, res) {
//         if (err) throw err;
//         console.log("1 document inserted");
//         db.close();
//     });
// });

// MongoClient.connect(url, function(err, db) {
// if (err) throw err;
// var dbo = db.db("website");
// dbo.collection("posts").findOne({}, function(err, result) {
//     if (err) throw err;
//     console.log(result.name);
//     db.close();
// });
// });

// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("website");
//     dbo.collection("posts").find({}).toArray(function(err, result) {
//       if (err) throw err;
//       console.log(result);
//       db.close();
//     });
//   });

//   MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("website");
//     dbo.collection("posts").find({}, { projection: { _id: 0} }).toArray(function(err, result) {
//       if (err) throw err;
//       console.log(result);
//       db.close();
//     });
//   });


//   MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("website");
//     var query = { Student_Name: "Samet" };
//     dbo.collection("users").find(query).toArray(function(err, result) {
//       if (err) throw err;
//       console.log(result);
//       db.close();
//     });
//   });


var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

// configuring bodyParser
app.use(bodyParser.urlencoded({
  extended:true
}));
app.use(bodyParser.json());
var result


// get top three datas

// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("website");
//   var mysort = { Age: -1 };
//   dbo.collection("users").find().sort(mysort).limit(3).toArray(function(err, result) {
//     if (err) throw err;
//     console.log(result);
//     db.close();
//   });
// });


// MongoDB structure:
// {
//   "user_id" : "ered-ere-ddd-e",
//   "display_name ": "samet",
//   "points" : 0,
//   "country" : "tr",
//   "timestamp" : 593939
// }

app.listen(3000, () => {
    console.log("Server runs on port 3000");
});

// returns the leaderboard - 3 gamers
app.get("/leaderboard", (req, res, next) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("game-x");
        var mysort = { points: -1 };       // descending order
        dbo.collection("users").find().sort(mysort).limit(3).toArray(function(err, result) {
          if (err) throw err;
          console.log(result);
          db.close();
          res.status(200).json(result);
        });
      });
});

// returns the leaderboard by country iso code
app.get("/leaderboard/:country_iso_code", (req, res, country_iso_code) => {
  MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("game-x");
      var mysort = { points: -1 };       // descending order
      dbo.collection("users").find({"country": req.params.country_iso_code}).sort(mysort).limit(3).toArray(function(err, result) {
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
  console.log(req.params.guid );  // debug print
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("game-x");
    dbo.collection("users").find({"user_id" : req.params.guid}).toArray(function(err, result){
      if (err) {
        return res.status(404).send({
          message: "The resource cannot be found: " + res.params.guid
        });
      } else {
        res.status(200).json(result);
      }
      db.close();
    });
  });
});

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
      console.log("user is created.");
      console.log(result);
      res.status(404).send("The resource cannot be found");
      db.close();
    });
    res.status(200).json(result);
  });
});


app.get("*", (req, res) => {
  res.status(404).json("The resource cannot be found");
});