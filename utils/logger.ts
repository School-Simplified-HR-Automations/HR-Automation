import { v4 as uuidv4 } from "uuid";
import { blue, red, yellow, green } from "colorette";
const date = new Date();
const toLogConsole = `${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
import util from "util";

const log = {
  debug: (message: any, title = "") => {
    console.log(
      blue(`[${toLogConsole}] DEBUG${title ? `: ${title}: ` : ": "}` + message)
    );
  },
  error: (message: any, title = "", returnId = false) => {
    const ID = uuidv4();
    console.log(
      red(
        `${ID} [${toLogConsole}] ERROR${title ? `: ${title}: ` : ":  "}` +
          message
      )
    );
    if (returnId) return ID;
  },
  warn: (message: any, title = "") => {
    console.log(
      yellow(`[${toLogConsole}] WARN${title ? `: ${title}: ` : ": "}` + message)
    );
  },
  success: (message: any, title = "") => {
    console.log(
      green(
        `[${toLogConsole}] SUCCESS${title ? `: ${title}: ` : ": "}` + message
      )
    );
  },
};

export { log };
