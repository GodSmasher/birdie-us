export declare class DataAccessError extends Error {
    readonly table: string;
    readonly operation: string;
    readonly cause: string;
    constructor(table: string, operation: string, cause: string);
}
//# sourceMappingURL=errors.d.ts.map