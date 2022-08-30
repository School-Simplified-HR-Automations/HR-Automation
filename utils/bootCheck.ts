import { log } from "../services/logger"
import "dotenv/config"

export class BootCheck {
	public static async check(): Promise<void> {
		if (!process.env.TOKEN) {
			log.error("No TOKEN environment variable found.")
			process.exit(1)
		}
		if (!process.env.USER) {
			log.error("No USER environment variable found.")
			process.exit(1)
		}
		if (!process.env.PW) {
			log.error("No PW environment variable found.")
			process.exit(1)
		}
		if (!process.env.CLIENT_ID) {
			log.error("No CLIENT_ID environment variable found.")
			process.exit(1)
		}
		if (!process.env.REC1) {
			log.error("No REC1 environment variable found.")
			process.exit(1)
		}
		if (!process.env.REC2) {
			log.error("No REC2 environment variable found.")
			process.exit(1)
		}
		if (!process.env.HIRE_EMAIL) {
			log.error("No HIRE_EMAIL environment variable found.")
			process.exit(1)
		}
		if (!process.env.HIRE_APP_PW) {
			log.error("No HIRE_APP_PW environment variable found.")
			process.exit(1)
		}
		if (!process.env.SQL_URI) {
			log.error("No SQL_URI environment variable found.")
			process.exit(1)
		}
		if (!process.env.SQL_USERNAME) {
			log.error("No SQL_USERNAME environment variable found.")
			process.exit(1)
		}
		if (!process.env.SQL_PASSWORD) {
			log.error("No SQL_PASSWORD environment variable found.")
			process.exit(1)
		}
		log.success("Boot check passed.")
	}
}
