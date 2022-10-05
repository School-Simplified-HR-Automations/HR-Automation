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
const stopwatch_1 = require("@sapphire/stopwatch");
const discord_js_1 = require("discord.js");
const __1 = require("..");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("sync")
        .setDescription("You don't need this."),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const sw = new stopwatch_1.Stopwatch().start();
            interaction.deferReply();
            if (!(interaction.user.id == "413462464022446084"))
                return;
            yield __1.dbSql
                .sync({ logging: true })
                .then((res) => {
                return interaction.editReply(`Done - took ${sw.stop().toString()}`);
            })
                .catch((err) => {
                return interaction.editReply(`Error - ${err}`);
            });
        });
    },
};
