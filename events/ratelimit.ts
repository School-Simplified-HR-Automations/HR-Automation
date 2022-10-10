import { log } from "../services/logger"

module.exports = {
    name: 'ratelimit',
    once: false,
    execute(ratelimit: any) {
        log.warn(ratelimit, "CLIENT_RATELIMIT")
    }
}