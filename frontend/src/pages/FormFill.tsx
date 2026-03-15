import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { formApi, type FormDetail, type QuestionData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const FormFill = () => {
  const { id } = useParams();
  const formId = Number(id);
  const { toast } = useToast();
  const [form, setForm] = useState<FormDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timers, setTimers] = useState<Record<number, number>>({});
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);

  // Timer effect
  useEffect(() => {
    if (!activeQuestionId || submitted || submitting) return;

    const interval = setInterval(() => {
      setTimers(prev => ({
        ...prev,
        [activeQuestionId]: (prev[activeQuestionId] || 0) + 1
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeQuestionId, submitted, submitting]);

  useEffect(() => {
    formApi.get(formId)
      .then(setForm)
      .catch(() => toast({ title: "Form not found", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [formId]);

  const setAnswer = (qId: number, value: any) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        email: form?.require_email ? email : undefined,
        answers: Object.entries(answers).map(([qId, value]) => ({
          question_id: Number(qId),
          value,
          time_taken: timers[Number(qId)] || 0,
        })),
      };
      await formApi.submit(formId, payload);
      setSubmitted(true);
    } catch {
      toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <p className="text-muted-foreground">Form not found.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Response Submitted</h2>
          <p className="text-muted-foreground">Thank you for completing this survey.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center">
              <Brain className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-display font-semibold text-sm text-muted-foreground">NeuroForms</span>
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">{form.title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{form.description}</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {form.require_email && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-5 shadow-card">
              <Label className="font-medium">Email Address <span className="text-destructive">*</span></Label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="mt-2" required />
            </motion.div>
          )}

          {form.questions.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveQuestionId(q.id)}
              className={`bg-card rounded-xl border p-5 shadow-card space-y-3 transition-colors ${
                activeQuestionId === q.id ? "border-teal rng-2 ring-teal/20" : "border-border"
              }`}
            >
              <Label className="font-medium leading-snug">
                {q.title}
                {q.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              <QuestionInput question={q} value={answers[q.id]} onChange={v => {
                setActiveQuestionId(q.id);
                setAnswer(q.id, v);
              }} />
            </motion.div>
          ))}

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="teal" size="lg" disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Response
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const QuestionInput = ({ question, value, onChange }: { question: QuestionData; value: any; onChange: (v: any) => void }) => {
  const { answer_type, options } = question;

  if (answer_type === "paragraph") {
    return <Textarea placeholder="Your answer..." value={value || ""} onChange={e => onChange(e.target.value)} rows={4} />;
  }

  if (answer_type === "mcq") {
    return (
      <RadioGroup value={String(value || "")} onValueChange={v => onChange(Number(v))}>
        {options.map(opt => (
          <div key={opt.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <RadioGroupItem value={String(opt.id)} id={`opt-${opt.id}`} />
            <Label htmlFor={`opt-${opt.id}`} className="text-sm cursor-pointer flex-1">{opt.text}</Label>
          </div>
        ))}
      </RadioGroup>
    );
  }

  if (answer_type === "checkbox") {
    const selected: number[] = value || [];
    return (
      <div className="space-y-1">
        {options.map(opt => (
          <div key={opt.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <Checkbox
              id={`opt-${opt.id}`}
              checked={selected.includes(opt.id)}
              onCheckedChange={checked => {
                onChange(checked ? [...selected, opt.id] : selected.filter((x: number) => x !== opt.id));
              }}
            />
            <Label htmlFor={`opt-${opt.id}`} className="text-sm cursor-pointer flex-1">{opt.text}</Label>
          </div>
        ))}
      </div>
    );
  }

  if (answer_type === "dropdown") {
    return (
      <Select value={String(value || "")} onValueChange={v => onChange(Number(v))}>
        <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
        <SelectContent>
          {options.map(opt => (
            <SelectItem key={opt.id} value={String(opt.id)}>{opt.text}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (answer_type === "linear") {
    const scale = [1, 2, 3, 4, 5, 6, 7];
    return (
      <div className="flex items-center justify-between gap-1 pt-1">
        {scale.map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
              value === n
                ? "gradient-teal text-accent-foreground shadow-glow"
                : "bg-muted hover:bg-muted-foreground/10"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    );
  }

  if (answer_type === "date") {
    return <Input type="date" value={value || ""} onChange={e => onChange(e.target.value)} />;
  }

  if (answer_type === "time") {
    return <Input type="time" value={value || ""} onChange={e => onChange(e.target.value)} />;
  }

  if (answer_type === "file") {
    return <Input type="file" onChange={e => onChange(e.target.files?.[0])} />;
  }

  return null;
};

export default FormFill;
