import { QueryTypes } from "sequelize"
import { dbSql } from ".."
import queryBuilder from "../utils/queryBuilder"

export default class DepartmentQueryRoutes {
    async getDepartment(filter: {
        id?: number,
        SupervisorId?: number,
        name?: string
    }): Promise<object> {
        let idquery: string | null
        let supervisorquery: string | null
        let namequery: string | null
        let filters: string[] = []
        if (filter.id) {
            idquery = `id = ${filter.id}`
            filters.push(idquery)
        } else idquery = null
        if (filter.SupervisorId) {
            supervisorquery = `SupervisorId = ${filter.SupervisorId}`
            filters.push(supervisorquery)
        } else supervisorquery = null
        if (filter.name) {
            namequery = `name = '${filter.name}'`
            filters.push(namequery)
        } else namequery = null
        const querystr = queryBuilder('SELECT * FROM departments', filters, 1)
        return dbSql.query(querystr, { type: QueryTypes.SELECT })
    }
}