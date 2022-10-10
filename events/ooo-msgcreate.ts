import { Client, Message } from "discord.js";
import { dbSql } from "..";
import Query from "../routes/query";
import { client } from ".."

client.on("messageCreate", async (message: Message) => {
    if (message.mentions.members?.first()) {
        let memberArr: string[] = [];
        message.mentions.members.forEach(member => memberArr.push(member.user.id))
        for (let i = 0; i < memberArr.length; i++) {
            const leave = await Query.staff.onLeave(memberArr[i])
            if (leave) {
                const guildId = message.guild?.id
                const channelId = message.channel.id
                dbSql.query(`INSERT INTO messages
                (authoruser, authorid, messageid, messageChannelId, messageServerId, time, createdAt, updatedAt, StaffFileId)
                VALUES ('${message.member?.displayName}', '${message.member?.id}', '${message.id}', '${channelId}', '${guildId}', now(), now(), now(), (SELECT id FROM stafffiles WHERE discordId='${memberArr[i]}'))`)
            }
        }
    }
})