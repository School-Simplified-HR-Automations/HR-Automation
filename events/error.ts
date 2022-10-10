import { log } from "../services/logger"

module.exports = {
    name: 'error',
    once: false,
    execute(error: any) {
        log.error(error, "CLIENT_ERROR")
    }
}