import { ActionRowBuilder, ButtonStyle, Client, EmbedBuilder, Interaction, SelectMenuBuilder, TextInputBuilder, TextInputComponent, TextInputStyle, ButtonBuilder, ModalBuilder, Embed } from "discord.js";
import Query from "../routes/query";
import { log } from "../services/logger";
import { StaffFile as SF } from "../types/common/ReturnTypes"
import { client } from ".."
import sendError from "../utils/sendError";

client.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isSelectMenu()) {
        if (interaction.customId.startsWith("hist")) {
            if (interaction.values[0].startsWith("phos")) {
                await interaction.deferUpdate()
                const staff = (await Query.staff.getStaffById(parseInt(interaction.values[0].split("-")[1])))
                const embed = new EmbedBuilder().setTitle("Position History").setFooter({ text: staff.name })
                const poshis = await Query.positionHistory.getHistoryById(staff.id)
                if (poshis.length == 0) embed.setDescription("No prior or current positions.")
                else {
                    for (let i = poshis.length - 1; i >= 0; i--) {
                        embed.addFields({
                            name: poshis[i].title,
                            value: `Joined - <t:${poshis[i].joined}:d>${poshis[i].quit ? `\nLeft - <t:${poshis[i].quit}:d>\nTerms - ${poshis[i].terms == 1 ? 'Good' : 'Bad'}\nReason - ${poshis[i].reason}` : ""}`
                        })
                    }
                }
                staff.outOfOffice ? embed.setColor("Red") : embed.setColor("Aqua")
                await interaction.editReply({ embeds: [embed] })
            } else if (interaction.values[0].startsWith("breaks")) {
                await interaction.deferUpdate()
                const staff = (await Query.staff.getStaffById(parseInt(interaction.values[0].split("-")[1])))
                const embed = new EmbedBuilder().setTitle("Break History").setFooter({ text: staff.name })
                const breakhis = await Query.records.getBreakRecords(interaction.values[0].split("-")[1])
                if (breakhis.length == 0) embed.setDescription("No recorded breaks.")
                else {
                    for (let i = breakhis.length - 1; i >= 0; i--) {
                        embed.addFields({
                            name: `Break ${i + 1}`,
                            value: `Begin - <t:${breakhis[i].date}:d>\nEnd - <t:${breakhis[i].dateExp}:d>\nReason - ${breakhis[i].reason}`
                        })
                    }
                }
                staff.outOfOffice ? embed.setColor("Red") : embed.setColor("Aqua")
                await interaction.editReply({ embeds: [embed] })
            } else if (interaction.values[0].startsWith("strikes")) {
                await interaction.deferUpdate()
                console.log(interaction.values[0].split("-")[1])
                const staff = (await Query.staff.getStaffById(parseInt(interaction.values[0].split("-")[1])))
                const embed = new EmbedBuilder().setTitle("Strike History").setFooter({ text: staff.name })
                const strikehis = await Query.records.getRecords(interaction.values[0].split("-")[1], 1)
                if (strikehis.length == 0) embed.setDescription("No recorded strikes.")
                else {
                    for (let i = strikehis.length - 1; i >= 0; i--) {
                        const admstaff = (await Query.staff.getStaffById(strikehis[i].StaffFileAdm))
                        embed.addFields({
                            name: `Strike ${i + 1}`,
                            value: `Administered by - ${admstaff.name}\nAdministered on - <t:${strikehis[i].date}:d>\nExpires - <t:${strikehis[i].dateExp}:d>\nReason - ${strikehis[i].reason}`
                        })
                    }
                }
                staff.outOfOffice ? embed.setColor("Red") : embed.setColor("Aqua")
                await interaction.editReply({ embeds: [embed] })
            } else if (interaction.values[0].startsWith("censures")) {
                await interaction.deferUpdate()
                console.log(interaction.values[0].split("-")[1])
                const staff = (await Query.staff.getStaffById(parseInt(interaction.values[0].split("-")[1])))
                const embed = new EmbedBuilder().setTitle("Censure History").setFooter({ text: staff.name })
                const strikehis = await Query.records.getRecords(interaction.values[0].split("-")[1], 2)
                if (strikehis.length == 0) embed.setDescription("No recorded censures.")
                else {
                    for (let i = strikehis.length - 1; i >= 0; i--) {
                        const admstaff = (await Query.staff.getStaffById(strikehis[i].StaffFileAdm))
                        embed.addFields({
                            name: `Censure ${i + 1}`,
                            value: `Administered by - ${admstaff.name}\nAdministered on - <t:${strikehis[i].date}:d>\nExpires - <t:${strikehis[i].dateExp}:d>\nReason - ${strikehis[i].reason}`
                        })
                    }
                }
                staff.outOfOffice ? embed.setColor("Red") : embed.setColor("Aqua")
                await interaction.editReply({ embeds: [embed] })
            }
        }
        else if (interaction.customId.startsWith("search")) {
            interaction.deferUpdate()
            const staff: SF = await Query.staff.getStaffById(parseInt(interaction.values[0]))
            let fname = staff.name.split(" ")[0]
            let lname = staff.name.split(" ")[1]
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
            const userpermit = await Query.auth.getPermit(interaction.user.id, interaction.user.id)
            if (userpermit >= 1) {
                const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(menu)
                await interaction.editReply({ embeds: [embed], components: [row] })
            } else {
                await interaction.editReply({ embeds: [embed] })
            }
        } else if (interaction.customId.startsWith("posalter")) {
            if (interaction.values[0].startsWith("newpos")) {
                await interaction.deferUpdate()
                const embed = new EmbedBuilder().setTitle("Add a New Position Record")
                    .setDescription("By clicking Start, you will open a modal for inputting relevant information. Please have the following ready:\n\n- The **exact** title of the position.\n- The date this staff member will be joining the position, formatted as YYYY-MM-DD.")
                const button = new ButtonBuilder().setCustomId(`posadd-${interaction.values[0].split("-")[1]}`).setLabel("Start").setStyle(ButtonStyle.Success)
                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button)
                await interaction.editReply({ embeds: [embed], components: [row] })
            } else if (interaction.values[0].startsWith("edit")) {
                await interaction.deferUpdate()
                const pos = await Query.positionHistory.getHistoryByRecordId(parseInt(interaction.values[0].split("-")[1]))
                const embed = new EmbedBuilder().setTitle("Edit or Remove a Position Record")
                    .setDescription(`Please select one of the options below:\n\n- **Edit**: Edit any details selected.\n- **Remove**: Remove staff member from this position and mark quit date.\n- **Move**: Alter this particular record, to indicate a move in position.\n\nCurrent Details:\n**Title**: ${pos.title}\n**Joined:** <t:${pos.joined}:d>`)
                const editbutton = new ButtonBuilder().setCustomId(`editbutton-${interaction.values[0].split("-")[1]}`).setLabel("Edit").setStyle(ButtonStyle.Primary)
                const mvbutton = new ButtonBuilder().setCustomId(`mvbutton-${interaction.values[0].split("-")[1]}`).setLabel("Move").setStyle(ButtonStyle.Primary)
                const rmbutton = new ButtonBuilder().setCustomId(`rmbutton-${interaction.values[0].split("-")[1]}`).setLabel("Remove").setStyle(ButtonStyle.Danger)
                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(editbutton, mvbutton, rmbutton)
                await interaction.editReply({ embeds: [embed], components: [row] })
            }
        } else if (interaction.customId.startsWith("editfields")) {
            const id = interaction.values[0].split("-")[1]
            const modal = new ModalBuilder().setCustomId(`poseditmodal-${id}`).setTitle("Position Record - Edit")
            if (interaction.values.length > 1) {
                let title1: string = "", title2: string = ""
                interaction.values[0].startsWith("edittitle") ? (title1 = "Edit Position Title", title2 = "Edit Join Date") : (title1 = "Edit Join Date", title2 = "Edit Position Title")
                const row1 = new TextInputBuilder().setCustomId(`${interaction.values[0].split("-")[0]}`).setLabel(`${title1}`).setStyle(TextInputStyle.Short).setRequired(false)
                const row2 = new TextInputBuilder().setCustomId(`${interaction.values[1].split("-")[0]}`).setLabel(`${title2}`).setStyle(TextInputStyle.Short).setRequired(false)
                const arow1 = new ActionRowBuilder<TextInputBuilder>().addComponents(row1)
                const arow2 = new ActionRowBuilder<TextInputBuilder>().addComponents(row2)

                modal.addComponents(arow1, arow2)

                await interaction.showModal(modal)
            } else {
                let title: string = ""
                interaction.values[0].startsWith("edittitle") ? title = "Edit Position Title" : title = "Edit Join Date"
                const row1 = new TextInputBuilder().setCustomId(`${interaction.values[0].split("-")[0]}`).setLabel(`${title}`).setStyle(TextInputStyle.Short).setRequired(false)

                const arow1 = new ActionRowBuilder<TextInputBuilder>().addComponents(row1)

                modal.addComponents(arow1)

                await interaction.showModal(modal)
            }
        }
    } else if (interaction.isButton()) {
        if (interaction.customId.startsWith("posadd")) {
            const id = interaction.customId.split("-")[1]
            const modal = new ModalBuilder().setCustomId(`posmodal-${id}`).setTitle("Position Record - Add")
            const titlerow = new TextInputBuilder().setCustomId(`title`).setLabel("Position Title").setStyle(TextInputStyle.Short).setRequired(true)
            const joinDateRow = new TextInputBuilder().setCustomId(`join`).setLabel("Join Date (YYYY-MM-DD)").setStyle(TextInputStyle.Short).setRequired(true)

            const arow1 = new ActionRowBuilder<TextInputBuilder>().addComponents(titlerow)
            const arow2 = new ActionRowBuilder<TextInputBuilder>().addComponents(joinDateRow)

            modal.addComponents(arow1, arow2)

            await interaction.showModal(modal)
        } else if (interaction.customId.startsWith("editbutton")) {
            await interaction.deferUpdate()
            const id = interaction.customId.split("-")[1]
            const menu = new SelectMenuBuilder().setMaxValues(2).setCustomId(`editfields-${id}`).addOptions(
                {
                    label: "Edit Position Title",
                    description: "Edit the stored title of this position.",
                    value: `edittitle-${id}`
                },
                {
                    label: "Edit Join Date",
                    description: "Edit the join date for this record.",
                    value: `editjoin-${id}`
                }
            )
            const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(menu)
            const embed = new EmbedBuilder().setTitle("Position Record - Edit").setDescription("Choose any options (or both) that support your request:\n\n- **Edit Position Title**: Edit the title of this position in the history record and in the position database. Useful for on-the-go changes to position names to support semantics.\n- **Edit Join Date**: Edit the date the staff member joined this position, formatted as YYYY-MM-DD.\n\nAfter selecting, a modal will appear with input boxes for any fields you have chosen to edit. Please have all information ready.")

            await interaction.editReply({ embeds: [embed], components: [row] })
        } else if (interaction.customId.startsWith("mvbutton")) {
            await interaction.deferUpdate()
            const id = interaction.customId.split("-")[1]
            const embed = new EmbedBuilder().setTitle("Replace a Position Record (Move Staff Member)")
                .setDescription("By clicking Start, you will open a modal for inputting relevant information. Please have the following ready:\n\n- The **exact** title of the position.\n- The date this staff member will be joining the position, formatted as YYYY-MM-DD.")
            const button = new ButtonBuilder().setCustomId(`posmv-${id}`).setLabel("Start").setStyle(ButtonStyle.Success)
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button)
            await interaction.editReply({ embeds: [embed], components: [row] })

        } else if (interaction.customId.startsWith("rmbutton")) {
            const id = interaction.customId.split("-")[1]
            const modal = new ModalBuilder().setCustomId(`posrmmodal-${id}`).setTitle("Position Record - Remove")
            const dateQuitRow = new TextInputBuilder().setCustomId("posrmquitdate").setLabel("Leave Date").setStyle(TextInputStyle.Short).setRequired(true)
            const terms = new TextInputBuilder().setCustomId("posrmterms").setLabel("Terms (Good/Bad)").setStyle(TextInputStyle.Short).setRequired(true)
            const reason = new TextInputBuilder().setCustomId("posrmreason").setLabel("Reason").setStyle(TextInputStyle.Short)

            const arow1 = new ActionRowBuilder<TextInputBuilder>().addComponents(dateQuitRow)
            const arow2 = new ActionRowBuilder<TextInputBuilder>().addComponents(terms)
            const arow3 = new ActionRowBuilder<TextInputBuilder>().addComponents(reason)

            modal.addComponents(arow1, arow2, arow3)

            await interaction.showModal(modal)
        } else if (interaction.customId.startsWith("posmv")) {
            const id = interaction.customId.split("-")[1]
            const modal = new ModalBuilder().setCustomId(`posmvmodal-${id}`).setTitle("Position Record - Replace")
            const titlerow = new TextInputBuilder().setCustomId(`posmvtitle`).setLabel("Position Title").setStyle(TextInputStyle.Short).setRequired(true)
            const dateJoinRow = new TextInputBuilder().setCustomId("posmvdate").setLabel("Join Date (New Position)").setStyle(TextInputStyle.Short).setRequired(true)
            const dateQuitRow = new TextInputBuilder().setCustomId("posmvquitdate").setLabel("Leave Date (Old Position)").setStyle(TextInputStyle.Short).setRequired(true)
            const terms = new TextInputBuilder().setCustomId("posmvterms").setLabel("Terms (Good/Bad)").setStyle(TextInputStyle.Short).setRequired(true)
            const reason = new TextInputBuilder().setCustomId("posmvreason").setLabel("Reason").setStyle(TextInputStyle.Short)

            const arow1 = new ActionRowBuilder<TextInputBuilder>().addComponents(titlerow)
            const arow2 = new ActionRowBuilder<TextInputBuilder>().addComponents(dateJoinRow)
            const arow3 = new ActionRowBuilder<TextInputBuilder>().addComponents(dateQuitRow)
            const arow4 = new ActionRowBuilder<TextInputBuilder>().addComponents(terms)
            const arow5 = new ActionRowBuilder<TextInputBuilder>().addComponents(reason)

            modal.addComponents(arow1, arow2, arow3, arow4, arow5)

            await interaction.showModal(modal)

        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith("posmodal")) {
            try {
                const title = interaction.fields.getTextInputValue("title")
                const join = interaction.fields.getTextInputValue("join")
                const joinYear = parseInt(join.split("-")[0])
                const joinMonth = parseInt(join.split("-")[1]) - 1
                const joinDate = parseInt(join.split("-")[2]) - 1
                const joinObj = new Date(joinYear, joinMonth, joinDate)
                const joinTs = await Query.positionHistory.postNewHistory(title, joinObj, parseInt(interaction.customId.split("-")[1]))
                if (joinTs == 0) {
                    interaction.reply({ content: `Position history added for Staff ID ${interaction.customId.split("-")[1]}.` })
                } else {
                    interaction.reply({ content: `Position history will be added for Staff ID ${interaction.customId.split("-")[1]} <t:${joinTs}:R>.` })
                }

            } catch (err) {
                sendError(err, interaction, true)
            }
        } else if (interaction.customId.startsWith("poseditmodal")) {
            const id = interaction.customId.split("-")[1]
            try {

                const titlerow = interaction.fields.fields.some(field => field.customId.startsWith("edittitle"))
                const joinDaterow = interaction.fields.fields.some(field => field.customId.startsWith("editjoin"))
                if (titlerow) {
                    const title = interaction.fields.getTextInputValue("edittitle")
                    await Query.positions.updatePositionTitle(parseInt(id), title)
                }
                if (joinDaterow) {
                    const join = interaction.fields.getTextInputValue("editjoin")
                    const joinYear = parseInt(join.split("-")[0])
                    const joinMonth = parseInt(join.split("-")[1]) - 1
                    const joinDate = parseInt(join.split("-")[2])
                    const joinObj = new Date(joinYear, joinMonth, joinDate)
                    await Query.positionHistory.updateDate("Join", Math.round(joinObj.getTime() / 1000), parseInt(id))
                }
                await interaction.reply({ content: "Your edits have been carefully recorded." })

            } catch (err) {
                sendError(err, interaction, true)
            }
        } else if (interaction.customId.startsWith("posrmmodal")) {
            const id = interaction.customId.split("-")[1]
            const terms = interaction.fields.getTextInputValue("posrmterms").toLowerCase()
            let termsBool = (terms == "good" ? true : false)
            const reason = interaction.fields.getTextInputValue("posrmreason")

            try {
                const quitDaterow = interaction.fields.getTextInputValue("posrmquitdate")

                const quitYear = parseInt(quitDaterow.split("-")[0])
                const quitMonth = parseInt(quitDaterow.split("-")[1]) - 1
                const quitDate = parseInt(quitDaterow.split("-")[2])
                const quitObj = new Date(quitYear, quitMonth, quitDate)
                const quitTs = await Query.positionHistory.removePosition(quitObj, parseInt(id), termsBool, reason)

                if (quitTs == 0) {
                    await interaction.reply({ content: "User has been immediately removed from position." })
                } else {
                    await interaction.reply({ content: `User will be removed from position <t:${quitTs}:R>.` })
                }
            } catch (err) {
                sendError(err, interaction, true)
            }
        } else if (interaction.customId.startsWith("posmvmodal")) {
            const id = interaction.customId.split("-")[1]
            try {
                const titlerow = interaction.fields.getTextInputValue("posmvtitle")
                const joinrow = interaction.fields.getTextInputValue("posmvdate")
                const joinYear = parseInt(joinrow.split("-")[0])
                const joinMonth = parseInt(joinrow.split("-")[1]) - 1
                const joinDate = parseInt(joinrow.split("-")[2])
                const joinObj = new Date(joinYear, joinMonth, joinDate)
                const quitrow = interaction.fields.getTextInputValue("posmvquitdate")
                const quitYear = parseInt(quitrow.split("-")[0])
                const quitMonth = parseInt(quitrow.split("-")[1]) - 1
                const quitDate = parseInt(quitrow.split("-")[2])
                const quitObj = new Date(quitYear, quitMonth, quitDate)
                const terms = interaction.fields.getTextInputValue("posmvterms").toLowerCase()
                let termsBool = (terms == "good" ? true : false)
                const reason = interaction.fields.getTextInputValue("posmvreason")


                const quitTs = await Query.positionHistory.movePosition(titlerow, joinObj, quitObj, parseInt(id), termsBool, reason)
                if (quitTs == 0) {
                    await interaction.reply({ content: "Successfully moved user." })
                } else {
                    await interaction.reply({ content: `Successfully moved user. User will be removed from their old position <t:${quitTs}:R>.` })
                }

            } catch (err) {
                console.log(err)
                sendError(err, interaction, true)
            }
        }
    }
    if (
        interaction.isChatInputCommand() ||
        interaction.isMessageContextMenuCommand()
    ) {
        const command = client.commands.get(interaction.commandName)
        if (!command) return
        const permit = await Query.auth.getPermit(interaction.user.id, interaction.user.id)
        if (command.permit && permit < command.permit) {
            interaction.reply({ content: `You don't have the required permit to run this command!\n\nYou have: Permit ${permit}\nCommand needs: Permit ${command.permit}` })
            return
        } else {
            try {
                if (command.permit) await command.execute(interaction, permit)
                else await command.execute(interaction)
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
    }
})