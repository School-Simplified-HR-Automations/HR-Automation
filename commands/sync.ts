import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { dbSql } from "..";

module.exports = {
    data: new SlashCommandBuilder()
    .setName("sync")
    .setDescription("You don't need this."),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!(interaction.user.id == "413462464022446084")) return
        await dbSql.sync({ force: true, logging: true }).then((res) => {
            return interaction.reply(`Done.`)
        })
    }
}