import { QueryTypes } from "sequelize"
import { dbSql } from "..";
import { Supervisor } from "../types/common/ReturnTypes";
import sanitizer from "../utils/sanitizer";

export default class SupervisorQueryRoutes {
    async getSupervisorById(id: number) {
        sanitizer("number", `${id}`)
        let ret: Supervisor[] = (await dbSql.query(`SELECT * FROM supervisors WHERE id = ${id}`, { type: QueryTypes.SELECT }))
        return ret
    }

    async getAssignmentsByStaffId(id: number) {
        sanitizer("number", `${id}`)
        let ret: Supervisor[] = (await dbSql.query(`SELECT * FROM supervisors WHERE StaffFileId = ${id}`, { type: QueryTypes.SELECT }))
        return ret;
    }
}