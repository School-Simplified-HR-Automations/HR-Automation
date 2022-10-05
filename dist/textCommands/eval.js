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
const logger_1 = require("../services/logger");
const security_1 = require("../services/security");
const stopwatch_1 = require("@sapphire/stopwatch");
const utilities_1 = require("@sapphire/utilities");
const axios_1 = __importDefault(require("axios"));
module.exports = {
    name: "eval",
    description: "Evaluates a code snippet.",
    aliases: ["ev", "evaluate"],
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
                    if (code.includes("await")) {
                        code = `(async () => {\n${code}\n})();`;
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
                    yield security_1.Security.evalCheck(code, message.author)
                        .then((result) => __awaiter(this, void 0, void 0, function* () {
                        if (result.status !== 1) {
                            message.reply(`\`\`\`diff\n-Security Service Error ${result.status}: ${result.message}\n\`\`\``);
                            return;
                        }
                        else {
                            try {
                                const stopwatch = new stopwatch_1.Stopwatch();
                                const evaled = eval(code);
                                stopwatch.stop();
                                const cleaned = yield clean(evaled);
                                const output = (0, utilities_1.codeBlock)("ts", cleaned);
                                if (output.length > 2000) {
                                    axios_1.default
                                        .post("https://hst.sh/documents", cleaned)
                                        .then((res) => __awaiter(this, void 0, void 0, function* () {
                                        message.channel.send(`https://hst.sh/${res.data.id} \n${stopwatch
                                            .stop()
                                            .toString()}`);
                                        return;
                                    }))
                                        .catch((err) => __awaiter(this, void 0, void 0, function* () {
                                        message.channel.send(`\`\`\`js\nFailed to upload result: ${err}\n\`\`\``);
                                        logger_1.log.error(err);
                                        return;
                                    }));
                                }
                                message.channel.send(`${output}\n${stopwatch.stop().toString()}`);
                            }
                            catch (err) {
                                const cleaned = yield clean(err);
                                if (cleaned.length > 2000) {
                                    axios_1.default
                                        .post("https://hst.sh/documents", cleaned)
                                        .then((res) => __awaiter(this, void 0, void 0, function* () {
                                        message.channel.send(`https://hst.sh/${res.data.id}`);
                                        return;
                                    }))
                                        .catch((err) => __awaiter(this, void 0, void 0, function* () {
                                        message.channel.send(`\`\`\`js\nFailed to upload result: ${err}\n\`\`\``);
                                        logger_1.log.error(err);
                                        return;
                                    }));
                                }
                                message.channel.send(`\`\`\`js\n${cleaned}\n\`\`\``);
                            }
                        }
                    }))
                        .catch((error) => {
                        logger_1.log.error(error, "Failed to check evaler user");
                        message.reply(`\`\`\`diff\nSecurity Service Error 2: Internal error\n\`\`\``);
                    });
                }
            }))
                .catch((error) => {
                logger_1.log.error(error, `Failed to check evaler user ${message.author.tag} (${message.author.id})`);
                message.reply(`\`\`\`diff\nSecurity Service Error 2: Internal error\n\`\`\``);
            });
        });
    },
};
