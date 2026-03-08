import { motion } from "framer-motion";

const steps = [
  { number: "01", title: "Design Your Instrument", description: "Use the drag-and-drop builder to create questions with scoring, constructs, and validation rules." },
  { number: "02", title: "Distribute to Participants", description: "Share a clean, accessible link. Participants see a focused, distraction-free form." },
  { number: "03", title: "Analyze Results", description: "View construct-level scores, individual responses, and export data — all automatically computed." },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/50">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-teal tracking-wide uppercase">How It Works</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3">Three steps to insight</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="font-display text-5xl font-bold text-teal/20 mb-4">{step.number}</div>
              <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
