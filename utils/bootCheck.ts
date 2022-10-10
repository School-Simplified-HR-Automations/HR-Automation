import { log } from "../services/logger"
import dotenv from "dotenv"
import { Client, TextBasedChannel } from "discord.js"
dotenv.config()

export class BootCheck {
	public static async check(): Promise<void> {
		class BootError extends Error {
			constructor(message: string) {
				super(message)
				this.name = "BootError"
			}
		}
		if (!process.env.TOKEN) {
			log.error("No TOKEN environment variable found.")
			throw new BootError("No TOKEN environment variable found.")
			process.exit(1)
		}
		if (!process.env.USER) {
			log.error("No USER environment variable found.")
			throw new BootError("No USER environment variable found.")
			process.exit(1)
		}
		if (!process.env.PW) {
			log.error("No PW environment variable found.")
			throw new BootError("No PW environment variable found.")
			process.exit(1)
		}
		if (!process.env.CLIENT_ID) {
			log.error("No CLIENT_ID environment variable found.")
			throw new BootError("No CLIENT_ID environment variable found.")
			process.exit(1)
		}
		if (!process.env.REC1) {
			log.error("No REC1 environment variable found.")
			throw new BootError("No REC1 environment variable found.")
			process.exit(1)
		}
		if (!process.env.REC2) {
			log.error("No REC2 environment variable found.")
			throw new BootError("No REC2 environment variable found.")
			process.exit(1)
		}
		if (!process.env.HIRE_EMAIL) {
			log.error("No HIRE_EMAIL environment variable found.")
			throw new BootError("No HIRE_EMAIL environment variable found.")
			process.exit(1)
		}
		if (!process.env.HIRE_APP_PW) {
			log.error("No HIRE_APP_PW environment variable found.")
			throw new BootError("No HIRE_APP_PW environment variable found.")
			process.exit(1)
		}
		if (!process.env.SQL_URI) {
			log.error("No SQL_URI environment variable found.")
			throw new BootError("No SQL_URI environment variable found.")
			process.exit(1)
		}
		if (!process.env.SQL_USERNAME) {
			log.error("No SQL_USERNAME environment variable found.")
			throw new BootError("No SQL_USERNAME environment variable found.")
			process.exit(1)
		}
		if (!process.env.SQL_PASSWORD) {
			log.error("No SQL_PASSWORD environment variable found.")
			throw new BootError("No SQL_PASSWORD environment variable found.")
			process.exit(1)
		}

		log.success("Boot check passed.")
	}

	public static async checkUpdate(client: Client): Promise<void> {
		class UpdateCheckError extends Error {
			constructor(message: string) {
				super(message)
				this.name = "UpdateCheckError"
			}
		}

		function discordTimestamp(timestamp: number) {
			return `<t:${Math.round(timestamp / 1000)}:T>`
		}

		if (!client.isReady()) {
			log.error("Client is not ready.")
			throw new UpdateCheckError("Client is not ready.")
		}

		//check if the bot updated
		const fs = require("fs")
		const config = require("../config.json")
		if (config.updated) {
			const messageLink = config.updateMessageLink
			const serverID = messageLink.split("/")[4]
			const channelID = messageLink.split("/")[5]
			const messageID = messageLink.split("/")[6]

			const server = await client.guilds.fetch(serverID)
			const channel = await server.channels.fetch(channelID) as TextBasedChannel
			const message = await channel?.messages.fetch(messageID)

			if (message) {
				let text = message.content
				text += `\n• ${discordTimestamp(Date.now())} - Restart complete\n• ${discordTimestamp(Date.now())} - Successfully Updated`
				message.edit(text)

				config.updated = false
				config.updateMessageLink = ""
				fs.writeFileSync("./config.json", JSON.stringify(config, null, 4))
			} else {
				config.updated = false
				config.updateMessageLink = ""
				fs.writeFileSync("./config.json", JSON.stringify(config, null, 4))
			}
		}

	}
}
