//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const fs = require("fs");

const app = express();

//Create a token.txt file and store your www.worldtradingdata.com API key in it
var apikey = fs.readFileSync("token.txt", "utf8");

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res){
  res.sendFile(__dirname + "/index.html");
});

app.post("/", function(req, res){
  console.log(apikey);
  var baseURL = "https://www.worldtradingdata.com/api/v1/stock?symbol=AAPL&api_token=" + apikey;

  var options = {
    url: baseURL,
    method: "GET"
  };

  request(options, function(error, response, body){
    res.write("<p>ALL DATA: " + body + "</p>");
    res.send();
  });
});

app.listen(3000, function(){
  console.log("Server running on port 3000");
});
