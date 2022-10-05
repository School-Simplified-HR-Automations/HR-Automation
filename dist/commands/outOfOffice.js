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
const query_1 = __importDefault(require("../routes/query"));
const index_1 = __importDefault(require("../index"));
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("on-leave")
        .setDescription("You don't need this."),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            let status = yield query_1.default.staff.onLeave(interaction.user.id);
            if (!status) {
                yield query_1.default.staff.setLeave(interaction.user.id, true).then(() => {
                    return interaction.reply({
                        embeds: [
                            new discord_js_1.EmbedBuilder().setTitle("Out of Office Started").setDescription("Great, I'll mark you as out of office until you run this command again.")
                                .setColor("Red")
                        ]
                    });
                });
            }
            else {
                interaction.reply({
                    embeds: [
                        new discord_js_1.EmbedBuilder().setTitle("Out of Office Stopped").setDescription("Welcome back! To begin OOO time again, just run this command. Please give me a minute to parse your messages!")
                            .setColor("Green")
                    ]
                });
                yield query_1.default.staff.setLeave(interaction.user.id, false).then(() => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    let records = yield query_1.default.staff.getMessages(interaction.user.id);
                    if (records.length == 0)
                        return;
                    let overflow = 0;
                    let buffer = "";
                    if (records.length > 25) {
                        overflow = records.length - 25;
                    }
                    let embed = new discord_js_1.EmbedBuilder().setTitle("While You Were Away...").setColor("Green");
                    let record;
                    let ctr = 1;
                    for (record of records) {
                        let message = (_a = index_1.default.guilds.cache.get(record.messageServerId)) === null || _a === void 0 ? void 0 : _a.channels.cache.get(record.messageChannelId);
                        let msgContent;
                        let msgLink;
                        yield message.messages.fetch(record.messageId).then((msg) => {
                            if (msg.content.length > 150) {
                                msgContent = `${msg.content.slice(0, 149)}...`;
                            }
                            else
                                msgContent = msg.content;
                            msgLink = msg.url;
                        });
                        if (overflow != 0 && ctr > 25) {
                            buffer += `Message sent at ${record.createdAt.toLocaleString()}\n\n${msgContent}*\n\nMessage Link: ${msgLink}\nSent by: ${record.authoruser}\n\n`;
                        }
                        else {
                            embed.addFields({
                                name: `${record.createdAt.toLocaleString()}`,
                                value: `*${msgContent}*\n\nMessage Link: ${msgLink}\nSent by: ${record.authoruser}`
                            });
                        }
                        ctr++;
                    }
                    if (overflow == 0) {
                        return interaction.user.send({ embeds: [embed] });
                    }
                    else {
                        return interaction.user.send({
                            content: `${overflow} messages could not be sent in the embed due to Discord space limitations. For more info on these messages, see the attached file.`,
                            embeds: [embed],
                            files: [new discord_js_1.AttachmentBuilder(Buffer.from(buffer), { name: "ooo-report.txt" })]
                        });
                    }
                }));
            }
        });
    },
};
