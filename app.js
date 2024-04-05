const express = require("express");
const https = require('https');
const app = express();
const port = 3000;
const APIkey = "RGAPI-9fa86bfc-5f04-473d-b3fc-fefbc17f2462";

// Define HTML content
const mainHtml = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
    <style>
      body {
        background-color: #0A1428;
        color: #0397AB;
      }
    </style>
  </head>
  <body>
    <section>
      <input type="text" id="username" value="Username" onkeypress="enterCheck(event)">
    </section>
  </body>
</html>
`;

function renderPlayerData(error, data, res) {
    if (error) {
        console.error("Error occurred:", error.message);
        return res.status(500).json({ error: "Internal server error" });
        }
    else{
        const playerHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Hello from Render!</title>
            <link rel="stylesheet" type="text/css" href="/playerPage.css">
        </head>
        <body>
          <section class="AccountData">
            <img class="profileImage" src="https://ddragon.leagueoflegends.com/cdn/${data.gameVersion}/img/profileicon/${data.summonerInfo.profileIconId}.png" alt="Profile Icon" width="100" height="100">
            <h1 class="username">${data.summonerInfo.name}</h1>
            <p class="accountLevel">${data.summonerInfo.summonerLevel}</p>
          </section>
        </body>
        </html>
        `;
        //app.get(`/summoner/${summonerInfo.name}`, (req, res) => res.type('html').send(playerHtml));
        res.type('html').send(playerHtml);
    }
}

app.use(express.static("public"));
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
        // Make sure to handle errors when parsing JSON
        try {
          const parsedData = JSON.parse(data);
          callback(null, parsedData);
        } catch (error) {
          callback(error);
        }
      });
    });
  
    request.on('error', (error) => {
      // Handle errors from the request itself
      callback(error);
    });
  
    // Set timeout for the request (e.g., 10 seconds)
    request.setTimeout(10000, () => {
      request.abort(); // Abort the request if it takes longer than the specified timeout
      callback(new Error('Request timed out'));
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

// Function to get game version
function fetchGameVersion(callback) {
  const options = {
    hostname: 'ddragon.leagueoflegends.com',
    path: `/api/versions.json`,
    method: 'GET'
  };
  
  makeRequest(options, callback);
}

app.get('/summoner/:name', (req, res) => {
  const summonerName = req.params.name;

  // Fetch summoner information
  fetchSummonerInfo(summonerName, (error, summonerInfo) => {
    if (error) {
      console.error("Error fetching summoner info:", error.message);
      return res.status(500).json({ error: "Error fetching summoner information" });
    }

    // Fetch champion masteries
    fetchChampionMasteries(summonerInfo.puuid, (error, masteryInfo) => {
      if (error) {
        console.error("Error fetching champion masteries:", error.message);
        return res.status(500).json({ error: "Error fetching champion masteries" });
      }

      fetchGameVersion((error, gameVersion) => {
        if (error) {
          console.error("Error fetching champion masteries:", error.message);
          return res.status(500).json({ error: "Error fetching champion masteries" });
        }

        // Render player data
        const playerData = {
            summonerInfo: summonerInfo,
            masteryInfo: masteryInfo,
            gameVersion: gameVersion[0],
        };
        renderPlayerData(null, playerData, res);
        });
    });
  });
});
