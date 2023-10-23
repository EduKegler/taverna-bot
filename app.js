import "dotenv/config";
import express from "express";
import {
  generateGroups,
  getChampions,
} from "./src/utils.js";
import {
  InteractionType,
  InteractionResponseType,
  MessageComponentTypes,
  ButtonStyleTypes,
  verifyKeyMiddleware
} from "discord-interactions";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

let currentGame;
app.post("/interactions", verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  const { type, data } = req.body;

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;
    if (name === "group") {

      if (currentGame) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: "Já tem um jogo em andamento" },
        });
      }

      const [names1, names2] = generateGroups();
      const [champions1, champions2] = getChampions();

      currentGame = {
        team1: names1.map((user) => user.name),
        team2: names2.map((user) => user.name),
      };

      const id = res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `
**Grupo 1:** ${names1.map((name) => name.id).join(" - ")}
**Champions:** \n${champions1.map((c) => `${c.icon} **${c.name}**`).join("\n")}
**\nGrupo 2**: ${names2.map((name) => name.id).join(" - ")}
**Champions:** \n${champions2.map((c) => `${c.icon} **${c.name}**`).join("\n")}
            
Quem ganhou? \n`,
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  custom_id: "team1_button",
                  label: "Primeiro Time",
                  style: ButtonStyleTypes.PRIMARY,
                },
                {
                  type: MessageComponentTypes.BUTTON,
                  custom_id: "team2_button",
                  label: "Segundo Time",
                  style: ButtonStyleTypes.DANGER,
                },
                {
                  type: MessageComponentTypes.BUTTON,
                  custom_id: "none",
                  label: "Nenhum",
                  style: ButtonStyleTypes.SECONDARY,
                },
              ],
            },
          ],
        },
      });
      return
    }

    if (name === "placar") {
      const file = fs.readFileSync("./ranking.json");
      const data = JSON.parse(file);
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: printRanking(data),
        },
      });
    }
  }

  if (type === InteractionType.MESSAGE_COMPONENT) {
    const componentId = data.custom_id;
    if (componentId === "team1_button" || componentId === "team2_button") {
      const isT1Winner = componentId === "team1_button";
      if (!currentGame) {
        const userId = req.body.member.user.id;
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `<@${userId}> o valor do jogo ja foi anotado no placar.`,
          },
        });
      }
      const file = fs.readFileSync("./ranking.json");
      const data = JSON.parse(file);
      const newScore = {
        totalMatches: data.totalMatches + 1,
        ranking: data.ranking.map((user) =>
          currentGame[isT1Winner ? "team1" : "team2"].includes(user.name)
            ? { name: user.name, score: user.score + 1 }
            : user
        ),
      };

      fs.writeFileSync("./ranking.json", JSON.stringify(newScore));
      currentGame = undefined;
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: printRanking(newScore),
        },
      });
    }

    if (componentId === "none") {
      if (!currentGame) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: "O valor desse jogo já foi computado" },
        });
      }
      const file = fs.readFileSync("./ranking.json");
      const data = JSON.parse(file);
      currentGame = undefined;
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: printRanking(data),
        },
      });
    }
  }
});

const printRanking = (data) => {
  const list = data.ranking.sort((a, b) => b.score - a.score);
  return `
  Placar - Total de Jogos **${data.totalMatches}**\`\`\`${list
    .map((user) => `${user.name} - ${user.score}`)
    .join("\n")}\`\`\`
  `;
};

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
