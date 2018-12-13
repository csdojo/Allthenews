// Using the tools and techniques you learned so far,
// you will scrape a website of your choice, then place the data
// in a MongoDB database. Be sure to make the database and collection
// before running this exercise.

// Consult the assignment files from earlier in class
// if you need a refresher on Cheerio.

// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.send("Hello world");
});

// TODO: make two more routes

// Route 1
// =======
// This route will retrieve all of the data
// from the scrapedData collection as a json (this will be populated
// by the data you scrape using the next route)
app.get("/article-information", (req, res) => {

  db.scrapedData.find({}, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    res.json(data);
  })
})


// Route 2
// =======
// When you visit this route, the server will
// scrape data from the site of your choice, and save it to
// MongoDB.
// TIP: Think back to how you pushed website data
// into an empty array in the last class. How do you
// push it into a MongoDB collection instead?
app.get("/scrape", (req, res) => {

  // use axios to scrape a website
  axios.get("https://pitchfork.com/reviews/albums/")
    .then(({data: pitchforkData}) => {
      // load data into cheerio
      const $ = cheerio.load(pitchforkData);

      // create array to hold scraped data objects
      const reviewInfo = [];

      // iterate through reviews and get data out
      $(".review").each((i, element) => {
        
        let linkUrl = $(element).find("a").attr("href");
        linkUrl = `https://pitchfork.com${linkUrl}`;

        const albumImg = $(element).find("img").attr("src");
        const albumArtist = $(element).find(".artist-list > li").text();
        const albumTitle = $(element).find("h2.review__title-album").text();

        reviewInfo.push({linkUrl, albumImg, albumArtist, albumTitle})
      })

      // bulk insert into mongo db
      db.scrapedData.insert(reviewInfo, (err, data) => {
        if (err) {
          console.log(err);
          return res.status(500).json(err);
        }
        res.send("Scrape Complete");
      });

    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    })

})


/* -/-/-/-/-/-/-/-/-/-/-/-/- */

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});