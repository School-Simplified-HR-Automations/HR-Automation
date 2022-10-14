import { CommandInteraction, SlashCommandBuilder } from "discord.js"
import ms from "ms"
import osu from "node-os-utils"
import { stripIndents } from "common-tags"
import { version } from "../package.json"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Replies with the websocket latency."),
	async execute(interaction: CommandInteraction) {
		const ping = interaction.client.ws.ping
		const uptime = ms(interaction.client.uptime as number)
		const cpuUsage = Math.round(await osu.cpu.usage())
		const memoryUsage = (await osu.mem.info()).usedMemPercentage
		osu.mem.totalMem

		interaction.reply(stripIndents`
			**Websocket latency:** ${ping}ms
			**Uptime:** ${uptime}
			**CPU usage:** ${cpuUsage}%
			**Memory usage:** ${memoryUsage}%
			 **Version:** ${version}
			`)
	},
}
