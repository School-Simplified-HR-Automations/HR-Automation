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
class PositionQueryRoutes {
    getPosition(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            let idquery;
            let titlequery;
            let filters = [];
            if (filter.id) {
                idquery = `id = ${filter.id}`;
                filters.push(idquery);
            }
            else
                idquery = null;
            if (filter.title) {
                titlequery = `title = '${filter.title}'`;
                filters.push(titlequery);
            }
            else
                titlequery = null;
            const querystr = (0, queryBuilder_1.default)('SELECT * FROM positions', filters, 1);
            let ret = (yield __1.dbSql.query(querystr, { type: sequelize_1.QueryTypes.SELECT }))[0];
            let retPos = new class {
                constructor() {
                    this.id = ret.id;
                    this.title = ret.title;
                    this.createdAt = ret.createdAt;
                    this.updatedAt = ret.updatedAt;
                    this.DepartmentId = ret.DepartmentId;
                }
            };
            return retPos;
        });
    }
    getPositionStaff(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield __1.dbSql.query(`SELECT PositionId FROM positionstaff WHERE StaffFileId = ${id}`, { type: sequelize_1.QueryTypes.SELECT });
            let ret = [];
            for (let i = 0; i < res.length; i++) {
                let pos = yield this.getPosition({ id: res[i].PositionId });
                ret.push(pos.title);
            }
            return ret;
        });
    }
}
exports.default = PositionQueryRoutes;
