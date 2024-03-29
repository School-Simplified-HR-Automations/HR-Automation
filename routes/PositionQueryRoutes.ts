import { QueryTypes } from "sequelize"
import { dbSql } from ".."
import { Position, PositionTableRecord } from "../types/common/ReturnTypes"
import queryBuilder from "../utils/queryBuilder"
import sanitizer from "../utils/sanitizer"
import Query from "./query"

export default class PositionQueryRoutes {
    async getPosition(filter: {
        id?: number,
        title?: string
    }): Promise<Position> {
        let idquery: string | null
        let titlequery: string | null
        let filters: string[] = []
        if (filter.id) {
            sanitizer("number", `${filter.id}`)
            idquery = `id = ${filter.id}`
            filters.push(idquery)
        } else idquery = null
        if (filter.title) {
            sanitizer("name", filter.title)
            titlequery = `title = '${filter.title}'`
            filters.push(titlequery)
        } else titlequery = null
        const querystr = queryBuilder('SELECT * FROM positions', filters, 1)
        let ret = (await dbSql.query(querystr, { type: QueryTypes.SELECT }))[0] as Position
        if (!ret) throw new Error("postNewHistory: Position does not exist.")
        let retPos = new class implements Position {
            id: number = ret.id
            title: string = ret.title
            createdAt: any = ret.createdAt
            updatedAt: any = ret.updatedAt
            DepartmentId: number = ret.DepartmentId
            TeamId: number = ret.TeamId

        }
        return retPos
    }

    async getPositionStaff(id: number) {
        sanitizer("number", `${id}`)
        let res = (await dbSql.query(`SELECT PositionId FROM positioninfos WHERE StaffFileId = ${id}`, { type: QueryTypes.SELECT }) as PositionTableRecord[])
        let ret: string[] = [];
        for (let i = 0; i < res.length; i++) {
            let pos = await this.getPosition({ id: res[i].PositionId })
            ret.push(pos.title)
        }

        return ret
    }

    async updatePositionTitle(id: number, title: string) {
        sanitizer("number", `${id}`)
        sanitizer("name", title)
        const positionTitle = (await Query.positionHistory.getHistoryByRecordId(id)).title
        await dbSql.query(`UPDATE positions
        SET title = '${title}'
        WHERE title = '${positionTitle}';
        UPDATE positionhistories
        SET title = '${title}'
        WHERE title = '${positionTitle}'`)
    }
}