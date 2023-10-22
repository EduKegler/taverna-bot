import "dotenv/config";
import { InstallGlobalCommands } from "./utils.js";

const GROUP_COMMAND = {
  name: "group",
  description: "Group Command",
  type: 1,
};

const ALL_COMMANDS = [GROUP_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
