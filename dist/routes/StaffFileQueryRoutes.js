"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const __1 = require("..");
/**
 * Provides easy accessible query routes for the "stafffiles" table of the database.
 */
class StaffFileQueryRoutes {
    /**
     * Queries for a staff member by full name and returns their StaffFile.
     * @param firstName The logged first name of the user.
     * @param lastName The logged last name of the user.
     * @returns Staff File Object
     */
    getStaffByFullName(firstName, lastName) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield __1.dbSql.query(`SELECT * FROM stafffiles WHERE name = '${firstName} ${lastName}'`, { type: sequelize_1.QueryTypes.SELECT }))[0];
        });
    }
    /**
     * Queries for a staff member(s) by only their first name. Returns an array of StaffFiles which can be handled, iterated, etc.
     * @param name The logged name to query. Must be first name.
     * @returns Array of Staff File Objects
     */
    getStaffByFirstName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return __1.dbSql.query(`SELECT * FROM stafffiles WHERE name LIKE '${name}%'`, {
                type: sequelize_1.QueryTypes.SELECT,
            });
        });
    }
    /**
     * Queries for a staff member(s) by only their last name. Returns an array of StaffFiles which can be handled, iterated, etc.
     * @param name The logged name to query. Must be last name.
     * @returns Array of Staff File Objects
     */
    getStaffByLastName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return __1.dbSql.query(`SELECT * FROM stafffiles WHERE name LIKE '%${name}'`, {
                type: sequelize_1.QueryTypes.SELECT,
            });
        });
    }
    /**
     * Queries for a staff member by their unique Primary Key. Returns a Staff File Object.
     * @param id Unique Primary Key.
     * @returns Staff File Object
     */
    getStaffById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield __1.dbSql.query(`SELECT * FROM stafffiles WHERE id = ${id}`, {
                type: sequelize_1.QueryTypes.SELECT,
            }))[0];
        });
    }
    /**
     * Queries for a staff member by their personal or company email. Returns an array of StaffFiles which can be handled, iterated, etc.
     * @param email The address to match to the system.
     * @param type The type of the email, either "Personal" or "Company" (@schoolsimplified.org).
     * @returns Array of Staff File Objects
     */
    getStaffByEmail(email, type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/))
                throw new Error("getStaffByEmail - email parameter must be an email address.");
            if (type == "Personal") {
                return __1.dbSql.query(`SELECT * FROM stafffiles WHERE personalEmail = '${email}'`, { type: sequelize_1.QueryTypes.SELECT });
            }
            else
                return __1.dbSql.query(`SELECT * FROM stafffiles WHERE companyEmail = '${email}'`, { type: sequelize_1.QueryTypes.SELECT });
        });
    }
    /**
     * Queries for a staff team via an intermediate Staff File. Returns the Team file.
     * @param staff The Staff File to use.
     * @returns Team Object.
     */
    getTeamByStaffTeam(staff) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield __1.dbSql.query(`SELECT * FROM teams WHERE id = (SELECT TeamId FROM stafffiles WHERE id = ${staff.id})`, { type: sequelize_1.QueryTypes.SELECT }))[0]; // TODO
        });
    }
    /**
     * Queries for a staff department via an intermediate Staff File. Returns the Department file.
     * @param staff The Staff File to use.
     * @returns Department Object.
     */
    getDepartmentByStaffDepartment(staff) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield __1.dbSql.query(`SELECT * FROM departments WHERE id = (SELECT DepartmentId FROM stafffiles WHERE id = ${staff.id})`, { type: sequelize_1.QueryTypes.SELECT }))[0];
        });
    }
    /**
     * Queries for a staff position via an intermediate Staff File. Returns the Position file.
     * @param staff The Staff File to use.
     * @returns Position Object.
     */
    getPositionByStaffPosition(staff) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield __1.dbSql.query(`SELECT * FROM positions WHERE id = (SELECT PositionId FROM stafffiles WHERE id = ${staff.id})`, { type: sequelize_1.QueryTypes.SELECT }))[0];
        });
    }
    createStaffFile(fullName, activityStatus, departmentName, positionName, email, teamName, appStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            if (appStatus) {
                if (teamName) {
                    __1.dbSql.query(`SET @departmentid = (SELECT id FROM departments WHERE name = '${departmentName}');
                SET @positionid = (SELECT id FROM positions WHERE title = '${positionName}');
                SET @teamid = (SELECT id FROM teams WHERE name = '${teamName}');
                INSERT INTO stafffiles (
                    name, personalEmail, companyEmail, photoLink, phone, legalSex, genderIdentity, ethnicity, appStatus, strikes, censures, pips, activityStatus, alumni, createdAt, updatedAt, TeamId, DepartmentId, PositionId
                )
                VALUES (
                    '${fullName}', null, '${email}', null, null, null, null, null, '${appStatus}', 0, 0, 0, '${activityStatus}', false, now(), now(), @teamid, @departmentid, @positionid
                );
                SET @staffid = (SELECT id FROM stafffiles WHERE name = '${fullName}');
                INSERT INTO positionhistories (
                    title, dept, team, joined, quit, createdAt, updatedAt, StaffFileId, PositionId, DepartmentId
                )
                VALUES (
                    '${positionName}', '${departmentName}', '${teamName}', now(), null, now(), now(), @staffid, @positionid, @departmentid
                );
                INSERT INTO positionstaff (
                    createdAt, updatedAt, StaffFileId, PositionId
                )
                VALUES (
                    now(), now(), @staffid, @positionid
                )`);
                    return;
                }
                else {
                    __1.dbSql.query(`SET @departmentid = (SELECT id FROM departments WHERE name = '${departmentName}');
                SET @positionid = (SELECT id FROM positions WHERE title = '${positionName}');
                INSERT INTO stafffiles (
                    name, personalEmail, companyEmail, photoLink, phone, legalSex, genderIdentity, ethnicity, appStatus, strikes, censures, pips, activityStatus, alumni, createdAt, updatedAt, DepartmentId, PositionId
                )
                VALUES (
                    '${fullName}', null, '${email}', null, null, null, null, null, '${appStatus}', 0, 0, 0, '${activityStatus}', false, now(), now(), @departmentid, @positionid
                );
                SET @staffid = (SELECT id FROM stafffiles WHERE name = '${fullName}');
                INSERT INTO positionhistories (
                    title, dept, joined, quit, createdAt, updatedAt, StaffFileId, PositionId, DepartmentId
                )
                VALUES (
                    '${positionName}', '${departmentName}', now(), null, now(), now(), @staffid, @positionid, @departmentid
                );
                INSERT INTO positionstaff (
                    createdAt, updatedAt, StaffFileId, PositionId
                )
                VALUES (
                    now(), now(), @staffid, @positionid
                )`);
                    return;
                }
            }
            else {
                if (teamName) {
                    __1.dbSql.query(`SET @departmentid = (SELECT id FROM departments WHERE name = '${departmentName}');
                SET @positionid = (SELECT id FROM positions WHERE title = '${positionName}');
                SET @teamid = (SELECT id FROM teams WHERE name = '${teamName}');
                INSERT INTO stafffiles (
                    name, personalEmail, companyEmail, photoLink, phone, legalSex, genderIdentity, ethnicity, strikes, censures, pips, activityStatus, alumni, createdAt, updatedAt, TeamId, DepartmentId, PositionId
                )
                VALUES (
                    '${fullName}', null, '${email}', null, null, null, null, null, 0, 0, 0, '${activityStatus}', false, now(), now(), @teamid, @departmentid, @positionid
                );
                SET @staffid = (SELECT id FROM stafffiles WHERE name = '${fullName}');
                INSERT INTO positionhistories (
                    title, dept, team, joined, quit, createdAt, updatedAt, StaffFileId, PositionId, DepartmentId
                )
                VALUES (
                    '${positionName}', '${departmentName}', '${teamName}', now(), null, now(), now(), @staffid, @positionid, @departmentid
                );
                INSERT INTO positionstaff (
                    createdAt, updatedAt, StaffFileId, PositionId
                )
                VALUES (
                    now(), now(), @staffid, @positionid
                )`);
                    return;
                }
                else {
                    __1.dbSql.query(`SET @departmentid = (SELECT id FROM departments WHERE name = '${departmentName}');
                SET @positionid = (SELECT id FROM positions WHERE title = '${positionName}');
                INSERT INTO stafffiles (
                    name, personalEmail, companyEmail, photoLink, phone, legalSex, genderIdentity, ethnicity, strikes, censures, pips, activityStatus, alumni, createdAt, updatedAt, DepartmentId, PositionId
                )
                VALUES (
                    '${fullName}', null, '${email}', null, null, null, null, null, 0, 0, 0, '${activityStatus}', false, now(), now(), @departmentid, @positionid
                );
                SET @staffid = (SELECT id FROM stafffiles WHERE name = '${fullName}');
                INSERT INTO positionhistories (
                    title, dept, joined, quit, createdAt, updatedAt, StaffFileId, PositionId, DepartmentId
                )
                VALUES (
                    '${positionName}', '${departmentName}', now(), null, now(), now(), @staffid, @positionid, @departmentid
                );
                INSERT INTO positionstaff (
                    createdAt, updatedAt, StaffFileId, PositionId
                )
                VALUES (
                    now(), now(), @staffid, @positionid
                )`);
                    return;
                }
            }
        });
    }
    assignSupervisor(fullName, title) {
        return __awaiter(this, void 0, void 0, function* () {
            __1.dbSql.query(`UPDATE supervisors
        SET StaffFileId = (SELECT id FROM stafffiles WHERE name = '${fullName}')
        WHERE title = '${title}'`);
            return;
        });
    }
    onLeave(discordId) {
        return __awaiter(this, void 0, void 0, function* () {
            onLeave: {
                let bool = (yield __1.dbSql.query(`SELECT outOfOffice FROM stafffiles WHERE id=(SELECT StaffFileId from discordinfos WHERE discordId='${discordId}')`, { type: sequelize_1.QueryTypes.SELECT }))[0];
                if (!bool) {
                    return null;
                }
                return bool.outOfOffice;
            }
        });
    }
    setLeave(discordId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            __1.dbSql.query(`UPDATE stafffiles
		SET outOfOffice = ${status == true ? 1 : 0}
		WHERE id = (SELECT StaffFileId FROM discordinfos WHERE discordId='${discordId}')`);
            return;
        });
    }
    getMessages(discordId) {
        return __awaiter(this, void 0, void 0, function* () {
            let records = yield __1.dbSql.query(`SELECT * FROM messages WHERE StaffFileId=(SELECT StaffFileId FROM discordinfos WHERE discordId=${discordId})`, { type: sequelize_1.QueryTypes.SELECT });
            return records;
        });
    }
    dropMessages(discordId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield __1.dbSql.query(`DELETE FROM messages WHERE StaffFileId=(SELECT StaffFileId FROM discordinfos WHERE discordId=${discordId})`);
        });
    }
}
exports.default = StaffFileQueryRoutes;
