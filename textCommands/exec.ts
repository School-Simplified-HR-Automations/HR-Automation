import { AttachmentBuilder, Message } from "discord.js"
import { log } from "../services/logger"
import { Security } from "../services/security"
import { Stopwatch } from "@sapphire/stopwatch"
import { codeBlock } from "@sapphire/utilities"
import { exec } from "node:child_process"

module.exports = {
	name: "exec",
	description: "Executes a code snippet.",
	aliases: ["ex", "execute"],
	async execute(message: Message, args: string[]) {
		await Security.isEvalerUser(message.author)
			.then(async (result: any) => {
				if (result.status !== 1) {
					message.reply(
						`\`\`\`diff\n-Security Service Error ${result.status}: ${result.message}\n\`\`\``
					)
					return
				} else {
					let code = args.join(" ")
					if (!code) {
						message.reply("**Error:** No code provided.")
						return
					}

					const clean = async (text: any) => {
						if (text && text.constructor.name == "Promise") text = await text
						if (typeof text !== "string")
							text = require("util").inspect(text, { depth: 1 })
						text = text
							.replace(/`/g, "`" + String.fromCharCode(8203))
							.replace(/@/g, "@" + String.fromCharCode(8203))
						return text
					}

					await Security.execCheck(code, message.author)
						.then(async (result: any) => {
							if (result.status !== 1) {
								message.reply(
									`\`\`\`diff\n-Security Service Error ${result.status}: ${result.message}\n\`\`\``
								)
								return
							} else {
								try {
									const stopwatch = new Stopwatch()
									exec(code, (error, stdout, stderr) => {
										if (error) {
											const attachment = new AttachmentBuilder(
												Buffer.from(error.message),
												{
													name: "error-output.txt",
													description: `Output of shell execution by ${message.author.tag}.`,
												}
											)
											message.channel.send({
												content: `${stopwatch.toString()}.`,
												files: [attachment],
											})
										} else {
											const attachment = new AttachmentBuilder(
												Buffer.from(stdout),
												{
													name: "stdout-output.txt",
													description: `Output of shell execution by ${message.author.tag}.`,
												}
											)

											const attachment2 = new AttachmentBuilder(
												Buffer.from(stderr),
												{
													name: "stderr-output.txt",
													description: `Output of shell execution by ${message.author.tag}.`,
												}
											)

											message.channel.send({
												content: `${stopwatch.toString()}.`,
												files: [attachment, attachment2],
											})
										}
									})
								} catch (error) {
									const attachment = new AttachmentBuilder(
										Buffer.from(await clean(error)),
										{
											name: "error-output.txt",
											description: `Output of shell execution by ${message.author.tag}.`,
										}
									)
									message.channel.send({
										files: [attachment],
									})
								}
							}
						})
						.catch((error: any) => {
							log.error(error, "Failed to check executor user")
							message.reply(
								`\`\`\`diff\nSecurity Service Error 2: Internal error\n\`\`\``
							)
						})
				}
			})
			.catch((error: any) => {
				log.error(
					error,
					`Failed to check executor user ${message.author.tag} (${message.author.id})`
				)
				message.reply(
					`\`\`\`diff\nSecurity Service Error 2: Internal error\n\`\`\``
				)
			})
	},
}
