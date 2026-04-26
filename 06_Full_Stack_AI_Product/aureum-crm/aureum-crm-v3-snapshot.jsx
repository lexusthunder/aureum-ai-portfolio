import { useState, useEffect, useCallback } from "react";

// ================================================================
// AUREUM CRM v3 — LUXURY REAL ESTATE SAAS
// Supabase-ready | 13 Modules | AI-Powered | Multi-tenant
// Built by: Alex Ureche | © 2026 Aureum AI
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SWOT vs COMPETITORS — WHY AUREUM WINS:
//
// SALESFORCE:  $300/user/mo, complex, generic UI → Aureum: €200/mo flat, luxury UX, real estate DNA
// HUBSPOT:     Marketing-first, no property engine → Aureum: Property-Lead DNA Match™ built in
// ZOHO:        Cluttered, no luxury feel          → Aureum: Burj Khalifa aesthetic, white-glove UX
// PIPEDRIVE:   Good pipeline, zero AI             → Aureum: Wealth Intelligence Score™ + Ghost Alerts™
// REX:         Real estate but basic, no AI       → Aureum: Full AI engine + Automation + Forecasting
//
// PATENTABLE INNOVATIONS™:
// 1. Wealth Intelligence Score (WIS)™     — Multi-signal wealth scoring engine
// 2. Property-Lead DNA Match™             — Lifestyle + preference compatibility algorithm
// 3. Ghost Buyer Alert™                   — Predicts lead going cold before it happens
// 4. Luxury Timeline Predictor™           — Optimal buy-timing prediction per lead
// 5. Concierge Automation Engine™         — Automations that feel handwritten, not robotic
// 6. Commission Velocity Index™           — Weighted pipeline forecast with deal momentum
// 7. White Glove Inbox™                   — Unified Email/WhatsApp/SMS with AI draft suggestions
// ================================================================

// ================================================================
// SUPABASE CONFIG — Replace with real credentials tomorrow
// ================================================================
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY_HERE";
const DEMO_MODE = true; // Set to false when Supabase is connected

// Lightweight Supabase client (no external library needed)
// SUPABASE TABLES NEEDED:
//   tenants(id, name, plan, logo_url, gold_color, created_at)
//   users(id, tenant_id, email, full_name, role, avatar_url, created_at)
//   leads(id, tenant_id, first_name, last_name, email, phone, company, source, status, priority, ai_score, wis_score, budget_min, budget_max, currency, nationality, notes, last_contact_at, created_at)
//   properties(id, tenant_id, title, type, city, country, price, currency, bedrooms, bathrooms, area_sqm, rating, is_featured, description, images, created_at)
//   deals(id, tenant_id, lead_id, property_id, title, stage, value, commission_rate, probability, agent_id, notes, created_at, expected_close_at)
//   activities(id, tenant_id, lead_id, deal_id, type, subject, body, direction, created_by, created_at)
//   automations(id, tenant_id, name, trigger, steps, is_active, runs_count, created_at)
//   appointments(id, tenant_id, lead_id, property_id, agent_id, type, scheduled_at, notes, status, created_at)
//   documents(id, tenant_id, deal_id, name, type, status, url, signed_at, created_at)
//   team_members(id, tenant_id, user_id, role, target_deals, commission_split, created_at)

const db = {
  from: (table) => ({
    select: async (cols = "*") => {
      if (DEMO_MODE) return { data: DEMO[table] || [], error: null };
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${cols}`, {
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
        });
        return { data: await res.json(), error: res.ok ? null : "fetch_error" };
      } catch (e) { return { data: [], error: e.message }; }
    },
    insert: async (record) => {
      if (DEMO_MODE) return { data: { ...record, id: Date.now() }, error: null };
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: "POST",
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
          body: JSON.stringify(record)
        });
        return { data: await res.json(), error: res.ok ? null : "insert_error" };
      } catch (e) { return { data: null, error: e.message }; }
    },
    update: async (id, record) => {
      if (DEMO_MODE) return { data: { id, ...record }, error: null };
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
          method: "PATCH",
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
          body: JSON.stringify(record)
        });
        return { data: await res.json(), error: res.ok ? null : "update_error" };
      } catch (e) { return { data: null, error: e.message }; }
    }
  })
};

// ================================================================
// DEMO DATA (mirrors exact Supabase schema)
// ================================================================
const DEMO = {
  tenant: { id: "t1", name: "AUREUM Luxury Properties", plan: "premium", logo_url: null },
  user: { id: "u1", tenant_id: "t1", email: "alex@aureum.ai", full_name: "Alex Ureche", role: "admin" },
  leads: [
    { id: 1, first_name: "Sheikh", last_name: "Al-Rashid", email: "rashid@investuae.com", phone: "+971501234567", company: "Al-Rashid Investments", source: "referral", status: "qualified", priority: "urgent", ai_score: 94, wis_score: 97, budget_min: 5000000, budget_max: 15000000, currency: "EUR", nationality: "UAE", notes: "Looking for trophy asset. Met at DIFC event.", last_contact_at: "2026-04-05T10:00:00", created_at: "2026-02-15T10:00:00", dna_tags: ["waterfront","penthouse","trophy"] },
    { id: 2, first_name: "James", last_name: "Worthington", email: "j.worthington@londoncap.uk", phone: "+447911234567", company: "London Capital Partners", source: "referral", status: "proposal", priority: "high", ai_score: 88, wis_score: 91, budget_min: 3000000, budget_max: 10000000, currency: "EUR", nationality: "UK", notes: "Portfolio investor, prefers Georgian architecture.", last_contact_at: "2026-04-03T14:00:00", created_at: "2026-02-20T14:00:00", dna_tags: ["georgian","townhouse","portfolio"] },
    { id: 3, first_name: "Emma", last_name: "Chen", email: "emma.chen@techcorp.cn", phone: "+8613912345678", company: "TechCorp Shanghai", source: "website", status: "contacted", priority: "high", ai_score: 72, wis_score: 78, budget_min: 800000, budget_max: 2500000, currency: "EUR", nationality: "CN", notes: "Tech executive relocating family to Dublin.", last_contact_at: "2026-03-28T09:00:00", created_at: "2026-03-01T09:00:00", dna_tags: ["apartment","modern","school-nearby"] },
    { id: 4, first_name: "Carlos", last_name: "Rodriguez", email: "carlos@luxhomes.es", phone: "+34612345678", company: "LuxHomes Madrid", source: "portal", status: "new", priority: "medium", ai_score: 61, wis_score: 55, budget_min: 500000, budget_max: 1200000, currency: "EUR", nationality: "ES", notes: "Real estate developer scouting investments.", last_contact_at: "2026-03-15T11:00:00", created_at: "2026-03-10T11:00:00", dna_tags: ["investment","apartment","yield"] },
    { id: 5, first_name: "Sarah", last_name: "O'Brien", email: "sarah.ob@gmail.com", phone: "+353871234567", company: null, source: "social", status: "new", priority: "medium", ai_score: 48, wis_score: 42, budget_min: 300000, budget_max: 700000, currency: "EUR", nationality: "IE", notes: "First luxury purchase. Engaged via Instagram.", last_contact_at: "2026-03-12T16:00:00", created_at: "2026-03-12T16:00:00", dna_tags: ["apartment","starter-luxury"] },
    { id: 6, first_name: "Dmitri", last_name: "Volkov", email: "d.volkov@volkovgroup.ru", phone: "+79161234567", company: "Volkov Group", source: "referral", status: "qualified", priority: "urgent", ai_score: 91, wis_score: 95, budget_min: 8000000, budget_max: 25000000, currency: "EUR", nationality: "RU", notes: "Trophy hunter. Interested in landmark properties.", last_contact_at: "2026-04-06T08:00:00", created_at: "2026-03-20T12:00:00", dna_tags: ["trophy","landmark","private"] },
  ],
  properties: [
    { id: 1, title: "Seafront Villa, Dalkey", type: "villa", city: "Dublin", country: "IE", price: 6200000, currency: "EUR", bedrooms: 5, bathrooms: 4, area_sqm: 380, rating: "B2", is_featured: true, dna_tags: ["waterfront","trophy","penthouse"] },
    { id: 2, title: "Georgian Townhouse, Merrion Square", type: "house", city: "Dublin", country: "IE", price: 4500000, currency: "EUR", bedrooms: 6, bathrooms: 5, area_sqm: 520, rating: "B1", is_featured: true, dna_tags: ["georgian","townhouse","portfolio"] },
    { id: 3, title: "Waterfront Penthouse, Dun Laoghaire", type: "penthouse", city: "Dublin", country: "IE", price: 3100000, currency: "EUR", bedrooms: 4, bathrooms: 3, area_sqm: 310, rating: "A1", is_featured: true, dna_tags: ["waterfront","penthouse","modern"] },
    { id: 4, title: "Penthouse at The Lansdowne", type: "penthouse", city: "Dublin", country: "IE", price: 2850000, currency: "EUR", bedrooms: 3, bathrooms: 3, area_sqm: 245, rating: "A2", is_featured: true, dna_tags: ["penthouse","modern","city-center"] },
    { id: 5, title: "Detached Home, Howth Summit", type: "house", city: "Dublin", country: "IE", price: 1950000, currency: "EUR", bedrooms: 4, bathrooms: 3, area_sqm: 290, rating: "A3", is_featured: false, dna_tags: ["sea-view","family","trophy"] },
    { id: 6, title: "Luxury Apartment, Grand Canal Dock", type: "apartment", city: "Dublin", country: "IE", price: 875000, currency: "EUR", bedrooms: 2, bathrooms: 2, area_sqm: 110, rating: "A1", is_featured: false, dna_tags: ["apartment","modern","school-nearby"] },
    { id: 7, title: "Mews House, Donnybrook", type: "house", city: "Dublin", country: "IE", price: 1350000, currency: "EUR", bedrooms: 3, bathrooms: 2, area_sqm: 165, rating: "C1", is_featured: false, dna_tags: ["investment","yield"] },
    { id: 8, title: "Garden Apartment, Blackrock", type: "apartment", city: "Dublin", country: "IE", price: 725000, currency: "EUR", bedrooms: 2, bathrooms: 2, area_sqm: 95, rating: "A2", is_featured: false, dna_tags: ["apartment","starter-luxury","school-nearby"] },
  ],
  deals: [
    { id: 1, lead_id: 2, property_id: 2, title: "Worthington — Georgian Portfolio", stage: "negotiation", value: 9500000, commission_rate: 1.0, probability: 75, agent_id: "u1", created_at: "2026-03-01", expected_close_at: "2026-05-15" },
    { id: 2, lead_id: 1, property_id: 1, title: "Al-Rashid — Dalkey Villa", stage: "offer", value: 6200000, commission_rate: 1.5, probability: 85, agent_id: "u1", created_at: "2026-03-10", expected_close_at: "2026-04-30" },
    { id: 3, lead_id: 3, property_id: 6, title: "Chen — Grand Canal Apt", stage: "viewing", value: 875000, commission_rate: 2.0, probability: 60, agent_id: "u1", created_at: "2026-03-20", expected_close_at: "2026-06-01" },
    { id: 4, lead_id: 6, property_id: 1, title: "Volkov — Trophy Asset", stage: "discovery", value: 15000000, commission_rate: 1.0, probability: 40, agent_id: "u1", created_at: "2026-04-01", expected_close_at: "2026-07-01" },
  ],
  automations: [
    { id: 1, name: "New Lead — Concierge Welcome", trigger: "lead_created", steps: ["Send welcome email", "Assign AI score", "Schedule intro call in 24h"], is_active: true, runs_count: 47 },
    { id: 2, name: "Ghost Alert — 7 Days No Contact", trigger: "no_contact_7d", steps: ["Send soft re-engagement", "Flag in dashboard", "Alert agent via push"], is_active: true, runs_count: 12 },
    { id: 3, name: "Proposal Sent — Follow Up Sequence", trigger: "deal_stage_proposal", steps: ["Day 1: Elegant follow-up email", "Day 3: Property brochure PDF", "Day 7: Personal call reminder"], is_active: true, runs_count: 8 },
    { id: 4, name: "Deal Won — Celebration + Referral Ask", trigger: "deal_won", steps: ["Send congratulations letter", "Request Google review", "Ask for referral after 30 days"], is_active: false, runs_count: 3 },
  ],
  appointments: [
    { id: 1, lead_id: 1, property_id: 1, type: "viewing", scheduled_at: "2026-04-09T14:00:00", status: "confirmed", notes: "Sheikh arrives with 2 advisors. Champagne prepared." },
    { id: 2, lead_id: 3, property_id: 6, type: "viewing", scheduled_at: "2026-04-10T11:00:00", status: "confirmed", notes: "Emma Chen + husband. Focus on school proximity." },
    { id: 3, lead_id: 2, property_id: 2, type: "negotiation_call", scheduled_at: "2026-04-08T16:00:00", status: "pending", notes: "Final price negotiation." },
    { id: 4, lead_id: 6, property_id: 5, type: "viewing", scheduled_at: "2026-04-12T10:00:00", status: "confirmed", notes: "Volkov personal visit. Private access required." },
  ],
  documents: [
    { id: 1, deal_id: 2, name: "NDA — Al-Rashid", type: "nda", status: "signed", signed_at: "2026-03-15" },
    { id: 2, deal_id: 1, name: "Letter of Intent — Worthington", type: "loi", status: "sent", signed_at: null },
    { id: 3, deal_id: 2, name: "Sale Agreement — Dalkey Villa", type: "contract", status: "draft", signed_at: null },
    { id: 4, deal_id: 3, name: "NDA — Chen Emma", type: "nda", status: "signed", signed_at: "2026-03-22" },
  ],
  inbox: [
    { id: 1, lead_id: 1, channel: "email", direction: "inbound", subject: "Re: Dalkey Villa", body: "I am interested. What is the absolute best price? My advisor will contact you.", created_at: "2026-04-06T08:23:00", read: false },
    { id: 2, lead_id: 6, channel: "whatsapp", direction: "inbound", subject: "WhatsApp", body: "Good morning. I want to see the villa in Howth as well. Can we arrange?", created_at: "2026-04-06T09:15:00", read: false },
    { id: 3, lead_id: 2, channel: "email", direction: "outbound", subject: "Your Portfolio Opportunity", body: "Dear James, as discussed, I am attaching the full portfolio analysis...", created_at: "2026-04-05T14:30:00", read: true },
    { id: 4, lead_id: 3, channel: "email", direction: "inbound", subject: "School districts?", body: "Hello, could you confirm which school catchment areas are nearby the Grand Canal apartment?", created_at: "2026-04-04T11:00:00", read: true },
  ],
  team: [
    { id: 1, name: "Alex Ureche", role: "Senior Agent", deals_closed: 4, revenue_ytd: 145000, target: 300000, conversion_rate: 68 },
    { id: 2, name: "Sofia Marinescu", role: "Agent", deals_closed: 2, revenue_ytd: 67000, target: 200000, conversion_rate: 54 },
    { id: 3, name: "Radu Ionescu", role: "Junior Agent", deals_closed: 1, revenue_ytd: 28000, target: 150000, conversion_rate: 41 },
  ],
  analytics: {
    monthly_revenue: [22000, 18000, 31000, 27000, 45000, 38000, 52000, 44000, 61000, 55000, 78000, 0],
    pipeline_by_stage: { discovery: 15000000, viewing: 875000, offer: 6200000, negotiation: 9500000 },
    leads_by_source: { referral: 3, website: 1, social: 1, portal: 1 },
    conversion_funnel: { new: 2, contacted: 1, qualified: 2, proposal: 1 },
  }
};

// ================================================================
// THEME & CONSTANTS
// ================================================================
const G = "#D4AF37";        // Aureum Gold
const BG = "#0A0A0F";       // Deep black
const CARD = "#0F0F1A";     // Card background
const CARD2 = "#141420";    // Secondary card
const BORDER = "rgba(212,175,55,0.15)";
const TEXT = "#E8E4DE";
const MUTED = "#666";

const STATUS_COLOR = { new: "#64B5F6", contacted: "#FFD740", qualified: "#00E676", proposal: "#BB86FC", negotiation: "#FF9100", won: "#00E676", lost: "#FF5252" };
const STAGE_COLOR = { discovery: "#64B5F6", viewing: "#FFD740", offer: "#FF9100", negotiation: "#BB86FC", legal: "#00BCD4", closed_won: "#00E676", closed_lost: "#FF5252" };
const DOC_COLOR = { draft: "#FFD740", sent: "#64B5F6", signed: "#00E676", expired: "#FF5252" };
const CHANNEL_ICON = { email: "✉", whatsapp: "💬", sms: "📱", call: "📞" };

const fmt = (n) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const fmtM = (n) => n >= 1000000 ? `€${(n / 1000000).toFixed(1)}M` : fmt(n);
const daysSince = (dateStr) => Math.floor((Date.now() - new Date(dateStr)) / 86400000);
const wisColor = (s) => s >= 85 ? "#00E676" : s >= 65 ? "#D4AF37" : s >= 45 ? "#FF9100" : "#FF5252";

// DNA Match Score (patentable algorithm stub)
const dnaDriveMatch = (lead, property) => {
  if (!lead.dna_tags || !property.dna_tags) return 0;
  const matches = lead.dna_tags.filter(t => property.dna_tags.includes(t)).length;
  return Math.min(100, Math.round((matches / Math.max(lead.dna_tags.length, 1)) * 100 + Math.random() * 10));
};

// ================================================================
// SHARED UI COMPONENTS
// ================================================================
const Card = ({ children, style = {} }) => (
  <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, ...style }}>
    {children}
  </div>
);

const Badge = ({ label, color = G }) => (
  <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>
    {label?.toUpperCase()}
  </span>
);

const Btn = ({ children, onClick, variant = "primary", small = false, style = {} }) => (
  <button onClick={onClick} style={{
    background: variant === "primary" ? `linear-gradient(135deg, ${G}, #F5D76E)` : variant === "ghost" ? "transparent" : CARD2,
    color: variant === "primary" ? "#0A0A0F" : TEXT,
    border: variant === "ghost" ? `1px solid ${BORDER}` : "none",
    borderRadius: 8, cursor: "pointer", fontWeight: 700,
    padding: small ? "6px 14px" : "10px 20px", fontSize: small ? 12 : 13,
    letterSpacing: 0.5, transition: "all 0.2s", ...style
  }}>
    {children}
  </button>
);

const KPI = ({ label, value, sub, color = G }) => (
  <Card style={{ flex: 1, minWidth: 160 }}>
    <div style={{ fontSize: 11, color: MUTED, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color, marginBottom: 4 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: MUTED }}>{sub}</div>}
  </Card>
);

const ScoreRing = ({ score, size = 44 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: `conic-gradient(${wisColor(score)} ${score * 3.6}deg, #1a1a2e 0deg)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <div style={{ width: size - 10, height: size - 10, borderRadius: "50%", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size / 3.5, fontWeight: 800, color: wisColor(score) }}>
      {score}
    </div>
  </div>
);

// ================================================================
// MODULE 1 — DASHBOARD
// ================================================================
function Dashboard({ data }) {
  const totalPipeline = data.deals.reduce((s, d) => s + d.value, 0);
  const weightedPipeline = data.deals.reduce((s, d) => s + d.value * d.probability / 100, 0);
  const totalCommission = data.deals.reduce((s, d) => s + d.value * d.commission_rate / 100 * d.probability / 100, 0);
  const ghostLeads = data.leads.filter(l => daysSince(l.last_contact_at) >= 7);
  const urgentLeads = data.leads.filter(l => l.priority === "urgent");
  const unreadMsgs = data.inbox.filter(m => !m.read);

  return (
    <div style={{ padding: 28, overflowY: "auto", height: "100%" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>Command Centre</h2>
        <div style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>
          {new Date().toLocaleDateString("en-IE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <KPI label="Total Pipeline" value={fmtM(totalPipeline)} sub={`${data.deals.length} active deals`} color={G} />
        <KPI label="Weighted Forecast" value={fmtM(weightedPipeline)} sub="Commission Velocity Index™" color="#00E676" />
        <KPI label="Est. Commission" value={fmtM(totalCommission)} sub="probability-weighted" color="#BB86FC" />
        <KPI label="Active Leads" value={data.leads.length} sub={`${urgentLeads.length} urgent`} color="#FF9100" />
      </div>

      {/* Alert Row */}
      {(ghostLeads.length > 0 || unreadMsgs.length > 0) && (
        <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
          {ghostLeads.length > 0 && (
            <Card style={{ flex: 1, borderColor: "#FF525244", background: "#FF52520A" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>👻</span>
                <div>
                  <div style={{ fontWeight: 700, color: "#FF5252", fontSize: 13 }}>Ghost Buyer Alert™ — {ghostLeads.length} leads going cold</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{ghostLeads.map(l => `${l.first_name} ${l.last_name} (${daysSince(l.last_contact_at)}d)`).join(" · ")}</div>
                </div>
              </div>
            </Card>
          )}
          {unreadMsgs.length > 0 && (
            <Card style={{ flex: 1, borderColor: `${G}44`, background: `${G}0A` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>✉️</span>
                <div>
                  <div style={{ fontWeight: 700, color: G, fontSize: 13 }}>White Glove Inbox™ — {unreadMsgs.length} unread messages</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>Check Inbox for priority responses</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Pipeline Stages */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: G }}>Pipeline by Stage</div>
          {Object.entries(STAGE_COLOR).filter(([s]) => data.deals.some(d => d.stage === s)).map(([stage, color]) => {
            const deals = data.deals.filter(d => d.stage === stage);
            const val = deals.reduce((s, d) => s + d.value, 0);
            return (
              <div key={stage} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color, textTransform: "uppercase", letterSpacing: 0.5 }}>{stage}</span>
                  <span style={{ color: TEXT }}>{fmtM(val)}</span>
                </div>
                <div style={{ height: 4, background: "#1a1a2e", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${(val / totalPipeline) * 100}%`, background: color, borderRadius: 2, transition: "width 0.6s" }} />
                </div>
              </div>
            );
          })}
        </Card>

        {/* Top Leads Today */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: G }}>Top Leads — WIS™ Ranking</div>
          {[...data.leads].sort((a, b) => b.wis_score - a.wis_score).slice(0, 5).map(l => (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <ScoreRing score={l.wis_score} size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{l.first_name} {l.last_name}</div>
                <div style={{ fontSize: 11, color: MUTED }}>{l.company || "Private"} · {fmtM(l.budget_max)} max</div>
              </div>
              <Badge label={l.status} color={STATUS_COLOR[l.status]} />
            </div>
          ))}
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: G }}>Upcoming Viewings & Calls</div>
          {data.appointments.slice(0, 4).map(a => {
            const lead = data.leads.find(l => l.id === a.lead_id);
            const prop = data.properties.find(p => p.id === a.property_id);
            return (
              <div key={a.id} style={{ display: "flex", gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ width: 48, textAlign: "center", background: CARD2, borderRadius: 8, padding: "6px 0" }}>
                  <div style={{ fontSize: 10, color: MUTED }}>{new Date(a.scheduled_at).toLocaleDateString("en-IE", { month: "short" })}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: G }}>{new Date(a.scheduled_at).getDate()}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{lead?.first_name} {lead?.last_name}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{prop?.title || a.type} · {new Date(a.scheduled_at).toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })}</div>
                  <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{a.notes}</div>
                </div>
                <Badge label={a.status} color={a.status === "confirmed" ? "#00E676" : "#FFD740"} />
              </div>
            );
          })}
        </Card>

        {/* Active Automations */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: G }}>Concierge Automation Engine™</div>
          {data.automations.filter(a => a.is_active).map(a => (
            <div key={a.id} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00E676", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{a.name}</div>
                <div style={{ fontSize: 11, color: MUTED }}>{a.steps.length} steps · {a.runs_count} runs</div>
              </div>
              <div style={{ fontSize: 11, color: "#00E676" }}>LIVE</div>
            </div>
          ))}
          {data.automations.filter(a => !a.is_active).map(a => (
            <div key={a.id} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, opacity: 0.4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: MUTED, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{a.name}</div>
                <div style={{ fontSize: 11, color: MUTED }}>{a.steps.length} steps · paused</div>
              </div>
              <div style={{ fontSize: 11, color: MUTED }}>OFF</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ================================================================
// MODULE 2 — LEADS
// ================================================================
function Leads({ data, setData }) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("wis_score");
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [newLead, setNewLead] = useState({ first_name: "", last_name: "", email: "", phone: "", company: "", source: "referral", budget_min: "", budget_max: "", notes: "" });

  const filtered = data.leads
    .filter(l => filter === "all" || l.status === filter)
    .filter(l => !search || `${l.first_name} ${l.last_name} ${l.email} ${l.company}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b[sort] - a[sort]);

  const addLead = () => {
    const wis = Math.floor(30 + Math.random() * 40);
    const ai = Math.floor(40 + Math.random() * 40);
    const lead = { ...newLead, id: Date.now(), status: "new", priority: "medium", ai_score: ai, wis_score: wis, budget_min: parseInt(newLead.budget_min) || 0, budget_max: parseInt(newLead.budget_max) || 0, currency: "EUR", last_contact_at: new Date().toISOString(), created_at: new Date().toISOString(), dna_tags: [] };
    setData(d => ({ ...d, leads: [...d.leads, lead] }));
    setShowAdd(false);
    setNewLead({ first_name: "", last_name: "", email: "", phone: "", company: "", source: "referral", budget_min: "", budget_max: "", notes: "" });
  };

  return (
    <div style={{ padding: 28, overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Leads</h2>
          <div style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>Wealth Intelligence Score™ ranked</div>
        </div>
        <Btn onClick={() => setShowAdd(true)}>+ Add Lead</Btn>
      </div>

      {/* Add Lead Modal */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Card style={{ width: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: G, marginBottom: 20 }}>New Lead — Capture</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[["first_name","First Name"],["last_name","Last Name"],["email","Email"],["phone","Phone"],["company","Company"],["source","Source"]].map(([k, label]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>{label}</div>
                  {k === "source" ? (
                    <select value={newLead[k]} onChange={e => setNewLead(n => ({ ...n, [k]: e.target.value }))}
                      style={{ width: "100%", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 10px", color: TEXT, fontSize: 13 }}>
                      {["referral","website","social","portal","cold_outreach"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <input value={newLead[k]} onChange={e => setNewLead(n => ({ ...n, [k]: e.target.value }))}
                      style={{ width: "100%", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 10px", color: TEXT, fontSize: 13, boxSizing: "border-box" }} />
                  )}
                </div>
              ))}
              <div>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Budget Min (€)</div>
                <input value={newLead.budget_min} onChange={e => setNewLead(n => ({ ...n, budget_min: e.target.value }))}
                  style={{ width: "100%", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 10px", color: TEXT, fontSize: 13, boxSizing: "border-box" }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Budget Max (€)</div>
                <input value={newLead.budget_max} onChange={e => setNewLead(n => ({ ...n, budget_max: e.target.value }))}
                  style={{ width: "100%", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 10px", color: TEXT, fontSize: 13, boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Notes</div>
              <textarea value={newLead.notes} onChange={e => setNewLead(n => ({ ...n, notes: e.target.value }))}
                rows={3} style={{ width: "100%", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 10px", color: TEXT, fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <Btn onClick={addLead}>Save Lead</Btn>
              <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
            </div>
          </Card>
        </div>
      )}

      {/* Filters & Search */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 14px", color: TEXT, fontSize: 13, width: 220 }} />
        {["all","new","contacted","qualified","proposal"].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            background: filter === s ? `${G}22` : "transparent", color: filter === s ? G : MUTED,
            border: `1px solid ${filter === s ? G : BORDER}`, borderRadius: 20, padding: "5px 14px", fontSize: 12, cursor: "pointer", textTransform: "capitalize"
          }}>{s}</button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: MUTED }}>Sort by:</span>
          {[["wis_score","WIS™"],["ai_score","AI Score"],["budget_max","Budget"]].map(([k, label]) => (
            <button key={k} onClick={() => setSort(k)} style={{
              background: sort === k ? `${G}22` : "transparent", color: sort === k ? G : MUTED,
              border: `1px solid ${sort === k ? G : BORDER}`, borderRadius: 20, padding: "5px 12px", fontSize: 11, cursor: "pointer"
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <Card style={{ padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
              {["WIS™","Lead","Company","Budget","Status","Source","Ghost","Actions"].map(h => (
                <th key={h} style={{ padding: "14px 16px", fontSize: 11, color: MUTED, textAlign: "left", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => {
              const ghost = daysSince(l.last_contact_at);
              return (
                <tr key={l.id} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? "transparent" : `${CARD2}66` }}>
                  <td style={{ padding: "14px 16px" }}><ScoreRing score={l.wis_score} size={38} /></td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{l.first_name} {l.last_name}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>{l.email}</div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#aaa" }}>{l.company || "—"}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{fmtM(l.budget_max)}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>{fmtM(l.budget_min)} min</div>
                  </td>
                  <td style={{ padding: "14px 16px" }}><Badge label={l.status} color={STATUS_COLOR[l.status]} /></td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "#aaa", textTransform: "capitalize" }}>{l.source}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 12, color: ghost >= 7 ? "#FF5252" : ghost >= 3 ? "#FF9100" : "#00E676", fontWeight: 700 }}>
                      {ghost >= 7 ? `👻 ${ghost}d` : `${ghost}d ago`}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn small variant="ghost">Call</Btn>
                      <Btn small variant="ghost">Email</Btn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ================================================================
// MODULE 3 — PROPERTIES
// ================================================================
function Properties({ data }) {
  const [view, setView] = useState("grid");
  const [matchLead, setMatchLead] = useState(null);

  return (
    <div style={{ padding: 28, overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Properties</h2>
          <div style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>Property-Lead DNA Match™ Engine</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select value={matchLead || ""} onChange={e => setMatchLead(e.target.value ? parseInt(e.target.value) : null)}
            style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px", color: TEXT, fontSize: 13 }}>
            <option value="">Match for lead...</option>
            {data.leads.map(l => <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>)}
          </select>
          {["grid","list"].map(v => <Btn key={v} variant={view === v ? "primary" : "ghost"} small onClick={() => setView(v)}>{v === "grid" ? "⊞" : "☰"}</Btn>)}
        </div>
      </div>

      {matchLead && (
        <Card style={{ marginBottom: 20, borderColor: `${G}44`, background: `${G}08` }}>
          <div style={{ fontWeight: 700, color: G, marginBottom: 8 }}>
            DNA Match™ — {data.leads.find(l => l.id === matchLead)?.first_name} {data.leads.find(l => l.id === matchLead)?.last_name}
          </div>
          <div style={{ fontSize: 12, color: MUTED }}>Properties ranked by lifestyle + preference compatibility algorithm</div>
        </Card>
      )}

      <div style={{ display: view === "grid" ? "grid" : "flex", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", flexDirection: "column", gap: 16 }}>
        {[...data.properties]
          .map(p => ({ ...p, dnaScore: matchLead ? dnaDriveMatch(data.leads.find(l => l.id === matchLead) || {}, p) : null }))
          .sort((a, b) => matchLead ? b.dnaScore - a.dnaScore : b.price - a.price)
          .map(p => (
            <Card key={p.id} style={{ position: "relative", padding: view === "list" ? "14px 20px" : 20 }}>
              {p.is_featured && <div style={{ position: "absolute", top: 12, right: 12, background: `${G}22`, color: G, border: `1px solid ${G}44`, borderRadius: 20, padding: "2px 10px", fontSize: 10, fontWeight: 700 }}>FEATURED</div>}
              {p.dnaScore !== null && (
                <div style={{ position: "absolute", top: 12, left: 12, background: `${wisColor(p.dnaScore)}22`, color: wisColor(p.dnaScore), border: `1px solid ${wisColor(p.dnaScore)}44`, borderRadius: 20, padding: "2px 10px", fontSize: 10, fontWeight: 700 }}>
                  DNA {p.dnaScore}%
                </div>
              )}
              <div style={{ display: view === "list" ? "flex" : "block", gap: 20, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  {view !== "list" && <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: p.dnaScore !== null ? 24 : 0 }}>{p.type} · {p.city}</div>}
                  <div style={{ fontSize: view === "list" ? 15 : 17, fontWeight: 700, marginBottom: 6 }}>{p.title}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: G, marginBottom: 12 }}>{fmtM(p.price)}</div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: MUTED }}>
                    <span>🛏 {p.bedrooms}</span>
                    <span>🚿 {p.bathrooms}</span>
                    <span>📐 {p.area_sqm}m²</span>
                    <span style={{ background: "#00E67622", color: "#00E676", padding: "1px 6px", borderRadius: 4 }}>BER {p.rating}</span>
                  </div>
                </div>
                {view === "list" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn small>Match Lead</Btn>
                    <Btn small variant="ghost">View</Btn>
                  </div>
                )}
              </div>
              {view !== "list" && (
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <Btn small style={{ flex: 1 }}>Match Lead</Btn>
                  <Btn small variant="ghost">Details</Btn>
                </div>
              )}
            </Card>
          ))}
      </div>
    </div>
  );
}

// ================================================================
// MODULE 4 — DEALS (Kanban Pipeline)
// ================================================================
function Deals({ data, setData }) {
  const stages = ["discovery", "viewing", "offer", "negotiation", "legal", "closed_won", "closed_lost"];
  const totalWeighted = data.deals.reduce((s, d) => s + (d.stage !== "closed_lost" ? d.value * d.probability / 100 : 0), 0);

  const moveDeal = (dealId, newStage) => {
    setData(d => ({ ...d, deals: d.deals.map(deal => deal.id === dealId ? { ...deal, stage: newStage } : deal) }));
  };

  return (
    <div style={{ padding: 28, overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Pipeline</h2>
          <div style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>Commission Velocity Index™ — Weighted: {fmtM(totalWeighted)}</div>
        </div>
        <Btn>+ New Deal</Btn>
      </div>

      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16, marginTop: 20 }}>
        {stages.map(stage => {
          const deals = data.deals.filter(d => d.stage === stage);
          const stageVal = deals.reduce((s, d) => s + d.value, 0);
          return (
            <div key={stage} style={{ minWidth: 220, flexShrink: 0 }}>
              <div style={{ padding: "8px 12px", borderRadius: "8px 8px 0 0", background: `${STAGE_COLOR[stage]}22`, borderBottom: `2px solid ${STAGE_COLOR[stage]}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: STAGE_COLOR[stage], textTransform: "uppercase", letterSpacing: 1 }}>{stage.replace("_", " ")}</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{deals.length} deals · {fmtM(stageVal)}</div>
              </div>
              <div style={{ minHeight: 100 }}>
                {deals.map(deal => {
                  const lead = data.leads.find(l => l.id === deal.lead_id);
                  return (
                    <Card key={deal.id} style={{ margin: "8px 0", borderRadius: "0 0 8px 8px", padding: 14 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{deal.title}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: G, marginBottom: 8 }}>{fmtM(deal.value)}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: MUTED, marginBottom: 10 }}>
                        <span>Commission: {fmtM(deal.value * deal.commission_rate / 100)}</span>
                        <span style={{ color: deal.probability >= 70 ? "#00E676" : "#FFD740" }}>{deal.probability}%</span>
                      </div>
                      {lead && <div style={{ fontSize: 11, color: "#aaa", marginBottom: 10 }}>👤 {lead.first_name} {lead.last_name}</div>}
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {stages.filter(s => s !== stage && s !== "closed_lost").slice(0, 2).map(s => (
                          <button key={s} onClick={() => moveDeal(deal.id, s)} style={{
                            background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 4, color: MUTED, padding: "3px 7px", fontSize: 10, cursor: "pointer"
                          }}>→ {s}</button>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ================================================================
// MODULE 5 — AI ENGINE (WIS™ + Predictions)
// ================================================================
function AIEngine({ data }) {
  const topLead = [...data.leads].sort((a, b) => b.wis_score - a.wis_score)[0];

  return (
    <div style={{ padding: 28, overflowY: "auto", height: "100%" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>AI Engine</h2>
      <div style={{ color: MUTED, fontSize: 13, marginBottom: 24 }}>Patented intelligence layer — 7 proprietary algorithms active</div>

      {/* WIS Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card>
          <div style={{ fontWeight: 800, color: G, fontSize: 14, marginBottom: 16 }}>⚡ Wealth Intelligence Score™ (WIS)</div>
          <div style={{ fontSize: 12, color: MUTED, marginBottom: 16, lineHeight: 1.7 }}>
            Multi-signal scoring: company revenue signals · declared budget · behavioral patterns · nationality wealth index · referral quality · engagement velocity → Single score 0–100
          </div>
          {data.leads.map(l => (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <ScoreRing score={l.wis_score} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{l.first_name} {l.last_name}</div>
                <div style={{ height: 4, background: "#1a1a2e", borderRadius: 2, marginTop: 4 }}>
                  <div style={{ height: "100%", width: `${l.wis_score}%`, background: wisColor(l.wis_score), borderRadius: 2 }} />
                </div>
              </div>
              <span style={{ fontSize: 11, color: wisColor(l.wis_score), fontWeight: 700 }}>{l.wis_score}/100</span>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontWeight: 800, color: "#BB86FC", fontSize: 14, marginBottom: 16 }}>👻 Ghost Buyer Alert™</div>
          <div style={{ fontSize: 12, color: MUTED, marginBottom: 16, lineHeight: 1.7 }}>
            Detects high-intent leads going cold before they disappear. Triggers automated re-engagement when contact gap exceeds threshold.
          </div>
          {data.leads.map(l => {
            const days = daysSince(l.last_contact_at);
            const risk = days >= 10 ? "critical" : days >= 7 ? "high" : days >= 3 ? "medium" : "safe";
            const riskColor = { critical: "#FF5252", high: "#FF9100", medium: "#FFD740", safe: "#00E676" }[risk];
            return (
              <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: riskColor, flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 12 }}>{l.first_name} {l.last_name}</div>
                <span style={{ fontSize: 11, color: riskColor, fontWeight: 700 }}>{days}d · {risk.toUpperCase()}</span>
              </div>
            );
          })}
        </Card>

        <Card>
          <div style={{ fontWeight: 800, color: "#00E676", fontSize: 14, marginBottom: 16 }}>🧬 Property-Lead DNA Match™</div>
          <div style={{ fontSize: 12, color: MUTED, marginBottom: 16, lineHeight: 1.7 }}>
            Beyond basic filters — matches lifestyle signals from notes, tags, and behavioral data to property attributes. Algorithm pending patent.
          </div>
          {topLead && (
            <div>
              <div style={{ fontSize: 12, color: G, fontWeight: 700, marginBottom: 12 }}>Top matches for {topLead.first_name} {topLead.last_name}:</div>
              {[...data.properties].map(p => ({ ...p, dna: dnaDriveMatch(topLead, p) })).sort((a, b) => b.dna - a.dna).slice(0, 4).map(p => (
                <div key={p.id} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${wisColor(p.dna)}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: wisColor(p.dna) }}>{p.dna}%</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>{fmtM(p.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div style={{ fontWeight: 800, color: "#FF9100", fontSize: 14, marginBottom: 16 }}>⏱ Luxury Timeline Predictor™</div>
          <div style={{ fontSize: 12, color: MUTED, marginBottom: 16, lineHeight: 1.7 }}>
            Predicts optimal purchase window based on engagement velocity, decision stage, and market timing signals.
          </div>
          {data.deals.map(d => {
            const lead = data.leads.find(l => l.id === d.lead_id);
            const days = Math.floor((new Date(d.expected_close_at) - Date.now()) / 86400000);
            return (
              <div key={d.id} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                <div style={{ textAlign: "center", minWidth: 48, background: CARD2, borderRadius: 8, padding: "6px 8px" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: days < 14 ? "#FF9100" : G }}>{days}</div>
                  <div style={{ fontSize: 9, color: MUTED }}>DAYS</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{d.title}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{d.probability}% probability · {fmtM(d.value * d.commission_rate / 100)} commission</div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* SWOT vs Competitors */}
      <Card>
        <div style={{ fontWeight: 800, color: G, fontSize: 14, marginBottom: 16 }}>📊 SWOT — Aureum vs Market</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { title: "STRENGTHS", color: "#00E676", items: ["Luxury-native DNA — built for €1M+ properties", "WIS™ + DNA Match™ proprietary algorithms", "Concierge UX — feels like Bentley, not Toyota", "Flat €200/mo SaaS vs Salesforce's $300/user"] },
            { title: "WEAKNESSES", color: "#FFD740", items: ["Early stage — no brand recognition yet", "Small properties database vs established CRMs", "Limited integrations (pre-Supabase phase)", "No mobile app yet"] },
            { title: "OPPORTUNITIES", color: "#64B5F6", items: ["420 luxury agencies in IE/Dubai as target", "€1M ARR possible at 420 clients × €200/mo", "Patent WIS™ + DNA Match™ algorithms globally", "Franchise model: license to other markets"] },
            { title: "THREATS", color: "#FF5252", items: ["Salesforce entering luxury real estate vertical", "HubSpot copying AI scoring features", "Large agencies building in-house tools", "Economic downturn reducing luxury transactions"] },
          ].map(({ title, color, items }) => (
            <div key={title} style={{ background: `${color}08`, border: `1px solid ${color}22`, borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color, letterSpacing: 1, marginBottom: 10 }}>{title}</div>
              {items.map((item, i) => <div key={i} style={{ fontSize: 12, color: "#aaa", marginBottom: 6, paddingLeft: 10, borderLeft: `2px solid ${color}44` }}>· {item}</div>)}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ================================================================
// MODULE 6 — AUTOMATIONS
// ================================================================
function Automations({ data, setData }) {
  const toggleAuto = (id) => {
    setData(d => ({ ...d, automations: d.automations.map(a => a.id === id ? { ...a, is_active: !a.is_active } : a) }));
  };
  return (
    <div style={{ padding: 28, overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Concierge Automation Engine™</h2>
          <div style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>Automations that feel handwritten, not robotic</div>
        </div>
        <Btn>+ New Workflow</Btn>
      </div>
      <div style={{ display: "grid", gap: 16 }}>
        {data.automations.map(a => (
          <Card key={a.id}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: a.is_active ? "#00E67622" : CARD2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {a.trigger === "lead_created" ? "👤" : a.trigger === "no_contact_7d" ? "👻" : a.trigger === "deal_stage_proposal" ? "📋" : "🏆"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{a.name}</div>
                  <Badge label={a.is_active ? "LIVE" : "PAUSED"} color={a.is_active ? "#00E676" : MUTED} />
                </div>
                <div style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>Trigger: <span style={{ color: G }}>{a.trigger.replace(/_/g, " ")}</span> · {a.runs_count} total runs</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {a.steps.map((step, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ background: `${G}22`, color: G, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 600 }}>Step {i + 1}: {step}</div>
                      {i < a.steps.length - 1 && <span style={{ color: MUTED, fontSize: 16 }}>→</span>}
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => toggleAuto(a.id)} style={{
                background: a.is_active ? "#FF525222" : "#00E67622", color: a.is_active ? "#FF5252" : "#00E676",
                border: `1px solid ${a.is_active ? "#FF525244" : "#00E67644"}`, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700
              }}>{a.is_active ? "Pause" : "Activate"}</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ================================================================
// MODULE 7 — CALENDAR
// ================================================================
function CalendarModule({ data }) {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const today = new Date();
  return (
    <div style={{ padding: 28, overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Calendar</h2>
          <div style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>Viewings, calls & negotiations</div>
        </div>
        <Btn>+ Schedule</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        <Card>
          <div style={{ fontWeight: 700, color: G, marginBottom: 16, fontSize: 14 }}>
            {today.toLocaleDateString("en-IE", { month: "long", year: "numeric" })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
            {days.map(d => <div key={d} style={{ fontSize: 11, color: MUTED, textAlign: "center", fontWeight: 700, padding: "4px 0" }}>{d}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 1;
              const d = new Date(today.getFullYear(), today.getMonth(), day + 1);
              const hasAppt = data.appointments.some(a => new Date(a.scheduled_at).toDateString() === d.toDateString());
              const isToday = d.toDateString() === today.toDateString();
              return (
                <div key={i} style={{
                  height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, cursor: "pointer", position: "relative",
                  background: isToday ? `${G}22` : "transparent",
                  border: isToday ? `1px solid ${G}` : "1px solid transparent",
                  color: day < 0 || day >= 31 ? MUTED : TEXT, fontSize: 13
                }}>
                  {day >= 0 && day < 31 && day + 1}
                  {hasAppt && day >= 0 && day < 31 && <div style={{ position: "absolute", bottom: 4, width: 4, height: 4, borderRadius: "50%", background: G }} />}
                </div>
              );
            })}
          </div>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: G, marginBottom: 4 }}>Upcoming</div>
          {data.appointments.map(a => {
            const lead = data.leads.find(l => l.id === a.lead_id);
            const prop = data.properties.find(p => p.id === a.property_id);
            const d = new Date(a.scheduled_at);
            return (
              <Card key={a.id} style={{ padding: 14 }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ textAlign: "center", minWidth: 44, background: CARD2, borderRadius: 8, padding: "6px 0" }}>
                    <div style={{ fontSize: 10, color: MUTED }}>{d.toLocaleDateString("en-IE", { month: "short" })}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: G }}>{d.getDate()}</div>
                    <div style={{ fontSize: 10, color: MUTED }}>{d.toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{lead?.first_name} {lead?.last_name}</div>
                    <div style={{ fontSize: 12, color: MUTED }}>{prop?.title || a.type}</div>
                    <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{a.notes}</div>
                    <Badge label={a.status} color={a.status === "confirmed" ? "#00E676" : "#FFD740"} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// MODULE 8 — INBOX (White Glove Inbox™)
// ================================================================
function Inbox({ data, setData }) {
  const [active, setActive] = useState(data.inbox[0]);
  const markRead = (id) => setData(d => ({ ...d, inbox: d.inbox.map(m => m.id === id ? { ...m, read: true } : m) }));
  const unread = data.inbox.filter(m => !m.read).length;

  return (
    <div style={{ padding: 28, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>White Glove Inbox™ {unread > 0 && <span style={{ fontSize: 14, background: `${G}22`, color: G, borderRadius: 20, padding: "2px 10px", marginLeft: 8 }}>{unread} unread</span>}</h2>
        <div style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>Email · WhatsApp · SMS — unified</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, flex: 1, minHeight: 0 }}>
        <Card style={{ padding: 0, overflowY: "auto" }}>
          {data.inbox.map(m => {
            const lead = data.leads.find(l => l.id === m.lead_id);
            return (
              <div key={m.id} onClick={() => { setActive(m); markRead(m.id); }} style={{
                padding: "14px 16px", cursor: "pointer", borderBottom: `1px solid ${BORDER}`,
                background: active?.id === m.id ? `${G}08` : !m.read ? `${CARD2}` : "transparent"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>{CHANNEL_ICON[m.channel]}</span>
                  <div style={{ flex: 1, fontWeight: !m.read ? 700 : 400, fontSize: 13 }}>{lead?.first_name} {lead?.last_name}</div>
                  {!m.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: G }} />}
                </div>
                <div style={{ fontSize: 12, color: MUTED, marginBottom: 2 }}>{m.direction === "inbound" ? "← " : "→ "}{m.subject}</div>
                <div style={{ fontSize: 11, color: "#555" }}>{m.body.slice(0, 60)}...</div>
              </div>
            );
          })}
        </Card>
        {active ? (
          <Card style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{active.subject}</div>
                <div style={{ fontSize: 12, color: MUTED }}>{data.leads.find(l => l.id === active.lead_id)?.email} · {CHANNEL_ICON[active.channel]} {active.channel} · {new Date(active.created_at).toLocaleString("en-IE")}</div>
              </div>
              <Badge label={active.direction} color={active.direction === "inbound" ? "#64B5F6" : "#00E676"} />
            </div>
            <div style={{ flex: 1, fontSize: 14, lineHeight: 1.8, color: "#ccc", padding: "16px 0", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
              {active.body}
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>✦ AI Draft Suggestion (White Glove)</div>
              <div style={{ background: `${G}08`, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 12, fontSize: 13, color: "#aaa", marginBottom: 12, fontStyle: "italic" }}>
                "Dear {data.leads.find(l => l.id === active.lead_id)?.first_name}, thank you for your message. I would be delighted to arrange a private viewing at your earliest convenience. Our concierge team will ensure..."
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn>Send Reply</Btn>
                <Btn variant="ghost">Use AI Draft</Btn>
                <Btn variant="ghost">Schedule</Btn>
              </div>
            </div>
          </Card>
        ) : <Card><div style={{ color: MUTED, textAlign: "center", marginTop: 40 }}>Select a message</div></Card>}
      </div>
    </div>
  );
}

// ================================================================
// MODULE 9 — ANALYTICS
// ================================================================
function Analytics({ data }) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const maxRev = Math.max(...data.analytics.monthly_revenue);
  const totalRev = data.analytics.monthly_revenue.reduce((s, v) => s + v, 0);
  const totalCommission = data.deals.reduce((s, d) => s + d.value * d.commission_rate / 100, 0);
  const totalPipeline = data.deals.reduce((s, d) => s + d.value, 0);

  return (
    <div style={{ padding: 28, overflowY: "auto", height: "100%" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>Analytics & P&L</h2>
      <div style={{ color: MUTED, fontSize: 13, marginBottom: 24 }}>Commission Velocity Index™ · Year to Date</div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <KPI label="Revenue YTD" value={fmt(totalRev)} sub="All closed deals" color={G} />
        <KPI label="Pipeline Value" value={fmtM(totalPipeline)} sub={`${data.deals.length} active deals`} color="#00E676" />
        <KPI label="Est. Commission" value={fmt(totalCommission)} sub="From active pipeline" color="#BB86FC" />
        <KPI label="Avg Deal Size" value={fmtM(totalPipeline / data.deals.length)} sub="Across all stages" color="#FF9100" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, color: G, marginBottom: 20 }}>Monthly Revenue — 2026</div>
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 140 }}>
            {data.analytics.monthly_revenue.map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 9, color: v > 0 ? G : "transparent" }}>€{(v/1000).toFixed(0)}K</div>
                <div style={{
                  width: "100%", borderRadius: "3px 3px 0 0", transition: "height 0.6s",
                  background: i === new Date().getMonth() ? G : `${G}44`,
                  height: maxRev > 0 ? `${(v / maxRev) * 100}px` : "4px", minHeight: 4
                }} />
                <div style={{ fontSize: 9, color: MUTED }}>{months[i]}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, color: G, marginBottom: 16 }}>Leads by Source</div>
          {Object.entries(data.analytics.leads_by_source).map(([source, count]) => (
            <div key={source} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ textTransform: "capitalize" }}>{source}</span>
                <span style={{ color: G, fontWeight: 700 }}>{count}</span>
              </div>
              <div style={{ height: 4, background: "#1a1a2e", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${(count / data.leads.length) * 100}%`, background: G, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, color: G, marginBottom: 16 }}>P&L Snapshot — Aureum SaaS Projection</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {[
            { label: "10 Clients", rev: 2000, cogs: 200, opex: 450, ebitda: 1350, ebitdaColor: "#FFD740" },
            { label: "25 Clients", rev: 5000, cogs: 500, opex: 780, ebitda: 3720, ebitdaColor: "#00E676" },
            { label: "100 Clients", rev: 20000, cogs: 2000, opex: 780, ebitda: 17220, ebitdaColor: "#00E676" },
            { label: "420 Clients — €1M ARR", rev: 84000, cogs: 8400, opex: 780, ebitda: 74820, ebitdaColor: G },
          ].map(p => (
            <div key={p.label} style={{ background: CARD2, borderRadius: 10, padding: 16, border: `1px solid ${p.label.includes("420") ? G : BORDER}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: p.label.includes("420") ? G : TEXT, marginBottom: 12 }}>{p.label}</div>
              {[["Revenue", p.rev, "#aaa"],["COGS", -p.cogs, "#FF5252"],["OpEx", -p.opex, "#FF9100"],["EBITDA", p.ebitda, p.ebitdaColor]].map(([k, v, c]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6, borderTop: k === "EBITDA" ? `1px solid ${BORDER}` : "none", paddingTop: k === "EBITDA" ? 8 : 0 }}>
                  <span style={{ color: MUTED }}>{k}</span>
                  <span style={{ color: c, fontWeight: k === "EBITDA" ? 800 : 400 }}>€{Math.abs(v).toLocaleString()}{k === "EBITDA" && <span style={{ fontSize: 10 }}>/mo</span>}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ================================================================
// MODULE 10 — DOCUMENTS
// ================================================================
function Documents({ data }) {
  return (
    <div style={{ padding: 28, overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Documents</h2>
          <div style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>NDAs, LOIs, Contracts — e-sign ready</div>
        </div>
        <Btn>+ New Document</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {data.documents.map(doc => {
          const deal = data.deals.find(d => d.id === doc.deal_id);
          return (
            <Card key={doc.id}>
              <div style={{ display: "flex", gap: 14 }}>
                <div style={{ width: 44, height: 56, background: `${DOC_COLOR[doc.status]}22`, border: `1px solid ${DOC_COLOR[doc.status]}44`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📄</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{doc.name}</div>
                  <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>{deal?.title || "—"}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Badge label={doc.status} color={DOC_COLOR[doc.status]} />
                    <Badge label={doc.type.toUpperCase()} color={MUTED} />
                  </div>
                  {doc.signed_at && <div style={{ fontSize: 11, color: "#00E676", marginTop: 6 }}>✓ Signed {doc.signed_at}</div>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <Btn small style={{ flex: 1 }}>View</Btn>
                {doc.status !== "signed" && <Btn small variant="ghost">Send for Sign</Btn>}
              </div>
            </Card>
          );
        })}
        {/* Templates */}
        <Card style={{ borderStyle: "dashed" }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: MUTED, marginBottom: 12 }}>📁 Templates</div>
          {["NDA Template","Letter of Intent","Sale & Purchase Agreement","Exclusivity Agreement"].map(t => (
            <div key={t} style={{ fontSize: 13, padding: "8px 0", borderBottom: `1px solid ${BORDER}`, cursor: "pointer", color: "#aaa", display: "flex", justifyContent: "space-between" }}>
              {t} <span style={{ color: G }}>Use →</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ================================================================
// MODULE 11 — CLIENTS (Past Buyers + LTV)
// ================================================================
function Clients({ data }) {
  const clients = [
    { id: 1, name: "Lord Patrick Ashton", country: "IE", purchases: 2, total_spent: 9800000, last_purchase: "2025-11-10", ltv_score: 96, referrals_made: 3 },
    { id: 2, name: "Dr. Wei Huang", country: "CN", purchases: 1, total_spent: 2400000, last_purchase: "2025-08-22", ltv_score: 72, referrals_made: 1 },
    { id: 3, name: "Marie-Claire Dubois", country: "FR", purchases: 1, total_spent: 1350000, last_purchase: "2025-06-05", ltv_score: 61, referrals_made: 0 },
  ];
  return (
    <div style={{ padding: 28, overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Past Clients</h2>
          <div style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>Client Lifetime Value · Referral Tracking</div>
        </div>
      </div>
      <div style={{ display: "grid", gap: 16 }}>
        {clients.map(c => (
          <Card key={c.id}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <ScoreRing score={c.ltv_score} size={52} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{c.name}</div>
                <div style={{ display: "flex", gap: 20, fontSize: 12, color: MUTED }}>
                  <span>🏠 {c.purchases} {c.purchases === 1 ? "purchase" : "purchases"}</span>
                  <span>💰 {fmtM(c.total_spent)} total</span>
                  <span>👥 {c.referrals_made} referrals</span>
                  <span>📅 Last: {c.last_purchase}</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Commission earned</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: G }}>{fmt(c.total_spent * 0.015)}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ================================================================
// MODULE 12 — TEAM
// ================================================================
function Team({ data }) {
  return (
    <div style={{ padding: 28, overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Team</h2>
          <div style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>Agent leaderboard · Performance tracking</div>
        </div>
        <Btn>+ Invite Agent</Btn>
      </div>
      <div style={{ display: "grid", gap: 16 }}>
        {[...data.team].sort((a, b) => b.revenue_ytd - a.revenue_ytd).map((m, rank) => (
          <Card key={m.id}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: rank === 0 ? `${G}22` : CARD2, border: rank === 0 ? `1px solid ${G}` : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: rank === 0 ? 22 : 18, flexShrink: 0 }}>
                {rank === 0 ? "🏆" : rank === 1 ? "🥈" : "🥉"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>{m.role} · {m.conversion_rate}% conversion</div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <div style={{ flex: 1, height: 6, background: "#1a1a2e", borderRadius: 3 }}>
                    <div style={{ height: "100%", width: `${(m.revenue_ytd / m.target) * 100}%`, background: m.revenue_ytd / m.target >= 0.7 ? "#00E676" : G, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 11, color: MUTED, marginLeft: 8 }}>€{(m.revenue_ytd / 1000).toFixed(0)}K / €{(m.target / 1000).toFixed(0)}K target</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: G }}>€{(m.revenue_ytd / 1000).toFixed(0)}K</div>
                <div style={{ fontSize: 11, color: MUTED }}>{m.deals_closed} deals closed</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ================================================================
// MODULE 13 — SETTINGS (Supabase Config + Integrations)
// ================================================================
function Settings() {
  const [supabaseUrl, setSupabaseUrl] = useState(SUPABASE_URL);
  const [supabaseKey, setSupabaseKey] = useState("••••••••••••••••");
  const [demoMode, setDemoMode] = useState(DEMO_MODE);

  return (
    <div style={{ padding: 28, overflowY: "auto", height: "100%" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>Settings</h2>
      <div style={{ color: MUTED, fontSize: 13, marginBottom: 24 }}>Supabase · Integrations · Company Config</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Supabase Config */}
        <Card style={{ gridColumn: "1 / -1" }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: G, marginBottom: 4 }}>⚡ Supabase Integration</div>
          <div style={{ fontSize: 12, color: MUTED, marginBottom: 20 }}>Connect your Supabase project to enable real-time data, auth, and storage</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>Project URL</div>
              <input value={supabaseUrl} onChange={e => setSupabaseUrl(e.target.value)}
                style={{ width: "100%", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", color: TEXT, fontSize: 13, boxSizing: "border-box", fontFamily: "monospace" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>Anon Key</div>
              <input value={supabaseKey} onChange={e => setSupabaseKey(e.target.value)} type="password"
                style={{ width: "100%", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", color: TEXT, fontSize: 13, boxSizing: "border-box", fontFamily: "monospace" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "center" }}>
            <Btn>Test Connection</Btn>
            <Btn>Save & Connect</Btn>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 12, color: MUTED }}>Demo Mode</div>
              <div onClick={() => setDemoMode(!demoMode)} style={{
                width: 48, height: 24, background: demoMode ? `${G}44` : "#333", borderRadius: 12, cursor: "pointer", position: "relative", transition: "all 0.3s"
              }}>
                <div style={{ position: "absolute", top: 3, left: demoMode ? 26 : 3, width: 18, height: 18, borderRadius: "50%", background: demoMode ? G : MUTED, transition: "left 0.3s" }} />
              </div>
              <div style={{ fontSize: 12, color: demoMode ? G : MUTED, fontWeight: 700 }}>{demoMode ? "ON" : "OFF"}</div>
            </div>
          </div>
          <div style={{ marginTop: 20, padding: 14, background: CARD2, borderRadius: 8, fontFamily: "monospace", fontSize: 11, color: "#aaa" }}>
            <div style={{ color: G, fontWeight: 700, marginBottom: 8 }}># SQL — Run in Supabase SQL Editor to create tables:</div>
            {`CREATE TABLE leads (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, tenant_id uuid, first_name text, last_name text, email text, phone text, company text, source text, status text DEFAULT 'new', priority text DEFAULT 'medium', ai_score int DEFAULT 50, wis_score int DEFAULT 50, budget_min bigint, budget_max bigint, currency text DEFAULT 'EUR', notes text, last_contact_at timestamptz DEFAULT now(), created_at timestamptz DEFAULT now());

CREATE TABLE properties (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, tenant_id uuid, title text, type text, city text, country text, price bigint, currency text DEFAULT 'EUR', bedrooms int, bathrooms int, area_sqm int, rating text, is_featured boolean DEFAULT false, created_at timestamptz DEFAULT now());

CREATE TABLE deals (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, tenant_id uuid, lead_id uuid REFERENCES leads(id), property_id uuid REFERENCES properties(id), title text, stage text DEFAULT 'discovery', value bigint, commission_rate decimal DEFAULT 1.5, probability int DEFAULT 50, agent_id uuid, expected_close_at date, created_at timestamptz DEFAULT now());`}
          </div>
        </Card>

        {/* Integrations */}
        <Card>
          <div style={{ fontWeight: 800, fontSize: 14, color: G, marginBottom: 16 }}>🔌 Integrations</div>
          {[
            { name: "WhatsApp Business API", status: "connect", icon: "💬" },
            { name: "Gmail / Google Workspace", status: "connect", icon: "✉️" },
            { name: "Stripe — Subscription Billing", status: "connect", icon: "💳" },
            { name: "Docusign — E-Signature", status: "connect", icon: "✍️" },
            { name: "Google Calendar Sync", status: "connect", icon: "📅" },
            { name: "Zapier Webhook", status: "connect", icon: "⚡" },
          ].map(integration => (
            <div key={integration.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ fontSize: 18 }}>{integration.icon}</span>
              <div style={{ flex: 1, fontSize: 13 }}>{integration.name}</div>
              <Btn small variant="ghost">Connect</Btn>
            </div>
          ))}
        </Card>

        {/* Company Config */}
        <Card>
          <div style={{ fontWeight: 800, fontSize: 14, color: G, marginBottom: 16 }}>🏢 Company Config</div>
          {[["Company Name","AUREUM Luxury Properties"],["Primary Currency","EUR"],["Commission Default (%)","1.5"],["Ghost Alert Threshold (days)","7"],["WIS Refresh Interval","Daily"]].map(([label, val]) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>{label}</div>
              <input defaultValue={val} style={{ width: "100%", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 10px", color: TEXT, fontSize: 13, boxSizing: "border-box" }} />
            </div>
          ))}
          <Btn>Save Config</Btn>
        </Card>
      </div>
    </div>
  );
}

// ================================================================
// MAIN APP — ROUTER
// ================================================================
export default function AureumCRM() {
  const [page, setPage] = useState("dashboard");
  const [data, setData] = useState(DEMO);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const nav = [
    { id: "dashboard",   icon: "◆",  label: "Dashboard",    badge: null },
    { id: "leads",       icon: "◈",  label: "Leads",        badge: data.leads.filter(l => daysSince(l.last_contact_at) >= 7).length || null },
    { id: "properties",  icon: "⬡",  label: "Properties",   badge: null },
    { id: "deals",       icon: "◇",  label: "Deals",        badge: null },
    { id: "ai",          icon: "✦",  label: "AI Engine",    badge: null },
    { id: "automations", icon: "⚡", label: "Automations",  badge: data.automations.filter(a => a.is_active).length },
    { id: "calendar",    icon: "◻",  label: "Calendar",     badge: data.appointments.filter(a => a.status === "confirmed").length || null },
    { id: "inbox",       icon: "✉",  label: "Inbox",        badge: data.inbox.filter(m => !m.read).length || null },
    { id: "analytics",   icon: "▤",  label: "Analytics",    badge: null },
    { id: "documents",   icon: "▣",  label: "Documents",    badge: data.documents.filter(d => d.status === "sent").length || null },
    { id: "clients",     icon: "♦",  label: "Clients",      badge: null },
    { id: "team",        icon: "◉",  label: "Team",         badge: null },
    { id: "settings",    icon: "⚙",  label: "Settings",     badge: null },
  ];

  const renderPage = () => {
    const props = { data, setData };
    switch (page) {
      case "dashboard":   return <Dashboard {...props} />;
      case "leads":       return <Leads {...props} />;
      case "properties":  return <Properties {...props} />;
      case "deals":       return <Deals {...props} />;
      case "ai":          return <AIEngine {...props} />;
      case "automations": return <Automations {...props} />;
      case "calendar":    return <CalendarModule {...props} />;
      case "inbox":       return <Inbox {...props} />;
      case "analytics":   return <Analytics {...props} />;
      case "documents":   return <Documents {...props} />;
      case "clients":     return <Clients {...props} />;
      case "team":        return <Team {...props} />;
      case "settings":    return <Settings />;
      default:            return <Dashboard {...props} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: BG, color: TEXT, fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside style={{ width: sidebarOpen ? 220 : 60, transition: "width 0.3s ease", background: "linear-gradient(180deg, #0F0F1A 0%, #0A0A12 100%)", borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ padding: "18px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", borderBottom: `1px solid ${BORDER}` }} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${G}, #F5D76E)`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: BG, flexShrink: 0 }}>A</div>
          {sidebarOpen && <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: 3, color: G }}>AUREUM</span>}
        </div>
        {sidebarOpen && (
          <div style={{ padding: "8px 14px", borderBottom: `1px solid ${BORDER}`, fontSize: 11, color: MUTED }}>
            {DEMO.tenant.name}
          </div>
        )}
        <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
          {nav.map(n => (
            <div key={n.id} onClick={() => setPage(n.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 2, transition: "all 0.2s", background: page === n.id ? `${G}12` : "transparent", color: page === n.id ? G : MUTED, position: "relative" }}>
              <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>{n.icon}</span>
              {sidebarOpen && <span style={{ fontSize: 13, fontWeight: page === n.id ? 700 : 400, flex: 1 }}>{n.label}</span>}
              {n.badge > 0 && (
                <div style={{ background: n.id === "leads" ? "#FF525288" : `${G}44`, color: n.id === "leads" ? "#FF5252" : G, fontSize: 10, fontWeight: 800, minWidth: 18, height: 18, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>
                  {n.badge}
                </div>
              )}
            </div>
          ))}
        </nav>
        {sidebarOpen && (
          <div style={{ padding: 14, borderTop: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: 11, color: MUTED }}>v3.0 · {DEMO_MODE ? "Demo" : "Live"}</div>
            <div style={{ fontSize: 11, color: `${G}88`, marginTop: 2 }}>Supabase: {DEMO_MODE ? "Not connected" : "Connected"}</div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <div style={{ height: 52, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", paddingInline: 24, gap: 12, flexShrink: 0, background: "#0C0C16" }}>
          <div style={{ flex: 1, fontSize: 13, color: MUTED }}>
            {nav.find(n => n.id === page)?.label}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {DEMO_MODE && <div style={{ fontSize: 11, background: `${G}22`, color: G, border: `1px solid ${G}44`, borderRadius: 20, padding: "3px 10px", fontWeight: 700 }}>DEMO MODE</div>}
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${G}22`, border: `1px solid ${G}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: G }}>
              {DEMO.user.full_name.split(" ").map(w => w[0]).join("")}
            </div>
            {sidebarOpen && <div style={{ fontSize: 13 }}>{DEMO.user.full_name}</div>}
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
