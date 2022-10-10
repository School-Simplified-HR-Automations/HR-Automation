// Import Header
import { Collection } from "@discordjs/collection"
import { Interaction, Client, GatewayIntentBits, Message, Partials, EmbedBuilder } from "discord.js"
import fs from "fs"
import path from "path"
require("dotenv").config()
import { log } from "./services/logger"
import { DataTypes, NUMBER, Sequelize } from "sequelize"
import { Stopwatch } from "@sapphire/stopwatch"
import { BootCheck } from "./utils/bootCheck"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import bodyParser from "body-parser"
import morgan from "morgan"
import Query from "./routes/query"
import model from "./models/Models"
import apiInit from "./legacy/app"
const sw = new Stopwatch().start()
BootCheck.check()

// Sequelize Client
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
})

model()


// Discord Client Declaration

const client: Client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildBans,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.Channel]
})
// @ts-ignore
client.commands = new Collection()
const commandsPath = path.join(__dirname, "commands")
const eventsPath = path.join(__dirname, "events")

const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith("ts"))

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file)
	const command = require(filePath)
	// @ts-ignore
	client.commands.set(command.data?.name, command)
}

client.textCommands = new Collection()
const textCommandFiles = fs
	.readdirSync("./textCommands")
	.filter((file) => file.endsWith(".ts"))
for (const file of textCommandFiles) {
	const command = require(`./textCommands/${file}`)
	client.textCommands.set(command.name, command)
}

// Module override

declare module "discord.js" {
	export interface Client {
		commands: Collection<unknown, any>
		textCommands: Collection<unknown, any>
	}
}

// Error Handler

process.on("unhandledRejection", (err: Error) => {
	log.error(err.stack, "unhandledRejection")
})

var debug = false;
if (debug) {
	client.on("debug", console.log)
}


// Express and API declaration

apiInit()

// Listener handler

const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

// Discord Login action

client.login(process.env.TOKEN)


// Export Footer

export default client
export {
	dbSql,
	sw,
	client
}
