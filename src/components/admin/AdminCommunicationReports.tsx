import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  exportProfessionalCSV,
  exportProfessionalPDF,
  type ExportColumn,
} from "@/lib/professionalExportUtils";
import { toast } from "sonner";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";

type DateRange = { from?: string; to?: string };

function isoStart(date: string) {
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}
function isoEnd(date: string) {
  return new Date(`${date}T23:59:59.999Z`).toISOString();
}

function buildSummary<T extends Record<string, any>>(
  rows: T[],
  opts: { severityKey?: string; statusKey?: string; countryKey?: string }
) {
  const counts = (key?: string) => {
    if (!key) return undefined;
    return rows.reduce<Record<string, number>>((acc, r) => {
      const v = r?.[key];
      const label = v === null || v === undefined || v === "" ? "unknown" : String(v);
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
  };

  return {
    totalRecords: rows.length,
    severities: counts(opts.severityKey),
    statuses: counts(opts.statusKey),
    countries: counts(opts.countryKey),
  };
}

export default function AdminCommunicationReports() {
  const [range, setRange] = useState<DateRange>({
    // Default: last 30 days
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
  });
  const [isExporting, setIsExporting] = useState(false);

  const filtersLabel = useMemo(() => {
    const from = range.from || "";
    const to = range.to || "";
    return from && to ? `${from} → ${to}` : from ? `From ${from}` : to ? `Up to ${to}` : "All time";
  }, [range.from, range.to]);

  const fetchWithRange = async <T,>(baseQuery: any, dateField: string = "created_at") => {
    let q = baseQuery;
    if (range.from) q = q.gte(dateField, isoStart(range.from));
    if (range.to) q = q.lte(dateField, isoEnd(range.to));
    const { data, error } = await q;
    if (error) throw error;
    return (data || []) as T[];
  };

  const exportSitrepPDF = async () => {
    setIsExporting(true);
    try {
      const rows = await fetchWithRange<any>(
        supabase
          .from("ocha_documents")
          .select(
            "id,document_type,title,summary,severity_level,country,region,status,valid_from,valid_until,created_at"
          )
          .eq("document_type", "sitrep")
          .order("created_at", { ascending: false })
      );

      const columns: ExportColumn[] = [
        { key: "title", header: "Title", format: "text" },
        { key: "country", header: "Country", format: "text" },
        { key: "region", header: "Region", format: "text" },
        { key: "severity_level", header: "Severity", format: "text" },
        { key: "status", header: "Status", format: "text" },
        { key: "created_at", header: "Created", format: "datetime" },
        { key: "summary", header: "Summary", format: "text" },
      ];

      exportProfessionalPDF({
        metadata: {
          title: "SITREP Export",
          subtitle: `OCHA Documents (SITREP) — ${filtersLabel}`,
          reportType: "communication_sitrep",
          dateRange: { from: range.from, to: range.to },
        },
        columns,
        data: rows,
        summary: buildSummary(rows, {
          severityKey: "severity_level",
          statusKey: "status",
          countryKey: "country",
        }),
        includeAnalytics: true,
      });
    } catch (e: any) {
      toast.error(e?.message || "Failed to export SITREP PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const export3wCSV = async () => {
    setIsExporting(true);
    try {
      const rows = await fetchWithRange<any>(
        supabase
          .from("ocha_documents")
          .select(
            "id,document_type,title,summary,severity_level,country,region,status,created_at,content"
          )
          .eq("document_type", "3w_report")
          .order("created_at", { ascending: false })
      );

      const columns: ExportColumn[] = [
        { key: "title", header: "Title", format: "text" },
        { key: "country", header: "Country", format: "text" },
        { key: "region", header: "Region", format: "text" },
        { key: "status", header: "Status", format: "text" },
        { key: "severity_level", header: "Severity", format: "text" },
        { key: "created_at", header: "Created", format: "datetime" },
        { key: "summary", header: "Summary", format: "text" },
        { key: "content", header: "Content (JSON)", format: "json" },
      ];

      exportProfessionalCSV({
        metadata: {
          title: "3W Report Export",
          subtitle: `OCHA Documents (3W) — ${filtersLabel}`,
          reportType: "communication_3w",
          dateRange: { from: range.from, to: range.to },
        },
        columns,
        data: rows,
        summary: buildSummary(rows, {
          severityKey: "severity_level",
          statusKey: "status",
          countryKey: "country",
        }),
        includeAnalytics: true,
      });
    } catch (e: any) {
      toast.error(e?.message || "Failed to export 3W CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const exportBroadcastDeliveryCSV = async () => {
    setIsExporting(true);
    try {
      const rows = await fetchWithRange<any>(
        supabase
          .from("broadcast_alerts")
          .select(
            "id,title,severity,alert_type,status,sent_at,created_at,requires_acknowledgment,delivery_stats,target_roles,target_countries"
          )
          .order("created_at", { ascending: false })
      );

      // Flatten delivery_stats for analysis-ready export.
      const flat = rows.map((r) => ({
        ...r,
        delivered: r?.delivery_stats?.delivered ?? 0,
        read: r?.delivery_stats?.read ?? 0,
        acknowledged: r?.delivery_stats?.acknowledged ?? 0,
        sent_count: r?.delivery_stats?.sent ?? 0,
      }));

      const columns: ExportColumn[] = [
        { key: "title", header: "Title", format: "text" },
        { key: "alert_type", header: "Type", format: "text" },
        { key: "severity", header: "Severity", format: "text" },
        { key: "status", header: "Status", format: "text" },
        { key: "requires_acknowledgment", header: "Requires Ack", format: "text" },
        { key: "sent_at", header: "Sent At", format: "datetime" },
        { key: "sent_count", header: "Sent", format: "number" },
        { key: "delivered", header: "Delivered", format: "number" },
        { key: "read", header: "Read", format: "number" },
        { key: "acknowledged", header: "Acknowledged", format: "number" },
        { key: "target_roles", header: "Target Roles", format: "json" },
        { key: "target_countries", header: "Target Countries", format: "json" },
        { key: "created_at", header: "Created", format: "datetime" },
      ];

      exportProfessionalCSV({
        metadata: {
          title: "Broadcast Delivery Export",
          subtitle: `Broadcast alerts delivery stats — ${filtersLabel}`,
          reportType: "communication_broadcast_delivery",
          dateRange: { from: range.from, to: range.to },
        },
        columns,
        data: flat,
        summary: buildSummary(flat, {
          severityKey: "severity",
          statusKey: "status",
        }),
        includeAnalytics: true,
      });
    } catch (e: any) {
      toast.error(e?.message || "Failed to export broadcast delivery CSV");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Communication Reports</CardTitle>
          <CardDescription>
            Export admin-ready reports with date filters (PDF/CSV) for analysis and sharing.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>From</Label>
            <Input
              type="date"
              value={range.from || ""}
              onChange={(e) => setRange((r) => ({ ...r, from: e.target.value || undefined }))}
            />
          </div>
          <div className="space-y-2">
            <Label>To</Label>
            <Input
              type="date"
              value={range.to || ""}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value || undefined }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Range</Label>
            <Input value={filtersLabel} readOnly />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sitrep" className="space-y-4">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full">
          <TabsTrigger value="sitrep">SITREP</TabsTrigger>
          <TabsTrigger value="threew">3W</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast Delivery</TabsTrigger>
        </TabsList>

        <TabsContent value="sitrep">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> SITREP PDF
              </CardTitle>
              <CardDescription>
                Exports SITREP documents in a print-ready PDF format.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={exportSitrepPDF} disabled={isExporting}>
                <FileDown className="h-4 w-4 mr-2" /> Export SITREP PDF
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threew">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" /> 3W CSV
              </CardTitle>
              <CardDescription>
                Exports 3W documents as analysis-ready CSV (includes JSON content column).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={export3wCSV} disabled={isExporting}>
                <FileDown className="h-4 w-4 mr-2" /> Export 3W CSV
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcast">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Broadcast Delivery CSV
              </CardTitle>
              <CardDescription>
                Exports broadcasts with delivery counts (sent/delivered/read/acknowledged).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={exportBroadcastDeliveryCSV} disabled={isExporting}>
                <FileDown className="h-4 w-4 mr-2" /> Export Delivery CSV
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
