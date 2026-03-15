import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ArrowLeft, Users, TrendingUp, Loader2, Download } from "lucide-react";
import { motion } from "framer-motion";
import html2pdf from "html2pdf.js";
import { formApi, type ResultsData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const FormResults = () => {
  const { id } = useParams();
  const formId = Number(id);
  const { toast } = useToast();

  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const COLORS = useMemo(
    () => [
      "#0f766e",
      "#0369a1",
      "#7c3aed",
      "#ea580c",
      "#22c55e",
      "#e11d48",
      "#facc15",
      "#6366f1",
      "#14b8a6",
      "#f97316",
    ],
    []
  );

  useEffect(() => {
    formApi.results(formId)
      .then(setResults)
      .catch(() =>
        toast({ title: "Failed to load results", variant: "destructive" })
      )
      .finally(() => setLoading(false));
  }, [formId]);

  const constructSummary =
    results && results.construct_averages
      ? Object.entries(results.construct_averages).map(([construct, average]) => {
          const dist = results.construct_distributions?.[construct] ?? [];
          const min = dist.length ? Math.min(...dist) : 0;
          const max = dist.length ? Math.max(...dist) : 0;
          const variance =
            dist.length > 1
              ? dist.reduce((acc, v) => acc + (v - average) ** 2, 0) / (dist.length - 1)
              : 0;
          const stddev = Math.sqrt(variance);
          return {
            construct,
            average: Number(average.toFixed(2)),
            min: Number(min.toFixed(2)),
            max: Number(max.toFixed(2)),
            stddev: Number(stddev.toFixed(2)),
          };
        })
      : [];

  const timelineData =
    results?.timeline?.map((t) => ({
      date: t.date,
      count: t.count,
    })) ?? [];

  const questionPieChartsData = useMemo(() => {
    if (!results?.question_stats?.length) return [];

    return results.question_stats
      .filter((q) => q.options && q.options.length > 0)
      .map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        avg_time: q.avg_time,
        options: q.options.map((opt) => ({
          name: opt.name,
          value: opt.count,
        })),
      }));
  }, [results]);

  /* ---------------- PDF EXPORT ---------------- */

  const handleExportPDF = () => {
    setExporting(true);

    const element = document.getElementById("pdf-export-content");
    if (!element) {
      setExporting(false);
      return;
    }

    const opt = {
      margin: 0.5,
      filename: `Form_${id}_Results.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => setExporting(false))
      .catch(() => {
        toast({
          title: "Export failed",
          description: "Could not generate PDF",
          variant: "destructive",
        });
        setExporting(false);
      });
  };

  /* ---------------- CSV EXPORT ---------------- */

  const handleExportCSV = () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      toast({ title: "Unauthorized", variant: "destructive" });
      return;
    }

    setExporting(true);

    fetch(`/api/dashboard/forms/${id}/export_csv/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Export failed");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `form_${id}_responses.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      })
      .finally(() => setExporting(false));
  };

  /* ---------------- INDIVIDUAL RESPONSES ---------------- */

  const renderIndividualResponses = () => {
    if (!results?.individual_responses?.length) return null;

    return (
      <div className="space-y-6 mt-12">
        <h3 className="font-display font-semibold text-xl">
          Individual Responses & Percentiles
        </h3>

        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4">Respondent</th>
                  <th className="px-6 py-4">Date</th>

                  {results.construct_names?.map((c) => (
                    <th key={c} className="px-6 py-4">
                      {c} Score
                    </th>
                  ))}

                  {results.construct_names?.map((c) => (
                    <th key={`pct-${c}`} className="px-6 py-4">
                      {c} %ile
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {results.individual_responses.map((resp: any) => (
                  <tr key={resp.id}>
                    <td className="px-6 py-4">{resp.email}</td>

                    <td className="px-6 py-4">
                      {new Date(resp.submitted_at).toLocaleDateString()}
                    </td>

                    {results.construct_names?.map((c) => (
                      <td key={c} className="px-6 py-4">
                        {resp.scores[c] || 0}
                      </td>
                    ))}

                    {results.construct_names?.map((c) => (
                      <td key={`pct-${c}`} className="px-6 py-4">
                        {resp.percentiles[c] || 0}th
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* ---------------- CORRELATION MATRIX ---------------- */

  const renderCorrelationMatrix = () => {
    if (!results?.correlation_matrix?.length) return null;

    const names = results.construct_names || [];

    return (
      <div className="space-y-6 mt-12">
        <h3 className="font-display font-semibold text-xl">
          Construct Correlation Matrix
        </h3>

        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <table className="w-full text-sm text-center">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left">Construct</th>

                {names.map((c) => (
                  <th key={c} className="px-4 py-3">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {results.correlation_matrix.map((row: any) => (
                <tr key={row.construct}>
                  <td className="px-4 py-3 text-left">{row.construct}</td>

                  {names.map((c) => (
                    <td key={c} className="px-4 py-3">
                      {row[c]?.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* ---------------- DEMOGRAPHIC CROSS ANALYSIS ---------------- */

  const renderCrossAnalysis = () => {
    if (!results?.cross_analysis?.length) return null;

    return (
      <div className="space-y-10 mt-12">
        <h3 className="font-display font-semibold text-xl">
          Demographic Cross Analysis
        </h3>

        <div className="space-y-8">
          {results.cross_analysis.map((demo) => (
            <div
              key={demo.demographic}
              className="bg-card rounded-xl border border-border shadow-card p-4 space-y-4"
            >
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <p className="font-medium text-sm">{demo.demographic}</p>
                <p className="text-xs text-muted-foreground">
                  Average construct scores by group
                </p>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demo.groups}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="group_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {results.construct_names?.map((c, index) => (
                      <Bar
                        key={c}
                        dataKey={c}
                        name={c}
                        fill={COLORS[index % COLORS.length]}
                        stackId={undefined}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="flex justify-between">
          <div>
            <Link to="/dashboard/forms" className="text-sm flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to forms
            </Link>

            <h1 className="text-2xl font-bold">Results & Analytics</h1>
            <p className="text-sm text-muted-foreground">Form #{id}</p>
          </div>

          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="btn">
              <Download className="w-4 h-4" />
              CSV
            </button>

            <button onClick={handleExportPDF} className="btn bg-teal text-white">
              <Download className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>

        <div id="pdf-export-content" className="space-y-8">

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 border rounded-xl">
              <Users className="w-5 h-5" />
              <p className="text-3xl font-bold">
                {results?.total_responses ?? 0}
              </p>
            </div>
          </div>

          {/* Response timeline */}
          {timelineData.length > 0 && (
            <div className="mt-6 bg-card rounded-xl border border-border shadow-card p-4 space-y-3">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <p className="font-display font-semibold text-lg">
                  Responses Over Time
                </p>
                <p className="text-xs text-muted-foreground">
                  Daily submission counts
                </p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#0f766e"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Construct summary bar chart */}
          {constructSummary.length > 0 && (
            <div className="mt-6 bg-card rounded-xl border border-border shadow-card p-4 space-y-3">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <p className="font-display font-semibold text-lg">
                  Construct Score Summary
                </p>
                <p className="text-xs text-muted-foreground">
                  Mean ± variability per construct
                </p>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={constructSummary}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="construct" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="average" name="Average score" fill="#0f766e" />
                    {/* Visualize spread via min/max as thin bars */}
                    <Bar dataKey="min" name="Min" fill="#e5e7eb" />
                    <Bar dataKey="max" name="Max" fill="#9ca3af" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Question-wise pie charts */}
          {questionPieChartsData.length > 0 && (
            <div className="mt-10 space-y-6">
              <h3 className="font-display font-semibold text-xl">
                Question-wise Response Distribution
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {questionPieChartsData.map((q) => (
                  <div
                    key={q.id}
                    className="bg-card rounded-xl border border-border shadow-card p-4 space-y-3"
                  >
                    <div>
                      <p className="font-medium text-sm mb-1">{q.text}</p>
                      <p className="text-xs text-muted-foreground">
                        Avg time: {q.avg_time.toFixed(2)}s
                      </p>
                    </div>

                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={q.options}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                          >
                            {q.options.map((entry, index) => (
                              <Cell
                                key={`cell-${q.id}-${entry.name}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => [`${value} responses`, "Count"]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {renderIndividualResponses()}
          {renderCorrelationMatrix()}
          {renderCrossAnalysis()}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default FormResults;