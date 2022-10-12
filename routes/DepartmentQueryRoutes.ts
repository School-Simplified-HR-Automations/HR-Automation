import { QueryTypes } from "sequelize"
import { dbSql } from ".."
import { Department, DepartmentTableRecord } from "../types/common/ReturnTypes"
import queryBuilder from "../utils/queryBuilder"
import sanitizer from "../utils/sanitizer"

export default class DepartmentQueryRoutes {
    async getDepartment(filter: {
        id?: number,
        SupervisorId?: number,
        name?: string
    }): Promise<Department> {
        let idquery: string | null
        let supervisorquery: string | null
        let namequery: string | null
        let filters: string[] = []
        if (filter.id) {
            sanitizer("number", `${filter.id}`)
            idquery = `id = ${filter.id}`
            filters.push(idquery)
        } else idquery = null
        if (filter.SupervisorId) {
            sanitizer("number", `${filter.SupervisorId}`)
            supervisorquery = `SupervisorId = ${filter.SupervisorId}`
            filters.push(supervisorquery)
        } else supervisorquery = null
        if (filter.name) {
            sanitizer("name", filter.name)
            namequery = `name = '${filter.name}'`
            filters.push(namequery)
        } else namequery = null
        const querystr = queryBuilder('SELECT * FROM departments', filters, 1)
        return (await dbSql.query(querystr, { type: QueryTypes.SELECT }))[0] as Department
    }

    async getDepartmentStaff(id: number) {
        sanitizer("number", `${id}`)
        let res = (await dbSql.query(`SELECT DepartmentId FROM positioninfos WHERE StaffFileId = ${id}`, { type: QueryTypes.SELECT }) as DepartmentTableRecord[])
        let ret: string[] = [];
        for (let i = 0; i < res.length; i++) {
            let pos = await this.getDepartment({ id: res[i].DepartmentId })
            ret.push(pos.name)
        }

        return ret
    }
}