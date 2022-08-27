import { Collection } from "@discordjs/collection";
import { Interaction, Client, GatewayIntentBits } from "discord.js";
import fs from "fs";
import path from "path";
require("dotenv").config();
import { log } from "./utils/logger";
import deploy from "./appcommands/deploy";
import { DataTypes, Sequelize } from "sequelize";
import "dotenv/config";
import { BootCheck } from "./utils/bootCheck";

/**
 * Note: the periodic @ts-ignore's are remedies to a persistent issue with d.js. Short answer - some things aren't very well received by the library.
 * Long answer - something to do with modules and declarations and subclasses and such. In a word, if it causes issues, see me personally.
 * - Tyler
 */

BootCheck.check();

// Create a new client instance
const dbSql = new Sequelize(process.env.SQL_URI as string, {
  username: process.env.SQL_USERNAME,
  password: process.env.SQL_PASSWORD,
  dialect: "mysql",
  ssl: true,
  dialectOptions: {
    ssl: {
      require: true,
    },
    multipleStatements: true,
  },
});
// model declarations

const Team = dbSql.define("Team", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});
const Supervisor = dbSql.define("Supervisor", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
const StaffFile = dbSql.define("StaffFile", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  personalEmail: {
    type: DataTypes.STRING,
    validate: {
      is: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    },
    allowNull: true,
  },
  companyEmail: {
    type: DataTypes.STRING,
    validate: {
      is: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    },
    allowNull: true,
  },
});
const PositionHistory = dbSql.define("PositionHistory", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dept: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  team: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  joined: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  quit: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});
const Position = dbSql.define("Position", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});
const DiscordInformation = dbSql.define("DiscordInfo", {
  username: {
    type: DataTypes.STRING,
    validate: {
      is: /.{1,}#[0-9]{4}/,
    },
    allowNull: false,
  },
  discordId: {
    type: DataTypes.STRING,
    validate: {
      is: /[0-9]{17,}/,
    },
    allowNull: false,
    unique: true,
  },
});
const Department = dbSql.define("Department", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

// Supervisor Associations
Supervisor.hasMany(Department);
Department.belongsTo(Supervisor);

Supervisor.belongsTo(StaffFile);
StaffFile.hasOne(Supervisor);

Supervisor.hasMany(Team);
Team.belongsToMany(Supervisor, { through: "TeamSupervisor" });

// StaffFile Associations
StaffFile.hasOne(DiscordInformation);
DiscordInformation.belongsTo(StaffFile);

StaffFile.hasMany(PositionHistory);
PositionHistory.belongsTo(StaffFile);

StaffFile.belongsTo(Team);
Team.hasMany(StaffFile);

StaffFile.belongsTo(Department);
Department.hasMany(StaffFile);

Position.hasMany(StaffFile);
StaffFile.belongsToMany(Position, {
  through: "PositionStaff",
});

// Team Associations

Team.belongsTo(Department);
Department.hasMany(Team);

// Others

Position.hasMany(PositionHistory);
PositionHistory.belongsTo(Position);

Department.hasMany(PositionHistory);
PositionHistory.belongsTo(Department);

Position.belongsTo(Department);
Department.hasMany(Position);

const client: Client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
  ],
});
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");

const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith("ts"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data?.name, command);
}

client.once("ready", async () => {
  log.success("Ready!");
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (
    interaction.isChatInputCommand() ||
    interaction.isMessageContextMenuCommand()
  ) {
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      const errID = log.error(
        error,
        `Error executing command ${interaction.commandName} on ${interaction.user.tag} (${interaction.user.id})`,
        true
      );
      await interaction.reply({
        content: `There was an error while executing this command. Error ID ${errID}`,
        ephemeral: true,
      });
    }
  }
});

deploy();
client.login(process.env.TOKEN);

export default client;
export {
  dbSql,
  Department,
  DiscordInformation,
  PositionHistory,
  Position,
  StaffFile,
  Supervisor,
  Team,
};
