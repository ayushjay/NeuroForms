import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-deep/80 backdrop-blur-xl border-b border-navy-light/30">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg gradient-teal flex items-center justify-center">
            <Brain className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-primary-foreground">NeuroForms</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">How It Works</a>
          <a href="#pricing" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Pricing</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-navy-light/50" asChild>
            <Link to="/login">Log In</Link>
          </Button>
          <Button variant="teal" size="sm" asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-primary-foreground">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-navy-deep border-b border-navy-light/30"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              <a href="#features" className="text-sm text-primary-foreground/70">Features</a>
              <a href="#how-it-works" className="text-sm text-primary-foreground/70">How It Works</a>
              <a href="#pricing" className="text-sm text-primary-foreground/70">Pricing</a>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="text-primary-foreground/80 hover:bg-navy-light/50" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
                <Button variant="teal" size="sm" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
