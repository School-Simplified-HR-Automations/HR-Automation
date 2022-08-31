import DepartmentQueryRoutes from "./DepartmentQueryRoutes";
import PositionQueryRoutes from "./PositionQueryRoutes";
import StaffFileQueryRoutes from "./StaffFileQueryRoutes";
import TeamQueryRoutes from "./TeamQueryRoutes";
import TicketPanelQueryRoutes from "./TicketPanelQueryRoutes";
import TicketQueryRoutes from "./TicketQueryRoutes";

export default class Query {
    staff = new StaffFileQueryRoutes()
    tickets = new TicketQueryRoutes()
    panels = new TicketPanelQueryRoutes()
    positions = new PositionQueryRoutes()
    departments = new DepartmentQueryRoutes()
    teams = new TeamQueryRoutes()
}