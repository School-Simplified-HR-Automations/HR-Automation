import { ChatInputCommandInteraction, EmbedBuilder, TextBasedChannel } from "discord.js";
import { dbSql } from "..";

export default async function genAudit(table: string, fields: string[], values: any[], interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
        .setTitle("DB Audit Log")
        .setDescription(`Updated table \`${table}\``)

    for (let i = 0; i < 25; i++) {
        embed.addFields(
            {
                name: fields[i],
                value: `${values[i]}`
            }
        )
    }
    embed.setColor("Orange")
    const channel = (await dbSql.query(`SELECT logChannel FROM settings`) as string[])[0]
    const fetchedChannel = interaction.guild?.channels.cache.get(channel) as TextBasedChannel
    await fetchedChannel.send({ embeds: [embed] })
}