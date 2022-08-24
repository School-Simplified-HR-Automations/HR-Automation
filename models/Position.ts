import { dbSql } from "..";
import { DataTypes } from "sequelize"
import PositionHistory from "./PositionHistory";

const Position = dbSql.define('Position', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

Position.belongsTo(PositionHistory)
export default Position