"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const sequelize_1 = require("sequelize");
const Tickets = __1.dbSql.define("TicketStorage", {
    author: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    category: {
        type: sequelize_1.DataTypes.STRING,
        validate: {
            isIn: [["bot", "gen", "db", "br"]],
        },
        allowNull: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    messages: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
});
exports.default = Tickets;
