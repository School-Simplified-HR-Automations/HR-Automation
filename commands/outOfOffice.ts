import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, TextBasedChannel, TextChannel } from "discord.js"
import { dbSql } from ".."
import Query from "../routes/query"
import client from "../index"
import { MessageRecord } from "../types/common/ReturnTypes"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("on-leave")
		.setDescription("You don't need this."),
	async execute(interaction: ChatInputCommandInteraction) {
		let status = await Query.staff.onLeave(interaction.user.id)
        if (!status) {
            await Query.staff.setLeave(interaction.user.id, true).then(() => {
                return interaction.reply({ embeds: [
                    new EmbedBuilder().setTitle("Out of Office Started").setDescription("Great, I'll mark you as out of office until you run this command again.")
                    .setColor("Red")
                ]})
            })
        } else {
            await Query.staff.setLeave(interaction.user.id, false).then(async () => {
                interaction.reply({ embeds: [
                    new EmbedBuilder().setTitle("Out of Office Stopped").setDescription("Welcome back! To begin OOO time again, just run this command.")
                    .setColor("Green")
                ]})
                let records = await Query.staff.getMessages(interaction.user.id) as MessageRecord[]
                if (records.length == 0) return
                let embed = new EmbedBuilder().setTitle("While You Were Away...").setColor("Green")
                let record: MessageRecord
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
                    embed.addFields(
                        {
                            name: `${record.createdAt.toLocaleString()}`,
                            value: `*${msgContent}*\n\nMessage Link: ${msgLink}\nSent by: ${record.authoruser}`
                        }
                    )
                }
                return interaction.user.send({ embeds: [embed] })
            })
        }
	},
}