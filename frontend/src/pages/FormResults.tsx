import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
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

  useEffect(() => {
    formApi.results(formId)
      .then(setResults)
      .catch(() => toast({ title: "Failed to load results", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [formId]);

  const chartData = results
    ? Object.entries(results.construct_averages).map(([construct, average]) => ({
        construct,
        average: Number(average.toFixed(2)),
      }))
    : [];

  const handleExportPDF = () => {
    setExporting(true);
    const element = document.getElementById("pdf-export-content");
    
    // Configure html2pdf options for high quality output
    const opt = {
      margin:       0.5,
      filename:     `Form_${id}_Results.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => setExporting(false))
      .catch(() => {
        toast({ title: "Export failed", description: "Could not generate PDF", variant: "destructive" });
        setExporting(false);
      });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-start">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/dashboard/forms" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to forms
            </Link>
            <h1 className="font-display text-2xl font-bold">Results & Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">Form #{id}</p>
          </motion.div>
          
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleExportPDF}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal/90 transition-colors disabled:opacity-50 font-medium text-sm shadow-sm"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? "Exporting..." : "Export PDF"}
          </motion.button>
        </div>

        <div id="pdf-export-content" className="space-y-8 bg-background p-2 -m-2 rounded-xl">

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center gap-3 mb-1">
              <Users className="w-5 h-5 text-teal" />
              <span className="text-sm text-muted-foreground">Total Responses</span>
            </div>
            <p className="font-display text-3xl font-bold">{results?.total_responses ?? 0}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center gap-3 mb-1">
              <TrendingUp className="w-5 h-5 text-teal" />
              <span className="text-sm text-muted-foreground">Constructs Measured</span>
            </div>
            <p className="font-display text-3xl font-bold">{chartData.length}</p>
          </div>
        </div>

        {chartData.length > 0 && (
          <>
            <div className="bg-card rounded-xl border border-border p-6 shadow-card">
              <h3 className="font-display font-semibold mb-6">Construct Averages</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(220 13% 88%)" />
                    <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="construct" tick={{ fontSize: 13 }} width={100} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(220 13% 88%)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Bar dataKey="average" fill="hsl(174 62% 42%)" radius={[0, 6, 6, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              <div className="p-5 border-b border-border">
                <h3 className="font-display font-semibold">Construct Breakdown</h3>
              </div>
              <div className="divide-y divide-border">
                {chartData.map(item => (
                  <div key={item.construct} className="flex items-center justify-between px-5 py-4">
                    <span className="font-medium text-sm">{item.construct}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full gradient-teal" style={{ width: `${(item.average / 5) * 100}%` }} />
                      </div>
                      <span className="text-sm font-mono text-muted-foreground w-10 text-right">{item.average}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FormResults;
