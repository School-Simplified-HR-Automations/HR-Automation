import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import { dbSql } from ".."
import Query from "../routes/query"
import sendError from "../utils/sendError"

module.exports = {
    data: new SlashCommandBuilder()
        .setName("permit")
        .setDescription("You don't need this.")
        .addStringOption(opt => opt.setName("user-id").setDescription("The Discord User ID of the target.").setRequired(true))
        .addNumberOption(opt => opt.setName("permit").setDescription("The permit level you want to set.").setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            await interaction.deferReply()
            if (interaction.options.getNumber("permit") as number > 6 && interaction.options.getNumber("permit") as number < 10) {
                return interaction.editReply({ embeds: [new EmbedBuilder().setTitle("Invalid Permit Level").setDescription("Please select one value from 1-6, or 10 if you are a database admin with prior approval.").setColor("Red")] })
            }
            await Query.auth.assignAuthCert(interaction.options.getString("user-id") as string, interaction.user.id, interaction.options.getNumber("permit") as number).then(() => {
                return interaction.editReply({ embeds: [new EmbedBuilder().setTitle("Permit Assigned").setDescription("To undo this change, please contact a DB admin.").setColor("Aqua")] })
            })
        } catch (err) {
            sendError(err, interaction, true)
        }
	},
}
