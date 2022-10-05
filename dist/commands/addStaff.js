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
const StaffFileQueryRoutes_1 = __importDefault(require("../routes/StaffFileQueryRoutes"));
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("add-staff")
        .setDescription("Adds someone to the database. Should be used purely for syncing existing staff.")
        .addStringOption((opt) => opt
        .setName("full-name")
        .setDescription("The user's full name.")
        .setRequired(true))
        .addStringOption((opt) => opt
        .setName("ss-email")
        .setDescription("The user's School Simplified email address.")
        .setRequired(true))
        .addStringOption((opt) => opt
        .setName("position")
        .setDescription("The user's SS position.")
        .setRequired(true))
        .addStringOption((opt) => opt
        .setName("department")
        .setDescription("The user's department.")
        .setRequired(true))
        .addStringOption((opt) => opt
        .setName("team")
        .setDescription("Opt -> The user's team.")
        .setRequired(false))
        .addStringOption((opt) => opt
        .setName("p-email")
        .setDescription("Opt -> The user's personal email.")
        .setRequired(false))
        .addBooleanOption((opt) => opt
        .setName("supervisor")
        .setDescription("Opt -> is the target a supervisor?")
        .setRequired(false)),
    execute(interaction) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const fullname = interaction.options.getString("full-name");
            const email = interaction.options.getString("ss-email");
            const position = interaction.options.getString("position");
            const department = interaction.options.getString("department");
            const team = interaction.options.getString("team");
            const pemail = interaction.options.getString("p-email");
            const supervisor = (_a = interaction.options.getBoolean("supervisor")) !== null && _a !== void 0 ? _a : false;
            if (interaction.user.id !== "413462464022446084")
                return;
            yield interaction.reply({
                embeds: [new discord_js_1.EmbedBuilder().setTitle("Please wait...").setColor("Blue")],
            });
            if (team) {
                yield new StaffFileQueryRoutes_1.default()
                    .createStaffFile(`${fullname}`, "Active", `${department}`, `${position}`, `${email}`, `${team}`)
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    if (supervisor) {
                        yield new StaffFileQueryRoutes_1.default()
                            .assignSupervisor(`${fullname}`, `${position}`)
                            .then(() => {
                            return interaction.editReply({
                                embeds: [
                                    new discord_js_1.EmbedBuilder()
                                        .setTitle("Finished")
                                        .setDescription("Finished creating staff profile.")
                                        .setColor("Green"),
                                ],
                            });
                        })
                            .catch((err) => {
                            console.log(err);
                            return interaction.editReply({
                                embeds: [
                                    new discord_js_1.EmbedBuilder()
                                        .setTitle("Encountered Error")
                                        .setDescription(`The bot encountered an error during querying:\n\n${err}`),
                                ],
                            });
                        });
                    }
                    else {
                        return interaction.editReply({
                            embeds: [
                                new discord_js_1.EmbedBuilder()
                                    .setTitle("Finished")
                                    .setDescription("Finished creating staff profile.")
                                    .setColor("Green"),
                            ],
                        });
                    }
                }))
                    .catch((err) => {
                    console.log(err);
                    return interaction.editReply({
                        embeds: [
                            new discord_js_1.EmbedBuilder()
                                .setTitle("Encountered Error")
                                .setDescription(`The bot encountered an error during querying:\n\n${err}`),
                        ],
                    });
                });
            }
            else {
                yield new StaffFileQueryRoutes_1.default()
                    .createStaffFile(`${fullname}`, "Active", `${department}`, `${position}`, `${email}`)
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    if (supervisor) {
                        yield new StaffFileQueryRoutes_1.default()
                            .assignSupervisor(`${fullname}`, `${position}`)
                            .then(() => {
                            return interaction.editReply({
                                embeds: [
                                    new discord_js_1.EmbedBuilder()
                                        .setTitle("Finished")
                                        .setDescription("Finished creating staff profile.")
                                        .setColor("Green"),
                                ],
                            });
                        })
                            .catch((err) => {
                            console.log(err);
                            return interaction.editReply({
                                embeds: [
                                    new discord_js_1.EmbedBuilder()
                                        .setTitle("Encountered Error")
                                        .setDescription(`The bot encountered an error during querying:\n\n${err}`),
                                ],
                            });
                        });
                    }
                    else {
                        return interaction.editReply({
                            embeds: [
                                new discord_js_1.EmbedBuilder()
                                    .setTitle("Finished")
                                    .setDescription("Finished creating staff profile.")
                                    .setColor("Green"),
                            ],
                        });
                    }
                }))
                    .catch((err) => {
                    console.log(err);
                    return interaction.editReply({
                        embeds: [
                            new discord_js_1.EmbedBuilder()
                                .setTitle("Encountered Error")
                                .setDescription(`The bot encountered an error during querying:\n\n${err}`),
                        ],
                    });
                });
            }
        });
    },
};
