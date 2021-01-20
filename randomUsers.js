// this function inserts random datas to the database
var MongoClient = require('mongodb').MongoClient;
const { v4: uuidv4 } = require('uuid');
var faker = require('faker');

var url = "mongodb://localhost:27017/";
var country_iso_code_list = ["tr", "en", "us", "de", "es"];

function insertRandomFields(iterationAmount) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        for (i=0; i<iterationAmount; i++) {
            var dbo = db.db("game-x");
            var payload = {
                "user_id" : uuidv4(),
                "display_name" : faker.name.findName(),
                "points" : CreateRandomNumber(10, 900),
                "country" : country_iso_code_list[CreateRandomNumber(0, 5)],
                "timestamp" : Math.floor(Date.now() / 1000)
            };
            console.log(payload);
            dbo.collection("users").insertOne(payload, function (err, res) {
                if (err) throw err;
            });
        }
        db.close();
    });
}

function CreateRandomNumber(start, end) {
    return Math.floor(Math.random()*end + start);
}

insertRandomFields(50000-10);
