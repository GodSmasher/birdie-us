"use strict";
// =============================================================================
// Enura Platform — Mock DataAccess Implementation
// Uses seed data for development and testing without a live database
// =============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockDataAccess = createMockDataAccess;
const seed_data_js_1 = require("./seed-data.js");
// Demo data for development and testing
const reonic_data_js_1 = require("./reonic-data.js");
// Use demo data instead of minimal seed data
const seedTeamMembers = reonic_data_js_1.realTeamMembers;
const seedLeads = reonic_data_js_1.realLeads;
const seedOffers = reonic_data_js_1.realOffers;
const seedConnectors = reonic_data_js_1.realConnectors;
const seedKpiSnapshots = reonic_data_js_1.realKpiSnapshots;
// ---------------------------------------------------------------------------
// Helper — async delay to simulate real data access latency
// ---------------------------------------------------------------------------
async function delay() {
    await new Promise((r) => setTimeout(r, 2));
}
// ---------------------------------------------------------------------------
// Helper — clone objects to prevent mutation of seed data
// ---------------------------------------------------------------------------
function clone(obj) {
    return structuredClone(obj);
}
// ---------------------------------------------------------------------------
// Helper — strip undefined values from an object to safely merge with spread
// This prevents exactOptionalPropertyTypes violations when spreading updates
// ---------------------------------------------------------------------------
function stripUndefined(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
            result[key] = value;
        }
    }
    return result;
}
// ---------------------------------------------------------------------------
// Tenants Repository
// ---------------------------------------------------------------------------
function createCompaniesRepository(data) {
    return {
        async findAll() {
            await delay();
            return clone(data);
        },
        async findAllActive() {
            await delay();
            return clone(data.filter((t) => t.status === 'active'));
        },
        async findBySlug(slug) {
            await delay();
            const tenant = data.find((t) => t.slug === slug);
            return tenant ? clone(tenant) : null;
        },
        async findById(id) {
            await delay();
            const tenant = data.find((t) => t.id === id);
            return tenant ? clone(tenant) : null;
        },
        async create(input) {
            await delay();
            const now = new Date().toISOString();
            const newTenant = {
                id: input.id ?? crypto.randomUUID(),
                holding_id: input.holding_id,
                slug: input.slug,
                name: input.name,
                status: input.status ?? 'active',
                created_by: input.created_by ?? null,
                created_at: now,
                updated_at: now,
            };
            data.push(newTenant);
            return clone(newTenant);
        },
        async update(id, input) {
            await delay();
            const idx = data.findIndex((t) => t.id === id);
            if (idx === -1)
                throw new Error(`Tenant not found: ${id}`);
            const current = data[idx];
            const updated = {
                ...current,
                ...stripUndefined(input),
                updated_at: new Date().toISOString(),
            };
            data[idx] = updated;
            return clone(updated);
        },
    };
}
// ---------------------------------------------------------------------------
// Brandings Repository
// ---------------------------------------------------------------------------
function createBrandingsRepository(data) {
    return {
        async findByCompanyId(companyId) {
            await delay();
            const branding = data.find((b) => b.company_id === companyId);
            return branding ? clone(branding) : null;
        },
    };
}
// ---------------------------------------------------------------------------
// Profiles Repository
// ---------------------------------------------------------------------------
function createProfilesRepository(data) {
    return {
        async findById(id) {
            await delay();
            const profile = data.find((p) => p.id === id);
            return profile ? clone(profile) : null;
        },
        async findByCompanyId(companyId) {
            await delay();
            return clone(data.filter((p) => p.company_id === companyId));
        },
        async findByEmail(_email) {
            await delay();
            // In the mock layer we don't have emails on the profile table directly;
            // this would normally join with auth.users. Return null for mocks.
            return null;
        },
        async create(input) {
            await delay();
            const now = new Date().toISOString();
            const newProfile = {
                id: input.id,
                company_id: input.company_id ?? null,
                holding_id: '00000000-0000-0000-0000-000000000010',
                first_name: input.first_name ?? null,
                last_name: input.last_name ?? null,
                display_name: [input.first_name, input.last_name].filter(Boolean).join(' ') || 'Unknown',
                avatar_url: input.avatar_url ?? null,
                phone: input.phone ?? null,
                locale: input.locale ?? 'de-CH',
                must_reset_password: input.must_reset_password ?? true,
                password_reset_at: null,
                totp_enabled: input.totp_enabled ?? false,
                totp_enrolled_at: null,
                last_sign_in_at: null,
                is_active: true,
                created_at: now,
                updated_at: now,
            };
            data.push(newProfile);
            return clone(newProfile);
        },
        async update(id, input) {
            await delay();
            const idx = data.findIndex((p) => p.id === id);
            if (idx === -1)
                throw new Error(`Profile not found: ${id}`);
            const current = data[idx];
            const merged = {
                ...current,
                ...stripUndefined(input),
            };
            const updated = {
                ...merged,
                // Recompute display_name if name fields changed
                display_name: [
                    input.first_name !== undefined ? input.first_name : current.first_name,
                    input.last_name !== undefined ? input.last_name : current.last_name,
                ]
                    .filter(Boolean)
                    .join(' ') || 'Unknown',
                updated_at: new Date().toISOString(),
            };
            data[idx] = updated;
            return clone(updated);
        },
    };
}
// ---------------------------------------------------------------------------
// Roles Repository
// ---------------------------------------------------------------------------
function createRolesRepository(rolesData, profileRolesData, rolePermissionsData, permissionsData) {
    return {
        async findByProfileId(profileId) {
            await delay();
            const prLinks = profileRolesData.filter((pr) => pr.profile_id === profileId);
            const roleIds = new Set(prLinks.map((pr) => pr.role_id));
            return clone(rolesData.filter((r) => roleIds.has(r.id)));
        },
        async findByCompanyId(companyId) {
            await delay();
            return clone(rolesData.filter((r) => r.company_id === companyId));
        },
        async getPermissions(roleId) {
            await delay();
            const rpLinks = rolePermissionsData.filter((rp) => rp.role_id === roleId);
            const permIds = new Set(rpLinks.map((rp) => rp.permission_id));
            return permissionsData.filter((p) => permIds.has(p.id)).map((p) => p.key);
        },
    };
}
// ---------------------------------------------------------------------------
// Leads Repository
// ---------------------------------------------------------------------------
function createLeadsRepository(data) {
    return {
        async findMany(companyId, opts) {
            await delay();
            let filtered = data.filter((l) => l.company_id === companyId);
            if (opts?.status) {
                filtered = filtered.filter((l) => l.status === opts.status);
            }
            if (opts?.setterId) {
                filtered = filtered.filter((l) => l.setter_id === opts.setterId);
            }
            return clone(filtered);
        },
        async findPaginated(companyId, opts) {
            const all = await this.findMany(companyId, opts);
            const page = opts?.page ?? 1;
            const pageSize = opts?.pageSize ?? 50;
            const start = (page - 1) * pageSize;
            return {
                data: all.slice(start, start + pageSize),
                total: all.length,
                page,
                pageSize,
                totalPages: Math.ceil(all.length / pageSize),
            };
        },
        async count(companyId, opts) {
            await delay();
            let filtered = data.filter((l) => l.company_id === companyId);
            if (opts?.status)
                filtered = filtered.filter((l) => l.status === opts.status);
            return filtered.length;
        },
        async findById(companyId, id) {
            await delay();
            const lead = data.find((l) => l.id === id && l.company_id === companyId);
            return lead ? clone(lead) : null;
        },
        async create(companyId, input) {
            await delay();
            const now = new Date().toISOString();
            const newLead = {
                id: input.id ?? crypto.randomUUID(),
                company_id: companyId,
                holding_id: '00000000-0000-0000-0000-000000000010',
                external_id: input.external_id ?? null,
                first_name: input.first_name ?? null,
                last_name: input.last_name ?? null,
                email: input.email ?? null,
                phone: input.phone ?? null,
                address_street: input.address_street ?? null,
                address_zip: input.address_zip ?? null,
                address_city: input.address_city ?? null,
                address_canton: input.address_canton ?? null,
                status: input.status ?? 'new',
                source: input.source ?? 'other',
                setter_id: input.setter_id ?? null,
                notes: input.notes ?? null,
                qualified_at: null,
                created_at: now,
                updated_at: now,
            };
            data.push(newLead);
            return clone(newLead);
        },
        async update(companyId, id, input) {
            await delay();
            const idx = data.findIndex((l) => l.id === id && l.company_id === companyId);
            if (idx === -1)
                throw new Error(`Lead not found: ${id}`);
            const updated = {
                ...data[idx],
                ...stripUndefined(input),
                updated_at: new Date().toISOString(),
            };
            data[idx] = updated;
            return clone(updated);
        },
    };
}
// ---------------------------------------------------------------------------
// Offers Repository
// ---------------------------------------------------------------------------
function createOffersRepository(data) {
    return {
        async findMany(companyId, opts) {
            await delay();
            let filtered = data.filter((o) => o.company_id === companyId);
            if (opts?.status) {
                filtered = filtered.filter((o) => o.status === opts.status);
            }
            if (opts?.beraterId) {
                filtered = filtered.filter((o) => o.berater_id === opts.beraterId);
            }
            return clone(filtered);
        },
        async findPaginated(companyId, opts) {
            await delay();
            let filtered = data.filter((o) => o.company_id === companyId);
            if (opts?.status)
                filtered = filtered.filter((o) => o.status === opts.status);
            if (opts?.beraterId)
                filtered = filtered.filter((o) => o.berater_id === opts.beraterId);
            if (opts?.minAmountChf)
                filtered = filtered.filter((o) => Number(o.amount_chf) > 0);
            filtered.sort((a, b) => new Date(b.updated_at ?? b.created_at).getTime() - new Date(a.updated_at ?? a.created_at).getTime());
            const page = opts?.page ?? 1;
            const pageSize = opts?.pageSize ?? 50;
            const total = filtered.length;
            const start = (page - 1) * pageSize;
            return { data: clone(filtered.slice(start, start + pageSize)), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
        },
        async count(companyId, opts) {
            await delay();
            let filtered = data.filter((o) => o.company_id === companyId);
            if (opts?.status)
                filtered = filtered.filter((o) => o.status === opts.status);
            return filtered.length;
        },
        async sumAmountChf(companyId, opts) {
            await delay();
            let filtered = data.filter((o) => o.company_id === companyId);
            if (opts?.excludeStatus) {
                filtered = filtered.filter((o) => !opts.excludeStatus.includes(o.status));
            }
            return filtered.reduce((sum, o) => sum + (Number(o.amount_chf) || 0), 0);
        },
        async findById(companyId, id) {
            await delay();
            const offer = data.find((o) => o.id === id && o.company_id === companyId);
            return offer ? clone(offer) : null;
        },
        async create(companyId, input) {
            await delay();
            const now = new Date().toISOString();
            const newOffer = {
                id: input.id ?? crypto.randomUUID(),
                company_id: companyId,
                holding_id: '00000000-0000-0000-0000-000000000010',
                external_id: input.external_id ?? null,
                lead_id: input.lead_id ?? null,
                berater_id: input.berater_id ?? null,
                title: input.title,
                description: input.description ?? null,
                amount_chf: input.amount_chf ?? '0.00',
                status: input.status ?? 'draft',
                sent_at: input.sent_at ?? null,
                decided_at: input.decided_at ?? null,
                valid_until: input.valid_until ?? null,
                created_at: now,
                updated_at: now,
            };
            data.push(newOffer);
            return clone(newOffer);
        },
        async update(companyId, id, input) {
            await delay();
            const idx = data.findIndex((o) => o.id === id && o.company_id === companyId);
            if (idx === -1)
                throw new Error(`Offer not found: ${id}`);
            const updated = {
                ...data[idx],
                ...stripUndefined(input),
                updated_at: new Date().toISOString(),
            };
            data[idx] = updated;
            return clone(updated);
        },
    };
}
// ---------------------------------------------------------------------------
// Calls Repository
// ---------------------------------------------------------------------------
function createCallsRepository(callsData, analysesData) {
    return {
        async findMany(companyId, opts) {
            await delay();
            let filtered = callsData.filter((c) => c.company_id === companyId);
            if (opts?.teamMemberId) {
                filtered = filtered.filter((c) => c.team_member_id === opts.teamMemberId);
            }
            if (opts?.status) {
                filtered = filtered.filter((c) => c.status === opts.status);
            }
            return clone(filtered);
        },
        async findById(companyId, id) {
            await delay();
            const call = callsData.find((c) => c.id === id && c.company_id === companyId);
            return call ? clone(call) : null;
        },
        async getAnalysis(companyId, callId) {
            await delay();
            const analysis = analysesData.find((a) => a.call_id === callId && a.company_id === companyId);
            return analysis ? clone(analysis) : null;
        },
    };
}
// ---------------------------------------------------------------------------
// Projects Repository
// ---------------------------------------------------------------------------
function createProjectsRepository(data) {
    return {
        async findMany(companyId, opts) {
            await delay();
            let filtered = data.filter((p) => p.company_id === companyId);
            if (opts?.phaseId) {
                filtered = filtered.filter((p) => p.phase_id === opts.phaseId);
            }
            if (opts?.status) {
                filtered = filtered.filter((p) => p.status === opts.status);
            }
            return clone(filtered);
        },
        async findById(companyId, id) {
            await delay();
            const project = data.find((p) => p.id === id && p.company_id === companyId);
            return project ? clone(project) : null;
        },
        async create(companyId, input) {
            await delay();
            const now = new Date().toISOString();
            const newProject = {
                id: input.id ?? crypto.randomUUID(),
                company_id: companyId,
                holding_id: '00000000-0000-0000-0000-000000000010',
                external_id: input.external_id ?? null,
                lead_id: input.lead_id ?? null,
                offer_id: input.offer_id ?? null,
                berater_id: input.berater_id ?? null,
                title: input.title,
                customer_name: input.customer_name,
                address_street: input.address_street ?? null,
                address_zip: input.address_zip ?? null,
                address_city: input.address_city ?? null,
                phase_id: input.phase_id ?? null,
                status: input.status ?? 'active',
                phase_entered_at: now,
                installation_date: input.installation_date ?? null,
                completion_date: null,
                description: null,
                project_value: null,
                system_size_kwp: null,
                project_start_date: null,
                notes: input.notes ?? null,
                created_at: now,
                updated_at: now,
            };
            data.push(newProject);
            return clone(newProject);
        },
        async update(companyId, id, input) {
            await delay();
            const idx = data.findIndex((p) => p.id === id && p.company_id === companyId);
            if (idx === -1)
                throw new Error(`Project not found: ${id}`);
            const current = data[idx];
            const updated = {
                ...current,
                ...stripUndefined(input),
                phase_entered_at: input.phase_id !== undefined && input.phase_id !== current.phase_id
                    ? new Date().toISOString()
                    : current.phase_entered_at,
                updated_at: new Date().toISOString(),
            };
            data[idx] = updated;
            return clone(updated);
        },
    };
}
// ---------------------------------------------------------------------------
// Invoices Repository
// ---------------------------------------------------------------------------
function createInvoicesRepository(data) {
    return {
        async findMany(companyId, opts) {
            await delay();
            let filtered = data.filter((inv) => inv.company_id === companyId);
            if (opts?.status) {
                filtered = filtered.filter((inv) => inv.status === opts.status);
            }
            return clone(filtered);
        },
        async findById(companyId, id) {
            await delay();
            const invoice = data.find((inv) => inv.id === id && inv.company_id === companyId);
            return invoice ? clone(invoice) : null;
        },
        async create(companyId, input) {
            await delay();
            const now = new Date().toISOString();
            const newInvoice = {
                id: input.id ?? crypto.randomUUID(),
                company_id: companyId,
                holding_id: '00000000-0000-0000-0000-000000000010',
                external_id: input.external_id ?? null,
                offer_id: input.offer_id ?? null,
                invoice_number: input.invoice_number,
                customer_name: input.customer_name,
                amount_chf: input.amount_chf,
                tax_chf: input.tax_chf ?? '0.00',
                total_chf: input.total_chf,
                status: input.status ?? 'draft',
                issued_at: input.issued_at,
                due_at: input.due_at,
                paid_at: null,
                created_at: now,
                updated_at: now,
            };
            data.push(newInvoice);
            return clone(newInvoice);
        },
        async update(companyId, id, input) {
            await delay();
            const idx = data.findIndex((inv) => inv.id === id && inv.company_id === companyId);
            if (idx === -1)
                throw new Error(`Invoice not found: ${id}`);
            const updated = {
                ...data[idx],
                ...stripUndefined(input),
                updated_at: new Date().toISOString(),
            };
            data[idx] = updated;
            return clone(updated);
        },
    };
}
// ---------------------------------------------------------------------------
// KPI Repository
// ---------------------------------------------------------------------------
function createKpiRepository(data) {
    return {
        async findLatest(companyId, snapshotType, entityId) {
            await delay();
            const filtered = data
                .filter((s) => s.company_id === companyId && s.snapshot_type === snapshotType)
                .filter((s) => (entityId ? s.entity_id === entityId : true))
                .sort((a, b) => b.period_date.localeCompare(a.period_date));
            const first = filtered[0];
            return first ? clone(first) : null;
        },
    };
}
// ---------------------------------------------------------------------------
// Team Members Repository
// ---------------------------------------------------------------------------
function createTeamMembersRepository(data) {
    return {
        async findByCompanyId(companyId) {
            await delay();
            return clone(data.filter((tm) => tm.company_id === companyId));
        },
        async findById(companyId, id) {
            await delay();
            const member = data.find((tm) => tm.id === id && tm.company_id === companyId);
            return member ? clone(member) : null;
        },
    };
}
// ---------------------------------------------------------------------------
// Connectors Repository
// ---------------------------------------------------------------------------
function createConnectorsRepository(data) {
    return {
        async findByCompanyId(companyId) {
            await delay();
            return clone(data.filter((c) => c.company_id === companyId));
        },
    };
}
// ---------------------------------------------------------------------------
// Phase Definitions Repository
// ---------------------------------------------------------------------------
function createPhaseDefinitionsRepository(data) {
    return {
        async findByCompanyId(companyId) {
            await delay();
            return clone(data.filter((pd) => pd.company_id === companyId).sort((a, b) => a.phase_number - b.phase_number));
        },
    };
}
// ---------------------------------------------------------------------------
// Factory — createMockDataAccess
// ---------------------------------------------------------------------------
function createMockDataAccess() {
    // Clone seed data so each mock instance operates on its own copy
    const tenantsData = clone(seed_data_js_1.tenants);
    const brandingsData = clone(seed_data_js_1.tenantBrandings);
    const profilesData = clone(seed_data_js_1.profiles);
    const rolesData = clone(seed_data_js_1.roles);
    const rolePermsData = clone(seed_data_js_1.rolePermissions);
    const profileRolesData = clone(seed_data_js_1.profileRoles);
    const permissionsData = clone(seed_data_js_1.permissions);
    const teamMembersData = clone(seedTeamMembers);
    const leadsData = clone(seedLeads);
    const offersData = clone(seedOffers);
    const callsData = clone(seed_data_js_1.calls);
    const callAnalysesData = clone(seed_data_js_1.callAnalyses);
    const projectsData = clone(seed_data_js_1.projects);
    const phasesData = clone(seed_data_js_1.phaseDefinitions);
    const invoicesData = clone(seed_data_js_1.invoices);
    const connectorsData = clone(seedConnectors);
    const kpiData = clone(seedKpiSnapshots);
    return {
        companies: createCompaniesRepository(tenantsData),
        brandings: createBrandingsRepository(brandingsData),
        profiles: createProfilesRepository(profilesData),
        roles: createRolesRepository(rolesData, profileRolesData, rolePermsData, permissionsData),
        leads: createLeadsRepository(leadsData),
        offers: createOffersRepository(offersData),
        calls: createCallsRepository(callsData, callAnalysesData),
        projects: createProjectsRepository(projectsData),
        invoices: createInvoicesRepository(invoicesData),
        kpis: createKpiRepository(kpiData),
        teamMembers: createTeamMembersRepository(teamMembersData),
        connectors: createConnectorsRepository(connectorsData),
        phaseDefinitions: createPhaseDefinitionsRepository(phasesData),
    };
}
//# sourceMappingURL=mock-data-access.js.map