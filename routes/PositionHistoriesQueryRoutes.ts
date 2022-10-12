import { QueryTypes } from "sequelize";
import { dbSql } from "..";
import { Position, PositionHistory } from "../types/common/ReturnTypes";
import sanitizer from "../utils/sanitizer";
import Query from "./query";
import schedule from "node-schedule"

export default class PositionHistoriesQueryRoutes {

    async getHistoryById(id: number) {
        sanitizer("number", `${id}`)
        const ret = (await dbSql.query(`SELECT * FROM positionhistories WHERE StaffFileId = ${id}`, { type: QueryTypes.SELECT }) as PositionHistory[])
        return ret;
    }

    async getHistoryByRecordId(id: number) {
        sanitizer("number", `${id}`)
        const ret = (await dbSql.query(`SELECT * FROM positionhistories WHERE id = ${id}`, { type: QueryTypes.SELECT }) as PositionHistory[])[0]
        return ret
    }

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
            const newrowid = dbSql.query(`SELECT id FROM positioninfos WHERE StaffFileId = ${id} ORDER BY id DESC LIMIT 1`)
            await dbSql.query(`UPDATE positionhistories
            SET positioninfoId = ${newrowid}
            WHERE (StaffFileId = ${id} AND title = '${position.title}')`)
            return 0
        } else {
            schedule.scheduleJob(joinDate, async function () {
                await dbSql.query(`INSERT INTO positioninfos
            (StaffFileId, PositionId, TeamId, DepartmentId, createdAt, updatedAt)
            VALUES (${id}, ${position.id}, ${position.TeamId}, ${position.DepartmentId}, now(), now());`)
                const newrowid = dbSql.query(`SELECT id FROM positioninfos WHERE StaffFileId = ${id} ORDER BY id DESC LIMIT 1`)
                await dbSql.query(`UPDATE positionhistories
            SET positioninfoId = ${newrowid}
            WHERE (StaffFileId = ${id} AND title = '${position.title}')`)
            })
            return Math.round(joinDate.getTime() / 1000)
        }

    }

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
     * 
     * @param quitDate 
     * @param id 
     * @returns 
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