import { Client, EmbedBuilder, Interaction } from "discord.js";
import Query from "../routes/query";
import { log } from "../services/logger";
import { StaffFile as SF } from "../types/common/ReturnTypes"
import { client } from ".."

client.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isSelectMenu()) {
        const staff: SF = await Query.staff.getStaffById(parseInt(interaction.values[0]))
        let fname = staff.name.split(" ")[0]
        let lname = staff.name.split(" ")[1]
        const embed = new EmbedBuilder().setTitle(staff.name)
        let descstr = ""
        let posarr = await Query.positions.getPositionStaff(staff.id)
        for (let i = 0; i < posarr.length; i++) {
            descstr += `*${posarr[i]}*\n`
        }
        embed.setDescription(`${descstr}`)
        let deptteams = ""
        let supsstr = ""
        let deptarr = await Query.departments.getDepartmentStaff(staff.id)
        console.log(deptarr)
        let teamarr = await Query.teams.getTeamStaff(staff.id)
        console.log(teamarr)
        for (let i = 0; i < deptarr.length; i++) {
            let team = await Query.teams.getTeam({ name: `${teamarr[i]}` })
            deptteams += `*${deptarr[i]} - ${teamarr[i]}*\n`
            console.log(team.SupervisorId)
            if (!((await Query.staff.getStaffById((await Query.supervisors.getSupervisorById(team.SupervisorId)).StaffFileId)).name == `${fname} ${lname}`)) {
                supsstr += `${(await Query.staff.getStaffById((await Query.supervisors.getSupervisorById(team.SupervisorId)).StaffFileId)).name}\n`
            }
        }
        embed
            .addFields(
                {
                    name: "Departments and Teams",
                    value: `${deptteams}`,
                    inline: true
                },
                {
                    name: "Direct Supervisors",
                    value: `${supsstr == '' ? "None" : supsstr}`,
                    inline: true
                },
                {
                    name: "Emails",
                    value: `Personal: ${staff.personalEmail}\nWork: ${staff.companyEmail}`
                },
                {
                    name: "Strikes/Censures/Pips",
                    value: `${staff.strikes}/${staff.censures}/${staff.pips}`,
                    inline: true
                },
                {
                    name: "On Leave?",
                    value: `${staff.outOfOffice ? "True" : "False"}`,
                    inline: true
                }
            )
        if (staff.outOfOffice) embed.setColor("Red"); else embed.setColor("Aqua")
        await interaction.update({ embeds: [embed], components: [] })
    }
    if (
        interaction.isChatInputCommand() ||
        interaction.isMessageContextMenuCommand()
    ) {
        const command = client.commands.get(interaction.commandName)

        if (!command) return

        try {
            await command.execute(interaction)
        } catch (error) {
            const ID = log.error(
                error,
                `Command ${interaction.commandName}, User: ${interaction.user.tag}(${interaction.user.id}), Guild: ${interaction.guild?.name}(${interaction.guildId}), Options: ${interaction.options}`,
                true
            )
            interaction.reply(
                `An error occured while executing the command.\n\nError ID: ${ID}`
            )
        }
    }
})