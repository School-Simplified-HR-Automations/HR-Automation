import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import e from "express"
import Query from "../routes/query"
import sendError from "../utils/sendError"
import schedule from 'node-schedule'

module.exports = {
	data: new SlashCommandBuilder()
		.setName("break")
		.setDescription("(3+) Records a staff member's break.")
        .addUserOption(opt => opt.setName("target").setDescription("The target's user ID.").setRequired(true))
        .addStringOption(opt => opt.setName("start").setDescription("Start date formatted as YYYY/MM/DD.").setRequired(true))
        .addStringOption(opt => opt.setName("end").setDescription("End date formatted as YYYY/MM/DD").setRequired(true))
        .addStringOption(opt => opt.setName("reason").setDescription("Opt -> reason for the break.").setRequired(false)),
    permit: 3,
	async execute(interaction: ChatInputCommandInteraction, permit: number) {
		try {
            await interaction.deferReply()
            const user = interaction.options.getUser("target")
            if (!user) throw new Error(`Unable to resolve provided user.`)
            const staff = await Query.staff.getStaffById(parseInt(user.id.slice(user.id.length - 6)))
            if (!staff) {
                return interaction.editReply({ content: "This doesn't appear to be the ID of a registered user." })
            }
            if ((await Query.records.getBreakRecords(user.id)).length != 0) {
                return interaction.editReply({ content: "This user already appears to be on break!" })
            }
            const startDate = interaction.options.getString("start")?.split("/") as string[]
            const endDate = interaction.options.getString("end")?.split("/") as string[]

            const start = new Date(parseInt(startDate[0]), parseInt(startDate[1])-1, parseInt(startDate[2]))
            const end = new Date(parseInt(endDate[0]), parseInt(endDate[1])-1, parseInt(endDate[2]))

            if (start.getTime() > end.getTime()) {
                return interaction.editReply({ content: "Start date cannot be greater than end date." })
            }
            const startTimestamp = Math.round(start.getTime() / 1000)
            const endTimestamp = Math.round(end.getTime() / 1000)
            const reason = interaction.options.getString("reason")
            if (reason) {
                await Query.records.postBreakRecord(user.id, interaction.user.id, startTimestamp, endTimestamp, reason)
            } else {
                await Query.records.postBreakRecord(user.id, interaction.user.id, startTimestamp, endTimestamp)
            }
            schedule.scheduleJob(end, async function () {
                await Query.records.dropBreakRecord(`${staff.id}`, endTimestamp)
            })
            return interaction.editReply({ content: `Got it! ${staff.name} is on break from <t:${startTimestamp}:d> to <t:${endTimestamp}:d>.` })
            

        } catch (err) {
            sendError(err, interaction, true)
        }
	},
}
