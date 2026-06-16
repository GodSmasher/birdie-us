import type { CompanyRow, CompanyBrandingRow, ProfileRow, RoleRow, LeadRow, TeamMemberRow, OfferRow, ProjectRow, PhaseDefinitionRow, CallRow, CallAnalysisRow, InvoiceRow } from './database.js';
export type CompanyWithBranding = CompanyRow & {
    branding: CompanyBrandingRow;
};
/** @deprecated Use CompanyWithBranding */
export type TenantWithBranding = CompanyWithBranding;
export type UserSession = {
    profile: ProfileRow;
    holdingId: string | null;
    companyId: string | null;
    roles: RoleRow[];
    permissions: string[];
    isEnuraAdmin: boolean;
    isHoldingAdmin: boolean;
};
export type ProjectWithPhase = ProjectRow & {
    phase: PhaseDefinitionRow;
    berater: TeamMemberRow | null;
};
export type LeadWithSetter = LeadRow & {
    setter: TeamMemberRow | null;
};
export type OfferWithBerater = OfferRow & {
    berater: TeamMemberRow | null;
    lead: LeadRow | null;
};
export type CallWithAnalysis = CallRow & {
    analysis: CallAnalysisRow | null;
    teamMember: TeamMemberRow | null;
};
export type InvoiceWithOffer = InvoiceRow & {
    offer: OfferRow | null;
};
export type NavigationItem = {
    key: string;
    label: string;
    href: string;
    icon: string;
    requiredPermission: string | null;
};
export type NavigationSection = {
    key: string;
    title: string;
    items: NavigationItem[];
};
/**
 * Platform navigation structure — "Prozesshaus" (Process House).
 * Items are shown/hidden based on the user's permissions.
 */
export declare const navigationSections: NavigationSection[];
/** Flat list of all navigation items (for lookups) */
export declare const navigationItems: NavigationItem[];
/** Settings nav item — shown separately for admins */
export declare const settingsNavItem: NavigationItem;
//# sourceMappingURL=domain.d.ts.map