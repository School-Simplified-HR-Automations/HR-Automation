import PositionQueryRoutes from "./PositionQueryRoutes";
import StaffFileQueryRoutes from "./StaffFileQueryRoutes";
import TicketPanelQueryRoutes from "./TicketPanelQueryRoutes";
import TicketQueryRoutes from "./TicketQueryRoutes";

export default class Query {
    staff = new StaffFileQueryRoutes()
    tickets = new TicketQueryRoutes()
    panels = new TicketPanelQueryRoutes()
    positions = new PositionQueryRoutes()
}