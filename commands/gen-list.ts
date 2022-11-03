import { EmbedBuilder } from "discord.js"
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import Query from "../routes/query"
import sendError from "../utils/sendError"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("staff-list")
		.setDescription("Generate a staff list by department or team.")
        .addStringOption(opt => opt.setName("mode").setDescription("The mode of the list generation (Dept/Team).").addChoices(
            { name: "Department ID", value: "deptId" },
            { name: "Department Name", value: "deptName" },
            { name: "Team ID", value: "teamId" },
            { name: "Team Name", value: "teamName" }
        ).setRequired(true))
        .addStringOption(opt => opt.setName("value").setDescription("Value to search for.").setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
            await interaction.deferReply()
            const query = interaction.options.getString("mode", true)
            if (query == "deptId") {
                const res = await Query.departments.getDepartmentStaffMembers({ deptId: parseInt(interaction.options.getString("value", true))})
                console.log(res) //TODO
                const embed = new EmbedBuilder().setTitle("Staff List")
                for (let i = 0; i < res.teams.length; i++) {
                    const teamName = (await Query.teams.getTeam({ id: res.teams[i].id })).name
                    const teamMembers =  (await Query.teams.getTeamStaffMembers({teamId: res.teams[i].id})).array
                    if (i == 0 && parseInt(interaction.options.getString("value", true)) !== 4) teamMembers.unshift(res.array[0])
                    const formatTeamMembers = teamMembers.map(async s => `${(await Query.staff.getStaffById(s.StaffFileId)).name} - ${(await Query.positions.getPosition({ id: s.PositionId })).title}`)
                    const promres = await Promise.all(formatTeamMembers)
                    embed.addFields({
                        name: teamName,
                        value: `${promres.join("\n")}`
                    })
                }
                interaction.editReply({ embeds: [embed] })
            } else if (query == "deptName") {
                const res = await Query.departments.getDepartmentStaffMembers({ deptName: interaction.options.getString("value", true)})
                const embed = new EmbedBuilder().setTitle("Staff List")
                console.log(res)
                for (let i = 0; i < res.teams.length; i++) {
                    const teamName = (await Query.teams.getTeam({ id: res.teams[i].id })).name
                    const teamMembers =  (await Query.teams.getTeamStaffMembers({teamId: res.teams[i].id})).array
                    if (i == 0) teamMembers.unshift(res.array[0])
                    const formatTeamMembers = teamMembers.map(async s => `${(await Query.staff.getStaffById(s.StaffFileId)).name} - ${(await Query.positions.getPosition({ id: s.PositionId })).title}`)
                    const promres = await Promise.all(formatTeamMembers)
                    embed.addFields({
                        name: teamName,
                        value: `${promres.join("\n")}`
                    })
                }
                interaction.editReply({ embeds: [embed] })
            } else if (query == "teamId") {
                
            } else throw new Error("This feature has not been implemented.")

        } catch (err) {
            console.log(err)
            sendError(err, interaction, true)
        }
	},
}