import { QueryTypes } from "sequelize"
import { dbSql } from ".."
import { Team, TeamTableRecord } from "../types/common/ReturnTypes"
import queryBuilder from "../utils/queryBuilder"
import sanitizer from "../utils/sanitizer"

export default class TeamQueryRoutes {
    async getTeam(filter: {
        id?: number,
        name?: string,
        SupervisorId?: number,
        DepartmentId?: number
    }): Promise<Team> {
        let idquery: string | null
        let namequery: string | null
        let supervisorquery: string | null
        let departmentquery: string | null
        let filters: string[] = []
        if (filter.id) {
            sanitizer("number", `${filter.id}`)
            idquery = `id = ${filter.id}`
            filters.push (idquery)
        } else idquery = null
        if (filter.name) {
            sanitizer("name", filter.name)
            namequery = `name = '${filter.name}'`
            filters.push (namequery)
        } else namequery = null
        if (filter.SupervisorId) {
            sanitizer("number", `${filter.SupervisorId}`)
            supervisorquery = `SupervisorId = ${filter.SupervisorId}`
            filters.push (supervisorquery)
        } else supervisorquery = null
        if (filter.DepartmentId) {
            sanitizer("number", `${filter.DepartmentId}`)
            departmentquery = `DepartmentId = ${filter.DepartmentId}`
            filters.push (departmentquery)
        } else departmentquery = null
        const querystr = queryBuilder('SELECT * FROM teams', filters, 1)
        return (await dbSql.query(querystr, { type: QueryTypes.SELECT }))[0] as Team
    }

    async getTeamStaff(id: number) {
        sanitizer("number", `${id}`)
        let res = (await dbSql.query(`SELECT TeamId FROM positioninfos WHERE StaffFileId = ${id}`, { type: QueryTypes.SELECT }) as TeamTableRecord[])
        let ret: string[] = [];
        for (let i = 0; i < res.length; i++) {
            let pos = await this.getTeam({ id: res[i].TeamId })
            ret.push(pos.name)
        }

        return ret
    }
}