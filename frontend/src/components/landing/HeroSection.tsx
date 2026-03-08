import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative gradient-hero min-h-screen flex items-center overflow-hidden">
      {/* Abstract grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(174 62% 42%) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      {/* Glow orb */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-teal/5 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal/30 bg-teal/10 mb-6">
              <Zap className="w-3.5 h-3.5 text-teal" />
              <span className="text-xs font-medium text-teal">Purpose-built for psychological research</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-[1.1] mb-6">
              Surveys designed for the{" "}
              <span className="text-gradient">science of mind</span>
            </h1>

            <p className="text-lg text-primary-foreground/60 max-w-lg mb-8 leading-relaxed">
              Build psychometric instruments with construct scoring, reverse-coded items, and automated analytics — all in a beautiful, participant-friendly interface.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Button variant="hero" size="lg" asChild>
                <Link to="/signup">
                  Start Building Free
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/login">Login </Link>
              </Button>
            </div>

            <div className="flex items-center gap-6 text-sm text-primary-foreground/40">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal/60" />
                <span>E2E Encrytpion</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal/60" />
                <span>Auto Scoring</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="hidden lg:block"
          >
            {/* Mock survey card */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-teal/5 blur-xl" />
              <div className="relative bg-card/10 backdrop-blur-sm border border-primary-foreground/10 rounded-2xl p-8 space-y-6">
                <div className="space-y-2">
                  <div className="h-3 w-48 rounded bg-primary-foreground/20" />
                  <div className="h-2 w-72 rounded bg-primary-foreground/10" />
                </div>

                {/* Mock question */}
                <div className="bg-primary-foreground/5 rounded-xl p-5 space-y-3 border border-primary-foreground/5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 rounded-full bg-teal" />
                    <div className="h-2.5 w-56 rounded bg-primary-foreground/20" />
                  </div>
                  <div className="space-y-2 pl-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${i === 3 ? 'border-teal bg-teal/30' : 'border-primary-foreground/20'}`} />
                        <div className="h-2 rounded bg-primary-foreground/15" style={{ width: `${80 + Math.random() * 60}px` }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mock linear scale */}
                <div className="bg-primary-foreground/5 rounded-xl p-5 space-y-3 border border-primary-foreground/5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 rounded-full bg-warning" />
                    <div className="h-2.5 w-44 rounded bg-primary-foreground/20" />
                  </div>
                  <div className="flex items-center justify-between px-4 pt-2">
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                      <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${i === 5 ? 'bg-teal text-accent-foreground' : 'bg-primary-foreground/10 text-primary-foreground/40'}`}>
                        {i}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="h-9 w-24 rounded-lg gradient-teal opacity-60" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
