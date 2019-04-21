//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const request = require("request");
const fs = require("fs");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//User added stocks array empty at the beginning
let stocks = [];

//Create a token.txt file and store your www.worldtradingdata.com API key in it
const apikey = fs.readFileSync("token.txt", "utf8");

//Homepage and a example GET request for Apple stock with rendered data price data.
app.get("/", function(req, res){

    res.render("home", {
      stocks: stocks
    });
});

//Adding new stocks to follow
app.post("/add", function(req, res){
  const stock = {
    symbol: req.body.tickerSymbol
  };
  stocks.push(stock);
  res.redirect("/");
});

//Navigating and rendering a certain stock's information to an individual page
app.get("/stocks/:stockName", function(req, res){
  let requestedStockName = _.lowerCase(req.params.stockName);

  //Checks if the stock is included in the stocks array and requests stock data if so
  stocks.forEach(function(stock){
    let userStock = _.lowerCase(stock.symbol);
    if (userStock === requestedStockName){
      let baseURL = "https://www.worldtradingdata.com/api/v1/stock?symbol=" + stock.symbol +"&api_token=" + apikey;

      let options = {
        url: baseURL,
        method: "GET"
      };

      request(options, function(error, response, body){

        let stock_data = JSON.parse(body);

        let stock_object = stock_data.data;

        let stock_price = stock_object[0].price;

        let stock_currency = stock_object[0].currency;

        //Render stock data on the page
        res.render("stock", {
          stockPageTitle: stock.symbol,
          stockPagePrice: stock_price,
          stockPageCurrency: stock_currency
        });
      });
    }
  });
});

app.listen(3000, function(){
  console.log("Server running on port 3000");
});
