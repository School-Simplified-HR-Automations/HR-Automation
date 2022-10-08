import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import Query from "../routes/query"
import sendError from "../utils/sendError"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("profile-edit")
		.setDescription("Edit your Staff File personal details.")
        .addStringOption(opt => opt.setName("field").setDescription("The field to change.").addChoices(
            {
                name: "Personal Email",
                value: "p-email"
            },
            {
                name: "Photo",
                value: "photo"
            },
            {
                name: "Phone",
                value: "phone"
            },
            {
                name: "Gender Identity",
                value: "gen-identity"
            },
        ).setRequired(true))
        .addStringOption(opt => opt.setName("value").setDescription("Value to set to target field.").setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
            await interaction.deferReply({ ephemeral: true })
            let id = (interaction.user.id.slice(interaction.user.id.length-6) == '446084' ? 1 : parseInt(interaction.user.id.slice(interaction.user.id.length - 6)))
            let staff = await Query.staff.getStaffById(id)
            if (!staff) return interaction.editReply({ content: "No profile found for your user ID. If this is believed to be an error, contact HRIS." })
            let opt = interaction.options.getString("opt") as string
            let arg = interaction.options.getString("arg") as string
            if (opt == "p-email") {
                
            }
        } catch (err) {
            sendError(err, interaction, false)
        }
	},
}
