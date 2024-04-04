const express = require("express");
const https = require('https');
const app = express();
const port = process.env.PORT || 3001;
const APIkey = process.env.RitoApi;

// Define HTML content
const html = `
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
    </section>
  </body>
</html>
`;

app.get("/", (req, res) => res.type('html').send(html));

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
console.log("Server is running");

app.get('/summoner/:name', (req, res) => {
  const summonerName = req.params.name;
  const options = {
    hostname: 'oc1.api.riotgames.com',
    path: `/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${APIkey}`,
    method: 'GET'
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      const summonerInfo = JSON.parse(data);
      res.json(summonerInfo);
    });
  });

  request.on('error', (error) => {
    console.error("Error occurred:", error.message);
    res.status(500).json({ error: "Internal server error" });
  });

  request.end();
});
