import { Stopwatch } from "@sapphire/stopwatch"
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import { dbSql } from ".."
import Query from "../routes/query"
import { Department, Position, StaffFile, Team } from "../types/common/ReturnTypes"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("lookup")
		.setDescription("Lookup a staff member by a certain identifier.")
        .addStringOption(c => c.setName("filter").setDescription("Filter to apply.").addChoices(
            {
                name: "full-name",
                value: "full-name"
            },
            {
                name: "first-name",
                value: "fname"
            },
            {
                name: "last-name",
                value: "lname"
            },
            {
                name: "id",
                value: "id"
            }
        ).setRequired(true))
        .addStringOption(c => c.setName("query").setDescription("Search query.").setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply()
		if (interaction.options.getString("filter") == "full-name") {
            const fname = interaction.options.getString("query")?.split(" ")[0]
            const lname = interaction.options.getString("query")?.split(" ")[1]
            const staff: StaffFile = await Query.staff.getStaffByFullName(`${fname}`, `${lname}`)
            const embed = new EmbedBuilder().setTitle(staff.name)
            let descstr = ""
            let posarr = await Query.positions.getPositionStaff(staff.id)
            for (let i = 0; i < posarr.length; i++) {
                descstr += `*${posarr[i]}*\n`
            }
            embed.setDescription(`${descstr}`)
            let deptteams = ""
            let deptarr = await Query.departments.getDepartmentStaff(staff.id)
            let teamarr = await Query.teams.getTeamStaff(staff.id)
            for (let i = 0; i < deptarr.length; i++) {
                deptteams += `*${deptarr[i]} - ${teamarr[i]}*\n`
            }
            embed
            .addFields(
                {
                    name: "Departments and Teams",
                    value: `${deptteams}`
                },
                {
                    name: "Emails",
                    value: `Personal: ${staff.personalEmail}\nWork: ${staff.companyEmail}`,
                    inline: true
                },
                {
                    name: "Strikes/Censures/Pips",
                    value: `${staff.strikes}/${staff.censures}/${staff.pips}`,
                    inline: true
                },
                {
                    name: "On Leave?",
                    value: `${staff.outOfOffice ? "True" : "False"}`
                }
            )
            if (staff.outOfOffice) embed.setColor("Red"); else embed.setColor("Aqua")
            await interaction.editReply({ embeds: [embed] })
        }
        else await interaction.editReply("{}")
	},
}
