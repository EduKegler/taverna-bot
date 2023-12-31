import "dotenv/config";
import fetch from "node-fetch";
import { verifyKey } from "discord-interactions";
import { champions } from "./champions.js";
import { users } from "./users.js";

export function VerifyDiscordRequest(clientKey) {
  return function (req, res, buf) {
    const signature = req.get("X-Signature-Ed25519");
    const timestamp = req.get("X-Signature-Timestamp");

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    console.log(isValidRequest)
    if (!isValidRequest) {
      res.status(401).send("Bad request signature");
      throw new Error("Bad request signature");
    }
  };
}

export async function DiscordRequest(endpoint, options) {
  const url = "https://discord.com/api/v10/" + endpoint;
  if (options.body) options.body = JSON.stringify(options.body);
  console.log(process.env.DISCORD_TOKEN);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      "Content-Type": "application/json; charset=UTF-8",
      "User-Agent":
        "TavernaBot (https://github.com/EduKegler/taverna-bot, 1.0.0)",
    },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json();
    console.log(res);
    throw new Error(JSON.stringify(data));
  }
  return res;
}

export async function InstallGlobalCommands(appId, commands) {
  const endpoint = `applications/${appId}/commands`;

  try {
    await DiscordRequest(endpoint, { method: "PUT", body: commands });
  } catch (err) {
    console.error(err);
  }
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateGroups() {
  const newNames = shuffleArray(users);
  return [newNames.slice(0, 3), newNames.slice(3, 6)];
}

export function getChampions() {
  const championList = shuffleArray(champions);
  return [championList.slice(0, 10), championList.slice(10, 20)];
}
