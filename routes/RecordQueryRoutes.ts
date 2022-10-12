import { QueryTypes } from "sequelize";
import { dbSql } from "..";
import { Record } from "../types/common/ReturnTypes";
import sanitizer from "../utils/sanitizer";

export default class RecordQueryRoutes {

    async postBreakRecord(target: string, admin: string, dateStart: number, dateEnd: number, reason?: string) {
        sanitizer("number", target, admin)
        sanitizer("timestamp", `${dateStart}`, `${dateEnd}`)
        if (reason) {
            sanitizer("name", reason)
            await dbSql.query(`SET @staffid = ${target.slice(target.length - 6)};
        INSERT INTO records (StaffFileAdm, date, dateExp, reason, createdAt, updatedAt, StaffFileId, recordType)
        VALUES (${admin.length > 6 ? parseInt(admin.slice(admin.length - 6)) : parseInt(admin)}, ${dateStart}, ${dateEnd}, '${reason}', now(), now(), @staffid, 0);
        UPDATE stafffiles
        SET outOfOffice = 1
        WHERE id = @staffid;`)
        } else {
            await dbSql.query(`SET @staffid = ${target.slice(target.length - 6)};
        INSERT INTO records (StaffFileAdm, date, dateExp, createdAt, updatedAt, StaffFileId, recordType)
        VALUES (${admin.length > 6 ? parseInt(admin.slice(admin.length - 6)) : parseInt(admin)}, ${dateStart}, ${dateEnd}, now(), now(), @staffid, 0);
        UPDATE stafffiles
        SET outOfOffice = 1
        WHERE id = @staffid;`)
        }
    }

    async getBreakRecords(target: string) {
        sanitizer("number", target)
        const record: Record[]  = (await dbSql.query(`SELECT * FROM records WHERE (StaffFileId = ${target.length > 6 ? parseInt(target.slice(target.length - 6)) : parseInt(target)} AND recordType = 0) ORDER BY id DESC`, { type: QueryTypes.SELECT }) as Record[])

        return record
    }

    async dropBreakRecord(target: string, expTime: number) {
        sanitizer("number", target)
        sanitizer("timestamp", `${expTime}`)
        await dbSql.query(`SET @staffid = ${target.length > 6 ? parseInt(target.slice(target.length - 6)) : parseInt(target)};
        DELETE FROM records WHERE (StaffFileId = @staffid AND recordType = 0 AND dateExp = ${expTime});
        UPDATE stafffiles
        SET outOfOffice = 0
        WHERE id = @staffid`)
    }

    async getRecords(target: string, type: 1 | 2) {
        sanitizer("number", target)
        const record: Record[]  = (await dbSql.query(`SELECT * FROM records WHERE (StaffFileId = ${target.length > 6 ? parseInt(target.slice(target.length - 6)) : parseInt(target)} AND recordType = ${type}) ORDER BY id DESC`, { type: QueryTypes.SELECT }) as Record[])

        return record
    }
}