import { log } from "../services/logger"

module.exports = {
    name: 'warn',
    once: false,
    execute(warn: any) {
        log.warn(warn, "CLIENT_WARN")
    }
}