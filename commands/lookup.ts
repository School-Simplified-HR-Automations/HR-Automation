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
        interaction.deferReply()
		if (interaction.options.getString("filter") == "full-name") {
            const fname = interaction.options.getString("query")?.split(" ")[0]
            const lname = interaction.options.getString("query")?.split(" ")[1]
            const staff: StaffFile = await Query.staff.getStaffByFullName(`${fname}`, `${lname}`)
            const embed = new EmbedBuilder().setTitle(staff.name)
            embed
            .setDescription(`*${(await Query.positions.getPosition({ id: staff.PositionId }) as Position[])[0].title}*`)
            .addFields(
                {
                    name: "Department and Team",
                    value: `${(await Query.departments.getDepartment({ id: staff.DepartmentId }) as Department).name} - ${(await Query.teams.getTeam({ id: staff.TeamId }) as Team).name}`
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
            interaction.editReply({ embeds: [embed] })
        }
	},
}
