import { QueryTypes } from "sequelize"
import { dbSql } from ".."
import { PositionInfo, Team, TeamTableRecord } from "../types/common/ReturnTypes"
import queryBuilder from "../utils/queryBuilder"
import sanitizer from "../utils/sanitizer"
import Query from "./query"

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

    async getDepartmentTeams(id: number) {
        return (await dbSql.query(`SELECT * FROM teams WHERE DepartmentId=${id}`, { type: QueryTypes.SELECT}) as Team[])
    }

    async getTeamMembership(id: number) {
        sanitizer("number", `${id}`)
        let res = (await dbSql.query(`SELECT TeamId FROM positioninfos WHERE StaffFileId = ${id}`, { type: QueryTypes.SELECT }) as TeamTableRecord[])
        let ret: string[] = [];
        for (let i = 0; i < res.length; i++) {
            let pos = await this.getTeam({ id: res[i].TeamId })
            ret.push(pos.name)
        }

        return ret
    }
    async getTeamStaffMembers (filter: { teamId?: number, teamName?: string }) {
        console.log(filter)
        if (filter.teamId) {
            let res = (await dbSql.query(`SELECT * FROM positioninfos WHERE TeamId=${filter.teamId} ORDER BY PositionId ASC`, { type: QueryTypes.SELECT }) as PositionInfo[])
            const retStaffTeams = res.map(staff => staff.TeamId)
            let teams = [...new Set(retStaffTeams)]
            let ret = []
            for (let i = 0; i < teams.length; i++) {
                let filterRes = res.filter(function(staff) {
                    return staff.TeamId == teams[i]
                })
                ret.push(...filterRes)
            }
            return {
                array: ret,
                teams: teams
            }
        } else {
            let team = (await Query.teams.getTeam({ name: filter.teamName })).id
            let res = (await dbSql.query(`SELECT * FROM positioninfos WHERE TeamId=${team} ORDER BY PositionId ASC`, { type: QueryTypes.SELECT }) as PositionInfo[])
            const retStaffTeams = res.map(staff => staff.TeamId)
            let teams = [...new Set(retStaffTeams)]
            let ret = []
            for (let i = 0; i < teams.length; i++) {
                let filterRes = res.filter(function(staff) {
                    return staff.TeamId == teams[i]
                })
                ret.push(...filterRes)
            }
            return {
                array: ret,
                teams: teams
            }
        }
    }
}