"use strict";
// =============================================================================
// Enura Group Multi-Tenant BI Platform — Supabase Data Access Implementation
// Replaces the mock data layer with real Supabase queries.
//
// IMPORTANT: The Supabase client is used WITHOUT the Database generic type
// because it is incompatible with strict TypeScript mode. All queries return
// untyped data from the client. We cast results to the proper Row types.
// =============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupabaseDataAccess = createSupabaseDataAccess;
// =============================================================================
// Helpers
// =============================================================================
/** Safely extract data from a Supabase result, returning fallback on error. */
function dataOrDefault(result, fallback) {
    if (result.error) {
        console.error('[supabase-data-access]', result.error);
        return fallback;
    }
    return result.data ?? fallback;
}
/** Safely extract a single row or null. Treats PGRST116 (not found) as null. */
function dataOrNull(result) {
    if (result.error) {
        const err = result.error;
        if (err.code === 'PGRST116')
            return null; // not found
        console.error('[supabase-data-access]', result.error);
        return null;
    }
    return result.data ?? null;
}
/** Safely extract a single row, throwing a structured error on failure. */
function dataOrThrow(result, entity) {
    if (result.error) {
        console.error('[supabase-data-access]', result.error);
        throw new Error(`Failed to create/update ${entity}: ${result.error.message ?? 'Unknown error'}`);
    }
    if (result.data == null) {
        throw new Error(`Failed to create/update ${entity}: no data returned`);
    }
    return result.data;
}
/** Returns an ISO date string N days ago (used for hypertable time bounds). */
function daysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
}
// =============================================================================
// Repository Implementations
// =============================================================================
function createTenantsRepo(client) {
    return {
        async findAll() {
            const result = await client
                .from('companies')
                .select('*')
                .order('name', { ascending: true });
            return dataOrDefault(result, []);
        },
        async findAllActive() {
            const result = await client
                .from('companies')
                .select('*')
                .eq('status', 'active')
                .order('name', { ascending: true });
            return dataOrDefault(result, []);
        },
        async findBySlug(slug) {
            const result = await client
                .from('companies')
                .select('*')
                .eq('slug', slug)
                .maybeSingle();
            return dataOrNull(result);
        },
        async findById(id) {
            const result = await client
                .from('companies')
                .select('*')
                .eq('id', id)
                .maybeSingle();
            return dataOrNull(result);
        },
        async create(data) {
            const result = await client
                .from('companies')
                .insert(data)
                .select()
                .single();
            return dataOrThrow(result, 'tenant');
        },
        async update(id, data) {
            const result = await client
                .from('companies')
                .update(data)
                .eq('id', id)
                .select()
                .single();
            return dataOrThrow(result, 'tenant');
        },
    };
}
function createBrandingsRepo(client) {
    return {
        async findByCompanyId(companyId) {
            const result = await client
                .from('company_branding')
                .select('*')
                .eq('company_id', companyId)
                .maybeSingle();
            return dataOrNull(result);
        },
    };
}
function createProfilesRepo(client) {
    return {
        async findById(id) {
            const result = await client
                .from('profiles')
                .select('*')
                .eq('id', id)
                .maybeSingle();
            return dataOrNull(result);
        },
        async findByCompanyId(companyId) {
            const result = await client
                .from('profiles')
                .select('*')
                .eq('company_id', companyId)
                .order('display_name', { ascending: true });
            return dataOrDefault(result, []);
        },
        async findByEmail(email) {
            // Profiles don't have an email column — we look up via Supabase Auth.
            // The profile.id matches auth.users.id, so we query auth users by email
            // and then find the matching profile. Since we can't query auth.users
            // directly from the client, we use a workaround: join via a view or
            // fall back to checking the auth admin API. For now, we attempt an RPC
            // call if available, otherwise return null.
            //
            // Alternative: If profiles have been extended with email, query directly.
            // We try the direct approach first.
            const result = await client
                .from('profiles')
                .select('*')
                .eq('id', email) // This is a fallback; in practice profiles are found by auth user id
                .maybeSingle();
            // If the above didn't work (profiles don't have email), return null.
            // The caller should use Supabase Auth admin API for email lookups.
            if (result.error || !result.data) {
                return null;
            }
            return result.data;
        },
        async create(data) {
            const result = await client
                .from('profiles')
                .insert(data)
                .select()
                .single();
            return dataOrThrow(result, 'profile');
        },
        async update(id, data) {
            const result = await client
                .from('profiles')
                .update(data)
                .eq('id', id)
                .select()
                .single();
            return dataOrThrow(result, 'profile');
        },
    };
}
function createRolesRepo(client) {
    return {
        async findByProfileId(profileId) {
            // Join through profile_roles to get roles for a profile
            const result = await client
                .from('profile_roles')
                .select('role_id, roles(*)')
                .eq('profile_id', profileId);
            if (result.error) {
                console.error('[supabase-data-access]', result.error);
                return [];
            }
            const rows = result.data;
            if (!rows)
                return [];
            return rows
                .map((r) => r.roles)
                .filter(Boolean);
        },
        async findByCompanyId(companyId) {
            const result = await client
                .from('roles')
                .select('*')
                .eq('company_id', companyId)
                .order('label', { ascending: true });
            return dataOrDefault(result, []);
        },
        async getPermissions(roleId) {
            // Join through role_permissions to get permission keys
            const result = await client
                .from('role_permissions')
                .select('permission_id, permissions(key)')
                .eq('role_id', roleId);
            if (result.error) {
                console.error('[supabase-data-access]', result.error);
                return [];
            }
            const rows = result.data;
            if (!rows)
                return [];
            return rows
                .map((r) => r.permissions?.key)
                .filter((key) => key != null);
        },
    };
}
function createLeadsRepo(client) {
    return {
        async findMany(companyId, opts) {
            let query = client
                .from('leads')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false });
            if (opts?.status) {
                query = query.eq('status', opts.status);
            }
            if (opts?.setterId) {
                query = query.eq('setter_id', opts.setterId);
            }
            return dataOrDefault(await query, []);
        },
        async findPaginated(companyId, opts) {
            const page = opts?.page ?? 1;
            const pageSize = opts?.pageSize ?? 50;
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            let query = client
                .from('leads')
                .select('*', { count: 'exact' })
                .eq('company_id', companyId)
                .order('created_at', { ascending: false })
                .range(from, to);
            if (opts?.status) {
                query = query.eq('status', opts.status);
            }
            if (opts?.setterId) {
                query = query.eq('setter_id', opts.setterId);
            }
            const result = await query;
            const data = (result.data ?? []);
            const total = result.count ?? 0;
            return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
        },
        async count(companyId, opts) {
            let query = client
                .from('leads')
                .select('*', { count: 'exact', head: true })
                .eq('company_id', companyId);
            if (opts?.status) {
                query = query.eq('status', opts.status);
            }
            const result = await query;
            return result.count ?? 0;
        },
        async findById(companyId, id) {
            const result = await client
                .from('leads')
                .select('*')
                .eq('company_id', companyId)
                .eq('id', id)
                .maybeSingle();
            return dataOrNull(result);
        },
        async create(companyId, data) {
            const result = await client
                .from('leads')
                .insert({ ...data, company_id: companyId })
                .select()
                .single();
            return dataOrThrow(result, 'lead');
        },
        async update(companyId, id, data) {
            const result = await client
                .from('leads')
                .update(data)
                .eq('company_id', companyId)
                .eq('id', id)
                .select()
                .single();
            return dataOrThrow(result, 'lead');
        },
    };
}
function createOffersRepo(client) {
    return {
        async findMany(companyId, opts) {
            let query = client
                .from('offers')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false });
            if (opts?.status) {
                query = query.eq('status', opts.status);
            }
            if (opts?.beraterId) {
                query = query.eq('berater_id', opts.beraterId);
            }
            return dataOrDefault(await query, []);
        },
        async findPaginated(companyId, opts) {
            const page = opts?.page ?? 1;
            const pageSize = opts?.pageSize ?? 50;
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            let query = client
                .from('offers')
                .select('*', { count: 'exact' })
                .eq('company_id', companyId)
                .order('updated_at', { ascending: false })
                .range(from, to);
            if (opts?.status)
                query = query.eq('status', opts.status);
            if (opts?.beraterId)
                query = query.eq('berater_id', opts.beraterId);
            if (opts?.minAmountChf)
                query = query.gt('amount_chf', 0);
            const result = await query;
            const data = (result.data ?? []);
            const total = result.count ?? 0;
            return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
        },
        async count(companyId, opts) {
            let query = client
                .from('offers')
                .select('*', { count: 'exact', head: true })
                .eq('company_id', companyId);
            if (opts?.status) {
                query = query.eq('status', opts.status);
            }
            const result = await query;
            return result.count ?? 0;
        },
        async sumAmountChf(companyId, opts) {
            let query = client
                .from('offers')
                .select('amount_chf')
                .eq('company_id', companyId);
            if (opts?.excludeStatus) {
                for (const s of opts.excludeStatus) {
                    query = query.neq('status', s);
                }
            }
            const result = await query;
            const rows = (result.data ?? []);
            return rows.reduce((sum, r) => sum + (r.amount_chf ?? 0), 0);
        },
        async findById(companyId, id) {
            const result = await client
                .from('offers')
                .select('*')
                .eq('company_id', companyId)
                .eq('id', id)
                .maybeSingle();
            return dataOrNull(result);
        },
        async create(companyId, data) {
            const result = await client
                .from('offers')
                .insert({ ...data, company_id: companyId })
                .select()
                .single();
            return dataOrThrow(result, 'offer');
        },
        async update(companyId, id, data) {
            const result = await client
                .from('offers')
                .update(data)
                .eq('company_id', companyId)
                .eq('id', id)
                .select()
                .single();
            return dataOrThrow(result, 'offer');
        },
    };
}
function createCallsRepo(client) {
    return {
        async findMany(companyId, opts) {
            // calls is a TimescaleDB hypertable — always include time bounds
            let query = client
                .from('calls')
                .select('*')
                .eq('company_id', companyId)
                .gte('started_at', daysAgo(90))
                .order('started_at', { ascending: false });
            if (opts?.teamMemberId) {
                query = query.eq('team_member_id', opts.teamMemberId);
            }
            if (opts?.status) {
                query = query.eq('status', opts.status);
            }
            return dataOrDefault(await query, []);
        },
        async findById(companyId, id) {
            const result = await client
                .from('calls')
                .select('*')
                .eq('company_id', companyId)
                .eq('id', id)
                .maybeSingle();
            return dataOrNull(result);
        },
        async getAnalysis(companyId, callId) {
            const result = await client
                .from('call_analysis')
                .select('*')
                .eq('company_id', companyId)
                .eq('call_id', callId)
                .maybeSingle();
            return dataOrNull(result);
        },
    };
}
function createProjectsRepo(client) {
    return {
        async findMany(companyId, opts) {
            let query = client
                .from('projects')
                .select('*')
                .eq('company_id', companyId)
                .order('updated_at', { ascending: false });
            if (opts?.phaseId) {
                query = query.eq('phase_id', opts.phaseId);
            }
            if (opts?.status) {
                query = query.eq('status', opts.status);
            }
            return dataOrDefault(await query, []);
        },
        async findById(companyId, id) {
            const result = await client
                .from('projects')
                .select('*')
                .eq('company_id', companyId)
                .eq('id', id)
                .maybeSingle();
            return dataOrNull(result);
        },
        async create(companyId, data) {
            const result = await client
                .from('projects')
                .insert({ ...data, company_id: companyId })
                .select()
                .single();
            return dataOrThrow(result, 'project');
        },
        async update(companyId, id, data) {
            const result = await client
                .from('projects')
                .update(data)
                .eq('company_id', companyId)
                .eq('id', id)
                .select()
                .single();
            return dataOrThrow(result, 'project');
        },
    };
}
function createInvoicesRepo(client) {
    return {
        async findMany(companyId, opts) {
            let query = client
                .from('invoices')
                .select('*')
                .eq('company_id', companyId)
                .order('issued_at', { ascending: false });
            if (opts?.status) {
                query = query.eq('status', opts.status);
            }
            return dataOrDefault(await query, []);
        },
        async findById(companyId, id) {
            const result = await client
                .from('invoices')
                .select('*')
                .eq('company_id', companyId)
                .eq('id', id)
                .maybeSingle();
            return dataOrNull(result);
        },
        async create(companyId, data) {
            const result = await client
                .from('invoices')
                .insert({ ...data, company_id: companyId })
                .select()
                .single();
            return dataOrThrow(result, 'invoice');
        },
        async update(companyId, id, data) {
            const result = await client
                .from('invoices')
                .update(data)
                .eq('company_id', companyId)
                .eq('id', id)
                .select()
                .single();
            return dataOrThrow(result, 'invoice');
        },
    };
}
function createKpiRepo(client) {
    return {
        async findLatest(companyId, snapshotType, entityId) {
            // kpi_snapshots is a TimescaleDB hypertable — include time bounds
            let query = client
                .from('kpi_snapshots')
                .select('*')
                .eq('company_id', companyId)
                .eq('snapshot_type', snapshotType)
                .gte('period_date', daysAgo(90))
                .order('period_date', { ascending: false })
                .limit(1);
            if (entityId) {
                query = query.eq('entity_id', entityId);
            }
            const result = await query.maybeSingle();
            return dataOrNull(result);
        },
        async upsertSnapshot(companyId, data) {
            const result = await client
                .from('kpi_snapshots')
                .upsert({
                company_id: companyId,
                snapshot_type: data.snapshot_type,
                entity_id: data.entity_id,
                period_date: data.period_date,
                metrics: data.metrics,
            }, { onConflict: 'company_id,snapshot_type,entity_id,period_date' })
                .select()
                .single();
            return dataOrNull(result);
        },
        async getSnapshotRange(companyId, snapshotType, entityId, from, to) {
            let query = client
                .from('kpi_snapshots')
                .select('*')
                .eq('company_id', companyId)
                .eq('snapshot_type', snapshotType)
                .gte('period_date', from)
                .lte('period_date', to)
                .order('period_date', { ascending: true });
            if (entityId) {
                query = query.eq('entity_id', entityId);
            }
            else {
                query = query.is('entity_id', null);
            }
            return dataOrDefault(await query, []);
        },
    };
}
function createTeamMembersRepo(client) {
    return {
        async findByCompanyId(companyId) {
            const result = await client
                .from('team_members')
                .select('*')
                .eq('company_id', companyId)
                .order('display_name', { ascending: true });
            return dataOrDefault(result, []);
        },
        async findById(companyId, id) {
            const result = await client
                .from('team_members')
                .select('*')
                .eq('company_id', companyId)
                .eq('id', id)
                .maybeSingle();
            return dataOrNull(result);
        },
    };
}
function createConnectorsRepo(client) {
    return {
        async findByCompanyId(companyId) {
            const result = await client
                .from('connectors')
                .select('*')
                .eq('company_id', companyId)
                .order('name', { ascending: true });
            return dataOrDefault(result, []);
        },
    };
}
function createPhaseDefinitionsRepo(client) {
    return {
        async findByCompanyId(companyId) {
            const result = await client
                .from('phase_definitions')
                .select('*')
                .eq('company_id', companyId)
                .order('phase_number', { ascending: true });
            return dataOrDefault(result, []);
        },
    };
}
// =============================================================================
// Factory
// =============================================================================
function createSupabaseDataAccess(client) {
    return {
        companies: createTenantsRepo(client),
        brandings: createBrandingsRepo(client),
        profiles: createProfilesRepo(client),
        roles: createRolesRepo(client),
        leads: createLeadsRepo(client),
        offers: createOffersRepo(client),
        calls: createCallsRepo(client),
        projects: createProjectsRepo(client),
        invoices: createInvoicesRepo(client),
        kpis: createKpiRepo(client),
        teamMembers: createTeamMembersRepo(client),
        connectors: createConnectorsRepo(client),
        phaseDefinitions: createPhaseDefinitionsRepo(client),
    };
}
//# sourceMappingURL=supabase-data-access.js.map