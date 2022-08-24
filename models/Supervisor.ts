import { dbSql } from "..";
import { DataTypes } from "sequelize"
import StaffFile from "./StaffFile";
import Department from "./Department";

const Supervisor = dbSql.define("Supervisor", {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

Supervisor.hasOne(StaffFile)
Supervisor.belongsTo(Department)

export default Supervisor