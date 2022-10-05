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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const nodemailer_1 = __importDefault(require("nodemailer"));
const TicketStorage_1 = __importDefault(require("../models/TicketStorage"));
require("dotenv").config();
const ticketGeneration_1 = __importDefault(require("../utils/ticketGeneration"));
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Opens an email ticket with the HR Automations Specialist.")
        .addStringOption((opt) => opt
        .setName("category")
        .setDescription("The category of your inquiry.")
        .addChoices({
        name: "Bot Inquiry",
        value: "bot",
    }, {
        name: "Database Inquiry",
        value: "database",
    }, {
        name: "Bug Report",
        value: "bug-report",
    }, {
        name: "General Inquiry",
        value: "geninq",
    })
        .setRequired(true))
        .addStringOption((opt) => opt
        .setName("response-email")
        .setDescription("The email for us to respond to. Should be your SS email.")
        .setRequired(true))
        .addStringOption((opt) => opt
        .setName("message")
        .setDescription("The message to send via the ticket.")
        .setRequired(true))
        .addNumberOption((opt) => opt
        .setName("priority")
        .setDescription("The priority level of this ticket, from 0 to 5.")
        .setMinValue(0)
        .setMaxValue(5)),
    execute(interaction) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply({ ephemeral: true });
            if (!((_a = interaction.options
                .getString("response-email")) === null || _a === void 0 ? void 0 : _a.match(/[a-z.]{1,}@schoolsimplified.org/))) {
                return interaction.editReply({
                    content: `This doesn't appear to be your internal SS email --> ${interaction.options.getString("response-email")}\nPlease ensure you're providing that email!`,
                });
            }
            const cat = interaction.options.getString("category");
            const tkt = yield TicketStorage_1.default.create({
                author: `${interaction.options.getString("response-email")}`,
                category: `${cat == "bot"
                    ? "bot"
                    : cat == "database"
                        ? "db"
                        : cat == "bug-report"
                            ? "br"
                            : "gen"}`,
                messages: `${interaction.options.getString("message")}`,
            });
            const transporter = nodemailer_1.default.createTransport({
                service: "gmail",
                auth: {
                    user: `${process.env.USER}`,
                    pass: `${process.env.PW}`,
                },
            });
            const mailOptions = (0, ticketGeneration_1.default)(interaction.options.getString("message"), interaction.options.getString("response-email"), interaction.options.getString("category"), interaction.options.getNumber("priority"));
            transporter.sendMail(mailOptions, function (error, info) {
                error ? console.log(error) : console.log("New ticket submitted.");
            });
            const selfresponse = (0, ticketGeneration_1.default)(interaction.options.getString("message"), interaction.options.getString("response-email"), interaction.options.getString("category"), interaction.options.getNumber("priority"), true);
            return transporter.sendMail(selfresponse, function (error, info) {
                error
                    ? console.log(error)
                    : interaction.editReply({ content: "Message sent!" });
            });
        });
    },
};
