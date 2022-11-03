import sanitizer from "../utils/sanitizer";
import { Permit } from "../types/common/ReturnTypes"
import { dbSql } from "..";
import client from "..";
import { QueryTypes } from "sequelize";

/**
 * Internal routes that should not be exposed to the public API.
 */
export default class InternalQueryRoutes {
    /**
     * Updates source files from Github.
     * @param bearer Bearer token as provided in the DB.
     */
    async update(bearer: string) {
        sanitizer("bearer", bearer)
        const retperm: Permit = (await dbSql.query(`SELECT * FROM apiauths WHERE (authid = ${client.user?.id} AND backup = '${bearer}')`, { type: QueryTypes.SELECT }) as Permit[])[0]
        if (!retperm.authid) throw new Error("Security: Unauthorized action.")
        else client.textCommands.get("update").execute()
    }

}