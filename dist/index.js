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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.Team = exports.Supervisor = exports.StaffFile = exports.Position = exports.PositionHistory = exports.DiscordInformation = exports.Department = exports.dbSql = void 0;
const collection_1 = require("@discordjs/collection");
const discord_js_1 = require("discord.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
require("dotenv").config();
const logger_1 = require("./services/logger");
const sequelize_1 = require("sequelize");
const stopwatch_1 = require("@sapphire/stopwatch");
const bootCheck_1 = require("./utils/bootCheck");
const security_1 = require("./services/security");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const body_parser_1 = __importDefault(require("body-parser"));
const morgan_1 = __importDefault(require("morgan"));
const query_1 = __importDefault(require("./routes/query"));
const clean_1 = __importDefault(require("./utils/clean"));
const sw = new stopwatch_1.Stopwatch().start();
bootCheck_1.BootCheck.check();
// Create a new client instance
const dbSql = new sequelize_1.Sequelize(process.env.SQL_URI, {
    username: process.env.SQL_USERNAME,
    password: process.env.SQL_PASSWORD,
    dialect: "mysql",
    ssl: true,
    dialectOptions: {
        ssl: {
            require: true,
        },
        multipleStatements: true,
    },
});
exports.dbSql = dbSql;
// model declarations
const Team = dbSql.define("Team", {
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
});
exports.Team = Team;
const Supervisor = dbSql.define("Supervisor", {
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
});
exports.Supervisor = Supervisor;
const StaffFile = dbSql.define("StaffFile", {
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    personalEmail: {
        type: sequelize_1.DataTypes.STRING,
        validate: {
            is: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        },
        allowNull: true,
    },
    companyEmail: {
        type: sequelize_1.DataTypes.STRING,
        validate: {
            is: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        },
        allowNull: true,
    },
    photoLink: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    legalSex: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    genderIdentity: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    ethnicity: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    appStatus: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    strikes: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    censures: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    pips: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    activityStatus: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    alumni: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    outOfOffice: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});
exports.StaffFile = StaffFile;
const PositionHistory = dbSql.define("PositionHistory", {
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    dept: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    team: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    joined: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    quit: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
});
exports.PositionHistory = PositionHistory;
const Position = dbSql.define("Position", {
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
});
exports.Position = Position;
const DiscordInformation = dbSql.define("DiscordInfo", {
    username: {
        type: sequelize_1.DataTypes.STRING,
        validate: {
            is: /.{1,}#[0-9]{4}/,
        },
        allowNull: false,
    },
    discordId: {
        type: sequelize_1.DataTypes.STRING,
        validate: {
            is: /[0-9]{17,}/,
        },
        allowNull: false,
        unique: true,
    },
});
exports.DiscordInformation = DiscordInformation;
const Department = dbSql.define("Department", {
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
});
exports.Department = Department;
const StrikeHistory = dbSql.define("StrikeHistory", {
    details: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    dateGiven: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    administrator: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    evidenceLink: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
});
const CensureHistory = dbSql.define("CensureHistory", {
    details: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    dateGiven: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    administrator: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    evidenceLink: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
});
const PIPHistory = dbSql.define("PIPHistory", {
    details: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    dateGiven: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    administrator: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    evidenceLink: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
});
const BreakRecord = dbSql.define("BreakRecord", {
    dateFrom: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    dateTo: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    reason: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    approval: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
});
const Tickets = dbSql.define("Tickets", {
    channelId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    authorId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    paneltpguid: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    openDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    closeDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
});
const TicketPanels = dbSql.define("TicketPanels", {
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    value: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    channelPrefix: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    guildId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    buttonName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    tpguid: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    messageLink: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    category: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    logChannel: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
});
const Messages = dbSql.define("messages", {
    authoruser: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    authorid: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    messageId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    messageChannelId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    messageServerId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    time: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    }
});
// Supervisor Associations
Supervisor.hasMany(Department);
Department.belongsTo(Supervisor);
Supervisor.belongsTo(StaffFile);
StaffFile.hasOne(Supervisor);
Supervisor.hasMany(Team);
Team.belongsToMany(Supervisor, { through: "TeamSupervisor" });
Supervisor.hasMany(Position);
Position.belongsTo(Supervisor);
Team.hasMany(Position);
Position.belongsTo(Team);
// StaffFile Associations
StaffFile.hasOne(DiscordInformation);
DiscordInformation.belongsTo(StaffFile);
StaffFile.hasMany(PositionHistory);
PositionHistory.belongsTo(StaffFile);
StaffFile.hasMany(StrikeHistory);
StrikeHistory.belongsTo(StaffFile);
StaffFile.hasMany(CensureHistory), CensureHistory.belongsTo(StaffFile);
StaffFile.hasMany(PIPHistory);
PIPHistory.belongsTo(StaffFile);
StaffFile.hasMany(BreakRecord);
BreakRecord.belongsTo(StaffFile);
StaffFile.belongsTo(Team);
Team.hasMany(StaffFile);
StaffFile.belongsTo(Department);
Department.hasMany(StaffFile);
Position.hasMany(StaffFile);
StaffFile.belongsToMany(Position, {
    through: "PositionStaff",
});
Department.hasMany(StaffFile);
StaffFile.belongsToMany(Department, {
    through: "DepartmentStaff"
});
Team.hasMany(StaffFile);
StaffFile.belongsToMany(Team, {
    through: "TeamStaff"
});
StaffFile.hasMany(Messages);
Messages.belongsTo(StaffFile);
// Team Associations
Team.belongsTo(Department);
Department.hasMany(Team);
// Others
Position.hasMany(PositionHistory);
PositionHistory.belongsTo(Position);
Department.hasMany(PositionHistory);
PositionHistory.belongsTo(Department);
Position.belongsTo(Department);
Department.hasMany(Position);
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.GuildBans,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
    ],
    partials: [discord_js_1.Partials.Channel]
});
// @ts-ignore
client.commands = new collection_1.Collection();
const commandsPath = path_1.default.join(__dirname, "commands");
const eventsPath = path_1.default.join(__dirname, "events");
const commandFiles = fs_1.default
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith("ts"));
for (const file of commandFiles) {
    const filePath = path_1.default.join(commandsPath, file);
    const command = require(filePath);
    // @ts-ignore
    client.commands.set((_a = command.data) === null || _a === void 0 ? void 0 : _a.name, command);
}
client.textCommands = new collection_1.Collection();
const textCommandFiles = fs_1.default
    .readdirSync("./textCommands")
    .filter((file) => file.endsWith(".ts"));
for (const file of textCommandFiles) {
    const command = require(`./textCommands/${file}`);
    client.textCommands.set(command.name, command);
}
const app = (0, express_1.default)();
exports.app = app;
app.use((0, helmet_1.default)());
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)({
    origin: "*"
}));
app.use((0, morgan_1.default)('combined'));
/**app.all('*', function(req: any, res: any, next: any) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});*/
app.listen(3000, () => {
    console.log("Server started on port 3000");
});
client.once("ready", () => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.log.success(`Readied in ${sw.stop().toString()}!`);
}));
client.on("interactionCreate", (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    if (interaction.isChatInputCommand() ||
        interaction.isMessageContextMenuCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command)
            return;
        try {
            yield command.execute(interaction);
        }
        catch (error) {
            const ID = logger_1.log.error(error, `Command ${interaction.commandName}, User: ${interaction.user.tag}(${interaction.user.id}), Guild: ${(_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.name}(${interaction.guildId}), Options: ${interaction.options}`, true);
            interaction.reply(`An error occured while executing the command.\n\nError ID: ${ID}`);
        }
    }
}));
client.on("messageCreate", (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e, _f;
    if ((_c = message.mentions.members) === null || _c === void 0 ? void 0 : _c.first()) {
        let memberArr = [];
        message.mentions.members.forEach(member => memberArr.push(member.user.id));
        for (let i = 0; i < memberArr.length; i++) {
            const leave = yield query_1.default.staff.onLeave(memberArr[i]);
            if (leave) {
                const guildId = (_d = message.guild) === null || _d === void 0 ? void 0 : _d.id;
                const channelId = message.channel.id;
                dbSql.query(`INSERT INTO messages
				(authoruser, authorid, messageid, messageChannelId, messageServerId, time, createdAt, updatedAt, StaffFileId)
				VALUES ('${(_e = message.member) === null || _e === void 0 ? void 0 : _e.displayName}', '${(_f = message.member) === null || _f === void 0 ? void 0 : _f.id}', '${message.id}', '${channelId}', '${guildId}', now(), now(), now(), (SELECT StaffFileId FROM discordinfos WHERE discordId='${memberArr[i]}'))`);
            }
        }
    }
}));
client.on("messageCreate", (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h;
    const prefix = process.env.DEV_PREFIX;
    if (message.content.startsWith(prefix) && !message.author.bot) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = (_g = args.shift()) === null || _g === void 0 ? void 0 : _g.toLowerCase();
        if (commandName == "testpos") {
            query_1.default.positions.getPositionStaff(1);
        }
        if (commandName == "eval") {
            // If the message author's ID does not equal
            // our ownerID, get outta there!
            if (message.author.id !== "413462464022446084")
                return;
            // In case something fails, we to catch errors
            // in a try/catch block
            try {
                // Evaluate (execute) our input
                const evaled = eval(args.join(" "));
                // Put our eval result through the function
                // we defined above
                const cleaned = yield (0, clean_1.default)(evaled);
                // Reply in the channel with our result
                message.channel.send(`\`\`\`js\n${cleaned}\n\`\`\``);
            }
            catch (err) {
                // Reply in the channel with our error
                message.channel.send(`\`ERROR\` \`\`\`xl\n${err}\n\`\`\``);
            }
            return;
        }
        const command = (yield client.textCommands.get(commandName)) ||
            (yield client.textCommands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName)));
        if (!command)
            return;
        if (!client.textCommands.has(command.name))
            return;
        try {
            //* Text commands will always be developer only.
            security_1.Security.basicDevCheck(message.author)
                .then((result) => {
                if (result.status !== 1) {
                    logger_1.log.warn(`${message.author.tag} (${message.author.id}) tried to use a developer only command.`);
                    return;
                }
            })
                .catch((err) => {
                logger_1.log.error(err);
            });
            client.textCommands.get(command.name).execute(message, args);
        }
        catch (error) {
            const ID = logger_1.log.error(error, `Command ${JSON.stringify(command)}, User: ${message.author.tag}(${message.author.id}), Guild: ${(_h = message.guild) === null || _h === void 0 ? void 0 : _h.name}(${message.guildId}), Args: ${args}`, true);
            message.reply(`An error occurred while executing the command.\n\nError ID: ${ID}`);
        }
    }
}));
const src = [
    {
        title: "SS HR API",
        author: "SS HR",
        version: "v0.0.1"
    }
];
app.get('/', (req, res) => {
    res.send(src);
});
app.get('/users/firstname/:firstname', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header("Access-Control-Allow-Origin", "*");
    res.send(yield query_1.default.staff.getStaffByFirstName(`${req.params.firstname}`));
}));
app.get('/users/lastname/:lastname', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header("Access-Control-Allow-Origin", "*");
    res.send(yield query_1.default.staff.getStaffByLastName(`${req.params.lastname}`));
}));
app.get('/users/id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = parseInt(req.query.id);
    if (isNaN(id))
        res.send({
            status: 400,
            message: "Invalid ID"
        });
    res.header("Access-Control-Allow-Origin", "*");
    res.send(yield query_1.default.staff.getStaffById(id));
}));
app.get('/users/email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.header("Access-Control-Allow-Origin", "*");
        res.send(yield query_1.default.staff.getStaffByEmail(`${req.query.email}`, 'Company'));
    }
    catch (_j) {
    }
}));
client.login(process.env.TOKEN);
exports.default = client;
