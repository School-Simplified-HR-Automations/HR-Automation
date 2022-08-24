import { dbSql } from "..";
import { DataTypes } from "sequelize"
import DiscordInformation from "./DiscordInformation";
import PositionHistory from "./PositionHistory";
import Team from "./Team";
import Department from "./Department";

const StaffFile = dbSql.define('StaffFile', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    personalEmail: {
        type: DataTypes.STRING,
        validate: {
            is: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        },
        allowNull: true
    },
    companyEmail: {
        type: DataTypes.STRING,
        validate: {
            is: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        },
        allowNull: true
    }
})


StaffFile.hasOne(DiscordInformation)
StaffFile.hasMany(PositionHistory)
StaffFile.belongsTo(Department)
StaffFile.belongsTo(Team)
export default StaffFile