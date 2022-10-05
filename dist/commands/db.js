"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const sequelize_1 = require("sequelize");
const index_1 = require("../index");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("db")
        .setDescription("Raw SQL Queries.")
        .addStringOption((opt) => opt.setName("query").setDescription("Query to run.").setRequired(true))
        .addStringOption((opt) => opt
        .setName("type")
        .setDescription("Query type.")
        .setChoices({ name: "Select", value: "select" }, { name: "Insert", value: "insert" }, { name: "Update", value: "update" })),
    execute(interaction) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (interaction.user.id !== "413462464022446084")
                return;
            let error = {
                status: false,
                error: null,
            };
            let type;
            let reqtype = (_a = interaction.options.getString("type")) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            reqtype == "select"
                ? (type = sequelize_1.QueryTypes.SELECT)
                : reqtype == "insert"
                    ? (type = sequelize_1.QueryTypes.INSERT)
                    : (type = sequelize_1.QueryTypes.UPDATE);
            const res = yield index_1.dbSql
                .query(`${interaction.options.getString("query")};`, { type: type })
                .catch((err) => {
                error.status = true;
                error.error = err;
            });
            if (!error.status)
                return interaction.reply({ content: `${JSON.stringify(res, null, 4)}` });
            else
                return interaction.reply({
                    content: `Error during execution - ${error.error}`,
                });
        });
    },
};
