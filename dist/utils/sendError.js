"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const sendError = (e, type) => {
    var _a;
    const errorEmbed = new discord_js_1.EmbedBuilder()
        .setTitle("Error During Execution")
        .setDescription(`Oops! It appears the bot encountered an error while handling that request. No worries, you can continue to use the bot as normal - the log is attached for you to send to the Support team.\n\nError:\n\`\`\`${e}\`\`\``)
        .setColor("Red");
    return (_a = type.channel) === null || _a === void 0 ? void 0 : _a.send({ embeds: [errorEmbed] });
};
exports.default = sendError;
