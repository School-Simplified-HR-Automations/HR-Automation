import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import sendError from "../utils/sendError"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("")
		.setDescription(""),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
            await interaction.deferReply()

        } catch (err) {
            sendError(err, interaction, true)
        }
	},
}
