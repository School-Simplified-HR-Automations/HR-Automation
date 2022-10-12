import { Message } from "discord.js";
import Query from "../routes/query";
import schedule from "node-schedule"
import sendError from "../utils/sendError";

module.exports = {
    name: "devbreak",
    description: "Tests the break command.",
    async execute(message: Message, args: string[]) {
        try {
            const staff = await Query.staff.getStaffById(446084)
            if (!staff) {
                return message.reply("This doesn't appear to be the ID of a registered user.")
            }

            const start = Date.now()
            const end = Date.now() + 20000

            const startTimestamp = Math.round(start / 1000)
            const endTimestamp = Math.round(end / 1000)
            const reason = "Testing dev executed command."
                await Query.records.postBreakRecord('446084', '446084', startTimestamp, endTimestamp)
            schedule.scheduleJob(end, async function () {
                await Query.records.dropBreakRecord(`${staff.id}`, endTimestamp)
            })
            return message.reply({ content: `Got it! ${staff.name} is on break from <t:${startTimestamp}:d> to <t:${endTimestamp}:d>.` })
            

        } catch (err) {
            sendError(err, message)
        }
    }
}