import { QueryTypes } from "sequelize"
import { dbSql, DiscordInformation } from ".."
import { StaffFile as File } from ".."
import { Department, Position, StaffFile, Team } from "../types/common/ReturnTypes"
import Query from "./query"

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
	async getStaffByFullName(
		firstName: string,
		lastName: string
	): Promise<StaffFile> {
		return (
			await dbSql.query(
				`SELECT * FROM stafffiles WHERE name = '${firstName} ${lastName}'`,
				{ type: QueryTypes.SELECT }
			)
		)[0] as StaffFile
	}
	/**
	 * Queries for a staff member(s) by only their first name. Returns an array of StaffFiles which can be handled, iterated, etc.
	 * @param name The logged name to query. Must be first name.
	 * @returns Array of Staff File Objects
	 */
	async getStaffByFirstName(name: string): Promise<StaffFile[]> {
		return dbSql.query(`SELECT * FROM stafffiles WHERE name LIKE '${name}%'`, {
			type: QueryTypes.SELECT,
		})
	}
	/**
	 * Queries for a staff member(s) by only their last name. Returns an array of StaffFiles which can be handled, iterated, etc.
	 * @param name The logged name to query. Must be last name.
	 * @returns Array of Staff File Objects
	 */
	async getStaffByLastName(name: string): Promise<StaffFile[]> {
		return dbSql.query(`SELECT * FROM stafffiles WHERE name LIKE '%${name}'`, {
			type: QueryTypes.SELECT,
		})
	}
	/**
	 * Queries for a staff member by their unique Primary Key. Returns a Staff File Object.
	 * @param id Unique Primary Key.
	 * @returns Staff File Object
	 */
	async getStaffById(id: number): Promise<StaffFile> {
		return (
			await dbSql.query(`SELECT * FROM stafffiles WHERE id = ${id}`, {
				type: QueryTypes.SELECT,
			})
		)[0] as StaffFile
	}
	/**
	 * Queries for a staff member by their personal or company email. Returns an array of StaffFiles which can be handled, iterated, etc.
	 * @param email The address to match to the system.
	 * @param type The type of the email, either "Personal" or "Company" (@schoolsimplified.org).
	 * @returns Array of Staff File Objects
	 */
	async getStaffByEmail(
		email: string,
		type: "Personal" | "Company"
	): Promise<StaffFile[]> {
		if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/))
			throw new Error(
				"getStaffByEmail - email parameter must be an email address."
			)
		if (type == "Personal") {
			return dbSql.query(
				`SELECT * FROM stafffiles WHERE personalEmail = '${email}'`,
				{ type: QueryTypes.SELECT }
			)
		} else
			return dbSql.query(
				`SELECT * FROM stafffiles WHERE companyEmail = '${email}'`,
				{ type: QueryTypes.SELECT }
			)
	}
	/**
	 * Queries for a staff team via an intermediate Staff File. Returns the Team file.
	 * @param staff The Staff File to use.
	 * @returns Team Object.
	 */
	async getTeamByStaffTeam(staff: object): Promise<Team> {
		return (await dbSql.query(
			`SELECT * FROM teams WHERE id = (SELECT TeamId FROM stafffiles WHERE id = ${
				(staff as StaffFile).id
			})`,
			{ type: QueryTypes.SELECT }))[0] as Team // TODO
	}
	/**
	 * Queries for a staff department via an intermediate Staff File. Returns the Department file.
	 * @param staff The Staff File to use.
	 * @returns Department Object.
	 */
	async getDepartmentByStaffDepartment(staff: object): Promise<Department> {
		return (await dbSql.query(`SELECT * FROM departments WHERE id = (SELECT DepartmentId FROM stafffiles WHERE id = ${(staff as StaffFile).id})`, { type: QueryTypes.SELECT }))[0] as Department
	}
	/**
	 * Queries for a staff position via an intermediate Staff File. Returns the Position file.
	 * @param staff The Staff File to use.
	 * @returns Position Object.
	 */
	async getPositionByStaffPosition(staff: object): Promise<Position> {
		return (await dbSql.query(
			`SELECT * FROM positions WHERE id = (SELECT PositionId FROM stafffiles WHERE id = ${
				(staff as StaffFile).id
			})`,
		{ type: QueryTypes.SELECT }))[0] as Position
	}

	async createStaffFile(
		fullName: string,
		activityStatus:
			| "Active"
			| "On Break"
			| "Resigned"
			| "Fired"
			| "Blacklisted",
		departmentName: string,
		positionName: string,
		email: string,
		teamName?: string,
		appStatus?:
			| "Awaiting Review"
			| "Rejected"
			| "Awaiting Response"
			| "Awaiting Onboarding"
			| "Awaiting Server Entry"
			| "Onboarding Phase"
	): Promise<void> {
		if (appStatus) {
			if (teamName) {
				dbSql.query(`SET @departmentid = (SELECT id FROM departments WHERE name = '${departmentName}');
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
                )`)
				return
			} else {
				dbSql.query(`SET @departmentid = (SELECT id FROM departments WHERE name = '${departmentName}');
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
                )`)
				return
			}
		} else {
			if (teamName) {
				dbSql.query(`SET @departmentid = (SELECT id FROM departments WHERE name = '${departmentName}');
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
                )`)
				return
			} else {
				dbSql.query(`SET @departmentid = (SELECT id FROM departments WHERE name = '${departmentName}');
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
                )`)
				return
			}
		}
	}

	async assignSupervisor(fullName: string, title: string): Promise<void> {
		dbSql.query(`UPDATE supervisors
        SET StaffFileId = (SELECT id FROM stafffiles WHERE name = '${fullName}')
        WHERE title = '${title}'`)
		return
	}

	async onLeave(discordId: string): Promise<boolean | null> {
		onLeave: {
			let bool = (
				await dbSql.query(`SELECT outOfOffice FROM stafffiles WHERE id=(SELECT StaffFileId from discordinfos WHERE discordId='${discordId}')`, { type: QueryTypes.SELECT })
			)[0] as StaffFile
			if (!bool) {
				return null;
			}
			return bool.outOfOffice
		}
	}

	async setLeave(discordId: string, status: boolean): Promise<void> {
		dbSql.query(`UPDATE stafffiles
		SET outOfOffice = ${status}
		WHERE id = (SELECT StaffFileId FROM discordinfos WHERE discordId='${discordId}')`)
		return
	}

	async getMessages(discordId: string) {
		let records = await dbSql.query(`SELECT * FROM messages WHERE StaffFileId=(SELECT StaffFileId FROM discordinfos WHERE discordId=${discordId})`, { type: QueryTypes.SELECT })
		return records
	}

	async dropMessages(discordId: string) {
		await dbSql.query(`DELETE FROM messages WHERE StaffFileId=(SELECT StaffFileId FROM discordinfos WHERE discordId=${discordId})`)
	}
}
