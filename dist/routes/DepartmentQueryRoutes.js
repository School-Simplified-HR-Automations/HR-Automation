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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const __1 = require("..");
const queryBuilder_1 = __importDefault(require("../utils/queryBuilder"));
class DepartmentQueryRoutes {
    getDepartment(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            let idquery;
            let supervisorquery;
            let namequery;
            let filters = [];
            if (filter.id) {
                idquery = `id = ${filter.id}`;
                filters.push(idquery);
            }
            else
                idquery = null;
            if (filter.SupervisorId) {
                supervisorquery = `SupervisorId = ${filter.SupervisorId}`;
                filters.push(supervisorquery);
            }
            else
                supervisorquery = null;
            if (filter.name) {
                namequery = `name = '${filter.name}'`;
                filters.push(namequery);
            }
            else
                namequery = null;
            const querystr = (0, queryBuilder_1.default)('SELECT * FROM departments', filters, 1);
            return (yield __1.dbSql.query(querystr, { type: sequelize_1.QueryTypes.SELECT }))[0];
        });
    }
    getDepartmentStaff(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield __1.dbSql.query(`SELECT DepartmentId FROM departmentstaff WHERE StaffFileId = ${id}`, { type: sequelize_1.QueryTypes.SELECT });
            let ret = [];
            for (let i = 0; i < res.length; i++) {
                let pos = yield this.getDepartment({ id: res[i].DepartmentId });
                ret.push(pos.name);
            }
            return ret;
        });
    }
}
exports.default = DepartmentQueryRoutes;
