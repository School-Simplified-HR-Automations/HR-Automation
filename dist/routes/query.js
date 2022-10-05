"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DepartmentQueryRoutes_1 = __importDefault(require("./DepartmentQueryRoutes"));
const PositionQueryRoutes_1 = __importDefault(require("./PositionQueryRoutes"));
const StaffFileQueryRoutes_1 = __importDefault(require("./StaffFileQueryRoutes"));
const TeamQueryRoutes_1 = __importDefault(require("./TeamQueryRoutes"));
const TicketPanelQueryRoutes_1 = __importDefault(require("./TicketPanelQueryRoutes"));
const TicketQueryRoutes_1 = __importDefault(require("./TicketQueryRoutes"));
class Query {
}
exports.default = Query;
Query.staff = new StaffFileQueryRoutes_1.default();
Query.tickets = new TicketQueryRoutes_1.default();
Query.panels = new TicketPanelQueryRoutes_1.default();
Query.positions = new PositionQueryRoutes_1.default();
Query.departments = new DepartmentQueryRoutes_1.default();
Query.teams = new TeamQueryRoutes_1.default();
