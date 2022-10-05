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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BootCheck = void 0;
const logger_1 = require("../services/logger");
require("dotenv/config");
class BootCheck {
    static check() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!process.env.TOKEN) {
                logger_1.log.error("No TOKEN environment variable found.");
                process.exit(1);
            }
            if (!process.env.USER) {
                logger_1.log.error("No USER environment variable found.");
                process.exit(1);
            }
            if (!process.env.PW) {
                logger_1.log.error("No PW environment variable found.");
                process.exit(1);
            }
            if (!process.env.CLIENT_ID) {
                logger_1.log.error("No CLIENT_ID environment variable found.");
                process.exit(1);
            }
            if (!process.env.REC1) {
                logger_1.log.error("No REC1 environment variable found.");
                process.exit(1);
            }
            if (!process.env.REC2) {
                logger_1.log.error("No REC2 environment variable found.");
                process.exit(1);
            }
            if (!process.env.HIRE_EMAIL) {
                logger_1.log.error("No HIRE_EMAIL environment variable found.");
                process.exit(1);
            }
            if (!process.env.HIRE_APP_PW) {
                logger_1.log.error("No HIRE_APP_PW environment variable found.");
                process.exit(1);
            }
            if (!process.env.SQL_URI) {
                logger_1.log.error("No SQL_URI environment variable found.");
                process.exit(1);
            }
            if (!process.env.SQL_USERNAME) {
                logger_1.log.error("No SQL_USERNAME environment variable found.");
                process.exit(1);
            }
            if (!process.env.SQL_PASSWORD) {
                logger_1.log.error("No SQL_PASSWORD environment variable found.");
                process.exit(1);
            }
            logger_1.log.success("Boot check passed.");
        });
    }
}
exports.BootCheck = BootCheck;
