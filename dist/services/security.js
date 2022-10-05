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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Security = void 0;
const logger_1 = require("./logger");
const axios_1 = __importDefault(require("axios"));
class Security {
    /**
     * Checks if a user is allowed to use eval or exec.
     * @param user The user to check.
     * @returns Whether the user is allowed to use eval or exec.
     */
    static isEvalerUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.EVAL_CHECK_API_KEY}`,
            };
            return yield axios_1.default
                .get(`${process.env.EVAL_CHECK_URL_BASE}/${process.env.EVAL_CHECK_URL_PATH}/${process.env.CLIENT_ID}`, { headers })
                .then((response) => {
                if (response.status !== 200) {
                    logger_1.log.error(`Failed to check evaler user: ${response}`, "Evaler user check failed");
                    return {
                        status: 2,
                        message: "Internal error",
                    };
                }
                const data = response.data;
                if (!data.owners.includes(process.env.DEVELOPER_1_ID) ||
                    !data.owners.includes(process.env.DEVELOPER_2_ID)) {
                    logger_1.log.warn(`${user.tag} (${user.id}) is not allowed to use eval or exec`, "Eval check failed - data owners doesn't have developer id 1 or 2");
                    return {
                        status: 0,
                        message: "Unauthorized user",
                    };
                }
                if (!data.owners.includes(user.id) &&
                    user.id !== process.env.DEVELOPER_1_ID &&
                    !data.owners.includes(user.id) &&
                    user.id !== process.env.DEVELOPER_2_ID) {
                    logger_1.log.warn(`${user.tag} (${user.id}) is not allowed to use eval or exec`, "Eval check failed - user id not in env");
                    return {
                        status: 0,
                        message: "Unauthorized user",
                    };
                }
                if (user.avatar !== process.env.DEVELOPER_1_PFP &&
                    user.avatar !== process.env.DEVELOPER_2_PFP) {
                    logger_1.log.warn(`${user.tag} (${user.id}) is not allowed to use eval or exec`, "Eval check failed - avatar does not match");
                    return {
                        status: 0,
                        message: "Unauthorized user",
                    };
                }
                return {
                    status: 1,
                    message: "Authorized and authenticated",
                };
            })
                .catch((error) => {
                logger_1.log.error(error, `Failed to check evaler user ${user.tag} (${user.id})`);
                return {
                    status: 2,
                    message: "Internal error",
                };
            });
        });
    }
    /**
     * Checks if a eval is allowed to execute.
     * @param code The code to check
     * @param user The user who is executing the code
     * @returns True if safe
     * @throws Error if unsafe
     */
    static evalCheck(code, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const disallowed = [
                "secret",
                "token",
                "process.env",
                "SECRET",
                "TOKEN",
                "PROCESS.ENV",
                "client.token",
                "CLIENT.TOKEN",
                "require('child_process');",
                "MONGO_URI",
            ];
            if (!(yield Security.isEvalerUser(user))) {
                return {
                    status: 0,
                    message: "Unauthorized user",
                };
            }
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.EVAL_CHECK_API_KEY}`,
            };
            return yield axios_1.default
                .get(`${process.env.EVAL_CHECK_URL_BASE}/${process.env.EVAL_CHECK_URL_PATH}/${process.env.CLIENT_ID}`, { headers })
                .then((response) => {
                if (response.status !== 200) {
                    logger_1.log.error(`Failed to check if eval is allowed: ${response}`, "Eval check failed");
                    return {
                        status: 2,
                        message: "Internal error",
                    };
                }
                const data = response.data;
                if (!data.allowEval) {
                    logger_1.log.warn(`This bot is not allowed to eval`, "Eval check failed - eval not allowed for this application");
                    return {
                        status: 0,
                        message: "Unauthorized bot",
                    };
                }
                if (disallowed.some((disallowedSnippet) => code.includes(disallowedSnippet))) {
                    logger_1.log.warn(code, `The code provided by ${user.tag} (${user.id}) is not allowed to be eval - dangerous code`);
                    return {
                        status: 0,
                        message: "Dangerous evaluation input",
                    };
                }
                return {
                    status: 1,
                    message: "Authorized and authenticated",
                };
            })
                .catch((error) => {
                logger_1.log.error(error, `Failed to check if eval is allowed ${user.tag} (${user.id})`);
                return {
                    status: 2,
                    message: "Internal error",
                };
            });
        });
    }
    static execCheck(code, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const disallowed = [
                "secret",
                "token",
                "process.env",
                "SECRET",
                "TOKEN",
                "PROCESS.ENV",
                "client.token",
                "CLIENT.TOKEN",
                "require('child_process');",
                "MONGO_URI",
                ".env",
                "rm",
                "rm -rf",
                ":(){:|:&};:",
                "/dev/sda",
                "mv /home/user/* /dev/null",
                "mkfs.ext3 /dev/sda",
                "dd if=/dev/random of=/dev/sda",
                "sudo apt purge python2.x-minimal",
                "chmod -R 777 /",
            ];
            if (!(yield Security.isEvalerUser(user))) {
                return {
                    status: 0,
                    message: "Unauthorized user",
                };
            }
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.EVAL_CHECK_API_KEY}`,
            };
            return yield axios_1.default
                .get(`${process.env.EVAL_CHECK_URL_BASE}/${process.env.EVAL_CHECK_URL_PATH}/${process.env.CLIENT_ID}`, { headers })
                .then((response) => {
                if (response.status !== 200) {
                    logger_1.log.error(`Failed to check if eval is allowed: ${response}`, "Eval check failed");
                    return {
                        status: 2,
                        message: "Internal error",
                    };
                }
                const data = response.data;
                if (!data.allowShell) {
                    logger_1.log.warn(`This bot is not allowed to execute`, "Execute check failed - exec not allowed for this application");
                    return {
                        status: 0,
                        message: "Unauthorized bot",
                    };
                }
                if (disallowed.some((disallowedSnippet) => code.includes(disallowedSnippet))) {
                    logger_1.log.warn(code, `The code provided by ${user.tag} (${user.id}) is not allowed to be executed - dangerous code`);
                    return {
                        status: 0,
                        message: "Dangerous execution input",
                    };
                }
                return {
                    status: 1,
                    message: "Authorized and authenticated",
                };
            });
        });
    }
    static basicDevCheck(user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user.id !== process.env.DEVELOPER_1_ID &&
                user.id !== process.env.DEVELOPER_2_ID) {
                logger_1.log.warn(`${user.tag} (${user.id}) is not a dev - basic`);
                return {
                    status: 0,
                    message: "Unauthorized user",
                };
            }
            return {
                status: 1,
                message: "Authorized and authenticated",
            };
        });
    }
}
exports.Security = Security;
