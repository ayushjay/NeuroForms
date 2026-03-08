import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { dashboardApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const CreateForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await dashboardApi.createForm({ title, description });
      navigate(`/dashboard/forms/${res.id}/edit`);
    } catch {
      toast({ title: "Failed to create form", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold mb-6">Create New Form</h1>

          <div className="bg-card rounded-xl border border-border p-8 shadow-card">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Form Title</Label>
                <Input id="title" placeholder="e.g. Beck Depression Inventory (BDI-II)" value={title} onChange={e => setTitle(e.target.value)} required disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea id="description" placeholder="Briefly describe the purpose of this survey..." value={description} onChange={e => setDescription(e.target.value)} rows={4} disabled={loading} />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate("/dashboard/forms")} disabled={loading}>Cancel</Button>
                <Button type="submit" variant="teal" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create & Add Questions
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default CreateForm;
