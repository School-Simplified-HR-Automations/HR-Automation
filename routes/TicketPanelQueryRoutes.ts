import { QueryTypes } from "sequelize";
import { dbSql } from "..";

export default class TicketPanelQueryRoutes {
    /**
     * Queries for Ticket Panels using a query pointer. Returns an Array of Panels to be awaited.
     * @param queryPointer The query to use to locate the ticket. Must be one of the provided options.
     * @param value The value of the query.
     * @param limit The optional limit.
     * @returns Array of Ticket Panels.
     */
    async getTicketPanel(queryPointer: "name" | "value" | "description" | "channelPrefix" | "guildId" | "buttonName" | "tpguid" | "messageLink" | "category" | "logChannel", value: string, limit = 0): Promise<object[]> {
        if (limit == 0) {
            return dbSql.query(`SELECT *
            FROM ticketpanels
            WHERE ${queryPointer} = '${value}'`, { type: QueryTypes.SELECT })
        } else {
            return dbSql.query(`SELECT *
            FROM ticketpanels
            WHERE ${queryPointer} = '${value}'
            LIMIT ${limit}`, { type: QueryTypes.SELECT })
        }
    }
    /**
     * Queries for every Ticket Panel and all of the details associated with each of them. Returns an Array of Panels.
     * @param limit The optional limit.
     * @returns Array of Ticket Panels.
     */
    async listTicketPanels(limit = 0): Promise<object[]> {
        if (limit == 0) {
            return dbSql.query(`SELECT * FROM ticketpanels`, { type: QueryTypes.SELECT })
        } else {
            return dbSql.query(`SELECT * FROM ticketpanels LIMIT ${limit}`, { type: QueryTypes.SELECT })
        }
    }
    /**
     * Queries for every Ticket Panel and all of the details associated with each of them, based on active guild association. Returns an Array of Panels.
     * @param guildId The guild ID associated with the Panel(s).
     * @param limit The optional limit.
     * @returns Array of Ticket Panels.
     */
    async listTicketPanelsGuild(guildId: string, limit = 0): Promise<object[]> {
        if (limit == 0) {
            return dbSql.query(`SELECT * FROM ticketpanels WHERE guildId = '${guildId}'`, { type: QueryTypes.SELECT })
        } else {
            return dbSql.query(`SELECT * FROM ticketpanels WHERE guildId = '${guildId}' LIMIT ${limit}`, { type: QueryTypes.SELECT })
        }
    }
    /**
     * Creates a Ticket Panel with all required details.
     * @param name The name of the Panel.
     * @param value The value (customId) of the Panel.
     * @param description The description of the Panel.
     * @param channelPrefix The channel prefix for the Panel, to be applied to all new tickets.
     * @param guildId The associated Guild ID of the Panel.
     * @param buttonName The name of the associated button for the Panel. The customId of this button will be the value field.
     * @param tpguid The TPGUID of the Panel, as described in documentation.
     * @param messageLink The link to the message associated with this Ticket Panel's initialization.
     * @param category The category to push new tickets to.
     * @param logChannel The channel to log updates regarding tickets in this Panel.
     * @returns Void promise indicating creation.
     */
    async createTicketPanel(name: string, value: string, description: string, channelPrefix: string, guildId: string, buttonName: string, tpguid: string, messageLink: string, category: string, logChannel: string): Promise<void> {
        dbSql.query(`INSERT INTO ticketpanels (
            name, value, description, channelPrefix, guildId, buttonName, tpguid, messageLink, category, logChannel, createdAt, updatedAt
        )
        VALUES (
            '${name}', '${value}', '${description}', '${channelPrefix}', '${guildId}', '${buttonName}', '${tpguid}', '${messageLink}', '${category}', '${logChannel}', now(), now()
        )`)
        return
    }
    /**
     * Deletes a Ticket Panel.
     * @param queryPointer The query to use to locate the Panel. Must be a provided option.
     * @param value The value of the query.
     * @param limit The optional limit.
     * @returns Void promise indicating deletion.
     */
    async deleteTicketPanel(queryPointer: "name" | "value" | "description" | "channelPrefix" | "guildId" | "buttonName" | "tpguid" | "messageLink" | "category" | "logChannel", value: string, limit = 0): Promise<void> {
        if (limit == 0) {
            dbSql.query(`DELETE FROM ticketpanels WHERE ${queryPointer} = '${value}'`)
            return
        } else {
            dbSql.query(`DELETE FROM ticketpanels WHERE ${queryPointer} = '${value}' LIMIT ${limit}`)
            return
        }
    }

}