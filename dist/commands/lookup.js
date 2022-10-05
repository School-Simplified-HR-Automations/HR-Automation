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
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("lookup")
        .setDescription("Lookup a staff member by a certain identifier.")
        .addStringOption(c => c.setName("filter").setDescription("Filter to apply.").addChoices({
        name: "full-name",
        value: "full-name"
    }, {
        name: "first-name",
        value: "fname"
    }, {
        name: "last-name",
        value: "lname"
    }, {
        name: "id",
        value: "id"
    }).setRequired(true))
        .addStringOption(c => c.setName("query").setDescription("Search query.").setRequired(true)),
    execute(interaction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            if (interaction.options.getString("filter") == "full-name") {
                const fname = (_a = interaction.options.getString("query")) === null || _a === void 0 ? void 0 : _a.split(" ")[0];
                const lname = (_b = interaction.options.getString("query")) === null || _b === void 0 ? void 0 : _b.split(" ")[1];
                const staff = yield query_1.default.staff.getStaffByFullName(`${fname}`, `${lname}`);
                const embed = new discord_js_1.EmbedBuilder().setTitle(staff.name);
                let descstr = "";
                let posarr = yield query_1.default.positions.getPositionStaff(staff.id);
                for (let i = 0; i < posarr.length; i++) {
                    descstr += `*${posarr[i]}*\n`;
                }
                embed.setDescription(`${descstr}`);
                let deptteams = "";
                let deptarr = yield query_1.default.departments.getDepartmentStaff(staff.id);
                let teamarr = yield query_1.default.teams.getTeamStaff(staff.id);
                for (let i = 0; i < deptarr.length; i++) {
                    deptteams += `*${deptarr[i]} - ${teamarr[i]}*\n`;
                }
                embed
                    .addFields({
                    name: "Departments and Teams",
                    value: `${deptteams}`
                }, {
                    name: "Emails",
                    value: `Personal: ${staff.personalEmail}\nWork: ${staff.companyEmail}`,
                    inline: true
                }, {
                    name: "Strikes/Censures/Pips",
                    value: `${staff.strikes}/${staff.censures}/${staff.pips}`,
                    inline: true
                }, {
                    name: "On Leave?",
                    value: `${staff.outOfOffice ? "True" : "False"}`
                });
                if (staff.outOfOffice)
                    embed.setColor("Red");
                else
                    embed.setColor("Aqua");
                yield interaction.editReply({ embeds: [embed] });
            }
            else
                yield interaction.editReply("{}");
        });
    },
};
