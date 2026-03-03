import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type AlertSeverityLevel = "green" | "yellow" | "orange" | "red";
type ChannelType =
  | "coordination"
  | "broadcast"
  | "field_report"
  | "direct"
  | "emergency";
type DocumentType =
  | "sitrep"
  | "flash_update"
  | "bulletin"
  | "3w_report"
  | "meeting_notes"
  | "action_tracker";

function isoHoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin guard
    const { data: roleRows, error: roleErr } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    if (roleErr) throw roleErr;
    const roles = (roleRows || []).map((r: any) => r.role);
    if (!roles.includes("admin")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json().catch(() => ({}))) as { mode?: string };
    const mode = body?.mode || "reset";

    // Idempotent: wipe previous DEMO content so re-seeding is safe.
    // mode = "clear" will only delete; mode = "reset" deletes then re-inserts.
    if (mode === "reset" || mode === "clear") {
      await supabase
        .from("message_acknowledgments")
        .delete()
        .ilike("acknowledgment_note", "[DEMO]%");
      await supabase
        .from("broadcast_acknowledgments")
        .delete()
        .ilike("acknowledgment_note", "[DEMO]%");
      await supabase.from("channel_messages").delete().ilike("content", "[DEMO]%");
      await supabase.from("escalation_logs").delete().ilike("reason", "[DEMO]%");
      await supabase.from("field_reports").delete().ilike("title", "[DEMO]%");
      await supabase.from("broadcast_alerts").delete().ilike("title", "[DEMO]%");
      await supabase.from("ocha_documents").delete().ilike("title", "[DEMO]%");
      await supabase.from("communication_channels").delete().ilike("name", "[DEMO]%");
    }

    if (mode === "clear") {
      return new Response(
        JSON.stringify({
          success: true,
          cleared: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const countries = [
      "Kenya",
      "Uganda",
      "Ethiopia",
      "Somalia",
      "DRC",
      "Nigeria",
      "Sudan",
      "South Sudan",
      "Mali",
      "Burkina Faso",
    ];
    const regions = [
      "Nairobi",
      "Kampala",
      "Addis Ababa",
      "Mogadishu",
      "Goma",
      "Maiduguri",
      "Khartoum",
      "Juba",
      "Gao",
      "Ouagadougou",
    ];
    const severities: AlertSeverityLevel[] = ["green", "yellow", "orange", "red"];

    // 1) Channels
    const channelSeed: Array<{
      name: string;
      description: string;
      channel_type: ChannelType;
      is_emergency: boolean;
      allowed_roles: string[];
      country_scope: string[];
      metadata: Record<string, unknown>;
    }> = [
      {
        name: "[DEMO] East Africa Coordination",
        description: "Daily coordination, access constraints, and partner updates.",
        channel_type: "coordination",
        is_emergency: false,
        allowed_roles: ["admin", "government", "partner", "verifier"],
        country_scope: ["Kenya", "Uganda", "Ethiopia", "Somalia"],
        metadata: { demo: true, theme: "coordination" },
      },
      {
        name: "[DEMO] Rapid Response - Floods",
        description: "Time-sensitive flood response coordination and alerts.",
        channel_type: "emergency",
        is_emergency: true,
        allowed_roles: ["admin", "government", "partner"],
        country_scope: ["Kenya", "Uganda"],
        metadata: { demo: true, hazard: "flood" },
      },
      {
        name: "[DEMO] Sahel Access & Security",
        description: "Access incidents, movement restrictions, and security advisories.",
        channel_type: "coordination",
        is_emergency: false,
        allowed_roles: ["admin", "partner", "government"],
        country_scope: ["Mali", "Burkina Faso"],
        metadata: { demo: true, theme: "access_security" },
      },
      {
        name: "[DEMO] Field Reporting - North East",
        description: "Field-to-HQ updates, needs snapshots, and verification requests.",
        channel_type: "field_report",
        is_emergency: false,
        allowed_roles: ["admin", "partner", "verifier"],
        country_scope: ["Nigeria", "DRC"],
        metadata: { demo: true, theme: "field_reporting" },
      },
      {
        name: "[DEMO] Inter-Cluster Bulletin",
        description: "Bulletins, meeting notes, and action tracking coordination.",
        channel_type: "broadcast",
        is_emergency: false,
        allowed_roles: ["admin", "partner", "government"],
        country_scope: ["Sudan", "South Sudan"],
        metadata: { demo: true, theme: "bulletin" },
      },
    ];

    const { data: channels, error: channelErr } = await supabase
      .from("communication_channels")
      .insert(
        channelSeed.map((c) => ({
          ...c,
          is_active: true,
          created_by: user.id,
        }))
      )
      .select("id,name,channel_type");
    if (channelErr) throw channelErr;

    const channelIdByName = new Map<string, string>();
    (channels || []).forEach((c: any) => channelIdByName.set(c.name, c.id));

    // 2) Messages
    const messageTemplates = [
      "[DEMO] Situation update: road access improving after clearance operations.",
      "[DEMO] Request: confirm partner presence and stock levels for the next 72 hours.",
      "[DEMO] Security note: increased checkpoints reported; recommend daylight movements.",
      "[DEMO] Coordination: next inter-agency call at 14:00 local; share agenda items.",
      "[DEMO] Data check: please validate affected population figures in latest snapshot.",
      "[DEMO] Reminder: submit 3W updates by end of day for consolidated report.",
      "[DEMO] Rumor tracking: unverified reports circulating; awaiting confirmation.",
      "[DEMO] Logistics: warehouse capacity at 82%; prioritize cold-chain items.",
      "[DEMO] Health: clinics reporting increased caseload; need rapid assessment support.",
      "[DEMO] WASH: borehole repairs ongoing; ETA for completion is 24-36 hours.",
    ];

    const messagesToInsert: any[] = [];
    for (const c of channelSeed) {
      const channelId = channelIdByName.get(c.name);
      if (!channelId) continue;

      const count = c.is_emergency ? 18 : 12;
      for (let i = 0; i < count; i++) {
        const priority: AlertSeverityLevel = c.is_emergency
          ? pick<AlertSeverityLevel>(["yellow", "orange", "red"])
          : pick(severities);

        messagesToInsert.push({
          channel_id: channelId,
          sender_id: user.id,
          content: pick(messageTemplates),
          priority,
          message_type: "text",
          status: "sent",
          metadata: {
            demo: true,
            simulated_sender: pick([
              "OCHA Field",
              "WFP Ops",
              "UNHCR",
              "WHO",
              "Local Partner",
            ]),
            country: pick(c.country_scope),
            region: pick(regions),
          },
          created_at: isoHoursAgo(48 - i * 2),
          updated_at: isoHoursAgo(48 - i * 2),
        });
      }
    }

    const { data: insertedMessages, error: msgErr } = await supabase
      .from("channel_messages")
      .insert(messagesToInsert)
      .select("id")
      .limit(50);
    if (msgErr) throw msgErr;

    // 3) OCHA Documents
    const docSeed: Array<{
      document_type: DocumentType;
      title: string;
      summary: string;
      severity_level: AlertSeverityLevel;
      country: string;
      region: string;
      status: string;
      valid_from: string;
      metadata: Record<string, unknown>;
      content: Record<string, unknown>;
    }> = [
      {
        document_type: "sitrep",
        title: "[DEMO] SITREP #12 - Flood Response (East Africa)",
        summary:
          "Consolidated operational overview, access constraints, and priority needs.",
        severity_level: "orange",
        country: "Kenya",
        region: "Nairobi",
        status: "published",
        valid_from: isoHoursAgo(24),
        metadata: { demo: true, doc_series: "sitrep" },
        content: {
          sections: {
            overview: "Rainfall has increased displacement in riverine areas.",
            access: "Main corridor open with intermittent delays.",
            response: "Partners scaling WASH and shelter support.",
            gaps: "Limited NFIs in remote settlements.",
          },
          key_figures: {
            affected: 184000,
            displaced: 39200,
            reached_last_7d: 61400,
          },
        },
      },
      {
        document_type: "flash_update",
        title: "[DEMO] Flash Update - Access Incident (Sahel)",
        summary:
          "Short operational update following access incident affecting movements.",
        severity_level: "yellow",
        country: "Mali",
        region: "Gao",
        status: "submitted",
        valid_from: isoHoursAgo(10),
        metadata: { demo: true, doc_series: "flash" },
        content: {
          incident: "Temporary movement restrictions imposed on key route.",
          recommendations: ["Use alternate corridor", "Increase comms check-ins"],
        },
      },
      {
        document_type: "3w_report",
        title: "[DEMO] 3W Snapshot - Nigeria (NE)",
        summary: "Who/What/Where snapshot for ongoing response activities.",
        severity_level: "green",
        country: "Nigeria",
        region: "Maiduguri",
        status: "draft",
        valid_from: isoHoursAgo(6),
        metadata: { demo: true, report_type: "3w" },
        content: {
          organizations: 42,
          activities: ["WASH", "Shelter", "Health", "Protection"],
          hotspots: ["MMC", "Jere", "Konduga"],
        },
      },
      {
        document_type: "meeting_notes",
        title: "[DEMO] Inter-Cluster Meeting Notes - Sudan",
        summary: "Key decisions, action items, and deadlines from ICCG meeting.",
        severity_level: "orange",
        country: "Sudan",
        region: "Khartoum",
        status: "published",
        valid_from: isoHoursAgo(36),
        metadata: { demo: true, meeting: "ICCG" },
        content: {
          decisions: [
            "Prioritize deconfliction for convoys",
            "Update needs snapshot weekly",
          ],
          action_items: [
            { owner: "WFP", action: "Share pipeline update", due: "T+2d" },
            { owner: "UNICEF", action: "WASH gap mapping", due: "T+5d" },
          ],
        },
      },
    ];

    const { data: insertedDocs, error: docErr } = await supabase
      .from("ocha_documents")
      .insert(
        docSeed.map((d) => ({
          ...d,
          created_by: user.id,
        }))
      )
      .select("id");
    if (docErr) throw docErr;

    // 4) Broadcast Alerts
    const broadcastSeed = [
      {
        title: "[DEMO] Flood Warning - Low-lying Areas",
        message:
          "Heavy rainfall expected. Review evacuation plans and verify shelter capacity.",
        severity: "orange" as AlertSeverityLevel,
        alert_type: "hazard",
        target_roles: ["government", "partner"],
        target_countries: ["Kenya", "Uganda"],
        requires_acknowledgment: true,
        status: "active",
        sent_at: isoHoursAgo(4),
        delivery_stats: { sent: 420, delivered: 396, read: 312, acknowledged: 168 },
        metadata: { demo: true, source: "hydromet" },
      },
      {
        title: "[DEMO] Security Advisory - Route Deconfliction",
        message:
          "Confirm convoy movements via coordination channel before departure.",
        severity: "yellow" as AlertSeverityLevel,
        alert_type: "security",
        target_roles: ["partner"],
        target_countries: ["Mali", "Burkina Faso"],
        requires_acknowledgment: false,
        status: "draft",
        sent_at: null,
        delivery_stats: { sent: 0, delivered: 0, read: 0, acknowledged: 0 },
        metadata: { demo: true, source: "security_cell" },
      },
      {
        title: "[DEMO] Critical: Communications Outage (Field)",
        message:
          "Field comms instability reported. Switch to fallback procedures.",
        severity: "red" as AlertSeverityLevel,
        alert_type: "operational",
        target_roles: ["admin", "government", "partner"],
        target_countries: ["DRC"],
        requires_acknowledgment: true,
        status: "active",
        sent_at: isoHoursAgo(2),
        delivery_stats: { sent: 210, delivered: 182, read: 140, acknowledged: 86 },
        metadata: { demo: true, source: "field_ops" },
      },
    ];

    const { data: insertedBroadcasts, error: bErr } = await supabase
      .from("broadcast_alerts")
      .insert(
        broadcastSeed.map((b) => ({
          ...b,
          created_by: user.id,
          approved_by: user.id,
          target_regions: null,
          acknowledgment_deadline: b.requires_acknowledgment
            ? isoHoursAgo(-24) // 24h from now
            : null,
          expires_at: null,
        }))
      )
      .select("id");
    if (bErr) throw bErr;

    // 5) Field Reports
    const fieldReportTypes = [
      "assessment_request",
      "situation_update",
      "logistics_update",
      "security_update",
    ];
    const statuses = [
      "submitted",
      "received",
      "processing",
      "actioned",
      "closed",
    ];

    const fieldReportsToInsert = Array.from({ length: 18 }).map((_, i) => {
      const country = pick(countries);
      const region = pick(regions);
      const status = pick(statuses);
      const priority = pick([1, 2, 3, 4, 5]);
      const severity = pick(severities);

      return {
        report_type: pick(fieldReportTypes),
        title: `[DEMO] Field Report #${i + 1} - ${country}`,
        content:
          "[DEMO] Observations include population movement, service disruption, and immediate needs. Request validation and triage for follow-up actions.",
        location_country: country,
        location_region: region,
        location_coordinates: { lat: -1.25 + Math.random() * 10, lng: 32 + Math.random() * 15 },
        severity,
        status,
        priority,
        reporter_id: user.id,
        metadata: { demo: true, source: "field_team", batch: "v1" },
        created_at: isoHoursAgo(72 - i * 3),
        updated_at: isoHoursAgo(72 - i * 3),
      };
    });

    const { data: insertedFieldReports, error: frErr } = await supabase
      .from("field_reports")
      .insert(fieldReportsToInsert)
      .select("id");
    if (frErr) throw frErr;

    // 6) Escalations
    const escalationToInsert = Array.from({ length: 8 }).map((_, i) => ({
      escalation_level: pick([1, 2, 3]),
      escalated_to: [user.id],
      escalated_roles: ["admin", "government"],
      reason: `[DEMO] Escalation triggered by pending acknowledgment / SLA breach simulation (#${i + 1}).`,
      status: pick(["pending", "acknowledged", "resolved"]),
      sla_deadline: isoHoursAgo(-6),
      metadata: { demo: true, rule: "sla_ack" },
      created_at: isoHoursAgo(18 - i * 2),
    }));

    const { data: insertedEscalations, error: escErr } = await supabase
      .from("escalation_logs")
      .insert(escalationToInsert)
      .select("id");
    if (escErr) throw escErr;

    // 7) Acknowledgments (lightweight, for analytics)
    const someMessageIds = (insertedMessages || []).slice(0, 12).map((m: any) => m.id);
    if (someMessageIds.length) {
      await supabase.from("message_acknowledgments").insert(
        someMessageIds.map((id: string, idx: number) => ({
          message_id: id,
          user_id: user.id,
          acknowledgment_note: `[DEMO] Ack note ${idx + 1}: received and actioned.`,
        }))
      );
    }

    const someBroadcastIds = (insertedBroadcasts || []).slice(0, 2).map((b: any) => b.id);
    if (someBroadcastIds.length) {
      await supabase.from("broadcast_acknowledgments").insert(
        someBroadcastIds.map((id: string, idx: number) => ({
          broadcast_id: id,
          user_id: user.id,
          acknowledgment_note: `[DEMO] Broadcast ack ${idx + 1}: confirmed receipt.`,
        }))
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        counts: {
          channels: channelSeed.length,
          messages: messagesToInsert.length,
          documents: docSeed.length,
          broadcasts: broadcastSeed.length,
          field_reports: fieldReportsToInsert.length,
          escalations: escalationToInsert.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("seed-communication-demo error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to seed demo data",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
