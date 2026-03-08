import { motion } from "framer-motion";
import { BarChart3, Brain, FileCheck, Layers, Lock, Wand2 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Construct Scoring",
    description: "Assign constructs to questions and get automated averages across psychological dimensions like Anxiety, Resilience, and more."
  },
  {
    icon: Wand2,
    title: "Reverse-Coded Items",
    description: "Mark items as reverse-scored and let NeuroForms handle the math — no manual recoding needed."
  },
  {
    icon: Layers,
    title: "Rich Question Types",
    description: "Paragraphs, MCQs, checkboxes, dropdowns, Likert scales, date/time pickers, and file uploads — all in one builder."
  },
  {
    icon: BarChart3,
    title: "Instant Analytics",
    description: "View construct-level averages, response counts, and distributions the moment participants submit."
  },
  {
    icon: Lock,
    title: "Anonymous Responses",
    description: "Toggle anonymity and email collection per form to meet IRB and ethical requirements."
  },
  {
    icon: FileCheck,
    title: "Validation Engine",
    description: "Built-in type checking, required-field enforcement, and range validation for every answer type."
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-teal tracking-wide uppercase">Features</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3 mb-4">
            Everything researchers need
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Purpose-built tools for psychological measurement — not adapted from generic survey platforms.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group gradient-card rounded-xl border border-border p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-lg bg-teal/10 flex items-center justify-center mb-4 group-hover:bg-teal/20 transition-colors">
                <feature.icon className="w-5 h-5 text-teal" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
