import { Attachment, AttachmentBuilder, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, TextBasedChannel, TextChannel } from "discord.js"
import { dbSql } from ".."
import Query from "../routes/query"
import client from "../index"
import { MessageRecord } from "../types/common/ReturnTypes"
import sendError from "../utils/sendError"

module.exports = {
    data: new SlashCommandBuilder()
        .setName("on-leave")
        .setDescription("Set or return from Out of Office Hours."),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            let status = await Query.staff.onLeave(interaction.user.id)
            if (status !== 1) {
                await Query.staff.setLeave(interaction.user.id, true).then(() => {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder().setTitle("Out of Office Started").setDescription("Great, I'll mark you as out of office until you run this command again.")
                                .setColor("Red")
                        ]
                    })
                })
            } else {
                interaction.reply({
                    content: "**Out of Office Mode Disabled**\n\nWelcome Back! Please give me a minute to parse your messages. If you want to enable this mode again in the future just run this command."
                })
                await Query.staff.setLeave(interaction.user.id, false).then(async () => {
                    let records = await Query.staff.getMessages(interaction.user.id) as MessageRecord[]
                    if (records.length == 0) return
                    let overflow = 0;
                    let buffer = ""
                    if (records.length > 25) {
                        overflow = records.length - 25;
                    }
                    let embed = new EmbedBuilder().setTitle("While You Were Away...").setColor("Green")
                    let record: MessageRecord
                    let ctr = 1;
                    for (record of records) {
                        let message = (client.guilds.cache.get(record.messageServerId)?.channels.cache.get(record.messageChannelId) as TextChannel)
                        let msgContent;
                        let msgLink;
                        await message.messages.fetch(record.messageId).then((msg) => {
                            if (msg.content.length > 150) {
                                msgContent = `${msg.content.slice(0, 149)}...`
                            } else msgContent = msg.content
                            msgLink = msg.url
                        })
                        if (overflow != 0 && ctr > 25) {
                            buffer += `Message sent at ${record.createdAt.toLocaleString()}\n\n${msgContent}*\n\nMessage Link: ${msgLink}\nSent by: ${record.authoruser}\n\n`
                        } else {
                            embed.addFields(
                                {
                                    name: `${record.createdAt.toLocaleString()}`,
                                    value: `*${msgContent}*\n\nMessage Link: ${msgLink}\nSent by: ${record.authoruser}`
                                }
                            )
                        }
                        ctr++
                    }
                    if (overflow == 0) {
                        return interaction.user.send({ embeds: [embed] })
							.then(() => {
								interaction.editReply({
									content: "**Out of Office Mode Disabled**\n\nWelcome Back! Your parsed message list was sent to your DMs. If you want to enable this mode again in the future just run this command."
								})
							})
							.catch(() => {
								interaction.editReply({
									content: "**Out of Office Mode Disabled**\n\nWelcome Back! I was unable to send you your parsed message list because you have DMs off. If you want to enable this mode again in the future just run this command."
							})
						})
                    } else {
                        return interaction.user.send({
                            content: `${overflow} messages could not be sent in the embed due to Discord space limitations. For more info on these messages, see the attached file.`,
                            embeds: [embed],
                            files: [new AttachmentBuilder(Buffer.from(buffer), { name: "ooo-report.txt" })]
                        })
						.then(() => {
                            interaction.editReply({
                                content: "**Out of Office Mode Disabled**\n\nWelcome Back! Your parsed message list was sent to your DMs. If you want to enable this mode again in the future just run this command."
							})
						})
						.catch(() => {
                            interaction.editReply({
                                content: "**Out of Office Mode Disabled**\n\nWelcome Back! I was unable to send you your parsed message list because you have DMs off. If you want to enable this mode again in the future just run this command."
                            })
                        })
                    }
                })
            }
            return await Query.staff.dropMessages(interaction.user.id)
        } catch (err) {
            sendError(err, interaction, false)
        }
    },
}
