import { TimestampStylesString } from "discord.js"

/**
* Utility to generate Discord Timestamps.
*/
export class Timestamp {
    /**
    * Generates a Discord Timestamp.
    * @param {TimestampStyle} style The style to use for the timestamp.
    * @param {Date} date The date to use for the timestamp.
    * @param {number} timestamp The timestamp to use for the timestamp.
    * @param {boolean} addRelative If true, the relative time will be added to the timestamp.
    * @returns The generated timestamp.
    */
    static generate(
        style: TimestampStylesString,date?: Date, timestamp?: number, addRelative?: boolean ): string {
        const secondsTimestamp = date ? Math.round(date.getTime() / 1000) : timestamp ? Math.round(timestamp / 1000) : 0
        if (!secondsTimestamp) {
            throw new Error("No timestamp/date provided.")
        }
        return `<t:${secondsTimestamp}:${style}>${addRelative ? ` (<t:${secondsTimestamp}:R>)` : ""}`
    }
}
