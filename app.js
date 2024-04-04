const express = require("express");
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3001;
const APIkey = process.env.RitoApi;

// Define HTML content
const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
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

app.get('/summoner/:name', async (req, res) => {
  const summonerName = req.params.name;
  try {
    const response = await axios.get(`https://oc1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${APIkey}`);
    const summonerInfo = response.data;
    res.json(summonerInfo);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("Summoner not found:", error.response.data);
      res.status(404).json({ error: "Summoner not found" });
    } else {
      displayError("aaaaaaaaaaaaaaaaaaaaaaaaa");
      displayError(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});
