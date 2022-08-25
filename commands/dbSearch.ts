import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js";
const { QueryTypes } = require("sequelize")
import { dbSql } from "../index";
import Tickets from "../models/TicketStorage";

module.exports = {
    data: new SlashCommandBuilder()
    .setName("db-search")
    .setDescription("Raw SQL Queries.")
    .addStringOption(opt => opt.setName("query").setDescription("Query to run.").setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        let error = {
            status: false,
            error: null
        }
        const res = await dbSql.query(`${interaction.options.getString("query")};`, { type: QueryTypes.SELECT }).catch(err => { error.status = true; error.error = err })
        if (!error.status) return interaction.reply({ content: `${JSON.stringify(res, null, 4)}` })
        else return interaction.reply({ content: `Error during execution - ${error.error}`})
    }
}