import { NumberDataType, QueryTypes } from "sequelize";
import { dbSql } from "..";
import { Permit } from "../types/common/ReturnTypes";
import { v4 as uuid } from "uuid";

/**
 * Handles authorization headers in certain restricted actions.
 */
export default class AuthQueryRoutes {
    /**
     * Retrieves permit level of target authid entry given user calling the action.
     * @param id The ID of the target user.
     * @param user The ID of the searching user.
     * @returns Permit level of target user.
     */
    async getPermit(id: string, user: string): Promise<number> {
        let retperm = (await dbSql.query(`SELECT * FROM apiauths WHERE authid = ${id}`, { type: QueryTypes.SELECT }) as Permit[])[0] ?? 0
        console.log(retperm)
        console.log(user)
        if (user !== retperm.authid) throw new Error("Access Forbidden: Permit 10 required to view other users' permit details.")
        else return retperm.permit
    }

    /**
     * Retrieves authorization certificate of target authid entry given user calling the action.
     * @param id The ID of the target user.
     * @param user The ID of the searching user.
     * @returns Auth Cert of the target user.
     */
    async getAuthCert(id: string, user: string): Promise<Permit> {
        let retcert = (await dbSql.query(`SELECT * FROM apiauths WHERE authid = ${id}`, { type: QueryTypes.SELECT }) as Permit[])[0]
        if (retcert.authid !== user) throw new Error("Access Forbidden: Permit 10 required to view other users' permit details.")
        else return retcert
    }

    /**
     * Assigns a new authorization certificate for a user.
     * @param id The ID of the target user.
     * @param user The ID of the searching user.
     * @param permitlvl Desired permit level to assign.
     * @returns Void promise.
     */
    async assignAuthCert(id: string, user: string, permitlvl: number): Promise<void> {
        let userperm = await this.getPermit(user, user)
        if (userperm < 10) throw new Error("Access Forbidden: Permit 10 required to assign new auth certificates.")
        await dbSql.query(`INSERT INTO apiauths (authid, admin, backup, createdAt, updatedAt, permit) VALUES ('${id}', '${user}', '${uuid()}', now(), now(), ${permitlvl})`, { type: QueryTypes.INSERT })
        return
    }
}