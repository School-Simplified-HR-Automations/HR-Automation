import { QueryTypes } from "sequelize";
import { dbSql } from "..";
import { Position, PositionHistory } from "../types/common/ReturnTypes";
import sanitizer from "../utils/sanitizer";
import Query from "./query";
import schedule from "node-schedule"

/**
 * Routes pertaining to Position History management.
 */
export default class PositionHistoriesQueryRoutes {
    /**
     * Retrieves PositionHistory provided a StaffFile ID.
     * @param id StaffFile ID.
     * @returns PositionHistory[]
     */
    async getHistoryById(id: number) {
        sanitizer("number", `${id}`)
        const ret = (await dbSql.query(`SELECT * FROM positionhistories WHERE StaffFileId = ${id}`, { type: QueryTypes.SELECT }) as PositionHistory[])
        return ret;
    }
    /**
     * Retrieves PositionHistory by case ID.
     * @param id PositionHistory case ID.
     * @returns PositionHistory record.
     */
    async getHistoryByRecordId(id: number) {
        sanitizer("number", `${id}`)
        const ret = (await dbSql.query(`SELECT * FROM positionhistories WHERE id = ${id}`, { type: QueryTypes.SELECT }) as PositionHistory[])[0]
        return ret
    }
    /**
     * POST route for adding new PositionHistory records to the database. Also manipulates PositionInfos.
     * @param title The title of the new position being entered.
     * @param joinDate The date the staff member will join the position.
     * @param id The id of the staff member.
     * @returns Timestamp promise, or 0, for manipulation into messages.
     */
    async postNewHistory(title: string, joinDate: Date, id: number) {
        sanitizer("name", title)
        sanitizer("timestamp", `${Math.round(joinDate.getTime() / 1000)}`)
        sanitizer("number", `${id}`)
        const position = await Query.positions.getPosition({ title: title })
        await dbSql.query(`INSERT INTO positionhistories
        (title, dept, team, joined, quit, createdAt, updatedAt, StaffFileId, positioninfoId)
        VALUES ('${position.title}', '${(await Query.departments.getDepartment({ id: position.DepartmentId })).name}', '${(await Query.teams.getTeam({ id: position.TeamId })).name}', '${Math.round(joinDate.getTime() / 1000)}', null, now(), now(), ${id}, @newrowid);`)
        const todayObj = new Date()
        if ((joinDate.getFullYear() == todayObj.getFullYear() && joinDate.getMonth() == todayObj.getMonth() && joinDate.getDate() == todayObj.getDate()) || joinDate.getTime() < todayObj.getTime()) {
            await dbSql.query(`INSERT INTO positioninfos
            (StaffFileId, PositionId, TeamId, DepartmentId, createdAt, updatedAt)
            VALUES (${id}, ${position.id}, ${position.TeamId}, ${position.DepartmentId}, now(), now());`)
            const newrowid = (await dbSql.query(`SELECT * FROM positioninfos WHERE StaffFileId = ${id} ORDER BY id DESC LIMIT 1`, { type: QueryTypes.SELECT }) as PositionHistory[])[0].id
            await dbSql.query(`UPDATE positionhistories
            SET positioninfoId = ${newrowid}
            WHERE (StaffFileId = ${id} AND title = '${position.title}')`)
            const supervisor = await Query.supervisors.getSupervisorById(position.id)
            if (supervisor.length > 0) {
                await dbSql.query(`UPDATE supervisors
                SET StaffFileId = ${id}
                WHERE id = ${position.id}`)
            }
            return 0
        } else {
            schedule.scheduleJob(joinDate, async function () {
                await dbSql.query(`INSERT INTO positioninfos
            (StaffFileId, PositionId, TeamId, DepartmentId, createdAt, updatedAt)
            VALUES (${id}, ${position.id}, ${position.TeamId}, ${position.DepartmentId}, now(), now());`)
            const newrowid = (await dbSql.query(`SELECT * FROM positioninfos WHERE StaffFileId = ${id} ORDER BY id DESC LIMIT 1`, { type: QueryTypes.SELECT }) as PositionHistory[])[0].id
                await dbSql.query(`UPDATE positionhistories
            SET positioninfoId = ${newrowid}
            WHERE (StaffFileId = ${id} AND title = '${position.title}')`)
                const supervisor = await Query.supervisors.getSupervisorById(position.id)
                if (supervisor.length > 0) {
                    await dbSql.query(`UPDATE supervisors
                SET StaffFileId = ${id}
                WHERE id = ${position.id}`)
                }
            })
            return Math.round(joinDate.getTime() / 1000)
        }

    }
    /**
     * Updates the join or quit date of a PositionHistory record.
     * @param type Join or Quit date update.
     * @param date Date as a timestamp.
     * @param id ID of the PositionHistory record.
     */
    async updateDate(type: "Join" | "Quit", date: number, id: number) {
        sanitizer("timestamp", `${date}`)
        sanitizer("number", `${id}`)
        if (type == "Join") {
            await dbSql.query(`UPDATE positionhistories
            SET joined = '${date}', updatedAt = now()
            WHERE id = ${id}`)
        } else {
            await dbSql.query(`UPDATE positionhistories
            SET quit = '${date}', updatedAt = now()
            WHERE id = ${id}`)
        }
    }
    /**
     * Moves a staff member between positions.
     * @param title Title of the new position.
     * @param joinDate Join date of the new position.
     * @param quitDate Quit date of the old position.
     * @param id ID of the history record.
     * @param terms Terms the member is leaving on. True is good, false is bad.
     * @param reason Optional reason provided to the terms for leaving.
     * @returns Timestamp promise, or 0, for manipulation into messages.
     */
    async movePosition(title: string, joinDate: Date, quitDate: Date, id: number, terms: boolean, reason?: string) {
        sanitizer("name", title)
        sanitizer("number", `${id}`)
        if (reason) sanitizer("name", reason)
        const termsInt = (terms ? 1 : 0)
        const position = await Query.positions.getPosition({ title: title })
        const dept = await Query.departments.getDepartment({ id: position.DepartmentId })
        const team = await Query.teams.getTeam({ id: position.TeamId })
        const staffFileId = (await dbSql.query(`SELECT * FROM positionhistories WHERE id = ${id}`, { type: QueryTypes.SELECT }) as PositionHistory[])[0].StaffFileId
        const oldposId = (await dbSql.query(`SELECT * FROM positions WHERE title = (SELECT title FROM positionhistories WHERE id = ${id})`, { type: QueryTypes.SELECT }) as Position[])[0].id
        if (reason) {
            await dbSql.query(`UPDATE positionhistories
        SET quit = '${Math.round(quitDate.getTime() / 1000)}', updatedAt = now(), terms = ${termsInt}, reason = '${reason}'
        WHERE id = ${id};
        INSERT INTO positioninfos
        (StaffFileId, PositionId, TeamId, DepartmentId, createdAt, updatedAt)
        VALUES (${staffFileId}, ${position.id}, ${position.TeamId}, ${position.DepartmentId}, now(), now());
        SET @pid = (SELECT id FROM positioninfos WHERE (StaffFileId = ${staffFileId} AND PositionId = ${position.id})); 
        INSERT INTO positionhistories
        (title, dept, team, joined, quit, createdAt, updatedAt, StaffFileId, positioninfoId)
        VALUES ('${title}', '${dept.name}', '${team.name}', '${Math.round(joinDate.getTime() / 1000)}', null, now(), now(), ${staffFileId}, @pid);`)
            let todayObj = new Date()
            let quitDateObj;

            quitDateObj = quitDate
            if ((quitDateObj.getFullYear() == todayObj.getFullYear() && quitDateObj.getMonth() == todayObj.getMonth() && quitDateObj.getDate() == todayObj.getDate()) || quitDateObj.getTime() < todayObj.getTime()) {
                await dbSql.query(`DELETE FROM positioninfos WHERE (StaffFileId = ${staffFileId} AND PositionId = ${oldposId})`)
                return 0
            } else {
                schedule.scheduleJob(quitDateObj, async function () {
                    await dbSql.query(`DELETE FROM positioninfos WHERE (StaffFileId = ${staffFileId} AND PositionId = ${oldposId})`)
                })
                return Math.round(quitDateObj.getTime() / 1000)
            }
        } else {
            await dbSql.query(`UPDATE positionhistories
        SET quit = '${Math.round(quitDate.getTime() / 1000)}', updatedAt = now(), terms = ${termsInt}
        WHERE id = ${id};
        INSERT INTO positioninfos
        (StaffFileId, PositionId, TeamId, DepartmentId, createdAt, updatedAt)
        VALUES (${staffFileId}, ${position.id}, ${position.TeamId}, ${position.DepartmentId}, now(), now());
        SET @pid = (SELECT id FROM positioninfos WHERE (StaffFileId = ${staffFileId} AND PositionId = ${position.id})); 
        INSERT INTO positionhistories
        (title, dept, team, joined, quit, createdAt, updatedAt, StaffFileId, positioninfoId)
        VALUES ('${title}', '${dept.name}', '${team.name}', '${Math.round(joinDate.getTime() / 1000)}', null, now(), now(), ${staffFileId}, @pid);`)
            let todayObj = new Date()
            let quitDateObj;

            quitDateObj = quitDate

            if ((quitDateObj.getFullYear() == todayObj.getFullYear() && quitDateObj.getMonth() == todayObj.getMonth() && quitDateObj.getDate() == todayObj.getDate()) || quitDateObj.getTime() < todayObj.getTime()) {
                await dbSql.query(`DELETE FROM positioninfos WHERE (StaffFileId = ${staffFileId} AND PositionId = ${oldposId})`)
                return 0
            } else {
                schedule.scheduleJob(quitDateObj, async function () {
                    await dbSql.query(`DELETE FROM positioninfos WHERE (StaffFileId = ${staffFileId} AND PositionId = ${oldposId})`)
                })
                return Math.round(quitDateObj.getTime() / 1000)
            }
        }
    }
    /**
     * Removes a staff member from their position.
     * @param quitDate Date the staff member is to be removed from their position.
     * @param id The ID of the record.
     * @returns Timestamp promise, or 0, for manipulation into messages.
     */

    async removePosition(quitDate: Date, id: number, terms: boolean, reason?: string) {
        sanitizer("timestamp", `${Math.round(quitDate.getTime() / 1000)}`)
        sanitizer("number", `${id}`)
        if (reason) sanitizer("name", reason)
        const termsInt = (terms ? 1 : 0)
        const todayObj = new Date()
        let quitDateObj;

        quitDateObj = quitDate
        if (reason) {
            if ((quitDateObj.getFullYear() == todayObj.getFullYear() && quitDateObj.getMonth() == todayObj.getMonth() && quitDateObj.getDate() == todayObj.getDate()) || quitDateObj.getTime() < todayObj.getTime()) {
                await dbSql.query(`UPDATE positionhistories
                SET quit = '${quitDate}', terms = ${termsInt}
                WHERE id = ${id};
                SET @sfid = (SELECT StaffFileId FROM positionhistories WHERE id = ${id});
                SET @pid = (SELECT id FROM positions WHERE title = (SELECT title FROM positionhistories WHERE id = ${id}));
                DELETE FROM positioninfos
                WHERE (StaffFileId = @sfid AND PositionId = @pid)`)
                return 0
            } else {
                schedule.scheduleJob(quitDateObj, async function () {
                    await dbSql.query(`UPDATE positionhistories
                SET quit = '${quitDate}', terms = ${termsInt}
                WHERE id = ${id};
                SET @sfid = (SELECT StaffFileId FROM positionhistories WHERE id = ${id});
                SET @pid = (SELECT id FROM positions WHERE title = (SELECT title FROM positionhistories WHERE id = ${id}));
                DELETE FROM positioninfos
                WHERE (StaffFileId = @sfid AND PositionId = @pid)`)
                })
                return Math.round(quitDateObj.getTime() / 1000)
            }
        } else {
            if ((quitDateObj.getFullYear() == todayObj.getFullYear() && quitDateObj.getMonth() == todayObj.getMonth() && quitDateObj.getDate() == todayObj.getDate()) || quitDateObj.getTime() < todayObj.getTime()) {
                await dbSql.query(`UPDATE positionhistories
                SET quit = '${quitDate}'
                WHERE id = ${id};
                SET @sfid = (SELECT StaffFileId FROM positionhistories WHERE id = ${id});
                SET @pid = (SELECT id FROM positions WHERE title = (SELECT title FROM positionhistories WHERE id = ${id}));
                DELETE FROM positioninfos
                WHERE (StaffFileId = @sfid AND PositionId = @pid)`)
                return 0
            } else {
                schedule.scheduleJob(quitDateObj, async function () {
                    await dbSql.query(`UPDATE positionhistories
                SET quit = '${quitDate}'
                WHERE id = ${id};
                SET @sfid = (SELECT StaffFileId FROM positionhistories WHERE id = ${id});
                SET @pid = (SELECT id FROM positions WHERE title = (SELECT title FROM positionhistories WHERE id = ${id}));
                DELETE FROM positioninfos
                WHERE (StaffFileId = @sfid AND PositionId = @pid)`)
                })
                return Math.round(quitDateObj.getTime() / 1000)
            }
        }
    }
}