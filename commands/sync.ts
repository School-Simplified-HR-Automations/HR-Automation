import { Stopwatch } from "@sapphire/stopwatch"
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import { dbSql } from ".."

module.exports = {
	data: new SlashCommandBuilder()
		.setName("sync")
		.setDescription("You don't need this."),
	permit: 10,
	async execute(interaction: ChatInputCommandInteraction, permit: number) {
		const sw = new Stopwatch().start()
		interaction.deferReply()
		if (!(interaction.user.id == "413462464022446084")) return
		await dbSql
			.sync({ logging: true })
			.then((res) => {
				return interaction.editReply(`Done - took ${sw.stop().toString()}`)
			})
			.catch((err) => {
				return interaction.editReply(`Error - ${err}`)
			})
	},
}
