import { dbSql } from "..";
import { DataTypes } from "sequelize"
import Department from "./Department";
import Supervisor from "./Supervisor";
import StaffFile from "./StaffFile";

const Team = dbSql.define('Team', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})

Team.belongsTo(Department)
Team.hasMany(Supervisor)
Team.hasMany(StaffFile)

export default Team