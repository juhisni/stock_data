//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const request = require("request");
const fs = require("fs");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//User added stocks array empty at the beginning
let stocks = [];

//Search result object and number of results at the beginning
let searchDataObject = [];
let searchTotalResults;

//Create a token.txt file and store your www.worldtradingdata.com API key in it
const apikey = fs.readFileSync("token.txt", "utf8");

//Homepage
app.get("/", function(req, res) {

  //Rendered objects are empty by default
  res.render("home", {
    stocks: stocks,
    searchDataObject: searchDataObject,
    searchTotalResults: searchTotalResults
  });
});

//Adding new stocks to follow
app.post("/add", function(req, res) {
  const stock = {
    name: req.body.stockName,
    symbol: req.body.tickerSymbol
  };
  stocks.push(stock);
  res.redirect("/");
});

//Deleting a followed stock
app.post("/delete/:stockSymbol", function(req, res){
  let deletedStock = req.params.stockSymbol;
  //Loops through the stocks array to find the object that has symbol of deleted stock
  // and then splices that object from the stocks array.
  for (var i = 0; i < stocks.length; i++){
    if (stocks[i].symbol === deletedStock){
      stocks.splice(i, 1);
      break;
    }
  }
  res.redirect("/");
});

//Searching for stocks to add
app.post("/search", function(req, res) {

  let searchedStock = req.body.searchValue;
  let baseURL = "https://www.worldtradingdata.com/api/v1/stock_search?search_term=" + searchedStock + "&search_by=symbol,name&limit=5&page=1&api_token=" + apikey;

  let options = {
    url: baseURL,
    method: "GET"
  };

  request(options, function(error, response, body) {
    let searchData = JSON.parse(body);

    searchTotalResults = searchData.total_results;

    searchDataObject = searchData.data;
    res.redirect("/");
  });
});

//Navigating and rendering a certain stock's information to an individual page
app.get("/stocks/:stockName", function(req, res) {
  let requestedStockName = _.lowerCase(req.params.stockName);

  //Checks if the stock is included in the stocks array and requests stock data if so
  stocks.forEach(function(stock) {
    let userStock = _.lowerCase(stock.symbol);
    if (userStock === requestedStockName) {
      let baseURL = "https://www.worldtradingdata.com/api/v1/stock?symbol=" + stock.symbol + "&api_token=" + apikey;

      let options = {
        url: baseURL,
        method: "GET"
      };

      request(options, function(error, response, body) {

        let stockData = JSON.parse(body);

        let stockObject = stockData.data;

        //Stock data attributes
        let stockName = stockObject[0].name;
        let stockPrice = stockObject[0].price;
        let stockCurrency = stockObject[0].currency;
        let stockPriceOpen = stockObject[0].price_open;
        let stockDayChange = stockObject[0].day_change;
        let stockDayChangePercent = stockObject[0].change_pct;
        let stockCloseYesterday = stockObject[0].close_yesterday;


        //Render stock data on the page
        res.render("stock", {
          stockPageTitle: stock.symbol,
          stockPageName: stockName,
          stockPagePrice: stockPrice,
          stockPageCurrency: stockCurrency,
          stockPagePriceOpen: stockPriceOpen,
          stockPageCloseYesterday: stockCloseYesterday,
          stockPageDayChange: stockDayChange,
          stockPageDayChangePercent: stockDayChangePercent
        });
      });
    }
  });
});

app.listen(3000, function() {
  console.log("Server running on port 3000");
});
