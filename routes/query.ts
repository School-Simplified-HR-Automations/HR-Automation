import AuthQueryRoutes from "./AuthQueryRoutes";
import DepartmentQueryRoutes from "./DepartmentQueryRoutes";
import InternalQueryRoutes from "./InternalQueryRoutes";
import PositionHistoriesQueryRoutes from "./PositionHistoriesQueryRoutes";
import PositionQueryRoutes from "./PositionQueryRoutes";
import RecordQueryRoutes from "./RecordQueryRoutes";
import StaffFileQueryRoutes from "./StaffFileQueryRoutes";
import SupervisorQueryRoutes from "./SupervisorQueryRoutes";
import TeamQueryRoutes from "./TeamQueryRoutes";
import TicketPanelQueryRoutes from "./TicketPanelQueryRoutes";
import TicketQueryRoutes from "./TicketQueryRoutes";
/**
 * Helper class to provide internal API functionality.
 */
export default class Query {
    static staff = new StaffFileQueryRoutes()
    static tickets = new TicketQueryRoutes()
    static panels = new TicketPanelQueryRoutes()
    static positions = new PositionQueryRoutes()
    static departments = new DepartmentQueryRoutes()
    static teams = new TeamQueryRoutes()
    static supervisors = new SupervisorQueryRoutes()
    static auth = new AuthQueryRoutes()
    static records = new RecordQueryRoutes()
    static positionHistory = new PositionHistoriesQueryRoutes()
    static internal = new InternalQueryRoutes()
}