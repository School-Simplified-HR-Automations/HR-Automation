import { dbSql } from "..";
import { DataTypes } from "sequelize"
import StaffFile from "./StaffFile";

const DiscordInformation = dbSql.define('DiscordInfo', {
    username: {
        type: DataTypes.STRING,
        validate: {
            is: /.{1,}#[0-9]{4}/
        },
        allowNull: false
    },
    discordId: {
        type: DataTypes.STRING,
        validate: {
            is: /[0-9]{17,}/
        },
        allowNull: false,
        unique: true
    }
})

DiscordInformation.belongsTo(StaffFile)
export default DiscordInformation