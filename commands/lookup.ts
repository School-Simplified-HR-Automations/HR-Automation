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
    permit: 0,
    async execute(interaction: ChatInputCommandInteraction, permit: number) {
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
                if (posarr.length > 0) {
                    for (let i = 0; i < posarr.length; i++) {
                        descstr += `*${posarr[i]}*\n`
                    }
                } else descstr = "No position."
                embed.setDescription(`${descstr}`)
                let deptteams = ""
                let supsstr = ""
                let deptarr = await Query.departments.getDepartmentStaff(staff.id)
                let teamarr = await Query.teams.getTeamStaff(staff.id)
                if (deptarr.length > 0 && teamarr.length > 0) {
                    for (let i = 0; i < deptarr.length; i++) {
                        let team = await Query.teams.getTeam({ name: `${teamarr[i]}` })
                        deptteams += `*${deptarr[i]} - ${teamarr[i]}*\n`
                        if (!((await Query.staff.getStaffById((await Query.supervisors.getSupervisorById(team.SupervisorId)).StaffFileId)).name == `${fname} ${lname}`)) {
                            supsstr += `${(await Query.staff.getStaffById((await Query.supervisors.getSupervisorById(team.SupervisorId)).StaffFileId)).name}\n`
                        }
                    }
                } else {
                    deptteams = "None"
                    supsstr = ""
                }
                let outOfOffice = 0
                let returnDate;
                let breakRecord = (await Query.records.getBreakRecords(`${staff.id}`))
                if (breakRecord.length > 0) {
                    outOfOffice = 2
                    returnDate = breakRecord[0].dateExp
                } else if (staff.outOfOffice) {
                    outOfOffice = 1
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
                            value: `${outOfOffice == 2 ? `On break until <t:${returnDate}:d>` : outOfOffice == 1 ? 'In Out of Office mode.' : "False"}`,
                            inline: true
                        }
                    )
                if (staff.outOfOffice) embed.setColor("Red"); else embed.setColor("Aqua")
                const menu = new SelectMenuBuilder().setCustomId(`hist-${staff.id}`).addOptions(
                    {
                        label: "Position History",
                        description: `${staff.name}'s history at School Simplified.`,
                        value: `phos-${staff.id}`
                    },
                    {
                        label: "Break Records",
                        description: `${staff.name}'s break records.`,
                        value: `breaks-${staff.id}`
                    },
                    {
                        label: "Strike Records",
                        description: `${staff.name}'s strike records.`,
                        value: `strikes-${staff.id}`
                    },
                    {
                        label: "Censure Records",
                        description: `${staff.name}'s censure records.`,
                        value: `censures-${staff.id}`
                    }
                )
                const permit = await Query.auth.getPermit(interaction.user.id, interaction.user.id)
                if (permit >= 1) {
                    const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(menu)
                    await interaction.editReply({ embeds: [embed], components: [row] })
                } else {
                    await interaction.editReply({ embeds: [embed] })
                }
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
                    if (posarr.length > 0) {
                        for (let i = 0; i < posarr.length; i++) {
                            descstr += `*${posarr[i]}*\n`
                        }
                    } else descstr = "No position."
                    embed.setDescription(`${descstr}`)
                    let deptteams = ""
                    let supsstr = ""
                    let deptarr = await Query.departments.getDepartmentStaff(retstaff.id)
                    let teamarr = await Query.teams.getTeamStaff(retstaff.id)
                    if (deptarr.length > 0 && teamarr.length > 0) {
                        for (let i = 0; i < deptarr.length; i++) {
                            let team = await Query.teams.getTeam({ name: `${teamarr[i]}` })
                            deptteams += `*${deptarr[i]} - ${teamarr[i]}*\n`
                            if (!((await Query.staff.getStaffById((await Query.supervisors.getSupervisorById(team.SupervisorId)).StaffFileId)).name == `${fname} ${lname}`)) {
                                supsstr += `${(await Query.staff.getStaffById((await Query.supervisors.getSupervisorById(team.SupervisorId)).StaffFileId)).name}\n`
                            }
                        }
                    } else {
                        deptteams = "None"
                        supsstr = ""
                    }
                    let outOfOffice = 0
                    let returnDate;
                    let breakRecord = (await Query.records.getBreakRecords(`${retstaff.id}`))
                    if (breakRecord.length > 0) {
                        outOfOffice = 2
                        returnDate = breakRecord[0].dateExp
                    } else if (retstaff.outOfOffice) {
                        outOfOffice = 1
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
                                value: `${outOfOffice == 2 ? `On break until <t:${returnDate}:d>` : outOfOffice == 1 ? 'In Out of Office mode.' : "False"}`,
                                inline: true
                            }
                        )
                    if (retstaff.outOfOffice) embed.setColor("Red"); else embed.setColor("Aqua")
                    const menu = new SelectMenuBuilder().setCustomId(`hist-${retstaff.id}`).addOptions(
                        {
                            label: "Position History",
                            description: `${retstaff.name}'s history at School Simplified.`,
                            value: `phos-${retstaff.id}`
                        },
                        {
                            label: "Break Records",
                            description: `${retstaff.name}'s break records.`,
                            value: `breaks-${retstaff.id}`
                        },
                        {
                            label: "Strike Records",
                            description: `${retstaff.name}'s strike records.`,
                            value: `strikes-${retstaff.id}`
                        },
                        {
                            label: "Censure Records",
                            description: `${retstaff.name}'s censure records.`,
                            value: `censures-${retstaff.id}`
                        }
                    )
                    const permit = await Query.auth.getPermit(interaction.user.id, interaction.user.id)
                    if (permit >= 1) {
                        const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(menu)
                        await interaction.editReply({ embeds: [embed], components: [row] })
                    } else {
                        await interaction.editReply({ embeds: [embed] })
                    }
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
                    if (posarr.length > 0) {
                        for (let i = 0; i < posarr.length; i++) {
                            descstr += `*${posarr[i]}*\n`
                        }
                    } else descstr = "No position."
                    embed.setDescription(`${descstr}`)
                    let deptteams = ""
                    let supsstr = ""
                    let deptarr = await Query.departments.getDepartmentStaff(retstaff.id)
                    let teamarr = await Query.teams.getTeamStaff(retstaff.id)
                    if (deptarr.length > 0 && teamarr.length > 0) {
                        for (let i = 0; i < deptarr.length; i++) {
                            let team = await Query.teams.getTeam({ name: `${teamarr[i]}` })
                            deptteams += `*${deptarr[i]} - ${teamarr[i]}*\n`
                            if (!((await Query.staff.getStaffById((await Query.supervisors.getSupervisorById(team.SupervisorId)).StaffFileId)).name == `${fname} ${lname}`)) {
                                supsstr += `${(await Query.staff.getStaffById((await Query.supervisors.getSupervisorById(team.SupervisorId)).StaffFileId)).name}\n`
                            }
                        }
                    } else {
                        deptteams = "None"
                        supsstr = ""
                    }
                    let outOfOffice = 0
                    let returnDate;
                    let breakRecord = (await Query.records.getBreakRecords(`${retstaff.id}`))
                    if (breakRecord.length > 0) {
                        outOfOffice = 2
                        returnDate = breakRecord[0].dateExp
                    } else if (retstaff.outOfOffice) {
                        outOfOffice = 1
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
                                value: `${outOfOffice == 2 ? `On break until <t:${returnDate}:d>` : outOfOffice == 1 ? 'In Out of Office mode.' : "False"}`,
                                inline: true
                            }
                        )
                    if (retstaff.outOfOffice) embed.setColor("Red"); else embed.setColor("Aqua")
                    const menu = new SelectMenuBuilder().setCustomId(`hist-${retstaff.id}`).addOptions(
                        {
                            label: "Position History",
                            description: `${retstaff.name}'s history at School Simplified.`,
                            value: `phos-${retstaff.id}`
                        },
                        {
                            label: "Break Records",
                            description: `${retstaff.name}'s break records.`,
                            value: `breaks-${retstaff.id}`
                        },
                        {
                            label: "Strike Records",
                            description: `${retstaff.name}'s strike records.`,
                            value: `strikes-${retstaff.id}`
                        },
                        {
                            label: "Censure Records",
                            description: `${retstaff.name}'s censure records.`,
                            value: `censures-${retstaff.id}`
                        }
                    )
                    const permit = await Query.auth.getPermit(interaction.user.id, interaction.user.id)
                    if (permit >= 1) {
                        const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(menu)
                        await interaction.editReply({ embeds: [embed], components: [row] })
                    } else {
                        await interaction.editReply({ embeds: [embed] })
                    }

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
                if (posarr.length > 0) {
                    for (let i = 0; i < posarr.length; i++) {
                        descstr += `*${posarr[i]}*\n`
                    }
                } else descstr = "No position."
                embed.setDescription(`${descstr}`)
                let deptteams = ""
                let supsstr = ""
                let deptarr = await Query.departments.getDepartmentStaff(staff.id)
                let teamarr = await Query.teams.getTeamStaff(staff.id)
                if (deptarr.length > 0 && teamarr.length > 0) {
                    for (let i = 0; i < deptarr.length; i++) {
                        let team = await Query.teams.getTeam({ name: `${teamarr[i]}` })
                        deptteams += `*${deptarr[i]} - ${teamarr[i]}*\n`
                        if (!((await Query.staff.getStaffById((await Query.supervisors.getSupervisorById(team.SupervisorId)).StaffFileId)).name == `${fname} ${lname}`)) {
                            supsstr += `${(await Query.staff.getStaffById((await Query.supervisors.getSupervisorById(team.SupervisorId)).StaffFileId)).name}\n`
                        }
                    }
                } else {
                    deptteams = "None"
                    supsstr = ""
                }
                let outOfOffice = 0
                let returnDate;
                let breakRecord = (await Query.records.getBreakRecords(`${staff.id}`))
                if (breakRecord.length > 0) {
                    outOfOffice = 2
                    returnDate = breakRecord[0].dateExp
                } else if (staff.outOfOffice) {
                    outOfOffice = 1
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
                            value: `${outOfOffice == 2 ? `On break until <t:${returnDate}:d>` : outOfOffice == 1 ? 'In Out of Office mode.' : "False"}`,
                            inline: true
                        }
                    )
                if (staff.outOfOffice) embed.setColor("Red"); else embed.setColor("Aqua")
                const menu = new SelectMenuBuilder().setCustomId(`hist-${staff.id}`).addOptions(
                    {
                        label: "Position History",
                        description: `${staff.name}'s history at School Simplified.`,
                        value: `phos-${staff.id}`
                    },
                    {
                        label: "Break Records",
                        description: `${staff.name}'s break records.`,
                        value: `breaks-${staff.id}`
                    },
                    {
                        label: "Strike Records",
                        description: `${staff.name}'s strike records.`,
                        value: `strikes-${staff.id}`
                    },
                    {
                        label: "Censure Records",
                        description: `${staff.name}'s censure records.`,
                        value: `censures-${staff.id}`
                    }
                )
                const permit = await Query.auth.getPermit(interaction.user.id, interaction.user.id)
                if (permit >= 1) {
                    const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(menu)
                    await interaction.editReply({ embeds: [embed], components: [row] })
                } else {
                    await interaction.editReply({ embeds: [embed] })
                }

            }
            else await interaction.editReply("{}")
        } catch (err) {
            console.log(err)
            sendError(err, interaction, true)
        }
    },
}
