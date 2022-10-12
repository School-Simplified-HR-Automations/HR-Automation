import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import Query from "../routes/query"
import sendError from "../utils/sendError"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("register")
		.setDescription("Register your Discord ID in the database. Does not add your ID to your profile."),
	async execute(interaction: ChatInputCommandInteraction, permit: number) {
		try {
            await interaction.deferReply()
            const permit = await Query.auth.getPermit(interaction.user.id, interaction.user.id)
            if (permit) {
                return interaction.editReply({ content: "You are already registered!" })
            } else {
                console.log(interaction.client.user.id)
                await Query.auth.assignAuthCert(interaction.user.id, interaction.client.user.id, 0)
                return interaction.editReply({ content: "Registered with Permit 0. If you feel you are eligible for a higher permit, please speak to a member of HRIS." })
            }
        } catch (err) {
            sendError(err, interaction, true)
        }
	},
}
