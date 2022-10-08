import { Stopwatch } from "@sapphire/stopwatch"
import { ActionRowBuilder, ChatInputCommandInteraction, EmbedBuilder, SelectMenuBuilder, SlashCommandBuilder } from "discord.js"
import { dbSql } from ".."
import Query from "../routes/query"
import { Department, Position, StaffFile, Team } from "../types/common/ReturnTypes"
import sendError from "../utils/sendError"

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
        try {
            await interaction.deferReply()
            if (interaction.options.getString("filter") == "full-name") {
                const fname = interaction.options.getString("query")?.split(" ")[0]
                const lname = interaction.options.getString("query")?.split(" ")[1]
                const staff: StaffFile = await Query.staff.getStaffByFullName(`${fname}`, `${lname}`)
                if (!staff) {
                    const embed = new EmbedBuilder().setTitle("No Results Returned").setColor("Red").setDescription("No results could be found given your search query. If you believe this is in error, please open a ticket with HRIS.")
                    return interaction.editReply({ embeds: [embed] })
                }
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
                await interaction.editReply({ embeds: [embed] })
            }
            else if (interaction.options.getString("filter") == "lname") {
                const lname = interaction.options.getString("query")?.split(" ")[0]
                const staff: StaffFile[] = await Query.staff.getStaffByLastName(`${lname}`)
                if (staff.length == 0) {
                    const embed = new EmbedBuilder().setTitle("No Results Returned").setColor("Red").setDescription("No results could be found given your search query. If you believe this is in error, please open a ticket with HRIS.")
                    return interaction.editReply({ embeds: [embed] })
                }
                if (staff.length > 1) {
                    const embed = new EmbedBuilder().setTitle("Select Search Result").setDescription("Your search returned multiple results. Please select the appropriate staff member from the dropdown list.")
                    const menu = new SelectMenuBuilder().setCustomId("search").setPlaceholder("Select a staff member.")
                    for (let i = 0; i < staff.length; i++) {
                        if (i == 25) break;
                        menu.addOptions(
                            {
                                label: `${staff[i].name}`,
                                description: `${(await Query.positions.getPositionStaff(staff[i].id))[0]}`,
                                value: `${staff[i].id}`
                            }
                        )
                    }
                    const row = new ActionRowBuilder<SelectMenuBuilder>()
                    .addComponents(
                        menu
                    )
                    return interaction.editReply({ embeds: [embed], components: [row] })
                } else {
                    let retstaff = staff[0]
                    let fname = retstaff.name.split(" ")[0]
                    const embed = new EmbedBuilder().setTitle(retstaff.name)
                    let descstr = ""
                    let posarr = await Query.positions.getPositionStaff(retstaff.id)
                    for (let i = 0; i < posarr.length; i++) {
                        descstr += `*${posarr[i]}*\n`
                    }
                    embed.setDescription(`${descstr}`)
                    let deptteams = ""
                    let supsstr = ""
                    let deptarr = await Query.departments.getDepartmentStaff(retstaff.id)
                    console.log(deptarr)
                    let teamarr = await Query.teams.getTeamStaff(retstaff.id)
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
                                value: `Personal: ${retstaff.personalEmail}\nWork: ${retstaff.companyEmail}`
                            },
                            {
                                name: "Strikes/Censures/Pips",
                                value: `${retstaff.strikes}/${retstaff.censures}/${retstaff.pips}`,
                                inline: true
                            },
                            {
                                name: "On Leave?",
                                value: `${retstaff.outOfOffice ? "True" : "False"}`,
                                inline: true
                            }
                        )
                    if (retstaff.outOfOffice) embed.setColor("Red"); else embed.setColor("Aqua")
                    await interaction.editReply({ embeds: [embed] })
                }

            }
            else if (interaction.options.getString("filter") == "fname") {
                const fname = interaction.options.getString("query")?.split(" ")[0]
                const staff: StaffFile[] = await Query.staff.getStaffByFirstName(`${fname}`)
                if (staff.length == 0) {
                    const embed = new EmbedBuilder().setTitle("No Results Returned").setColor("Red").setDescription("No results could be found given your search query. If you believe this is in error, please open a ticket with HRIS.")
                    return interaction.editReply({ embeds: [embed] })
                }
                if (staff.length > 1) {
                    const embed = new EmbedBuilder().setTitle("Select Search Result").setDescription("Your search returned multiple results. Please select the appropriate staff member from the dropdown list.")
                    const menu = new SelectMenuBuilder().setCustomId("search").setPlaceholder("Select a staff member.")
                    for (let i = 0; i < staff.length; i++) {
                        if (i == 25) break;
                        menu.addOptions(
                            {
                                label: `${staff[i].name}`,
                                description: `${(await Query.positions.getPositionStaff(staff[i].id))[0]}`,
                                value: `${staff[i].id}`
                            }
                        )
                    }
                    const row = new ActionRowBuilder<SelectMenuBuilder>()
                    .addComponents(
                        menu
                    )
                    return interaction.editReply({ embeds: [embed], components: [row] })
                } else {
                    let retstaff = staff[0]
                    let lname = retstaff.name.split(" ")[1]
                    const embed = new EmbedBuilder().setTitle(retstaff.name)
                    let descstr = ""
                    let posarr = await Query.positions.getPositionStaff(retstaff.id)
                    for (let i = 0; i < posarr.length; i++) {
                        descstr += `*${posarr[i]}*\n`
                    }
                    embed.setDescription(`${descstr}`)
                    let deptteams = ""
                    let supsstr = ""
                    let deptarr = await Query.departments.getDepartmentStaff(retstaff.id)
                    console.log(deptarr)
                    let teamarr = await Query.teams.getTeamStaff(retstaff.id)
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
                                value: `Personal: ${retstaff.personalEmail}\nWork: ${retstaff.companyEmail}`
                            },
                            {
                                name: "Strikes/Censures/Pips",
                                value: `${retstaff.strikes}/${retstaff.censures}/${retstaff.pips}`,
                                inline: true
                            },
                            {
                                name: "On Leave?",
                                value: `${retstaff.outOfOffice ? "True" : "False"}`,
                                inline: true
                            }
                        )
                    if (retstaff.outOfOffice) embed.setColor("Red"); else embed.setColor("Aqua")
                    await interaction.editReply({ embeds: [embed] })
                }

            }
            else if (interaction.options.getString("filter") == "id") {
                const regex = new RegExp("^\d+$", "gm")
                if (!(/^\d+$/gm.test(interaction.options.getString("query") as string))) {
                    throw new Error("ID query must only consist of numbers.")
                }
                const staff: StaffFile = await Query.staff.getStaffById(parseInt(interaction.options.getString("query") as string))
                if (!staff) {
                    const embed = new EmbedBuilder().setTitle("No Results Returned").setColor("Red").setDescription("No results could be found given your search query. If you believe this is in error, please open a ticket with HRIS.")
                    return interaction.editReply({ embeds: [embed] })
                }
                const fname = staff.name.split(" ")[0]
                const lname = staff.name.split(" ")[1]
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
                await interaction.editReply({ embeds: [embed] })
            }
            else await interaction.editReply("{}")
        } catch (err) {
            sendError(err, interaction, true)
        }
    },
}
