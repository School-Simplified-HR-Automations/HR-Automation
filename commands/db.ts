import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js";
import { QueryTypes } from "sequelize"
import { dbSql } from "../index";
import Tickets from "../models/TicketStorage";
import StaffFileQueryRoutes from "../routes/StaffFileQueryRoutes";

module.exports = {
    data: new SlashCommandBuilder()
    .setName("db")
    .setDescription("Raw SQL Queries.")
    .addStringOption(opt => opt.setName("query").setDescription("Query to run.").setRequired(true))
    .addStringOption(opt => opt.setName("type").setDescription("Query type.").setChoices({ name: "Select", value: "select"}, { name: "Insert", value: "insert" }, { name: "Update", value: "update" })),
    async execute(interaction: ChatInputCommandInteraction) {
        if (interaction.user.id !== "413462464022446084") return
        let error = {
            status: false,
            error: null
        }
        let type;
        let reqtype = interaction.options.getString("type")?.toLowerCase()
        reqtype == "select" ? type = QueryTypes.SELECT : reqtype == "insert" ? type = QueryTypes.INSERT : type = QueryTypes.UPDATE
        const res = await dbSql.query(`${interaction.options.getString("query")};`, { type: type }).catch(err => { error.status = true; error.error = err })
        if (!error.status) return interaction.reply({ content: `${JSON.stringify(res, null, 4)}` })
        else return interaction.reply({ content: `Error during execution - ${error.error}`})
    }
}