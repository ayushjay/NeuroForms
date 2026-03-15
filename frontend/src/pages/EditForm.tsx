import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Loader2, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { dashboardApi, type QuestionData, type OptionData, type TemplateData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { AnswerType } from "@/types/form";
import ShareFormModal from "@/components/dashboard/ShareFormModal";
import TemplateModal from "@/components/dashboard/TemplateModal";

const ANSWER_TYPES: { value: AnswerType; label: string }[] = [
  { value: "paragraph", label: "Paragraph" },
  { value: "mcq", label: "Multiple Choice" },
  { value: "checkbox", label: "Checkbox" },
  { value: "dropdown", label: "Dropdown" },
  { value: "linear", label: "Linear Scale" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
  { value: "file", label: "File Upload" },
];

const needsOptions = (type: string) => ["mcq", "checkbox", "dropdown"].includes(type);

const EditForm = () => {
  const { id } = useParams();
  const formId = Number(id);
  const { toast } = useToast();
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [formTitle, setFormTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [importingTemplate, setImportingTemplate] = useState(false);

  // New question draft
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<AnswerType>("mcq");
  const [newRequired, setNewRequired] = useState(false);
  const [addingQuestion, setAddingQuestion] = useState(false);

  useEffect(() => {
    dashboardApi.getForm(formId)
      .then(data => {
        setFormTitle(data.title);
        setQuestions(data.questions || []);
      })
      .catch(() => toast({ title: "Failed to load form", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [formId]);

  const addQuestion = async () => {
    if (!newTitle.trim()) return;
    setAddingQuestion(true);
    try {
      const q = await dashboardApi.addQuestion(formId, {
        title: newTitle,
        answer_type: newType,
        required: newRequired,
      });
      setQuestions(prev => [...prev, q]);
      setNewTitle("");
      setNewRequired(false);
      setExpandedQ(q.id);
    } catch {
      toast({ title: "Failed to add question", variant: "destructive" });
    } finally {
      setAddingQuestion(false);
    }
  };

  const importTemplate = async (template: TemplateData) => {
    setImportingTemplate(true);
    setTemplateModalOpen(false);
    
    try {
      let currentExpanded: number | null = null;
      for (const tq of template.questions) {
        const q = await dashboardApi.addQuestion(formId, {
          title: tq.title,
          answer_type: tq.answer_type,
          required: tq.required,
        });
        
        // Add default linear scale options if it's a linear scale test
        if (tq.answer_type === "linear") {
          await dashboardApi.addOption(q.id, { text: "1 - Strongly Disagree", score: 1 });
          await dashboardApi.addOption(q.id, { text: "2 - Disagree", score: 2 });
          await dashboardApi.addOption(q.id, { text: "3 - Neutral", score: 3 });
          await dashboardApi.addOption(q.id, { text: "4 - Agree", score: 4 });
          await dashboardApi.addOption(q.id, { text: "5 - Strongly Agree", score: 5 });
        }
        
        currentExpanded = q.id;
      }
      
      // Reload form to get perfect state with all options cleanly
      const data = await dashboardApi.getForm(formId);
      setQuestions(data.questions || []);
      
      toast({ title: `Successfully imported ${template.question_count} questions from ${template.name}` });
      if (currentExpanded) setExpandedQ(currentExpanded);
    } catch {
      toast({ title: "Failed to import template questions", variant: "destructive" });
    } finally {
      setImportingTemplate(false);
    }
  };

  const removeQuestion = (qId: number) => {
    // TODO: add DELETE endpoint on Django side
    setQuestions(prev => prev.filter(q => q.id !== qId));
  };

  const addOption = async (qId: number, text: string) => {
    try {
      const opt = await dashboardApi.addOption(qId, { text, score: 0 });
      setQuestions(prev =>
        prev.map(q =>
          q.id === qId ? { ...q, options: [...q.options, opt] } : q
        )
      );
    } catch {
      toast({ title: "Failed to add option", variant: "destructive" });
    }
  };

  const updateOptionScore = (qId: number, optId: number, score: number) => {
    // TODO: add PATCH endpoint on Django side
    setQuestions(prev =>
      prev.map(q =>
        q.id === qId
          ? { ...q, options: q.options.map(o => o.id === optId ? { ...o, score } : o) }
          : q
      )
    );
  };

  const removeOption = (qId: number, optId: number) => {
    // TODO: add DELETE endpoint on Django side
    setQuestions(prev =>
      prev.map(q =>
        q.id === qId
          ? { ...q, options: q.options.filter(o => o.id !== optId) }
          : q
      )
    );
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
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start">
          <div>
            <h1 className="font-display text-2xl font-bold">{formTitle || "Edit Form"}</h1>
            <p className="text-sm text-muted-foreground mt-1">Form #{id} — Add questions and configure scoring</p>
          </div>
          <Button variant="outline" onClick={() => setShareModalOpen(true)}>
            Share
          </Button>
        </motion.div>

        {/* Questions list */}
        <div className="space-y-3">
          <AnimatePresence>
            {questions.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card rounded-xl border border-border shadow-card overflow-hidden"
              >
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer"
                  onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-teal bg-teal/10 px-2 py-0.5 rounded">Q{i + 1}</span>
                      <span className="font-medium text-sm truncate">{q.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{q.answer_type} {q.required && "• Required"}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); removeQuestion(q.id); }}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                  {expandedQ === q.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>

                {expandedQ === q.id && needsOptions(q.answer_type) && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground">Options & Scoring</p>
                    {q.options.map(opt => (
                      <div key={opt.id} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full border-2 border-border shrink-0" />
                        <span className="text-sm flex-1">{opt.text}</span>
                        <div className="flex items-center gap-1.5">
                          <Label className="text-xs text-muted-foreground">Score:</Label>
                          <Input
                            type="number"
                            value={opt.score}
                            onChange={e => updateOptionScore(q.id, opt.id, Number(e.target.value))}
                            className="w-16 h-7 text-xs"
                          />
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeOption(q.id, opt.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <OptionAdder onAdd={(text) => addOption(q.id, text)} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add question form */}
        <div className="bg-card rounded-xl border-2 border-dashed border-teal/30 p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-semibold text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal" />
              Add Question
            </h3>
            <Button variant="outline" size="sm" onClick={() => setTemplateModalOpen(true)} disabled={importingTemplate}>
              {importingTemplate ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BookOpen className="w-4 h-4 mr-2" />}
              Import Template
            </Button>
          </div>
          <div className="space-y-3">
            <Input placeholder="Question text..." value={newTitle} onChange={e => setNewTitle(e.target.value)} disabled={addingQuestion} />
            <div className="flex flex-wrap gap-3 items-center">
              <Select value={newType} onValueChange={v => setNewType(v as AnswerType)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANSWER_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Switch checked={newRequired} onCheckedChange={setNewRequired} id="required" />
                <Label htmlFor="required" className="text-sm">Required</Label>
              </div>
              <Button variant="teal" size="sm" onClick={addQuestion} disabled={!newTitle.trim() || addingQuestion}>
                {addingQuestion && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>
      {shareModalOpen && (
        <ShareFormModal
          formId={formId}
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />
      )}
      <TemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onImport={importTemplate}
      />
    </DashboardLayout>
  );
};

const OptionAdder = ({ onAdd }: { onAdd: (text: string) => void }) => {
  const [text, setText] = useState("");
  return (
    <div className="flex items-center gap-2">
      <Input placeholder="Add option..." value={text} onChange={e => setText(e.target.value)} className="h-8 text-sm" onKeyDown={e => { if (e.key === "Enter" && text.trim()) { onAdd(text.trim()); setText(""); } }} />
      <Button variant="outline" size="sm" onClick={() => { if (text.trim()) { onAdd(text.trim()); setText(""); } }} className="h-8">Add</Button>
    </div>
  );
};

export default EditForm;
