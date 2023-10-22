import "dotenv/config";
import express from "express";
import { InteractionType, InteractionResponseType } from "discord-interactions";
import {
  VerifyDiscordRequest,
  generateGroups,
  getChampions,
} from "./src/utils.js";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.post("/interactions", async function (req, res) {
  const { type, data } = req.body;

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;
    if (name === "group") {
      const [names1, names2] = generateGroups();
      const [champions1, champions2] = getChampions();

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `
**Grupo 1:** ${names1.join(" - ")}
**Champions:** \n${champions1.map((c) => `${c.icon} **${c.name}**`).join("\n")}
**Grupo 2**: ${names2.join(" - ")}
**Champions:** \n${champions2
            .map((c) => `${c.icon} **${c.name}**`)
            .join("\n")}`,
        },
      });
    }
  }
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
