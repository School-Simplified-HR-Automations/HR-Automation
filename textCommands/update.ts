import { Message } from "discord.js"
import { Security } from "../services/security"
const exec = (require("util").promisify((require("child_process").exec)));
module.exports = {
	name: "update",
	description: "Updates the bot",
	async execute(message: Message, args: string[]) {
		await Security.isEvalerUser(message.author)
			.then(async (result: any) => {
				if (result.status !== 1) {
					message.reply(
						`\`\`\`diff\n-Security Service Error ${result.status}: ${result.message}\n\`\`\``
					)
					return
				} else {

					function discordTimestamp(timestamp: number) {
						return `<t:${Math.round(timestamp / 1000)}:T>`
					}

					let text = `**Updating ${message.client.user.username}**\n\n• ${discordTimestamp(Date.now())} - Pulling from GitHub` 
					const updateMsg = await message.channel.send(text)
					exec("git pull")
						.then(async () => {
							text += `\n• ${discordTimestamp(Date.now())} - Pulled from GitHub`
							await updateMsg.edit(text)
						})
					
					text += `\n• ${discordTimestamp(Date.now())} - Restarting`
					await updateMsg.edit(text)

					const fs = require("fs")
					const config = require("../config.json")
					config.updated = true
					config.updateMessageLink = updateMsg.url
					fs.writeFileSync("./config.json", JSON.stringify(config, null, 4))

					exec("pm2 restart all")
				}
			})
	}
}