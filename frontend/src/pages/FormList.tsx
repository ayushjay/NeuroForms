import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, MoreVertical, ExternalLink, BarChart3, Edit, Trash2, Loader2, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { dashboardApi, type FormListItem } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import ShareFormModal from "@/components/dashboard/ShareFormModal";

const FormList = () => {
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareFormId, setShareFormId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchForms = () => {
    setLoading(true);
    dashboardApi.listForms()
      .then(setForms)
      .catch(() => toast({ title: "Failed to load forms", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchForms(); }, []);

  const handleDelete = async (id: number) => {
    try {
      await dashboardApi.deleteForm(id);
      setForms(prev => prev.filter(f => f.id !== id));
      toast({ title: "Form deleted" });
    } catch {
      toast({ title: "Failed to delete form", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">My Forms</h1>
            <p className="text-sm text-muted-foreground mt-1">{forms.length} forms created</p>
          </div>
          <Button variant="teal" asChild>
            <Link to="/dashboard/forms/create">
              <Plus className="w-4 h-4 mr-2" />
              New Form
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : forms.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 shadow-card text-center">
            <p className="text-muted-foreground mb-4">You haven't created any forms yet.</p>
            <Button variant="teal" asChild>
              <Link to="/dashboard/forms/create">
                <Plus className="w-4 h-4 mr-2" /> Create your first form
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {forms.map((form, i) => (
              <motion.div
                key={form.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link to={`/dashboard/forms/${form.id}/edit`} className="font-display font-semibold text-base hover:text-teal transition-colors truncate">
                        {form.title}
                      </Link>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${form.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {form.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{form.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{form.response_count} responses</span>
                      <span>Created {form.created_at}</span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/dashboard/forms/${form.id}/edit`}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/forms/${form.id}`}>
                          <ExternalLink className="w-4 h-4 mr-2" /> Preview
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShareFormId(form.id)}>
                        <Share2 className="w-4 h-4 mr-2" /> Share
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/forms/${form.id}/results`}>
                          <BarChart3 className="w-4 h-4 mr-2" /> Results
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(form.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {shareFormId && (
        <ShareFormModal
          formId={shareFormId}
          isOpen={true}
          onClose={() => setShareFormId(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default FormList;

