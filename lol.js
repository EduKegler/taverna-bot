
import "dotenv/config";
import express from "express";
import { authenticate, createHttp1Request } from 'league-connect'

const credentials = await authenticate()

const app = express();
const PORT = process.env.PORT || 3000;

app.post("/start", async function (req, res) {
  
  await createHttp1Request({
    method: 'POST',
    url: '/lol-lobby/v2/lobby',
    body: {
      "customGameLobby": {
        "configuration": {
          "gameMode": "ARAM", "gameMutator": "", "gameServerRegion": "", "mapId": 12, "mutators": {"id": 1}, "spectatorPolicy": "AllAllowed", "teamSize": 3
        },
        "lobbyName": "Name",
        "lobbyPassword": null
      },
      "isCustom": true
    }
  }, credentials)

  const friends = [
      { name: 'Távín', id: '3544502'},
      { name: 'Juuliarocha', id: '5680412'},
      { name: 'JJwalker', id: '8290862'},
      { name: 'iZimmer', id: '48115735'},
  ]

  await createHttp1Request({
      method: 'POST',
      url: '/lol-lobby/v2/lobby/invitations',
      body: 
      friends.map(f => ({
          "invitationId": f.id.toString(),
          "toSummonerId": f.id,
          "toSummonerName": f.name
        }))
  }, credentials)
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});



