import { Attachment, AttachmentBuilder, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, TextBasedChannel, TextChannel } from "discord.js"
import { dbSql } from ".."
import Query from "../routes/query"
import client from "../index"
import { MessageRecord } from "../types/common/ReturnTypes"
import sendError from "../utils/sendError"

module.exports = {
    data: new SlashCommandBuilder()
        .setName("on-leave")
        .setDescription("You don't need this."),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            let status = await Query.staff.onLeave(interaction.user.id)
            if (!status) {
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
                    embeds: [
                        new EmbedBuilder().setTitle("Out of Office Stopped").setDescription("Welcome back! To begin OOO time again, just run this command. Please give me a minute to parse your messages!")
                            .setColor("Green")
                    ]
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
                    } else {
                        return interaction.user.send({
                            content: `${overflow} messages could not be sent in the embed due to Discord space limitations. For more info on these messages, see the attached file.`,
                            embeds: [embed],
                            files: [new AttachmentBuilder(Buffer.from(buffer), { name: "ooo-report.txt" })]
                        })
                    }
                })
            }
        } catch (err) {
            sendError(err, interaction, false)
        }
    },
}