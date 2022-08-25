import { Collection } from "@discordjs/collection";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, GuildMember, Interaction, InteractionType, Message, Presence, TextChannel, Client, GatewayIntentBits, EmbedBuilder, Embed, ColorResolvable } from "discord.js";
import fs from "fs"
import ms from "ms";
import path from "path"
require("dotenv").config()
import { log } from "./utils/logger";
import deploy from "./appcommands/deploy";
import { DataTypes, Sequelize } from "sequelize"
import { isTypeLiteralNode } from "typescript";
const sequelize = require("sequelize")
/**
 * Note: the periodic @ts-ignore's are remedies to a persistent issue with d.js. Short answer - some things aren't very well received by the library.
 * Long answer - something to do with modules and declarations and subclasses and such. In a word, if it causes issues, see me personally.
 * - Tyler
 */

// Create a new client instance
const dbSql = new Sequelize('mysql://tyler:HR-AZURE-3719-AEcF@hr-automations.db.schoolsimplified.org:3306/hr', {
    username: "tyler",
    password: "HR-AZURE-3719-AEcF",
    dialect: "mysql",
    ssl: true,
    dialectOptions: {
        ssl: {
            require: true
        },
        multipleStatements: true
    }
})
// model declarations


const Team = dbSql.define('Team', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})
const Supervisor = dbSql.define("Supervisor", {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    }
})
const StaffFile = dbSql.define('StaffFile', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    personalEmail: {
        type: DataTypes.STRING,
        validate: {
            is: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        },
        allowNull: true
    },
    companyEmail: {
        type: DataTypes.STRING,
        validate: {
            is: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        },
        allowNull: true
    }
})
const PositionHistory = dbSql.define("PositionHistory", {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dept: {
        type: DataTypes.STRING,
        allowNull: false
    },
    team: {
        type: DataTypes.STRING,
        allowNull: true
    },
    joined: {
        type: DataTypes.DATE,
        allowNull: false
    },
    quit: {
        type: DataTypes.DATE,
        allowNull: true
    }
})
const Position = dbSql.define('Position', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})
const DiscordInformation = dbSql.define('DiscordInfo', {
    username: {
        type: DataTypes.STRING,
        validate: {
            is: /.{1,}#[0-9]{4}/
        },
        allowNull: false
    },
    discordId: {
        type: DataTypes.STRING,
        validate: {
            is: /[0-9]{17,}/
        },
        allowNull: false,
        unique: true
    }
})
const Department = dbSql.define('Department', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})

// Supervisor Associations
Supervisor.hasMany(Department)
Department.belongsTo(Supervisor)

Supervisor.belongsTo(StaffFile)
StaffFile.hasOne(Supervisor)

Supervisor.hasMany(Team)
Team.belongsTo(Supervisor)

// StaffFile Associations
StaffFile.hasOne(DiscordInformation)
DiscordInformation.belongsTo(StaffFile)

StaffFile.hasMany(PositionHistory)
PositionHistory.belongsTo(StaffFile)

StaffFile.belongsTo(Team)
Team.hasMany(StaffFile)

StaffFile.belongsTo(Department)
Department.hasMany(StaffFile)

Position.hasMany(StaffFile)
StaffFile.belongsToMany(Position, {
    through: "PositionStaff"
})

// Team Associations

Team.belongsTo(Department)
Department.hasMany(Team)

// Others

Position.hasMany(PositionHistory)
PositionHistory.belongsTo(Position)

Department.hasMany(PositionHistory)
PositionHistory.belongsTo(Department)

Position.belongsTo(Department)
Department.hasMany(Position)



const client: Client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildBans, GatewayIntentBits.GuildMessages] });
// @ts-ignore
client.commands = new Collection()
const commandsPath = path.join(__dirname, 'commands')
const eventsPath = path.join(__dirname, 'events')

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith("ts"))

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)
    // @ts-ignore
    client.commands.set(command.data?.name, command)
}


client.once('ready', async () => {
    log.success('Ready!');
    dbSql.sync()
});


client.on('interactionCreate', async (interaction: Interaction) => {

    if (interaction.isChatInputCommand() || interaction.isMessageContextMenuCommand()) {
        // @ts-ignore
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

deploy()
client.login(process.env.TOKEN);

export default client
export { dbSql, Department, DiscordInformation, PositionHistory, Position, StaffFile, Supervisor, Team }