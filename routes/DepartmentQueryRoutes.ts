import { QueryTypes } from "sequelize"
import { dbSql } from ".."
import { Department, DepartmentTableRecord, PositionInfo, StaffFile } from "../types/common/ReturnTypes"
import queryBuilder from "../utils/queryBuilder"
import sanitizer from "../utils/sanitizer"
import Query from "./query"

/**
 * Routing class for handling department related queries. API calls will be available at addr/dept/(query)
 */
export default class DepartmentQueryRoutes {
    /**
     * Gets a department by any combination of provided filters.
     * @param filter Object containing potential arguments for narrowing search.
     * @returns Department Promise
     */
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
        const querystr = queryBuilder('SELECT * FROM departments', filters, 1) // Builds query from provided filters.
        return (await dbSql.query(querystr, { type: QueryTypes.SELECT }))[0] as Department // Assumes limit 1.
    }

    /**
     * Utility route for obtaining a staff member's membership in departments.
     * @param id StaffFile ID
     * @returns string[] of department names.
     */
    async getDepartmentMembership (id: number) {
        sanitizer("number", `${id}`)
        let res = (await dbSql.query(`SELECT DepartmentId FROM positioninfos WHERE StaffFileId = ${id}`, { type: QueryTypes.SELECT }) as DepartmentTableRecord[])
        let ret: string[] = [];
        for (let i = 0; i < res.length; i++) {
            let pos = await this.getDepartment({ id: res[i].DepartmentId })
            ret.push(pos.name)
        }

        return ret
    }

    /**
     * Utility route for obtaining staff members from a certain department, and further sorting them into an ordered array for lists.
     * @param filter Object containing potential means of searching for a department.
     * @returns Object containing an array of all members, and an array of the teams bound to said members.
     */
    async getDepartmentStaffMembers (filter: { deptId?: number, deptName?: string }) {
        if (filter.deptId) {
            let dept = filter.deptId
            let res = (await dbSql.query(`SELECT * FROM positioninfos WHERE (DepartmentId=${dept} OR PositionId=${dept}11) ORDER BY PositionId ASC`, { type: QueryTypes.SELECT }) as PositionInfo[])
            const staffTeams = res.map(staff => {
                return staff.TeamId // Maps StaffFiles and reduces them down to an array of IDs
            })
            let teamIds = [...new Set<number>(staffTeams)] // Reduces teams down to a Set of unique team IDs
            if (filter.deptId !== 4) {
                teamIds = teamIds.filter(function(id) {
                    return !(id.toString().startsWith("4")) // Prevents Executive teams from being pushed
                })
            }
            let teams = []
            for (let i = 0; i < teamIds.length; i++) {
                const tm = await Query.teams.getTeam({ id: teamIds[i] })
                teams.push(tm)
            }
            let ret = []
            for (let i = 0; i < teams.length; i++) {
                let filterRes = res.filter(function(staff) {
                    return (staff.TeamId == teamIds[i] || staff.PositionId.toString() == `${dept}11`) // Filters for matching Team ID or if the target is the head of their department as given by PositionId
                })
                ret.push(...filterRes)
            }
            return {
                array: ret,
                teams: teams
            }
        } else {
            let dept = (await Query.departments.getDepartment({ name: filter.deptName })).id
            let res = (await dbSql.query(`SELECT * FROM positioninfos WHERE (DepartmentId=${dept} OR PositionId=${dept}11) ORDER BY PositionId ASC`, { type: QueryTypes.SELECT }) as PositionInfo[])
            const staffTeams = res.map(staff => {
                return staff.TeamId // Maps StaffFiles and reduces them down to an array of IDs
            })
            let teamIds = [...new Set<number>(staffTeams)] // Reduces teams down to a Set of unique team IDs
            if (filter.deptId !== 4) {
                teamIds = teamIds.filter(function(id) {
                    return !(id.toString().startsWith("4")) // Prevents Executive teams from being pushed
                })
            }
            let teams = []
            for (let i = 0; i < teamIds.length; i++) {
                const tm = await Query.teams.getTeam({ id: teamIds[i] })
                teams.push(tm)
            }
            let ret = []
            for (let i = 0; i < teams.length; i++) {
                let filterRes = res.filter(function(staff) {
                    return (staff.TeamId == teamIds[i] || staff.PositionId.toString() == `${dept}11`) // Filters for matching Team ID or if the target is the head of their department as given by PositionId
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