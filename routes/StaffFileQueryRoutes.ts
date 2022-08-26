import { QueryTypes } from "sequelize"
import { dbSql } from "..";
import { StaffFile } from "../types/common/ReturnTypes";

/**
 * Provides easy accessible query routes for the "stafffiles" table of the database.
 */
export default class StaffFileQueryRoutes {
    /**
     * Queries for a staff member by full name and returns their StaffFile.
     * @param firstName The logged first name of the user.
     * @param lastName The logged last name of the user.
     * @returns Staff File Object
     */
    async getStaffByFullName(firstName: string, lastName: string): Promise<StaffFile> {
        return (
            await dbSql.query(`SELECT * FROM stafffiles WHERE name = '${firstName} ${lastName}'`, { type: QueryTypes.SELECT })
            )[0] as StaffFile
    }
    /**
     * Queries for a staff member(s) by only their first name. Returns an array of StaffFiles which can be handled, iterated, etc.
     * @param name The logged name to query. Must be first name.
     * @returns Array of Staff File Objects
     */
    async getStaffByFirstName(name: string): Promise<object[]> {
        return dbSql.query(`SELECT * FROM stafffiles WHERE name LIKE '${name} %'`, { type: QueryTypes.SELECT })
    }
    /**
     * Queries for a staff member(s) by only their last name. Returns an array of StaffFiles which can be handled, iterated, etc.
     * @param name The logged name to query. Must be last name.
     * @returns Array of Staff File Objects
     */
    async getStaffByLastName(name: string): Promise<object[]> {
        return dbSql.query(`SELECT * FROM stafffiles WHERE name LIKE '%${name}'`, { type: QueryTypes.SELECT })
    }
    /**
     * Queries for a staff member by their unique Primary Key. Returns a Staff File Object.
     * @param id Unique Primary Key.
     * @returns Staff File Object
     */
    async getStaffById(id: number): Promise<object> {
        return (
            await dbSql.query(`SELECT * FROM stafffiles WHERE id = ${id}`, { type: QueryTypes.SELECT })
        )[0]
    }
    /**
     * Queries for a staff member by their personal or company email. Returns an array of StaffFiles which can be handled, iterated, etc.
     * @param email The address to match to the system.
     * @param type The type of the email, either "Personal" or "Company" (@schoolsimplified.org).
     * @returns Array of Staff File Objects
     */
    async getStaffByEmail(email: string, type: "Personal"|"Company"): Promise<object[]> {
        if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) throw new Error("getStaffByEmail - email parameter must be an email address.")
        if (type == "Personal") {
            return dbSql.query(`SELECT * FROM stafffiles WHERE personalEmail = '${email}'`, { type: QueryTypes.SELECT })
        } else return dbSql.query(`SELECT * FROM stafffiles WHERE companyEmail = '${email}'`, { type: QueryTypes.SELECT })
    }

    async getTeamByStaffTeam(staff: object): Promise<object> {
        return dbSql.query(`SELECT * FROM teams WHERE id = (SELECT TeamId FROM stafffiles WHERE id = ${staff})`) // TODO
    }

    

}