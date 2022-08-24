import { dbSql } from "..";
import { DataTypes } from "sequelize";

const Tickets = dbSql.define('TicketStorage', {
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        validate: {
            isIn: [["bot", "gen", "db", "br"]]
        },
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    messages: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

export default Tickets