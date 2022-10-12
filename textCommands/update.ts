import { Message } from "discord.js"
import { Security } from "../services/security"
import { Timestamp } from "../utils/timestamp";
const exec = (require("util").promisify((require("child_process").exec)));
module.exports = {
	name: "update",
	description: "Updates the bot",
	async execute(value?: Message | string) {
		if (value && value instanceof Message) {
			await Security.isEvalerUser(value.author)
				.then(async (result: any) => {
					if (result.status !== 1) {
						value.reply(
							`\`\`\`diff\n-Security Service Error ${result.status}: ${result.message}\n\`\`\``
						)
						return
					} else {
						let text = `**Updating ${value.client.user.username}**\n\n• ${Timestamp.generate("D", undefined, Date.now())} - Pulling from GitHub`
						const updateMsg = await value.channel.send(text)
						exec("git pull")
							.then(async () => {
								text += `\n• ${Timestamp.generate("D", undefined, Date.now())} - Pulled from GitHub`
								await updateMsg.edit(text)
							})

						text += `\n• ${Timestamp.generate("D", undefined, Date.now())} - Restarting`
						await updateMsg.edit(text)

						const fs = require("fs")
						const config = require("../config.json")
						config.updated = true
						config.updateMessageLink = updateMsg.url
						fs.writeFileSync("./config.json", JSON.stringify(config, null, 4))

						exec("pm2 restart all")
					}
				})
		} else {
			exec("git pull")
			const fs = require("fs")
			const config = require("../config.json")
			config.updated = true
			config.updateMessageLink = "Updated via API."
			fs.writeFileSync("./config.json", JSON.stringify(config, null, 4))
			exec("pm2 restart all")
		}
	}
}