import { QueryTypes } from "sequelize"
import { dbSql } from ".."
import queryBuilder from "../utils/queryBuilder"

export default class PositionQueryRoutes {
    async getPosition(filter: {
        id?: number,
        title?: string
    }): Promise<object> {
        let idquery: string | null
        let titlequery: string | null
        let filters: string[] = []
        if (filter.id) {
            idquery = `id = ${filter.id}`
            filters.push(idquery)
        } else idquery = null
        if (filter.title) {
            titlequery = `title = '${filter.title}'`
            filters.push(titlequery)
        } else titlequery = null
        const querystr = queryBuilder('SELECT * FROM positions', filters, 1)
        return dbSql.query(querystr, { type: QueryTypes.SELECT })
    }
}