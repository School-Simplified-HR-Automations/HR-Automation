import DepartmentQueryRoutes from "./DepartmentQueryRoutes";
import PositionQueryRoutes from "./PositionQueryRoutes";
import StaffFileQueryRoutes from "./StaffFileQueryRoutes";
import TeamQueryRoutes from "./TeamQueryRoutes";
import TicketPanelQueryRoutes from "./TicketPanelQueryRoutes";
import TicketQueryRoutes from "./TicketQueryRoutes";

export default class Query {
    static staff = new StaffFileQueryRoutes()
    static tickets = new TicketQueryRoutes()
    static panels = new TicketPanelQueryRoutes()
    static positions = new PositionQueryRoutes()
    static departments = new DepartmentQueryRoutes()
    static teams = new TeamQueryRoutes()
}