import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Plus, Users, BarChart3, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi, type DashboardStats } from "@/lib/api";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.stats()
      .then(setStats)
      .catch(() => setStats({ total_forms: 0, total_responses: 0, active_forms: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Total Forms", value: stats?.total_forms ?? 0, icon: FileText, color: "text-teal" },
    { label: "Total Responses", value: stats?.total_responses ?? 0, icon: Users, color: "text-teal" },
    { label: "Active Forms", value: stats?.active_forms ?? 0, icon: BarChart3, color: "text-success" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2">
            Welcome back{user ? `, ${user.first_name || user.username}` : ""}
          </h1>
          <p className="text-muted-foreground">Here's an overview of your survey activity.</p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl border border-border p-5 shadow-card"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              ) : (
                <p className="font-display text-3xl font-bold">{stat.value}</p>
              )}
            </motion.div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border p-8 shadow-card text-center">
          <h3 className="font-display text-lg font-semibold mb-2">Ready to create a new survey?</h3>
          <p className="text-sm text-muted-foreground mb-4">Build a psychometric instrument in minutes.</p>
          <Button variant="teal" asChild>
            <Link to="/dashboard/forms/create">
              <Plus className="w-4 h-4 mr-2" />
              Create New Form
            </Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
