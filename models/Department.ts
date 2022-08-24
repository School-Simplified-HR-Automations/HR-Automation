import { dbSql } from "..";
import { DataTypes } from "sequelize"
import Position from "./Position";
import PositionHistory from "./PositionHistory";
import Supervisor from "./Supervisor";
import StaffFile from "./StaffFile";

const Department = dbSql.define('Department', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})
Department.hasMany(Supervisor)
Department.hasMany(StaffFile)
export default Department
