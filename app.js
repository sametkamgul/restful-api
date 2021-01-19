var express = require("express");
var app = express();

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/website";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});

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

MongoClient.connect(url, function(err, db) {
if (err) throw err;
var dbo = db.db("website");
dbo.collection("posts").findOne({}, function(err, result) {
    if (err) throw err;
    console.log(result.name);
    db.close();
});
});

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

app.listen(3000, () => {
    console.log("Server runs on port 3000");
});

app.get("/topscores", (req, res, next) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("website");
        var mysort = { Age: -1 };       // descending order
        dbo.collection("users").find().sort(mysort).limit(3).toArray(function(err, result) {
          if (err) throw err;
          console.log(result);
          res.json(result);
          db.close();
        });
      });
});

app.get("/url", (req, res, next) => {
    // res.json(["Kevin", "Neil", "Antony", "Jonas", "Lambert"]);
    res = result;
    console.log(result);
});

console.log(arguments);
