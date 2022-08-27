import fs from "fs";
import path from "path";
import { SlashCommandBuilder, Routes } from "discord.js";
import { REST } from "@discordjs/rest";
require("dotenv").config();

const undeploy = () => {
  const commands: any = [];
  const commandsPath = path.join(__dirname, "../commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: "10" }).setToken(
    process.env.TOKEN as string
  );

  rest
    .put(Routes.applicationCommands(process.env.CLIENT_ID as string), {
      body: [],
    })
    .then(() =>
      console.log("Successfully deregistered global application commands.")
    )
    .catch(console.error);
};

export default undeploy;
