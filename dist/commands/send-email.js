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
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("email")
        .setDescription("Sends various types of emails.")
        .addStringOption((opt) => opt
        .setName("category")
        .setDescription("The category of email to send.")
        .addChoices({ name: "Acceptance Email", value: "acceptance" }, { name: "Rejection Email", value: "rejection" }, { name: "Waitlist Email", value: "waitlist" })
        .setRequired(true))
        .addStringOption((opt) => opt
        .setName("email")
        .setDescription("Email to send email to.")
        .setRequired(true)),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const hirevals = ["acceptance", "rejection", "waitlist"];
            const recipient = interaction.options.getString("email");
            if (hirevals.includes(interaction.options.getString("category"))) {
                if (!recipient.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/))
                    return interaction.reply({
                        content: "Error: Invalid or match-syntax violating email address provided.",
                    });
                const modal = new discord_js_1.ModalBuilder()
                    .setCustomId("res")
                    .setTitle("Email Details");
                const userDetails = new discord_js_1.TextInputBuilder()
                    .setCustomId("userdetails")
                    .setLabel("Recipient Full Name")
                    .setStyle(discord_js_1.TextInputStyle.Short);
                const hiredetails = new discord_js_1.TextInputBuilder()
                    .setCustomId("hiredetails")
                    .setLabel("Position Applied For")
                    .setStyle(discord_js_1.TextInputStyle.Short);
                const deptdetails = new discord_js_1.TextInputBuilder()
                    .setCustomId("deptdetails")
                    .setLabel("Department of Position")
                    .setStyle(discord_js_1.TextInputStyle.Short);
            }
        });
    },
};
