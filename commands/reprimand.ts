import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import { dbSql } from ".."
import Query from "../routes/query"
import sendError from "../utils/sendError"

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reprimand")
        .setDescription("(2+/3+) Reprimands a user through a strike or censure.")
        .addStringOption(opt => opt.setName("type").setDescription("Specifies which reprimand to give.").addChoices(
            { name: "Strike", value: "strike" },
            { name: "Censure", value: "censure" }
        ).setRequired(true))
        .addUserOption(opt => opt.setName("target").setDescription("The ID of the target user.").setRequired(true))
        .addUserOption(opt => opt.setName("admin").setDescription("The ID of the user who administered the reprimand").setRequired(true))
        .addStringOption(opt => opt.setName("reason").setDescription("The reason for the reprimand.").setRequired(true))
        .addBooleanOption(opt => opt.setName("overflow").setDescription("Opt -> If you're issuing a censure, is it because of 5 strikes?"))
        .addStringOption(opt => opt.setName("details").setDescription("Opt -> A link to a piece of supporting media.").setRequired(false)),
    permit: 2,
    async execute(interaction: ChatInputCommandInteraction, permit: number) {
        try {
            await interaction.deferReply()
            let id = interaction.options.getUser("target", true).id
            let admin = interaction.options.getUser("admin", true).id
            id = id.slice(id.length - 6)
            id = id.slice(id.length - 6)
            if (permit == 2) {

            } else {
                const typeInput = interaction.options.getString("type", true)
                let type: 1 | 2
                typeInput == "strike" ? type = 1 : type = 2
                const reason = interaction.options.getString("reason", true)
                const details = interaction.options.getString("details") ?? null
                const todayObj = new Date(2022, 1, 26)
                const todayDate = todayObj.getDate()
                const todayMonth = todayObj.getMonth()
                const todayYear = todayObj.getFullYear()
                const todayString = `${todayYear}-${todayMonth + 1}-${todayDate}`
                let expObj
                if (todayMonth <= 1 && todayDate < 28) {
                    let year
                    if (todayMonth == 11 && todayDate >= 1) year = todayYear + 1
                    else year = todayYear
                    expObj = new Date(year, 2, 30)
                } else if (todayMonth <= 4 && todayDate < 30) {
                    expObj = new Date(todayYear, 5, 30)
                } else if (todayMonth <= 7 && todayDate < 30) {
                    expObj = new Date(todayYear, 8, 30)
                } else {
                    expObj = new Date(todayYear, 11, 31)
                }
                let expString = `${expObj.getFullYear()}-${expObj.getMonth() + 1}-${expObj.getDate()}`

                if (details) {
                    await Query.staff.addReprimand(Math.round(todayObj.getTime() / 1000), Math.round(expObj.getTime() / 1000), reason, parseInt(id), type, parseInt(admin.slice(admin.length - 6)), details)
                } else {
                    await Query.staff.addReprimand(Math.round(todayObj.getTime() / 1000), Math.round(expObj.getTime() / 1000), reason, parseInt(id), type, parseInt(admin.slice(admin.length - 6)))
                }
                const overflow = interaction.options.getBoolean("overflow", false) ?? false
                if (type == 2 && overflow) {
                    const strikes = (await Query.staff.getStaffById(parseInt(id))).strikes
                    if (strikes >= 5) {
                    await dbSql.query(`SET @strikes = (SELECT strikes FROM stafffiles WHERE id = ${id});
                    UPDATE stafffiles
                    SET strikes = @strikes - 5
                    WHERE id = ${id}`)
                    }
                }
                await interaction.editReply({ content: "Reprimand given to user." })
            }
        } catch (err) {
            sendError(err, interaction, true)
        }
    },
}