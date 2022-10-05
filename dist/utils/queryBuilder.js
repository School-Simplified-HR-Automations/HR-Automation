"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function queryBuilder(initialQuery, filters, limit) {
    let querystr = initialQuery;
    for (let i = 0; i < filters.length; i++) {
        if (i == 0) {
            querystr += ` WHERE ${filters[i]}`;
            continue;
        }
        querystr += ` AND ${filters[i]}`;
    }
    if (limit) {
        querystr += ` LIMIT ${limit}`;
    }
    return querystr;
}
exports.default = queryBuilder;
