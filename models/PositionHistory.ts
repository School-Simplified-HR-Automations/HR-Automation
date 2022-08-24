import { dbSql } from "..";
import { DataTypes } from "sequelize"
import StaffFile from "./StaffFile";
import Position from "./Position";
import Department from "./Department";

const PositionHistory = dbSql.define("PositionHistory", {
    rank: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dept: {
        type: DataTypes.STRING,
        allowNull: false
    },
    team: {
        type: DataTypes.STRING,
        allowNull: true
    },
    joined: {
        type: DataTypes.DATE,
        allowNull: false
    },
    left: {
        type: DataTypes.DATE,
        allowNull: true
    }
})

PositionHistory.belongsTo(StaffFile)
PositionHistory.hasOne(Position)
PositionHistory.hasOne(Department)
export default PositionHistory