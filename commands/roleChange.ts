import { ActionRowBuilder, SelectMenuBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js"
import Query from "../routes/query"
import sendError from "../utils/sendError"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("role-change")
		.setDescription("(3+) Options for changing and updating position roles.")
        .addUserOption(opt => opt.setName("target").setDescription("Target user to update.").setRequired(true)),
	permit: 3,
	async execute(interaction: ChatInputCommandInteraction, permit: number) {
		try {
            await interaction.deferReply()
			const user = interaction.options.getUser("target", true)
            const staff = await Query.staff.getStaffById(parseInt(user.id.slice(user.id.length - 6)))
			if (!staff) {
				const embed = new EmbedBuilder().setTitle("No Results Returned").setColor("Red").setDescription("No results could be found given your search query. If you believe this is in error, please open a ticket with HRIS.")
                return interaction.editReply({ embeds: [embed] })
			}
			const poshis = await Query.positionHistory.getHistoryById(staff.id)
			const current = poshis.filter(hist => !hist.quit)
			const menu = new SelectMenuBuilder().setCustomId("posalter").addOptions(
				{
					label: "Add New Position",
					description: `Add a new position for ${staff.name}`,
					value: `newpos-${staff.id}`
				}
			)
			if (current.length > 0) {
				for (let i = 0; i < current.length; i++) {
					menu.addOptions(
						{
							label: `${current[i].title}`,
							description: `Edit record.`,
							value: `edit-${current[i].id}`
						}
					)
				}
			}
			const embed = new EmbedBuilder().setTitle("Add or Alter Positions").setDescription(`Use the below menu to select which position to alter, or click the first option to add a new position.`)
			const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(menu)
			await interaction.editReply({ embeds: [embed], components: [row] })
        } catch (err) {
            sendError(err, interaction, true)
        }
	},
}