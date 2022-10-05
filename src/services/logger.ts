import { v4 as uuidv4 } from "uuid"
import { blue, red, yellow, green } from "colorette"
import util from "util"

const log = {
	debug: (message: any, title = "") => {
		const date = new Date()
		const toLogConsole = `${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
		console.log(
			blue(
				`[${toLogConsole}] DEBUG${title ? `: ${title}: ` : ": "}` +
					util.format(message)
			)
		)
	},
	error: (message: any, title = "", returnId = false) => {
		const date = new Date()
		const toLogConsole = `${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
		const ID = uuidv4()
		console.log(
			red(
				`${ID} [${toLogConsole}] ERROR${title ? `: ${title}: ` : ":  "}` +
					util.format(message)
			)
		)
		if (returnId) return ID
	},
	warn: (message: any, title = "") => {
		const date = new Date()
		const toLogConsole = `${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
		console.log(
			yellow(
				`[${toLogConsole}] WARN${title ? `: ${title}: ` : ": "}` +
					util.format(message)
			)
		)
	},
	success: (message: any, title = "") => {
		const date = new Date()
		const toLogConsole = `${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
		console.log(
			green(
				`[${toLogConsole}] SUCCESS${title ? `: ${title}: ` : ": "}` +
					util.format(message)
			)
		)
	},
}

export { log }
