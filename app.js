const express = require("express");
const https = require('https');
const app = express();
const port = process.env.PORT || 3001;
const APIkey = process.env.RitoApi;

// Define HTML content
const mainHtml = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
    <script>
      function displayError(message) {
        console.error(message);
        // Display error message in the browser console
      }
      
      function displayMessage(message) {
        console.log(message);
        // Display general message in the browser console
      }
    </script>
  </head>
  <body>
    <section>
      Hello from Render!
      <input type:"text" id="username" value="Username onkeypress=enterCheck(key)">
    </section>
  </body>
</html>
`;

function enterCheck(key){
  var e = key.code;
  if(e == "Enter"){
    username = document.getElementById("username").value;
    app.get('*', function(req, res) {
        res.redirect('/summoner/${username}');
    });
  }
}

let summonerPUUID = '';
let username = '';
let accountLevel = '';

app.get("/", (req, res) => res.type('html').send(mainHtml));

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
console.log("Server is running");

// Function to make API call
function makeRequest(options, callback) {
  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      callback(null, JSON.parse(data));
    });
  });

  request.on('error', (error) => {
    callback(error);
  });

  request.end();
}

// Function to fetch summoner information
function fetchSummonerInfo(summonerName, callback) {
  const options = {
    hostname: 'oc1.api.riotgames.com',
    path: `/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${APIkey}`,
    method: 'GET'
  };

  makeRequest(options, callback);
}

// Function to fetch champion masteries
function fetchChampionMasteries(summonerPUUID, callback) {
  const options = {
    hostname: 'oc1.api.riotgames.com',
    path: `/lol/champion-mastery/v4/champion-masteries/by-puuid/${summonerPUUID}?api_key=${APIkey}`,
    method: 'GET'
  };

  makeRequest(options, callback);
}

app.get('/summoner/:name', (req, res) => {
  const summonerName = req.params.name;

  fetchSummonerInfo(summonerName, (error, summonerInfo) => {
    if (error) {
      console.error("Error occurred:", error.message);
      return res.status(500).json({ error: "Internal server error" });
    }

    summonerPUUID = summonerInfo.puuid;
    username = summonerInfo.name;
    accountLevel = summonerInfo.summonerLevel;

    fetchChampionMasteries(summonerPUUID, (error, masteryInfo) => {
      if (error) {
        console.error("Error occurred:", error.message);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Filter the top 5 champion masteries
      const top5Masteries = masteryInfo.slice(0, 5);
      res.json(top5Masteries);
    });
  });
});
