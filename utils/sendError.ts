import Discord, { ButtonInteraction, CommandInteraction, Message, EmbedBuilder, ChatInputCommandInteraction } from "discord.js"

const sendError = (e: any, type: CommandInteraction | ButtonInteraction | Message | ChatInputCommandInteraction) => {
    const errorEmbed = new EmbedBuilder().setTitle("Error During Execution").setDescription(`Oops! It appears the bot encountered an error while handling that request. No worries, you can continue to use the bot as normal - the log is attached for you to send to the Support team.\n\nError:\n\`\`\`${e}\`\`\``).setColor("Red")
    return type.channel?.send({ embeds: [errorEmbed]})
}


export default sendError