import { authenticate, createHttp1Request } from 'league-connect'

const credentials = await authenticate()

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