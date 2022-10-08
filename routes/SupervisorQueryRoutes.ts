import { QueryTypes } from "sequelize"
import { dbSql } from "..";
import { Supervisor } from "../types/common/ReturnTypes";

export default class SupervisorQueryRoutes {
    async getSupervisorById(id: number) {
        let ret: Supervisor[] = (await dbSql.query(`SELECT * FROM supervisors WHERE id = ${id}`, { type: QueryTypes.SELECT }))
        return ret[0]
    }
}