import { dbSql } from "..";

export default class TicketQueryRoutes {
    /**
     * Initializes a new Ticket in the database for reference.
     * @param channelId The ID of the ticket channel.
     * @param authorId The ID of the ticket author.
     * @param paneltpguid The unique TPGUID as described in documentation.
     * @param status The status of the ticket - either "Open" or "Closed".
     * @param openDate The string date representation of the open date of the ticket. Defaults to Date.now().toString().
     * @returns New Ticket object.
     */
    async createTicket(channelId: string, authorId: string, paneltpguid: string, status: "Open" | "Closed", openDate = Date.now().toString()): Promise<void> {
        dbSql.query(`INSERT INTO tickets (
            channelId, authorId, paneltpguid, status, openDate, closeDate, createdAt, updatedAt()
        )
        VALUES (
            '${channelId}', '${authorId}', '${paneltpguid}', '${status}', '${openDate}', null, now(), now()
        )`)
        return
    }
    /**
     * Deletes a Ticket from the database using a validated query pointer.
     * @param queryPointer The query to use to locate the ticket. Must be one of the provided options.
     * @param value The value of the query.
     * @param limit The optional limit.
     * @returns Ticket deletion query.
     */
    async deleteTicket(queryPointer: "channelId" | "authorId" | "paneltpguid" | "status" | "openDate" | "closeDate", value: string, limit = 0): Promise<void> {
        if (limit == 0) {
            dbSql.query(`DELETE FROM tickets
            WHERE ${queryPointer} = '${value}'`)
            return
        } else {
            dbSql.query(`DELETE FROM tickets
            WHERE ${queryPointer} = '${value}'
            LIMIT ${limit}`)
            return
        }
    } 
}