import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { dashboardApi, type TemplateData } from "@/lib/api";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (template: TemplateData) => void;
}

export default function TemplateModal({ isOpen, onClose, onImport }: TemplateModalProps) {
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      dashboardApi.getTemplates()
        .then(setTemplates)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = Array.from(new Set(templates.map(t => t.category)));
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-card rounded-2xl shadow-card border border-border w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal" />
                Psychology Test Templates
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Browse pre-built scales to import into your form.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-hidden flex min-h-[400px]">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              </div>
            ) : (
              <>
                {/* Sidebar list */}
                <div className="w-1/3 border-r border-border bg-muted/20">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-6">
                      {categories.map(cat => {
                        const catTemplates = templates.filter(t => t.category === cat);
                        return (
                          <div key={cat} className="space-y-2">
                            <h3 className="font-semibold text-sm text-foreground/80 pl-2">{cat}</h3>
                            <div className="space-y-1">
                              {catTemplates.map(t => (
                                <button
                                  key={t.id}
                                  onClick={() => setSelectedTemplateId(t.id)}
                                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                                    selectedTemplateId === t.id
                                      ? "bg-teal/10 text-teal font-medium"
                                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  {t.name}
                                  <span className="block text-xs opacity-60 mt-0.5">{t.question_count} questions</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>

                {/* Main preview */}
                <div className="w-2/3 bg-background relative flex flex-col">
                  {selectedTemplate ? (
                    <>
                      <div className="p-6 border-b border-border">
                        <h3 className="text-lg font-bold">{selectedTemplate.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-medium text-teal bg-teal/10 px-2 py-0.5 rounded">
                            {selectedTemplate.category}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {selectedTemplate.question_count} items
                          </span>
                        </div>
                      </div>
                      <ScrollArea className="flex-1 p-6">
                        <div className="space-y-4 pb-20">
                          {selectedTemplate.questions.map((q, i) => (
                            <div key={i} className="flex gap-3 text-sm p-3 rounded-lg border border-border/50 bg-muted/10">
                              <span className="font-medium text-muted-foreground shrink-0">{i + 1}.</span>
                              <div className="space-y-1">
                                <p>{q.title}</p>
                                <p className="text-xs text-muted-foreground capitalize">{q.answer_type}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card/80 backdrop-blur-md flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button variant="teal" onClick={() => onImport(selectedTemplate)}>
                          Import {selectedTemplate.question_count} Questions
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                      <BookOpen className="w-12 h-12 opacity-20 mb-4" />
                      <p>Select a template to preview questions</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
