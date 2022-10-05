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
const __1 = require("..");
class TicketQueryRoutes {
    /**
     * Initializes a new Ticket in the database for reference.
     * @param channelId The ID of the ticket channel.
     * @param authorId The ID of the ticket author.
     * @param paneltpguid The unique TPGUID as described in documentation.
     * @param status The status of the ticket - either "Open" or "Closed".
     * @param openDate The string date representation of the open date of the ticket. Defaults to Date.now().toString().
     * @returns New Ticket object.
     */
    createTicket(channelId, authorId, paneltpguid, status, openDate = Date.now().toString()) {
        return __awaiter(this, void 0, void 0, function* () {
            __1.dbSql.query(`INSERT INTO tickets (
            channelId, authorId, paneltpguid, status, openDate, closeDate, createdAt, updatedAt()
        )
        VALUES (
            '${channelId}', '${authorId}', '${paneltpguid}', '${status}', '${openDate}', null, now(), now()
        )`);
            return;
        });
    }
    /**
     * Deletes a Ticket from the database using a validated query pointer.
     * @param queryPointer The query to use to locate the ticket. Must be one of the provided options.
     * @param value The value of the query.
     * @param limit The optional limit.
     * @returns Ticket deletion query.
     */
    deleteTicket(queryPointer, value, limit = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            if (limit == 0) {
                __1.dbSql.query(`DELETE FROM tickets
            WHERE ${queryPointer} = '${value}'`);
                return;
            }
            else {
                __1.dbSql.query(`DELETE FROM tickets
            WHERE ${queryPointer} = '${value}'
            LIMIT ${limit}`);
                return;
            }
        });
    }
}
exports.default = TicketQueryRoutes;
