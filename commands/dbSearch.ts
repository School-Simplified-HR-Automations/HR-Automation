import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
const { QueryTypes } = require("sequelize")
import { dbSql } from "../index";
import Tickets from "../models/TicketStorage"

module.exports = {
    data: new SlashCommandBuilder()
    .setName("db-search")
    .setDescription("Raw SQL Queries.")
    .addStringOption(opt => opt.setName("query").setDescription("Query to run.").setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        const res = await dbSql.query(`${interaction.options.getString("query")}`, { type: QueryTypes.SELECT, model: Tickets })
        return interaction.reply({ content: res.join("\n") })
    }
}