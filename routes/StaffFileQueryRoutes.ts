import { QueryTypes } from "sequelize"
import { dbSql } from ".."
import { Department, Position, PositionInfo, StaffFile, Team } from "../types/common/ReturnTypes"
import sanitizer from "../utils/sanitizer"
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
		sanitizer("name", firstName, lastName)
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
		sanitizer("name", name)
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
		sanitizer("name", name)
		return dbSql.query(`SELECT * FROM stafffiles WHERE name LIKE '% ${name}%'`, {
			type: QueryTypes.SELECT,
		})
	}
	/**
	 * Queries for a staff member by their unique Primary Key. Returns a Staff File Object.
	 * @param id Unique Primary Key.
	 * @returns Staff File Object
	 */
	async getStaffById(id: number): Promise<StaffFile> {
		sanitizer("number", `${id}`)
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
			`SELECT * FROM teams WHERE id = (SELECT TeamId FROM stafffiles WHERE id = ${(staff as StaffFile).id
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
			`SELECT * FROM positions WHERE id = (SELECT PositionId FROM stafffiles WHERE id = ${(staff as StaffFile).id
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
		discordUser: string,
		discordId: string,
		teamName?: string,
		appStatus?:
			| "Awaiting Review"
			| "Rejected"
			| "Awaiting Response"
			| "Awaiting Onboarding"
			| "Awaiting Server Entry"
			| "Onboarding Phase"
	): Promise<void> {
		sanitizer("name", fullName, departmentName, positionName, discordUser)
		sanitizer("discordId", discordId)
		if (appStatus) {
			if (teamName) {
				sanitizer("name", teamName)
				dbSql.query(`SET @departmentid = (SELECT id FROM departments WHERE name = '${departmentName}');
                SET @positionid = (SELECT id FROM positions WHERE title = '${positionName}');
                SET @teamid = (SELECT id FROM teams WHERE name = '${teamName}');
                INSERT INTO stafffiles (
                    id, name, personalEmail, companyEmail, photoLink, phone, legalSex, genderIdentity, ethnicity, appStatus, strikes, censures, pips, activityStatus, alumni, outOfOffice, createdAt, updatedAt, TeamId, DepartmentId, username, discordId
                )
                VALUES (
                    ${parseInt(discordId.slice(discordId.length - 6))},'${fullName}', null, '${fullName.split(" ")[0].toLowerCase()}.${fullName.split(" ")[1].toLowerCase()}@schoolsimplified.org', null, null, null, null, null, '${appStatus}', 0, 0, 0, '${activityStatus}', 0, 0, now(), now(), @teamid, @departmentid, '${discordUser}', '${discordId}'
                );
                SET @staffid = (SELECT id FROM stafffiles WHERE name = '${fullName}');
                INSERT INTO positioninfos (
                    StaffFileId, PositionId, TeamId, DepartmentId, createdAt, updatedAt
                )
                VALUES (
                    @staffid, @positionid, @teamid, @departmentid, now(), now()
                );
				`)
				return
			} else {
				dbSql.query(`SET @departmentid = (SELECT id FROM departments WHERE name = '${departmentName}');
                SET @positionid = (SELECT id FROM positions WHERE title = '${positionName}');
                SET @teamid = (SELECT TeamId FROM positions WHERE id = @positionid);
                INSERT INTO stafffiles (
                    id, name, personalEmail, companyEmail, photoLink, phone, legalSex, genderIdentity, ethnicity, appStatus, strikes, censures, pips, activityStatus, alumni, outOfOffice, createdAt, updatedAt, TeamId, DepartmentId, username, discordId
                )
                VALUES (
                    ${parseInt(discordId.slice(discordId.length - 6))}, '${fullName}', null, '${fullName.split(" ")[0].toLowerCase()}.${fullName.split(" ")[1].toLowerCase()}@schoolsimplified.org', null, null, null, null, null, '${appStatus}', 0, 0, 0, '${activityStatus}', 0, 0, now(), now(), @teamid, @departmentid, '${discordUser}', '${discordId}'
                );
                SET @staffid = (SELECT id FROM stafffiles WHERE name = '${fullName}');
                INSERT INTO positioninfos (
                    StaffFileId, PositionId, TeamId, DepartmentId, createdAt, updatedAt
                )
                VALUES (
                    @staffid, @positionid, @teamid, @departmentid, now(), now()
                );
				`)
				return
			}
		} else {
			if (teamName) {
				sanitizer("name", teamName)
				dbSql.query(`SET @departmentid = (SELECT id FROM departments WHERE name = '${departmentName}');
                SET @positionid = (SELECT id FROM positions WHERE title = '${positionName}');
                SET @teamid = (SELECT id FROM teams WHERE name = '${teamName}');
                INSERT INTO stafffiles (
                    id, name, personalEmail, companyEmail, photoLink, phone, legalSex, genderIdentity, ethnicity, strikes, censures, pips, activityStatus, alumni, outOfOffice, createdAt, updatedAt, TeamId, DepartmentId, username, discordId
                )
                VALUES (
                    ${parseInt(discordId.slice(discordId.length - 6))}, '${fullName}', null, '${fullName.split(" ")[0].toLowerCase()}.${fullName.split(" ")[1].toLowerCase()}@schoolsimplified.org', null, null, null, null, null, 0, 0, 0, '${activityStatus}', 0, 0, now(), now(), @teamid, @departmentid, '${discordUser}', '${discordId}'
                );
                SET @staffid = (SELECT id FROM stafffiles WHERE name = '${fullName}');
                INSERT INTO positioninfos (
                    StaffFileId, PositionId, TeamId, DepartmentId, createdAt, updatedAt
                )
                VALUES (
                    @staffid, @positionid, @teamid, @departmentid, now(), now()
                );
				`)
				return
			} else {
				dbSql.query(`SET @departmentid = (SELECT id FROM departments WHERE name = '${departmentName}');
                SET @positionid = (SELECT id FROM positions WHERE title = '${positionName}');
                SET @teamid = (SELECT TeamId FROM positions WHERE id = @positionid);
                INSERT INTO stafffiles (
                    id, name, personalEmail, companyEmail, photoLink, phone, legalSex, genderIdentity, ethnicity, strikes, censures, pips, activityStatus, alumni, outOfOffice, createdAt, updatedAt, TeamId, DepartmentId, username, discordId
                )
                VALUES (
                    ${parseInt(discordId.slice(discordId.length - 6))}, '${fullName}', null, '${fullName.split(" ")[0].toLowerCase()}.${fullName.split(" ")[1].toLowerCase()}@schoolsimplified.org', null, null, null, null, null, 0, 0, 0, '${activityStatus}', 0, 0, now(), now(), @teamid, @departmentid, '${discordUser}', '${discordId}'
                );
                SET @staffid = (SELECT id FROM stafffiles WHERE name = '${fullName}');
                INSERT INTO positioninfos (
                    StaffFileId, PositionId, TeamId, DepartmentId, createdAt, updatedAt
                )
                VALUES (
                    @staffid, @positionid, @teamid, @departmentid, now(), now()
                );
				`)
				return
			}
		}
	}

	async assignSupervisor(fullName: string, title: string): Promise<void> {
		sanitizer('name', fullName, title)
		dbSql.query(`UPDATE supervisors
        SET StaffFileId = (SELECT id FROM stafffiles WHERE name = '${fullName}')
        WHERE title = '${title}'`)
		return
	}

	async onLeave(discordId: string): Promise<number | null> {
		sanitizer("discordId", discordId)
		let bool = (
			await dbSql.query(`SELECT outOfOffice FROM stafffiles WHERE discordId=${discordId}`, { type: QueryTypes.SELECT })
		)[0] as StaffFile
		if (!bool) {
			return null;
		}
		return bool.outOfOffice
	}

	async setLeave(discordId: string, status: boolean): Promise<void> {
		sanitizer("discordId", discordId)
		dbSql.query(`UPDATE stafffiles
		SET outOfOffice = ${status == true ? 1 : 0}
		WHERE discordId=${discordId}`)
		return
	}

	async getMessages(discordId: string) {
		sanitizer("discordId", discordId)
		let records = await dbSql.query(`SELECT * FROM messages WHERE StaffFileId=(SELECT id FROM stafffiles WHERE discordId=${discordId})`, { type: QueryTypes.SELECT })
		return records
	}

	async dropMessages(discordId: string) {
		sanitizer("discordId", discordId)
		await dbSql.query(`DELETE FROM messages WHERE StaffFileId=(SELECT id FROM stafffiles WHERE discordId=${discordId})`)
	}

	async getStaffBySupervisor(supervisorId: number) {
		sanitizer("number", `${supervisorId}`)
		let ret: StaffFile = (await this.getStaffById((await Query.supervisors.getSupervisorById(supervisorId))[0].StaffFileId))
		return ret
	}

	async addReprimand(date: number, dateExp: number, reason: string, id: number, type: 1 | 2, admin: number, detailLink?: string) {
		console.log(`${date}, ${dateExp}, ${reason}, ${id}, ${type}, ${admin}`)
		sanitizer("timestamp", `${date}`, `${dateExp}`)
		console.log("Date passed")
		sanitizer("name", reason)
		console.log("Name passed")
		sanitizer("number", `${id}`, `${admin}`)
		console.log("Number passed")
		
		if (detailLink) {
			sanitizer('link', detailLink)
			await dbSql.query(`INSERT INTO records
			(StaffFileAdm, date, dateExp, reason, detailLink, createdAt, updatedAt, StaffFileId, recordType)
			VALUES (${admin}, '${date}', '${dateExp}', '${reason}', '${detailLink}', now(), now(), ${id}, ${type})`)
		} else {
			await dbSql.query(`INSERT INTO records
			(StaffFileAdm, date, dateExp, reason, createdAt, updatedAt, StaffFileId, recordType)
			VALUES (${admin}, '${date}', '${dateExp}', '${reason}', now(), now(), ${id}, ${type})`)
		}
		if (type == 1) {
			await dbSql.query(`SET @strikes = (SELECT strikes FROM stafffiles WHERE id = ${id});
			UPDATE stafffiles
			SET strikes = @strikes + 1
			WHERE id = ${id}`)
		} else if (type == 2) {
			await dbSql.query(`SET @censures = (SELECT censures FROM stafffiles WHERE id = ${id});
			UPDATE stafffiles
			SET censures = @censures + 1
			WHERE id = ${id}`)
		}
	}

	async getStaffByTeamId(id: number) {
		const staff = (await dbSql.query(`SELECT * FROM positioninfos WHERE TeamId=${id}`, { type: QueryTypes.SELECT }) as PositionInfo[])
		const res = []
		for (let i = 0; i < staff.length; i++) {
			res.push(await Query.staff.getStaffById(staff[i].StaffFileId))
		}

		return res;

	}
}
