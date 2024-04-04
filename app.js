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

      function enterCheck(event) {
        if (event.key === "Enter") {
          const username = document.getElementById("username").value;
          window.location.href = '/summoner/' + username;
        }
      }
    </script>
  </head>
  <body>
    <section>
      Hello from Render!
      <input type="text" id="username" value="Username" onkeypress="enterCheck(event)">
    </section>
  </body>
</html>
`;

function renderPlayerData(error, data) {
  if (error) {
      console.error("Error occurred:", error.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  else{
    summonerInfo = data.summonerInfo;
    const playerHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>Player Information</title>
    </head>
    <body>
        <h1>Player Information</h1>
        <div>
            <label for="username">Username:</label>
            <span id="username"></span>
        </div>
        <div>
            <label for="accountLevel">Account Level:</label>
            <span id="accountLevel">${summonerInfo.name}</span>
        </div>
        <div>
            <label for="profileImage">Profile Image:</label>
            <img id="profileImage" src="" alt="Profile Image">
        </div>
    </body>
    </html>
    `;
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

app.get('/summoner/:name', async (req, res) => {
  const summonerName = req.params.name;

  try {
    // Fetch summoner information
    const summonerInfo = await fetchSummonerInfo(summonerName);

    // Fetch champion masteries
    const masteryInfo = await fetchChampionMasteries(summonerInfo.puuid);

    // Render player data
    const playerData = {
      summonerInfo: summonerInfo,
      masteryInfo: masteryInfo
    };
    renderPlayerData(null, playerData, res);
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

