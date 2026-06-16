"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataAccessError = void 0;
class DataAccessError extends Error {
    table;
    operation;
    cause;
    constructor(table, operation, cause) {
        super(`DataAccess error on ${table}.${operation}: ${cause}`);
        this.table = table;
        this.operation = operation;
        this.cause = cause;
        this.name = 'DataAccessError';
    }
}
exports.DataAccessError = DataAccessError;
//# sourceMappingURL=errors.js.map