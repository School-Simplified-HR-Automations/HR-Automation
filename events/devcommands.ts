import { Client, Message } from "discord.js";
import Query from "../routes/query";
import { log } from "../services/logger";
import { Security } from "../services/security";
import clean from "../utils/clean";
import { client } from ".."

client.on('messageCreate', async (message: Message) => {
    const prefix = process.env.DEV_PREFIX as string
        if (message.content.startsWith(prefix) && !message.author.bot) {
            const args = message.content.slice(prefix.length).trim().split(/ +/)

            const commandName = args.shift()?.toLowerCase()
            if (commandName == "testpos") {
                Query.positions.getPositionStaff(1)
            }

            const command =
                (await client.textCommands.get(commandName)) ||
                (await client.textCommands.find(
                    (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
                ))

            if (!command) return

            if (!client.textCommands.has(command.name)) return

            try {
                //* Text commands will always be developer only.
                Security.basicDevCheck(message.author)
                    .then((result) => {
                        if (result.status !== 1) {
                            log.warn(
                                `${message.author.tag} (${message.author.id}) tried to use a developer only command.`
                            )
                            return
                        }
                    })
                    .catch((err) => {
                        log.error(err)
                    })
                client.textCommands.get(command.name).execute(message, args)
            } catch (error) {
                const ID = log.error(
                    error,
                    `Command ${JSON.stringify(command)}, User: ${message.author.tag}(${message.author.id
                    }), Guild: ${message.guild?.name}(${message.guildId}), Args: ${args}`,
                    true
                )
                message.reply(
                    `An error occurred while executing the command.\n\nError ID: ${ID}`
                )
            }
        }
})