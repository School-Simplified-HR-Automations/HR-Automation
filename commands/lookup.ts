import { Stopwatch } from "@sapphire/stopwatch"
import { ActionRowBuilder, ChatInputCommandInteraction, EmbedBuilder, SelectMenuBuilder, SlashCommandBuilder } from "discord.js"
import { dbSql } from ".."
import Query from "../routes/query"
import { Department, Position, StaffFile, Team } from "../types/common/ReturnTypes"
import renderProfile from "../utils/renderProfile"
import sendError from "../utils/sendError"

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lookup")
        .setDescription("Lookup a staff member by a certain identifier.")
        .addStringOption(c => c.setName("filter").setDescription("Filter to apply.").addChoices(
            {
                name: "full-name",
                value: "full-name"
            },
            {
                name: "first-name",
                value: "fname"
            },
            {
                name: "last-name",
                value: "lname"
            },
            {
                name: "id",
                value: "id"
            }
        ).setRequired(true))
        .addStringOption(c => c.setName("query").setDescription("Search query.").setRequired(true)),
    permit: 0,
    async execute(interaction: ChatInputCommandInteraction, permit: number) {
        try {
            await interaction.deferReply()
            if (interaction.options.getString("filter") == "full-name") {
                const fname = interaction.options.getString("query", true)?.split(" ")[0]
                const lname = interaction.options.getString("query", true)?.split(" ")[1]
                await renderProfile("name", interaction, fname, lname)
            }
            else if (interaction.options.getString("filter") == "lname") {
                const lname = interaction.options.getString("query", true)
                await renderProfile("lname", interaction, lname)
            }
            else if (interaction.options.getString("filter") == "fname") {
                const fname = interaction.options.getString("query", true)
                await renderProfile("fname", interaction, fname)
            }
            else if (interaction.options.getString("filter") == "id") {
                const id = parseInt(interaction.options.getString("query", true))
                await renderProfile("id", interaction, id)
            }
            else await interaction.editReply("{}")
        } catch (err) {
            console.log(err)
            sendError(err, interaction, true)
        }
    },
}
