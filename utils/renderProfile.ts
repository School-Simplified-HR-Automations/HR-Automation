import { ChatInputCommandInteraction, EmbedBuilder, SelectMenuBuilder, ActionRowBuilder, Interaction, SelectMenuInteraction } from "discord.js"
import Query from "../routes/query"
import { StaffFile } from "../types/common/ReturnTypes"
import sanitizer from "./sanitizer"

export default async function renderProfile(filter: "fname" | "lname" | "id" | "name", interaction: ChatInputCommandInteraction | SelectMenuInteraction, query1: number | string, query2?: string) {
    if (interaction instanceof ChatInputCommandInteraction) {
        let staff: StaffFile = {
            id: 0,
            name: "",
            personalEmail: "",
            companyEmail: "",
            photoLink: "",
            phone: 0,
            legalSex: "",
            genderIdentity: "",
            ethnicity: "",
            appStatus: "",
            strikes: 0,
            censures: 0,
            pips: 0,
            activityStatus: "",
            alumni: false,
            createdAt: undefined,
            updatedAt: undefined,
            TeamId: 0,
            DepartmentId: 0,
            PositionId: 0,
            outOfOffice: 0
        }
        if (filter == "id") {
            sanitizer("number", `${query1}`)
            staff = await Query.staff.getStaffById(query1 as number)
            if (!staff) {
                const embed = new EmbedBuilder().setTitle("No Results Returned").setColor("Red").setDescription("No results could be found given your search query. If you believe this is in error, please open a ticket with HRIS.")
                return interaction.editReply({ embeds: [embed] })
            }
        } else if (filter == "fname") {
            const query = query1 as string
            const staffRes: StaffFile[] = await Query.staff.getStaffByFirstName(`${query}`)
            if (staffRes.length == 0) {
                const embed = new EmbedBuilder().setTitle("No Results Returned").setColor("Red").setDescription("No results could be found given your search query. If you believe this is in error, please open a ticket with HRIS.")
                return interaction.editReply({ embeds: [embed] })
            }
            if (staffRes.length > 1) {
                const embed = new EmbedBuilder().setTitle("Select Search Result").setDescription("Your search returned multiple results. Please select the appropriate staff member from the dropdown list.")
                const menu = new SelectMenuBuilder().setCustomId("search").setPlaceholder("Select a staff member.")
                for (let i = 0; i < staffRes.length; i++) {
                    if (i == 25) break;
                    menu.addOptions(
                        {
                            label: `${staffRes[i].name}`,
                            description: `${(await Query.positions.getPositionStaff(staffRes[i].id))[0]}`,
                            value: `${staffRes[i].id}`
                        }
                    )
                }
                const row = new ActionRowBuilder<SelectMenuBuilder>()
                    .addComponents(
                        menu
                    )
                return interaction.editReply({ embeds: [embed], components: [row] })
            } else staff = staffRes[0]
        } else if (filter == "lname") {
            const query = query1 as string
            const staffRes: StaffFile[] = await Query.staff.getStaffByLastName(`${query}`)
            if (staffRes.length == 0) {
                const embed = new EmbedBuilder().setTitle("No Results Returned").setColor("Red").setDescription("No results could be found given your search query. If you believe this is in error, please open a ticket with HRIS.")
                return interaction.editReply({ embeds: [embed] })
            }
            if (staffRes.length > 1) {
                const embed = new EmbedBuilder().setTitle("Select Search Result").setDescription("Your search returned multiple results. Please select the appropriate staff member from the dropdown list.")
                const menu = new SelectMenuBuilder().setCustomId("search").setPlaceholder("Select a staff member.")
                for (let i = 0; i < staffRes.length; i++) {
                    if (i == 25) break;
                    menu.addOptions(
                        {
                            label: `${staffRes[i].name}`,
                            description: `${(await Query.positions.getPositionStaff(staffRes[i].id))[0]}`,
                            value: `${staffRes[i].id}`
                        }
                    )
                }
                const row = new ActionRowBuilder<SelectMenuBuilder>()
                    .addComponents(
                        menu
                    )
                return interaction.editReply({ embeds: [embed], components: [row] })
            } else staff = staffRes[0]
        } else if (filter == "name") {
            const fname = query1 as string
            const lname = query2 as string
            staff = await Query.staff.getStaffByFullName(`${fname}`, `${lname}`)
            if (!staff) {
                const embed = new EmbedBuilder().setTitle("No Results Returned").setColor("Red").setDescription("No results could be found given your search query. If you believe this is in error, please open a ticket with HRIS.")
                return interaction.editReply({ embeds: [embed] })
            }
        }
        const fname = staff.name.split(" ")[0]
        const lname = staff.name.split(" ")[1]
        const embed = new EmbedBuilder().setTitle(`${staff.name}`)
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
                const retsup = (await Query.supervisors.getSupervisorById(team.SupervisorId))
                let retsupstaff = ''
                if (retsup.length > 0) {
                    if (retsup[0].StaffFileId) {
                        const retsupstaffObj = (await Query.staff.getStaffById(retsup[0].StaffFileId))
                        retsupstaff = retsupstaffObj.name
                    }
                    else {
                        supsstr += "Vacant.\n"
                    }
                }
                if (retsupstaff !== '') {
                    if (retsupstaff !== `${fname} ${lname}`) {
                        supsstr += `${(await Query.staff.getStaffById((await Query.supervisors.getSupervisorById(team.SupervisorId))[0].StaffFileId)).name}\n`
                    }
                }
            }
            let supervisorAssignments = (await Query.supervisors.getAssignmentsByStaffId(staff.id))
            if (supervisorAssignments.length > 0) {
                for (let i = 0; i < supervisorAssignments.length; i++) {
                    const team = await Query.teams.getTeam({ SupervisorId: supervisorAssignments[i].id })
                    const dept = await Query.departments.getDepartment({ id: team.DepartmentId })
                    deptteams += `*${dept.name} - ${team.name}*`
                    supsstr += `Supervises this team.\n`
                }
            }
        } else {
            deptteams = "None"
            supsstr = ""
        }
        if (supsstr == '') supsstr = "No direct supervision."
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
                    value: `${supsstr}`,
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
    } else {
        const staff = await Query.staff.getStaffById(parseInt(interaction.values[0] as string))
        const fname = staff.name.split(" ")[0]
        const lname = staff.name.split(" ")[1]
        const embed = new EmbedBuilder().setTitle(`${staff.name}`)
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
                const retsup = (await Query.supervisors.getSupervisorById(team.SupervisorId))
                let retsupstaff = ''
                if (retsup.length > 0) {
                    if (retsup[0].StaffFileId) {
                        const retsupstaffObj = (await Query.staff.getStaffById(retsup[0].StaffFileId))
                        retsupstaff = retsupstaffObj.name
                    }
                    else {
                        supsstr += "Vacant.\n"
                    }
                }
                if (retsupstaff !== '') {
                    if (retsupstaff !== `${fname} ${lname}`) {
                        supsstr += `${(await Query.staff.getStaffById((await Query.supervisors.getSupervisorById(team.SupervisorId))[0].StaffFileId)).name}\n`
                    }
                }
            }
            let supervisorAssignments = (await Query.supervisors.getAssignmentsByStaffId(staff.id))
            if (supervisorAssignments.length > 0) {
                for (let i = 0; i < supervisorAssignments.length; i++) {
                    const dept = await Query.departments.getDepartment({ SupervisorId: supervisorAssignments[i].id })
                    const team = await Query.teams.getTeam({ SupervisorId: supervisorAssignments[i].id })
                    deptteams += `*${dept.name} - ${team.name}*`
                    supsstr += `Supervises this team.\n`
                }
            }
        } else {
            deptteams = "None"
            supsstr = ""
        }
        if (supsstr = "") supsstr = "No direct supervision."
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
}