/**
 * Format a number as CHF currency: CHF 12'450.00
 */
export declare function formatCHF(amount: number): string;
/**
 * Format a number as CHF without decimals: CHF 12'450
 */
export declare function formatCHFShort(amount: number): string;
/**
 * Format a decimal as percentage: 48.3 %
 * Input is 0-1 (e.g. 0.483 -> "48.3 %")
 */
export declare function formatPercent(value: number): string;
/**
 * Format a whole number with Swiss grouping: 1'234
 */
export declare function formatNumber(value: number): string;
/**
 * Format a date as Swiss date: 23.03.2026
 */
export declare function formatDate(date: Date | string): string;
/**
 * Format a date with time: 23.03.2026, 14:30
 */
export declare function formatDateTime(date: Date | string): string;
/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 */
export declare function formatDuration(seconds: number): string;
/**
 * Format a relative time: "vor 2 Stunden", "vor 3 Tagen"
 */
export declare function formatRelativeTime(date: Date | string): string;
//# sourceMappingURL=formatters.d.ts.map