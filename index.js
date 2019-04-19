//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const request = require("request");
const fs = require("fs");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Create a token.txt file and store your www.worldtradingdata.com API key in it
var apikey = fs.readFileSync("token.txt", "utf8");

app.get("/", function(req, res){
  var baseURL = "https://www.worldtradingdata.com/api/v1/stock?symbol=AAPL&api_token=" + apikey;

  var options = {
    url: baseURL,
    method: "GET"
  };

  request(options, function(error, response, body){

    var stock_data = JSON.parse(body);

    var stock_object = stock_data.data;

    var stock_price = stock_object[0].price;

    var stock_currency = stock_object[0].currency;

    res.render("home", {
      exampleStockPrice: stock_price,
      exampleStockCurrency: stock_currency
    });
  });
});

app.listen(3000, function(){
  console.log("Server running on port 3000");
});
