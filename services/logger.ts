import { v4 as uuidv4 } from "uuid"
import { blue, red, yellow, green } from "colorette"
import util from "util"
import { ApplicationCommandOption, Interaction } from "discord.js"
import { bgRedBright,bold, } from "colorette"
import { format } from "util"

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
    cmdError: (error: any | null, returnId = false, args: { commandName: string, commandArgs: ApplicationCommandOption[], commandUser: { id: string, username: string }, commandGuild: { id: string, name: string, ownerId: string }, interaction: Interaction }) => {
        const Id = uuidv4()
            if (error)
            console.log(
                bold(bgRedBright(`[${timestamp}]`)),
                error,
                bold(format(args))
                )
            else
                console.log(
                    bold(bgRedBright(`[${timestamp}]`)),
                    bold(format(args))
                    )
            if (returnId) {
                return `${Id}`
            }
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

function timestamp(): string {
    const now = new Date()
    const [year, month, day] = now.toISOString().substr(0, 10).split("-")
    return `${day}/${month}/${year} @ ${now.toISOString().substr(11, 8)}`
}

export { log }
