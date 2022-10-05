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
const logger_1 = require("../services/logger");
const security_1 = require("../services/security");
const stopwatch_1 = require("@sapphire/stopwatch");
const node_child_process_1 = require("node:child_process");
module.exports = {
    name: "exec",
    description: "Executes a code snippet.",
    aliases: ["ex", "execute"],
    execute(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield security_1.Security.isEvalerUser(message.author)
                .then((result) => __awaiter(this, void 0, void 0, function* () {
                if (result.status !== 1) {
                    message.reply(`\`\`\`diff\n-Security Service Error ${result.status}: ${result.message}\n\`\`\``);
                    return;
                }
                else {
                    let code = args.join(" ");
                    if (!code) {
                        message.reply("**Error:** No code provided.");
                        return;
                    }
                    const clean = (text) => __awaiter(this, void 0, void 0, function* () {
                        if (text && text.constructor.name == "Promise")
                            text = yield text;
                        if (typeof text !== "string")
                            text = require("util").inspect(text, { depth: 1 });
                        text = text
                            .replace(/`/g, "`" + String.fromCharCode(8203))
                            .replace(/@/g, "@" + String.fromCharCode(8203));
                        return text;
                    });
                    yield security_1.Security.execCheck(code, message.author)
                        .then((result) => __awaiter(this, void 0, void 0, function* () {
                        if (result.status !== 1) {
                            message.reply(`\`\`\`diff\n-Security Service Error ${result.status}: ${result.message}\n\`\`\``);
                            return;
                        }
                        else {
                            try {
                                //execute code using child_process.exec
                                /* const stopwatch = new Stopwatch().start()
                                const { stdout, stderr } = await exec(code)
                                stopwatch.stop()
                                const output = await clean(stdout)
                                const errorOutput = await clean(stderr)
                                if(output) {
                                    const attachment = new AttachmentBuilder(Buffer.from(output), {
                                        name: "output.txt",
                                        description: `Output of shell execution by ${message.author.tag}.`,
                                    })
                                    message.channel.send({
                                        content: `${stopwatch.toString()}.`,
                                        files: [attachment],
                                    })
                                } else if(errorOutput) {
                                    const attachment = new AttachmentBuilder(
                                        Buffer.from(errorOutput),
                                        {
                                            name: "error-output.txt",
                                            description: `Output of shell execution by ${message.author.tag}.`,
                                        }
                                    )
                                    message.channel.send({
                                        content: `${stopwatch.toString()}.`,
                                        files: [attachment],
                                    })

                                } else {
                                    message.reply(
                                        `${codeBlock("bash", "No output.")}\n${stopwatch.toString()}`
                                    )
                                }
                                */
                                const stopwatch = new stopwatch_1.Stopwatch();
                                (0, node_child_process_1.exec)(code, (error, stdout, stderr) => {
                                    if (error) {
                                        const attachment = new discord_js_1.AttachmentBuilder(Buffer.from(error.message), {
                                            name: "error-output.txt",
                                            description: `Output of shell execution by ${message.author.tag}.`,
                                        });
                                        message.channel.send({
                                            content: `${stopwatch.toString()}.`,
                                            files: [attachment],
                                        });
                                    }
                                    else {
                                        const attachment = new discord_js_1.AttachmentBuilder(Buffer.from(stdout), {
                                            name: "stdout-output.txt",
                                            description: `Output of shell execution by ${message.author.tag}.`,
                                        });
                                        const attachment2 = new discord_js_1.AttachmentBuilder(Buffer.from(stderr), {
                                            name: "stderr-output.txt",
                                            description: `Output of shell execution by ${message.author.tag}.`,
                                        });
                                        message.channel.send({
                                            content: `${stopwatch.toString()}.`,
                                            files: [attachment, attachment2],
                                        });
                                    }
                                });
                            }
                            catch (error) {
                                const attachment = new discord_js_1.AttachmentBuilder(Buffer.from(yield clean(error)), {
                                    name: "error-output.txt",
                                    description: `Output of shell execution by ${message.author.tag}.`,
                                });
                                message.channel.send({
                                    files: [attachment],
                                });
                            }
                        }
                    }))
                        .catch((error) => {
                        logger_1.log.error(error, "Failed to check executor user");
                        message.reply(`\`\`\`diff\nSecurity Service Error 2: Internal error\n\`\`\``);
                    });
                }
            }))
                .catch((error) => {
                logger_1.log.error(error, `Failed to check executor user ${message.author.tag} (${message.author.id})`);
                message.reply(`\`\`\`diff\nSecurity Service Error 2: Internal error\n\`\`\``);
            });
        });
    },
};
