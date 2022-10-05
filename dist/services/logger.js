"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const uuid_1 = require("uuid");
const colorette_1 = require("colorette");
const util_1 = __importDefault(require("util"));
const log = {
    debug: (message, title = "") => {
        const date = new Date();
        const toLogConsole = `${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        console.log((0, colorette_1.blue)(`[${toLogConsole}] DEBUG${title ? `: ${title}: ` : ": "}` +
            util_1.default.format(message)));
    },
    error: (message, title = "", returnId = false) => {
        const date = new Date();
        const toLogConsole = `${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        const ID = (0, uuid_1.v4)();
        console.log((0, colorette_1.red)(`${ID} [${toLogConsole}] ERROR${title ? `: ${title}: ` : ":  "}` +
            util_1.default.format(message)));
        if (returnId)
            return ID;
    },
    warn: (message, title = "") => {
        const date = new Date();
        const toLogConsole = `${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        console.log((0, colorette_1.yellow)(`[${toLogConsole}] WARN${title ? `: ${title}: ` : ": "}` +
            util_1.default.format(message)));
    },
    success: (message, title = "") => {
        const date = new Date();
        const toLogConsole = `${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        console.log((0, colorette_1.green)(`[${toLogConsole}] SUCCESS${title ? `: ${title}: ` : ": "}` +
            util_1.default.format(message)));
    },
};
exports.log = log;
